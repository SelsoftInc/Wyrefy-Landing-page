"use client";

import dynamic from "next/dynamic";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, Code2, Folder, Maximize2, PanelLeftClose, PanelLeftOpen, RefreshCw } from "lucide-react";
import { useMemo, useState } from "react";

import { workspaceFileContent, workspaceFiles } from "@/src/features/runtime/api";
import type { WorkspaceFileEntry } from "@/src/features/runtime/types";
import { TreeRow } from "./sandbox-workspace-tree";
import { useWorkspaceWatch } from "./use-workspace-watch";
import { buildWorkspaceTree, detectLanguage } from "./workspace-utils";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center text-[11px] font-medium text-[var(--muted)]">
      Loading editor...
    </div>
  ),
});

type SandboxWorkspaceBrowserProps = Readonly<{
  projectId: string;
  sandboxState: string;
}>;

const LIVE_STATES = new Set(["warm_ready", "interactive", "background_running"]);
const EMPTY_ENTRIES: WorkspaceFileEntry[] = [];

function formatByteCount(value: number | null | undefined): string | null {
  if (value == null || Number.isNaN(value)) {
    return null;
  }
  if (value < 1024) {
    return `${value} B`;
  }
  const units = ["KB", "MB", "GB"];
  let current = value / 1024;
  let unitIndex = 0;
  while (current >= 1024 && unitIndex < units.length - 1) {
    current /= 1024;
    unitIndex += 1;
  }
  return `${current.toFixed(current >= 10 ? 0 : 1)} ${units[unitIndex]}`;
}

export function SandboxWorkspaceBrowser({ projectId, sandboxState }: SandboxWorkspaceBrowserProps) {
  const queryClient = useQueryClient();
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [paneMode, setPaneMode] = useState<"split" | "tree" | "editor">("split");
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(() => new Set());
  const isLive = useMemo(() => LIVE_STATES.has(sandboxState), [sandboxState]);

  const filesQuery = useQuery({
    queryKey: ["workspace-files", projectId],
    queryFn: () => workspaceFiles(projectId),
    refetchInterval: isLive ? 15000 : false,
  });

  const fileEntries = filesQuery.data?.entries ?? EMPTY_ENTRIES;
  const tree = useMemo(() => buildWorkspaceTree(fileEntries), [fileEntries]);
  const firstFilePath = fileEntries.find((entry) => entry.kind === "file")?.path ?? null;
  const resolvedSelectedPath = useMemo(() => {
    if (!filesQuery.data?.available) return null;
    if (selectedPath && fileEntries.some((entry) => entry.path === selectedPath)) return selectedPath;
    return firstFilePath;
  }, [fileEntries, filesQuery.data?.available, firstFilePath, selectedPath]);

  const contentQuery = useQuery({
    queryKey: ["workspace-file-content", projectId, resolvedSelectedPath],
    queryFn: () => workspaceFileContent(projectId, resolvedSelectedPath ?? ""),
    enabled: Boolean(resolvedSelectedPath && filesQuery.data?.available),
  });

  useWorkspaceWatch({
    enabled: Boolean(isLive && filesQuery.data?.available),
    projectId,
    selectedPath: resolvedSelectedPath,
    queryClient,
    watchUrl: filesQuery.data?.watch_url,
  });

  const refresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ["workspace-files", projectId] });
    if (resolvedSelectedPath) {
      await queryClient.invalidateQueries({ queryKey: ["workspace-file-content", projectId, resolvedSelectedPath] });
    }
  };

  const fileCount = fileEntries.filter((entry) => entry.kind === "file").length;
  const editorLanguage = detectLanguage(resolvedSelectedPath);
  const visibleTree = paneMode !== "editor";
  const visibleEditor = paneMode !== "tree";
  const contentByteLimit = formatByteCount(contentQuery.data?.byte_limit);
  const contentSize = formatByteCount(contentQuery.data?.size_bytes);

  const toggleDirectory = (path: string) => {
    setExpandedPaths((current) => {
      const next = new Set(current);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  const treeUnavailable = filesQuery.data?.available !== true;
  const treeIsEmpty = filesQuery.data?.entries.length === 0;
  let treeContent = (
    <div className="space-y-1">
      {tree.map((node) => (
        <TreeRow
          key={node.path}
          node={node}
          selectedPath={resolvedSelectedPath}
          expandedPaths={expandedPaths}
          onToggleDirectory={toggleDirectory}
          onSelectFile={setSelectedPath}
        />
      ))}
    </div>
  );
  if (treeUnavailable) {
    treeContent = (
      <div className="flex h-full min-h-[14rem] items-center justify-center px-4 text-center text-[11px] font-medium text-[var(--muted)]">
        Resume the sandbox to inspect the workspace tree.
      </div>
    );
  } else if (treeIsEmpty) {
    treeContent = (
      <div className="flex h-full min-h-[14rem] items-center justify-center px-4 text-center text-[11px] font-medium text-[var(--muted)]">
        The workspace is currently empty.
      </div>
    );
  }

  let editorContent = (
    <MonacoEditor
      path={resolvedSelectedPath ?? undefined}
      language={editorLanguage}
      value={contentQuery.data?.content ?? "No content available."}
      theme="vs-dark"
      options={{
        readOnly: true,
        minimap: { enabled: false },
        wordWrap: "on",
        fontSize: 12,
        fontLigatures: true,
        scrollBeyondLastLine: false,
        automaticLayout: true,
        lineNumbersMinChars: 3,
        overviewRulerBorder: false,
        lineDecorationsWidth: 8,
        padding: { top: 16, bottom: 16 },
      }}
    />
  );
  if (resolvedSelectedPath === null) {
    editorContent = (
      <div className="flex h-full items-center justify-center text-center text-[11px] font-medium text-[var(--muted)]">
        Select a file to inspect its current contents.
      </div>
    );
  } else if (contentQuery.isError) {
    editorContent = (
      <div className="m-4 whitespace-pre-wrap rounded-2xl border border-red-500/20 bg-red-500/5 p-4 text-[11px] font-medium text-red-200">
        Unable to load the file content.
      </div>
    );
  }

  return (
    <section className="glass-panel flex h-full min-h-0 flex-col overflow-hidden rounded-[1.75rem] border border-white/5 bg-white/[0.02] shadow-2xl">
      <div className="flex items-start justify-between gap-3 border-b border-white/5 px-5 py-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
              <Folder size={18} />
            </div>
            <div>
              <h3 className="text-sm font-semibold tracking-tight text-[var(--foreground)]">Workspace Files</h3>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--muted)]">
                {filesQuery.data?.workspace_root ?? "/workspace"}
              </p>
            </div>
          </div>
          <p className="mt-3 text-[11px] font-medium text-[var(--muted)]">
            {filesQuery.data?.message ?? "Project files from the live sandbox appear here."}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <div className="hidden rounded-xl border border-white/10 bg-white/5 p-1 sm:flex">
            <button
              type="button"
              onClick={() => setPaneMode("split")}
              className={`flex size-8 items-center justify-center rounded-lg transition ${paneMode === "split" ? "bg-blue-600 text-white" : "text-[var(--muted)] hover:text-blue-300"}`}
              title="Split view"
            >
              <PanelLeftOpen size={14} />
            </button>
            <button
              type="button"
              onClick={() => setPaneMode("tree")}
              className={`flex size-8 items-center justify-center rounded-lg transition ${paneMode === "tree" ? "bg-blue-600 text-white" : "text-[var(--muted)] hover:text-blue-300"}`}
              title="File tree only"
            >
              <PanelLeftClose size={14} />
            </button>
            <button
              type="button"
              onClick={() => setPaneMode("editor")}
              className={`flex size-8 items-center justify-center rounded-lg transition ${paneMode === "editor" ? "bg-blue-600 text-white" : "text-[var(--muted)] hover:text-blue-300"}`}
              title="Editor only"
            >
              <Maximize2 size={14} />
            </button>
          </div>
          <button
            onClick={() => void refresh()}
            className="flex h-9 shrink-0 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--muted)] transition hover:text-blue-400"
          >
            {filesQuery.isFetching || contentQuery.isFetching ? <RefreshCw size={14} className="animate-spin" /> : <RefreshCw size={14} />}
            Refresh
          </button>
        </div>
      </div>

      <div className="border-b border-white/5 px-5 py-3">
        <div className="flex items-center justify-between gap-3">
          <span className={`text-[10px] font-bold uppercase tracking-[0.2em] ${isLive ? "text-emerald-400" : "text-amber-400"}`}>
            {sandboxState}
          </span>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--muted)]">{fileCount} files</span>
        </div>
        <p className="mt-2 truncate text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--muted)]">
          Version {filesQuery.data?.change_version?.slice(0, 12) ?? "waiting"}
        </p>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden p-2">
        <div
          className={`grid h-full min-h-0 gap-3 ${
            paneMode === "split" ? "lg:grid-cols-[300px_minmax(0,1fr)]" : "grid-cols-1"
          }`}
        >
          {visibleTree && (
            <div data-lenis-prevent="true" className="custom-scrollbar min-h-0 overflow-auto rounded-2xl border border-white/5 bg-black/10 p-2">
              {treeContent}
            </div>
          )}

          {visibleEditor && (
            <div className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-white/5 bg-black/20">
              <div className="flex items-start justify-between gap-3 border-b border-white/5 px-4 py-3">
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--muted)]">Monaco Editor</p>
                  <h4 className="mt-1 truncate text-sm font-semibold text-[var(--foreground)]">
                    {resolvedSelectedPath ?? "No file selected"}
                  </h4>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--muted)]">
                  <Code2 size={13} />
                  <span>{editorLanguage}</span>
                  <span>{contentQuery.data?.line_limit ?? 300} lines</span>
                  {contentSize ? <span>{contentSize}</span> : null}
                </div>
              </div>
              {contentQuery.data?.truncated ? (
                <div className="border-b border-amber-500/20 bg-amber-500/10 px-4 py-3 text-[11px] font-medium text-amber-100">
                  <div className="flex items-start gap-2">
                    <AlertTriangle size={14} className="mt-0.5 shrink-0 text-amber-300" />
                    <div>
                      <p>Showing a bounded preview of a large file.</p>
                      <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-amber-200/80">
                        {contentByteLimit ? `Byte cap ${contentByteLimit}` : "Byte cap active"}
                        {contentSize ? ` • File size ${contentSize}` : ""}
                      </p>
                    </div>
                  </div>
                </div>
              ) : null}
              <div className="min-h-0 flex-1">{editorContent}</div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

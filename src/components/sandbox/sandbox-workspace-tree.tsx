"use client";

import { ChevronRight, FileText, Folder } from "lucide-react";
import { formatSize } from "./workspace-utils";
import type { WorkspaceTreeNode } from "./workspace-utils";


export function TreeRow({
  node,
  selectedPath,
  expandedPaths,
  onToggleDirectory,
  onSelectFile,
  depth = 0,
}: Readonly<{
  node: WorkspaceTreeNode;
  selectedPath: string | null;
  expandedPaths: Set<string>;
  onToggleDirectory: (path: string) => void;
  onSelectFile: (path: string) => void;
  depth?: number;
}>) {
  const isSelected = node.path === selectedPath;
  const isDirectory = node.kind === "directory";
  const isExpanded = expandedPaths.has(node.path);

  return (
    <div>
      <button
        onClick={() => (isDirectory ? onToggleDirectory(node.path) : onSelectFile(node.path))}
        className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left transition ${
          isSelected ? "bg-blue-500/10 text-blue-300" : "text-[var(--foreground)] hover:bg-white/5"
        } ${node.kind === "directory" ? "opacity-85" : ""}`}
        style={{ paddingLeft: `${12 + depth * 14}px` }}
      >
        {isDirectory ? (
          <Folder size={14} className="shrink-0 text-blue-400/80" />
        ) : (
          <FileText size={14} className="shrink-0 text-[var(--muted)]" />
        )}
        <div className="min-w-0 flex-1">
          <div className="truncate text-[11px] font-medium">{node.name}</div>
          <div className="truncate text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--muted)]">
            {node.path}
          </div>
        </div>
        {!isDirectory && node.size_bytes != null && (
          <span className="shrink-0 text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--muted)]">
            {formatSize(node.size_bytes)}
          </span>
        )}
        <ChevronRight
          size={12}
          className={`shrink-0 text-[var(--muted)]/60 transition-transform ${isDirectory && isExpanded ? "rotate-90" : ""}`}
        />
      </button>
      {isDirectory && isExpanded && node.children.length > 0 && (
        <div className="mt-1 space-y-1">
          {node.children.map((child) => (
            <TreeRow
              key={child.path}
              node={child}
              selectedPath={selectedPath}
              expandedPaths={expandedPaths}
              onToggleDirectory={onToggleDirectory}
              onSelectFile={onSelectFile}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

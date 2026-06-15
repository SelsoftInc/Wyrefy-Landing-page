"use client";

import { ArrowLeft, Download, Eye, Loader2, Mail, Moon, Terminal } from "lucide-react";

type ProjectAgentHeaderProps = Readonly<{
  projectName: string;
  projectStatus: string;
  activePanel: "chat" | "files";
  sandboxState: string;
  isLive: boolean;
  previewAvailable: boolean;
  canSleep: boolean;
  resumePending: boolean;
  hibernatePending: boolean;
  downloadPending: boolean;
  completionEmailRequested: boolean;
  onBack: () => void;
  onPanelChange: (panel: "chat" | "files") => void;
  onPreview: () => void;
  onHibernate: () => void;
  onResume: () => void;
  onDownload: () => void;
  onToggleCompletionEmailRequested: () => void;
}>;

export function ProjectAgentHeader({
  projectName,
  projectStatus,
  activePanel,
  sandboxState,
  isLive,
  previewAvailable,
  canSleep,
  resumePending,
  hibernatePending,
  downloadPending,
  completionEmailRequested,
  onBack,
  onPanelChange,
  onPreview,
  onHibernate,
  onResume,
  onDownload,
  onToggleCompletionEmailRequested,
}: ProjectAgentHeaderProps) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border)] bg-transparent px-2 py-1.5 sm:px-4">
      <div className="flex items-center gap-2">
        <button type="button" onClick={onBack} className="flex size-7 items-center justify-center rounded-md border border-white/10 bg-white/[0.04] text-[var(--foreground)] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition hover:border-blue-400/20 hover:bg-blue-500/[0.08]">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-sm font-bold tracking-tight text-[var(--foreground)] leading-none">{projectName}</h2>
          <div className="mt-0.5 flex items-center gap-1.5">
            <p className="text-[9px] font-black uppercase tracking-[0.1em] text-[var(--muted)] opacity-60">Status</p>
            <span className="size-0.5 rounded-full bg-blue-500/40" />
            <span className="text-[9px] font-bold uppercase tracking-[0.1em] text-blue-500/70">{projectStatus}</span>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-end gap-1.5">
        <div className="flex h-7 items-center rounded-md border border-white/8 bg-white/[0.03] p-0.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
          {(["chat", "files"] as const).map((panel) => (
            <button
              type="button"
              key={panel}
              onClick={() => onPanelChange(panel)}
              className={`h-5 rounded px-2 text-[8px] font-medium uppercase tracking-[0.15em] transition-all duration-200 ${
                activePanel === panel ? "bg-blue-600 text-white shadow-md shadow-blue-500/20" : "text-[var(--muted)] hover:text-blue-300"
              }`}
            >
              {panel}
            </button>
          ))}
        </div>
        <div className={`flex h-7 items-center gap-1.5 rounded-md border px-2 shadow-sm transition-all duration-300 ${isLive ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-400" : "border-amber-500/20 bg-amber-500/5 text-amber-400"}`}>
          <div className={`h-1.5 w-1.5 rounded-full ${isLive ? "bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.6)]" : "bg-amber-400 animate-pulse shadow-[0_0_8px_rgba(251,191,36,0.6)]"}`} />
          <span className="text-[9px] font-bold uppercase tracking-[0.15em]">{sandboxState.replace("_", " ")}</span>
        </div>
        <button
          type="button"
          onClick={onPreview}
          disabled={!previewAvailable || resumePending}
          className="flex h-7 items-center gap-1.5 rounded-md border border-blue-400/20 bg-blue-600 px-2 text-[8px] font-black uppercase tracking-[0.15em] text-white shadow-[0_8px_20px_rgba(37,99,235,0.18)] transition-all hover:bg-blue-500 hover:-translate-y-0.5 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
        >
          {resumePending ? <Loader2 size={13} className="animate-spin" /> : <Eye size={13} />}
          {previewAvailable ? "Preview" : "Waiting"}
        </button>
        {isLive || canSleep ? (
          <button
            type="button"
            onClick={onHibernate}
            disabled={hibernatePending || !canSleep}
            className="flex h-7 items-center gap-1.5 rounded-md border border-white/8 bg-white/[0.03] px-2 text-[8px] font-medium uppercase tracking-[0.15em] text-slate-200 transition-all hover:border-blue-500/20 hover:bg-blue-500/5 hover:text-blue-300 disabled:opacity-40"
          >
            {hibernatePending ? <Loader2 size={13} className="animate-spin" /> : <Moon size={13} />}
            Sleep
          </button>
        ) : (
          <button
            type="button"
            onClick={onResume}
            disabled={resumePending}
            className="flex h-7 items-center gap-1.5 rounded-md border border-blue-500/20 bg-blue-500/10 px-2 text-[8px] font-medium uppercase tracking-[0.15em] text-blue-300 transition-all hover:bg-blue-500/20 disabled:opacity-40"
          >
            {resumePending ? <Loader2 size={13} className="animate-spin" /> : <Terminal size={13} />}
            Wake
          </button>
        )}
        <button
          type="button"
          onClick={onToggleCompletionEmailRequested}
          aria-pressed={completionEmailRequested}
          title={completionEmailRequested ? "Disable completion email" : "Enable completion email"}
          className={`flex h-7 items-center gap-1.5 rounded-md border px-2 text-[8px] font-black uppercase tracking-[0.15em] transition-all ${completionEmailRequested ? "border-blue-400/25 bg-blue-500/12 text-blue-200" : "border-white/8 bg-white/[0.03] text-slate-300 hover:border-blue-400/20 hover:text-white"}`}
        >
          <Mail size={13} />
          {completionEmailRequested ? "Email on" : "Email off"}
        </button>
        <button
          type="button"
          onClick={onDownload}
          disabled={downloadPending}
          className="flex size-7 items-center justify-center rounded-md border border-white/8 bg-white/[0.03] text-slate-300 transition-all hover:border-white/15 hover:text-white disabled:opacity-40"
          title="Download workspace"
        >
          {downloadPending ? <Loader2 size={13} className="animate-spin" /> : <Download size={15} />}
        </button>
      </div>
    </header>
  );
}

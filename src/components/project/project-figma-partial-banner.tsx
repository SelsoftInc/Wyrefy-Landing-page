"use client";

type ProjectFigmaPartialBannerProps = Readonly<{
  retrying: boolean;
  onContinue: () => void;
  onRetry: () => void;
}>;

export function ProjectFigmaPartialBanner({ retrying, onContinue, onRetry }: ProjectFigmaPartialBannerProps) {
  return (
    <div className="border-b border-blue-400/10 bg-blue-500/5 px-4 py-3 sm:px-6">
      <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-3 rounded-2xl border border-blue-400/15 bg-slate-950/70 px-4 py-3 text-sm text-blue-50 shadow-lg shadow-blue-950/20">
        <span>Figma parsed context is ready, but some assets are rate-limited. You can continue implementation now or retry asset download later.</span>
        <div className="flex items-center gap-2">
          <button type="button" onClick={onContinue} className="rounded-xl border border-white/10 px-3 py-1.5 text-xs font-medium text-blue-100 transition hover:bg-white/8">Continue now</button>
          <button type="button" onClick={onRetry} disabled={retrying} className="rounded-xl border border-blue-400/20 bg-blue-600 px-3 py-1.5 text-xs font-medium uppercase tracking-[0.12em] text-white transition hover:bg-blue-500 disabled:opacity-50">{retrying ? "Retrying" : "Retry assets"}</button>
        </div>
      </div>
    </div>
  );
}

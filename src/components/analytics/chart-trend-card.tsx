"use client";

import { useEffect, useState } from "react";

type MultiPoint = {
  label: string;
  primary: number;
  secondary?: number;
  tertiary?: number;
};

export function EmptyAnalyticsState() {
  return (
    <div className="flex h-full min-h-[300px] flex-col items-center justify-center rounded-[2rem] border-2 border-dashed border-[var(--border)] bg-[var(--surface)]/30 p-12 text-center">
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--muted)]">Telemetry unavailable</p>
      <p className="mt-2 text-sm font-medium text-[var(--muted)]/60">No data points were found for the selected time range.</p>
    </div>
  );
}

function toneClass(tone: "primary" | "secondary" | "tertiary") {
  if (tone === "primary") return "bg-[var(--accent)]";
  if (tone === "secondary") return "bg-sky-300";
  return "bg-cyan-400";
}

export function TrendChartCard({
  title,
  points,
  legend,
}: Readonly<{
  title: string;
  points: MultiPoint[];
  legend: { label: string; tone: "primary" | "secondary" | "tertiary" }[];
}>) {
  const [mounted, setMounted] = useState(false);
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="glass-card flex h-full flex-col rounded-[2rem] p-6 transition-all hover:shadow-xl hover:shadow-[var(--accent)]/5">
      <div className="flex flex-wrap items-center justify-between gap-4 shrink-0 mb-6">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-[var(--foreground)]">{title}</h2>
          <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1">
            {legend.map((item) => (
              <div key={item.label} className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-[var(--muted)]">
                <span className={`h-1.5 w-1.5 rounded-full ${toneClass(item.tone)}`} />
                {item.label}
              </div>
            ))}
          </div>
        </div>
      </div>
      {points.length ? (
        <div className="flex flex-1 flex-col gap-6 overflow-hidden">
          <div className="relative shrink-0 rounded-[1.5rem] border border-[var(--border)] bg-[var(--surface)]/30 px-6 pt-6 pb-12 backdrop-blur-sm shadow-inner min-h-[12rem] flex flex-col justify-end">
            <div className="flex h-36 w-full items-end justify-between gap-1 sm:gap-2 relative">
              {(() => {
                const maxPrimary = Math.max(...points.map(p => p.primary), 1);
                return points.map((point, index) => {
                  const heightPct = Math.max((point.primary / maxPrimary) * 100, 5);
                  const isHovered = activeIdx === index;
                  const isActive = activeIdx === null ? index === points.length - 1 : isHovered;

                  return (
                  <button
                    key={point.label}
                    type="button"
                    className="relative flex h-full flex-1 flex-col items-center justify-end group bg-transparent p-0 text-left"
                    onFocus={() => setActiveIdx(index)}
                    onBlur={() => setActiveIdx(null)}
                    onMouseEnter={() => setActiveIdx(index)}
                    onMouseLeave={() => setActiveIdx(null)}
                  >
                    {/* Floating Tooltip */}
                    {isHovered && (
                      <div className="absolute -top-16 z-20 flex flex-col items-center animate-in fade-in zoom-in-95 pointer-events-none">
                        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-center shadow-2xl backdrop-blur-md min-w-[70px]">
                           <p className="text-[8px] font-medium uppercase tracking-widest text-[var(--accent)] mb-0.5">{legend[0].label}</p>
                           <p className="text-sm font-medium text-[var(--foreground)]">{point.primary}</p>
                        </div>
                      </div>
                    )}

                    {/* Glowing Bar */}
                    <div
                      className={`w-full max-w-[2.5rem] rounded-t-xl transition-all duration-1000 ease-[cubic-bezier(0.2,0.8,0.2,1)] bg-gradient-to-t from-blue-700 via-blue-500 to-cyan-400 ${
                        isActive ? "opacity-100 shadow-[0_0_25px_rgba(56,189,248,0.4)]" : "opacity-30 group-hover:opacity-70"
                      }`}
                      style={{
                        height: mounted ? `${heightPct}%` : '0%',
                        transformOrigin: "bottom"
                      }}
                    />

                    {/* X-axis Month/Label */}
                    <span className={`absolute -bottom-8 text-[9px] font-bold uppercase tracking-wider transition-colors ${isActive ? "text-[var(--foreground)]" : "text-[var(--muted)]"}`}>
                      {point.label.substring(0, 3)}
                    </span>
                  </button>
                );
              })})()}
            </div>
          </div>
          <div className="custom-scrollbar scroll-fade flex-1 overflow-y-auto pr-1.5 space-y-2">
            {points.map((point, index) => (
              <button
                key={point.label}
                type="button"
                onFocus={() => setActiveIdx(index)}
                onBlur={() => setActiveIdx(null)}
                onMouseEnter={() => setActiveIdx(index)}
                onMouseLeave={() => setActiveIdx(null)}
                className={`flex w-full items-center justify-between gap-4 rounded-xl border px-4 py-2.5 text-left transition-all duration-300 ${
                  activeIdx === index
                    ? "border-[var(--accent)] bg-[var(--accent)]/5 scale-[1.01]"
                    : "border-[var(--border)] bg-[var(--surface)]/20 hover:border-[var(--accent)]/30"
                }`}
              >
                <span className="text-[11px] font-medium text-[var(--foreground)]">{point.label}</span>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-medium text-[var(--accent)]">
                    {point.primary}
                  </span>
                  {point.secondary !== undefined && (
                    <span className="text-[10px] font-medium text-[var(--muted)] opacity-60">
                      {point.secondary}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-6 flex-1">
          <EmptyAnalyticsState />
        </div>
      )}
    </section>
  );
}

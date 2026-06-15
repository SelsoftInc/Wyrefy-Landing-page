"use client";

import { useEffect, useState } from "react";

type ChartPoint = {
  label: string;
  value: number;
  meta?: string;
};

const COLORS = ["var(--accent)", "#7dd3fc", "#38bdf8", "#0ea5e9", "#0284c7", "#0369a1", "#0244c7", "#4ade80", "#fb7185", "#facc15"];

export function RadialBarCard({ title, rows, suffix = "" }: Readonly<{ title: string; rows: ChartPoint[]; suffix?: string }>) {
  const [mounted, setMounted] = useState(false);
  const [hovered, setHovered] = useState<number | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const max = Math.max(...rows.map((r) => r.value), 1);

  return (
    <section className="glass-card flex h-full flex-col rounded-[2rem] p-6 transition-all hover:shadow-xl hover:shadow-[var(--accent)]/5">
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      <div className="mt-8 flex flex-1 flex-col items-center justify-center gap-6">
        <div className="relative size-44 shrink-0">
          <svg viewBox="0 0 32 32" className="h-full w-full -rotate-90 overflow-visible">
            {rows.slice(0, 4).map((row, i) => {
              const radius = 14 - i * 3.5;
              const circumference = 2 * Math.PI * radius;
              const percent = (row.value / max) * 100;
              const dash = (percent / 100) * circumference;
              return (
                <g key={row.label} role="button" tabIndex={0} onFocus={() => setHovered(i)} onBlur={() => setHovered(null)} onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)} className="cursor-pointer">
                  <circle r={radius} cx="16" cy="16" fill="transparent" stroke="var(--border)" strokeWidth="3" className="opacity-20" />
                  <circle
                    r={radius}
                    cx="16"
                    cy="16"
                    fill="transparent"
                    stroke={COLORS[i % COLORS.length]}
                    strokeWidth={hovered === i ? "4" : "3"}
                    strokeDasharray={`${circumference} ${circumference}`}
                    strokeDashoffset={circumference - (mounted ? dash : 0)}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
                    style={{ transitionDelay: `${i * 150}ms` }}
                  />
                </g>
              );
            })}
          </svg>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
            {hovered !== null && (
              <div className="animate-in fade-in zoom-in-95 duration-200">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--accent)]">Rank {hovered + 1}</p>
                <p className="text-xl font-semibold">{rows[hovered].value}{suffix}</p>
              </div>
            )}
          </div>
        </div>
        <div className="custom-scrollbar scroll-fade max-h-48 w-full overflow-y-auto pr-2 space-y-3">
          {rows.map((row, i) => (
            <button
              key={row.label}
              type="button"
              onFocus={() => setHovered(i)}
              onBlur={() => setHovered(null)}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              className={`group w-full space-y-1 bg-transparent text-left transition-all duration-300 ${hovered === i ? "translate-x-1" : ""}`}
            >
              <div className="flex items-center justify-between gap-3 text-[10px] font-bold uppercase tracking-widest">
                <div className="flex items-center gap-2 truncate">
                  <span className={`size-2 shrink-0 rounded-full transition-all ${hovered === i ? "scale-125 shadow-[0_0_8px_currentColor]" : ""}`} style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className={`truncate transition-colors ${hovered === i ? "text-[var(--foreground)]" : "text-[var(--muted)]"}`}>{row.label}</span>
                </div>
                <span className={`shrink-0 transition-colors ${hovered === i ? "text-[var(--accent)]" : "text-[var(--muted)]"}`}>{row.value}{suffix}</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--surface)] shadow-inner">
                <div
                  className="h-full rounded-full transition-all duration-1000 ease-out"
                  style={{
                    width: mounted ? `${(row.value / max) * 100}%` : "0%",
                    backgroundColor: COLORS[i % COLORS.length],
                    opacity: hovered === null || hovered === i ? 1 : 0.4
                  }}
                />
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

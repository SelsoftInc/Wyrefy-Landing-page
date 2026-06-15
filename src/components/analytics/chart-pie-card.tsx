"use client";

import { useEffect, useState } from "react";

type ChartPoint = {
  label: string;
  value: number;
  meta?: string;
};

const COLORS = ["var(--accent)", "#0ea5e9", "#6366f1", "#8b5cf6", "#d946ef", "#f43f5e", "#10b981", "#f59e0b", "#475569"];

export function PieChartCard({ title, rows, suffix = "" }: Readonly<{ title: string; rows: ChartPoint[]; suffix?: string }>) {
  const [mounted, setMounted] = useState(false);
  const [hovered, setHovered] = useState<number | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const total = rows.reduce((acc, row) => acc + row.value, 0) || 1;
  const segments = rows.reduce<Array<ChartPoint & { offset: number; percent: number }>>((acc, row) => {
    const previous = acc.at(-1);
    const offset = previous ? previous.offset + previous.percent : 0;
    const percent = (row.value / total) * 100;
    acc.push({ ...row, offset, percent });
    return acc;
  }, []);

  const hoveredRow = hovered === null ? null : rows[hovered];

  return (
    <section className="glass-card flex h-full flex-col rounded-[2rem] p-6 transition-all hover:shadow-xl hover:shadow-[var(--accent)]/5">
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      <div className="mt-8 flex flex-1 flex-col items-center justify-center gap-8">
        <div className="relative size-44 shrink-0">
          <svg viewBox="0 0 32 32" className="h-full w-full -rotate-90 overflow-visible">
            {segments.map((row, i) => (
              <circle
                key={row.label}
                r="16"
                cx="16"
                cy="16"
                fill="transparent"
                stroke={COLORS[i % COLORS.length]}
                strokeWidth={hovered === i ? "6" : "4"}
                strokeDasharray={`${mounted ? row.percent : 0} 100`}
                strokeDashoffset={-row.offset}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                className="cursor-pointer transition-all duration-500 ease-out"
              />
            ))}
          </svg>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
            {hoveredRow ? (
              <div className="animate-in fade-in zoom-in-95 duration-200">
                <p className="text-[9px] font-bold uppercase tracking-widest text-[var(--accent)] max-w-[100px] truncate">{hoveredRow.label}</p>
                <p className="text-xl font-semibold">{hoveredRow.value}{suffix}</p>
              </div>
            ) : (
              <div className="animate-in fade-in duration-300">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted)]">Total</p>
                <p className="text-2xl font-semibold">{total > 1000 ? `${(total/1000).toFixed(1)}k` : total}{suffix}</p>
              </div>
            )}
          </div>
        </div>
        <div className="custom-scrollbar scroll-fade max-h-48 w-full overflow-y-auto pr-2 space-y-2">
          {rows.map((row, i) => (
            <button
              key={row.label}
              type="button"
              onFocus={() => setHovered(i)}
              onBlur={() => setHovered(null)}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              className={`flex w-full items-center justify-between gap-3 text-left text-[10px] font-bold uppercase tracking-widest transition-all duration-300 ${hovered === i ? "scale-105 text-[var(--foreground)]" : "text-[var(--muted)]"}`}
            >
              <div className="flex items-center gap-2 truncate">
                <span className={`size-2 shrink-0 rounded-full transition-transform ${hovered === i ? "scale-125 shadow-[0_0_8px_currentColor]" : ""}`} style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                <span className="truncate">{row.label}</span>
              </div>
              <span className="shrink-0">{row.value}{suffix}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

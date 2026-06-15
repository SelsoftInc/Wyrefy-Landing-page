"use client";

import { useEffect, useMemo, useState } from "react";
import { BarChart3 } from "lucide-react";

import { EmptyAnalyticsState } from "@/src/components/analytics/analytics-visuals";
import { SelectField } from "@/src/components/ui/form-field";

type TrendCardOption = {
  value: string;
  label: string;
};

type TrendCardPoint = {
  bucket: string;
  primaryValue: number;
  primaryDisplay: string;
  secondaryDisplay: string;
};

type TrendCardTotal = {
  label: string;
  value: string;
};

export function AdminTrendChartCard({
  title,
  subtitle,
  options,
  points,
  primaryLegend,
  secondaryLegend,
  selectedValue,
  totals,
  onChange,
}: Readonly<{
  title: string;
  subtitle: string;
  options: TrendCardOption[];
  points: TrendCardPoint[];
  primaryLegend: string;
  secondaryLegend: string;
  selectedValue: string;
  totals: [TrendCardTotal, TrendCardTotal];
  onChange: (value: string) => void;
}>) {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);
  const chartPoints = useMemo(() => points.slice(-20), [points]);
  const chartIdPrefix = useMemo(() => title.replace(/\s+/g, '-').toLowerCase(), [title]);
  const maxPrimary = useMemo(() => Math.max(...chartPoints.map((point) => point.primaryValue), 1), [chartPoints]);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="glass-panel relative rounded-[2rem] p-1 shadow-xl">
      <div className="flex h-full flex-col rounded-[1.9rem] bg-[var(--card)] p-5 lg:p-6">
        <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-500/10 text-blue-500">
                <BarChart3 size={16} />
              </div>
              <h2 className="text-lg font-semibold tracking-tight text-[var(--foreground)]">{title}</h2>
            </div>
            <p className="max-w-xl text-sm font-medium leading-relaxed text-[var(--muted)]">{subtitle}</p>
            <div className="flex flex-wrap gap-4 text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--muted)]">
              <span className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-[var(--accent)]" />
                {primaryLegend}
              </span>
              <span className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-sky-300" />
                {secondaryLegend}
              </span>
            </div>
          </div>
          <div className="w-full max-w-56">
            <SelectField value={selectedValue} onChange={(event) => onChange(event.target.value)}>
              {options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </SelectField>
          </div>
        </div>

        <div className="mb-5 grid gap-3 sm:grid-cols-2">
          {totals.map((item) => (
            <div key={item.label} className="rounded-[1.5rem] border border-[var(--border)] bg-[var(--surface)]/35 px-4 py-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--muted)]">{item.label}</p>
              <p className="mt-2 text-xl font-semibold tracking-tight text-[var(--foreground)]">{item.value}</p>
            </div>
          ))}
        </div>

        {chartPoints.length > 0 ? (
          <div className="flex flex-1 flex-col gap-4">
            <div className="rounded-[1.75rem] border border-[var(--border)] bg-[var(--surface)]/25 px-1 pb-2 pt-2">
              <div className="custom-scrollbar overflow-x-auto px-3 pb-8 pt-24" data-lenis-prevent>
                <div className="flex h-32 items-end justify-between gap-3 min-w-max">
                  {chartPoints.map((point, index) => {
                    const height = Math.max((point.primaryValue / maxPrimary) * 100, 6);
                    const isActive = activeIdx === null ? index === chartPoints.length - 1 : activeIdx === index;
                    return (
                      <button
                        key={point.bucket}
                        id={`${chartIdPrefix}-bar-${point.bucket}`}
                        type="button"
                        className="group relative flex h-full flex-col items-center justify-end bg-transparent p-0 min-w-[36px]"
                        onFocus={() => setActiveIdx(index)}
                        onBlur={() => setActiveIdx(null)}
                        onMouseEnter={() => setActiveIdx(index)}
                        onMouseLeave={() => setActiveIdx(null)}
                      >
                        {activeIdx === index ? (
                          <div className="absolute -top-20 z-10 rounded-2xl border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-center shadow-2xl">
                            <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[var(--accent)]">{point.primaryDisplay}</p>
                            <p className="mt-1 text-[10px] font-medium text-[var(--muted)]">{point.secondaryDisplay}</p>
                          </div>
                        ) : null}
                        <div
                          className={`w-full max-w-10 rounded-t-[1rem] bg-gradient-to-t from-blue-700 via-blue-500 to-cyan-300 transition-all duration-1000 ease-[cubic-bezier(0.2,0.8,0.2,1)] ${
                            isActive ? "opacity-100 shadow-[0_0_28px_rgba(59,130,246,0.35)]" : "opacity-35 group-hover:opacity-70"
                          }`}
                          style={{ height: mounted ? `${height}%` : '0%', transformOrigin: 'bottom' }}
                        />
                        <span className={`absolute -bottom-7 whitespace-nowrap text-[10px] font-bold uppercase tracking-[0.18em] ${isActive ? "text-[var(--foreground)]" : "text-[var(--muted)]"}`}>
                          {point.bucket.slice(5)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="custom-scrollbar max-h-[20rem] space-y-2 overflow-y-auto pr-1" data-lenis-prevent>
              {chartPoints.map((point, index) => {
                const isActive = activeIdx === null ? index === chartPoints.length - 1 : activeIdx === index;
                return (
                  <button
                    key={point.bucket}
                    type="button"
                    className={`flex w-full items-center justify-between gap-4 rounded-[1.2rem] border px-4 py-3 text-left transition-all ${
                      isActive ? "border-blue-500/30 bg-blue-500/5" : "border-[var(--border)] bg-[var(--surface)]/25 hover:border-blue-500/20"
                    }`}
                    onClick={() => {
                      setActiveIdx(index);
                      document.getElementById(`${chartIdPrefix}-bar-${point.bucket}`)?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
                    }}
                    onFocus={() => setActiveIdx(index)}
                    onBlur={() => setActiveIdx(null)}
                    onMouseEnter={() => setActiveIdx(index)}
                    onMouseLeave={() => setActiveIdx(null)}
                  >
                    <div>
                      <p className="text-sm font-medium text-[var(--foreground)]">{point.bucket}</p>
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--muted)]">{secondaryLegend}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-[var(--accent)]">{point.primaryDisplay}</p>
                      <p className="text-[11px] font-medium text-[var(--muted)]">{point.secondaryDisplay}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="flex-1">
            <EmptyAnalyticsState />
          </div>
        )}
      </div>
    </section>
  );
}

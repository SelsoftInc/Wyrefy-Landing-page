"use client";

export function ViewToggle({
  value,
  onChange,
}: Readonly<{
  value: "graph" | "list";
  onChange: (value: "graph" | "list") => void;
}>) {
  return (
    <div className="inline-flex rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-1">
      {(["graph", "list"] as const).map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          className={`rounded-xl px-3 py-2 text-xs font-medium uppercase tracking-[0.18em] transition ${
            value === option ? "bg-[var(--accent)] text-white shadow-sm" : "text-[var(--muted)] hover:text-[var(--foreground)]"
          }`}
        >
          {option}
        </button>
      ))}
    </div>
  );
}

export { PieChartCard } from "@/src/components/analytics/chart-pie-card";
export { RadialBarCard } from "@/src/components/analytics/chart-radial-card";
export { TrendChartCard, EmptyAnalyticsState } from "@/src/components/analytics/chart-trend-card";
export { RankedListCard } from "@/src/components/analytics/chart-ranked-list";

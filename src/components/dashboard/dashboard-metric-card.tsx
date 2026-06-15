"use client";

import { LucideIcon } from "lucide-react";

type MetricCardProps = Readonly<{
  label: string;
  value: string;
  change: string;
  icon: LucideIcon;
  color: string;
  chartData: number[];
}>;

export function MetricCard({ label, value, change, icon: Icon, color, chartData }: MetricCardProps) {
  const chartPath = chartData.map((value, index) => `L${(index / (chartData.length - 1)) * 100},${40 - (value / 100) * 40}`).join(" ");

  return (
    <div className="glass-panel rounded-[2rem] p-8 relative overflow-hidden group hover:scale-[1.02] transition-all duration-500 shadow-xl">
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-6">
          <div className={`flex size-12 items-center justify-center rounded-2xl bg-[var(--foreground)]/5 ${color} group-hover:scale-110 group-hover:bg-blue-500 group-hover:text-white transition-all duration-500`}>
            <Icon size={24} />
          </div>
          {change && (
            <div className="px-3 py-1 rounded-full bg-[var(--foreground)]/5 border border-[var(--border)]">
              <span className={`text-[9px] font-bold uppercase tracking-[0.2em] ${color}`}>
                {change}
              </span>
            </div>
          )}
        </div>
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--muted)] mb-1">{label}</p>
        <h3 className="text-4xl font-semibold text-[var(--foreground)] tracking-tight leading-none">{value}</h3>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-16 opacity-[0.15] dark:opacity-10 group-hover:opacity-30 dark:group-hover:opacity-25 transition-all duration-700">
        <svg className="w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none">
          <path
            d={`M0,40 ${chartPath} V40 H0 Z`}
            fill="currentColor"
            className={color.replace("text-", "fill-")}
          />
        </svg>
      </div>
    </div>
  );
}

"use client";

import type { LucideIcon } from "lucide-react";

function SparklineWave({ points, colorClass }: Readonly<{ points: number[]; colorClass: string }>) {
  if (points.length === 0) return null;
  const max = Math.max(...points, 1);
  const min = Math.min(...points, 0);
  const range = max - min || 1;
  const width = 100;
  const height = 40;

  // Map points to SVG coordinates
  const coords = points.map((p, idx) => {
    const x = (idx / (points.length - 1)) * width;
    const y = height - ((p - min) / range) * (height - 8) - 4; // leave margin at top/bottom
    return { x, y };
  });

  const linePath = coords.map((c, i) => `${i === 0 ? "M" : "L"} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`).join(" ");
  const areaPath = `${linePath} L ${width} ${height} L 0 ${height} Z`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="absolute bottom-0 left-0 right-0 w-full h-12 pointer-events-none overflow-hidden"
      preserveAspectRatio="none"
    >
      {/* Dynamic Area Fill */}
      <path
        d={areaPath}
        fill="currentColor"
        className={`${colorClass}`}
        style={{ fillOpacity: 0.03 }}
      />
      {/* Dynamic Stroke Line */}
      <path
        d={linePath}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className={`${colorClass}`}
        style={{ strokeOpacity: 0.25 }}
      />
      {/* Secondary Layer for Visual Depth */}
      <path
        d={coords.map((c, i) => `${i === 0 ? "M" : "L"} ${c.x.toFixed(1)} ${(c.y + 2).toFixed(1)}`).join(" ") + ` L ${width} ${height} L 0 ${height} Z`}
        fill="currentColor"
        className={`${colorClass}`}
        style={{ fillOpacity: 0.015 }}
      />
    </svg>
  );
}

const getTheme = (label: string, sparklineColor: string) => {
  const normLabel = label.toLowerCase();

  if (normLabel.includes("revenue") || normLabel.includes("monthly")) {
    return {
      iconBg: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
      badge: "bg-blue-500/10 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border-blue-500/25",
      sparkline: "text-blue-500 dark:text-blue-400",
      status: "OPERATIONAL"
    };
  }
  if (normLabel.includes("users") || normLabel.includes("platform")) {
    return {
      iconBg: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
      badge: "bg-blue-500/10 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border-blue-500/25",
      sparkline: "text-blue-500 dark:text-blue-400",
      status: "SYNCED"
    };
  }
  if (normLabel.includes("credits") || normLabel.includes("active")) {
    return {
      iconBg: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
      badge: "bg-amber-500/10 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-500/25",
      sparkline: "text-amber-500 dark:text-amber-400",
      status: "PEAK"
    };
  }
  if (normLabel.includes("orgs") || normLabel.includes("total")) {
    return {
      iconBg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
      badge: "bg-emerald-500/10 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-500/25",
      sparkline: "text-emerald-500 dark:text-emerald-400",
      status: "SELSOFT"
    };
  }

  // Fallback to sparklineColor mapping
  if (sparklineColor.includes("emerald") || sparklineColor.includes("green")) {
    return {
      iconBg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
      badge: "bg-emerald-500/10 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-500/25",
      sparkline: "text-emerald-500 dark:text-emerald-400",
      status: "SELSOFT"
    };
  }
  if (sparklineColor.includes("purple") || sparklineColor.includes("violet") || sparklineColor.includes("indigo")) {
    return {
      iconBg: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
      badge: "bg-purple-500/10 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border-purple-500/25",
      sparkline: "text-purple-500 dark:text-purple-400",
      status: "SELSOFT"
    };
  }
  if (sparklineColor.includes("amber") || sparklineColor.includes("orange") || sparklineColor.includes("yellow")) {
    return {
      iconBg: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
      badge: "bg-amber-500/10 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-500/25",
      sparkline: "text-amber-500 dark:text-amber-400",
      status: "PEAK"
    };
  }
  return {
    iconBg: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    badge: "bg-blue-500/10 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border-blue-500/25",
    sparkline: "text-blue-500 dark:text-blue-400",
    status: "OPERATIONAL"
  };
};

export function StatCard({
  icon: Icon,
  label,
  value,
  sparkline,
  sparklineColor = "text-blue-500",
  statusText
}: Readonly<{
  icon: LucideIcon;
  label: string;
  value: string;
  sparkline: number[];
  sparklineColor: string;
  statusText?: string;
}>) {
  const theme = getTheme(label, sparklineColor);
  const activeStatus = statusText || theme.status;

  return (
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-[1.75rem] p-4 lg:p-5 relative overflow-hidden transition-all duration-300 hover:border-[var(--accent)] hover:shadow-lg group flex flex-col justify-between min-h-[125px]">
      {/* Top Row: Icon Box & Status Badge */}
      <div className="flex items-center justify-between relative z-10">
        <div className={`size-9 lg:size-10 rounded-2xl flex items-center justify-center border transition-all duration-300 group-hover:scale-105 ${theme.iconBg}`}>
          <Icon size={18} strokeWidth={2.5} />
        </div>

        <span className={`px-3 py-1 rounded-full border text-[9px] font-bold uppercase tracking-[0.18em] transition-all duration-300 ${theme.badge}`}>
          {activeStatus}
        </span>
      </div>

      {/* Bottom Area: Label & Value */}
      <div className="mt-4 relative z-10">
        <p className="text-[9px] lg:text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--muted)] mb-0.5">
          {label}
        </p>
        <p className="text-2xl lg:text-3xl font-semibold text-[var(--foreground)] tracking-tight">
          {value}
        </p>
      </div>

      {/* Live Sparkline Area Wave */}
      <SparklineWave points={sparkline} colorClass={theme.sparkline} />
    </div>
  );
}

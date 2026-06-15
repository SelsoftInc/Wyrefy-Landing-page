"use client";

import { useQuery } from "@tanstack/react-query";
import { Activity, Layers3, Wallet, type LucideIcon } from "lucide-react";
import { useState } from "react";

import { AdminTrendChartCard } from "@/src/components/admin/admin-trend-chart-card";
import { SectionLoading } from "@/src/components/ui/loading-states";
import { adminDashboard, sandboxTrends, tokenTrends } from "@/src/features/admin-ops/api";
import { compactNumber } from "@/src/shared/formatters";

const moneyFormatter = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

function moneyFromCents(cents: number) {
  return moneyFormatter.format(cents / 100);
}

function moneyFromString(value: string) {
  return moneyFormatter.format(Number(value));
}

function formatTokens(value: number | string) {
  const numericValue = Number(value);
  if (numericValue < 1000) return numericValue.toLocaleString("en-US");
  return compactNumber(numericValue);
}

function formatHours(value: number | string) {
  const hours = Number(value) / 3600;
  if (hours < 1) return `${hours.toFixed(2)}h`;
  if (hours < 10) return `${hours.toFixed(1)}h`;
  return `${hours.toFixed(0)}h`;
}

function parseModelSelection(value: string) {
  if (value === "all") return {};
  const separatorIndex = value.indexOf("::");
  if (separatorIndex <= 0) return {};
  return {
    provider: value.slice(0, separatorIndex),
    model_name: value.slice(separatorIndex + 2),
  };
}

export function AdminDashboardOps() {
  const [modelSelection, setModelSelection] = useState("all");
  const [profileSelection, setProfileSelection] = useState("all");

  const dashboard = useQuery({ queryKey: ["admin-dashboard"], queryFn: adminDashboard });
  const tokenTrendQuery = useQuery({
    queryKey: ["admin-token-trends", modelSelection],
    queryFn: () => tokenTrends(30, parseModelSelection(modelSelection)),
  });
  const sandboxTrendQuery = useQuery({
    queryKey: ["admin-sandbox-trends", profileSelection],
    queryFn: () => sandboxTrends(30, profileSelection === "all" ? undefined : profileSelection),
  });
  const tokenPoints = (tokenTrendQuery.data?.points ?? []).map((point) => ({
    bucket: point.bucket,
    primaryValue: Number(point.usage),
    primaryDisplay: `${formatTokens(point.usage)} tokens`,
    secondaryDisplay: moneyFromString(point.cost_usd),
  }));

  const sandboxPoints = (sandboxTrendQuery.data?.points ?? []).map((point) => ({
    bucket: point.bucket,
    primaryValue: Number(point.usage),
    primaryDisplay: formatHours(point.usage),
    secondaryDisplay: moneyFromString(point.cost_usd),
  }));

  type TotalTuple = [{ label: string; value: string }, { label: string; value: string }];

  const tokenTotals: TotalTuple = [
    { label: "30 day tokens", value: `${formatTokens(tokenTrendQuery.data?.totals?.usage ?? 0)} tokens` },
    { label: "30 day cost", value: moneyFromString(tokenTrendQuery.data?.totals?.cost_usd ?? "0") },
  ];

  const sandboxTotals: TotalTuple = [
    { label: "30 day runtime", value: formatHours(sandboxTrendQuery.data?.totals?.usage ?? 0) },
    { label: "30 day cost", value: moneyFromString(sandboxTrendQuery.data?.totals?.cost_usd ?? "0") },
  ];

  if (dashboard.isLoading) {
    return <SectionLoading label="Loading platform insights" />;
  }

  return (
    <div className="flex w-full flex-col gap-4 pb-2 lg:gap-6 animate-page-enter">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardMetricTile
          icon={Wallet}
          iconColorClass="text-blue-500"
          iconBgClass="bg-blue-500/10 border border-blue-500/20"
          label="Monthly Revenue"
          value={moneyFromCents(dashboard.data?.mrr_cents ?? 0)}
          badge="CURRENT"
        />
        <DashboardMetricTile
          icon={Layers3}
          iconColorClass="text-indigo-500"
          iconBgClass="bg-indigo-500/10 border border-indigo-500/20"
          label="Active Subscriptions"
          value={String(dashboard.data?.active_subscriptions ?? 0)}
          badge="SYNCED"
        />
        <DashboardMetricTile
          icon={Activity}
          iconColorClass="text-amber-500"
          iconBgClass="bg-amber-500/10 border border-amber-500/20"
          label="Platform Users"
          value={String(dashboard.data?.users ?? 0)}
          badge="ALL TIME"
        />
        <DashboardMetricTile
          icon={Layers3}
          iconColorClass="text-emerald-500"
          iconBgClass="bg-emerald-500/10 border border-emerald-500/20"
          label="Organizations"
          value={String(dashboard.data?.organizations ?? 0)}
          badge="ACTIVE"
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-2 xl:gap-6">
        <AdminTrendChartCard
          title="Token Usage and Cost"
          subtitle="Track how model-level token consumption changes over the last 30 days, then isolate a specific model when spend shifts unexpectedly."
          options={tokenTrendQuery.data?.options ?? [{ value: "all", label: "All models" }, { value: "mock::data", label: "Mock Data (Testing)" }]}
          points={tokenPoints}
          primaryLegend="Tokens"
          secondaryLegend="Cost"
          selectedValue={tokenTrendQuery.data?.selected_value ?? modelSelection}
          totals={tokenTotals}
          onChange={setModelSelection}
        />

        <AdminTrendChartCard
          title="Sandbox Usage and Cost"
          subtitle="Compare compute-profile usage over the last 30 days so you can spot which runtime profile is actually driving infrastructure spend."
          options={sandboxTrendQuery.data?.options ?? [{ value: "all", label: "All profiles" }, { value: "mock_profile", label: "Mock Profile (Testing)" }]}
          points={sandboxPoints}
          primaryLegend="Usage time"
          secondaryLegend="Cost"
          selectedValue={sandboxTrendQuery.data?.selected_value ?? profileSelection}
          totals={sandboxTotals}
          onChange={setProfileSelection}
        />
      </div>

    </div>
  );
}

function DashboardMetricTile({ badge, icon: Icon, iconColorClass = "text-blue-500", iconBgClass = "bg-blue-500/10 border-blue-500/20", label, value }: Readonly<{ badge?: string; icon: LucideIcon; iconColorClass?: string; iconBgClass?: string; label: string; value: string }>) {
  // Deterministic random generator based on card label and value
  const seed = label + value;
  let hashVal = 0;
  for (let i = 0; i < seed.length; i++) {
    hashVal = (seed.codePointAt(i) ?? 0) + ((hashVal << 5) - hashVal);
  }
  const hashState = { current: Math.abs(hashVal) };
  const random = () => {
    hashState.current = Math.sin(hashState.current + 1) * 10000;
    return hashState.current - Math.floor(hashState.current);
  };

  const generatePath = (baseHeight: number, variance: number) => {
    let path = `M0,100 L0,${baseHeight + random() * variance}`;
    for (let i = 1; i <= 5; i++) {
      const x = i * 20;
      const y = baseHeight - variance + random() * (variance * 2);
      path += ` L${x},${y}`;
    }
    path += ` L100,100 Z`;
    return path;
  };

  const path1 = generatePath(65, 15);
  const path2 = generatePath(75, 20);

  return (
    <section className="group relative overflow-hidden rounded-[1.8rem] border border-[var(--border)] bg-[var(--card)] px-5 py-6 shadow-lg shadow-blue-500/5 min-h-[160px] flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/10 hover:border-blue-500/30 cursor-pointer">
      {/* Decorative Wave BG */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 text-[var(--muted)] opacity-20 dark:opacity-20 transition-all duration-700 ease-in-out group-hover:opacity-30 dark:group-hover:opacity-40 group-hover:translate-y-2">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full fill-current">
          <path d={path1} className="opacity-50" />
          <path d={path2} />
        </svg>
      </div>

      <div className="relative z-10 flex items-start justify-between gap-3 mb-4">
        <div className={`flex size-11 items-center justify-center rounded-2xl border ${iconBgClass} ${iconColorClass}`}>
          <Icon size={20} />
        </div>
        {badge && (
          <div className="rounded-full border border-[var(--border)] bg-[var(--card)]/50 px-3 py-1 text-[9px] font-bold tracking-widest text-[var(--muted)] uppercase">
            {badge}
          </div>
        )}
      </div>

      <div className="relative z-10 mt-auto">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--muted)]">{label}</p>
        <p className="mt-1 text-3xl font-bold tracking-tight text-[var(--foreground)]">{value}</p>
      </div>
    </section>
  );
}


"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { EmptyAnalyticsState, RankedListCard, ViewToggle } from "@/src/components/analytics/analytics-visuals";
import { SectionLoading } from "@/src/components/ui/loading-states";
import { endpointAnalytics, organizationAnalytics, usageTrends } from "@/src/features/admin-ops/api";
import { compactNumber } from "@/src/shared/formatters";

export function AdminUsageOps() {
  const [view, setView] = useState<"graph" | "list">("graph");
  const endpoints = useQuery({ queryKey: ["usage-endpoints"], queryFn: () => endpointAnalytics(30) });
  const orgs = useQuery({ queryKey: ["usage-orgs"], queryFn: () => organizationAnalytics(30) });
  const trends = useQuery({ queryKey: ["usage-trends"], queryFn: () => usageTrends(30) });

  if (endpoints.isLoading || orgs.isLoading || trends.isLoading) return <SectionLoading label="Loading usage analytics" />;

  const finalEndpoints = endpoints.data ?? { by_volume: [], by_latency: [], by_error_rate: [] };
  const finalOrgs = orgs.data ?? { by_usage: [] };
  const finalTrends = trends.data ?? [];

  const formatMs = (ms: number) => (ms < 1000 ? `${Math.round(ms)}ms` : `${(ms / 1000).toFixed(2)}s`);
  const totalVolume = finalEndpoints.by_volume.reduce((acc, r) => acc + r.requests, 0);

  const hasEndpoints = finalEndpoints.by_volume.length > 0 || finalEndpoints.by_latency.length > 0 || finalEndpoints.by_error_rate.length > 0;
  const hasOrgs = finalOrgs.by_usage.length > 0;
  const hasTrends = finalTrends.length > 0;

  const emptyState = !hasEndpoints && !hasOrgs && !hasTrends;
  
  let usageContent = (
    <div className="grid gap-6">
      <Panel title="Detailed Endpoint Analytics">
        <div className="space-y-1">
          {finalEndpoints.by_volume.map((row) => (
            <Row key={`${row.method}${row.endpoint}`} method={row.method} path={row.endpoint} right={`${row.requests} req · ${formatMs(row.avg_latency_ms)} · ${row.error_rate}% err`} />
          ))}
          {!finalEndpoints.by_volume.length && <p className="py-10 text-center text-xs font-medium text-[var(--muted)] italic">No endpoint data recorded</p>}
        </div>
      </Panel>
      <div className="grid gap-6 md:grid-cols-2">
        <Panel title="Organization Leaderboard">
          <div className="space-y-1">
            {finalOrgs.by_usage.map((row) => <Row key={row.organization_id} path={row.name} right={`${compactNumber(row.usage)} credits · ${row.generation_volume} gens`} />)}
            {!finalOrgs.by_usage.length && <p className="py-10 text-center text-xs font-medium text-[var(--muted)] italic">No organization activity found</p>}
          </div>
        </Panel>
        <Panel title="Daily Telemetry Logs">
          <div className="space-y-1">
            {finalTrends.map((row) => <Row key={row.bucket} path={row.bucket} right={`${compactNumber(row.credits)} credits · $${row.cost_usd} · ${row.generations} gens`} />)}
            {!finalTrends.length && <p className="py-10 text-center text-xs font-medium text-[var(--muted)] italic">No trend data found</p>}
          </div>
        </Panel>
      </div>
    </div>
  );
  if (emptyState) {
    usageContent = (
      <div className="py-20">
        <EmptyAnalyticsState />
      </div>
    );
  } else if (view === "graph") {
    usageContent = (
      <div className="space-y-6">
        <div className="grid gap-6 xl:grid-cols-3">
          <RankedListCard
            title="Endpoint Volume"
            subtitle="Total request distribution"
            totalLabel={compactNumber(totalVolume)}
            items={finalEndpoints.by_volume.slice(0, 8).map(row => ({
              method: row.method,
              path: row.endpoint,
              value: row.requests,
              formattedValue: compactNumber(row.requests),
              percentage: Math.round((row.requests / (totalVolume || 1)) * 100)
            }))}
          />
          <RankedListCard
            title="Latency Hotspots"
            subtitle="Slowest response times"
            colorClassName="bg-amber-500"
            items={finalEndpoints.by_latency.slice(0, 8).map(row => ({
              method: row.method,
              path: row.endpoint,
              value: row.avg_latency_ms,
              formattedValue: formatMs(row.avg_latency_ms)
            }))}
          />
          <RankedListCard
            title="Error Distribution"
            subtitle="Failed requests by endpoint"
            colorClassName="bg-rose-500"
            items={finalEndpoints.by_error_rate.slice(0, 8).map(row => ({
              method: row.method,
              path: row.endpoint,
              value: row.error_rate,
              formattedValue: `${row.error_rate}%`
            }))}
          />
        </div>
        <div className="grid gap-6">
          {hasOrgs ? (
            <RankedListCard
              title="Organization Usage"
              subtitle="Top resource consumers"
              items={finalOrgs.by_usage.slice(0, 8).map(row => ({
                path: row.name,
                value: Number(row.usage),
                formattedValue: `${compactNumber(row.usage)} CR`,
              }))}
            />
          ) : (
            <EmptyPanel title="Organization Usage" />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-6 animate-page-enter">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          {/* Header removed due to duplication with layout */}
        </div>
        <ViewToggle value={view} onChange={setView} />
      </div>

      {usageContent}
    </div>
  );
}

function EmptyPanel({ title }: Readonly<{ title: string }>) {
  return (
    <section className="glass-panel rounded-[2rem] p-8 flex flex-col items-center justify-center text-center opacity-60 min-h-[300px]">
      <h2 className="text-xl font-semibold text-[var(--foreground)] tracking-tight mb-2 self-start">{title}</h2>
      <div className="flex-1 flex flex-col items-center justify-center">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--muted)]">Telemetry unavailable</p>
        <p className="mt-2 text-xs font-medium text-[var(--muted)] max-w-[200px]">Activity will appear here once relevant operations are recorded.</p>
      </div>
    </section>
  );
}

function Panel({ title, children }: Readonly<{ title: string; children: React.ReactNode }>) {
  return (
    <section className="glass-panel rounded-[2rem] p-8 shadow-xl">
      <h2 className="text-xl font-semibold text-[var(--foreground)] tracking-tight mb-6">{title}</h2>
      <div data-lenis-prevent="true" className="overflow-y-auto max-h-[260px] pr-2 scrollbar-thin scrollbar-thumb-[var(--border)] scrollbar-track-transparent">
        {children}
      </div>
    </section>
  );
}

function Row({ method, path, right }: Readonly<{ method?: string; path: string; right: string }>) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-[var(--border)] bg-[var(--surface)]/40 p-4 transition-colors hover:bg-[var(--surface)]/60">
      <div className="flex items-center gap-3 min-w-0">
        {method && (
          <span className="px-1.5 py-0.5 rounded bg-[var(--surface)] border border-[var(--border)] text-[8px] font-medium uppercase tracking-tighter text-[var(--muted)]">
            {method}
          </span>
        )}
        <span className="text-xs font-medium text-[var(--foreground)] truncate">{path}</span>
      </div>
      <span className="shrink-0 text-[10px] font-bold uppercase tracking-widest text-[var(--accent)]">{right}</span>
    </div>
  );
}

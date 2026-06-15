"use client";

import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";
import { Download, FileSpreadsheet, Loader2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/src/components/ui/button";
import { adminReport, exportReport } from "@/src/features/admin-ops/api";

const kinds = [
  { id: "mrr", label: "Financial / MRR", description: "Review current recurring revenue concentration across active plans." },
  { id: "usage", label: "Platform Usage", description: "Review which models and compute profiles are driving spend." },
  { id: "subscriptions", label: "Subscriptions", description: "Review subscription state distribution before billing or support actions." },
] as const;

export function AdminReportsOps() {
  const [kind, setKind] = useState<(typeof kinds)[number]["id"]>("mrr");
  const report = useQuery({ 
    queryKey: ["admin-report", kind], 
    queryFn: () => adminReport(kind),
    placeholderData: keepPreviousData
  });
  const exported = useMutation({ mutationFn: () => exportReport(kind) });

  const exportRowCount = exported.data ? exported.data.sections.reduce((count, section) => count + section.rows.length, 0) : 0;

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-8 pb-16 animate-page-enter">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="max-w-3xl">
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-blue-500">Platform Admin Reports</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--foreground)]">Structured snapshots for finance, usage, and subscription operations</h1>
          <p className="mt-3 text-sm font-medium leading-relaxed text-[var(--muted)]">
            The dashboard is for trend detection. These reports are for review, export verification, and operational decisions that need a named snapshot.
          </p>
        </div>
        <Button
          onClick={() => exported.mutate()}
          loading={exported.isPending}
          icon={<Download size={16} />}
          className="h-11 !rounded-xl px-6 text-[10px] font-bold uppercase tracking-[0.18em] shadow-xl shadow-blue-500/10"
        >
          Export Report Snapshot
        </Button>
      </div>

      <div className="grid gap-8 xl:grid-cols-[18rem_minmax(0,1fr)]">
        <aside className="space-y-3">
          <p className="px-2 text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--muted)]">Report Types</p>
          {kinds.map((item) => {
            const active = item.id === kind;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setKind(item.id)}
                className={`flex w-full flex-col h-[160px] justify-center rounded-[1.6rem] border p-5 text-left transition-all ${
                  active
                    ? "border-blue-500/30 bg-blue-500/5 text-[var(--foreground)] shadow-lg shadow-blue-500/5"
                    : "border-[var(--border)] bg-[var(--surface)]/30 text-[var(--muted)] hover:border-blue-500/20 hover:bg-[var(--surface)]/60"
                }`}
              >
                <p className="text-xs font-medium uppercase tracking-[0.18em]">{item.label}</p>
                <p className={`mt-2 text-sm font-medium leading-relaxed ${active ? "text-[var(--foreground)]/80" : "text-[var(--muted)]"}`}>
                  {item.description}
                </p>
              </button>
            );
          })}
        </aside>

        <section className="glass-panel rounded-[2.4rem] p-1 shadow-2xl h-[45rem]">
          <div className="flex h-full flex-col rounded-[2.2rem] bg-[var(--card)] p-6 lg:p-8 overflow-y-auto custom-scrollbar">
            {report.isPending && !report.isPlaceholderData && (
              <div className="flex min-h-[32rem] flex-1 items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                  <Loader2 size={32} className="animate-spin text-blue-500" />
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--muted)]">Building report snapshot</p>
                </div>
              </div>
            )}
            {(!report.isPending || report.isPlaceholderData) && report.data && (
              <>
                <div className="flex flex-col gap-4 border-b border-[var(--border)] pb-6 lg:flex-row lg:items-end lg:justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <div className="flex size-11 items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-500/10 text-blue-500">
                        <FileSpreadsheet size={20} />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-500">Live Snapshot</p>
                        <h2 className="mt-1 text-2xl font-semibold tracking-tight text-[var(--foreground)]">{report.data.title}</h2>
                      </div>
                    </div>
                    <p className="mt-4 max-w-3xl text-sm font-medium leading-relaxed text-[var(--muted)]">
                      {report.data.description}
                      {report.isFetching && <span className="ml-2 inline-block animate-pulse text-blue-500"><Loader2 size={12} className="inline animate-spin" /></span>}
                    </p>
                  </div>
                  <div className="rounded-[1.5rem] border border-[var(--border)] bg-[var(--surface)]/35 px-4 py-3">
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--muted)]">Sections</p>
                    <p className="mt-2 text-2xl font-semibold tracking-tight text-[var(--foreground)]">{report.data.sections.length}</p>
                  </div>
                </div>

                <div
                  className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
                >
                  {report.data.summary.map((item) => (
                    <div key={item.label} className="min-h-[110px] flex flex-col justify-between rounded-[1.5rem] border border-[var(--border)] bg-[var(--surface)]/30 p-5">
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--muted)]">{item.label}</p>
                      <p className="mt-3 text-3xl font-bold tracking-tight text-[var(--foreground)]">{item.value}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 space-y-5">
                  {report.data.sections.map((section) => (
                    <ReportSectionCard key={section.title} section={section} />
                  ))}
                </div>
              </>
            )}
          </div>
        </section>
      </div>

      {exported.data ? (
        <section className="rounded-[2rem] border border-emerald-500/20 bg-emerald-500/[0.04] p-1 shadow-sm">
          <div className="rounded-[1.9rem] bg-[var(--card)] px-6 py-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-500">Export Snapshot Ready</p>
            <h3 className="mt-2 text-lg font-semibold tracking-tight text-[var(--foreground)]">{exported.data.title}</h3>
            <p className="mt-2 text-sm font-medium leading-relaxed text-[var(--muted)]">
              Verified {exported.data.sections.length} sections and {exportRowCount} rows for this export snapshot.
            </p>
          </div>
        </section>
      ) : null}
    </div>
  );
}

function ReportSectionCard({ section }: Readonly<{ section: NonNullable<Awaited<ReturnType<typeof adminReport>>>["sections"][number] }>) {
  const valueHeaders = section.columns.slice(1);
  const gridStyle = { gridTemplateColumns: `minmax(0, 1.6fr) repeat(${Math.max(1, valueHeaders.length)}, minmax(0, 1fr))` };

  return (
    <section className="rounded-[1.8rem] border border-[var(--border)] bg-[var(--surface)]/20 p-5">
      <div className="border-b border-[var(--border)] pb-4">
        <h3 className="text-lg font-semibold tracking-tight text-[var(--foreground)]">{section.title}</h3>
        <p className="mt-2 text-sm font-medium leading-relaxed text-[var(--muted)]">{section.description}</p>
      </div>

      {section.rows.length > 0 ? (
        <div className="mt-4 space-y-2">
          <div style={gridStyle} className="grid gap-3 px-4 text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--muted)]">
            <span>{section.columns[0]}</span>
            {valueHeaders.map((header) => (
              <span key={header} className="text-right">{header}</span>
            ))}
          </div>
          {section.rows.map((row) => (
            <div key={`${section.title}-${row.label}-${row.values.join("-")}`} style={gridStyle} className="grid gap-3 rounded-[1.2rem] border border-[var(--border)] bg-[var(--card)]/80 px-4 py-3">
              <p className="truncate text-sm font-medium text-[var(--foreground)]">{row.label}</p>
              {row.values.map((value) => (
                <p key={`${row.label}-${value}`} className="text-right text-sm font-medium text-[var(--foreground)]/80">{value}</p>
              ))}
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-4 rounded-[1.5rem] border border-dashed border-[var(--border)] px-4 py-10 text-center text-sm font-medium text-[var(--muted)]">
          {section.empty_message}
        </div>
      )}
    </section>
  );
}

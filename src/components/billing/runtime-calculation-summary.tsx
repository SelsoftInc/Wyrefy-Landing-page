"use client";

import { useQuery } from "@tanstack/react-query";
import { Calculator, Cpu, Sparkles } from "lucide-react";
import type { ReactNode } from "react";

import { runtimeModels } from "@/src/features/runtime/api";
import { queryKeys } from "@/src/features/query-keys";

type RuntimeCalculationSummaryProps = Readonly<{
  limits: Record<string, unknown> | undefined;
}>;

function formatPercent(value: unknown) {
  const numeric = Number(value ?? 0);
  return Number.isFinite(numeric) ? `${numeric}%` : "0%";
}

function formatMoney(value: string) {
  return `$${Number(value || 0).toFixed(6)}`;
}

function runtimeString(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() ? value : fallback;
}

export function RuntimeCalculationSummary({ limits }: RuntimeCalculationSummaryProps) {
  const models = useQuery({ queryKey: queryKeys.runtimeModels(), queryFn: runtimeModels });
  const margin = formatPercent(limits?.runtime_margin_percent);
  const computeProfile = runtimeString(limits?.compute_profile_key, "default");

  return (
    <section className="rounded-[2rem] border border-blue-500/10 bg-blue-500/[0.03] p-6 shadow-xl backdrop-blur-2xl">
      <div className="flex items-start gap-4">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400">
          <Calculator size={22} />
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-blue-400">Runtime billing</p>
          <h3 className="mt-1 text-xl font-semibold text-[var(--foreground)]">How model and sandbox compute credits are calculated</h3>
          <p className="mt-2 max-w-3xl text-sm font-medium leading-6 text-[var(--muted)]">
            Credits are deducted after usage is metered. The calculation is: model cost plus sandbox compute cost, then the plan margin is added.
          </p>
        </div>
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <RuntimeTile icon={<Sparkles size={18} />} label="Models" value={`${models.data?.length ?? 0} available`} detail="Input, output, cache read, and cache write tokens are priced from the selected model." />
        <RuntimeTile icon={<Cpu size={18} />} label="Sandbox compute" value={computeProfile} detail="Compute is metered by active sandbox seconds using your plan compute profile." />
        <RuntimeTile icon={<Calculator size={18} />} label="Plan margin" value={margin} detail="Final credits = (LLM cost + compute cost) + margin percentage." />
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {(models.data ?? []).slice(0, 4).map((model) => (
          <div key={model.id} className="rounded-2xl border border-[var(--border)]/60 bg-[var(--background)]/40 p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="truncate text-sm font-medium text-[var(--foreground)]">{model.model_name}</p>
              <span className="rounded-full bg-[var(--surface)] px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-[var(--muted)]">{model.provider}</span>
            </div>
            <p className="mt-2 text-xs font-medium text-[var(--muted)]">
              In {formatMoney(model.input_price_per_million)}/M · Out {formatMoney(model.output_price_per_million)}/M
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

function RuntimeTile(props: Readonly<{ icon: ReactNode; label: string; value: string; detail: string }>) {
  return (
    <div className="rounded-2xl border border-[var(--border)]/60 bg-[var(--background)]/40 p-4">
      <div className="flex items-center gap-3 text-blue-400">
        {props.icon}
        <p className="text-[10px] font-bold uppercase tracking-[0.2em]">{props.label}</p>
      </div>
      <p className="mt-3 text-lg font-semibold text-[var(--foreground)]">{props.value}</p>
      <p className="mt-2 text-xs font-medium leading-5 text-[var(--muted)]">{props.detail}</p>
    </div>
  );
}

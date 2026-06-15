"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Database, Plus, Sparkles, TimerReset } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";

import { cacheModeLabel } from "@/src/components/billing/model-cache-utils";
import { ModelCacheModeField } from "@/src/components/billing/model-cache-controls";
import { Metric, PriceCard, RuntimeForm, RuntimeSection } from "@/src/components/billing/runtime-pricing-shared";
import { RuntimeModelLogo, RUNTIME_MODEL_LOGO_OPTIONS } from "@/src/components/project/runtime-model-branding";
import { Button } from "@/src/components/ui/button";
import { SearchableSelectField, type SearchableSelectOption, TextField } from "@/src/components/ui/form-field";
import {
  createModelPricing,
  deleteModelPricing,
  modelPricing,
  runtimeProviders,
  updateModelPricing,
} from "@/src/features/admin-ops/api";
import type { ModelPricing } from "@/src/features/admin-ops/types";
import { formString } from "@/src/shared/form-data";

type ModelPricingFormState =
  | { mode: "create"; provider: string }
  | { mode: "edit"; row: ModelPricing };

type ProviderStats = Readonly<{
  active: number;
  deprecated: number;
  total: number;
}>;

function logoOptions(): SearchableSelectOption[] {
  return RUNTIME_MODEL_LOGO_OPTIONS.map((name) => ({
    value: name,
    label: name,
    description: `/llm_model_images/${name}.svg`,
  }));
}

function providerLabel(provider: string): string {
  const normalized = provider.trim().toLowerCase();
  if (normalized === "vertex_ai") return "Vertex AI";
  if (normalized === "fireworks_ai") return "Fireworks AI";
  return provider
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function contextWindowInput(value: number | null | undefined, metadataJson: Record<string, unknown> | undefined): string {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) return String(value);
  const metadataValue = metadataJson?.context_window_tokens;
  return typeof metadataValue === "number" || typeof metadataValue === "string" ? String(metadataValue) : "";
}

function contextWindowLabel(value: number | null | undefined, metadataJson?: Record<string, unknown>): string {
  const rawValue = typeof value === "number" ? value : Number(metadataJson?.context_window_tokens ?? 0);
  if (!Number.isFinite(rawValue) || rawValue <= 0) return "not set";
  return `${rawValue.toLocaleString("en-US")} tokens`;
}

function parsePositiveInt(value: string): number | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const parsed = Number.parseInt(trimmed, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

function providerStats(rows: ModelPricing[], provider: string): ProviderStats {
  const scopedRows = rows.filter((row) => row.provider === provider);
  const active = scopedRows.filter((row) => row.status === "active").length;
  const deprecated = scopedRows.filter((row) => row.status !== "active").length;
  return { active, deprecated, total: scopedRows.length };
}

function statValueLabel(value: number, singular: string, plural: string): string {
  return `${value} ${value === 1 ? singular : plural}`;
}

function confirmDelete(row: ModelPricing): boolean {
  return globalThis.confirm(`Delete ${row.model_name} permanently? This action cannot be undone.`);
}

export function ModelPricingSection() {
  const [formState, setFormState] = useState<ModelPricingFormState | null>(null);
  const queryClient = useQueryClient();
  const rows = useQuery({ queryKey: ["runtime-model-pricing"], queryFn: modelPricing });
  const providers = useQuery({ queryKey: ["runtime-model-providers"], queryFn: runtimeProviders });
  const create = useMutation({
    mutationFn: createModelPricing,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["runtime-model-pricing"] });
      setFormState(null);
    },
  });
  const update = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Parameters<typeof updateModelPricing>[1] }) => updateModelPricing(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["runtime-model-pricing"] });
      setFormState(null);
    },
  });
  const remove = useMutation({
    mutationFn: deleteModelPricing,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["runtime-model-pricing"] });
    },
  });

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const cacheMode = formString(data, "cache_mode");
    const logoName = formString(data, "logo_name");
    const contextWindowTokens = parsePositiveInt(formString(data, "context_window_tokens"));
    const metadata_json: Record<string, unknown> = {};
    if (cacheMode) metadata_json.cache_mode = cacheMode;
    if (logoName) metadata_json.logo_name = logoName;

    const payload = {
      model_name: formString(data, "model_name"),
      input_price_per_million: formString(data, "input_price_per_million"),
      output_price_per_million: formString(data, "output_price_per_million"),
      cache_read_price_per_million: formString(data, "cache_read_price_per_million", "0"),
      cache_write_price_per_million: formString(data, "cache_write_price_per_million", "0"),
      context_window_tokens: contextWindowTokens,
      metadata_json,
    };

    if (formState?.mode === "edit") {
      await update.mutateAsync({ id: formState.row.id, payload });
    } else {
      await create.mutateAsync({
        provider: formString(data, "provider", formState?.mode === "create" ? formState.provider : ""),
        model_id: formString(data, "model_id"),
        ...payload,
      });
    }
    form.reset();
  }

  const rowsData = rows.data ?? [];
  const providerRows = providers.data ?? [];
  const overview = {
    providers: providerRows.length,
    activeModels: rowsData.filter((row) => row.status === "active").length,
    deprecatedModels: rowsData.filter((row) => row.status !== "active").length,
  };

  return (
    <RuntimeSection title="LLM model pricing">
      {formState ? (
        <ModelPricingForm
          formState={formState}
          onSubmit={onSubmit}
          onCancel={() => setFormState(null)}
          pending={create.isPending || update.isPending}
        />
      ) : null}
      <div className="grid gap-4 md:grid-cols-3">
        <SummaryTile icon={<Database size={18} />} label="Providers" value={String(overview.providers)} detail="Enabled backend providers available for model pricing." />
        <SummaryTile icon={<Sparkles size={18} />} label="Active rows" value={String(overview.activeModels)} detail="Current production pricing versions used by runtime billing." />
        <SummaryTile icon={<TimerReset size={18} />} label="Deprecated rows" value={String(overview.deprecatedModels)} detail="Retained history that can still be deleted permanently after review." />
      </div>
      <div className="mt-12 space-y-10">
        {providerRows.map((item) => {
          const stats = providerStats(rowsData, item.provider);
          const providerModels = rowsData.filter((row) => row.provider === item.provider);
          return (
            <section key={item.provider} className="flex flex-col overflow-hidden rounded-[2.5rem] border border-[var(--border)]/60 bg-[var(--background)]/40 shadow-xl backdrop-blur-2xl">
              <div className="flex w-full items-center justify-between gap-4 border-b border-[var(--border)]/50 bg-[var(--surface)]/30 p-6 md:p-8">
                <div>
                  <div className="flex items-center gap-3">
                    <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-blue-500">Provider Section</p>
                  </div>
                  <h4 className="mt-2 text-2xl font-bold tracking-tight text-[var(--foreground)]">{providerLabel(item.provider)}</h4>
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] font-bold tracking-wider text-[var(--muted)]">
                    <span className="rounded-lg border border-[var(--border)] bg-[var(--surface)]/50 px-2 py-1">{item.provider}</span>
                    <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> {statValueLabel(stats.active, "active row", "active rows")}</span>
                    <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-amber-500/50" /> {statValueLabel(stats.deprecated, "deprecated row", "deprecated rows")}</span>
                  </div>
                </div>
              </div>
              
              <div className="p-6 md:p-8 space-y-6 bg-gradient-to-b from-[var(--surface)]/10 to-transparent">
                <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-5 rounded-[2rem] border border-blue-500/20 bg-gradient-to-r from-blue-500/10 to-blue-500/5 p-6 shadow-inner">
                  <div className="absolute inset-0 rounded-[2rem] bg-[radial-gradient(ellipse_at_top_left,rgba(59,130,246,0.15),transparent_50%)] pointer-events-none" />
                  <div className="relative z-10">
                    <p className="text-sm font-bold tracking-wide text-[var(--foreground)]">{providerLabel(item.provider)} pricing catalog</p>
                    <p className="mt-2 max-w-xl text-xs font-medium leading-relaxed text-[var(--muted)]">
                      Add exact token prices, cache mode, and context window so runtime compaction and billing both use the correct model contract.
                    </p>
                  </div>
                  <Button onClick={() => setFormState({ mode: "create", provider: item.provider })} icon={<Plus size={18} />} className="relative z-10 shrink-0 shadow-lg shadow-blue-500/25">Add Model</Button>
                </div>
                {providerModels.length > 0 ? (
                  <div className="rounded-[3rem] border border-[var(--border)]/50 bg-[var(--surface)]/20 p-6 md:p-8">
                    <div className="grid gap-6 xl:grid-cols-2">
                      {providerModels.map((row) => (
                        <ModelCard
                          key={row.id}
                          row={row}
                          onEdit={() => setFormState({ mode: "edit", row })}
                          onDelete={() => {
                            if (confirmDelete(row)) remove.mutate(row.id);
                          }}
                          pending={remove.isPending && remove.variables === row.id}
                        />
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center rounded-[2.5rem] border border-dashed border-[var(--border)] bg-[var(--surface)]/20 py-12 px-6 text-center">
                    <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-[var(--surface)] text-[var(--muted)]/40 border border-[var(--border)] shadow-sm">
                      <Database size={24} />
                    </div>
                    <p className="text-sm font-semibold text-[var(--foreground)]">No pricing rows exist</p>
                    <p className="mt-2 max-w-sm text-xs font-medium leading-relaxed text-[var(--muted)]">
                      Get started by adding the first model with its real context window and cache mode to enable billing calculations.
                    </p>
                  </div>
                )}
              </div>
            </section>
          );
        })}
      </div>
    </RuntimeSection>
  );
}

function ModelPricingForm(props: Readonly<{ formState: ModelPricingFormState; onSubmit: (event: React.FormEvent<HTMLFormElement>) => void; onCancel: () => void; pending: boolean }>) {
  const editing = props.formState.mode === "edit";
  const editRow = props.formState.mode === "edit" ? props.formState.row : undefined;
  const provider = editRow?.provider ?? (props.formState.mode === "create" ? props.formState.provider : "");
  const cacheMode = String(editRow?.metadata_json.cache_mode ?? "");
  const [selectedLogoName, setSelectedLogoName] = useState(String(editRow?.metadata_json.logo_name ?? ""));

  return (
    <RuntimeForm
      title={editing ? "Edit model pricing" : "Add model pricing"}
      onSubmit={props.onSubmit}
      onCancel={props.onCancel}
      pending={props.pending}
      hiddenFields={!editing ? <input type="hidden" name="provider" value={provider} /> : null}
    >
      <div className="md:col-span-2 rounded-2xl border border-blue-500/10 bg-blue-500/[0.04] p-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-blue-400">Provider contract</p>
        <p className="mt-2 text-sm font-semibold text-[var(--foreground)]">{providerLabel(provider)}</p>
        <p className="mt-1 text-xs font-bold leading-relaxed text-[var(--muted)]">
          Store the exact pricing, cache mode, and context window used by the runtime. This row drives both billing math and context-compaction thresholds.
        </p>
      </div>
      {editing ? (
        <>
          <TextField label="Provider" value={provider} disabled />
          <TextField label="Model ID" value={editRow?.model_id ?? ""} disabled />
        </>
      ) : null}
      <TextField label="Model name" name="model_name" placeholder="Gemini 2.5 Pro" defaultValue={editRow?.model_name} required />
      {!editing ? <TextField label="Model ID" name="model_id" placeholder="gemini-2.5-pro" required /> : null}
      <SearchableSelectField
        className="md:col-span-2"
        label="Logo name"
        name="logo_name"
        options={logoOptions()}
        value={selectedLogoName}
        onChange={setSelectedLogoName}
        placeholder="Select logo from client/public/llm_model_images"
      />
      <TextField label="Input / million" name="input_price_per_million" type="number" step="0.000001" min="0" defaultValue={editRow?.input_price_per_million} required />
      <TextField label="Output / million" name="output_price_per_million" type="number" step="0.000001" min="0" defaultValue={editRow?.output_price_per_million} required />
      <TextField label="Cache read / million" name="cache_read_price_per_million" type="number" step="0.000001" min="0" defaultValue={editRow?.cache_read_price_per_million ?? "0"} />
      <TextField label="Cache write / million" name="cache_write_price_per_million" type="number" step="0.000001" min="0" defaultValue={editRow?.cache_write_price_per_million ?? "0"} />
      <TextField
        label="Context window tokens"
        name="context_window_tokens"
        type="number"
        step="1"
        min="1"
        placeholder="1000000"
        defaultValue={contextWindowInput(editRow?.context_window_tokens, editRow?.metadata_json)}
        className="md:col-span-2"
        required
      />
      <ModelCacheModeField className="md:col-span-2" defaultValue={cacheMode} />
    </RuntimeForm>
  );
}

function ModelCard({ row, onEdit, onDelete, pending }: Readonly<{ row: ModelPricing; onEdit: () => void; onDelete: () => void; pending: boolean }>) {
  const logoName = typeof row.metadata_json.logo_name === "string" ? row.metadata_json.logo_name : null;
  const primaryAction = row.status === "active"
    ? { label: "Edit", onClick: onEdit, pending: false, variant: "secondary" as const }
    : undefined;
  const deleteAction = { label: "Delete permanently", onClick: onDelete, pending, variant: "danger" as const };

  return (
    <PriceCard
      icon={logoName ? <RuntimeModelLogo logoName={logoName} alt={row.model_name} size={20} /> : <Sparkles size={20} />}
      title={row.model_name}
      subtitle={`${providerLabel(row.provider)} / ${row.model_id}`}
      status={row.status}
      action={primaryAction}
      secondaryAction={deleteAction}
    >
      <Metric label="Input" value={row.input_price_per_million} />
      <Metric label="Output" value={row.output_price_per_million} />
      <Metric label="Cache mode" value={cacheModeLabel(row.metadata_json.cache_mode)} />
      <Metric label="Context window" value={contextWindowLabel(row.context_window_tokens, row.metadata_json)} />
      <Metric label="Cache read" value={row.cache_read_price_per_million} />
      <Metric label="Cache write" value={row.cache_write_price_per_million} />
    </PriceCard>
  );
}

function SummaryTile(props: Readonly<{ icon: ReactNode; label: string; value: string; detail: string }>) {
  return (
    <div className="group relative overflow-hidden rounded-[2rem] border border-[var(--border)]/60 bg-[var(--background)]/40 p-5 shadow-lg backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_40px_-10px_rgba(59,130,246,0.15)] hover:border-blue-500/30">
      {/* Hover glow */}
      <div className="pointer-events-none absolute -inset-px rounded-[2rem] bg-gradient-to-b from-blue-500/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      
      <div className="relative z-10 flex items-center gap-4 text-blue-500">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-blue-500/10 shadow-inner ring-1 ring-blue-500/20 transition-transform duration-300 group-hover:scale-110 group-hover:bg-blue-500/20">{props.icon}</div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[var(--muted)] group-hover:text-blue-400/80 transition-colors">{props.label}</p>
          <p className="mt-1 text-2xl font-bold tracking-tight text-[var(--foreground)]">{props.value}</p>
        </div>
      </div>
      <p className="relative z-10 mt-4 text-[11px] font-medium leading-relaxed text-[var(--muted)] transition-colors group-hover:text-[var(--muted-foreground)]">{props.detail}</p>
    </div>
  );
}

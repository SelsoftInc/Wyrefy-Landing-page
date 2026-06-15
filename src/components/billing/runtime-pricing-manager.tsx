"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Cpu } from "lucide-react";
import {  useMemo, useState } from "react";

import { ModelPricingSection } from "@/src/components/billing/model-pricing-section";
import { Metric, PriceCard, RuntimeForm, RuntimeSection } from "@/src/components/billing/runtime-pricing-shared";
import { Button } from "@/src/components/ui/button";
import { SearchableSelectField, type SearchableSelectOption, TextField } from "@/src/components/ui/form-field";
import {
  computeOverrides,
  computePricing,
  createComputeOverride,
  createComputePricing,
  deprecateComputeOverride,
  deprecateComputePricing,
} from "@/src/features/admin-ops/api";
import type { ComputePricing, OrganizationComputeOverride } from "@/src/features/admin-ops/types";
import { adminOrganizations } from "@/src/features/auth/api";
import { formString } from "@/src/shared/form-data";

type RuntimeTab = "Models" | "Sandbox compute";

function metadataString(value: unknown, fallback: string): string {
  return typeof value === "string" || typeof value === "number" ? String(value) : fallback;
}

function uniqueComputeProfileOptions(rows: ComputePricing[] | undefined): SearchableSelectOption[] {
  if (!rows) return [];
  const sortedRows = [...rows].sort((left, right) => {
    if (left.status === right.status) return left.display_name.localeCompare(right.display_name);
    if (left.status === "active") return -1;
    if (right.status === "active") return 1;
    return left.display_name.localeCompare(right.display_name);
  });
  const seen = new Set<string>();
  return sortedRows.flatMap((row) => {
    if (seen.has(row.profile_key)) return [];
    seen.add(row.profile_key);
    return [{ value: row.profile_key, label: row.display_name, description: row.profile_key }];
  });
}

function formatUsdRate(value: string): string {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) {
    return `$${value}`;
  }
  return `$${numericValue.toLocaleString("en-US", {
    useGrouping: false,
    minimumFractionDigits: numericValue === 0 ? 2 : 0,
    maximumFractionDigits: 10,
  })}`;
}

export function RuntimePricingManager() {
  const [tab, setTab] = useState<RuntimeTab>("Models");
  return (
    <div className="space-y-8 animate-page-enter">
      {/* Premium Segmented Control */}
      <div className="flex justify-center md:justify-start">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--surface)]/50 p-1.5 shadow-inner backdrop-blur-xl">
          {(["Models", "Sandbox compute"] as RuntimeTab[]).map((item) => {
            const isActive = tab === item;
            return (
              <button
                type="button"
                key={item}
                onClick={() => setTab(item)}
                className={`relative min-w-[180px] rounded-full px-6 py-3 text-sm font-semibold transition-all duration-300 ${isActive ? "text-white shadow-lg" : "text-[var(--muted)] hover:text-[var(--foreground)]"}`}
              >
                {isActive && (
                  <span className="absolute inset-0 rounded-full bg-blue-600 shadow-[0_0_20px_rgba(37,99,235,0.4)]" />
                )}
                <span className="relative z-10 tracking-wide">{item}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="relative">
        {tab === "Models" ? <ModelPricingSection /> : <ComputePricingSection />}
      </div>
    </div>
  );
}

function ComputePricingSection() {
  const [showForm, setShowForm] = useState(false);
  const queryClient = useQueryClient();
  const organizations = useQuery({ queryKey: ["admin-organizations"], queryFn: adminOrganizations });
  const rows = useQuery({ queryKey: ["runtime-compute-pricing"], queryFn: computePricing });
  const overrides = useQuery({ queryKey: ["runtime-compute-overrides"], queryFn: computeOverrides });
  const create = useMutation({
    mutationFn: createComputePricing,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["runtime-compute-pricing"] });
      setShowForm(false);
    },
  });
  const deprecate = useMutation({
    mutationFn: deprecateComputePricing,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["runtime-compute-pricing"] });
      setShowForm(false);
    },
  });
  const createOverride = useMutation({
    mutationFn: createComputeOverride,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["runtime-compute-overrides"] }),
  });
  const deprecateOverride = useMutation({
    mutationFn: deprecateComputeOverride,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["runtime-compute-overrides"] }),
  });

  const organizationOptions = useMemo(
    () => (organizations.data ?? []).map((organization) => ({
      value: organization.id,
      label: organization.name,
      description: organization.allowed_email_domain,
    })),
    [organizations.data],
  );
  const computeProfileOptions = useMemo(() => uniqueComputeProfileOptions(rows.data), [rows.data]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    await create.mutateAsync({
      profile_key: formString(data, "profile_key"),
      display_name: formString(data, "display_name"),
      runtime_image: formString(data, "runtime_image") || null,
      vcpu_price_per_second: formString(data, "vcpu_price_per_second"),
      memory_gb_price_per_second: formString(data, "memory_gb_price_per_second"),
      metadata_json: {
        vcpu: formString(data, "vcpu", "1"),
        memory_gb: formString(data, "memory_gb", "1"),
      },
    });
    form.reset();
  }

  async function onOverrideSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    await createOverride.mutateAsync({
      organization_id: formString(data, "organization_id"),
      compute_profile_key: formString(data, "compute_profile_key"),
    });
    form.reset();
  }

  return (
    <RuntimeSection title="Sandbox compute pricing" buttonLabel="Add Compute Price" showForm={showForm} onAdd={() => setShowForm(true)}>
      {showForm ? <ComputePricingForm onSubmit={onSubmit} onCancel={() => setShowForm(false)} pending={create.isPending} /> : null}
      <ComputeOverridePanel
        computeOptions={computeProfileOptions}
        organizationOptions={organizationOptions}
        rows={overrides.data ?? []}
        onSubmit={onOverrideSubmit}
        pending={createOverride.isPending}
        onDeprecate={(id) => deprecateOverride.mutate(id)}
        deprecatePendingId={deprecateOverride.variables}
      />
      <div className="grid gap-5 xl:grid-cols-2">
        {(rows.data ?? []).map((row) => <ComputeCard key={row.id} row={row} onDeprecate={() => deprecate.mutate(row.id)} pending={deprecate.variables === row.id} />)}
      </div>
    </RuntimeSection>
  );
}

function ComputeOverridePanel(props: Readonly<{
  rows: OrganizationComputeOverride[];
  organizationOptions: SearchableSelectOption[];
  computeOptions: SearchableSelectOption[];
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  pending: boolean;
  onDeprecate: (id: string) => void;
  deprecatePendingId?: string;
}>) {
  const [selectedOrganizationId, setSelectedOrganizationId] = useState("");
  const [selectedComputeProfile, setSelectedComputeProfile] = useState("");
  const organizationLabels = new Map(props.organizationOptions.map((option) => [option.value, option.label]));

  return (
    <div className="rounded-[2rem] border border-blue-500/10 bg-blue-500/[0.03] p-5">
      <h4 className="text-base font-semibold text-[var(--foreground)]">Organization compute overrides</h4>
      <form onSubmit={props.onSubmit} className="mt-4 grid gap-3 md:grid-cols-[1fr_1fr_auto]">
        <SearchableSelectField
          label="Organization"
          name="organization_id"
          options={props.organizationOptions}
          value={selectedOrganizationId}
          onChange={setSelectedOrganizationId}
          placeholder="Select organization"
          required
        />
        <SearchableSelectField
          label="Compute profile key"
          name="compute_profile_key"
          options={props.computeOptions}
          value={selectedComputeProfile}
          onChange={setSelectedComputeProfile}
          placeholder="Select compute profile"
          required
        />
        <Button type="submit" className="self-end" loading={props.pending}>Save</Button>
      </form>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {props.rows.map((row) => (
          <div key={row.id} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/50 p-3">
            <p className="truncate text-xs font-medium text-[var(--foreground)]">{organizationLabels.get(row.organization_id) ?? row.organization_id}</p>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-[var(--muted)]">{row.compute_profile_key} / {row.status}</p>
            <Button variant="danger" onClick={() => props.onDeprecate(row.id)} loading={props.deprecatePendingId === row.id} className="mt-3 h-9 w-full">Deprecate</Button>
          </div>
        ))}
      </div>
    </div>
  );
}

function ComputePricingForm(props: Readonly<{ onSubmit: (event: React.FormEvent<HTMLFormElement>) => void; onCancel: () => void; pending: boolean }>) {
  return (
    <RuntimeForm title="Add compute pricing" onSubmit={props.onSubmit} onCancel={props.onCancel} pending={props.pending}>
      <TextField label="Profile key" name="profile_key" placeholder="ecs-fargate-default" required />
      <TextField label="Display name" name="display_name" placeholder="Default ECS Fargate" required />
      <TextField label="Runtime image" name="runtime_image" placeholder="account.dkr.ecr.region.amazonaws.com/wyrefy-sandbox:latest" className="md:col-span-2" />
      <TextField label="vCPU count" name="vcpu" type="number" step="0.25" min="0.25" defaultValue="1" required />
      <TextField label="Memory GB" name="memory_gb" type="number" step="0.25" min="0.25" defaultValue="1" required />
      <TextField label="vCPU / second" name="vcpu_price_per_second" type="number" step="0.000000001" min="0" required />
      <TextField label="Memory GB / second" name="memory_gb_price_per_second" type="number" step="0.000000001" min="0" required />
    </RuntimeForm>
  );
}

function ComputeCard({ row, onDeprecate, pending }: Readonly<{ row: ComputePricing; onDeprecate: () => void; pending: boolean }>) {
  return (
    <PriceCard
      icon={<Cpu size={20} />}
      title={row.display_name}
      subtitle={row.profile_key}
      status={row.status}
      action={{ label: "Deprecate", onClick: onDeprecate, pending, variant: "danger" }}
    >
      <Metric label="vCPU/sec" value={formatUsdRate(row.vcpu_price_per_second)} />
      <Metric label="Memory GB/sec" value={formatUsdRate(row.memory_gb_price_per_second)} />
      <Metric label="vCPU count" value={metadataString(row.metadata_json.vcpu, "1")} />
      <Metric label="Memory GB" value={metadataString(row.metadata_json.memory_gb, "1")} />
      <Metric label="Version" value={String(row.version)} />
      <Metric label="Image" value={row.runtime_image ?? "not pinned"} />
    </PriceCard>
  );
}

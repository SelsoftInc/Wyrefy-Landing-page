"use client";

import { Check, Save, Trash2 } from "lucide-react";
import { useState } from "react";
import type { } from "react";
import { createPortal } from "react-dom";

import { Button } from "@/src/components/ui/button";
import { SearchableSelectField, type SearchableSelectOption, TextField } from "@/src/components/ui/form-field";
import type { Plan } from "@/src/features/auth/types";

function dollars(value: number | undefined) {
  return value === undefined ? "" : (value / 100).toFixed(2);
}

function limitString(value: unknown, fallback = "") {
  return typeof value === "string" || typeof value === "number" ? String(value) : fallback;
}

const usdFormatter = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

function money(value: number) {
  return usdFormatter.format(value / 100);
}

export type PlanSectionProps = Readonly<{
  title: string;
  buttonLabel: string;
  plans: Plan[];
  showForm: boolean;
  editingPlan: Plan | null;
  onAdd: () => void;
  onCancel: () => void;
  onEdit?: (plan: Plan) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onArchive: (id: string) => void;
  archivePendingId?: string;
  pending: boolean;
  mode: "individual" | "organization";
  computeProfileOptions: SearchableSelectOption[];
}>;

export function PlanSection(props: PlanSectionProps) {
  return (
    <div className="space-y-5">
      <div className="flex justify-end"><Button onClick={props.onAdd}>{props.buttonLabel}</Button></div>
      {props.showForm ? <PlanForm key={props.editingPlan?.id ?? "new"} {...props} /> : null}
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {props.plans.map((plan) => <PlanCard key={plan.slug} plan={plan} onEdit={props.onEdit} onArchive={props.onArchive} archivePendingId={props.archivePendingId} />)}
      </div>
    </div>
  );
}

function PlanForm(props: PlanSectionProps) {
  const plan = props.editingPlan;
  const [selectedComputeProfile, setSelectedComputeProfile] = useState(limitString(plan?.limits_json.compute_profile_key));

  const content = (
    <dialog
      open
      aria-label={plan ? "Edit Plan" : props.buttonLabel}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-white/40 dark:bg-black/60 p-4 backdrop-blur-sm border-none m-0 w-full h-full max-w-none max-h-none overflow-hidden"
    >
      <button
        type="button"
        aria-label="Close dialog"
        onClick={props.onCancel}
        className="absolute inset-0 w-full h-full bg-transparent border-none appearance-none cursor-default"
      />
      <div className="glass-panel relative z-10 flex flex-col w-full max-w-lg max-h-[90vh] rounded-[2rem] shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between p-6 pb-4 border-b border-[var(--border)]/50 shrink-0">
          <h2 className="text-xl font-semibold">{plan ? "Edit Plan" : props.buttonLabel}</h2>
          <Button variant="ghost" onClick={props.onCancel}>Cancel</Button>
        </div>
        <div data-lenis-prevent="true" className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-6">
          <form onSubmit={props.onSubmit} className="flex flex-col gap-4">
          <TextField label={props.mode === "organization" ? "Organization plan name" : "Plan name"} name="name" defaultValue={plan?.name} placeholder="Starter" required />
          <TextField label="Price in dollars" name="price" type="number" step="0.01" min="0" defaultValue={dollars(plan?.price_cents)} placeholder="9.99" required />
          <TextField label="Project limit" name="projects" type="number" min="1" defaultValue={String(plan?.limits_json.projects ?? "")} placeholder="5" required />
          <TextField label="Included credits" name="included_credits" type="number" min="0" defaultValue={String(plan?.included_credits ?? "")} placeholder="250" required />
          <TextField label="Runtime margin %" name="runtime_margin_percent" type="number" min="0" step="0.01" defaultValue={limitString(plan?.limits_json.runtime_margin_percent, "0")} placeholder="50" required />
          <SearchableSelectField
            label="Compute profile key"
            name="compute_profile_key"
            options={props.computeProfileOptions}
            value={selectedComputeProfile}
            onChange={setSelectedComputeProfile}
            placeholder="Select compute profile"
            emptyMessage="No compute profiles available. Create a runtime compute profile first."
            required
          />
          {props.mode === "organization" ? <TextField label="Team members" name="team_members" type="number" min="1" defaultValue={String(plan?.limits_json.team_members ?? "")} placeholder="8" required /> : null}
          <Button type="submit" className="mt-4 h-12" loading={props.pending} icon={<Save size={18} />}>
            {plan ? "Update Plan" : "Save Plan"}
          </Button>
          </form>
        </div>
      </div>
    </dialog>
  );

  return typeof document !== "undefined" ? createPortal(content, document.body) : null;
}

function PlanCard({ plan, onEdit, onArchive, archivePendingId }: Readonly<{ plan: Plan; onEdit?: (plan: Plan) => void; onArchive: (id: string) => void; archivePendingId?: string }>) {
  return (
    <div className="group relative flex flex-col rounded-[2rem] border border-[var(--border)]/50 bg-[var(--background)]/40 p-8 shadow-xl backdrop-blur-2xl transition-all duration-500 hover:-translate-y-2 hover:border-[var(--accent)] hover:shadow-[0_0_40px_rgba(37,99,235,0.1)]">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-[var(--foreground)]">{plan.name}</h3>
        <div className="mt-2 flex items-baseline gap-1">
          <span className="text-4xl font-bold tracking-tight text-[var(--foreground)]">{money(plan.price_cents)}</span>
          <span className="text-sm font-medium text-[var(--muted)]">/m</span>
        </div>
      </div>
      <div className="mb-8 flex-1 space-y-4">
        <PlanFeature label={`${plan.tenant_type === "individual" ? "User" : "Organization"} account`} />
        <PlanFeature label={`${String(plan.limits_json.projects ?? 0)} projects`} />
        <PlanFeature label={`${String(plan.limits_json.credits ?? plan.included_credits)} credits`} />
        {plan.limits_json.team_members ? <PlanFeature label={`${String(plan.limits_json.team_members)} team seats`} /> : null}
      </div>
      <div className="mt-auto flex flex-col gap-2">
        {onEdit ? <Button variant="secondary" onClick={() => onEdit(plan)} className="w-full">Edit Plan</Button> : null}
        {plan.id ? <Button variant="danger" onClick={() => onArchive(plan.id!)} className="w-full" loading={archivePendingId === plan.id} icon={<Trash2 size={16} />}>Archive Plan</Button> : null}
      </div>
    </div>
  );
}

function PlanFeature({ label }: Readonly<{ label: string }>) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[var(--foreground)]/10 text-[var(--foreground)]">
        <Check size={12} strokeWidth={3} />
      </div>
      <span className="text-sm font-medium text-[var(--foreground)]">{label}</span>
    </div>
  );
}

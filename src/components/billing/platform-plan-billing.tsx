"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import type { } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { RuntimePricingManager } from "@/src/components/billing/runtime-pricing-manager";
import { PlanSection } from "@/src/components/billing/platform-plan-billing-sections";
import type { SearchableSelectOption } from "@/src/components/ui/form-field";
import { clearOrganizationCreationDraft, readOrganizationCreationDraft, writeOrganizationCreationDraft } from "@/src/features/admin-ops/platform-admin-drafts";
import { computePricing } from "@/src/features/admin-ops/api";
import { adminPlans, archivePlan, updatePlan, upsertPlan } from "@/src/features/auth/api";
import type { Plan } from "@/src/features/auth/types";
import { apiRequest } from "@/src/shared/api-client";
import { formString } from "@/src/shared/form-data";
import { slugify } from "@/src/shared/slugify";

const tabs = ["Plan manager", "Organization plans", "Runtime pricing"] as const;

type PlanTab = (typeof tabs)[number];

function cents(value: FormDataEntryValue | null) {
  return Math.round(Number(value || 0) * 100);
}

function createOrganizationPlan(payload: Omit<Plan, "id" | "tenant_type" | "status" | "is_public" | "organization_id">) {
  return apiRequest<Plan, typeof payload>("/admin/organization-plans", { method: "POST", body: payload });
}

function computeProfileOptions(rows: Array<{ profile_key: string; display_name: string; status: string }> | undefined): SearchableSelectOption[] {
  if (!rows) return [];
  const rankedRows = [...rows].sort((left, right) => {
    if (left.status === right.status) return left.display_name.localeCompare(right.display_name);
    if (left.status === "active") return -1;
    if (right.status === "active") return 1;
    return left.display_name.localeCompare(right.display_name);
  });
  const seen = new Set<string>();
  return rankedRows.flatMap((row) => {
    if (seen.has(row.profile_key)) return [];
    seen.add(row.profile_key);
    return [{ value: row.profile_key, label: row.display_name, description: row.profile_key }];
  });
}

export function PlatformPlanBilling() {
  const searchParams = useSearchParams();
  const createPlanIntent = searchParams?.get("createPlan");
  const returnTo = searchParams?.get("returnTo");
  const [tab, setTab] = useState<PlanTab>(createPlanIntent === "organization" ? "Organization plans" : "Plan manager");
  const computeRows = useQuery({ queryKey: ["runtime-compute-pricing"], queryFn: computePricing });
  const profileOptions = useMemo(() => computeProfileOptions(computeRows.data), [computeRows.data]);

  return (
    <div className="space-y-5">
      <div className="flex justify-center">
        <div className="glass-card inline-flex gap-2 rounded-3xl p-2">
          {tabs.map((item) => (
            <button
              type="button"
              key={item}
              onClick={() => setTab(item)}
              className={`min-w-[160px] px-6 rounded-2xl py-3 text-sm font-medium transition-all ${tab === item ? "bg-[var(--accent)] text-white shadow-sm" : "text-[var(--muted)] hover:bg-[var(--surface)] hover:text-[var(--foreground)]"}`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>
      {tab === "Plan manager" ? <IndividualPlanManager computeProfileOptions={profileOptions} /> : null}
      {tab === "Organization plans" ? <OrganizationPlanManager autoOpenCreate={createPlanIntent === "organization"} computeProfileOptions={profileOptions} returnTo={returnTo} /> : null}
      {tab === "Runtime pricing" ? <RuntimePricingManager /> : null}
    </div>
  );
}

function IndividualPlanManager({ computeProfileOptions }: Readonly<{ computeProfileOptions: SearchableSelectOption[] }>) {
  const [showForm, setShowForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const queryClient = useQueryClient();
  const plans = useQuery({ queryKey: ["admin-plans", "individual"], queryFn: () => adminPlans("public", "individual") });
  const create = useMutation({
    mutationFn: upsertPlan,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-plans", "individual"] });
      setShowForm(false);
      setEditingPlan(null);
    },
  });
  const edit = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<Omit<Plan, "id">> }) => updatePlan(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-plans", "individual"] });
      setShowForm(false);
      setEditingPlan(null);
    },
  });
  const archive = useMutation({ mutationFn: archivePlan, onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-plans", "individual"] }) });

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const name = formString(data, "name");
    const payload = {
      name,
      slug: slugify(name),
      tenant_type: "individual",
      price_cents: cents(data.get("price")),
      billing_interval: "monthly",
      included_credits: formString(data, "included_credits"),
      status: "active",
      is_public: true,
      organization_id: null,
      limits_json: {
        projects: Number(formString(data, "projects")),
        credits: Number(formString(data, "included_credits")),
        runtime_margin_percent: Number(formString(data, "runtime_margin_percent", "0")),
        compute_profile_key: formString(data, "compute_profile_key"),
      },
    };
    if (editingPlan?.id) {
      await edit.mutateAsync({ id: editingPlan.id, payload });
    } else {
      await create.mutateAsync(payload);
    }
    form.reset();
  }

  return (
    <PlanSection
      title="User plans"
      buttonLabel="Create New Plan"
      plans={plans.data ?? []}
      showForm={showForm}
      editingPlan={editingPlan}
      onAdd={() => {
        setEditingPlan(null);
        setShowForm(true);
      }}
      onCancel={() => setShowForm(false)}
      onEdit={(plan) => {
        setEditingPlan(plan);
        setShowForm(true);
      }}
      onSubmit={onSubmit}
      onArchive={(id) => archive.mutate(id)}
      archivePendingId={archive.variables}
      pending={create.isPending || edit.isPending}
      mode="individual"
      computeProfileOptions={computeProfileOptions}
    />
  );
}

function OrganizationPlanManager({
  autoOpenCreate,
  computeProfileOptions,
  returnTo,
}: Readonly<{
  autoOpenCreate: boolean;
  computeProfileOptions: SearchableSelectOption[];
  returnTo: string | null;
}>) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(autoOpenCreate);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const queryClient = useQueryClient();
  const plans = useQuery({ queryKey: ["admin-plans", "organization"], queryFn: () => adminPlans("public", "organization") });
  const create = useMutation({
    mutationFn: createOrganizationPlan,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-plans", "organization"] });
      setShowForm(false);
      setEditingPlan(null);
    },
  });
  const edit = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<Omit<Plan, "id">> }) => updatePlan(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-plans", "organization"] });
      setShowForm(false);
      setEditingPlan(null);
    },
  });
  const archive = useMutation({ mutationFn: archivePlan, onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-plans", "organization"] }) });

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const name = formString(data, "name");
    const payload = {
      name,
      slug: slugify(name),
      price_cents: cents(data.get("price")),
      billing_interval: "monthly",
      included_credits: formString(data, "included_credits"),
      limits_json: {
        projects: Number(formString(data, "projects")),
        credits: Number(formString(data, "included_credits")),
        team_members: Number(formString(data, "team_members")),
        runtime_margin_percent: Number(formString(data, "runtime_margin_percent", "0")),
        compute_profile_key: formString(data, "compute_profile_key"),
      },
    };
    if (editingPlan?.id) {
      await edit.mutateAsync({ id: editingPlan.id, payload });
    } else {
      const createdPlan = await create.mutateAsync(payload);
      if (returnTo) {
        const draft = readOrganizationCreationDraft();
        if (draft) {
          writeOrganizationCreationDraft({ ...draft, plan_slug: createdPlan.slug });
        } else {
          clearOrganizationCreationDraft();
        }
        router.push(returnTo);
        return;
      }
    }
    form.reset();
  }

  return (
    <PlanSection
      title="Organization plans"
      buttonLabel="Create Organization Plan"
      plans={plans.data ?? []}
      showForm={showForm}
      editingPlan={editingPlan}
      onAdd={() => {
        setEditingPlan(null);
        setShowForm(true);
      }}
      onCancel={() => setShowForm(false)}
      onEdit={(plan) => {
        setEditingPlan(plan);
        setShowForm(true);
      }}
      onSubmit={onSubmit}
      onArchive={(id) => archive.mutate(id)}
      archivePendingId={archive.variables}
      pending={create.isPending || edit.isPending}
      mode="organization"
      computeProfileOptions={computeProfileOptions}
    />
  );
}

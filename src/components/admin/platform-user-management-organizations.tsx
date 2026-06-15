"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Building2, Plus } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import {  useMemo, useState } from "react";
import { createPortal } from "react-dom";

import { Button } from "@/src/components/ui/button";
import { DataTable } from "@/src/components/ui/data-table";
import { SelectField, TextField } from "@/src/components/ui/form-field";
import { clearOrganizationCreationDraft, emptyOrganizationCreationDraft, readOrganizationCreationDraft, writeOrganizationCreationDraft, type OrganizationCreationDraft } from "@/src/features/admin-ops/platform-admin-drafts";
import { adminOrganizations, adminPlans, createOrganization, deleteOrganization } from "@/src/features/auth/api";
import type { AdminOrganization } from "@/src/features/auth/types";
import { formString } from "@/src/shared/form-data";
import { slugify } from "@/src/shared/slugify";

import { AdminActionMenu, formatComputeUsage, formatCount, formatCredits } from "./platform-user-management-shared";

const PLAN_BILLING_RETURN_PATH = "/platform_admin/user-management?resumeOrgDraft=1";

export function PlatformOrganizationsSection({ onSelect }: Readonly<{ onSelect: (organization: AdminOrganization) => void }>) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const storedDraft = readOrganizationCreationDraft();
  const shouldResumeDraft = searchParams?.get("resumeOrgDraft") === "1";
  const [showForm, setShowForm] = useState(shouldResumeDraft && storedDraft !== null);
  const [draft, setDraft] = useState<OrganizationCreationDraft>(storedDraft ?? emptyOrganizationCreationDraft());
  const organizations = useQuery({ queryKey: ["admin-organizations"], queryFn: adminOrganizations });
  const plans = useQuery({ queryKey: ["admin-plans", "organization"], queryFn: () => adminPlans("public", "organization") });
  const create = useMutation({
    mutationFn: createOrganization,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-organizations"] }),
  });
  const remove = useMutation({
    mutationFn: deleteOrganization,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-organizations"] }),
  });

  const defaultPlanSlug = plans.data?.[0]?.slug ?? "";
  const organizationRows = organizations.data ?? [];
  const hydratedDraft = useMemo(() => {
    if (draft.plan_slug || !defaultPlanSlug) return draft;
    return { ...draft, plan_slug: defaultPlanSlug };
  }, [defaultPlanSlug, draft]);

  function updateDraft<K extends keyof OrganizationCreationDraft>(key: K, value: OrganizationCreationDraft[K]) {
    setDraft((currentDraft) => ({ ...currentDraft, [key]: value }));
  }

  function resetDraft() {
    clearOrganizationCreationDraft();
    setDraft({ ...emptyOrganizationCreationDraft(), plan_slug: defaultPlanSlug });
  }

  function closeForm() {
    resetDraft();
    setShowForm(false);
  }

  function createPlanFromDraft() {
    writeOrganizationCreationDraft(hydratedDraft);
    router.push(`/platform_admin/plan-billing?createPlan=organization&returnTo=${encodeURIComponent(PLAN_BILLING_RETURN_PATH)}`);
  }

  function confirmOrganizationDelete(organization: AdminOrganization) {
    return globalThis.confirm(`Delete organization ${organization.name}? This action cannot be undone.`);
  }

  async function onCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await create.mutateAsync({
      name: hydratedDraft.name,
      slug: slugify(hydratedDraft.name),
      allowed_email_domain: hydratedDraft.allowed_email_domain,
      admin_email: hydratedDraft.admin_email,
      admin_full_name: hydratedDraft.admin_full_name,
      plan_slug: hydratedDraft.plan_slug || formString(new FormData(event.currentTarget), "plan_slug"),
    });
    closeForm();
  }

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <Button onClick={() => setShowForm(true)} icon={<Plus size={18} />}>Create Organization</Button>
      </div>
      {showForm && typeof document !== "undefined" ? createPortal(
        <dialog
          open
          aria-label="Create Organization"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-white/40 dark:bg-black/60 p-4 backdrop-blur-sm border-none m-0 w-full h-full max-w-none max-h-none overflow-hidden"
        >
          <button
            type="button"
            aria-label="Close dialog"
            onClick={closeForm}
            className="absolute inset-0 w-full h-full bg-transparent border-none appearance-none cursor-default"
          />
          <div className="glass-panel relative z-10 flex flex-col w-full max-w-lg max-h-[90vh] rounded-[2rem] shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-6 pb-4 border-b border-[var(--border)]/50 shrink-0">
              <h2 className="text-xl font-semibold">Create Organization</h2>
              <Button variant="ghost" onClick={closeForm}>Cancel</Button>
            </div>
            <div data-lenis-prevent="true" className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-6">
            <form onSubmit={onCreate} className="flex flex-col gap-4">
              <TextField label="Organization name" name="name" value={hydratedDraft.name} onChange={(event) => updateDraft("name", event.target.value)} placeholder="Organization name" required />
              <TextField label="Allowed email domain" name="allowed_email_domain" value={hydratedDraft.allowed_email_domain} onChange={(event) => updateDraft("allowed_email_domain", event.target.value)} placeholder="company.com" required />
              <TextField label="Admin full name" name="admin_full_name" value={hydratedDraft.admin_full_name} onChange={(event) => updateDraft("admin_full_name", event.target.value)} placeholder="Admin full name" required />
              <TextField label="Admin email" name="admin_email" type="email" value={hydratedDraft.admin_email} onChange={(event) => updateDraft("admin_email", event.target.value)} placeholder="admin@company.com" required />
              <div className="space-y-2">
                <SelectField label="Attached plan" name="plan_slug" value={hydratedDraft.plan_slug} onChange={(event) => updateDraft("plan_slug", event.target.value)} required>
                  {(plans.data ?? []).map((plan) => (
                    <option key={plan.slug} value={plan.slug}>{plan.name}</option>
                  ))}
                </SelectField>
                <div className="flex justify-end">
                  <button type="button" onClick={createPlanFromDraft} className="text-xs font-medium uppercase tracking-widest text-[var(--accent)] hover:underline">
                    Create plan
                  </button>
                </div>
              </div>
              <Button type="submit" className="h-12 mt-2" loading={create.isPending} icon={<Building2 size={18} />}>
                Create Organization
              </Button>
              </form>
            </div>
          </div>
        </dialog>,
        document.body
      ) : null}
      <DataTable headers={["Name", "Plan", "Credits (Used/Left)", "Projects (Active/Left)", "Token Usage", "Compute Usage", "Status", "Actions"]}>
        {organizationRows.map((organization) => (
          <tr key={organization.id} className="border-t border-[var(--border)] transition-colors hover:bg-[var(--surface)]/10 cursor-pointer group text-[var(--foreground)] hover:text-[var(--accent)]" onClick={() => onSelect(organization)}>
            <td className="transition-all hover:bg-[var(--accent)]/5">
              <div className="flex flex-col whitespace-nowrap">
                <span className="font-medium text-inherit transition-colors">{organization.name}</span>
                <span className="text-[10px] uppercase tracking-wider text-[var(--muted)] group-hover:text-[var(--accent)]/70 transition-colors">{organization.allowed_email_domain}</span>
              </div>
            </td>
            <td>
              <span className="inline-flex items-center rounded-full bg-[var(--surface)]/40 px-2 py-0.5 text-xs font-medium border border-[var(--border)] text-inherit transition-colors">
                {organization.plan ?? "No plan"}
              </span>
            </td>
            <td>
              <span className="font-medium text-inherit transition-colors">
                {formatCredits(organization.credits_used)} <span className="text-[var(--muted)] group-hover:text-[var(--accent)]/70 mx-0.5 transition-colors">/</span> {formatCredits(organization.credits_remaining)}
              </span>
            </td>
            <td>
              <span className="font-medium text-inherit transition-colors">
                {formatCount(organization.project_count)} <span className="text-[var(--muted)] group-hover:text-[var(--accent)]/70 mx-0.5 transition-colors">/</span> {formatCount(organization.projects_remaining)}
              </span>
            </td>
            <td className="font-mono text-sm font-semibold text-inherit transition-colors">{formatCount(organization.token_usage)}</td>
            <td>{formatComputeUsage(organization.compute_usage)}</td>
            <td>{organization.status}</td>
            <td onClick={(e) => e.stopPropagation()}>
              <AdminActionMenu
                ariaLabel={`Organization actions for ${organization.name}`}
                actions={[
                  {
                    label: "Delete organization",
                    destructive: true,
                    onClick: () => {
                      if (confirmOrganizationDelete(organization)) {
                        remove.mutate(organization.id);
                      }
                    },
                  },
                ]}
              />
            </td>
          </tr>
        ))}
      </DataTable>
    </div>
  );
}

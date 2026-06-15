"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BriefcaseBusiness,
  Plus,
  Users,
  Zap,
  ShieldCheck,
  Wallet,
  ArrowUpRight
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/src/components/ui/button";
import { GlareCard } from "@/src/components/ui/glare-card";
import {
  currentOrganization,
  organizationMembers,
  projects,
  organizationBillingSummary,
} from "@/src/features/auth/api";
import { queryKeys } from "@/src/features/query-keys";
import { useAuthStore } from "@/src/features/auth/store";
import { MetricCard } from "@/src/components/dashboard/dashboard-metric-card";
import { ForgeModal } from "@/src/components/project/project-forge-modal";
import { compactNumber } from "@/src/shared/formatters";
import { SectionLoading } from "@/src/components/ui/loading-states";
import type { Project } from "@/src/features/auth/types";

export function OrganizationDashboardPage() {
  const queryClient = useQueryClient();
  const { push } = useRouter();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const userId = useAuthStore((state) => state.user?.id);

  const organization = useQuery({ queryKey: queryKeys.currentOrganization(userId ?? ""), queryFn: currentOrganization, enabled: Boolean(userId) });
  const organizationId = organization.data?.id;
  const membersKey = organizationId ? queryKeys.organizationMembers(organizationId) : ["organization-members", "idle"] as const;
  const projectsKey = organizationId ? queryKeys.projectList("organization", organizationId) : ["projects", "organization", "idle"] as const;
  const billingKey = organizationId ? queryKeys.billingSummary("organization", organizationId) : ["billing-summary", "organization", "idle"] as const;
  const members = useQuery({ queryKey: membersKey, queryFn: organizationMembers, enabled: Boolean(organizationId) });
  const projectList = useQuery({ queryKey: projectsKey, queryFn: projects, enabled: Boolean(organizationId) });
  const billing = useQuery({ queryKey: billingKey, queryFn: organizationBillingSummary, enabled: Boolean(organizationId) });

  const handleForgeSuccess = async (project: Project) => {
    setShowCreateModal(false);
    await queryClient.invalidateQueries({ queryKey: projectsKey });
    push(`/organization/projects/${project.id}`);
  };

  const isLoading = !userId || organization.isLoading || members.isLoading || projectList.isLoading || billing.isLoading;

  if (isLoading) {
    return <SectionLoading label="Synthesizing your workspace intelligence" />;
  }

  return (
    <div className="space-y-8 animate-page-enter p-4">
      <style>{`
        @keyframes dash { to { stroke-dashoffset: 0; } }
        .animate-draw { stroke-dasharray: 1000; stroke-dashoffset: 1000; animation: dash 2.5s cubic-bezier(0.4, 0, 0.2, 1) forwards; }
      `}</style>

      <div className="flex flex-col md:flex-row md:items-center justify-end gap-6 mb-6">
        <div className="flex gap-3">
          <Link href="/organization/projects" className="flex items-center justify-center rounded-2xl h-14 px-8 border border-white/10 bg-[var(--surface)] text-[var(--foreground)] font-medium shadow-lg hover:bg-[var(--foreground)] hover:text-[var(--background)] hover:-translate-y-0.5 transition-all text-sm">
            Workspace
          </Link>
          <Button onClick={() => setShowCreateModal(true)} icon={<Plus size={20} />} className="!rounded-2xl h-14 px-8 bg-gradient-to-br from-blue-600 to-blue-700 shadow-2xl shadow-blue-500/20 text-white font-medium">
            New Project
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Active Projects" value={String(projectList.data?.length ?? 0)} change="Operational" icon={BriefcaseBusiness} color="text-blue-400" chartData={[20, 45, 30, 60, 40, 75, 65]} />
        <MetricCard label="Team Members" value={String(members.data?.length ?? 0)} change="Synced" icon={Users} color="text-blue-400" chartData={[10, 20, 15, 25, 18, 30, 28]} />
        <MetricCard label="Lifetime Usage" value={`${compactNumber(billing.data?.lifetime_used_credits ?? "0")} CR`} change="All Time" icon={Zap} color="text-amber-400" chartData={[10, 15, 20, 30, 45, 60, 85]} />
        <MetricCard label="Credit Balance" value={billing.data?.credit_balance ?? "0"} change={billing.data?.plan_name?.toUpperCase() ?? "LIFETIME"} icon={ShieldCheck} color="text-emerald-400" chartData={[100, 95, 98, 92, 94, 88, 90]} />
      </div>

      <section className="mt-2 flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-12 rounded-[1rem] bg-blue-500/10 flex items-center justify-center text-blue-500">
              <BriefcaseBusiness size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-[var(--foreground)] tracking-tight">Recent Projects</h2>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted)]">Quick access to your workspace</p>
            </div>
          </div>
          {projectList.data && projectList.data.length > 0 && (
            <Link href="/organization/projects" className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-widest text-[var(--muted)] hover:text-blue-500 transition-colors">
              View All <ArrowUpRight size={14} />
            </Link>
          )}
        </div>

        {projectList.data && projectList.data.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {projectList.data.slice(0, 16).map((p) => (
              <Link key={p.id} href={`/organization/projects/${p.id}`} className="block h-full group">
                <GlareCard
                  className="rounded-[1.5rem] h-full flex flex-col bg-[var(--surface)] border border-[var(--border)] shadow-sm p-6"
                >
                  <div className="flex items-start justify-between z-10 relative">
                    <div className="size-12 rounded-full bg-[var(--muted)]/10 flex items-center justify-center border border-[var(--border)]">
                      <BriefcaseBusiness size={20} className="text-blue-500" />
                    </div>
                  </div>

                  <div className="mt-6 mb-6 flex-1 z-10 relative w-full min-w-0">
                    <h3 className="text-[22px] leading-snug font-medium text-[var(--foreground)] line-clamp-2 break-words tracking-tight" title={p.name}>{p.name}</h3>
                  </div>

                  <div className="flex items-center justify-between pt-5 border-t border-[var(--border)] z-10 relative">
                    <div className="flex items-center gap-2 text-[var(--muted)]">
                      <Wallet size={14} className="text-amber-500 fill-amber-500/20" />
                      <span className="text-[9px] font-bold uppercase tracking-widest">Credits</span>
                    </div>
                    <span className="text-[11px] font-medium text-[var(--foreground)] uppercase tracking-wider">
                      {compactNumber(p.credit_used)} CR
                    </span>
                  </div>
                </GlareCard>
              </Link>
            ))}
          </div>
        ) : (
          <div className="glass-panel flex flex-col items-center justify-center py-20 text-center rounded-[2.5rem] border border-dashed border-[var(--border)] shadow-none">
            <div className="size-20 mb-6 rounded-full bg-[var(--surface)] flex items-center justify-center text-[var(--muted)] opacity-30">
              <BriefcaseBusiness size={40} />
            </div>
            <h3 className="text-xl font-semibold text-[var(--foreground)] tracking-tight">No projects yet</h3>
            <p className="text-sm font-medium text-[var(--muted)] mt-2 max-w-sm mx-auto leading-relaxed">
              Your team hasn&apos;t created any projects. Start building to see your recent projects grid here.
            </p>
            <Button onClick={() => push('/organization/projects')} icon={<Plus size={18} />} className="mt-8 !rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 text-white font-medium hover:scale-105 transition-transform shadow-lg shadow-blue-500/20">
              Create First Project
            </Button>
          </div>
        )}
      </section>

      {showCreateModal && <ForgeModal onClose={() => setShowCreateModal(false)} onSuccess={handleForgeSuccess} />}
    </div>
  );
}

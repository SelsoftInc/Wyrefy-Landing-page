"use client";

import { useQuery } from "@tanstack/react-query";
import { Activity, ArrowUpRight, BriefcaseBusiness, FolderKanban, Plus, Sparkles, Wallet } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MetricCard } from "@/src/components/dashboard/dashboard-metric-card";
import { SectionLoading } from "@/src/components/ui/loading-states";
import { billingSummary, projectLimits, projects } from "@/src/features/auth/api";
import { queryKeys } from "@/src/features/query-keys";
import { useAuthStore } from "@/src/features/auth/store";
import { formatCredits, compactNumber } from "@/src/shared/formatters";
import { Button } from "@/src/components/ui/button";
import { GlareCard } from "@/src/components/ui/glare-card";
export default function DashboardPage() {
  const { push } = useRouter();
  const user = useAuthStore((state) => state.user);

  const billing = useQuery({ queryKey: queryKeys.billingSummary("individual", user?.id ?? ""), queryFn: billingSummary, enabled: Boolean(user) });
  const projectList = useQuery({ queryKey: queryKeys.projectList("individual", user?.id ?? ""), queryFn: projects, enabled: Boolean(user) });
  const limits = useQuery({ queryKey: queryKeys.projectLimits("individual", user?.id ?? ""), queryFn: projectLimits, enabled: Boolean(user) });

  if (!user || billing.isLoading || projectList.isLoading || limits.isLoading) {
    return <SectionLoading label="Synthesizing your workspace intelligence" />;
  }


  const summary = billing.data;
  const projectsData = projectList.data ?? [];
  const limitsData = limits.data;

  // Derive some stats
  const totalCreditsUsed = projectsData.reduce((acc, p) => acc + Number(p.credit_used || 0), 0);
  const activeProjectsCount = limitsData?.active_projects ?? 0;
  const maxProjectsCount = limitsData?.max_projects ?? 0;
  const balance = Number(summary?.credit_balance || 0);

  return (
    <div className="space-y-6 animate-page-enter">
      {/* Welcome & Global Posture */}
      <section className="glass-panel relative overflow-hidden rounded-[2.5rem] p-8 shadow-2xl">
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-8">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex size-10 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400">
                <Sparkles size={20} />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--muted)]">Personal Cockpit</p>
            </div>
            <h1 className="text-4xl font-semibold tracking-tight text-[var(--foreground)]">
              Welcome back, <span className="text-blue-400">{user?.full_name?.split(" ")[0]}</span>
            </h1>

          </div>
          
          <div className="flex gap-4">
            <div className="glass-card flex flex-col items-center justify-center rounded-3xl p-6 min-w-[140px] border-blue-500/20">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted)]">Subscription</p>
              <p className="mt-2 text-xl font-semibold uppercase tracking-tighter text-blue-400">{summary?.plan_name || "Free Tier"}</p>
            </div>
            <div className="glass-card flex flex-col items-center justify-center rounded-3xl p-6 min-w-[140px]">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted)]">Status</p>
              <p className="mt-2 text-xl font-semibold uppercase tracking-tighter text-emerald-400">Active</p>
            </div>
          </div>
        </div>
        <div className="absolute -right-20 -top-20 size-96 rounded-full bg-blue-600/5 blur-[120px]" />
      </section>

      {/* Primary Metrics Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <MetricCard 
          label="Credit Balance" 
          value={formatCredits(balance)} 
          change="Available" 
          icon={Wallet} 
          color="text-blue-400" 
          chartData={[20, 40, 30, 50, 40, 60, 55]}
        />
        <MetricCard 
          label="Active Projects" 
          value={`${activeProjectsCount}/${maxProjectsCount || '∞'}`} 
          change="Capacity" 
          icon={FolderKanban} 
          color="text-blue-400" 
          chartData={[10, 20, 15, 25, 30, 28, 35]}
        />
        <MetricCard 
          label="Total Consumption" 
          value={totalCreditsUsed.toLocaleString()} 
          change="Used" 
          icon={Activity} 
          color="text-emerald-400" 
          chartData={[5, 15, 25, 20, 35, 45, 50]}
        />
      </div>

      {/* Recent Projects Grid */}
      <section className="mt-6 flex flex-col gap-6">
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
          {projectsData && projectsData.length > 0 && (
            <Link href="/individual/projects" className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-widest text-[var(--muted)] hover:text-blue-500 transition-colors">
              View All <ArrowUpRight size={14} />
            </Link>
          )}
        </div>

        {projectsData && projectsData.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {projectsData.slice(0, 16).map((p) => (
              <Link key={p.id} href={`/individual/projects/${p.id}`} className="block h-full group">
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
              You haven&apos;t created any projects. Start building to see your recent projects grid here.
            </p>
            <Button onClick={() => push('/individual/projects')} icon={<Plus size={18} />} className="mt-8 !rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 text-white font-medium hover:scale-105 transition-transform shadow-lg shadow-blue-500/20">
              Create First Project
            </Button>
          </div>
        )}
      </section>
    </div>
  );
}


"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Rocket,
  Plus
} from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  currentOrganization,
  projectLimits,
  projects,
} from "@/src/features/auth/api";
import type { Project } from "@/src/features/auth/types";
import { queryKeys } from "@/src/features/query-keys";
import { useAuthStore } from "@/src/features/auth/store";
import { LimitCard } from "@/src/components/project/project-limit-card";
import { LibraryView } from "@/src/components/project/project-library";

import { ForgeModal } from "@/src/components/project/project-forge-modal";
import { Button } from "@/src/components/ui/button";
import { SectionLoading } from "@/src/components/ui/loading-states";
import { CardSpotlight } from "@/src/components/ui/card-spotlight";

type ProjectWorkspaceProps = Readonly<{
  tenantLabel: "individual" | "organization";
}>;

export function ProjectWorkspace({ tenantLabel }: ProjectWorkspaceProps) {
  const queryClient = useQueryClient();
  const { push } = useRouter();
  const [showForge, setShowForge] = useState(false);
  const userId = useAuthStore((state) => state.user?.id);
  const organization = useQuery({
    queryKey: queryKeys.currentOrganization(userId ?? ""),
    queryFn: currentOrganization,
    enabled: tenantLabel === "organization" && Boolean(userId),
  });
  const scopeId = tenantLabel === "organization" ? organization.data?.id : userId;
  const projectListKey = scopeId ? queryKeys.projectList(tenantLabel, scopeId) : ["projects", tenantLabel, "pending"] as const;
  const projectLimitsKey = scopeId ? queryKeys.projectLimits(tenantLabel, scopeId) : ["project-limits", tenantLabel, "pending"] as const;

  const projectList = useQuery({ queryKey: projectListKey, queryFn: projects, enabled: Boolean(scopeId) });
  const limits = useQuery({ queryKey: projectLimitsKey, queryFn: projectLimits, enabled: Boolean(scopeId) });

  const selectProject = (id: string) => {
    push(`/${tenantLabel}/projects/${id}`);
  };

  if (!userId || (tenantLabel === "organization" && organization.isLoading)) {
    return <SectionLoading label="Loading projects" />;
  }

  const handleForgeSuccess = async (project: Project) => {
    if (!scopeId) return;
    queryClient.setQueryData(queryKeys.projectList(tenantLabel, scopeId), (old: Project[] | undefined) => {
      return old ? [project, ...old] : [project];
    });

    setShowForge(false);

    push(`/${tenantLabel}/projects/${project.id}`);

    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.projectList(tenantLabel, scopeId) }),
      queryClient.invalidateQueries({ queryKey: queryKeys.projectLimits(tenantLabel, scopeId) }),
    ]);
  };

  return (
    <div className="flex w-full flex-col gap-8 animate-page-enter pb-12">
      <div className="flex flex-col justify-end gap-4 md:flex-row md:items-center">
        <Button
          onClick={() => setShowForge(true)}
          icon={<Plus size={16} />}
          className="!w-auto !rounded-xl h-11 bg-blue-600 px-6 text-[10px] font-bold uppercase tracking-widest text-white shadow-xl shadow-blue-500/20 hover:bg-blue-700"
        >
          Forge New Project
        </Button>
      </div>

      <div className="flex flex-col gap-8 xl:flex-row">
        <div className="min-w-0 flex-1">
          <LibraryView
            projects={projectList.data ?? []}
            isLoading={projectList.isLoading}
            tenantLabel={tenantLabel}
            scopeId={scopeId ?? "pending"}
            onSelect={selectProject}
          />
        </div>

        <aside className="w-full shrink-0 space-y-6 xl:w-72">
          <CardSpotlight className="glass-panel relative overflow-hidden rounded-[2rem] p-1 shadow-xl" color="rgba(59, 130, 246, 0.15)">
            <div className="relative z-10 flex h-full flex-col rounded-[1.9rem] bg-[var(--card)]/80 p-6 backdrop-blur-xl dark:bg-[var(--card)]/90">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500 shadow-sm">
                  <Rocket size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold tracking-tight text-[var(--foreground)]">Project Limits</h3>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-[var(--muted)]">Capacity Overview</p>
                </div>
              </div>

              <div className="space-y-5">
                <LimitCard
                  label="Active Projects"
                  current={limits.data?.active_projects ?? 0}
                  max={limits.data?.max_projects ?? 0}
                  unit="projects"
                />
                <LimitCard
                  label="Total Slots"
                  current={limits.data?.total_projects ?? 0}
                  max={limits.data?.max_projects ?? 0}
                  unit="slots"
                />
              </div>
            </div>
            <div className="pointer-events-none absolute -right-20 -top-20 size-48 rounded-full bg-blue-600/5 blur-[60px]" />
          </CardSpotlight>
        </aside>
      </div>

      {showForge ? (
        <ForgeModal
          onClose={() => setShowForge(false)}
          onSuccess={handleForgeSuccess}
        />
      ) : null}
    </div>
  );
}

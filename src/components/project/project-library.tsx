"use client";

import { useState } from "react";
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  FolderKanban,
  LoaderCircle,
  Trash2,
  X,
} from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteProject } from "@/src/features/auth/api";
import { queryKeys } from "@/src/features/query-keys";
import type { Project } from "@/src/features/auth/types";
import { Button } from "@/src/components/ui/button";
import { useToast } from "@/src/components/ui/toast";
import { compactNumber, shortDate } from "@/src/shared/formatters";

type LibraryViewProps = Readonly<{
  projects: Project[];
  isLoading: boolean;
  tenantLabel: "individual" | "organization";
  scopeId: string;
  onSelect: (id: string) => void;
}>;

type DeleteProjectDialogProps = Readonly<{
  project: Project | null;
  isDeleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}>;

function DeleteProjectDialog({ project, isDeleting, onCancel, onConfirm }: DeleteProjectDialogProps) {
  if (project === null) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center px-4">
      <button
        type="button"
        aria-label="Close delete confirmation"
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-md"
        onClick={isDeleting ? undefined : onCancel}
      />
      <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-[2rem] border border-rose-500/20 bg-[var(--card)]/95 p-7 shadow-[0_30px_120px_rgba(15,23,42,0.55)] backdrop-blur-2xl">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(244,63,94,0.12),transparent_60%)]" />
        <div className="relative flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="mt-1 flex size-12 items-center justify-center rounded-2xl border border-rose-500/20 bg-rose-500/10 text-rose-400">
              <AlertTriangle size={20} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[var(--foreground)]">Delete project</h2>
              <p className="mt-2 text-sm font-medium leading-relaxed text-[var(--muted)]">
                Delete <span className="font-medium text-[var(--foreground)]">{project.name}</span> from the active project list.
                This also tears down its live sandbox and cleans up stored artifacts.
              </p>
            </div>
          </div>
          <button
            type="button"
            aria-label="Close dialog"
            onClick={isDeleting ? undefined : onCancel}
            disabled={isDeleting}
            className="inline-flex size-10 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)]/60 text-[var(--muted)] transition-colors hover:text-[var(--foreground)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X size={16} />
          </button>
        </div>

        <div className="relative mt-6 rounded-2xl border border-rose-500/15 bg-rose-500/[0.04] px-4 py-3">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-rose-300/90">Confirmation</p>
          <p className="mt-2 text-sm font-medium text-[var(--foreground)]/85">
            This action cannot be undone from the dashboard. Deletion may take a few seconds while the runtime is stopped.
          </p>
        </div>

        <div className="relative mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="!h-11 !rounded-xl border border-[var(--border)] bg-[var(--surface)]/70 px-5 text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--foreground)] shadow-none hover:bg-[var(--surface)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Keep Project
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="!h-11 !rounded-xl bg-rose-600 px-5 text-[11px] font-medium uppercase tracking-[0.18em] text-white shadow-lg shadow-rose-900/30 hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isDeleting ? (
              <span className="inline-flex items-center gap-2">
                <LoaderCircle size={15} className="animate-spin" />
                Deleting
              </span>
            ) : (
              "Delete Project"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function LibraryView({ projects, isLoading, tenantLabel, scopeId, onSelect }: LibraryViewProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [deletingProjectIds, setDeletingProjectIds] = useState<Set<string>>(() => new Set());
  const itemsPerPage = 5;
  const visibleProjects = projects.filter((project) => !deletingProjectIds.has(project.id));
  const totalPages = Math.ceil(visibleProjects.length / itemsPerPage) || 1;
  const paginatedProjects = visibleProjects.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const remove = useMutation({
    mutationFn: (project: Project) => deleteProject(project.id, { confirmation: project.name }),
    onSuccess: async (_response, project) => {
      setDeletingProjectIds((current) => new Set(current).add(project.id));
      queryClient.setQueryData(queryKeys.projectList(tenantLabel, scopeId), (old: Project[] | undefined) =>
        old?.filter((candidate) => candidate.id !== project.id) ?? [],
      );
      setProjectToDelete(null);
      showToast("Project deletion started.", "success");
      await queryClient.invalidateQueries({ queryKey: queryKeys.projectList(tenantLabel, scopeId) });
      await queryClient.invalidateQueries({ queryKey: queryKeys.projectLimits(tenantLabel, scopeId) });
    },
    onError: (error) => {
      showToast(error instanceof Error ? error.message : "Unable to delete project", "error");
    },
  });

  const confirmDelete = (project: Project) => {
    if (!project.can_delete || remove.isPending) return;
    setProjectToDelete(project);
  };

  const closeDeleteDialog = () => {
    if (remove.isPending) return;
    setProjectToDelete(null);
  };

  const submitDelete = () => {
    if (projectToDelete === null || remove.isPending) return;
    remove.mutate(projectToDelete);
  };

  return (
    <>
      <div className="glass-panel rounded-[2rem] overflow-visible flex flex-col shadow-xl border border-[var(--border)]/50">
        <div className="hidden md:block overflow-visible w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[var(--surface)]/10">
                <th className="px-6 py-4 text-[9px] font-semibold uppercase tracking-[0.2em] text-[var(--muted)] border-b border-[var(--border)]">Workspace</th>
                <th className="px-6 py-4 text-[9px] font-semibold uppercase tracking-[0.2em] text-[var(--muted)] border-b border-[var(--border)]">Created</th>
                <th className="px-6 py-4 text-[9px] font-semibold uppercase tracking-[0.2em] text-[var(--muted)] border-b border-[var(--border)]">Resource Usage</th>
                <th className="px-6 py-4 text-[9px] font-semibold uppercase tracking-[0.2em] text-[var(--muted)] border-b border-[var(--border)] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {paginatedProjects.map((project) => (
                <tr key={project.id} className="group transition-all hover:bg-blue-500/[0.05] cursor-pointer text-[var(--foreground)] hover:text-blue-500" onClick={() => onSelect(project.id)}>
                  <td className="px-6 py-5 transition-all hover:bg-blue-500/5">
                    <div className="flex items-center gap-4">
                      <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/10 text-blue-500 shadow-sm transition-transform group-hover:scale-105">
                        <FolderKanban size={20} />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-base font-medium transition-colors text-inherit">{project.name}</p>
                        <div className="mt-0.5 flex items-center gap-2">
                          <span className="rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-emerald-500">{project.status}</span>
                          <span className="max-w-[180px] truncate text-[10px] font-medium text-[var(--muted)] group-hover:text-blue-500/70 transition-colors">{project.description}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <p className="text-xs font-medium text-inherit transition-colors">{shortDate(project.created_at)}</p>
                    <p className="mt-0.5 text-[9px] font-bold uppercase tracking-widest text-[var(--muted)] group-hover:text-blue-500/70 transition-colors">Deployment</p>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-6">
                      <div>
                        <p className="text-xs font-medium text-inherit transition-colors">{compactNumber(project.credit_used)}</p>
                        <p className="text-[8px] font-medium uppercase tracking-widest text-[var(--muted)] group-hover:text-blue-500/70 transition-colors">Credits</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-inherit transition-colors">{compactNumber(project.token_usage)}</p>
                        <p className="text-[8px] font-medium uppercase tracking-widest text-[var(--muted)] group-hover:text-blue-500/70 transition-colors">Tokens</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="inline-flex items-center gap-2">
                      {project.can_delete ? (
                        <button
                          type="button"
                          onClick={() => confirmDelete(project)}
                          disabled={remove.isPending}
                          data-tooltip="Delete project"
                          className="inline-flex size-9 items-center justify-center rounded-lg border border-rose-500/15 bg-rose-500/5 text-rose-400 transition-all hover:bg-rose-500/10 hover:text-rose-500 disabled:opacity-50"
                        >
                          <Trash2 size={16} />
                        </button>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => onSelect(project.id)}
                        data-tooltip="Launch workspace"
                        className="inline-flex size-9 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] shadow-sm transition-all hover:border-blue-500 hover:bg-blue-500 hover:text-white"
                      >
                        <ChevronRight size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {visibleProjects.length === 1 ? (
                <tr>
                  <td colSpan={4} className="border-t border-[var(--border)] bg-blue-500/[0.01] px-8 py-10 text-center">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-blue-500/60">
                      Create another project to compare resource usage across workspaces.
                    </p>
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        <div className="md:hidden divide-y divide-[var(--border)]">
          {paginatedProjects.map((project) => (
            <div key={project.id} className="space-y-5 p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex size-10 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/10 text-blue-500 shadow-sm">
                    <FolderKanban size={18} />
                  </div>
                  <div>
                    <p className="text-base font-medium">{project.name}</p>
                    <span className="mt-1 inline-block rounded-md border border-emerald-500/20 bg-emerald-500/10 px-1.5 py-0.5 text-[8px] font-medium uppercase tracking-widest text-emerald-500">{project.status}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {project.can_delete ? (
                    <button
                      type="button"
                      onClick={() => confirmDelete(project)}
                      disabled={remove.isPending}
                      className="flex size-9 items-center justify-center rounded-lg border border-rose-500/15 bg-rose-500/5 text-rose-400 disabled:opacity-50"
                    >
                      <Trash2 size={16} />
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => onSelect(project.id)}
                    className="flex size-9 items-center justify-center rounded-lg bg-blue-500 text-white shadow-lg shadow-blue-500/20"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 rounded-xl border border-[var(--border)]/50 bg-[var(--surface)]/20 p-4">
                <div>
                  <p className="mb-1 text-[8px] font-medium uppercase tracking-widest text-[var(--muted)]">Created</p>
                  <p className="text-xs font-medium">{shortDate(project.created_at)}</p>
                </div>
                <div className="flex items-center gap-6">
                  <div>
                    <p className="mb-1 text-[8px] font-medium uppercase tracking-widest text-[var(--muted)]">Credits</p>
                    <p className="text-xs font-medium text-blue-500">{compactNumber(project.credit_used)}</p>
                  </div>
                  <div>
                    <p className="mb-1 text-[8px] font-medium uppercase tracking-widest text-[var(--muted)]">Tokens</p>
                    <p className="text-xs font-medium text-blue-500">{compactNumber(project.token_usage)}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {projects.length === 1 ? (
            <div className="bg-blue-500/[0.02] p-4 text-center">
              <p className="text-[9px] font-bold uppercase tracking-widest text-blue-500/60">Forge another project to compare usage.</p>
            </div>
          ) : null}
        </div>

        {!isLoading && projects.length === 0 ? (
          <div className="px-8 py-20 text-center">
            <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface)] text-[var(--muted)]/20">
              <FolderKanban size={32} />
            </div>
            <p className="text-lg font-semibold text-[var(--foreground)] opacity-70">No projects forged yet</p>
            <p className="mx-auto mt-2 max-w-xs text-xs font-medium leading-relaxed text-[var(--muted)]">Initialize your first operational workspace to begin generation and syncing.</p>
          </div>
        ) : null}

        {projects.length > itemsPerPage ? (
          <div className="flex items-center justify-between border-t border-[var(--border)] bg-[var(--surface)]/5 px-6 py-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, projects.length)} of {projects.length} projects
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                disabled={currentPage === 1}
                className="inline-flex size-8 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] transition-colors hover:bg-[var(--border)] disabled:opacity-50"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                type="button"
                onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                disabled={currentPage === totalPages}
                className="inline-flex size-8 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] transition-colors hover:bg-[var(--border)] disabled:opacity-50"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        ) : null}
      </div>
      <DeleteProjectDialog
        project={projectToDelete}
        isDeleting={remove.isPending}
        onCancel={closeDeleteDialog}
        onConfirm={submitDelete}
      />
    </>
  );
}

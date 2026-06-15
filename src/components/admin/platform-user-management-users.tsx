"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, UserPlus } from "lucide-react";
import { useState } from "react";
import { createPortal } from "react-dom";

import { Button } from "@/src/components/ui/button";
import { DataTable } from "@/src/components/ui/data-table";
import { TextField } from "@/src/components/ui/form-field";
import { addPlatformAdmin, adminUsers, deleteAdminUser } from "@/src/features/auth/api";
import { useAuthStore } from "@/src/features/auth/store";
import { formString } from "@/src/shared/form-data";

import { AdminActionMenu, formatComputeUsage, formatCount, formatCredits } from "./platform-user-management-shared";

export function PlatformUsersSection({ type }: Readonly<{ type: "individual" | "platform_admin" }>) {
  const queryClient = useQueryClient();
  const currentUser = useAuthStore((state) => state.user);
  const [showForm, setShowForm] = useState(false);
  const users = useQuery({ queryKey: ["admin-users", type], queryFn: () => adminUsers(type) });
  const create = useMutation({
    mutationFn: addPlatformAdmin,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-users", type] }),
  });
  const remove = useMutation({
    mutationFn: deleteAdminUser,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-users", type] }),
  });

  async function onCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    await create.mutateAsync({
      email: formString(data, "email"),
      full_name: formString(data, "full_name"),
    });
    form.reset();
    setShowForm(false);
  }

  function confirmDelete(userName: string, kind: "individual" | "platform_admin") {
    const subject = kind === "platform_admin" ? "platform admin" : "user";
    return globalThis.confirm(`Delete ${subject} ${userName}? This action cannot be undone.`);
  }

  const rows = users.data ?? [];

  return (
    <div className="space-y-5">
      {type === "platform_admin" ? (
        <div className="flex justify-end">
          <Button onClick={() => setShowForm(true)} icon={<Plus size={18} />}>Add Platform Admin</Button>
        </div>
      ) : null}
      {showForm && typeof document !== "undefined" ? createPortal(
        <dialog
          open
          aria-label="Add Platform Admin"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-white/40 dark:bg-black/60 p-4 backdrop-blur-sm border-none m-0 w-full h-full max-w-none max-h-none overflow-hidden"
        >
          <button
            type="button"
            aria-label="Close dialog"
            onClick={() => setShowForm(false)}
            className="absolute inset-0 w-full h-full bg-transparent border-none appearance-none cursor-default"
          />
          <div className="glass-panel relative z-10 flex flex-col w-full max-w-lg max-h-[90vh] rounded-[2rem] shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-6 pb-4 border-b border-[var(--border)]/50 shrink-0">
              <h2 className="text-xl font-semibold">Add Platform Admin</h2>
              <Button variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
            <div data-lenis-prevent="true" className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-6">
            <form onSubmit={onCreate} className="flex flex-col gap-4">
              <TextField label="Full name" name="full_name" placeholder="Platform admin name" required />
              <TextField label="Email" name="email" type="email" placeholder="admin@wyrefy.com" required />
              <Button type="submit" className="h-12 mt-2" loading={create.isPending} icon={<UserPlus size={18} />}>
                Add Admin
              </Button>
              </form>
            </div>
          </div>
        </dialog>,
        document.body
      ) : null}
      <DataTable headers={type === "platform_admin" ? ["Name", "Status", "Actions"] : ["Name", "Plan", "Credits (Used/Left)", "Projects (Active/Left)", "Token Usage", "Compute Usage", "Status", "Actions"]}>
        {rows.map((user) => {
          const isCurrentPlatformAdmin = type === "platform_admin" && currentUser?.id === user.id;
          return (
            <tr key={user.id} className="border-t border-[var(--border)] transition-colors hover:bg-[var(--surface)]/10 group text-[var(--foreground)] hover:text-[var(--accent)]">
              <td className="transition-all hover:bg-[var(--accent)]/5">
                <div className="flex flex-col whitespace-nowrap">
                  <span className="font-medium text-inherit transition-colors">{user.name}</span>
                  <span className="text-[10px] tracking-wider text-[var(--muted)] group-hover:text-[var(--accent)]/70 transition-colors">{user.email}</span>
                  {isCurrentPlatformAdmin ? <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--accent)] mt-1">Current session</span> : null}
                </div>
              </td>
              {type === "platform_admin" ? (
                <>
                  <td>{user.status}</td>
                  <td>
                    <AdminActionMenu
                      ariaLabel={`Platform admin actions for ${user.name}`}
                      actions={[
                        {
                          label: isCurrentPlatformAdmin ? "Delete disabled for current admin" : "Delete platform admin",
                          destructive: true,
                          disabled: isCurrentPlatformAdmin,
                          onClick: () => {
                            if (confirmDelete(user.name, "platform_admin")) {
                              remove.mutate(user.id);
                            }
                          },
                        },
                      ]}
                    />
                  </td>
                </>
              ) : (
                <>
                  <td>
                    <span className="inline-flex items-center rounded-full bg-[var(--surface)]/40 px-2 py-0.5 text-xs font-medium border border-[var(--border)] text-inherit transition-colors">
                      {user.plan ?? "No plan"}
                    </span>
                  </td>
                  <td>
                    <span className="font-medium text-inherit transition-colors">
                      {formatCredits(user.credits_used)} <span className="text-[var(--muted)] group-hover:text-[var(--accent)]/70 mx-0.5 transition-colors">/</span> {formatCredits(user.credits_remaining)}
                    </span>
                  </td>
                  <td>
                    <span className="font-medium text-inherit transition-colors">
                      {formatCount(user.project_count)} <span className="text-[var(--muted)] group-hover:text-[var(--accent)]/70 mx-0.5 transition-colors">/</span> {formatCount(user.projects_remaining)}
                    </span>
                  </td>
                  <td className="font-mono text-sm font-semibold text-inherit transition-colors">{formatCount(user.token_usage)}</td>
                  <td>{formatComputeUsage(user.compute_usage)}</td>
                  <td>{user.status}</td>
                  <td>
                    <AdminActionMenu
                      ariaLabel={`User actions for ${user.name}`}
                      actions={[
                        {
                          label: "Delete user",
                          destructive: true,
                          onClick: () => {
                            if (confirmDelete(user.name, "individual")) {
                              remove.mutate(user.id);
                            }
                          },
                        },
                      ]}
                    />
                  </td>
                </>
              )}
            </tr>
          );
        })}
      </DataTable>
    </div>
  );
}

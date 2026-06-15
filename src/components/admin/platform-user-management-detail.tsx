"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createPortal } from "react-dom";

import { DataTable } from "@/src/components/ui/data-table";
import { adminOrganizationMembers, deleteAdminOrgMember, updateAdminOrgMember } from "@/src/features/auth/api";
import type { AdminOrganization } from "@/src/features/auth/types";

import { AdminActionMenu, RoleSelect } from "./platform-user-management-shared";

export function PlatformOrganizationDetail({ organization, onClose }: Readonly<{ organization: AdminOrganization; onClose: () => void }>) {
  const queryClient = useQueryClient();
  const members = useQuery({
    queryKey: ["admin-org-members", organization.id],
    queryFn: () => adminOrganizationMembers(organization.id),
  });
  const remove = useMutation({
    mutationFn: (id: string) => deleteAdminOrgMember(organization.id, id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-org-members", organization.id] }),
  });
  const role = useMutation({
    mutationFn: ({ id, value }: { id: string; value: string }) => updateAdminOrgMember(organization.id, id, { role: value }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-org-members", organization.id] }),
  });

  async function onRoleChange(memberId: string, name: string, newRole: string) {
    const roleName = newRole.split("_").at(-1);
    if (globalThis.confirm(`Update ${name}'s role to ${roleName}? This will change their permissions immediately.`)) {
      await role.mutateAsync({ id: memberId, value: newRole });
    }
  }

  function confirmMemberDelete(name: string) {
    return globalThis.confirm(`Delete member ${name}? This action cannot be undone.`);
  }

  const content = (
    <dialog
      open
      aria-label="Organization Details"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-white/40 dark:bg-black/60 p-4 backdrop-blur-sm border-none m-0 w-full h-full max-w-none max-h-none overflow-hidden"
    >
      <button
        type="button"
        aria-label="Close organization details"
        onClick={onClose}
        className="absolute inset-0 w-full h-full bg-transparent border-none appearance-none cursor-default"
      />
      <div className="glass-panel relative z-10 flex flex-col w-full max-w-5xl max-h-[90vh] rounded-[2rem] shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between p-6 pb-4 border-b border-[var(--border)]/50 shrink-0">
          <div>
            <h2 className="text-xl font-semibold">{organization.name}</h2>
            <p className="text-sm text-[var(--muted)]">{organization.plan ?? "No plan"} · {organization.status}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-2xl border border-[var(--border)] px-4 py-2 font-medium">Close</button>
        </div>
        <div data-lenis-prevent="true" className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-6">
          <DataTable headers={["Name", "Role", "Usage", "Status", "Actions"]}>
          {(members.data ?? []).map((member) => (
            <tr key={member.user_id} className="border-t border-[var(--border)] transition-colors hover:bg-[var(--surface)]/10 group text-[var(--foreground)] hover:text-[var(--accent)]">
              <td className="transition-all hover:bg-[var(--accent)]/5">
                <span className="font-medium text-inherit transition-colors">{member.name}</span>
                <p className="text-xs text-[var(--muted)] group-hover:text-[var(--accent)]/70 transition-colors">{member.email}</p>
              </td>
              <td>
                <RoleSelect value={member.role} onChange={(value) => onRoleChange(member.user_id, member.name, value)} />
              </td>
              <td className="text-inherit transition-colors">{member.usage}</td>
              <td className="text-inherit transition-colors">{member.status}</td>
              <td>
                <AdminActionMenu
                  ariaLabel={`Member actions for ${member.name}`}
                  actions={[
                    {
                      label: "Delete member",
                      destructive: true,
                      onClick: () => {
                        if (confirmMemberDelete(member.name)) {
                          remove.mutate(member.user_id);
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
      </div>
    </dialog>
  );

  return typeof document !== "undefined" ? createPortal(content, document.body) : null;
}

"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { LucideIcon } from "lucide-react";
import { BarChart3, Plus, Settings2, Trash2, UserPlus } from "lucide-react";
import {  useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { formatComputeUsage } from "@/src/components/admin/platform-user-management-shared";
import { Button } from "@/src/components/ui/button";
import { SelectField, TextField } from "@/src/components/ui/form-field";
import {
  currentOrganization,
  deleteOrganizationMember,
  inviteOrganizationMember,
  organizationMembers,
  organizationMemberUsage,
  reinviteOrganizationMember,
  setOrganizationMemberBillingAccess,
  suspendOrganizationMember,
  updateOrganizationMember,
} from "@/src/features/auth/api";
import { queryKeys } from "@/src/features/query-keys";
import { useAuthStore } from "@/src/features/auth/store";
import type { OrganizationMember } from "@/src/features/auth/types";
import { formString } from "@/src/shared/form-data";
import { compactNumber } from "@/src/shared/formatters";
import { SectionLoading } from "@/src/components/ui/loading-states";

function confirmAction(message: string, action: () => void) {
  if (globalThis.confirm(message)) action();
}
export default function OrganizationTeamPage() {
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<OrganizationMember | null>(null);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [pendingActionId, setPendingActionId] = useState<string | null>(null);
  const userId = useAuthStore((state) => state.user?.id);
  const organization = useQuery({ queryKey: queryKeys.currentOrganization(userId ?? ""), queryFn: currentOrganization, enabled: Boolean(userId) });
  const canManageMembers = Boolean(organization.data?.can_manage_members);
  const isOwner = organization.data?.role === "organization_owner";
  const organizationId = organization.data?.id;
  const membersKey = organizationId ? queryKeys.organizationMembers(organizationId) : ["organization-members", "idle"] as const;
  const members = useQuery({ queryKey: membersKey, queryFn: organizationMembers, enabled: canManageMembers && Boolean(organizationId) });
  const active = (members.data ?? []).filter((m) => m.status !== "deleted" && !m.deleted_at);
  const deleted = (members.data ?? []).filter((m) => m.status === "deleted" || !!m.deleted_at);
  const invite = useMutation({ mutationFn: inviteOrganizationMember, onSuccess: () => { queryClient.invalidateQueries({ queryKey: membersKey }); setShowInviteForm(false); } });
  const suspend = useMutation({ mutationFn: suspendOrganizationMember, onSuccess: () => queryClient.invalidateQueries({ queryKey: membersKey }) });
  const reinvite = useMutation({ mutationFn: reinviteOrganizationMember });
  const remove = useMutation({ mutationFn: deleteOrganizationMember, onSuccess: () => queryClient.invalidateQueries({ queryKey: membersKey }) });
  const role = useMutation({ mutationFn: ({ id, value }: { id: string; value: string }) => updateOrganizationMember(id, { role: value }), onSuccess: () => queryClient.invalidateQueries({ queryKey: membersKey }) });
  const billingAccess = useMutation({
    mutationFn: ({ id, value }: { id: string; value: boolean }) => setOrganizationMemberBillingAccess(id, { can_manage_billing: value }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: membersKey }),
  });
  async function onInvite(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    await invite.mutateAsync({ email: formString(data, "email"), full_name: formString(data, "full_name"), role: formString(data, "role") });
    form.reset();
  }

  async function withPending(id: string, action: () => Promise<unknown>) {
    setPendingActionId(id);
    try {
      await action();
    } finally {
      setPendingActionId(null);
    }
  }

  if (!userId || organization.isLoading) {
    return <SectionLoading label="Loading team" />;
  }

  return (
    <div className="space-y-5">
      {!organization.isLoading && !canManageMembers ? (
        <div className="glass-card rounded-3xl border border-red-500/20 p-6 text-sm font-medium text-red-300">
          Member management requires organization owner or admin access.
        </div>
      ) : null}

      {canManageMembers ? <div className="flex justify-end">
        <Button onClick={() => setShowInviteForm(true)} icon={<Plus size={18} />}>
          Invite Member
        </Button>
      </div> : null}

      {showInviteForm && canManageMembers && typeof document !== "undefined" && createPortal(
        <dialog
          open
          aria-label="Invite New Member"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-white/40 dark:bg-black/60 p-4 backdrop-blur-sm border-none m-0 w-full h-full max-w-none max-h-none overflow-hidden"
        >
          <button
            type="button"
            aria-label="Close dialog"
            onClick={() => setShowInviteForm(false)}
            className="absolute inset-0 w-full h-full bg-transparent border-none appearance-none cursor-default"
          />
          <div className="glass-panel relative z-10 flex flex-col w-full max-w-xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-8 pb-6 border-b border-[var(--border)]/50 shrink-0">
              <h2 className="text-2xl font-semibold">Invite New Member</h2>
              <Button variant="ghost" onClick={() => setShowInviteForm(false)}>Cancel</Button>
            </div>
            <div data-lenis-prevent="true" className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-8 pt-6">
            <form onSubmit={onInvite} className="grid gap-6">
              <TextField label="Full name" name="full_name" placeholder="Member name" required />
              <TextField label="Email address" name="email" type="email" placeholder="member@company.com" required />
              <SelectField label="Role" name="role" required>
                <option value="organization_member">Member</option>
                <option value="organization_admin">Admin</option>
              </SelectField>
              <Button
                type="submit"
                className="h-12 mt-2"
                loading={invite.isPending}
                icon={<UserPlus size={18} />}
              >
                Send Invitation
              </Button>
            </form>
            </div>
          </div>
        </dialog>,
        document.body
      )}

      {canManageMembers ? <div className="relative z-20">
        <MemberTable
          title="All Members"
          members={active}
          onSelect={setSelected}
          onSuspend={(id) => withPending(id, async () => suspend.mutateAsync(id))}
          onReinvite={(id) => withPending(id, async () => reinvite.mutateAsync(id))}
          onDelete={(id) => withPending(id, async () => remove.mutateAsync(id))}
          onRole={(id, value) => withPending(id, async () => role.mutateAsync({ id, value }))}
          onBillingAccess={(id, value) => withPending(id, async () => billingAccess.mutateAsync({ id, value }))}
          isOwner={isOwner}
          pendingActionId={pendingActionId}
        />
      </div> : null}

      {canManageMembers ? <div className="relative z-10 mt-8">
        <MemberTable
          title="Deleted Users Usage"
          members={deleted}
          onSelect={setSelected}
          readonly
        />
      </div> : null}

      {selected && organizationId ? <UsageModal member={selected} organizationId={organizationId} onClose={() => setSelected(null)} /> : null}
    </div>
  );
}

function memberStatusClass(status: string) {
  if (status === "active") return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
  return "bg-[var(--surface)]/40 text-[var(--muted)] border border-[var(--border)]";
}

function memberStatusDotClass(status: string) {
  if (status === "active") return "bg-emerald-500 animate-pulse";
  return "bg-[var(--muted)]/30";
}

function billingAccessClass(hasAccess: boolean, targetAccess: boolean) {
  if (hasAccess === targetAccess) return targetAccess ? "bg-emerald-500 text-white" : "bg-amber-500 text-white";
  return "bg-[var(--foreground)]/5 hover:bg-[var(--foreground)]/10";
}
function MemberTable({ title, members, onSelect, onSuspend, onReinvite, onDelete, onRole, onBillingAccess, isOwner = false, readonly = false, pendingActionId = null }: Readonly<{
  title: string;
  members: OrganizationMember[];
  onSelect: (member: OrganizationMember) => void;
  onSuspend?: (id: string) => void;
  onReinvite?: (id: string) => void;
  onDelete?: (id: string) => void;
  onRole?: (id: string, value: string) => void;
  onBillingAccess?: (id: string, value: boolean) => void;
  isOwner?: boolean;
  readonly?: boolean;
  pendingActionId?: string | null;
}>) {

  return (
    <div className="glass-panel relative overflow-visible rounded-3xl border border-[var(--border)] shadow-2xl" style={{ zIndex: 'inherit' }}>
      <div className="bg-[var(--surface)]/30 px-8 py-6 border-b border-[var(--border)] rounded-t-[1.4rem]">
        <h2 className="text-xl font-semibold text-[var(--foreground)] tracking-tight">{title}</h2>
      </div>
      <div className="overflow-visible">
      <table className="w-full min-w-[720px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-[var(--border)] bg-[var(--surface)]/20">
            {["Name", "Credits Used", "Status", "Action"].map((header) => (
              <th key={header} className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--border)]">
          {members.map((member) => (
            <tr 
              key={member.user_id} 
              onClick={() => onSelect(member)}
              className="group transition-all hover:bg-[var(--surface)]/40 cursor-pointer"
            >
              <td className="px-6 py-5">
                <div className="flex flex-col text-left">
                  <span className="font-medium text-[var(--foreground)] group-hover:text-blue-400 transition-colors">
                    {member.name}
                  </span>
                  <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-widest mt-0.5">{member.email}</p>
                </div>
              </td>
              <td className="px-6 py-5">
                <span className="text-sm font-medium text-[var(--foreground)]/80">{compactNumber(member.credit_used)} CR</span>
              </td>
              <td className="px-6 py-5">
                <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest ${memberStatusClass(member.status)}`}>
                  <div className={`mr-1.5 size-1 rounded-full ${memberStatusDotClass(member.status)}`} />
                  {member.status}
                </span>
              </td>
              <td className="px-6 py-5">
                <MemberActionCell
                  member={member}
                  readonly={readonly}
                  isOwner={isOwner}
                  pendingActionId={pendingActionId}
                  onSuspend={onSuspend}
                  onReinvite={onReinvite}
                  onDelete={onDelete}
                  onRole={onRole}
                  onBillingAccess={onBillingAccess}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
}

function MemberActionCell({ member, readonly, isOwner, pendingActionId, onSuspend, onReinvite, onDelete, onRole, onBillingAccess }: Readonly<{
  member: OrganizationMember;
  readonly: boolean;
  isOwner: boolean;
  pendingActionId: string | null;
  onSuspend?: (id: string) => void;
  onReinvite?: (id: string) => void;
  onDelete?: (id: string) => void;
  onRole?: (id: string, value: string) => void;
  onBillingAccess?: (id: string, value: boolean) => void;
}>) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const busy = pendingActionId === member.user_id;
  const canManageBilling = member.role === "organization_admin" || member.role === "organization_owner";

  useEffect(() => {
    function onClickOutside(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (!menuOpen) return;
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [menuOpen]);

  if (readonly) {

  return (
      <button 
        type="button" 
        onClick={(e) => { e.stopPropagation(); setMenuOpen(false); }} 
        className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-[var(--muted)] hover:text-[var(--foreground)] hover:border-[var(--muted)] transition-colors"
      >
        <BarChart3 size={12} />
        View Usage
      </button>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        disabled={busy}
        onClick={(e) => { e.stopPropagation(); setMenuOpen((open) => !open); }}
        className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-[var(--foreground)] hover:border-blue-500/30 hover:text-blue-400"
      >
        <Settings2 size={12} />
        {busy ? "Working" : "Manage"}
      </button>
      {menuOpen ? (
        <div className="absolute right-0 top-full z-50 mt-2 min-w-64 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-2 shadow-2xl">
          <ActionButton icon={UserPlus} label="Resend invite" onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onReinvite?.(member.user_id); }} />
          <ActionButton icon={BarChart3} label="Make admin" onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onRole?.(member.user_id, "organization_admin"); }} hidden={member.role === "organization_admin" || member.role === "organization_owner"} />
          <ActionButton icon={BarChart3} label="Make member" onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onRole?.(member.user_id, "organization_member"); }} hidden={member.role === "organization_member"} />
          <ActionButton icon={BarChart3} label="Grant billing access" onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onBillingAccess?.(member.user_id, true); }} hidden={!canManageBilling || member.can_manage_billing} className={billingAccessClass(member.can_manage_billing, true)} />
          <ActionButton icon={BarChart3} label="Revoke billing access" onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onBillingAccess?.(member.user_id, false); }} hidden={!canManageBilling || !member.can_manage_billing} className={billingAccessClass(member.can_manage_billing, false)} />
          <ActionButton icon={Settings2} label="Suspend member" onClick={(e) => { e.stopPropagation(); setMenuOpen(false); confirmAction(`Suspend ${member.name}?`, () => onSuspend?.(member.user_id)); }} />
          <ActionButton icon={Trash2} label="Delete member" onClick={(e) => { e.stopPropagation(); setMenuOpen(false); confirmAction(`Delete ${member.name}?`, () => onDelete?.(member.user_id)); }} hidden={isOwner && member.role === "organization_owner"} destructive />
        </div>
      ) : null}
    </div>
  );
}

function ActionButton({ icon: Icon, label, onClick, hidden = false, destructive = false, className = "" }: Readonly<{
  icon: LucideIcon;
  label: string;
  onClick: (e: React.MouseEvent) => void;
  hidden?: boolean;
  destructive?: boolean;
  className?: string;
}>) {
  if (hidden) return null;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-medium ${destructive ? "text-red-400 hover:bg-red-500/10" : "text-[var(--foreground)] hover:bg-[var(--surface)]"} ${className}`}
    >
      <Icon size={14} />
      {label}
    </button>
  );
}
function UsageModal({ member, organizationId, onClose }: Readonly<{ member: OrganizationMember; organizationId: string; onClose: () => void }>) {
  const usage = useQuery({ queryKey: queryKeys.organizationMemberUsage(organizationId, member.user_id), queryFn: () => organizationMemberUsage(member.user_id) });

  const content = (
    <dialog open aria-label="Member usage" className="fixed inset-0 z-[100] flex items-center justify-center border-none bg-white/40 p-4 backdrop-blur-sm dark:bg-black/60 overflow-hidden max-w-none max-h-none h-full w-full">
      <button type="button" aria-label="Close dialog" onClick={onClose} className="absolute inset-0 cursor-default border-none bg-transparent" />
      <div className="glass-panel relative z-10 flex flex-col w-full max-w-lg max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between p-8 pb-6 border-b border-[var(--border)]/50 shrink-0">
          <div>
            <h2 className="text-2xl font-semibold">{member.name}</h2>
            <p className="mt-1 text-xs font-medium uppercase tracking-widest text-[var(--muted)]">Usage details</p>
          </div>
          <Button variant="ghost" onClick={onClose}>Close</Button>
        </div>
        <div data-lenis-prevent="true" className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-8 pt-6">
        <div className="grid gap-4 md:grid-cols-3">
          <UsageStat label="Tokens" value={compactNumber(usage.data?.token_usage ?? 0)} />
          <UsageStat label="Compute" value={formatComputeUsage(usage.data?.compute_usage ?? "0")} />
          <UsageStat label="Credits" value={compactNumber(usage.data?.credit_used ?? "0")} />
        </div>
        </div>
      </div>
    </dialog>
  );

  return typeof document !== "undefined" ? createPortal(content, document.body) : null;
}
function UsageStat({ label, value }: Readonly<{ label: string; value: string }>) {

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/40 p-4 min-w-0">
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--muted)] truncate">{label}</p>
      <p className="mt-3 text-2xl font-semibold tracking-tight text-[var(--foreground)] truncate" title={String(value)}>{value}</p>
    </div>
  );
}

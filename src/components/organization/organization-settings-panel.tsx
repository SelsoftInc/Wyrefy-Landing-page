"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Building2, ChevronRight, KeyRound, TimerReset } from "lucide-react";
import React, {  useState } from "react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";

import { Button } from "@/src/components/ui/button";
import { DeleteAccountPanel } from "@/src/components/user/delete-account-panel";
import { TextField } from "@/src/components/ui/form-field";
import { SectionLoading } from "@/src/components/ui/loading-states";
import { useToast } from "@/src/components/ui/toast";
import { currentOrganization, changePassword, updateProfile } from "@/src/features/auth/api";
import { queryKeys } from "@/src/features/query-keys";
import { useAuthStore } from "@/src/features/auth/store";
import { updateOrganizationProfile } from "@/src/features/settings/api";

export function OrganizationSettingsPanel() {
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const { user, setUser } = useAuthStore();
  const organization = useQuery({ queryKey: queryKeys.currentOrganization(user?.id ?? ""), queryFn: currentOrganization, enabled: Boolean(user) });
  
  const userProfileMutation = useMutation({ mutationFn: updateProfile });
  const profile = useMutation({ 
    mutationFn: updateOrganizationProfile, 
    onSuccess: async () => { 
      await refresh(); 
      showToast("Organization profile updated", "success"); 
    },
    onError: (e: Error) => showToast(e.message || "Failed to update profile", "error")
  });
  
  const passwordMutation = useMutation({ 
    mutationFn: changePassword, 
    onSuccess: async () => { 
      await refresh(); 
      showToast("Password changed", "success"); 
    },
    onError: (e: Error) => showToast(e.message || "Failed to change password", "error")
  });
  const data = organization.data;

  async function onPassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = Object.fromEntries(new FormData(form)) as Record<string, string>;
    passwordMutation.mutate({
      current_password: formData.current_password,
      new_password: formData.new_password,
      confirm_password: formData.confirm_password,
    }, {
      onSuccess: () => form.reset()
    });
  }

  async function refresh() {
    await queryClient.refetchQueries({ queryKey: queryKeys.currentOrganization(user?.id ?? "") });
  }

  const [profileState, setProfileState] = useState({
    name: "",
    billing_email: "",
    billing_name: "",
  });

  React.useEffect(() => {
    if (data && user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setProfileState({
        name: data.name ?? "",
        billing_email: user.email || "",
        billing_name: user.full_name || "",
      });
    }
  }, [data, user]);

  async function onProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    
    // Update user profile if the name changed from the original
    if (profileState.billing_name && profileState.billing_name !== user?.full_name) {
      await userProfileMutation.mutateAsync({ full_name: profileState.billing_name });
      if (user) setUser({ ...user, full_name: profileState.billing_name });
    }

    profile.mutate({
      name: profileState.name,
      billing_contacts: { email: profileState.billing_email, name: profileState.billing_name },
    });
  }

  if (!user || organization.isLoading) return <SectionLoading label="Loading organization settings" />;

  const canEditProfile = data?.role === "organization_owner" || data?.role === "organization_admin";

  return (
    <>
      <div className="animate-page-enter grid gap-8 md:grid-cols-2 pb-12">
        {/* Primary Organization Profile & My Profile */}
        <section className="glass-panel relative overflow-hidden rounded-[2rem] p-1 shadow-xl">
          <div className="relative z-10 bg-[var(--card)] rounded-[1.9rem] p-6 backdrop-blur-md h-full flex flex-col">
            <div className="flex items-center gap-4 mb-6">
              <div className="flex size-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500 shadow-sm">
                <Building2 size={22} />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-[var(--foreground)] tracking-tight">Organization Profile</h1>
                <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-widest">{data?.allowed_email_domain ? `Domain: ${data.allowed_email_domain}` : "No domain restricted"}</p>
              </div>
            </div>

            <form onSubmit={onProfile} className="space-y-6">
              <div className="space-y-5">
                <TextField label="Organization Name" name="name" value={profileState.name} onChange={(e) => setProfileState(s => ({ ...s, name: e.target.value }))} placeholder="Enter name" className="text-xs" disabled={!canEditProfile} />
                <TextField label="Allowed Domain" name="domain" value={data?.allowed_email_domain ?? "Shared"} disabled className="text-xs opacity-80" />
              </div>
              
              <div className="space-y-5">
                <TextField label="User Name" name="billing_name" value={profileState.billing_name} onChange={(e) => setProfileState(s => ({ ...s, billing_name: e.target.value }))} placeholder={user?.full_name ?? "User name"} className="text-xs" disabled={!canEditProfile} />
                <TextField label="Mail Id" name="billing_email" value={profileState.billing_email} onChange={(e) => setProfileState(s => ({ ...s, billing_email: e.target.value }))} placeholder={user?.email ?? "mail@id.com"} className="text-xs" disabled={!canEditProfile} />
              </div>

              {canEditProfile && (
                <div className="pt-2 flex justify-end">
                  <Button type="submit" className="!w-auto px-6 !py-2.5 !rounded-xl font-medium uppercase tracking-widest text-[10px]" loading={profile.isPending}>
                    Update Organization
                  </Button>
                </div>
              )}
            </form>
          </div>
          <div className="absolute -right-20 -top-20 size-64 rounded-full bg-blue-600/5 blur-[80px] pointer-events-none" />
        </section>

        {/* Security & Access (Password) */}
        <section className="glass-panel relative overflow-hidden rounded-[2rem] p-1 shadow-xl">
          <div className="relative z-10 bg-[var(--card)] rounded-[1.9rem] p-6 backdrop-blur-md h-full flex flex-col">
            <div className="flex items-center gap-4 mb-6">
              <div className="flex size-11 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500 shadow-sm">
                <KeyRound size={22} />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-[var(--foreground)] tracking-tight">Security & Access</h2>
                <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-widest">Update your password</p>
              </div>
            </div>

            <form onSubmit={onPassword} className="space-y-6">
              <TextField label="Current Password" name="current_password" type="password" autoComplete="current-password" className="text-xs" />
              <div className="grid gap-5 sm:grid-cols-2">
                <TextField label="New Password" name="new_password" type="password" autoComplete="new-password" className="text-xs" />
                <TextField label="Confirm New" name="confirm_password" type="password" autoComplete="new-password" className="text-xs" />
              </div>
              <div className="pt-2 flex justify-end">
                <Button type="submit" className="!w-auto px-6 !py-2.5 !rounded-xl font-medium uppercase tracking-widest text-[10px]" loading={passwordMutation.isPending} icon={<KeyRound size={14} />}>
                  Update Security
                </Button>
              </div>
            </form>
          </div>
        </section>



        {/* Secondary Controls Row */}
        <div className="md:col-span-2 mt-4 pt-8 border-t border-[var(--border)]">
          {data?.can_delete_organization && (
            <button 
              type="button"
              onClick={() => setActiveModal("danger")}
              className="group flex items-center gap-5 rounded-[1.5rem] border border-rose-500/10 bg-rose-500/[0.02] p-6 text-left transition-all hover:bg-rose-500/[0.05] hover:border-rose-500/30"
            >
              <div className="flex size-12 items-center justify-center rounded-xl bg-rose-500/10 text-rose-500 group-hover:bg-rose-500 group-hover:text-white transition-all shadow-sm">
                <TimerReset size={20} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-rose-500/90 tracking-tight">Organization Termination</h3>
                <p className="text-[9px] font-bold text-rose-500/40 uppercase tracking-[0.2em] mt-0.5">Danger Zone</p>
              </div>
              <ChevronRight size={20} className="text-rose-500/30 group-hover:translate-x-1 transition-all" />
            </button>
          )}
        </div>
      </div>
      {/* Danger Modal */}
      {activeModal === "danger" && data && (
        <SettingsPopup title="Danger Zone" onClose={() => setActiveModal(null)} description="Irreversible organization actions">
          <DeleteAccountPanel mode="organization" organizationName={data.name} />
        </SettingsPopup>
      )}
    </>
  );
}

function SettingsPopup({ title, onClose, description, children }: Readonly<{ title: string, onClose: () => void, description: string, children: ReactNode }>) {
  const mounted = React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  React.useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  if (!mounted) return null;

  return createPortal(
    <dialog
      open
      aria-label={title}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/40 dark:bg-zinc-950/70 backdrop-blur-md p-4 border-none m-0 w-full h-full max-w-none max-h-none overflow-hidden"
    >
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 w-full h-full bg-transparent border-none appearance-none cursor-default"
      />
      <div 
        className="glass-panel relative z-10 flex flex-col w-full max-w-5xl max-h-[90vh] bg-[var(--card)] shadow-2xl rounded-[2rem] overflow-hidden animate-page-enter border border-[var(--border)]"
      >
        <div className="p-8 pb-4 shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-semibold text-[var(--foreground)] tracking-tight">{title}</h2>
              <p className="text-xs font-medium text-[var(--muted)] uppercase tracking-[0.2em] mt-1">{description}</p>
            </div>
            <button type="button" onClick={onClose} className="size-12 flex items-center justify-center rounded-2xl bg-[var(--surface)] hover:bg-[var(--surface)]/80 text-[var(--muted)] transition-all">
              <ChevronRight size={24} className="rotate-90" />
            </button>
          </div>
        </div>
        <div data-lenis-prevent="true" className="flex-1 min-h-0 overflow-y-auto p-8 pt-0 custom-scrollbar">
          {children}
        </div>
      </div>
    </dialog>,
    document.body
  );
}

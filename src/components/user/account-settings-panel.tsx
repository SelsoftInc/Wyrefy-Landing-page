"use client";

import { useMutation } from "@tanstack/react-query";
import { KeyRound, Monitor } from "lucide-react";

import { Button } from "@/src/components/ui/button";
import { DeleteAccountPanel } from "@/src/components/user/delete-account-panel";
import { TextField } from "@/src/components/ui/form-field";
import { useToast } from "@/src/components/ui/toast";
import { changePassword, updateProfile } from "@/src/features/auth/api";
import { useAuthStore } from "@/src/features/auth/store";

export function AccountSettingsPanel({ includeDeletion = true }: Readonly<{ includeDeletion?: boolean }>) {
  const { showToast } = useToast();
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const profileMutation = useMutation({ mutationFn: updateProfile });
  const passwordMutation = useMutation({ mutationFn: changePassword });

  async function onProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget)) as Record<string, string>;
    await profileMutation.mutateAsync({ full_name: data.full_name || undefined });
    if (user) setUser({ ...user, full_name: data.full_name || user.full_name });
    showToast("Profile updated", "success");
  }

  async function onPassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form)) as Record<string, string>;
    await passwordMutation.mutateAsync({
      current_password: data.current_password,
      new_password: data.new_password,
      confirm_password: data.confirm_password,
    });
    form.reset();
    showToast("Password changed", "success");
  }



  return (
    <div className="grid gap-8 md:grid-cols-2 pb-12 animate-page-enter">
      <form onSubmit={onProfile} className="glass-card flex flex-col rounded-[2rem] p-7 shadow-lg border border-[var(--border)]/50">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex size-9 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500 shadow-sm">
            <Monitor size={18} />
          </div>
          <h2 className="text-lg font-semibold text-[var(--foreground)] tracking-tight">Profile</h2>
        </div>
        <div className="gap-y-6 flex-1 flex flex-col">
          <TextField label="Full Name" name="full_name" defaultValue={user?.full_name ?? ""} autoComplete="name" placeholder="Your full name" className="text-xs" />
          <TextField label="Email Address" name="email" defaultValue={user?.email ?? ""} disabled className="text-xs opacity-80 cursor-not-allowed" />
        </div>
      </form>

      <form onSubmit={onPassword} className="glass-card flex flex-col rounded-[2rem] p-7 shadow-lg border border-[var(--border)]/50">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex size-9 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500 shadow-sm">
            <KeyRound size={18} />
          </div>
          <h2 className="text-lg font-semibold text-[var(--foreground)] tracking-tight">Security & Access</h2>
        </div>
        <div className="space-y-5">
          <TextField label="Current Password" name="current_password" type="password" autoComplete="current-password" className="text-xs" />
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField label="New Password" name="new_password" type="password" autoComplete="new-password" className="text-xs" />
            <TextField label="Confirm New" name="confirm_password" type="password" autoComplete="new-password" className="text-xs" />
          </div>
          <div className="flex justify-end pt-2">
            <Button type="submit" className="!w-auto px-6 !py-2.5 !rounded-xl font-medium uppercase tracking-widest text-[10px]" loading={passwordMutation.isPending} icon={<KeyRound size={14} />}>
              Update Security
            </Button>
          </div>
        </div>
      </form>



      {includeDeletion && (
        <div className="md:col-span-2 mt-4 pt-8 border-t border-[var(--border)]">
          <div className="glass-panel border-rose-500/20 bg-rose-500/[0.02] rounded-[2rem] p-1 shadow-sm">
             <div className="bg-[var(--card)] rounded-[1.9rem] p-8">
               <DeleteAccountPanel mode="account" />
             </div>
          </div>
        </div>
      )}
    </div>
  );
}

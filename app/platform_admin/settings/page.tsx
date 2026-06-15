"use client";

import { useMutation } from "@tanstack/react-query";
import { KeyRound, LogOut, Mail, Save, Shield, User as UserIcon } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/src/components/ui/button";
import { TextField } from "@/src/components/ui/form-field";
import { useToast } from "@/src/components/ui/toast";
import { DeleteAccountPanel } from "@/src/components/user/delete-account-panel";
import { changePassword, logout } from "@/src/features/auth/api";
import { useAuthStore } from "@/src/features/auth/store";

export default function PlatformSettingsPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const logoutMutation = useMutation({ mutationFn: logout });
  const passwordMutation = useMutation({ mutationFn: changePassword });

  async function onLogout() {
    await logoutMutation.mutateAsync().catch(() => null);
    setUser(null);
    router.replace("/login");
  }

  async function onPasswordSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    await passwordMutation.mutateAsync({
      current_password: (data.get("current_password") as string) || "",
      new_password: (data.get("new_password") as string) || "",
      confirm_password: (data.get("confirm_password") as string) || "",
    });
    form.reset();
    showToast("Password changed", "success");
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-10">
      <div className="glass-card rounded-[2rem] p-8">
        <h2 className="text-2xl font-semibold tracking-tight">Platform admin profile</h2>
        <p className="mt-2 text-sm font-medium text-[var(--muted)]">Manage this platform admin account, session access, and account deletion.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <section className="glass-card rounded-[2rem] p-7 shadow-lg border border-[var(--border)]/50">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500 shadow-sm">
              <UserIcon size={18} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[var(--foreground)] tracking-tight">Account details</h3>
              <p className="text-xs font-medium text-[var(--muted)]">Current authenticated platform admin</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/40 p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted)]">Name</p>
              <p className="mt-2 text-sm font-medium text-[var(--foreground)]">{user?.full_name ?? "Unavailable"}</p>
            </div>
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/40 p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted)]">Email</p>
              <div className="mt-2 flex items-center gap-2 text-sm font-medium text-[var(--foreground)]">
                <Mail size={14} className="text-[var(--muted)]" />
                <span>{user?.email ?? "Unavailable"}</span>
              </div>
            </div>
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/40 p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted)]">Role</p>
              <div className="mt-2 flex items-center gap-2 text-sm font-medium text-[var(--foreground)]">
                <Shield size={14} className="text-[var(--muted)]" />
                <span>platform_admin</span>
              </div>
            </div>
            <Button onClick={onLogout} loading={logoutMutation.isPending} icon={<LogOut size={16} />} className="w-full">
              Log out
            </Button>
          </div>
        </section>

        <form onSubmit={onPasswordSubmit} className="glass-card rounded-[2rem] p-7 shadow-lg border border-[var(--border)]/50">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500 shadow-sm">
              <KeyRound size={18} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[var(--foreground)] tracking-tight">Update password</h3>
              <p className="text-xs font-medium text-[var(--muted)]">Change this platform admin password securely.</p>
            </div>
          </div>
          <div className="space-y-4">
            <TextField label="Current password" name="current_password" type="password" autoComplete="current-password" required />
            <TextField label="New password" name="new_password" type="password" autoComplete="new-password" required />
            <TextField label="Confirm new password" name="confirm_password" type="password" autoComplete="new-password" required />
            <Button type="submit" loading={passwordMutation.isPending} icon={<Save size={16} />} className="w-full">
              Update password
            </Button>
          </div>
        </form>
      </div>

      <div className="glass-panel border-rose-500/20 bg-rose-500/[0.02] rounded-[2rem] p-1 shadow-sm">
        <div className="bg-[var(--card)] rounded-[1.9rem] p-8">
          <DeleteAccountPanel mode="account" />
        </div>
      </div>
    </div>
  );
}

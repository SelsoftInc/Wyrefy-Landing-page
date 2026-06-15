"use client";

import { useMutation } from "@tanstack/react-query";
import { BadgeCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import {  useEffect, useState } from "react";

import { AuthShell } from "@/src/components/auth/auth-shell";
import { TextField } from "@/src/components/ui/form-field";
import { useToast } from "@/src/components/ui/toast";
import { setupPassword } from "@/src/features/auth/api";
import { routeForUser } from "@/src/features/auth/routing";
import { setupPasswordSchema } from "@/src/features/auth/schemas";
import { useAuthStore } from "@/src/features/auth/store";

export default function SetupPasswordPage() {
  const { replace } = useRouter();
  const [error, setError] = useState("");
  const mutation = useMutation({ mutationFn: setupPassword });
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const { showToast } = useToast();

  useEffect(() => {
    if (!user) {
      replace("/login");
    } else if (!user.password_setup_required) {
      replace(routeForUser(user));
    }
  }, [user, replace]);

  if (!user) return null;

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    
    const formData = Object.fromEntries(new FormData(event.currentTarget));
    const parsed = setupPasswordSchema.safeParse(formData);
    
    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message ?? "Check the password details";
      setError(message);
      showToast(message, "error");
      return;
    }

    try {
      const result = await mutation.mutateAsync({
        new_password: parsed.data.new_password,
        confirm_password: parsed.data.confirm_password,
      });
      setUser(result.user);
      showToast("Password set successfully!", "success");
      replace(routeForUser(result.user));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Password setup failed";
      setError(message);
      showToast(message, "error");
    }
  }

  return (
    <AuthShell>
      <form onSubmit={onSubmit} className="space-y-3 sm:space-y-4">
        <div>
          <h2 className="text-xl font-semibold">Create your password</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Please set a new password to activate and secure your account before continuing.
          </p>
        </div>
        
        <TextField 
          label="New password" 
          name="new_password" 
          type="password" 
          placeholder="At least 8 characters, one number, one symbol" 
          autoComplete="new-password" 
        />
        
        <TextField 
          label="Confirm password" 
          name="confirm_password" 
          type="password" 
          placeholder="Re-enter your password" 
          autoComplete="new-password" 
        />

        {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}
        
        <button type="submit" className="primary-button" disabled={mutation.isPending}>
          <BadgeCheck size={18} />
          {mutation.isPending ? "Setting Password\u2026" : "Set Password & Continue"}
        </button>
      </form>
    </AuthShell>
  );
}

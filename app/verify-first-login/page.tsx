"use client";

import { useMutation } from "@tanstack/react-query";
import { BadgeCheck, RefreshCw } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import {  Suspense, useState } from "react";

import { AuthShell } from "@/src/components/auth/auth-shell";
import { TextField } from "@/src/components/ui/form-field";
import { useToast } from "@/src/components/ui/toast";
import { completeFirstLogin, resendFirstLogin } from "@/src/features/auth/api";
import { routeForUser } from "@/src/features/auth/routing";
import { firstLoginSchema } from "@/src/features/auth/schemas";
import { useAuthStore } from "@/src/features/auth/store";

function VerifyFirstLoginForm() {
  const { replace } = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");
  const mutation = useMutation({ mutationFn: completeFirstLogin });
  const resend = useMutation({ mutationFn: resendFirstLogin });
  const setUser = useAuthStore((state) => state.setUser);
  const { showToast } = useToast();
  const email = searchParams.get("email") ?? "";
  const step = searchParams.get("step") ?? "verify_first_login";
  const isPasswordReset = step === "reset_first_login_password";

  const headingCopy = isPasswordReset
    ? "Set your password"
    : "Verify and set your password";
  const subCopy = isPasswordReset
    ? "A verification code has been sent to your email. Set a new password to activate your account."
    : "A one-time code was sent to your email. Enter it below to activate your account.";

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const parsed = firstLoginSchema.safeParse(Object.fromEntries(new FormData(event.currentTarget)));
    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message ?? "Check the verification form";
      setError(message);
      showToast(message, "error");
      return;
    }
    try {
      const result = await mutation.mutateAsync(parsed.data);
      setUser(result.user);
      replace(routeForUser(result.user));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Verification failed";
      setError(message);
      showToast(message, "error");
    }
  }

  async function onResend() {
    if (!email) return;
    try {
      await resend.mutateAsync({ email });
      showToast("A new verification code has been emailed", "success");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Resend failed", "error");
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3 sm:space-y-4">
      <div>
        <h2 className="text-xl font-semibold">{headingCopy}</h2>
        <p className="mt-1 text-sm text-[var(--muted)]">{subCopy}</p>
      </div>
      <TextField label="Email" name="email" defaultValue={email} placeholder="you@company.com" autoComplete="email" />
      <TextField label="Verification code" name="code" placeholder="6 digit code" autoComplete="one-time-code" />
      <TextField 
        label="New password" 
        name="new_password" 
        type="password" 
        placeholder="At least 8 characters, one number, one symbol" 
        autoComplete="new-password" 
      />
      {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}
      <button type="submit" className="primary-button">
        <BadgeCheck size={18} />
        Verify and enter Wyrefy
      </button>
      <button
        type="button"
        onClick={onResend}
        disabled={resend.isPending || !email}
        className="secondary-button mt-1.5 sm:mt-2 w-full"
      >
        <RefreshCw size={16} className={resend.isPending ? "animate-spin" : ""} />
        Resend code
      </button>
    </form>
  );
}

export default function VerifyFirstLoginPage() {
  return (
    <AuthShell>
      <Suspense fallback={null}>
        <VerifyFirstLoginForm />
      </Suspense>
    </AuthShell>
  );
}

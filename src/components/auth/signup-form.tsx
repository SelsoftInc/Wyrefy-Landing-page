"use client";

import { useMutation } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {  useEffect, useState } from "react";

import { AuthShell } from "@/src/components/auth/auth-shell";
import { TextField } from "@/src/components/ui/form-field";
import { GoogleIcon } from "@/src/components/ui/google-icon";
import { useToast } from "@/src/components/ui/toast";
import { resendSignup, signup, startGoogleSignup, verifySignup } from "@/src/features/auth/api";
import { routeForUser } from "@/src/features/auth/routing";
import { signupSchema } from "@/src/features/auth/schemas";
import { useAuthStore } from "@/src/features/auth/store";
import { formString } from "@/src/shared/form-data";

export function SignupForm({ initialName, initialEmail }: Readonly<{ initialName: string; initialEmail: string }>) {
  const { replace } = useRouter();
  const [pendingEmail, setPendingEmail] = useState("");
  const [resendIn, setResendIn] = useState(0);
  const [resendCount, setResendCount] = useState(0);
  const mutation = useMutation({ mutationFn: signup });
  const verifyMutation = useMutation({ mutationFn: verifySignup });
  const resendMutation = useMutation({ mutationFn: resendSignup });
  const googleMutation = useMutation({ mutationFn: startGoogleSignup });
  const setUser = useAuthStore((state) => state.setUser);
  const { showToast } = useToast();

  useEffect(() => {
    if (resendIn > 0) {
      const timer = globalThis.setInterval(() => setResendIn((value) => Math.max(0, value - 1)), 1000);
      return () => globalThis.clearInterval(timer);
    }
    return undefined;
  }, [resendIn]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = signupSchema.safeParse(Object.fromEntries(new FormData(event.currentTarget)));
    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message ?? "Check your signup details";
      showToast(message, "error");
      return;
    }
    try {
      await mutation.mutateAsync(parsed.data);
      setPendingEmail(parsed.data.email);
      setResendIn(30);
      setResendCount(0);
      showToast("Verification code sent", "success");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Signup failed";
      showToast(message, "error");
    }
  }

  async function onVerify(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      const code = formString(new FormData(event.currentTarget), "code");
      const result = await verifyMutation.mutateAsync({ email: pendingEmail, code });
      setUser(result.user);
      const selectedPlan = sessionStorage.getItem("wyrefy-selected-plan");
      let nextPath = routeForUser(result.user);
      if (selectedPlan) {
        nextPath = result.user.user_type === "organization"
          ? `/organization/billing?plan=${selectedPlan}`
          : `/individual/billing?plan=${selectedPlan}`;
        sessionStorage.removeItem("wyrefy-selected-plan");
      }
      replace(nextPath);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Verification failed";
      showToast(message, "error");
    }
  }

  async function onResend() {
    if (resendCount >= 2) {
      showToast("Try after sometime", "error");
      return;
    }
    try {
      await resendMutation.mutateAsync({ email: pendingEmail });
      setResendCount((value) => value + 1);
      setResendIn(30);
      showToast("A new verification code has been emailed", "success");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Try after sometime", "error");
    }
  }

  async function onGoogle() {
    try {
      const result = await googleMutation.mutateAsync();
      globalThis.location.href = result.auth_url;
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Google signup failed", "error");
    }
  }

  const showSignupForm = pendingEmail === "";
  const showVerificationForm = pendingEmail.length > 0;
  const verifyButtonContent = verifyMutation.isPending ? (
    <>
      <Loader2 className="animate-spin size-4 shrink-0" />
      <span>Verifying...</span>
    </>
  ) : "Verify account";
  let resendButtonContent = "Resend code";
  if (resendMutation.isPending) {
    resendButtonContent = "Sending...";
  } else if (resendCount >= 2) {
    resendButtonContent = "Try after sometime";
  } else if (resendIn > 0) {
    resendButtonContent = `Resend in ${resendIn}s`;
  }

  return (
    <AuthShell>
      {showVerificationForm ? (
        <form key="verify" onSubmit={onVerify} className="space-y-3 sm:space-y-4">
          <p className="text-sm font-medium text-[var(--muted)]">Enter the verification code sent to {pendingEmail}.</p>
          <TextField label="Verification code" name="code" type="text" inputMode="numeric" placeholder="Enter 6 digit code" autoComplete="one-time-code" />
          <button type="submit" className="primary-button" disabled={verifyMutation.isPending || resendMutation.isPending}>
            {verifyButtonContent}
          </button>
          <button 
            type="button" 
            disabled={resendIn > 0 || resendCount >= 2 || verifyMutation.isPending || resendMutation.isPending} 
            onClick={onResend} 
            className="secondary-button disabled:opacity-50"
          >
            {resendMutation.isPending ? (
              <>
                <Loader2 className="animate-spin size-4 shrink-0" />
                <span>{resendButtonContent}</span>
              </>
            ) : resendButtonContent}
          </button>
        </form>
      ) : null}
      {showSignupForm ? (
        <form key="signup" onSubmit={onSubmit} className="space-y-3 sm:space-y-4">
          <TextField label="Full name" name="full_name" defaultValue={initialName} placeholder="Your full name" autoComplete="name" />
          <TextField label="Email" name="email" defaultValue={initialEmail} placeholder="you@company.com" autoComplete="email" />
          <TextField label="Password" name="password" type="password" placeholder="At least 8 characters, one number, one symbol" autoComplete="new-password" />
          <button type="submit" className="primary-button" disabled={mutation.isPending || googleMutation.isPending}>
            {mutation.isPending ? (
              <>
                <Loader2 className="animate-spin size-4 shrink-0" />
                <span>Creating account…</span>
              </>
            ) : (
              "Create account"
            )}
          </button>
        </form>
      ) : null}
      {showSignupForm ? (
        <>
          <div className="my-4 sm:my-5 flex items-center gap-3 text-xs font-medium uppercase tracking-[0.18em] text-[var(--muted)]">
            <span className="h-px flex-1 bg-[var(--border)]" />
            <span>or continue with</span>
            <span className="h-px flex-1 bg-[var(--border)]" />
          </div>
          <button 
            type="button"
            onClick={onGoogle} 
            className="secondary-button"
            disabled={mutation.isPending || googleMutation.isPending}
          >
            {googleMutation.isPending ? (
              <>
                <Loader2 className="animate-spin size-4 shrink-0" />
                <span>Connecting…</span>
              </>
            ) : (
              <>
                <GoogleIcon />
                <span>Continue with Google</span>
              </>
            )}
          </button>
        </>
      ) : null}
      <p className="mt-4 sm:mt-6 text-sm text-[var(--muted)]">
        Already registered?{" "}<Link href="/login" className="font-medium text-[var(--foreground)]">Log in</Link>
      </p>
    </AuthShell>
  );
}

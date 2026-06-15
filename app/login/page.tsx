"use client";

import { useMutation } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {  useState } from "react";

import { login, startGoogleLogin } from "@/src/features/auth/api";
import { routeForUser } from "@/src/features/auth/routing";
import { loginSchema } from "@/src/features/auth/schemas";
import { useAuthStore } from "@/src/features/auth/store";
import { AuthShell } from "@/src/components/auth/auth-shell";
import { TextField } from "@/src/components/ui/form-field";
import { GoogleIcon } from "@/src/components/ui/google-icon";
import { useToast } from "@/src/components/ui/toast";

function selectedPlanPath(userType: string, selectedPlan: string) {
  if (userType === "organization") return `/organization/billing?plan=${selectedPlan}`;
  return `/individual/billing?plan=${selectedPlan}`;
}

function loginErrorMessage(error: unknown) {
  if (error instanceof Error) {
    const lowerMessage = error.message.toLowerCase();
    if (error.message === "Invalid email or password" || error.message.includes("Invalid credentials") || lowerMessage.includes("deleted") || lowerMessage.includes("suspended")) {
      return "Invalid email or password";
    }
    return error.message;
  }
  return "Login failed";
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const mutation = useMutation({ mutationFn: login, onSuccess: () => router.refresh() });
  const googleMutation = useMutation({ mutationFn: startGoogleLogin, onSuccess: () => router.refresh() });
  const setUser = useAuthStore((state) => state.setUser);
  const { showToast } = useToast();

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget));
    const parsed = loginSchema.safeParse(data);
    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message ?? "Check your login details";
      showToast(message, "error");
      return;
    }
    try {
      const result = await mutation.mutateAsync(parsed.data);
      if (result.next_step === "authenticated" && result.user) {
        setUser(result.user);
        const selectedPlan = sessionStorage.getItem("wyrefy-selected-plan");
        
        let nextPath = routeForUser(result.user);
        if (selectedPlan) {
          // If a plan was selected before login, go to that specific billing page
          nextPath = selectedPlanPath(result.user.user_type, selectedPlan);

          sessionStorage.removeItem("wyrefy-selected-plan");
        }
        
        router.replace(nextPath);
      } else if (result.next_step !== "authenticated") {
        router.push(`/verify-first-login?email=${encodeURIComponent(parsed.data.email)}&step=${result.next_step}`);
      }
    } catch (err) {
      showToast(loginErrorMessage(err), "error");
    }
  }

  async function onGoogle() {
    try {
      const result = await googleMutation.mutateAsync();
      globalThis.location.href = result.auth_url;
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Google login failed", "error");
    }
  }

  const forgotPasswordHref = email ? `/forgot-password?email=${encodeURIComponent(email)}` : "/forgot-password";

  return (
    <AuthShell>
      <form onSubmit={onSubmit} className="space-y-3 sm:space-y-4">
        <TextField label="Email" name="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@company.com" autoComplete="email" />
        <TextField 
          label="Password" 
          name="password" 
          type="password" 
          placeholder="Enter your password" 
          autoComplete="current-password" 
        />

        <button type="submit" className="primary-button" disabled={mutation.isPending || googleMutation.isPending}>
          {mutation.isPending ? (
            <>
              <Loader2 className="animate-spin size-4 shrink-0" />
              <span>Signing in…</span>
            </>
          ) : (
            "Sign in"
          )}
        </button>
      </form>
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
      <div className="mt-4 sm:mt-6 flex justify-between gap-3 text-sm text-[var(--muted)]">
        <Link href={forgotPasswordHref}>Forgot password?</Link>
        <span>New user?{" "}<Link href="/signup" className="font-medium text-[var(--foreground)]">Signup</Link></span>
      </div>
      <p className="mt-4 sm:mt-6 text-center text-xs leading-5 text-[var(--muted)]">
        By continuing, you acknowledge that you understand and agree to the <Link href="/terms" className="font-medium text-[var(--foreground)]">Terms & Conditions</Link> and <Link href="/privacy" className="font-medium text-[var(--foreground)]">Privacy Policy</Link>
      </p>
    </AuthShell>
  );
}

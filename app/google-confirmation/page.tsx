"use client";

import { useMutation } from "@tanstack/react-query";
import { ShieldCheck, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

import { AuthShell } from "@/src/components/auth/auth-shell";
import { GoogleIcon } from "@/src/components/ui/google-icon";
import { useToast } from "@/src/components/ui/toast";
import { confirmGoogle } from "@/src/features/auth/api";
import { routeForUser } from "@/src/features/auth/routing";
import { useAuthStore } from "@/src/features/auth/store";

function GoogleConfirmationForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [error, setError] = useState("");
  const mutation = useMutation({ mutationFn: confirmGoogle, onSuccess: () => router.refresh() });
  const setUser = useAuthStore((state) => state.setUser);
  const state = searchParams.get("state") ?? "";
  const { showToast } = useToast();

  async function confirm() {
    setError("");
    try {
      const result = await mutation.mutateAsync({ state, confirm: true });
      setUser(result.user);
      
      const selectedPlan = sessionStorage.getItem("wyrefy-selected-plan");
      let nextPath = routeForUser(result.user);
      if (selectedPlan) {
        nextPath = result.user.user_type === "organization" 
          ? `/organization/billing?plan=${selectedPlan}` 
          : `/individual/billing?plan=${selectedPlan}`;
        sessionStorage.removeItem("wyrefy-selected-plan");
      }

      
      router.replace(nextPath);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Google confirmation failed";
      setError(message);
      showToast(message, "error");
    }
  }

  async function decline() {
    setError("");
    try {
      await mutation.mutateAsync({ state, confirm: false });
    } catch {
      router.replace("/login");
    }
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      <p className="glass-card flex gap-3 rounded-2xl p-3 sm:p-4 text-sm text-[var(--muted)]">
        <ShieldCheck className="mt-0.5 shrink-0 text-[var(--accent)]" size={18} />
        <span>This Google account matches a platform admin email. Confirm once to link it; future sign-ins can use Google directly.</span>
      </p>
      {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}
      <button type="button" onClick={confirm} className="primary-button">
        <GoogleIcon />
        Confirm Google login
      </button>
      <button type="button" onClick={decline} className="secondary-button">
        <X size={18} />
        Decline
      </button>
    </div>
  );
}

export default function GoogleConfirmationPage() {
  return (
    <AuthShell>
      <Suspense fallback={null}>
        <GoogleConfirmationForm />
      </Suspense>
    </AuthShell>
  );
}

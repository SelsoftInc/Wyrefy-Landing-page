"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {  Suspense, useState } from "react";

import { AuthShell } from "@/src/components/auth/auth-shell";
import { TextField } from "@/src/components/ui/form-field";
import { GoogleIcon } from "@/src/components/ui/google-icon";
import { useToast } from "@/src/components/ui/toast";
import { completeOrganizationInvite, previewOrganizationInvite, startGoogleInvite } from "@/src/features/auth/api";
import { queryKeys } from "@/src/features/query-keys";
import { routeForUser } from "@/src/features/auth/routing";
import { useAuthStore } from "@/src/features/auth/store";
import { formString } from "@/src/shared/form-data";

export default function InvitePage() {
  return (
    <Suspense fallback={null}>
      <InvitePageContent />
    </Suspense>
  );
}

function InvitePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [error, setError] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const accept = useMutation({ mutationFn: completeOrganizationInvite, onSuccess: () => router.refresh() });
  const google = useMutation({ mutationFn: startGoogleInvite, onSuccess: () => router.refresh() });
  const preview = useQuery({ queryKey: queryKeys.invitePreview(token), queryFn: () => previewOrganizationInvite(token), enabled: Boolean(token) });
  const setUser = useAuthStore((state) => state.setUser);
  const { showToast } = useToast();
  const needsConversionConfirmation = Boolean(preview.data?.existing_individual_account);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const data = new FormData(event.currentTarget);
    try {
      const result = await accept.mutateAsync({
        token,
        new_password: formString(data, "new_password"),
        confirm_password: formString(data, "confirm_password"),
        confirm_individual_conversion: confirmed,
      });
      setUser(result.user);
      router.replace(routeForUser(result.user));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Invite acceptance failed";
      setError(message);
      showToast(message, "error");
    }
  }

  async function onGoogle() {
    try {
      if (needsConversionConfirmation && !confirmed) {
        const message = "Confirm that joining this organization deletes individual projects.";
        setError(message);
        showToast(message, "error");
        return;
      }
      const result = await google.mutateAsync(token);
      globalThis.location.href = result.auth_url;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Google login failed";
      setError(message);
      showToast(message, "error");
    }
  }

  return (
    <AuthShell>
      <form onSubmit={onSubmit} className="space-y-3 sm:space-y-4">
        <p className="text-sm font-medium text-[var(--muted)]">Set your password to join the organization.</p>
        {needsConversionConfirmation ? (
          <label className="flex gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm font-medium text-[var(--foreground)]">
            <input
              type="checkbox"
              aria-label="Confirm account conversion"
              checked={confirmed}
              onChange={(event) => setConfirmed(event.target.checked)}
              className="mt-1 size-4 shrink-0"
              required
            />
            <span>
              I understand that joining this organization converts my individual account to organization context and deletes existing individual projects.
            </span>
          </label>
        ) : null}
        <TextField label="New password" name="new_password" type="password" placeholder="At least 8 characters, one number, one symbol" autoComplete="new-password" />
        <TextField label="Confirm password" name="confirm_password" type="password" placeholder="Re-enter password" autoComplete="new-password" />
        {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}
        <button type="submit" className="primary-button">Join organization</button>
      </form>
      <div className="my-4 sm:my-5 flex items-center gap-3 text-xs font-medium uppercase tracking-[0.18em] text-[var(--muted)]">
        <span className="h-px flex-1 bg-[var(--border)]" />
        <span>or continue with</span>
        <span className="h-px flex-1 bg-[var(--border)]" />
      </div>
      <button type="button" onClick={onGoogle} className="secondary-button">
        <GoogleIcon />
        Continue with Google
      </button>
      <p className="mt-4 sm:mt-6 text-sm text-[var(--muted)]">
        Existing member?{" "}<Link href="/login" className="font-medium text-[var(--foreground)]">Log in</Link>
      </p>
    </AuthShell>
  );
}

"use client";

import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import {  useState } from "react";

import { AuthShell } from "@/src/components/auth/auth-shell";
import { TextField } from "@/src/components/ui/form-field";
import { useToast } from "@/src/components/ui/toast";
import { forgotPassword } from "@/src/features/auth/api";
import { forgotPasswordSchema } from "@/src/features/auth/schemas";

export function ForgotPasswordForm({ initialEmail }: Readonly<{ initialEmail: string }>) {
  const [error, setError] = useState("");
  const mutation = useMutation({ mutationFn: forgotPassword });
  const { showToast } = useToast();

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const parsed = forgotPasswordSchema.safeParse(Object.fromEntries(new FormData(event.currentTarget)));
    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message ?? "Enter a valid email";
      setError(message);
      showToast(message, "error");
      return;
    }
    try {
      const result = await mutation.mutateAsync(parsed.data);
      showToast(result.message, "success");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Reset link request failed";
      setError(message);
      showToast(message, "error");
    }
  }

  return (
    <AuthShell>
      <form onSubmit={onSubmit} className="space-y-3 sm:space-y-4">
        <p className="text-sm font-medium text-[var(--muted)]">Enter your email and we&apos;ll send you a link to reset your password.</p>
        <TextField label="Email" name="email" defaultValue={initialEmail} placeholder="you@company.com" autoComplete="email" />
        {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}
        <button type="submit" className="primary-button">Send reset link</button>
      </form>
      <div className="mt-4 sm:mt-6 text-center">
        <Link href="/login" className="text-sm font-medium text-[var(--foreground)]">Back to login</Link>
      </div>
    </AuthShell>
  );
}

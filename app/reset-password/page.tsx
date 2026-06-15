"use client";

import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {  Suspense } from "react";

import { AuthShell } from "@/src/components/auth/auth-shell";
import { Button } from "@/src/components/ui/button";
import { TextField } from "@/src/components/ui/form-field";
import { useToast } from "@/src/components/ui/toast";
import { resetPassword } from "@/src/features/auth/api";
import { resetPasswordSchema } from "@/src/features/auth/schemas";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mutation = useMutation({ mutationFn: resetPassword, onSuccess: () => router.refresh() });
  const { showToast } = useToast();

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const data = Object.fromEntries(formData);
    const parsed = resetPasswordSchema.safeParse(data);
    
    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message ?? "Check the reset form";
      showToast(message, "error");
      return;
    }

    try {
      await mutation.mutateAsync(parsed.data);
      showToast("Password has been reset successfully. Please login with your new password.", "success");
      setTimeout(() => {
        router.replace("/login");
      }, 2000);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Reset failed";
      showToast(message, "error");
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3 sm:space-y-4">
      <input name="token" type="hidden" value={searchParams.get("token") ?? ""} readOnly />
      <TextField 
        label="New password" 
        name="new_password" 
        type="password" 
        placeholder="New Password" 
        autoComplete="new-password" 
        required
      />
      <p className="text-[10px] uppercase tracking-wider font-medium text-[var(--muted)] -mt-2">8+ chars, 1 number, 1 symbol</p>
      
      <TextField 
        label="Confirm password" 
        name="confirm_password" 
        type="password" 
        placeholder="Repeat your new password" 
        autoComplete="new-password" 
        required
      />

      <Button 
        type="submit"
        className="h-12 w-full mt-2"
        loading={mutation.isPending}
      >
        Reset password
      </Button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <AuthShell>
      <Suspense fallback={<div className="p-8 text-center font-medium animate-pulse">Loading reset form…</div>}>
        <ResetPasswordForm />
      </Suspense>
      <Link href="/login" className="mt-4 sm:mt-6 block text-sm font-medium hover:underline">Back to login</Link>
    </AuthShell>
  );
}

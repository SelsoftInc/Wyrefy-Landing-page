"use client";

import { useMutation } from "@tanstack/react-query";
import { AlertTriangle, Trash2 } from "lucide-react";
import {  useState } from "react";
import { useRouter } from "next/navigation";

import { deleteAccount, deleteOrganization, reauthenticate } from "@/src/features/settings/api";
import { TextField } from "@/src/components/ui/form-field";
import { formString } from "@/src/shared/form-data";

type DeleteAccountPanelProps = Readonly<{
  mode: "account" | "organization";
  organizationName?: string;
}>;

export function DeleteAccountPanel({ mode, organizationName }: DeleteAccountPanelProps) {
  const { replace } = useRouter();
  const [message, setMessage] = useState("");
  const mutation = useMutation({ mutationFn: deleteWithReauth, onSuccess: () => replace("/login") });
  const target = mode === "organization" ? "organization" : "account";
  const required = mode === "organization" ? organizationName || "" : "DELETE";

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    const data = new FormData(event.currentTarget);
    await mutation
      .mutateAsync({
        current_password: formString(data, "current_password"),
        confirmation: formString(data, "confirmation"),
      })
      .catch((error) => setMessage(error.message));
  }

  async function deleteWithReauth(payload: { current_password: string; confirmation: string }) {
    await reauthenticate({ current_password: payload.current_password });
    return mode === "organization"
      ? deleteOrganization({ confirmation: payload.confirmation })
      : deleteAccount({ confirmation: payload.confirmation });
  }

  return (
    <section className="glass-card rounded-[2rem] border border-red-500/20 p-8 transition-all duration-300 hover:border-red-500/30">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-1 text-red-400" size={22} />
        <div>
          <h2 className="text-xl font-semibold text-[var(--foreground)]">Delete {target}</h2>
          <p className="mt-2 text-sm text-[var(--muted)]">
            This disables access immediately and keeps billing, audit, and usage history for retention.
          </p>
        </div>
      </div>
      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <TextField
          label="Current password"
          name="current_password"
          type="password"
          placeholder="Current password for recent re-auth"
          required
        />
        <TextField
          label={`Confirmation (Type ${required})`}
          name="confirmation"
          placeholder={required}
          required
        />
        <button 
          type="submit"
          disabled={mutation.isPending} 
          className="primary-button h-12 w-full !bg-gradient-to-r !from-red-600 !to-red-700 !shadow-red-500/20"
        >
          <Trash2 size={18} />
          {mutation.isPending ? "Checking..." : "Delete Account"}
        </button>
      </form>
      {message ? <p className="mt-3 text-sm font-medium text-red-300">{message}</p> : null}
    </section>
  );
}

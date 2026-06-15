"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { CreditCard, ChevronRight, Info } from "lucide-react";
import { useState } from "react";
import { createPortal } from "react-dom";

import { createSubscriptionCheckout, publicPlans } from "@/src/features/auth/api";
import { queryKeys } from "@/src/features/query-keys";

export function BillingModal({
  open,
  onClose,
  initialPlanSlug = null,
  onCheckout,
  ownerType = "individual",
}: Readonly<{
  open: boolean;
  onClose: () => void;
  initialPlanSlug?: string | null;
  onCheckout?: (planSlug: string) => Promise<string>;
  ownerType?: "individual" | "organization";
}>) {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(open ? initialPlanSlug : null);
  const plans = useQuery({ queryKey: queryKeys.publicPlans(ownerType), queryFn: () => publicPlans(ownerType) });
  const checkout = useMutation({
    mutationFn: async (planSlug: string) => {
      if (onCheckout) {
        return await onCheckout(planSlug);
      }
      const session = await createSubscriptionCheckout({ plan_slug: planSlug });
      return session.checkout_url;
    },
    onSuccess: (url) => {
      globalThis.location.href = url;
      onClose();
    },
  });

  if (!open) return null;
  const content = (
    <dialog open aria-label="Billing Modal" className="fixed inset-0 z-[100] flex items-center justify-center bg-white/40 dark:bg-black/60 p-4 backdrop-blur-md border-none m-0 w-full h-full max-w-none max-h-none overflow-hidden">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 w-full h-full bg-transparent border-none appearance-none cursor-default"
      />
      <div className="glass-panel relative z-10 flex flex-col max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-[2.5rem] p-0 shadow-2xl shadow-blue-500/20 bg-[var(--card)] border border-[var(--border)]">
        <div className="flex h-full flex-col min-h-0">
          <div className="p-8 pb-4 shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-semibold tracking-tight text-[var(--foreground)]">Upgrade Plan</h2>
                <p className="mt-1 text-sm font-medium text-[var(--muted)]">Select the best tier for your organization.</p>
              </div>
              <button 
                type="button"
                onClick={onClose} 
                className="flex size-10 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] hover:bg-[var(--surface)]/80 hover:text-[var(--foreground)] transition-all"
              >
                <ChevronRight size={20} className="rotate-90" />
              </button>
            </div>
          </div>

          <div data-lenis-prevent="true" className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-8 pt-4">
            <div className="grid gap-4">
              {(plans.data ?? []).reduce<React.JSX.Element[]>((acc, p) => {
                if (p.slug !== "enterprise" && p.tenant_type === ownerType) {
                  const isSelected = selectedPlan === p.slug;
                  acc.push(
                    <button 
                      key={p.slug} 
                      type="button"
                      onClick={() => setSelectedPlan(p.slug)} 
                      className={`group relative flex items-center justify-between overflow-hidden rounded-[1.5rem] border p-6 text-left transition-all ${
                        isSelected 
                          ? "border-blue-500/50 bg-blue-500/5 shadow-lg shadow-blue-500/10" 
                          : "border-[var(--border)] bg-[var(--surface)]/40 hover:border-[var(--border)]/80 hover:bg-[var(--surface)]/60"
                      }`}
                    >
                      <div className="flex items-center gap-5">
                        <div className={`flex size-12 items-center justify-center rounded-2xl transition-all ${
                          isSelected ? "bg-blue-500 text-white shadow-lg shadow-blue-500/30" : "bg-[var(--surface)] text-[var(--muted)] group-hover:bg-[var(--surface)]/80"
                        }`}>
                          <CreditCard size={24} />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-[var(--foreground)]">{p.name}</h3>
                          <p className="text-xs font-medium text-[var(--muted)] uppercase tracking-wider">
                            {String(p.limits_json.projects ?? "Custom")} projects • {String(p.limits_json.credits ?? p.included_credits)} credits
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-semibold text-[var(--foreground)]">${Math.round(p.price_cents / 100)}</p>
                        <p className="text-[10px] font-bold text-[var(--muted)] uppercase">per month</p>
                      </div>
                      {isSelected && (
                        <div className="absolute left-0 top-0 h-full w-1 bg-blue-500" />
                      )}
                    </button>
                  );
                }
                return acc;
              }, [])}
            </div>

            {selectedPlan && (
              <div className="mt-8 space-y-6">
                <div className="rounded-2xl bg-blue-500/5 border border-blue-500/10 p-5">
                  <div className="flex gap-3">
                    <Info size={18} className="shrink-0 text-blue-400" />
                    <p className="text-xs font-medium leading-relaxed text-blue-400/70">
                      Your subscription activates only after Stripe confirms the transaction. 
                      You will be redirected to Stripe&apos;s secure portal to complete your purchase.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button 
                    type="button"
                    onClick={() => setSelectedPlan(null)} 
                    className="secondary-button flex-1"
                  >
                    Back
                  </button>
                  <button 
                    type="button"
                    onClick={() => checkout.mutate(selectedPlan)} 
                    className="primary-button flex-1" 
                    disabled={checkout.isPending}
                  >
                    {checkout.isPending ? "Connecting..." : "Confirm & Pay"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </dialog>
  );

  return typeof document !== "undefined" ? createPortal(content, document.body) : null;
}

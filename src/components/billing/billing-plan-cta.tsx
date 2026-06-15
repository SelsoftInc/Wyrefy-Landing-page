"use client";

import { CreditCard, Zap } from "lucide-react";

type BillingPlanCTAProps = Readonly<{
  onOpenPlans: () => void;
}>;

export function BillingPlanCTA({ onOpenPlans }: BillingPlanCTAProps) {
  return (
    <section className="glass-panel relative overflow-hidden rounded-[2.5rem] p-12 text-center shadow-2xl">
      <div className="relative z-10">
        <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-500 mb-6">
          <CreditCard size={32} />
        </div>
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-blue-400/60 mb-2">Setup Required</p>
        <h1 className="text-3xl font-semibold text-[var(--foreground)]">Activate your account billing</h1>
        <p className="mt-4 mx-auto max-w-md text-sm font-medium leading-relaxed text-[var(--muted)]">
          Wyrefy requires an active subscription to enable project creation and credit grants. Choose a plan to get started.
        </p>
        <button type="button" onClick={onOpenPlans} className="primary-button mt-8 !w-auto px-10">
          <Zap size={18} />
          Choose Your Plan
        </button>
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent" />
    </section>
  );
}

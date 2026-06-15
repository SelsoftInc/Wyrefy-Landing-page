"use client";

import { Zap, ExternalLink, RefreshCw } from "lucide-react";
import { StatusBadge } from "@/src/components/billing/billing-status-badge";

type SubscriptionCardProps = Readonly<{
  planName: string;
  status: string;
  cancelAtPeriodEnd: boolean;
  priceCents: number;
  periodEnd: string | null;
  onPortal: () => void;
  onUpgrade: () => void;
  onToggleAutoRenew: () => void;
  isToggling: boolean;
}>;

const moneyFormatter = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const dateFormatter = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" });
const money = (cents: number) => moneyFormatter.format(cents / 100);
const dateLabel = (value: string | null) => (value ? dateFormatter.format(new Date(value)) : "No end date");

export function BillingSubscriptionCard({ 
  planName, 
  status, 
  cancelAtPeriodEnd, 
  priceCents, 
  periodEnd, 
  onPortal, 
  onUpgrade, 
  onToggleAutoRenew,
  isToggling
}: SubscriptionCardProps) {
  return (
    <section className="glass-panel group relative rounded-[2rem] p-1 shadow-xl transition-all hover:shadow-blue-500/5 z-10">
      <div className="relative z-20 flex h-full flex-col bg-[var(--card)] rounded-[1.9rem] p-6 backdrop-blur-xl">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="flex size-6 items-center justify-center rounded-md bg-blue-500/10 text-blue-500">
                <Zap size={12} />
              </div>
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-blue-500/60">Subscription</p>
            </div>
            <h2 className="text-3xl font-semibold tracking-tight text-[var(--foreground)]">{planName}</h2>
            <div className="flex items-center gap-2.5 pt-1.5">
              <StatusBadge status={status} />
              {cancelAtPeriodEnd && (
                <span className="text-[9px] font-bold text-rose-500 uppercase tracking-widest bg-rose-500/10 px-2.5 py-1 rounded-full border border-rose-500/20">Ending Soon</span>
              )}
            </div>
          </div>
          <button 
            type="button"
            onClick={onUpgrade}
            className="text-[10px] font-bold text-blue-500 uppercase tracking-widest hover:underline px-2 py-1"
          >
            Change Plan
          </button>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-4 border-t border-[var(--border)] pt-6">
          <div className="space-y-1">
            <p className="text-[9px] font-bold text-[var(--muted)] uppercase tracking-wider">Price</p>
            <p className="text-sm font-medium text-[var(--foreground)]">{money(priceCents)}<span className="text-[10px] text-[var(--muted)] font-medium ml-1">/ month</span></p>
          </div>
          <div className="space-y-1 text-center">
            <p className="text-[9px] font-bold text-[var(--muted)] uppercase tracking-wider">Renewal Date</p>
            <p className="text-sm font-medium text-[var(--foreground)]">{dateLabel(periodEnd)}</p>
          </div>
          <div className="space-y-1 text-right">
            <p className="text-[9px] font-bold text-[var(--muted)] uppercase tracking-wider">Renewal</p>
            <p className={`text-sm font-medium ${cancelAtPeriodEnd ? 'text-rose-500' : 'text-emerald-500'}`}>
              {cancelAtPeriodEnd ? "Inactive" : "Active"}
            </p>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-3">
          <button 
            type="button"
            onClick={onPortal} 
            className="primary-button !py-2.5 flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest"
          >
            <ExternalLink size={14} />
            Manage Billing
          </button>
          <button 
            type="button"
            onClick={onToggleAutoRenew}
            disabled={isToggling || status !== "active"}
            className="secondary-button !py-2.5 flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest"
          >
            <RefreshCw size={14} className={isToggling ? "animate-spin" : ""} />
            {cancelAtPeriodEnd ? "Enable Renew" : "Disable Renew"}
          </button>
        </div>
      </div>
      <div className="absolute -right-20 -top-20 size-64 rounded-full bg-blue-600/5 blur-[80px] pointer-events-none" />
      <div className="absolute -left-20 -bottom-20 size-64 rounded-full bg-blue-600/5 blur-[80px] pointer-events-none" />
    </section>
  );
}

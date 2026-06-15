"use client";

import { ChevronRight, FileText, ExternalLink } from "lucide-react";
import { createPortal } from "react-dom";
import { StatusBadge } from "@/src/components/billing/billing-status-badge";

type Invoice = {
  id: string;
  amount_paid_cents: number;
  amount_due_cents: number;
  status: string;
  paid_at: string | null;
  created_at: string;
  hosted_invoice_url: string | null;
};

type BillingHistoryModalProps = Readonly<{
  invoices: Invoice[];
  onClose: () => void;
}>;

const moneyFormatter = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const dateFormatter = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" });
const money = (cents: number) => moneyFormatter.format(cents / 100);
const dateLabel = (value: string | null) => (value ? dateFormatter.format(new Date(value)) : "Not set");

export function BillingHistoryModal({ invoices, onClose }: BillingHistoryModalProps) {
  const content = (
    <dialog
      open
      aria-label="Invoice History"
      className="fixed inset-0 z-[110] flex items-center justify-center bg-white/40 dark:bg-black/60 backdrop-blur-md p-4 border-none m-0 w-full h-full max-w-none max-h-none overflow-hidden"
    >
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 w-full h-full bg-transparent border-none appearance-none cursor-default"
      />
      <div 
        className="glass-panel relative z-10 flex flex-col w-full max-w-xl max-h-[85vh] bg-[var(--card)] shadow-2xl rounded-[3rem] overflow-hidden animate-page-enter border border-[var(--border)]"
      >
        <div className="p-10 pb-6 shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-semibold text-[var(--foreground)] tracking-tight">Invoice History</h2>
              <p className="text-xs font-medium text-[var(--muted)] uppercase tracking-[0.2em] mt-1">Transaction Log</p>
            </div>
            <button type="button" onClick={onClose} className="size-12 flex items-center justify-center rounded-2xl bg-[var(--surface)] hover:bg-[var(--surface)]/80 text-[var(--muted)] transition-all">
              <ChevronRight size={24} className="rotate-90" />
            </button>
          </div>
        </div>

        <div data-lenis-prevent="true" className="flex-1 min-h-0 overflow-y-auto p-10 pt-0 space-y-4 custom-scrollbar">
          {invoices.map((invoice) => (
            <div key={invoice.id} className="group flex items-center justify-between rounded-[2rem] border border-[var(--border)] bg-[var(--surface)]/40 p-6 transition-all hover:bg-[var(--surface)]/60">
              <div className="flex items-center gap-5">
                <div className="flex size-14 items-center justify-center rounded-2xl bg-[var(--surface)]/60 group-hover:bg-blue-500/10 transition-colors">
                  <FileText size={22} className="text-[var(--muted)]/40 group-hover:text-blue-400 transition-colors" />
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <p className="text-xl font-semibold text-[var(--foreground)]/90">{money(invoice.amount_paid_cents || invoice.amount_due_cents)}</p>
                    <StatusBadge status={invoice.status} />
                  </div>
                  <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-[0.2em] mt-1">{dateLabel(invoice.paid_at ?? invoice.created_at)}</p>
                </div>
              </div>
              {invoice.hosted_invoice_url && (
                <a href={invoice.hosted_invoice_url} className="flex size-12 items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--surface)]/60 text-[var(--muted)] hover:bg-blue-500 hover:text-white hover:border-blue-500 transition-all" target="_blank" rel="noreferrer">
                  <ExternalLink size={20} />
                </a>
              )}
            </div>
          ))}
          {invoices.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 text-white/20">
              <FileText size={64} className="mb-6 stroke-[1]" />
              <p className="text-xs font-medium uppercase tracking-[0.3em]">No Activity Logged</p>
            </div>
          )}
        </div>
        <div className="p-10 pt-0 shrink-0">
          <button type="button" onClick={onClose} className="secondary-button !rounded-[1.5rem]">Close Log</button>
        </div>
      </div>
    </dialog>
  );

  return typeof document !== "undefined" ? createPortal(content, document.body) : null;
}

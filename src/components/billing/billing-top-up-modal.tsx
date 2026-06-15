"use client";

import { ChevronRight, RefreshCw, AlertTriangle, CheckCircle2, Activity } from "lucide-react";
import { createPortal } from "react-dom";
import type { AutoTopUpSettings } from "@/src/features/auth/types";

type BillingTopUpModalProps = Readonly<{
  topUp: AutoTopUpSettings | null | undefined;
  onClose: () => void;
  onSave: (settings: AutoTopUpSettings) => void;
  isSaving: boolean;
  onDraftChange: (draft: AutoTopUpSettings) => void;
}>;

const emailList = (value: string) => value.split(",").flatMap((item) => {
  const trimmed = item.trim();
  return trimmed ? [trimmed] : [];
});
const hasInvalidEmails = (value: string) => emailList(value).some((item) => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(item));

export function BillingTopUpModal({ topUp, onClose, onSave, isSaving, onDraftChange }: BillingTopUpModalProps) {
  const content = (
    <dialog 
      open
      aria-label="Auto Top-Up Settings"
      className="fixed inset-0 z-[110] flex items-center justify-center bg-white/40 dark:bg-black/60 backdrop-blur-md p-4 border-none m-0 w-full h-full max-w-none max-h-none overflow-hidden"
    >
      <button 
        type="button"
        aria-label="Close modal"
        onClick={onClose}
        className="absolute inset-0 w-full h-full bg-transparent border-none appearance-none cursor-default"
      />
      <div className="glass-panel relative z-10 flex flex-col w-full max-w-xl max-h-[90vh] bg-[var(--card)] shadow-2xl rounded-[3rem] overflow-hidden animate-page-enter border border-[var(--border)]">
        <div className="p-10 pb-6 shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-semibold text-[var(--foreground)] tracking-tight">Auto Top-Up</h2>
              <p className="text-xs font-medium text-[var(--muted)] uppercase tracking-[0.2em] mt-1">Smart Refill Configuration</p>
            </div>
            <button aria-label="Close" type="button" onClick={onClose} className="size-12 flex items-center justify-center rounded-2xl bg-[var(--surface)] hover:bg-[var(--surface)]/80 text-[var(--muted)] transition-all">
              <ChevronRight size={24} className="rotate-90" />
            </button>
          </div>
        </div>

        <div data-lenis-prevent="true" className="flex-1 min-h-0 overflow-y-auto p-10 pt-0 space-y-8 custom-scrollbar">
          {topUp ? (
            <div className="space-y-8">
              <div className="flex items-center justify-between rounded-[2rem] border border-[var(--border)] bg-[var(--surface)]/40 p-7">
                <div className="space-y-1">
                  <p className="text-lg font-semibold text-[var(--foreground)]">Service Active</p>
                  <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-widest">Automatic purchases enabled</p>
                </div>
                  <button 
                    type="button"
                    aria-label="Toggle Service Active"
                    onClick={() => onDraftChange({ ...topUp, enabled: !topUp.enabled })}
                    className={`relative h-8 w-14 shrink-0 cursor-pointer rounded-full transition-colors duration-300 ease-in-out ${topUp.enabled ? 'bg-blue-500' : 'bg-[var(--surface)]/40'}`}
                  >
                    <span className={`inline-block size-6 transform rounded-full bg-white shadow-xl transition duration-300 ease-in-out ${topUp.enabled ? 'translate-x-7' : 'translate-x-1'}`} />
                  </button>
              </div>

              <div className="space-y-6">
                <div className="space-y-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-blue-400/80 px-2">Threshold Logic</p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <TopUpInput label="Threshold %" value={topUp.threshold_percentage} onChange={(value) => onDraftChange({ ...topUp, threshold_percentage: value })} />
                    <TopUpInput label="Amount ($)" value={Math.round(topUp.purchase_amount_cents / 100)} onChange={(value) => onDraftChange({ ...topUp, purchase_amount_cents: value * 100 })} />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <TopUpInput label="Credit Yield" value={Number(topUp.credit_amount)} onChange={(value) => onDraftChange({ ...topUp, credit_amount: String(value) })} />
                    <TopUpInput label="Max Per Cycle" value={topUp.max_purchase_count_per_cycle} onChange={(value) => onDraftChange({ ...topUp, max_purchase_count_per_cycle: value })} />
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-blue-400/80 px-2">Smart Alerts</p>
                  <div className="space-y-2">
                    <label htmlFor="recipient-emails" className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider px-2">Recipient Emails</label>
                    <input
                      id="recipient-emails"
                      aria-label="Recipient Emails"
                      className="input-field !bg-[var(--surface)]/30 !border-[var(--border)] focus:!border-blue-500/50 !rounded-2xl"
                      value={topUp.notification_emails.join(", ")}
                      onChange={(event) => onDraftChange({ ...topUp, notification_emails: emailList(event.target.value) })}
                      placeholder="ops@company.com"
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="flex items-center gap-4 group cursor-pointer bg-[var(--surface)]/20 border border-[var(--border)] p-5 rounded-[1.5rem] hover:bg-[var(--surface)]/40 transition-all">
                      <div className={`flex size-6 items-center justify-center rounded-lg border-2 transition-all ${topUp.notify_on_success ? 'bg-blue-500 border-blue-500 scale-110 shadow-lg shadow-blue-500/20' : 'bg-[var(--surface)]/20 border-[var(--border)]'}`}>
                        <input type="checkbox" aria-label="Success Alerts" className="hidden" checked={topUp.notify_on_success} onChange={(event) => onDraftChange({ ...topUp, notify_on_success: event.target.checked })} />
                        {topUp.notify_on_success && <CheckCircle2 size={14} className="text-white" />}
                      </div>
                      <span className="text-sm font-medium text-[var(--foreground)]/80">Success Alerts</span>
                    </label>
                    <label className="flex items-center gap-4 group cursor-pointer bg-[var(--surface)]/20 border border-[var(--border)] p-5 rounded-[1.5rem] hover:bg-[var(--surface)]/40 transition-all">
                      <div className={`flex size-6 items-center justify-center rounded-lg border-2 transition-all ${topUp.notify_on_failure ? 'bg-amber-500 border-amber-500 scale-110 shadow-lg shadow-amber-500/20' : 'bg-[var(--surface)]/20 border-[var(--border)]'}`}>
                        <input type="checkbox" aria-label="Failure Alerts" className="hidden" checked={topUp.notify_on_failure} onChange={(event) => onDraftChange({ ...topUp, notify_on_failure: event.target.checked })} />
                        {topUp.notify_on_failure && <AlertTriangle size={14} className="text-white" />}
                      </div>
                      <span className="text-sm font-medium text-[var(--foreground)]/80">Failure Alerts</span>
                    </label>
                  </div>
                </div>
              </div>

              {topUp.failure_state && (
                <div className="flex gap-5 rounded-[2rem] bg-amber-500/5 border border-amber-500/20 p-8">
                  <AlertTriangle size={24} className="shrink-0 text-amber-500" />
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-amber-500 uppercase tracking-[0.3em]">Critical Alert</p>
                    <p className="text-base font-medium leading-relaxed text-amber-500/80">{topUp.last_failure_reason ?? topUp.failure_state}</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-white/20">
              <RefreshCw className="animate-spin mb-6" size={32} />
              <p className="text-xs font-medium uppercase tracking-[0.3em]">Synchronizing…</p>
            </div>
          )}
        </div>
        <div className="p-10 pt-0 flex gap-4">
          <button type="button" onClick={onClose} className="secondary-button flex-1 !rounded-[1.5rem]">Cancel</button>
          <button 
            type="button"
            onClick={() => topUp && onSave(topUp)} 
            className="primary-button flex-1 !rounded-[1.5rem]" 
            disabled={!topUp || isSaving || hasInvalidEmails(topUp.notification_emails.join(", "))}
          >
            {isSaving ? "Applying..." : "Save Settings"}
          </button>
        </div>
      </div>
    </dialog>
  );

  return typeof document !== "undefined" ? createPortal(content, document.body) : null;
}

function TopUpInput({ label, value, onChange }: Readonly<{ label: string; value: number; onChange: (value: number) => void }>) {
  return (
    <label className="block space-y-2">
      <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--muted)] px-1">{label}</span>
      <div className="relative">
        <input
          type="number"
          min={1}
          value={value}
          aria-label={label}
          onChange={(event) => onChange(Number(event.target.value))}
          className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)]/30 px-5 py-3.5 text-sm font-medium text-[var(--foreground)] outline-none focus:border-blue-500/50 transition-all"
        />
        <div className="absolute right-4 top-1/2 -translate-y-1/2">
          <Activity size={14} className="text-white/10" />
        </div>
      </div>
    </label>
  );
}

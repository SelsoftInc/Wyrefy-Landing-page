"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { 
  ChevronRight,
  CreditCard,
  FileText, 
  Loader2,
  RefreshCw,
  Settings, 
} from "lucide-react";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";

import {
  autoTopUpSettings,
  billingSummary,
  createCreditCheckout,
  createCustomerPortal,
  createOrganizationCreditCheckout,
  createOrganizationCustomerPortal,
  createOrganizationSubscriptionCheckout,
  createSubscriptionCheckout,
  invoices,
  organizationAutoTopUpSettings,
  organizationBillingSummary,
  organizationInvoices,
  updateAutoRenew,
  updateAutoTopUpSettings,
  updateOrganizationAutoRenew,
  updateOrganizationAutoTopUpSettings,
} from "@/src/features/auth/api";
import type { AutoTopUpSettings } from "@/src/features/auth/types";
import { reconcileCheckout, reconcileOrganizationCheckout } from "@/src/features/billing/api";
import { queryKeys } from "@/src/features/query-keys";

import { BillingModal } from "@/src/components/billing/billing-modal";
import { BillingPlanCTA } from "@/src/components/billing/billing-plan-cta";
import { BillingSubscriptionCard } from "@/src/components/billing/billing-subscription-card";
import { BillingWalletCard } from "@/src/components/billing/billing-wallet-card";
import { BillingHistoryModal } from "@/src/components/billing/billing-history-modal";
import { BillingTopUpModal } from "@/src/components/billing/billing-top-up-modal";
import { useToast } from "@/src/components/ui/toast";

type OwnerType = "individual" | "organization";

type BillingDashboardProps = Readonly<{
  ownerType: OwnerType;
  ownerScopeId: string;
  initialPlanSlug?: string | null;
  onSubscriptionCheckout?: (planSlug: string) => Promise<string>;
  checkoutSuccess?: boolean;
  checkoutCancelled?: boolean;
  checkoutSessionId?: string | null;
}>;

const creditPacks = [
  { label: "$25", amount: 2500, credits: "250" },
  { label: "$75", amount: 7500, credits: "850" },
  { label: "$150", amount: 15000, credits: "1900" },
];

function billingApiForOwner(ownerType: OwnerType) {
  if (ownerType === "organization") {
    return {
      summary: organizationBillingSummary,
      invoices: organizationInvoices,
      topUpSettings: organizationAutoTopUpSettings,
      createPortal: createOrganizationCustomerPortal,
      createCreditCheckout: createOrganizationCreditCheckout,
      createSubscriptionCheckout: createOrganizationSubscriptionCheckout,
      updateAutoRenew: updateOrganizationAutoRenew,
      updateTopUpSettings: updateOrganizationAutoTopUpSettings,
      reconcileCheckout: reconcileOrganizationCheckout,
    };
  }
  return {
    summary: billingSummary,
    invoices,
    topUpSettings: autoTopUpSettings,
    createPortal: createCustomerPortal,
    createCreditCheckout,
    createSubscriptionCheckout,
    updateAutoRenew,
    updateTopUpSettings: updateAutoTopUpSettings,
    reconcileCheckout,
  };
}

export function BillingDashboard({ ownerType, ownerScopeId, initialPlanSlug = null, onSubscriptionCheckout, checkoutSuccess, checkoutCancelled, checkoutSessionId = null }: BillingDashboardProps) {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [modalOpen, setModalOpen] = useState(Boolean(initialPlanSlug));
  const [topUpOpen, setTopUpOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [topUpDraft, setTopUpDraft] = useState<AutoTopUpSettings | null>(null);
  const isOrg = ownerType === "organization";
  const ownerApi = billingApiForOwner(ownerType);
  const [timedOut, setTimedOut] = useState(false);

  const summaryKey = queryKeys.billingSummary(ownerType, ownerScopeId);
  const invoicesKey = queryKeys.billingInvoices(ownerType, ownerScopeId);
  const topUpKey = queryKeys.billingAutoTopUp(ownerType, ownerScopeId);
  const summaryQuery = useQuery({ queryKey: summaryKey, queryFn: ownerApi.summary });
  const invoicesQuery = useQuery({ queryKey: invoicesKey, queryFn: ownerApi.invoices });
  const topUpQuery = useQuery({ queryKey: topUpKey, queryFn: ownerApi.topUpSettings });
  const reconcileQuery = useQuery({
    queryKey: queryKeys.billingCheckoutReconcile(ownerType, ownerScopeId, String(checkoutSessionId)),
    queryFn: () => {
      const payload = { stripe_checkout_session_id: String(checkoutSessionId) };
      return ownerApi.reconcileCheckout(payload);
    },
    enabled: Boolean(checkoutSuccess && checkoutSessionId),
    retry: 3,
    retryDelay: 2000,
    staleTime: Infinity,
  });

  const portal = useMutation({
    mutationFn: ownerApi.createPortal,
    onSuccess: (result) => { globalThis.location.href = result.portal_url; },
  });

  const creditCheckout = useMutation({
    mutationFn: async (pack: (typeof creditPacks)[number]) => {
      const payload = { purchase_amount_cents: pack.amount, credit_amount: pack.credits };
      return ownerApi.createCreditCheckout(payload);
    },
    onSuccess: (result) => { globalThis.location.href = result.checkout_url; },
  });

  const autoRenew = useMutation({
    mutationFn: ownerApi.updateAutoRenew,
    onSuccess: async () => {
      showToast("Auto-renew updated", "success");
      await queryClient.invalidateQueries({ queryKey: summaryKey });
    },
    onError: (err) => { showToast(err instanceof Error ? err.message : "Auto-renew update failed", "error"); },
  });

  const saveTopUp = useMutation({
    mutationFn: ownerApi.updateTopUpSettings,
    onSuccess: async (result) => {
      setTopUpDraft(result);
      await queryClient.invalidateQueries({ queryKey: topUpKey });
      await queryClient.invalidateQueries({ queryKey: summaryKey });
      setTopUpOpen(false);
    },
  });

  const summary = summaryQuery.data;
  const topUp = topUpDraft ?? topUpQuery.data;
  const checkoutPending = checkoutSuccess && !summaryQuery.isLoading && summary?.subscription_status !== "active";
  const needsPlan = !isOrg && !summaryQuery.isLoading && summary?.subscription_status !== "active";

  useEffect(() => {
    if (!checkoutPending) return;
    const interval = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: summaryKey });
    }, 3000);
    return () => clearInterval(interval);
  }, [checkoutPending, ownerScopeId, ownerType, queryClient, summaryKey]);

  useEffect(() => {
    if (!reconcileQuery.data) return;
    queryClient.setQueryData(summaryKey, reconcileQuery.data);
  }, [ownerScopeId, ownerType, queryClient, reconcileQuery.data, summaryKey]);

  useEffect(() => {
    if (!checkoutSuccess || !checkoutPending) return;
    const timer = setTimeout(() => setTimedOut(true), 30000);
    return () => clearTimeout(timer);
  }, [checkoutSuccess, checkoutPending]);

  useEffect(() => {
    if (checkoutPending || !checkoutSuccess) return;
    const url = new URL(globalThis.location.href);
    url.searchParams.delete("checkout");
    url.searchParams.delete("session_id");
    globalThis.history.replaceState({}, "", url.toString());
  }, [checkoutPending, checkoutSuccess]);

  let content: ReactNode;

  if (checkoutPending) {
    const statusIcon = timedOut ? <CreditCard size={32} /> : <Loader2 size={32} className="animate-spin" />;
    const statusLabel = timedOut ? "Still Processing" : "Payment Received";
    const statusTitle = timedOut ? "Subscription is being activated" : "Completing your subscription";
    const statusBody = timedOut
      ? "Your payment was successful but activation is taking longer than expected. You can check your subscription status or contact support."
      : "Your payment was successful. We're activating your subscription now - this should only take a moment.";

    content = (
      <section className="glass-panel relative overflow-hidden rounded-[2.5rem] p-12 text-center shadow-2xl">
        <div className="relative z-10">
          <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-500 mb-6">
            {statusIcon}
          </div>
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-blue-400/60 mb-2">
            {statusLabel}
          </p>
          <h1 className="text-3xl font-semibold text-[var(--foreground)]">
            {statusTitle}
          </h1>
          <p className="mt-4 mx-auto max-w-md text-sm font-medium leading-relaxed text-[var(--muted)]">
            {statusBody}
          </p>
          {timedOut && (
            <button
              type="button"
              onClick={() => { setTimedOut(false); queryClient.invalidateQueries({ queryKey: summaryKey }); }}
              className="primary-button mt-8 !w-auto px-10"
            >
              <RefreshCw size={18} />
              Check Status
            </button>
          )}
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent" />
      </section>
    );
  } else if (needsPlan) {
    content = (
      <>
        {checkoutCancelled && (
          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 text-sm text-amber-400">
            Checkout was cancelled. No charges were made.
          </div>
        )}
        <BillingPlanCTA onOpenPlans={() => setModalOpen(true)} />
      </>
    );
  } else {
    content = (
      <BillingAccountContent
        summary={summary}
        topUp={topUp}
        invoices={invoicesQuery.data ?? []}
        historyOpen={historyOpen}
        topUpOpen={topUpOpen}
        isToggling={autoRenew.isPending}
        isSavingTopUp={saveTopUp.isPending}
        onPortal={() => portal.mutate()}
        onUpgrade={() => setModalOpen(true)}
        onToggleAutoRenew={() => autoRenew.mutate({ auto_renew: Boolean(summary?.cancel_at_period_end) })}
        onPurchasePack={(pack) => creditCheckout.mutate(pack)}
        onOpenTopUp={() => setTopUpOpen(true)}
        onOpenHistory={() => setHistoryOpen(true)}
        onCloseHistory={() => setHistoryOpen(false)}
        onCloseTopUp={() => setTopUpOpen(false)}
        onSaveTopUp={(settings) => saveTopUp.mutate(settings)}
        onDraftChange={setTopUpDraft}
      />
    );
  }

  return (
    <div className="space-y-8 pb-12 w-full">
      {content}

      <BillingModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        initialPlanSlug={initialPlanSlug}
        ownerType={ownerType}
        onCheckout={async (planSlug) => {
          if (onSubscriptionCheckout) return await onSubscriptionCheckout(planSlug);
          const session = await ownerApi.createSubscriptionCheckout({ plan_slug: planSlug });
          return session.checkout_url;
        }}
      />
    </div>
  );
}


type BillingAccountContentProps = Readonly<{
  summary: Awaited<ReturnType<typeof billingSummary>> | undefined;
  topUp: AutoTopUpSettings | null | undefined;
  invoices: Awaited<ReturnType<typeof invoices>> | undefined;
  historyOpen: boolean;
  topUpOpen: boolean;
  isToggling: boolean;
  isSavingTopUp: boolean;
  onPortal: () => void;
  onUpgrade: () => void;
  onToggleAutoRenew: () => void;
  onPurchasePack: (pack: (typeof creditPacks)[number]) => void;
  onOpenTopUp: () => void;
  onOpenHistory: () => void;
  onCloseHistory: () => void;
  onCloseTopUp: () => void;
  onSaveTopUp: (settings: AutoTopUpSettings) => void;
  onDraftChange: (settings: AutoTopUpSettings) => void;
}>;

function topUpStatusClass(enabled: boolean | undefined) {
  return enabled ? "text-emerald-500" : "text-[var(--muted)]";
}

function BillingAccountContent({
  summary,
  topUp,
  invoices: invoiceItems,
  historyOpen,
  topUpOpen,
  isToggling,
  isSavingTopUp,
  onPortal,
  onUpgrade,
  onToggleAutoRenew,
  onPurchasePack,
  onOpenTopUp,
  onOpenHistory,
  onCloseHistory,
  onCloseTopUp,
  onSaveTopUp,
  onDraftChange,
}: BillingAccountContentProps) {
  return (
    <div className="space-y-8 animate-page-enter">
      <div className="grid gap-8 lg:grid-cols-2">
        <BillingSubscriptionCard
          planName={summary?.plan_name ?? "Loading"}
          status={summary?.subscription_status ?? "loading"}
          cancelAtPeriodEnd={!!summary?.cancel_at_period_end}
          priceCents={summary?.plan_price_cents ?? 0}
          periodEnd={summary?.current_period_end ?? null}
          onPortal={onPortal}
          onUpgrade={onUpgrade}
          onToggleAutoRenew={onToggleAutoRenew}
          isToggling={isToggling}
        />
        <BillingWalletCard
          creditBalance={summary?.credit_balance ?? "Loading"}
          lifetimeUsed={summary?.lifetime_used_credits ?? "Loading"}
          heldCredits={summary?.held_credits ?? "0"}
          creditPacks={creditPacks}
          onPurchasePack={onPurchasePack}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <button
          type="button"
          onClick={onOpenTopUp}
          className="group flex items-center justify-between rounded-2xl border border-[var(--border)] bg-[var(--surface)]/30 p-5 transition-all hover:bg-[var(--surface)] hover:border-blue-500/30"
        >
          <div className="flex items-center gap-4">
            <div className="flex size-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-all shadow-sm">
              <Settings size={20} />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-[var(--foreground)]">Auto Top-Up</p>
              <p className={`text-[9px] font-bold uppercase tracking-widest ${topUpStatusClass(topUp?.enabled)}`}>
                {topUp?.enabled ? "Active" : "Disabled"}
              </p>
            </div>
          </div>
          <ChevronRight size={18} className="text-[var(--muted)]/40 transition-transform group-hover:translate-x-1" />
        </button>

        <button
          type="button"
          onClick={onOpenHistory}
          className="group flex items-center justify-between rounded-2xl border border-[var(--border)] bg-[var(--surface)]/30 p-5 transition-all hover:bg-[var(--surface)] hover:border-blue-500/30"
        >
          <div className="flex items-center gap-4">
            <div className="flex size-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-all shadow-sm">
              <FileText size={20} />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-[var(--foreground)]">Billing History</p>
              <p className="text-[9px] font-bold text-[var(--muted)] uppercase tracking-widest">Recent Invoices</p>
            </div>
          </div>
          <ChevronRight size={18} className="text-[var(--muted)]/40 transition-transform group-hover:translate-x-1" />
        </button>
      </div>

      {historyOpen && <BillingHistoryModal invoices={invoiceItems ?? []} onClose={onCloseHistory} />}
      {topUpOpen && <BillingTopUpModal topUp={topUp} onClose={onCloseTopUp} onSave={onSaveTopUp} isSaving={isSavingTopUp} onDraftChange={onDraftChange} />}
    </div>
  );
}

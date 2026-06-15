"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, CreditCard } from "lucide-react";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

import { BillingDashboard } from "@/src/components/billing/billing-dashboard";
import { BillingModal } from "@/src/components/billing/billing-modal";
import { SectionLoading } from "@/src/components/ui/loading-states";
import { completeOrganizationOnboarding, createOrganizationSubscriptionCheckout, currentOrganization } from "@/src/features/auth/api";
import { queryKeys } from "@/src/features/query-keys";
import { useAuthStore } from "@/src/features/auth/store";

export function OrganizationBillingPageContent() {
  return (
    <Suspense fallback={null}>
      <OrganizationBillingPageBody />
    </Suspense>
  );
}

function OrganizationBillingPageBody() {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const onboardingToken = searchParams.get("token");
  const selectedPlan = searchParams.get("plan");
  const userId = useAuthStore((state) => state.user?.id);
  const organizationKey = queryKeys.currentOrganization(userId ?? "");
  const organization = useQuery({ queryKey: organizationKey, queryFn: currentOrganization, enabled: !onboardingToken && Boolean(userId) });
  const onboardingPurchase = useMutation({
    mutationFn: completeOrganizationOnboarding,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: organizationKey });
    },
  });
  const canManageBilling = Boolean(organization.data?.can_manage_billing || onboardingToken);

  if (!onboardingToken && (!userId || organization.isLoading)) {
    return <SectionLoading label="Loading billing" />;
  }

  if (!organization.isLoading && !canManageBilling) {
    return (
      <div className="glass-card flex flex-col items-center justify-center rounded-[2.5rem] p-12 text-center">
        <div className="mb-6 flex size-16 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500">
          <AlertTriangle size={32} />
        </div>
        <h2 className="text-2xl font-semibold tracking-tight text-[var(--foreground)]">Billing Access Restricted</h2>
        <p className="mt-3 max-w-sm text-sm font-medium leading-relaxed text-[var(--muted)]">
          Organization billing is reserved for owners and administrators with explicit billing permissions.
        </p>
        <button type="button" className="secondary-button mt-8 !w-auto px-8" onClick={() => globalThis.history.back()}>
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {onboardingToken ? (
        <div className="glass-card flex items-center gap-6 rounded-[2.5rem] border-blue-500/20 bg-blue-500/[0.02] p-8">
          <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-blue-500 text-white shadow-lg shadow-blue-500/20">
            <CreditCard size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-[var(--foreground)]">Activate Organization Billing</h2>
            <p className="mt-1 text-sm font-medium text-[var(--muted)]">
              Your organization will be fully activated once Stripe confirms your first subscription payment.
            </p>
          </div>
        </div>
      ) : (
        <BillingDashboard
          ownerType="organization"
          ownerScopeId={organization.data!.id}
          initialPlanSlug={selectedPlan}
          checkoutSuccess={searchParams.get("checkout") === "success"}
          checkoutCancelled={searchParams.get("checkout") === "cancelled"}
          checkoutSessionId={searchParams.get("session_id")}
        />
      )}
      {onboardingToken ? (
        <BillingModal
          open={true}
          onClose={() => undefined}
          initialPlanSlug={selectedPlan}
          ownerType="organization"
          onCheckout={async (planSlug) => {
            await onboardingPurchase.mutateAsync({ token: onboardingToken, plan_slug: planSlug });
            const session = await createOrganizationSubscriptionCheckout({ plan_slug: planSlug });
            return session.checkout_url;
          }}
        />
      ) : null}
    </div>
  );
}

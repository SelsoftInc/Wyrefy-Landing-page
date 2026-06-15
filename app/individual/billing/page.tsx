"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

import { BillingDashboard } from "@/src/components/billing/billing-dashboard";
import { SectionLoading } from "@/src/components/ui/loading-states";
import { useAuthStore } from "@/src/features/auth/store";

export default function BillingPage() {
  return (
    <Suspense fallback={null}>
      <BillingPageContent />
    </Suspense>
  );
}

function BillingPageContent() {
  const searchParams = useSearchParams();
  const user = useAuthStore((state) => state.user);
  const checkoutSuccess = searchParams.get("checkout") === "success";
  const checkoutCancelled = searchParams.get("checkout") === "cancelled";

  if (!user) {
    return <SectionLoading label="Loading billing" />;
  }

  return (
    <BillingDashboard
      ownerType="individual"
      ownerScopeId={user.id}
      initialPlanSlug={searchParams.get("plan")}
      checkoutSuccess={checkoutSuccess}
      checkoutCancelled={checkoutCancelled}
      checkoutSessionId={searchParams.get("session_id")}
    />
  );
}

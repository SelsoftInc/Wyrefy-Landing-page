"use client";

import { apiRequest } from "@/src/shared/api-client";

import type { BillingSummary } from "@/src/features/auth/types";

type CheckoutReconcilePayload = {
  stripe_checkout_session_id: string;
};

export function reconcileCheckout(payload: CheckoutReconcilePayload) {
  return apiRequest<BillingSummary, CheckoutReconcilePayload>("/billing/checkout/reconcile", { method: "POST", body: payload });
}

export function reconcileOrganizationCheckout(payload: CheckoutReconcilePayload) {
  return apiRequest<BillingSummary, CheckoutReconcilePayload>("/billing/organization/checkout/reconcile", { method: "POST", body: payload });
}

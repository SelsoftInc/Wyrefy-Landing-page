import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { BillingDashboard } from "@/src/components/billing/billing-dashboard";
import { renderWithProviders } from "../../../test/render";

const {
  mockAutoTopUpSettings,
  mockBillingSummary,
  mockCreateCreditCheckout,
  mockCreateCustomerPortal,
  mockCreateOrganizationCreditCheckout,
  mockCreateOrganizationCustomerPortal,
  mockCreateOrganizationSubscriptionCheckout,
  mockCreateSubscriptionCheckout,
  mockInvoices,
  mockOrganizationAutoTopUpSettings,
  mockOrganizationBillingSummary,
  mockOrganizationInvoices,
  mockReconcileCheckout,
  mockReconcileOrganizationCheckout,
  mockUpdateAutoRenew,
  mockUpdateAutoTopUpSettings,
  mockUpdateOrganizationAutoRenew,
  mockUpdateOrganizationAutoTopUpSettings,
} = vi.hoisted(() => ({
  mockAutoTopUpSettings: vi.fn(),
  mockBillingSummary: vi.fn(),
  mockCreateCreditCheckout: vi.fn(),
  mockCreateCustomerPortal: vi.fn(),
  mockCreateOrganizationCreditCheckout: vi.fn(),
  mockCreateOrganizationCustomerPortal: vi.fn(),
  mockCreateOrganizationSubscriptionCheckout: vi.fn(),
  mockCreateSubscriptionCheckout: vi.fn(),
  mockInvoices: vi.fn(),
  mockOrganizationAutoTopUpSettings: vi.fn(),
  mockOrganizationBillingSummary: vi.fn(),
  mockOrganizationInvoices: vi.fn(),
  mockReconcileCheckout: vi.fn(),
  mockReconcileOrganizationCheckout: vi.fn(),
  mockUpdateAutoRenew: vi.fn(),
  mockUpdateAutoTopUpSettings: vi.fn(),
  mockUpdateOrganizationAutoRenew: vi.fn(),
  mockUpdateOrganizationAutoTopUpSettings: vi.fn(),
}));

vi.mock("@/src/features/auth/api", async () => {
  const actual = await vi.importActual<typeof import("@/src/features/auth/api")>("@/src/features/auth/api");
  return {
    ...actual,
    autoTopUpSettings: mockAutoTopUpSettings,
    billingSummary: mockBillingSummary,
    createCreditCheckout: mockCreateCreditCheckout,
    createCustomerPortal: mockCreateCustomerPortal,
    createOrganizationCreditCheckout: mockCreateOrganizationCreditCheckout,
    createOrganizationCustomerPortal: mockCreateOrganizationCustomerPortal,
    createOrganizationSubscriptionCheckout: mockCreateOrganizationSubscriptionCheckout,
    createSubscriptionCheckout: mockCreateSubscriptionCheckout,
    invoices: mockInvoices,
    organizationAutoTopUpSettings: mockOrganizationAutoTopUpSettings,
    organizationBillingSummary: mockOrganizationBillingSummary,
    organizationInvoices: mockOrganizationInvoices,
    updateAutoRenew: mockUpdateAutoRenew,
    updateAutoTopUpSettings: mockUpdateAutoTopUpSettings,
    updateOrganizationAutoRenew: mockUpdateOrganizationAutoRenew,
    updateOrganizationAutoTopUpSettings: mockUpdateOrganizationAutoTopUpSettings,
  };
});

vi.mock("@/src/features/billing/api", () => ({
  reconcileCheckout: mockReconcileCheckout,
  reconcileOrganizationCheckout: mockReconcileOrganizationCheckout,
}));

vi.mock("@/src/components/billing/billing-modal", () => ({
  BillingModal: ({ open, ownerType, initialPlanSlug }: { open: boolean; ownerType: string; initialPlanSlug?: string | null }) =>
    open ? <div>Billing modal {ownerType} {initialPlanSlug ?? "none"}</div> : null,
}));

function activeSummary(status: string) {
  return {
    owner_type: "individual",
    subscription_status: status,
    plan_slug: status === "active" ? "starter" : null,
    plan_name: status === "active" ? "Starter" : null,
    plan_price_cents: 2900,
    billing_interval: "monthly",
    included_credits: "500",
    plan_limits_json: { projects: 5 },
    cancel_at_period_end: false,
    current_period_end: null,
    stripe_customer_id: null,
    default_payment_method_saved: false,
    credit_balance: "50",
    held_credits: "0",
    lifetime_granted_credits: "100",
    lifetime_used_credits: "20",
    auto_top_up_enabled: false,
    auto_top_up_failure_state: null,
  };
}

describe("BillingDashboard", () => {
  beforeEach(() => {
    mockBillingSummary.mockResolvedValue(activeSummary("inactive"));
    mockInvoices.mockResolvedValue([]);
    mockAutoTopUpSettings.mockResolvedValue({
      enabled: false,
      threshold_percentage: 25,
      purchase_amount_cents: 2500,
      credit_amount: "250",
      max_purchase_count_per_cycle: 1,
      notification_emails: [],
      notify_on_success: false,
      notify_on_failure: true,
      failure_state: null,
      last_failure_reason: null,
    });
    mockReconcileCheckout.mockResolvedValue(activeSummary("active"));
    mockCreateSubscriptionCheckout.mockResolvedValue({ checkout_url: "https://stripe.test", stripe_checkout_session_id: "sess_1", message: "ok" });
    mockCreateCreditCheckout.mockResolvedValue({ checkout_url: "https://stripe.test/topup", stripe_checkout_session_id: "sess_2", message: "ok" });
    mockCreateCustomerPortal.mockResolvedValue({ portal_url: "https://stripe.test/portal" });

    mockOrganizationBillingSummary.mockResolvedValue(activeSummary("active"));
    mockOrganizationInvoices.mockResolvedValue([]);
    mockOrganizationAutoTopUpSettings.mockResolvedValue({
      enabled: true,
      threshold_percentage: 25,
      purchase_amount_cents: 2500,
      credit_amount: "250",
      max_purchase_count_per_cycle: 1,
      notification_emails: [],
      notify_on_success: false,
      notify_on_failure: true,
      failure_state: null,
      last_failure_reason: null,
    });
    mockReconcileOrganizationCheckout.mockResolvedValue(activeSummary("active"));
    mockCreateOrganizationSubscriptionCheckout.mockResolvedValue({ checkout_url: "https://stripe.test/org", stripe_checkout_session_id: "sess_org", message: "ok" });
    mockCreateOrganizationCreditCheckout.mockResolvedValue({ checkout_url: "https://stripe.test/org-topup", stripe_checkout_session_id: "sess_org_topup", message: "ok" });
    mockCreateOrganizationCustomerPortal.mockResolvedValue({ portal_url: "https://stripe.test/org-portal" });
    mockUpdateAutoRenew.mockResolvedValue({ message: "ok" });
    mockUpdateAutoTopUpSettings.mockResolvedValue({ enabled: true });
    mockUpdateOrganizationAutoRenew.mockResolvedValue({ message: "ok" });
    mockUpdateOrganizationAutoTopUpSettings.mockResolvedValue({ enabled: true });
  });

  it("shows the choose-plan CTA for inactive individual billing and opens the billing modal", async () => {
    const user = userEvent.setup();
    renderWithProviders(<BillingDashboard ownerType="individual" />);

    expect(await screen.findByText("Activate your account billing")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Choose Your Plan" }));

    expect(await screen.findByText("Billing modal individual none")).toBeInTheDocument();
  });

  it("opens the billing modal immediately when an initial plan slug is provided", async () => {
    mockBillingSummary.mockResolvedValue(activeSummary("active"));
    renderWithProviders(<BillingDashboard ownerType="individual" initialPlanSlug="pro-plan" />);

    expect(await screen.findByText("Billing modal individual pro-plan")).toBeInTheDocument();
  });

  it("shows the checkout cancelled notice for inactive individual billing", async () => {
    renderWithProviders(<BillingDashboard ownerType="individual" checkoutCancelled />);

    expect(await screen.findByText("Checkout was cancelled. No charges were made.")).toBeInTheDocument();
  });
});

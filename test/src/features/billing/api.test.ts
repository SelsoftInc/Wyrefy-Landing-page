import { describe, it, expect, vi, beforeEach } from "vitest";

const mockApiRequest = vi.hoisted(() => vi.fn());

vi.mock("@/src/shared/api-client", () => ({
  apiRequest: mockApiRequest,
}));

import { reconcileCheckout, reconcileOrganizationCheckout } from "@/src/features/billing/api";

describe("billing-api", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("reconcileCheckout calls apiRequest with POST", async () => {
    const payload = { stripe_checkout_session_id: "cs_test_123" };
    mockApiRequest.mockResolvedValueOnce({ credit_balance: 5000 });
    const result = await reconcileCheckout(payload);
    expect(mockApiRequest).toHaveBeenCalledWith("/billing/checkout/reconcile", { method: "POST", body: payload });
    expect(result).toEqual({ credit_balance: 5000 });
  });

  it("reconcileOrganizationCheckout calls apiRequest with POST", async () => {
    const payload = { stripe_checkout_session_id: "cs_test_456" };
    mockApiRequest.mockResolvedValueOnce({ credit_balance: 10000 });
    const result = await reconcileOrganizationCheckout(payload);
    expect(mockApiRequest).toHaveBeenCalledWith("/billing/organization/checkout/reconcile", { method: "POST", body: payload });
    expect(result).toEqual({ credit_balance: 10000 });
  });
});

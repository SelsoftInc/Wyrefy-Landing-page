import { beforeEach, describe, expect, it, vi } from "vitest";

const mockApiRequest = vi.hoisted(() => vi.fn());

vi.mock("@/src/shared/api-client", () => ({
  apiRequest: mockApiRequest,
}));

import {
  adminDashboard,
  adminReport,
  announcements,
  computeOverrides,
  computePricing,
  createAnnouncement,
  createComputeOverride,
  createComputePricing,
  createModelPricing,
  deleteAnnouncement,
  deleteModelPricing,
  deprecateComputeOverride,
  deprecateComputePricing,
  deprecateModelPricing,
  endpointAnalytics,
  exportReport,
  modelPricing,
  organizationAnalytics,
  replySupportTicket,
  runtimeProviders,
  sandboxTrends,
  supportTicket,
  supportTickets,
  tokenTrends,
  updateAnnouncement,
  updateModelPricing,
  updateSupportTicket,
  usageTrends,
} from "@/src/features/admin-ops/api";

describe("admin-ops-api", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("adminDashboard calls apiRequest with GET", async () => {
    mockApiRequest.mockResolvedValueOnce({ total_users: 100 });
    const result = await adminDashboard();
    expect(mockApiRequest).toHaveBeenCalledWith("/admin/dashboard");
    expect(result).toEqual({ total_users: 100 });
  });

  it("endpointAnalytics calls with default days", async () => {
    mockApiRequest.mockResolvedValueOnce({});
    await endpointAnalytics();
    expect(mockApiRequest).toHaveBeenCalledWith("/admin/analytics/endpoints?days=30");
  });

  it("endpointAnalytics uses custom days", async () => {
    mockApiRequest.mockResolvedValueOnce({});
    await endpointAnalytics(7);
    expect(mockApiRequest).toHaveBeenCalledWith("/admin/analytics/endpoints?days=7");
  });

  it("organizationAnalytics calls with path", async () => {
    mockApiRequest.mockResolvedValueOnce({});
    await organizationAnalytics();
    expect(mockApiRequest).toHaveBeenCalledWith("/admin/analytics/organizations?days=30");
  });

  it("usageTrends calls with path", async () => {
    mockApiRequest.mockResolvedValueOnce([]);
    await usageTrends();
    expect(mockApiRequest).toHaveBeenCalledWith("/admin/analytics/usage-trends?days=30");
  });

  it("tokenTrends calls with only days when no filter is selected", async () => {
    mockApiRequest.mockResolvedValueOnce({});
    await tokenTrends();
    expect(mockApiRequest).toHaveBeenCalledWith("/admin/analytics/token-trends?days=30");
  });

  it("tokenTrends includes provider and model filters", async () => {
    mockApiRequest.mockResolvedValueOnce({});
    await tokenTrends(30, { provider: "openai", model_name: "gpt-4.1" });
    expect(mockApiRequest).toHaveBeenCalledWith("/admin/analytics/token-trends?days=30&provider=openai&model_name=gpt-4.1");
  });

  it("sandboxTrends calls with only days for the all-profiles view", async () => {
    mockApiRequest.mockResolvedValueOnce({});
    await sandboxTrends();
    expect(mockApiRequest).toHaveBeenCalledWith("/admin/analytics/sandbox-trends?days=30");
  });

  it("sandboxTrends includes the profile filter when selected", async () => {
    mockApiRequest.mockResolvedValueOnce({});
    await sandboxTrends(30, "ecs-fargate-default");
    expect(mockApiRequest).toHaveBeenCalledWith("/admin/analytics/sandbox-trends?days=30&profile_key=ecs-fargate-default");
  });

  it("modelPricing calls apiRequest", async () => {
    mockApiRequest.mockResolvedValueOnce([]);
    await modelPricing();
    expect(mockApiRequest).toHaveBeenCalledWith("/admin/pricing/models");
  });

  it("runtimeProviders calls apiRequest", async () => {
    mockApiRequest.mockResolvedValueOnce([]);
    await runtimeProviders();
    expect(mockApiRequest).toHaveBeenCalledWith("/admin/pricing/model-providers");
  });

  it("createModelPricing calls apiRequest with POST", async () => {
    const payload = {
      provider: "openai",
      model_name: "gpt-4",
      model_id: "gpt-4-turbo",
      input_price_per_million: "10",
      output_price_per_million: "30",
      cache_read_price_per_million: "5",
      cache_write_price_per_million: "7",
      context_window_tokens: 1000000,
      metadata_json: {},
    };
    mockApiRequest.mockResolvedValueOnce({ id: "mp1" });
    const result = await createModelPricing(payload);
    expect(mockApiRequest).toHaveBeenCalledWith("/admin/pricing/models", { method: "POST", body: payload });
    expect(result).toEqual({ id: "mp1" });
  });

  it("updateModelPricing calls apiRequest with PATCH", async () => {
    const payload = {
      model_name: "Claude Sonnet 4.5",
      input_price_per_million: "3",
      output_price_per_million: "15",
      cache_read_price_per_million: "0.3",
      cache_write_price_per_million: "3.75",
      context_window_tokens: 200000,
      metadata_json: { cache_mode: "explicit_context_cache" },
    };
    mockApiRequest.mockResolvedValueOnce({ id: "mp1" });
    await updateModelPricing("mp1", payload);
    expect(mockApiRequest).toHaveBeenCalledWith("/admin/pricing/models/mp1", { method: "PATCH", body: payload });
  });

  it("deprecateModelPricing calls apiRequest with POST", async () => {
    mockApiRequest.mockResolvedValueOnce({ id: "mp1" });
    await deprecateModelPricing("mp1");
    expect(mockApiRequest).toHaveBeenCalledWith("/admin/pricing/models/mp1/deprecate", { method: "POST" });
  });

  it("deleteModelPricing calls apiRequest with DELETE", async () => {
    mockApiRequest.mockResolvedValueOnce({ message: "deleted" });
    await deleteModelPricing("mp1");
    expect(mockApiRequest).toHaveBeenCalledWith("/admin/pricing/models/mp1", { method: "DELETE" });
  });

  it("computePricing calls apiRequest", async () => {
    mockApiRequest.mockResolvedValueOnce([]);
    await computePricing();
    expect(mockApiRequest).toHaveBeenCalledWith("/admin/pricing/compute");
  });

  it("computeOverrides calls apiRequest", async () => {
    mockApiRequest.mockResolvedValueOnce([]);
    await computeOverrides();
    expect(mockApiRequest).toHaveBeenCalledWith("/admin/pricing/compute-overrides");
  });

  it("createComputeOverride calls apiRequest with POST", async () => {
    const payload = { organization_id: "org1", compute_profile_key: "small" };
    mockApiRequest.mockResolvedValueOnce({ id: "co1" });
    const result = await createComputeOverride(payload);
    expect(mockApiRequest).toHaveBeenCalledWith("/admin/pricing/compute-overrides", { method: "POST", body: payload });
    expect(result).toEqual({ id: "co1" });
  });

  it("deprecateComputeOverride calls apiRequest with POST", async () => {
    mockApiRequest.mockResolvedValueOnce({ id: "co1" });
    await deprecateComputeOverride("co1");
    expect(mockApiRequest).toHaveBeenCalledWith("/admin/pricing/compute-overrides/co1/deprecate", { method: "POST" });
  });

  it("createComputePricing calls apiRequest with POST", async () => {
    const payload = {
      profile_key: "small",
      display_name: "Small",
      runtime_image: null,
      vcpu_price_per_second: "0.01",
      memory_gb_price_per_second: "0.005",
      metadata_json: { vcpu: "2", memory_gb: "4" },
    };
    mockApiRequest.mockResolvedValueOnce({ id: "cp1" });
    const result = await createComputePricing(payload);
    expect(mockApiRequest).toHaveBeenCalledWith("/admin/pricing/compute", { method: "POST", body: payload });
    expect(result).toEqual({ id: "cp1" });
  });

  it("deprecateComputePricing calls apiRequest with POST", async () => {
    mockApiRequest.mockResolvedValueOnce({ id: "cp1" });
    await deprecateComputePricing("cp1");
    expect(mockApiRequest).toHaveBeenCalledWith("/admin/pricing/compute/cp1/deprecate", { method: "POST" });
  });

  it("adminReport calls apiRequest with kind", async () => {
    mockApiRequest.mockResolvedValueOnce({});
    await adminReport("mrr");
    expect(mockApiRequest).toHaveBeenCalledWith("/admin/reports/mrr");
  });

  it("exportReport calls apiRequest with kind query param", async () => {
    mockApiRequest.mockResolvedValueOnce({});
    await exportReport("usage");
    expect(mockApiRequest).toHaveBeenCalledWith("/admin/reports/export?kind=usage");
  });

  it("exportReport defaults to usage", async () => {
    mockApiRequest.mockResolvedValueOnce({});
    await exportReport();
    expect(mockApiRequest).toHaveBeenCalledWith("/admin/reports/export?kind=usage");
  });

  it("supportTickets calls apiRequest", async () => {
    mockApiRequest.mockResolvedValueOnce([]);
    await supportTickets();
    expect(mockApiRequest).toHaveBeenCalledWith("/admin/support/tickets");
  });

  it("supportTicket calls apiRequest with id", async () => {
    mockApiRequest.mockResolvedValueOnce({ id: "t1" });
    await supportTicket("t1");
    expect(mockApiRequest).toHaveBeenCalledWith("/admin/support/tickets/t1");
  });

  it("updateSupportTicket calls apiRequest with PATCH", async () => {
    const payload = { status: "resolved" };
    mockApiRequest.mockResolvedValueOnce({ id: "t1" });
    await updateSupportTicket("t1", payload);
    expect(mockApiRequest).toHaveBeenCalledWith("/admin/support/tickets/t1", { method: "PATCH", body: payload });
  });

  it("replySupportTicket calls apiRequest with POST", async () => {
    const payload = { body: "Thanks", visibility: "public" };
    mockApiRequest.mockResolvedValueOnce({ message: "Replied" });
    const result = await replySupportTicket("t1", payload);
    expect(mockApiRequest).toHaveBeenCalledWith("/admin/support/tickets/t1/reply", { method: "POST", body: payload });
    expect(result).toEqual({ message: "Replied" });
  });

  it("announcements calls apiRequest", async () => {
    mockApiRequest.mockResolvedValueOnce([]);
    await announcements();
    expect(mockApiRequest).toHaveBeenCalledWith("/admin/announcements");
  });

  it("createAnnouncement calls apiRequest with POST", async () => {
    const payload = {
      title: "Maintenance",
      body: "We will be down at 2AM.",
      status: "draft",
      audience_type: "all",
      audience_json: {},
      publish_at: null,
    };
    mockApiRequest.mockResolvedValueOnce({ id: "a1" });
    const result = await createAnnouncement(payload);
    expect(mockApiRequest).toHaveBeenCalledWith("/admin/announcements", { method: "POST", body: payload });
    expect(result).toEqual({ id: "a1" });
  });

  it("updateAnnouncement calls apiRequest with PATCH", async () => {
    const payload = {
      title: "Updated",
      body: "Updated body",
      status: "scheduled",
      audience_type: "all",
      audience_json: {},
      publish_at: null,
    };
    mockApiRequest.mockResolvedValueOnce({ id: "a1" });
    await updateAnnouncement("a1", payload);
    expect(mockApiRequest).toHaveBeenCalledWith("/admin/announcements/a1", { method: "PATCH", body: payload });
  });

  it("deleteAnnouncement calls apiRequest with DELETE and confirmation", async () => {
    mockApiRequest.mockResolvedValueOnce({ message: "Deleted" });
    await deleteAnnouncement("a1");
    expect(mockApiRequest).toHaveBeenCalledWith("/admin/announcements/a1", { method: "DELETE", body: { confirmation: "ARCHIVE" } });
  });
});

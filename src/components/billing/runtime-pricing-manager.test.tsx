import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { RuntimePricingManager } from "@/src/components/billing/runtime-pricing-manager";
import { renderWithProviders } from "../../../test/render";

const {
  mockAdminOrganizations,
  mockComputeOverrides,
  mockComputePricing,
  mockCreateComputeOverride,
  mockCreateComputePricing,
  mockCreateModelPricing,
  mockDeleteModelPricing,
  mockDeprecateComputeOverride,
  mockDeprecateComputePricing,
  mockDeprecateModelPricing,
  mockModelPricing,
  mockRuntimeProviders,
  mockUpdateModelPricing,
} = vi.hoisted(() => ({
  mockAdminOrganizations: vi.fn(),
  mockComputeOverrides: vi.fn(),
  mockComputePricing: vi.fn(),
  mockCreateComputeOverride: vi.fn(),
  mockCreateComputePricing: vi.fn(),
  mockCreateModelPricing: vi.fn(),
  mockDeleteModelPricing: vi.fn(),
  mockDeprecateComputeOverride: vi.fn(),
  mockDeprecateComputePricing: vi.fn(),
  mockDeprecateModelPricing: vi.fn(),
  mockModelPricing: vi.fn(),
  mockRuntimeProviders: vi.fn(),
  mockUpdateModelPricing: vi.fn(),
}));

vi.mock("@/src/features/auth/api", async () => {
  const actual = await vi.importActual<typeof import("@/src/features/auth/api")>("@/src/features/auth/api");
  return {
    ...actual,
    adminOrganizations: mockAdminOrganizations,
  };
});

vi.mock("@/src/features/admin-ops/api", () => ({
  computeOverrides: mockComputeOverrides,
  computePricing: mockComputePricing,
  createComputeOverride: mockCreateComputeOverride,
  createComputePricing: mockCreateComputePricing,
  createModelPricing: mockCreateModelPricing,
  deleteModelPricing: mockDeleteModelPricing,
  deprecateComputeOverride: mockDeprecateComputeOverride,
  deprecateComputePricing: mockDeprecateComputePricing,
  deprecateModelPricing: mockDeprecateModelPricing,
  modelPricing: mockModelPricing,
  runtimeProviders: mockRuntimeProviders,
  updateModelPricing: mockUpdateModelPricing,
}));

describe("RuntimePricingManager", () => {
  beforeEach(() => {
    mockAdminOrganizations.mockResolvedValue([
      {
        id: "org-1",
        name: "Acme Org",
        slug: "acme-org",
        allowed_email_domain: "acme.com",
        plan: "Starter",
        seat_count: 8,
        credits_used: "100",
        credits_remaining: "400",
        project_count: 2,
        project_limit: 5,
        projects_remaining: 3,
        token_usage: 10,
        compute_usage: 5,
        status: "active",
      },
    ]);
    mockComputePricing.mockResolvedValue([
      {
        id: "cp-1",
        profile_key: "ecs-fargate-default",
        display_name: "Default ECS Fargate",
        runtime_image: null,
        version: 1,
        status: "active",
        vcpu_price_per_second: "0.000000001",
        memory_gb_price_per_second: "0.000000002",
        metadata_json: { vcpu: "1", memory_gb: "2" },
        effective_from: "",
        effective_to: null,
        created_by_user_id: null,
        created_at: "",
      },
    ]);
    mockComputeOverrides.mockResolvedValue([
      {
        id: "override-1",
        organization_id: "org-1",
        compute_profile_key: "ecs-fargate-default",
        status: "active",
        created_by_user_id: null,
        created_at: "",
        updated_at: "",
        deprecated_at: null,
      },
    ]);
    mockModelPricing.mockResolvedValue([
      {
        id: "model-1",
        provider: "vertex_ai",
        model_name: "Gemini 2.5 Pro",
        model_id: "gemini-2.5-pro",
        version: 1,
        status: "active",
        input_price_per_million: "1.25",
        output_price_per_million: "2.5",
        cache_read_price_per_million: "0",
        cache_write_price_per_million: "0",
        context_window_tokens: 1048576,
        metadata_json: {},
        effective_from: "",
        effective_to: null,
        created_by_user_id: null,
        created_at: "",
      },
      {
        id: "model-2",
        provider: "vertex_ai",
        model_name: "Gemini 2.5 Pro",
        model_id: "gemini-2.5-pro",
        version: 0,
        status: "deprecated",
        input_price_per_million: "1.1",
        output_price_per_million: "2.2",
        cache_read_price_per_million: "0",
        cache_write_price_per_million: "0",
        context_window_tokens: 1048576,
        metadata_json: {},
        effective_from: "",
        effective_to: "",
        created_by_user_id: null,
        created_at: "",
      },
    ]);
    mockRuntimeProviders.mockResolvedValue([{ provider: "vertex_ai", supported: true }, { provider: "bedrock", supported: true }, { provider: "fireworks_ai", supported: true }]);
    mockCreateComputeOverride.mockResolvedValue({ message: "ok" });
    mockCreateComputePricing.mockResolvedValue({ message: "ok" });
    mockCreateModelPricing.mockResolvedValue({ message: "ok" });
    mockDeleteModelPricing.mockResolvedValue({ message: "ok" });
    mockDeprecateComputeOverride.mockResolvedValue({ message: "ok" });
    mockDeprecateComputePricing.mockResolvedValue({ message: "ok" });
    mockDeprecateModelPricing.mockResolvedValue({ message: "ok" });
    mockUpdateModelPricing.mockResolvedValue({ message: "ok" });
  });

  it("removes the old phase copy, formats compute prices, and uses searchable override dropdowns", async () => {
    const user = userEvent.setup();
    renderWithProviders(<RuntimePricingManager />);

    expect(screen.queryByText(/Phase 1 Runtime Pricing/i)).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Sandbox compute" }));
    expect(await screen.findByText("$0.000000001")).toBeInTheDocument();
    expect(screen.getByText("$0.000000002")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Organization" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Compute profile key" })).toBeInTheDocument();
    expect(screen.getByText("Acme Org")).toBeInTheDocument();
  });

  it("opens the model pricing dialog from a provider card", async () => {
    const user = userEvent.setup();
    renderWithProviders(<RuntimePricingManager />);

    await user.click(await screen.findByRole("button", { name: /Vertex AI/i }));
    await user.click(await screen.findByRole("button", { name: "Add Model" }));

    expect(screen.getByRole("dialog", { name: "Add model pricing" })).toBeInTheDocument();
  });

  it("shows edit for active rows and permanent delete for deprecated rows", async () => {
    const user = userEvent.setup();
    renderWithProviders(<RuntimePricingManager />);

    await user.click(await screen.findByRole("button", { name: /Vertex AI/i }));

    expect(await screen.findByRole("button", { name: "Edit" })).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "Delete permanently" })).toHaveLength(2);

    await user.click(screen.getByRole("button", { name: "Edit" }));

    expect(screen.getByRole("dialog", { name: "Edit model pricing" })).toBeInTheDocument();
    expect(screen.getByDisplayValue("Gemini 2.5 Pro")).toBeInTheDocument();
    expect(screen.getByDisplayValue("1048576")).toBeInTheDocument();
    expect(screen.getByDisplayValue("gemini-2.5-pro")).toBeDisabled();
  });
});

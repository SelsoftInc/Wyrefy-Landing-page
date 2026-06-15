import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { PlatformPlanBilling } from "@/src/components/billing/platform-plan-billing";
import { renderWithProviders } from "../../../test/render";

const {
  mockAdminPlans,
  mockArchivePlan,
  mockComputePricing,
  mockPush,
  mockUpdatePlan,
  mockUpsertPlan,
  mockApiRequest,
} = vi.hoisted(() => ({
  mockAdminPlans: vi.fn(),
  mockArchivePlan: vi.fn(),
  mockComputePricing: vi.fn(),
  mockPush: vi.fn(),
  mockUpdatePlan: vi.fn(),
  mockUpsertPlan: vi.fn(),
  mockApiRequest: vi.fn(),
}));

const searchParams = new URLSearchParams();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => ({ get: (key: string) => searchParams.get(key) }),
}));

vi.mock("@/src/components/billing/runtime-pricing-manager", () => ({
  RuntimePricingManager: () => <div>Runtime pricing panel</div>,
}));

vi.mock("@/src/features/auth/api", async () => {
  const actual = await vi.importActual<typeof import("@/src/features/auth/api")>("@/src/features/auth/api");
  return {
    ...actual,
    adminPlans: mockAdminPlans,
    archivePlan: mockArchivePlan,
    updatePlan: mockUpdatePlan,
    upsertPlan: mockUpsertPlan,
  };
});

vi.mock("@/src/features/admin-ops/api", () => ({
  computePricing: mockComputePricing,
}));

vi.mock("@/src/shared/api-client", () => ({
  apiRequest: mockApiRequest,
}));

function createPlan(overrides: Record<string, unknown> = {}) {
  return {
    id: "plan-1",
    name: "Starter",
    slug: "starter",
    tenant_type: "individual",
    price_cents: 999,
    billing_interval: "monthly",
    included_credits: "250",
    limits_json: {
      projects: 5,
      credits: 250,
      runtime_margin_percent: 50,
      compute_profile_key: "ecs-fargate-default",
    },
    status: "active",
    is_public: true,
    organization_id: null,
    ...overrides,
  };
}

describe("PlatformPlanBilling", () => {
  beforeEach(() => {
    searchParams.delete("createPlan");
    searchParams.delete("returnTo");
    window.sessionStorage.clear();

    mockAdminPlans.mockImplementation(async (_scope, tenantType) => {
      if (tenantType === "organization") {
        return [
          createPlan({
            id: "org-plan-1",
            name: "Org Starter",
            slug: "org-starter",
            tenant_type: "organization",
            limits_json: {
              projects: 10,
              credits: 500,
              team_members: 8,
              runtime_margin_percent: 45,
              compute_profile_key: "ecs-fargate-org",
            },
          }),
        ];
      }
      return [createPlan()];
    });
    mockArchivePlan.mockResolvedValue({ message: "Archived" });
    mockUpdatePlan.mockResolvedValue(createPlan());
    mockUpsertPlan.mockResolvedValue(createPlan());
    mockComputePricing.mockResolvedValue([
      {
        id: "compute-1",
        profile_key: "ecs-fargate-pro",
        display_name: "Pro Compute",
        runtime_image: null,
        version: 1,
        status: "active",
        vcpu_price_per_second: "0.000000001",
        memory_gb_price_per_second: "0.000000002",
        metadata_json: {},
        effective_from: "",
        effective_to: null,
        created_by_user_id: null,
        created_at: "",
      },
      {
        id: "compute-2",
        profile_key: "ecs-fargate-agency",
        display_name: "Agency Compute",
        runtime_image: null,
        version: 1,
        status: "active",
        vcpu_price_per_second: "0.000000003",
        memory_gb_price_per_second: "0.000000004",
        metadata_json: {},
        effective_from: "",
        effective_to: null,
        created_by_user_id: null,
        created_at: "",
      },
    ]);
    mockApiRequest.mockImplementation(async (path: string) => {
      if (path === "/admin/organization-plans") {
        return createPlan({ slug: "agency-growth", tenant_type: "organization" });
      }
      return createPlan({ tenant_type: "organization" });
    });
    mockPush.mockReset();
  });

  it("switches tabs and shows the runtime pricing view", async () => {
    const user = userEvent.setup();
    renderWithProviders(<PlatformPlanBilling />);

    expect(await screen.findByRole("button", { name: "Create New Plan" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Organization plans" }));
    expect(await screen.findByRole("button", { name: "Create Organization Plan" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Runtime pricing" }));
    expect(screen.getByText("Runtime pricing panel")).toBeInTheDocument();
  });

  it("opens the individual plan form and submits a slugified payload with a compute dropdown selection", async () => {
    const user = userEvent.setup();
    renderWithProviders(<PlatformPlanBilling />);

    await user.click(await screen.findByRole("button", { name: "Create New Plan" }));

    expect(screen.getByRole("dialog", { name: "Create New Plan" })).toBeInTheDocument();
    await user.type(screen.getByLabelText("Plan name"), "Team Pro Plan");
    await user.type(screen.getByLabelText("Price in dollars"), "19.99");
    await user.type(screen.getByLabelText("Project limit"), "7");
    await user.type(screen.getByLabelText("Included credits"), "750");
    await user.clear(screen.getByLabelText("Runtime margin %"));
    await user.type(screen.getByLabelText("Runtime margin %"), "35");
    await user.click(screen.getByRole("button", { name: "Compute profile key" }));
    await user.click(await screen.findByRole("button", { name: /Pro Compute/i }));

    await user.click(screen.getByRole("button", { name: "Save Plan" }));

    await waitFor(() => {
      expect(mockUpsertPlan.mock.calls[0]?.[0]).toEqual({
        name: "Team Pro Plan",
        slug: "team-pro-plan",
        tenant_type: "individual",
        price_cents: 1999,
        billing_interval: "monthly",
        included_credits: "750",
        status: "active",
        is_public: true,
        organization_id: null,
        limits_json: {
          projects: 7,
          credits: 750,
          runtime_margin_percent: 35,
          compute_profile_key: "ecs-fargate-pro",
        },
      });
    });
  });

  it("opens the organization plan form from the organization tab", async () => {
    const user = userEvent.setup();
    renderWithProviders(<PlatformPlanBilling />);

    await user.click(screen.getByRole("button", { name: "Organization plans" }));
    await user.click(await screen.findByRole("button", { name: "Create Organization Plan" }));

    expect(screen.getByRole("dialog", { name: "Create Organization Plan" })).toBeInTheDocument();
    expect(screen.getByLabelText("Organization plan name")).toBeInTheDocument();
    expect(screen.getByLabelText("Team members")).toBeInTheDocument();
  });

  it("returns to user management and preserves the draft after creating an organization plan", async () => {
    const user = userEvent.setup();
    searchParams.set("createPlan", "organization");
    searchParams.set("returnTo", "/platform_admin/user-management?resumeOrgDraft=1");
    window.sessionStorage.setItem("wyrefy.platformAdmin.organizationDraft", JSON.stringify({
      name: "Draft Org",
      allowed_email_domain: "draft.com",
      admin_full_name: "Draft Owner",
      admin_email: "owner@draft.com",
      plan_slug: "org-starter",
    }));

    renderWithProviders(<PlatformPlanBilling />);

    const dialog = await screen.findByRole("dialog", { name: "Create Organization Plan" });
    await user.type(within(dialog).getByLabelText("Organization plan name"), "Agency Growth");
    await user.type(within(dialog).getByLabelText("Price in dollars"), "49");
    await user.type(within(dialog).getByLabelText("Project limit"), "20");
    await user.type(within(dialog).getByLabelText("Included credits"), "2000");
    await user.clear(within(dialog).getByLabelText("Runtime margin %"));
    await user.type(within(dialog).getByLabelText("Runtime margin %"), "40");
    await user.click(within(dialog).getByRole("button", { name: "Compute profile key" }));
    await user.click(await screen.findByRole("button", { name: /Agency Compute/i }));
    await user.type(within(dialog).getByLabelText("Team members"), "15");

    await user.click(within(dialog).getByRole("button", { name: "Save Plan" }));

    await waitFor(() => {
      expect(mockApiRequest).toHaveBeenCalledWith("/admin/organization-plans", {
        method: "POST",
        body: {
          name: "Agency Growth",
          slug: "agency-growth",
          price_cents: 4900,
          billing_interval: "monthly",
          included_credits: "2000",
          limits_json: {
            projects: 20,
            credits: 2000,
            team_members: 15,
            runtime_margin_percent: 40,
            compute_profile_key: "ecs-fargate-agency",
          },
        },
      });
      expect(mockPush).toHaveBeenCalledWith("/platform_admin/user-management?resumeOrgDraft=1");
    });

    expect(JSON.parse(window.sessionStorage.getItem("wyrefy.platformAdmin.organizationDraft") ?? "{}")).toMatchObject({
      name: "Draft Org",
      plan_slug: "agency-growth",
    });
  });
});

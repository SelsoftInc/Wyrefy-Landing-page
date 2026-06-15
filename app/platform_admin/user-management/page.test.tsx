import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import UserManagementPage from "@/app/platform_admin/user-management/page";
import { useAuthStore } from "@/src/features/auth/store";
import { renderWithProviders } from "../../../test/render";

const {
  mockAddPlatformAdmin,
  mockAdminOrganizationMembers,
  mockAdminOrganizations,
  mockAdminPlans,
  mockAdminUsers,
  mockCreateOrganization,
  mockDeleteAdminOrgMember,
  mockDeleteAdminUser,
  mockDeleteOrganization,
  mockPush,
  mockUpdateAdminOrgMember,
} = vi.hoisted(() => ({
  mockAddPlatformAdmin: vi.fn(),
  mockAdminOrganizationMembers: vi.fn(),
  mockAdminOrganizations: vi.fn(),
  mockAdminPlans: vi.fn(),
  mockAdminUsers: vi.fn(),
  mockCreateOrganization: vi.fn(),
  mockDeleteAdminOrgMember: vi.fn(),
  mockDeleteAdminUser: vi.fn(),
  mockDeleteOrganization: vi.fn(),
  mockPush: vi.fn(),
  mockUpdateAdminOrgMember: vi.fn(),
}));

const searchParams = new URLSearchParams();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => ({ get: (key: string) => searchParams.get(key) }),
}));

vi.mock("@/src/features/auth/api", async () => {
  const actual = await vi.importActual<typeof import("@/src/features/auth/api")>("@/src/features/auth/api");
  return {
    ...actual,
    addPlatformAdmin: mockAddPlatformAdmin,
    adminOrganizationMembers: mockAdminOrganizationMembers,
    adminOrganizations: mockAdminOrganizations,
    adminPlans: mockAdminPlans,
    adminUsers: mockAdminUsers,
    createOrganization: mockCreateOrganization,
    deleteAdminOrgMember: mockDeleteAdminOrgMember,
    deleteAdminUser: mockDeleteAdminUser,
    deleteOrganization: mockDeleteOrganization,
    updateAdminOrgMember: mockUpdateAdminOrgMember,
  };
});

function renderPage() {
  return renderWithProviders(<UserManagementPage />);
}

describe("UserManagementPage", () => {
  beforeEach(() => {
    vi.spyOn(globalThis, "confirm").mockReturnValue(true);
    searchParams.delete("resumeOrgDraft");
    window.sessionStorage.clear();
    useAuthStore.setState({
      user: {
        id: "platform-admin-current",
        email: "current@wyrefy.com",
        full_name: "Current Admin",
        role: "platform_admin",
        status: "active",
        user_type: "platform",
        redirect_path: "/platform_admin/dashboard",
      },
    });

    mockAdminOrganizations.mockResolvedValue([
      {
        id: "org-1",
        name: "Acme Org",
        slug: "acme-org",
        allowed_email_domain: "acme.com",
        plan: "Starter",
        seat_count: 8,
        credits_used: "120.5",
        credits_remaining: "379.5",
        project_count: 3,
        project_limit: 10,
        projects_remaining: 7,
        token_usage: 10,
        compute_usage: 5,
        status: "active",
      },
    ]);
    mockAdminPlans.mockImplementation(async (_scope, tenantType) => [{
      id: tenantType === "organization" ? "org-plan-1" : "plan-1",
      name: tenantType === "organization" ? "Org Starter" : "Starter Plan",
      slug: tenantType === "organization" ? "org-starter" : "starter-plan",
      tenant_type: tenantType,
      price_cents: 2900,
      billing_interval: "monthly",
      included_credits: "500",
      limits_json: { projects: 5, credits: 500 },
      status: "active",
      is_public: true,
      organization_id: null,
    }]);
    mockAdminUsers.mockImplementation(async (type) => {
      if (type === "platform_admin") {
        return [{
          id: "admin-1",
          name: "Wyrefy Admin",
          email: "admin@wyrefy.com",
          plan: null,
          role: "platform_admin",
          user_type: "platform_admin",
          credits_used: "0",
          credits_remaining: "0",
          project_count: 0,
          project_limit: 0,
          projects_remaining: 0,
          token_usage: 0,
          compute_usage: 0,
          status: "active",
        }];
      }

      return [{
        id: "user-1",
        name: "Alice Doe",
        email: "alice@example.com",
        plan: "Starter Plan",
        role: "individual_user",
        user_type: "individual",
        credits_used: "100",
        credits_remaining: "400",
        project_count: 2,
        project_limit: 5,
        projects_remaining: 3,
        token_usage: 100,
        compute_usage: 12,
        status: "active",
      }];
    });
    mockAdminOrganizationMembers.mockResolvedValue([]);
    mockCreateOrganization.mockResolvedValue({ message: "created" });
    mockAddPlatformAdmin.mockResolvedValue({ message: "created" });
    mockDeleteAdminOrgMember.mockResolvedValue({ message: "deleted" });
    mockDeleteAdminUser.mockResolvedValue({ message: "deleted" });
    mockDeleteOrganization.mockResolvedValue({ message: "deleted" });
    mockUpdateAdminOrgMember.mockResolvedValue({ message: "updated" });
    mockPush.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("switches between organizations, users, and platform admin tabs", async () => {
    const user = userEvent.setup();
    renderPage();

    expect(await screen.findByText("Acme Org")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Individual users/ }));
    expect(await screen.findByText("Alice Doe")).toBeInTheDocument();
    expect(screen.queryByText("Suspend User")).not.toBeInTheDocument();
    expect(screen.queryByText("Assign Plan")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Platform Admin/ }));
    expect(await screen.findByRole("button", { name: "Add Platform Admin" })).toBeInTheDocument();
    expect(screen.getByText("Wyrefy Admin")).toBeInTheDocument();
  });

  it("opens the create organization form and submits a slugified payload", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(await screen.findByRole("button", { name: "Create Organization" }));
    const dialog = screen.getByRole("dialog", { name: "Create Organization" });

    await user.type(within(dialog).getByLabelText("Organization name"), "Acme Studio");
    await user.type(within(dialog).getByLabelText("Allowed email domain"), "acme.com");
    await user.type(within(dialog).getByLabelText("Admin full name"), "Jane Owner");
    await user.type(within(dialog).getByLabelText("Admin email"), "jane@acme.com");

    const planSelect = dialog.querySelector('select[name="plan_slug"]');
    if (!(planSelect instanceof HTMLSelectElement)) {
      throw new TypeError("Expected plan select to be an HTMLSelectElement.");
    }
    fireEvent.change(planSelect, { target: { value: "org-starter" } });

    await user.click(within(dialog).getByRole("button", { name: "Create Organization" }));

    await waitFor(() => {
      expect(mockCreateOrganization.mock.calls[0]?.[0]).toEqual({
        name: "Acme Studio",
        slug: "acme-studio",
        allowed_email_domain: "acme.com",
        admin_email: "jane@acme.com",
        admin_full_name: "Jane Owner",
        plan_slug: "org-starter",
      });
    });
  });

  it("stores the organization draft and routes to create a plan", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(await screen.findByRole("button", { name: "Create Organization" }));
    const dialog = screen.getByRole("dialog", { name: "Create Organization" });

    await user.type(within(dialog).getByLabelText("Organization name"), "Acme Studio");
    await user.type(within(dialog).getByLabelText("Allowed email domain"), "acme.com");
    await user.type(within(dialog).getByLabelText("Admin full name"), "Jane Owner");
    await user.type(within(dialog).getByLabelText("Admin email"), "jane@acme.com");
    await user.click(within(dialog).getByRole("button", { name: "Create plan" }));

    expect(JSON.parse(window.sessionStorage.getItem("wyrefy.platformAdmin.organizationDraft") ?? "{}")).toMatchObject({
      name: "Acme Studio",
      allowed_email_domain: "acme.com",
      admin_full_name: "Jane Owner",
      admin_email: "jane@acme.com",
    });
    expect(mockPush).toHaveBeenCalledWith("/platform_admin/plan-billing?createPlan=organization&returnTo=%2Fplatform_admin%2Fuser-management%3FresumeOrgDraft%3D1");
  });

  it("reopens the organization draft with preserved values after returning from plan creation", async () => {
    searchParams.set("resumeOrgDraft", "1");
    window.sessionStorage.setItem("wyrefy.platformAdmin.organizationDraft", JSON.stringify({
      name: "Saved Org",
      allowed_email_domain: "saved.com",
      admin_full_name: "Saved Owner",
      admin_email: "owner@saved.com",
      plan_slug: "org-starter",
    }));

    renderPage();

    const dialog = await screen.findByRole("dialog", { name: "Create Organization" });
    expect(within(dialog).getByLabelText("Organization name")).toHaveValue("Saved Org");
    expect(within(dialog).getByLabelText("Allowed email domain")).toHaveValue("saved.com");
    expect(within(dialog).getByLabelText("Admin full name")).toHaveValue("Saved Owner");
    expect(within(dialog).getByLabelText("Admin email")).toHaveValue("owner@saved.com");
  });

  it("deletes organizations and users from the action menus", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(await screen.findByLabelText("Organization actions for Acme Org"));
    await user.click(await screen.findByRole("button", { name: "Delete organization" }));
    expect(mockDeleteOrganization.mock.calls[0]?.[0]).toBe("org-1");

    await user.click(screen.getByRole("button", { name: /Individual users/ }));
    await user.click(await screen.findByLabelText("User actions for Alice Doe"));
    await user.click(await screen.findByRole("button", { name: "Delete user" }));
    expect(mockDeleteAdminUser.mock.calls[0]?.[0]).toBe("user-1");
  });

  it("opens the platform admin form, submits it, and exposes delete actions", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(await screen.findByRole("button", { name: /Platform Admin/ }));
    await user.click(screen.getByRole("button", { name: "Add Platform Admin" }));

    const dialog = screen.getByRole("dialog", { name: "Add Platform Admin" });
    await user.type(within(dialog).getByLabelText("Full name"), "New Admin");
    await user.type(within(dialog).getByLabelText("Email"), "new-admin@wyrefy.com");
    await user.click(within(dialog).getByRole("button", { name: "Add Admin" }));

    await waitFor(() => {
      expect(mockAddPlatformAdmin.mock.calls[0]?.[0]).toEqual({
        email: "new-admin@wyrefy.com",
        full_name: "New Admin",
      });
    });

    await user.click(await screen.findByLabelText("Platform admin actions for Wyrefy Admin"));
    await user.click(await screen.findByRole("button", { name: "Delete platform admin" }));
    expect(mockDeleteAdminUser.mock.calls.at(-1)?.[0]).toBe("admin-1");
  });
});

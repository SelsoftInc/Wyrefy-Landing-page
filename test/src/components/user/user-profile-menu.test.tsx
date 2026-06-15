import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/render";

const {
  mockLogout,
  mockBillingSummary,
  mockOrganizationBillingSummary,
  mockCurrentOrganization,
} = vi.hoisted(() => ({
  mockLogout: vi.fn(),
  mockBillingSummary: vi.fn(),
  mockOrganizationBillingSummary: vi.fn(),
  mockCurrentOrganization: vi.fn(),
}));

vi.mock("@/src/features/auth/api", () => ({
  logout: mockLogout,
  billingSummary: mockBillingSummary,
  organizationBillingSummary: mockOrganizationBillingSummary,
  currentOrganization: mockCurrentOrganization,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn() }),
  usePathname: () => "/individual/dashboard",
}));

const { UserProfileMenu } = await import("@/src/components/user/user-profile-menu");

describe("UserProfileMenu", () => {
  beforeEach(() => {
    mockBillingSummary.mockResolvedValue({
      credit_balance: "150.5",
      owner_type: "individual",
      subscription_status: "active",
      included_credits: "500",
      plan_limits_json: { projects: 5 },
    });
    mockLogout.mockResolvedValue({ message: "ok" });
  });

  it("renders with default user info", () => {
    renderWithProviders(<UserProfileMenu />);

    expect(screen.getByText("Guest User")).toBeInTheDocument();
  });

  it("opens the dropdown on click", async () => {
    const user = userEvent.setup();
    renderWithProviders(<UserProfileMenu />);

    await user.click(screen.getByRole("button"));

    await waitFor(() => {
      expect(screen.getByText("Theme Preference")).toBeInTheDocument();
    });
  });

  it("shows theme options in dropdown", async () => {
    const user = userEvent.setup();
    renderWithProviders(<UserProfileMenu />);

    await user.click(screen.getByRole("button"));

    await waitFor(() => {
      expect(screen.getByText("System")).toBeInTheDocument();
      expect(screen.getByText("Light")).toBeInTheDocument();
      expect(screen.getByText("Dark")).toBeInTheDocument();
    });
  });

  it("shows credit balance for non-platform-admin paths", async () => {
    const user = userEvent.setup();
    renderWithProviders(<UserProfileMenu />);

    await user.click(screen.getByRole("button"));

    await waitFor(() => {
      expect(screen.getByText("Credit Balance")).toBeInTheDocument();
    });
  });

  it("shows logout button in dropdown", async () => {
    const user = userEvent.setup();
    renderWithProviders(<UserProfileMenu />);

    await user.click(screen.getByRole("button"));

    await waitFor(() => {
      expect(screen.getByText("Log out")).toBeInTheDocument();
    });
  });
});

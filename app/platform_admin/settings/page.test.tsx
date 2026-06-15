import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import PlatformSettingsPage from "@/app/platform_admin/settings/page";
import { useAuthStore } from "@/src/features/auth/store";
import { renderWithProviders } from "../../../test/render";

const {
  mockChangePassword,
  mockLogout,
  mockReplace,
} = vi.hoisted(() => ({
  mockChangePassword: vi.fn(),
  mockLogout: vi.fn(),
  mockReplace: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mockReplace }),
}));

vi.mock("@/src/features/auth/api", async () => {
  const actual = await vi.importActual<typeof import("@/src/features/auth/api")>("@/src/features/auth/api");
  return {
    ...actual,
    changePassword: mockChangePassword,
    logout: mockLogout,
  };
});

vi.mock("@/src/features/settings/api", async () => {
  const actual = await vi.importActual<typeof import("@/src/features/settings/api")>("@/src/features/settings/api");
  return {
    ...actual,
    deleteAccount: vi.fn(),
    reauthenticate: vi.fn(),
  };
});

describe("PlatformSettingsPage", () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: {
        id: "admin-1",
        email: "admin@wyrefy.com",
        full_name: "Wyrefy Admin",
        role: "platform_admin",
        status: "active",
        user_type: "platform",
        redirect_path: "/platform_admin/dashboard",
      },
    });
    mockChangePassword.mockResolvedValue({ message: "ok" });
    mockLogout.mockResolvedValue({ message: "ok" });
    mockReplace.mockReset();
  });

  it("shows platform admin name, email, and delete account", () => {
    renderWithProviders(<PlatformSettingsPage />);

    expect(screen.getByText("Wyrefy Admin")).toBeInTheDocument();
    expect(screen.getByText("admin@wyrefy.com")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Log out" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Delete account/i })).toBeInTheDocument();
  });

  it("logs out from the settings page", async () => {
    const user = userEvent.setup();
    renderWithProviders(<PlatformSettingsPage />);

    await user.click(screen.getByRole("button", { name: "Log out" }));

    await waitFor(() => {
      expect(mockLogout).toHaveBeenCalled();
      expect(mockReplace).toHaveBeenCalledWith("/login");
    });
  });

  it("submits the password update form", async () => {
    const user = userEvent.setup();
    renderWithProviders(<PlatformSettingsPage />);

    const updateButton = screen.getByRole("button", { name: "Update password" });
    const passwordForm = updateButton.closest("form");
    if (!(passwordForm instanceof HTMLFormElement)) {
      throw new TypeError("Expected update password button to be inside a form.");
    }

    await user.type(within(passwordForm).getByLabelText("Current password"), "OldPassword123!");
    await user.type(within(passwordForm).getByLabelText("New password"), "NewPassword123!");
    await user.type(within(passwordForm).getByLabelText("Confirm new password"), "NewPassword123!");
    await user.click(updateButton);

    await waitFor(() => {
      expect(mockChangePassword).toHaveBeenCalledWith({
        current_password: "OldPassword123!",
        new_password: "NewPassword123!",
        confirm_password: "NewPassword123!",
      }, expect.anything());
    });
  });
});

import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach } from "vitest";

import { renderWithProviders } from "@/test/render";

const {
  mockGetParam,
  mockRefresh,
  mockReplace,
  mockResetPassword,
} = vi.hoisted(() => ({
  mockGetParam: vi.fn(),
  mockRefresh: vi.fn(),
  mockReplace: vi.fn(),
  mockResetPassword: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mockReplace, refresh: mockRefresh }),
  useSearchParams: () => ({ get: mockGetParam }),
}));

vi.mock("@/src/components/auth/auth-shell", () => ({
  AuthShell: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/src/features/auth/api", () => ({
  resetPassword: mockResetPassword,
}));

const { default: ResetPasswordPage } = await import("@/app/reset-password/page");

describe("ResetPasswordPage", () => {
  beforeEach(() => {
    mockGetParam.mockReturnValue("valid-reset-token-1234567890");
    mockResetPassword.mockReset();
    mockReplace.mockReset();
    mockRefresh.mockReset();
  });

  it("renders the form with password fields", () => {
    renderWithProviders(<ResetPasswordPage />);

    expect(screen.getByLabelText("New password")).toBeInTheDocument();
    expect(screen.getByLabelText("Confirm password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reset password" })).toBeInTheDocument();
  });

  it("shows back to login link", () => {
    renderWithProviders(<ResetPasswordPage />);

    const link = screen.getByText("Back to login").closest("a");
    expect(link).toHaveAttribute("href", "/login");
  });

  it("renders the hidden token input", () => {
    mockGetParam.mockReturnValue("secret-reset-token-value");
    renderWithProviders(<ResetPasswordPage />);

    const hiddenInput = screen.getByDisplayValue("secret-reset-token-value");
    expect(hiddenInput).toBeInTheDocument();
    expect(hiddenInput).toHaveAttribute("name", "token");
    expect(hiddenInput).toHaveAttribute("type", "hidden");
  });

  it("shows validation error toast when passwords don't match", async () => {
    const user = userEvent.setup();
    mockGetParam.mockReturnValue("valid-reset-token-1234567890");
    renderWithProviders(<ResetPasswordPage />);

    await user.type(screen.getByLabelText("New password"), "StrongPass1!");
    await user.type(screen.getByLabelText("Confirm password"), "Mismatch1!");
    await user.click(screen.getByRole("button", { name: "Reset password" }));

    await waitFor(() => {
      expect(screen.getByText("Passwords do not match")).toBeInTheDocument();
    });

    expect(mockResetPassword).not.toHaveBeenCalled();
  });

  it("shows error toast on API failure", async () => {
    const user = userEvent.setup();
    mockGetParam.mockReturnValue("valid-reset-token-1234567890");
    mockResetPassword.mockRejectedValue(new Error("Server error"));
    renderWithProviders(<ResetPasswordPage />);

    await user.type(screen.getByLabelText("New password"), "StrongPass1!");
    await user.type(screen.getByLabelText("Confirm password"), "StrongPass1!");
    await user.click(screen.getByRole("button", { name: "Reset password" }));

    await waitFor(() => {
      expect(screen.getByText("Server error")).toBeInTheDocument();
    });

    expect(mockResetPassword).toHaveBeenCalled();
  });
});

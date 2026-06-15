import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { renderWithProviders } from "../../../render";

const mockForgotPassword = vi.hoisted(() => vi.fn());

vi.mock("next/link", () => ({ default: ({ children, href, ...rest }: { children: ReactNode; href: string }) => <a href={href} {...rest}>{children}</a> }));

vi.mock("@/src/components/auth/auth-shell", () => ({
  AuthShell: ({ children }: { children: ReactNode }) => <div data-testid="auth-shell">{children}</div>,
}));

vi.mock("@/src/features/auth/api", () => ({
  forgotPassword: mockForgotPassword,
}));

vi.mock("@/src/components/ui/form-field", () => ({
  TextField: ({ label, name, defaultValue, placeholder, autoComplete }: { label: string; name: string; defaultValue?: string; placeholder?: string; autoComplete?: string }) => (
    <div>
      <label htmlFor={name}>{label}</label>
      <input id={name} name={name} defaultValue={defaultValue} placeholder={placeholder} autoComplete={autoComplete} data-testid={`field-${name}`} />
    </div>
  ),
}));

import { ForgotPasswordForm } from "@/src/components/auth/forgot-password-form";

describe("ForgotPasswordForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders AuthShell", () => {
    renderWithProviders(<ForgotPasswordForm initialEmail="" />);
    expect(screen.getByTestId("auth-shell")).toBeInTheDocument();
  });

  it("renders email field with default value", () => {
    renderWithProviders(<ForgotPasswordForm initialEmail="test@example.com" />);
    const input = screen.getByTestId("field-email") as HTMLInputElement;
    expect(input).toBeInTheDocument();
    expect(input.value).toBe("test@example.com");
  });

  it("renders submit button", () => {
    renderWithProviders(<ForgotPasswordForm initialEmail="" />);
    expect(screen.getByText("Send reset link")).toBeInTheDocument();
  });

  it("renders back to login link", () => {
    renderWithProviders(<ForgotPasswordForm initialEmail="" />);
    const link = screen.getByText("Back to login");
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/login");
  });

  it("calls forgotPassword API on valid submission", async () => {
    mockForgotPassword.mockResolvedValueOnce({ message: "Reset link sent" });

    const user = userEvent.setup();
    renderWithProviders(<ForgotPasswordForm initialEmail="" />);

    await user.type(screen.getByTestId("field-email"), "user@example.com");
    await user.click(screen.getByText("Send reset link"));

    await waitFor(() => {
      expect(mockForgotPassword).toHaveBeenCalledWith(expect.objectContaining({ email: "user@example.com" }), expect.anything());
    });
  });
});

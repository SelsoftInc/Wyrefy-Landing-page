import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { renderWithProviders } from "../../render";

const mockReplace = vi.hoisted(() => vi.fn());
const mockRefresh = vi.hoisted(() => vi.fn());
const mockGetParam = vi.hoisted(() => vi.fn());
const mockSetUser = vi.hoisted(() => vi.fn());
const mockComplete = vi.hoisted(() => vi.fn());
const mockResend = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mockReplace, refresh: mockRefresh }),
  useSearchParams: () => ({ get: mockGetParam }),
}));

vi.mock("@/src/components/auth/auth-shell", () => ({
  AuthShell: ({ children }: { children: ReactNode }) => <div data-testid="auth-shell">{children}</div>,
}));

vi.mock("@/src/features/auth/api", () => ({
  completeFirstLogin: mockComplete,
  resendFirstLogin: mockResend,
}));

vi.mock("@/src/features/auth/routing", () => ({
  routeForUser: (u: { user_type: string }) => u.user_type === "organization" ? "/organization/dashboard" : "/individual/dashboard",
}));

vi.mock("@/src/features/auth/store", () => ({
  useAuthStore: (selector: (state: { user: null; setUser: typeof mockSetUser }) => unknown) => {
    const state = { user: null, setUser: mockSetUser };
    return selector(state);
  },
}));

vi.mock("@/src/components/ui/form-field", () => ({
  TextField: ({ label, name, type, defaultValue, placeholder, autoComplete }: { label: string; name: string; type?: string; defaultValue?: string; placeholder?: string; autoComplete?: string }) => (
    <div>
      <label htmlFor={name}>{label}</label>
      <input id={name} name={name} type={type || "text"} defaultValue={defaultValue} placeholder={placeholder} autoComplete={autoComplete} data-testid={`field-${name}`} />
    </div>
  ),
}));

import VerifyFirstLoginPage from "@/app/verify-first-login/page";

describe("VerifyFirstLoginPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetParam.mockImplementation((key: string) => {
      if (key === "email") return "test@example.com";
      if (key === "step") return "verify_first_login";
      return "";
    });
  });

  it("renders AuthShell", async () => {
    renderWithProviders(<VerifyFirstLoginPage />);
    await waitFor(() => {
      expect(screen.getByTestId("auth-shell")).toBeInTheDocument();
    });
  });

  it("renders heading and subCopy", async () => {
    renderWithProviders(<VerifyFirstLoginPage />);
    await waitFor(() => {
      expect(screen.getByText("Verify and set your password")).toBeInTheDocument();
    });
  });

  it("renders email, code, and password fields", async () => {
    renderWithProviders(<VerifyFirstLoginPage />);
    await waitFor(() => {
      expect(screen.getByTestId("field-email")).toBeInTheDocument();
      expect(screen.getByTestId("field-code")).toBeInTheDocument();
      expect(screen.getByTestId("field-new_password")).toBeInTheDocument();
    });
  });

  it("renders resend code button", async () => {
    renderWithProviders(<VerifyFirstLoginPage />);
    await waitFor(() => {
      expect(screen.getByText("Resend code")).toBeInTheDocument();
    });
  });

  it("renders verify button", async () => {
    renderWithProviders(<VerifyFirstLoginPage />);
    await waitFor(() => {
      expect(screen.getByText("Verify and enter Wyrefy")).toBeInTheDocument();
    });
  });

  it("shows reset password copy when step is reset_first_login_password", async () => {
    mockGetParam.mockImplementation((key: string) => {
      if (key === "email") return "test@example.com";
      if (key === "step") return "reset_first_login_password";
      return "";
    });

    renderWithProviders(<VerifyFirstLoginPage />);
    await waitFor(() => {
      expect(screen.getByText("Set your password")).toBeInTheDocument();
    });
  });

  it("resends code when resend button clicked", async () => {
    mockResend.mockResolvedValueOnce({ message: "Sent" });

    const user = userEvent.setup();
    renderWithProviders(<VerifyFirstLoginPage />);
    await waitFor(() => {
      expect(screen.getByText("Resend code")).toBeInTheDocument();
    });
    await user.click(screen.getByText("Resend code"));

    await waitFor(() => {
      expect(mockResend).toHaveBeenCalledWith(expect.objectContaining({ email: "test@example.com" }), expect.anything());
    });
  });
});

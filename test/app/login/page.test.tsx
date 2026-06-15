import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/render";

const {
  mockLogin,
  mockStartGoogleLogin,
  mockReplace,
  mockRefresh,
  mockSetUser,
} = vi.hoisted(() => ({
  mockLogin: vi.fn(),
  mockStartGoogleLogin: vi.fn(),
  mockReplace: vi.fn(),
  mockRefresh: vi.fn(),
  mockSetUser: vi.fn(),
}));

vi.mock("@/src/features/auth/api", () => ({
  login: mockLogin,
  startGoogleLogin: mockStartGoogleLogin,
}));

vi.mock("@/src/features/auth/store", () => ({
  useAuthStore: (selector: (state: { setUser: typeof mockSetUser }) => unknown) => selector({ setUser: mockSetUser }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mockReplace, refresh: mockRefresh }),
}));

vi.mock("@/src/components/auth/auth-shell", () => ({
  AuthShell: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/src/components/ui/google-icon", () => ({
  GoogleIcon: () => <span>Google</span>,
}));

const { default: LoginPage } = await import("@/app/login/page");

describe("LoginPage", () => {
  beforeEach(() => {
    mockLogin.mockResolvedValue({
      next_step: "authenticated",
      user: { id: "u1", email: "a@b.com", full_name: "Test", role: "individual_user", status: "active", user_type: "individual", redirect_path: null, password_setup_required: false },
    });
    mockStartGoogleLogin.mockResolvedValue({ auth_url: "https://accounts.google.test" });
    sessionStorage.clear();
  });

  it("renders login form fields", () => {
    renderWithProviders(<LoginPage />);

    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
  });

  it("renders sign-in button", () => {
    renderWithProviders(<LoginPage />);

    expect(screen.getByText("Sign in")).toBeInTheDocument();
  });

  it("renders forgot password link", () => {
    renderWithProviders(<LoginPage />);

    expect(screen.getByText("Forgot password?").closest("a")).toHaveAttribute("href", "/forgot-password");
  });

  it("renders signup link", () => {
    renderWithProviders(<LoginPage />);

    const signupLink = screen.getByText("Signup").closest("a");
    expect(signupLink).toHaveAttribute("href", "/signup");
  });

  it("renders google login button", () => {
    renderWithProviders(<LoginPage />);

    expect(screen.getByText("Continue with Google")).toBeInTheDocument();
  });
});

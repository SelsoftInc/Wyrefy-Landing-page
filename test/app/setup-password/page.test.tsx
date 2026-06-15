import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "../../render";
import type { ReactNode } from "react";

const mockReplace = vi.hoisted(() => vi.fn());
const mockSetupPassword = vi.hoisted(() => vi.fn());
const mockSetUser = vi.hoisted(() => vi.fn());
const mockUseAuthStore = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mockReplace }),
}));

vi.mock("@/src/components/auth/auth-shell", () => ({
  AuthShell: ({ children }: { children: ReactNode }) => <div data-testid="auth-shell">{children}</div>,
}));

vi.mock("@/src/features/auth/api", () => ({
  setupPassword: mockSetupPassword,
}));

vi.mock("@/src/features/auth/store", () => ({
  useAuthStore: mockUseAuthStore,
}));

vi.mock("@/src/features/auth/routing", () => ({
  routeForUser: (u: { user_type: string }) => u.user_type === "organization" ? "/organization/dashboard" : "/individual/dashboard",
}));

vi.mock("@/src/components/ui/form-field", () => ({
  TextField: ({ label, name, type, placeholder, autoComplete }: { label: string; name: string; type?: string; placeholder?: string; autoComplete?: string }) => (
    <div>
      <label htmlFor={name}>{label}</label>
      <input
        id={name}
        name={name}
        type={type || "text"}
        placeholder={placeholder}
        autoComplete={autoComplete}
        data-testid={`field-${name}`}
      />
    </div>
  ),
}));

import SetupPasswordPage from "@/app/setup-password/page";

describe("SetupPasswordPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuthStore.mockImplementation((selector: (state: { user: null; setUser: typeof mockSetUser }) => unknown) => {
      const state = { user: null, setUser: mockSetUser };
      return selector(state);
    });
  });

  it("redirects to login when user is null", () => {
    renderWithProviders(<SetupPasswordPage />);
    expect(mockReplace).toHaveBeenCalledWith("/login");
  });

  it("renders form when user has password_setup_required", () => {
    mockUseAuthStore.mockImplementation((selector: (state: { user: { id: string; password_setup_required: boolean; user_type: string }; setUser: typeof mockSetUser }) => unknown) => {
      const state = { user: { id: "1", password_setup_required: true, user_type: "individual" as const }, setUser: mockSetUser };
      return selector(state);
    });

    renderWithProviders(<SetupPasswordPage />);
    expect(screen.getByText("Create your password")).toBeInTheDocument();
    expect(screen.getByText("Set Password & Continue")).toBeInTheDocument();
  });

  it("shows password fields", () => {
    mockUseAuthStore.mockImplementation((selector) => {
      const state = { user: { id: "1", password_setup_required: true, user_type: "individual" as const }, setUser: mockSetUser };
      return selector(state);
    });

    renderWithProviders(<SetupPasswordPage />);
    expect(screen.getByTestId("field-new_password")).toBeInTheDocument();
    expect(screen.getByTestId("field-confirm_password")).toBeInTheDocument();
  });

  it("redirects if password_setup_required is false", () => {
    mockUseAuthStore.mockImplementation((selector) => {
      const state = { user: { id: "1", password_setup_required: false, user_type: "individual" as const }, setUser: mockSetUser };
      return selector(state);
    });

    renderWithProviders(<SetupPasswordPage />);
    expect(mockReplace).toHaveBeenCalledWith("/individual/dashboard");
  });
});

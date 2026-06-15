import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { renderWithProviders } from "../../render";

const mockReplace = vi.fn();
const mockRefresh = vi.fn();
const mockGetParam = vi.fn();
const mockSetUser = vi.fn();
const mockComplete = vi.fn();
const mockPreview = vi.fn();
const mockStartGoogle = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mockReplace, refresh: mockRefresh }),
  useSearchParams: () => ({ get: mockGetParam }),
}));

vi.mock("@/src/components/auth/auth-shell", () => ({
  AuthShell: ({ children }: { children: ReactNode }) => <div data-testid="auth-shell">{children}</div>,
}));

vi.mock("@/src/features/auth/api", () => ({
  completeOrganizationInvite: mockComplete,
  previewOrganizationInvite: mockPreview,
  startGoogleInvite: mockStartGoogle,
}));

vi.mock("@/src/features/auth/routing", () => ({
  routeForUser: (u: { user_type: string }) => u.user_type === "organization" ? "/organization/dashboard" : "/individual/dashboard",
}));

vi.mock("@/src/features/auth/store", () => ({
  useAuthStore: (selector: (state: { setUser: typeof mockSetUser }) => unknown) => {
    const state = { setUser: mockSetUser };
    return selector(state);
  },
}));

vi.mock("@/src/components/ui/form-field", () => ({
  TextField: ({ label, name, type, placeholder, autoComplete }: { label: string; name: string; type?: string; placeholder?: string; autoComplete?: string }) => (
    <div>
      <label htmlFor={name}>{label}</label>
      <input id={name} name={name} type={type || "text"} placeholder={placeholder} autoComplete={autoComplete} data-testid={`field-${name}`} />
    </div>
  ),
}));

vi.mock("@/src/components/ui/google-icon", () => ({
  GoogleIcon: () => <span data-testid="google-icon" />,
}));

const InvitePage = (await import("@/app/invite/page")).default;

describe("InvitePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetParam.mockReturnValue("test-token");
  });

  it("renders AuthShell", async () => {
    renderWithProviders(<InvitePage />);
    await waitFor(() => {
      expect(screen.getByTestId("auth-shell")).toBeInTheDocument();
    });
  });

  it("renders join organization text", async () => {
    renderWithProviders(<InvitePage />);
    await waitFor(() => {
      expect(screen.getByText(/join the organization/i)).toBeInTheDocument();
    });
  });

  it("renders password fields", async () => {
    renderWithProviders(<InvitePage />);
    await waitFor(() => {
      expect(screen.getByTestId("field-new_password")).toBeInTheDocument();
      expect(screen.getByTestId("field-confirm_password")).toBeInTheDocument();
    });
  });

  it("renders Google login button", async () => {
    renderWithProviders(<InvitePage />);
    await waitFor(() => {
      expect(screen.getByText("Continue with Google")).toBeInTheDocument();
    });
  });

  it("renders login link", async () => {
    renderWithProviders(<InvitePage />);
    await waitFor(() => {
      expect(screen.getByText("Log in")).toBeInTheDocument();
    });
  });

  it("submits invite form", async () => {
    const user = userEvent.setup();
    mockComplete.mockResolvedValueOnce({ user: { id: "1", user_type: "individual" as const } });

    renderWithProviders(<InvitePage />);
    await waitFor(() => {
      expect(screen.getByTestId("field-new_password")).toBeInTheDocument();
    });

    await user.type(screen.getByTestId("field-new_password"), "StrongP@ss1");
    await user.type(screen.getByTestId("field-confirm_password"), "StrongP@ss1");
    await user.click(screen.getByText("Join organization"));

    await waitFor(() => {
      expect(mockComplete).toHaveBeenCalled();
    });
  });
});

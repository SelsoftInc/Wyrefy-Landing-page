import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../../render";

import type { ReactNode } from "react";

const mockReplace = vi.fn();
const mockRefresh = vi.fn();
const mockGetParam = vi.fn();
const mockSetUser = vi.fn();
const mockConfirm = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mockReplace, refresh: mockRefresh }),
  useSearchParams: () => ({ get: mockGetParam }),
}));

vi.mock("@/src/components/auth/auth-shell", () => ({
  AuthShell: ({ children }: { children: ReactNode }) => <div data-testid="auth-shell">{children}</div>,
}));

vi.mock("@/src/features/auth/api", () => ({
  confirmGoogle: mockConfirm,
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

vi.mock("@/src/components/ui/google-icon", () => ({
  GoogleIcon: () => <span data-testid="google-icon" />,
}));

const GoogleConfirmationPage = (await import("@/app/google-confirmation/page")).default;

describe("GoogleConfirmationPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetParam.mockReturnValue("test-state");
    sessionStorage.clear();
  });

  it("renders AuthShell", async () => {
    renderWithProviders(<GoogleConfirmationPage />);
    await waitFor(() => {
      expect(screen.getByTestId("auth-shell")).toBeInTheDocument();
    });
  });

  it("renders description text", async () => {
    renderWithProviders(<GoogleConfirmationPage />);
    await waitFor(() => {
      expect(screen.getByText(/This Google account matches a platform admin email/)).toBeInTheDocument();
    });
  });

  it("renders confirm button", async () => {
    renderWithProviders(<GoogleConfirmationPage />);
    await waitFor(() => {
      expect(screen.getByText("Confirm Google login")).toBeInTheDocument();
    });
  });

  it("renders decline button", async () => {
    renderWithProviders(<GoogleConfirmationPage />);
    await waitFor(() => {
      expect(screen.getByText("Decline")).toBeInTheDocument();
    });
  });

  it("calls confirmGoogle with confirm: true", async () => {
    mockConfirm.mockResolvedValueOnce({ user: { id: "1", user_type: "individual" as const } });

    const user = userEvent.setup();
    renderWithProviders(<GoogleConfirmationPage />);
    await waitFor(() => {
      expect(screen.getByText("Confirm Google login")).toBeInTheDocument();
    });
    await user.click(screen.getByText("Confirm Google login"));

    await waitFor(() => {
      expect(mockConfirm).toHaveBeenCalledWith(expect.objectContaining({ state: "test-state", confirm: true }), expect.anything());
    });
  });

  it("navigates to billing when plan is in sessionStorage", async () => {
    sessionStorage.setItem("wyrefy-selected-plan", "pro");
    mockConfirm.mockResolvedValueOnce({ user: { id: "1", user_type: "individual" as const } });

    const user = userEvent.setup();
    renderWithProviders(<GoogleConfirmationPage />);
    await waitFor(() => {
      expect(screen.getByText("Confirm Google login")).toBeInTheDocument();
    });
    await user.click(screen.getByText("Confirm Google login"));

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/individual/billing?plan=pro");
    });
  });

  it("decline redirects to login on success", async () => {
    mockConfirm.mockResolvedValueOnce({});

    const user = userEvent.setup();
    renderWithProviders(<GoogleConfirmationPage />);
    await waitFor(() => {
      expect(screen.getByText("Decline")).toBeInTheDocument();
    });
    await user.click(screen.getByText("Decline"));

    await waitFor(() => {
      expect(mockConfirm).toHaveBeenCalledWith(expect.objectContaining({ state: "test-state", confirm: false }), expect.anything());
    });
  });
});

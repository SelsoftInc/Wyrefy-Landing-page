import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { SignupForm } from "@/src/components/auth/signup-form";
import { renderWithProviders } from "@/test/render";

const {
  mockRefresh,
  mockReplace,
  mockResendSignup,
  mockSetUser,
  mockSignup,
  mockStartGoogleSignup,
  mockVerifySignup,
} = vi.hoisted(() => ({
  mockRefresh: vi.fn(),
  mockReplace: vi.fn(),
  mockResendSignup: vi.fn(),
  mockSetUser: vi.fn(),
  mockSignup: vi.fn(),
  mockStartGoogleSignup: vi.fn(),
  mockVerifySignup: vi.fn(),
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

vi.mock("@/src/features/auth/api", async () => {
  const actual = await vi.importActual<typeof import("@/src/features/auth/api")>("@/src/features/auth/api");
  return {
    ...actual,
    resendSignup: mockResendSignup,
    signup: mockSignup,
    startGoogleSignup: mockStartGoogleSignup,
    verifySignup: mockVerifySignup,
  };
});

vi.mock("@/src/features/auth/store", () => ({
  useAuthStore: (selector: (state: { setUser: typeof mockSetUser }) => unknown) => selector({ setUser: mockSetUser }),
}));

describe("SignupForm", () => {
  beforeEach(() => {
    mockSignup.mockResolvedValue({ message: "ok" });
    mockResendSignup.mockResolvedValue({ message: "resent" });
    mockStartGoogleSignup.mockResolvedValue({ auth_url: "https://accounts.google.test" });
    mockVerifySignup.mockResolvedValue({
      user: {
        id: "user-1",
        email: "dev@example.com",
        full_name: "Dev User",
        role: "individual_user",
        status: "active",
        user_type: "individual",
        redirect_path: "/individual/dashboard",
      },
    });
    sessionStorage.clear();
    mockReplace.mockReset();
    mockRefresh.mockReset();
    mockSetUser.mockReset();
  });

  it("submits signup details and switches to the verification form", async () => {
    const user = userEvent.setup();
    renderWithProviders(<SignupForm initialName="" initialEmail="" />);

    await user.type(screen.getByLabelText("Full name"), "Dev User");
    await user.type(screen.getByLabelText("Email"), "dev@example.com");
    await user.type(screen.getByLabelText("Password"), "Password1!");
    await user.click(screen.getByRole("button", { name: "Create account" }));

    await waitFor(() => {
      expect(mockSignup).toHaveBeenCalled();
      expect(mockSignup.mock.calls[0]?.[0]).toEqual({
        full_name: "Dev User",
        email: "dev@example.com",
        password: "Password1!",
      });
    });

    expect(await screen.findByText("Enter the verification code sent to dev@example.com.")).toBeInTheDocument();
  });

  it("verifies the code and redirects to the selected billing plan path", async () => {
    const user = userEvent.setup();
    sessionStorage.setItem("wyrefy-selected-plan", "starter");
    renderWithProviders(<SignupForm initialName="" initialEmail="" />);

    await user.type(screen.getByLabelText("Full name"), "Dev User");
    await user.type(screen.getByLabelText("Email"), "dev@example.com");
    await user.type(screen.getByLabelText("Password"), "Password1!");
    await user.click(screen.getByRole("button", { name: "Create account" }));

    const codeField = await screen.findByLabelText("Verification code");
    await user.type(codeField, "123456");
    await user.click(screen.getByRole("button", { name: "Verify account" }));

    await waitFor(() => {
      expect(mockVerifySignup).toHaveBeenCalled();
      expect(mockVerifySignup.mock.calls[0]?.[0]).toEqual({ email: "dev@example.com", code: "123456" });
      expect(mockSetUser).toHaveBeenCalled();
      expect(mockReplace).toHaveBeenCalledWith("/individual/billing?plan=starter");
    });
  });
});

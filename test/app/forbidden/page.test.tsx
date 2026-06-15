import type { ReactNode } from "react";
import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/render";

vi.mock("next/link", () => ({ default: ({ children, href, ...rest }: { children: ReactNode; href: string }) => <a href={href} {...rest}>{children}</a> }));

vi.mock("@/src/features/auth/store", () => ({
  useAuthStore: (selector: (s: { user: Record<string, unknown> }) => unknown) => selector({
    user: { id: "u1", email: "a@b.com", full_name: "Test", role: "individual_user", status: "active", user_type: "individual", redirect_path: null, password_setup_required: false },
  }),
}));

const { default: ForbiddenPage } = await import("@/app/forbidden/page");

describe("ForbiddenPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the forbidden message", () => {
    renderWithProviders(<ForbiddenPage />);

    expect(screen.getByText("Access unavailable")).toBeInTheDocument();
    expect(screen.getByText(/This area is not available/)).toBeInTheDocument();
  });

  it("shows return to dashboard link", () => {
    renderWithProviders(<ForbiddenPage />);

    const link = screen.getByText("Return to dashboard").closest("a");
    expect(link).toHaveAttribute("href", "/individual/dashboard");
  });
});

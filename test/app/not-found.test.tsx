import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/render";

const { mockMe, mockSetUser } = vi.hoisted(() => ({
  mockMe: vi.fn(),
  mockSetUser: vi.fn(),
}));

vi.mock("@/src/features/auth/api", () => ({
  me: mockMe,
}));

vi.mock("@/src/features/auth/store", () => ({
  useAuthStore: (selector: (state: { setUser: typeof mockSetUser }) => unknown) => selector({ setUser: mockSetUser }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn() }),
}));

const { default: NotFound } = await import("@/app/not-found");

describe("NotFound page", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockSetUser.mockReset();
  });

  it("renders the not-found message", () => {
    mockMe.mockRejectedValue(new Error("not logged in"));
    renderWithProviders(<NotFound />);

    expect(screen.getByText("Page not found")).toBeInTheDocument();
    expect(screen.getByText(/That page is not available/)).toBeInTheDocument();
  });

  it("shows a return action label", () => {
    mockMe.mockRejectedValue(new Error("not logged in"));
    renderWithProviders(<NotFound />);

    expect(screen.getByText("Return now")).toBeInTheDocument();
  });
});

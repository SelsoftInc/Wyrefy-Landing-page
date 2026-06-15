import type { ReactNode } from "react";
import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/render";

vi.mock("next/link", () => ({ default: ({ children, href, ...rest }: { children: ReactNode; href: string }) => <a href={href} {...rest}>{children}</a> }));

const { default: UnauthorizedPage } = await import("@/app/unauthorized/page");

describe("UnauthorizedPage", () => {
  it("renders session required message", () => {
    renderWithProviders(<UnauthorizedPage />);

    expect(screen.getByText("Session required")).toBeInTheDocument();
    expect(screen.getByText(/Your session is missing or expired/)).toBeInTheDocument();
  });

  it("shows sign in link", () => {
    renderWithProviders(<UnauthorizedPage />);

    const link = screen.getByText("Sign in").closest("a");
    expect(link).toHaveAttribute("href", "/login");
  });
});

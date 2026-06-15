import type { ReactNode } from "react";
import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/render";

vi.mock("next/link", () => ({ default: ({ children, href, ...rest }: { children: ReactNode; href: string }) => <a href={href} {...rest}>{children}</a> }));

const { default: TermsPage } = await import("@/app/terms/page");

describe("TermsPage", () => {
  it("renders terms and conditions heading", () => {
    renderWithProviders(<TermsPage />);

    expect(screen.getByText("Terms & Conditions")).toBeInTheDocument();
  });

  it("renders the Wyrefy brand link", () => {
    renderWithProviders(<TermsPage />);

    const brandLink = screen.getByText("Wyrefy").closest("a");
    expect(brandLink).toHaveAttribute("href", "/login");
  });
});

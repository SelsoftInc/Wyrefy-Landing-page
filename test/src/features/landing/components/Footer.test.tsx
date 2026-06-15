import type { ReactNode } from "react";
import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Footer } from "@/src/features/landing/components/Footer";
import { renderWithProviders } from "@/test/render";

vi.mock("next/link", () => ({ default: ({ children, href, ...rest }: { children: ReactNode; href: string }) => <a href={href} {...rest}>{children}</a> }));

describe("Footer", () => {
  it("renders the copyright with current year", () => {
    renderWithProviders(<Footer />);

    expect(screen.getByText(/Wyrefy Inc\. All rights reserved\./)).toBeInTheDocument();
  });

  it("renders privacy and terms links", () => {
    renderWithProviders(<Footer />);

    const privacyLink = screen.getByText("Privacy Policy").closest("a");
    expect(privacyLink).toHaveAttribute("href", "/privacy");

    const termsLink = screen.getByText("Terms of Service").closest("a");
    expect(termsLink).toHaveAttribute("href", "/terms");
  });
});

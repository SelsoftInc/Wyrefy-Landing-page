import type { ReactNode } from "react";
import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/render";

vi.mock("next/link", () => ({ default: ({ children, href, ...rest }: { children: ReactNode; href: string }) => <a href={href} {...rest}>{children}</a> }));

const { default: PrivacyPage } = await import("@/app/privacy/page");

describe("PrivacyPage", () => {
  it("renders privacy policy heading", () => {
    renderWithProviders(<PrivacyPage />);

    expect(screen.getByText("Privacy Policy")).toBeInTheDocument();
  });

  it("renders the Wyrefy brand link", () => {
    renderWithProviders(<PrivacyPage />);

    const brandLink = screen.getByText("Wyrefy").closest("a");
    expect(brandLink).toHaveAttribute("href", "/login");
  });
});

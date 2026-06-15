import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "../../../render";

vi.mock("@/src/components/ui/brand-logo", () => ({
  BrandLogo: ({ className }: { className?: string }) => <div data-testid="brand-logo" className={className}>Logo</div>,
}));

vi.mock("@/src/components/ui/theme-switcher", () => ({
  ThemeSwitcher: () => <div data-testid="theme-switcher" />,
}));

import { AuthShell } from "@/src/components/auth/auth-shell";

describe("AuthShell", () => {
  it("renders children", () => {
    renderWithProviders(<AuthShell><p data-testid="child">Hello</p></AuthShell>);
    expect(screen.getByTestId("child")).toHaveTextContent("Hello");
  });

  it("renders BrandLogo", () => {
    renderWithProviders(<AuthShell><div /></AuthShell>);
    expect(screen.getByTestId("brand-logo")).toBeInTheDocument();
  });

  it("renders ThemeSwitcher", () => {
    renderWithProviders(<AuthShell><div /></AuthShell>);
    expect(screen.getByTestId("theme-switcher")).toBeInTheDocument();
  });

  it("displays Wyrefy branding text", () => {
    renderWithProviders(<AuthShell><div /></AuthShell>);
    expect(screen.getByText("Wyrefy")).toBeInTheDocument();
  });

  it("displays tagline text", () => {
    renderWithProviders(<AuthShell><div /></AuthShell>);
    expect(screen.getByText("Build production interfaces from product intent.")).toBeInTheDocument();
  });
});

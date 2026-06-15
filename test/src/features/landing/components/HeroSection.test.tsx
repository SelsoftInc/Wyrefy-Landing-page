import type { ReactNode } from "react";
import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { HeroSection } from "@/src/features/landing/components/HeroSection";
import { renderWithProviders } from "@/test/render";

vi.mock("next/link", () => ({ default: ({ children, href, ...rest }: { children: ReactNode; href: string }) => <a href={href} {...rest}>{children}</a> }));

describe("HeroSection", () => {
  it("renders the heading and description", () => {
    renderWithProviders(<HeroSection />);

    expect(screen.getByText("working preview.")).toBeInTheDocument();
    expect(screen.getByText(/Wyrefy brings Figma imports/)).toBeInTheDocument();
  });

  it("renders the signal cards", () => {
    renderWithProviders(<HeroSection />);

    expect(screen.getByText("Figma-aware context")).toBeInTheDocument();
    expect(screen.getByText("Chat iteration")).toBeInTheDocument();
    expect(screen.getByText("Live preview")).toBeInTheDocument();
    expect(screen.getByText("Sandboxed execution")).toBeInTheDocument();
  });

  it("renders CTA links to signup and login", () => {
    renderWithProviders(<HeroSection />);

    const startBuilding = screen.getByText("Start building");
    expect(startBuilding.closest("a")).toHaveAttribute("href", "/signup");

    const login = screen.getByText("Login");
    expect(login.closest("a")).toHaveAttribute("href", "/login");
  });
});

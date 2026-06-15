import type { ReactNode } from "react";
import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Navbar } from "@/src/features/landing/components/Navbar";
import { renderWithProviders } from "@/test/render";

vi.mock("next/link", () => ({ default: ({ children, href, ...rest }: { children: ReactNode; href: string }) => <a href={href} {...rest}>{children}</a> }));

describe("Navbar", () => {
  it("renders the Wyrefy brand name", () => {
    renderWithProviders(<Navbar />);

    expect(screen.getByText("Wyrefy")).toBeInTheDocument();
  });

  it("renders navigation links", () => {
    renderWithProviders(<Navbar />);

    expect(screen.getByText("Features").closest("a")).toHaveAttribute("href", "/#features");
    expect(screen.getByText("How It Works").closest("a")).toHaveAttribute("href", "/#how-it-works");
    expect(screen.getByText("Pricing").closest("a")).toHaveAttribute("href", "/#pricing");
    expect(screen.getByText("Contact").closest("a")).toHaveAttribute("href", "/contact");
  });

  it("renders login and get started links", () => {
    renderWithProviders(<Navbar />);

    expect(screen.getByText("Login").closest("a")).toHaveAttribute("href", "/login");
    expect(screen.getByText("Get Started").closest("a")).toHaveAttribute("href", "/signup");
  });
});

import { screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import { AccessState, AppLoading, SectionLoading, SkeletonRows } from "@/src/components/ui/loading-states";
import { renderWithProviders } from "@/test/render";

vi.mock("next/link", () => ({ default: ({ children, href, ...rest }: { children: ReactNode; href: string }) => <a href={href} {...rest}>{children}</a> }));

describe("AppLoading", () => {
  it("renders with default label", () => {
    renderWithProviders(<AppLoading />);
    expect(screen.getByText("Loading Wyrefy")).toBeInTheDocument();
  });

  it("renders with custom label", () => {
    renderWithProviders(<AppLoading label="Custom Loading" />);
    expect(screen.getByText("Custom Loading")).toBeInTheDocument();
  });
});

describe("SectionLoading", () => {
  it("renders with default label", () => {
    renderWithProviders(<SectionLoading />);
    expect(screen.getByText("LOADING")).toBeInTheDocument();
  });

  it("renders with custom label", () => {
    renderWithProviders(<SectionLoading label="Fetching Data" />);
    expect(screen.getByText("FETCHING DATA")).toBeInTheDocument();
  });
});

describe("SkeletonRows", () => {
  it("renders the specified number of rows", () => {
    const { container } = renderWithProviders(<SkeletonRows rows={5} />);
    const shimmerElements = container.querySelectorAll(".loading-shimmer");
    expect(shimmerElements.length).toBe(5);
  });

  it("renders 3 rows by default", () => {
    const { container } = renderWithProviders(<SkeletonRows />);
    const shimmerElements = container.querySelectorAll(".loading-shimmer");
    expect(shimmerElements.length).toBe(3);
  });
});

describe("AccessState", () => {
  it("renders with default props", () => {
    renderWithProviders(<AccessState title="Forbidden" message="You cannot access this page." />);
    expect(screen.getByText("Forbidden")).toBeInTheDocument();
    expect(screen.getByText("You cannot access this page.")).toBeInTheDocument();
    expect(screen.getByText("Continue").closest("a")).toHaveAttribute("href", "/login");
  });

  it("renders not-found variant", () => {
    renderWithProviders(
      <AccessState title="Not Found" message="Page missing." kind="not-found" href="/custom" actionLabel="Go back" />
    );
    expect(screen.getByText("Not Found")).toBeInTheDocument();
    expect(screen.getByText("Go back").closest("a")).toHaveAttribute("href", "/custom");
  });
});

import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { FeaturesSection } from "@/src/features/landing/components/FeaturesSection";
import { renderWithProviders } from "@/test/render";

describe("FeaturesSection", () => {
  it("renders the section heading", () => {
    renderWithProviders(<FeaturesSection />);

    expect(screen.getByText("Wyrefy projects move.")).toBeInTheDocument();
  });

  it("renders all feature cards", () => {
    renderWithProviders(<FeaturesSection />);

    expect(screen.getByText("Figma context first")).toBeInTheDocument();
    expect(screen.getByText("Chat-based iteration")).toBeInTheDocument();
    expect(screen.getByText("Backend-proxied preview")).toBeInTheDocument();
    expect(screen.getByText("Sandboxed execution")).toBeInTheDocument();
    expect(screen.getByText("Durable workflow handoff")).toBeInTheDocument();
    expect(screen.getByText("Usage-aware workspace")).toBeInTheDocument();
  });

  it("renders feature descriptions", () => {
    renderWithProviders(<FeaturesSection />);

    expect(screen.getByText(/Import design context as a project revision/)).toBeInTheDocument();
    expect(screen.getByText(/Ask for changes inside the project workspace/)).toBeInTheDocument();
  });
});

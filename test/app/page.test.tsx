import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { renderWithProviders } from "../render";

const mockReplace = vi.hoisted(() => vi.fn());
const mockPush = vi.hoisted(() => vi.fn());
const mockMe = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mockReplace, push: mockPush }),
}));

vi.mock("@/src/features/auth/api", () => ({
  me: mockMe,
  publicPlans: () => Promise.resolve([]),
}));

vi.mock("@/src/features/auth/routing", () => ({
  routeForUser: (u: { user_type: string }) => u.user_type === "organization" ? "/organization/dashboard" : "/individual/dashboard",
}));

vi.mock("@/src/features/landing/components/Navbar", () => ({
  Navbar: () => <nav data-testid="navbar" />,
}));

vi.mock("@/src/features/landing/components/HeroSection", () => ({
  HeroSection: () => <section data-testid="hero" />,
}));

vi.mock("@/src/features/landing/components/FeaturesSection", () => ({
  FeaturesSection: () => <section data-testid="features" />,
}));

vi.mock("@/src/features/landing/components/HowItWorksSection", () => ({
  HowItWorksSection: () => <section data-testid="how-it-works" />,
}));

vi.mock("@/src/features/landing/components/PricingSection", () => ({
  PricingSection: () => (
    <section data-testid="pricing">
      <span>Pricing</span>
    </section>
  ),
}));

vi.mock("@/src/features/landing/components/Footer", () => ({
  Footer: () => <footer data-testid="footer" />,
}));

import Home from "@/app/page";

describe("HomePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("renders loading state initially", () => {
    const { container } = renderWithProviders(<Home />);
    expect(container.querySelector(".blue-atmosphere")).toBeInTheDocument();
  });

  it("renders all sections when ready", async () => {
    renderWithProviders(<Home />);
    await waitFor(() => {
      expect(screen.getByTestId("navbar")).toBeInTheDocument();
      expect(screen.getByTestId("hero")).toBeInTheDocument();
      expect(screen.getByTestId("features")).toBeInTheDocument();
      expect(screen.getByTestId("how-it-works")).toBeInTheDocument();
      expect(screen.getByTestId("pricing")).toBeInTheDocument();
      expect(screen.getByTestId("footer")).toBeInTheDocument();
    });
  });

  it("redirects authenticated users", async () => {
    mockMe.mockResolvedValueOnce({ user: { id: "1", user_type: "individual" } });
    localStorage.setItem("wyrefy-has-visited", "true");

    renderWithProviders(<Home />);
    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/individual/dashboard");
    });
  });
});

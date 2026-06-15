import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { PricingSection } from "@/src/features/landing/components/PricingSection";
import { renderWithProviders } from "@/test/render";

const basePlan = {
  id: "plan-1",
  name: "Starter Plan",
  slug: "starter",
  tenant_type: "individual" as const,
  price_cents: 2900,
  billing_interval: "monthly" as const,
  included_credits: "500",
  limits_json: { projects: 5, credits: 500 },
  status: "active" as const,
  is_public: true,
  organization_id: null,
};

const proPlan = {
  ...basePlan,
  id: "plan-2",
  name: "Pro Plan",
  slug: "pro",
  price_cents: 9900,
  included_credits: "2000",
  limits_json: { projects: 20, credits: 2000 },
};

const enterprisePlan = {
  ...basePlan,
  id: "plan-3",
  name: "Enterprise",
  slug: "enterprise",
  price_cents: 0,
  included_credits: "10000",
  limits_json: { projects: 100, credits: 10000 },
};

describe("PricingSection", () => {
  it("renders plan names and prices", () => {
    renderWithProviders(<PricingSection plans={[basePlan, proPlan, enterprisePlan]} onSelectPlan={vi.fn()} />);

    expect(screen.getByText("Starter Plan")).toBeInTheDocument();
    expect(screen.getByText("Pro Plan")).toBeInTheDocument();
    expect(screen.getByText("Enterprise")).toBeInTheDocument();

    expect(screen.getByText("$29")).toBeInTheDocument();
    expect(screen.getByText("$99")).toBeInTheDocument();
    expect(screen.getByText("Custom")).toBeInTheDocument();
  });

  it("shows 'Most Popular' badge on the featured plan", () => {
    renderWithProviders(<PricingSection plans={[basePlan, proPlan]} onSelectPlan={vi.fn()} />);

    expect(screen.getAllByText("Most Popular").length).toBeGreaterThanOrEqual(1);
  });

  it("shows 'Choose Plan' buttons and calls onSelectPlan with slug", async () => {
    const onSelect = vi.fn();
    const user = userEvent.setup();
    renderWithProviders(<PricingSection plans={[basePlan]} onSelectPlan={onSelect} />);

    await user.click(screen.getByText("Choose Plan"));

    expect(onSelect).toHaveBeenCalledWith("starter");
  });

  it("shows 'Contact' for enterprise plan", () => {
    renderWithProviders(<PricingSection plans={[enterprisePlan]} onSelectPlan={vi.fn()} />);

    expect(screen.getByText("Contact")).toBeInTheDocument();
  });

  it("renders included features for each plan", () => {
    renderWithProviders(<PricingSection plans={[basePlan, proPlan, enterprisePlan]} onSelectPlan={vi.fn()} />);

    const projectsTexts = screen.getAllByText(/projects/);
    expect(projectsTexts.length).toBeGreaterThanOrEqual(3);
  });
});

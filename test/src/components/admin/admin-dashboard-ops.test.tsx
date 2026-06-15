import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AdminDashboardOps } from "@/src/components/admin/admin-dashboard-ops";
import { renderWithProviders } from "@/test/render";

const { mockAdminDashboard, mockSandboxTrends, mockTokenTrends } = vi.hoisted(() => ({
  mockAdminDashboard: vi.fn(),
  mockSandboxTrends: vi.fn(),
  mockTokenTrends: vi.fn(),
}));

vi.mock("@/src/features/admin-ops/api", () => ({
  adminDashboard: mockAdminDashboard,
  tokenTrends: mockTokenTrends,
  sandboxTrends: mockSandboxTrends,
}));

describe("AdminDashboardOps", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAdminDashboard.mockResolvedValue({
      users: 18,
      organizations: 7,
      active_subscriptions: 11,
      mrr_cents: 129900,
      arr_cents: 1558800,
      token_usage: 420000,
      llm_cost_usd: "640.25",
      sandbox_seconds: "28800",
      sandbox_cost_usd: "312.40",
      open_support_tickets: 3,
    });
    mockTokenTrends.mockImplementation((_days: number, params?: { provider?: string; model_name?: string }) => {
      if (params?.provider === "openai") {
        return Promise.resolve({
          selected_value: "openai::gpt-4.1",
          selected_label: "openai / gpt-4.1",
          options: [
            { value: "all", label: "All models" },
            { value: "openai::gpt-4.1", label: "openai / gpt-4.1", provider: "openai", model_name: "gpt-4.1" },
          ],
          points: [{ bucket: "2026-06-01", usage: 1200, cost_usd: "4.25" }],
          totals: { usage: 1200, cost_usd: "4.25" },
        });
      }
      return Promise.resolve({
        selected_value: "all",
        selected_label: "All models",
        options: [
          { value: "all", label: "All models" },
          { value: "openai::gpt-4.1", label: "openai / gpt-4.1", provider: "openai", model_name: "gpt-4.1" },
        ],
        points: [{ bucket: "2026-06-01", usage: 2400, cost_usd: "8.50" }],
        totals: { usage: 2400, cost_usd: "8.50" },
      });
    });
    mockSandboxTrends.mockResolvedValue({
      selected_value: "all",
      selected_label: "All profiles",
      options: [
        { value: "all", label: "All profiles" },
        { value: "ecs-fargate-default", label: "ecs-fargate-default" },
      ],
      points: [{ bucket: "2026-06-01", usage: "7200", cost_usd: "32.10" }],
      totals: { usage: "7200", cost_usd: "32.10" },
    });
  });

  it("renders the new trend-driven dashboard", async () => {
    renderWithProviders(<AdminDashboardOps />);

    expect(await screen.findByText("Token Usage and Cost")).toBeInTheDocument();
    expect(screen.getByText("Sandbox Usage and Cost")).toBeInTheDocument();
    expect(screen.getByText("Monthly Revenue")).toBeInTheDocument();
    expect(screen.getByText("$640.25")).toBeInTheDocument();
    expect(screen.getByText("$312.40")).toBeInTheDocument();
  });

  it("switches token trends to the selected model", async () => {
    const user = userEvent.setup();
    renderWithProviders(<AdminDashboardOps />);

    await screen.findByText("Token Usage and Cost");
    const [modelSelect] = screen.getAllByRole("combobox");
    await user.selectOptions(modelSelect, "openai::gpt-4.1");

    await waitFor(() => {
      expect(mockTokenTrends).toHaveBeenLastCalledWith(30, { provider: "openai", model_name: "gpt-4.1" });
    });
    expect(await screen.findAllByText("1.2K tokens")).toHaveLength(2);
  });
});

import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AdminReportsOps } from "@/src/components/admin/admin-reports-ops";
import { renderWithProviders } from "@/test/render";

const { mockAdminReport, mockExportReport } = vi.hoisted(() => ({
  mockAdminReport: vi.fn(),
  mockExportReport: vi.fn(),
}));

vi.mock("@/src/features/admin-ops/api", () => ({
  adminReport: mockAdminReport,
  exportReport: mockExportReport,
}));

const reports = {
  mrr: {
    kind: "mrr",
    title: "Financial / MRR",
    description: "MRR snapshot by plan.",
    summary: [
      { label: "Current MRR", value: "$1,299.00" },
      { label: "Annualized ARR", value: "$15,588.00" },
    ],
    sections: [
      {
        title: "Active Plan Revenue",
        description: "Current revenue concentration by plan.",
        columns: ["Plan", "Active subscriptions", "MRR"],
        rows: [{ label: "Starter", values: ["9", "$999.00"] }],
        empty_message: "No active subscription revenue has been recorded yet.",
      },
    ],
    export_ready: true,
  },
  usage: {
    kind: "usage",
    title: "Platform Usage",
    description: "Usage snapshot by model and compute profile.",
    summary: [
      { label: "Total tokens", value: "420,000" },
      { label: "LLM spend", value: "$640.25" },
    ],
    sections: [
      {
        title: "Token Spend by Model",
        description: "Which model families are driving spend.",
        columns: ["Model", "Tokens", "Cost"],
        rows: [{ label: "openai / gpt-4.1", values: ["420,000", "$640.25"] }],
        empty_message: "No LLM usage events have been metered yet.",
      },
    ],
    export_ready: true,
  },
} as const;

describe("AdminReportsOps", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAdminReport.mockImplementation((kind: "mrr" | "usage" | "subscriptions") => {
      if (kind === "usage") return Promise.resolve(reports.usage);
      return Promise.resolve(reports.mrr);
    });
    mockExportReport.mockResolvedValue(reports.mrr);
  });

  it("renders the structured report snapshot", async () => {
    renderWithProviders(<AdminReportsOps />);

    expect(await screen.findByText("Active Plan Revenue")).toBeInTheDocument();
    expect(screen.getByText("$1,299.00")).toBeInTheDocument();
  });

  it("switches report kinds and triggers export", async () => {
    const user = userEvent.setup();
    renderWithProviders(<AdminReportsOps />);

    await screen.findByText("Active Plan Revenue");
    await user.click(screen.getByRole("button", { name: /Platform Usage/i }));

    await waitFor(() => {
      expect(mockAdminReport).toHaveBeenLastCalledWith("usage");
    });
    expect(await screen.findByText("Token Spend by Model")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Export Report Snapshot" }));
    expect(await screen.findByText("Export Snapshot Ready")).toBeInTheDocument();
    expect(mockExportReport).toHaveBeenCalledWith("usage");
  });
});

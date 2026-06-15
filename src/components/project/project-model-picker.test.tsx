import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ProjectModelPicker } from "@/src/components/project/project-model-picker";
import type { RuntimeModel } from "@/src/features/runtime/types";

const models: RuntimeModel[] = [
  {
    id: "model-1",
    provider: "openai",
    model_name: "GPT-5",
    model_id: "gpt-5",
    version: 1,
    status: "active",
    input_price_per_million: "5",
    output_price_per_million: "15",
    cache_read_price_per_million: "0",
    cache_write_price_per_million: "0",
    context_window_tokens: 200000,
    metadata_json: {},
  },
  {
    id: "model-2",
    provider: "anthropic",
    model_name: "Claude Sonnet 4",
    model_id: "claude-sonnet-4",
    version: 1,
    status: "active",
    input_price_per_million: "3",
    output_price_per_million: "15",
    cache_read_price_per_million: "0",
    cache_write_price_per_million: "0",
    context_window_tokens: 200000,
    metadata_json: {},
  },
];

describe("ProjectModelPicker", () => {
  it("filters models by provider and search text", () => {
    const onOpenChange = vi.fn();
    render(
      <ProjectModelPicker
        models={models}
        selectedModelId="model-1"
        open
        onOpenChange={onOpenChange}
        onSelect={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Anthropic" }));
    expect(screen.getByText("Claude Sonnet 4")).toBeInTheDocument();
    expect(screen.queryByText("gpt-5")).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Search runtime models"), { target: { value: "gpt" } });
    expect(screen.getByText("No models match the current search or provider filter.")).toBeInTheDocument();
  });
});

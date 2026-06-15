import { fireEvent, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ProjectChatComposer } from "@/src/components/project/project-chat-composer";
import type { RuntimeModel } from "@/src/features/runtime/types";
import { renderWithProviders } from "../../../test/render";

const models: RuntimeModel[] = [
  {
    id: "model-1",
    provider: "openai",
    model_name: "GPT-5",
    model_id: "gpt-5",
    version: 1,
    status: "active",
    input_price_per_million: "0",
    output_price_per_million: "0",
    cache_read_price_per_million: "0",
    cache_write_price_per_million: "0",
    context_window_tokens: 200000,
    metadata_json: {},
  },
];

function renderComposer(overrides: Partial<React.ComponentProps<typeof ProjectChatComposer>> = {}) {
  const props: React.ComponentProps<typeof ProjectChatComposer> = {
    active: true,
    disabled: false,
    isSending: false,
    models,
    open: false,
    placeholder: "Write a prompt",
    selectedModelId: "model-1",
    value: "",
    onOpenChange: vi.fn(),
    onSelect: vi.fn(),
    onSend: vi.fn(),
    onValueChange: vi.fn(),
    ...overrides,
  };

  return {
    props,
    ...renderWithProviders(<ProjectChatComposer {...props} />),
  };
}

describe("ProjectChatComposer", () => {
  it("submits on Enter but not on Shift+Enter", async () => {
    const onSend = vi.fn();
    renderComposer({ value: "Ship it", onSend });

    const textarea = screen.getByLabelText("Message prompt");
    fireEvent.keyDown(textarea, { key: "Enter" });
    fireEvent.keyDown(textarea, { key: "Enter", shiftKey: true });

    expect(onSend).toHaveBeenCalledTimes(1);
  });

  it("shows the figma inline action and adds a figma chip when connected", async () => {
    const user = userEvent.setup();
    const onFigmaMode = vi.fn();
    renderComposer({ value: "Use the figma design", hasFigmaConnection: true, onFigmaMode });

    expect(screen.getByRole("button", { name: "Figma +" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Figma +" }));

    expect(onFigmaMode).toHaveBeenCalledTimes(1);
    expect(screen.getByText("Figma")).toBeInTheDocument();
  });

  it("opens the figma connect prompt when oauth is not connected", async () => {
    const user = userEvent.setup();
    const onConnectFigma = vi.fn();
    renderComposer({ value: "Need figma context", onConnectFigma });

    await user.click(screen.getByRole("button", { name: "Figma +" }));
    expect(screen.getByText("Figma OAuth is not connected")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Connect Figma" }));
    expect(onConnectFigma).toHaveBeenCalledTimes(1);
  });

  it("passes selected files to the upload handler", () => {
    const onFilesSelected = vi.fn();
    renderComposer({ onFilesSelected });

    const input = screen.getByLabelText("Upload files");
    const file = new File(["hello"], "notes.txt", { type: "text/plain" });
    fireEvent.change(input, { target: { files: [file] } });

    expect(onFilesSelected).toHaveBeenCalledTimes(1);
    expect(onFilesSelected.mock.calls[0]?.[0][0]).toBe(file);
  });
});

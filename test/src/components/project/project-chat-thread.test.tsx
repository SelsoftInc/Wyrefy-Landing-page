import { createRef } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Message } from "@/src/components/project/project-agent-message";
import { ProjectChatThread } from "@/src/components/project/project-chat-thread";

vi.mock("@/src/components/project/project-chat-composer", () => ({
  ProjectChatComposer: () => <div data-testid="chat-composer" />,
}));

describe("ProjectChatThread", () => {
  it("shows a visible scroll affordance and scrolls smoothly to the latest message", () => {
    const scrollRef = createRef<HTMLDivElement>();
    render(
      <ProjectChatThread
        hasStartedChat
        sandboxState="interactive"
        messages={[{ role: "agent", content: "Latest response" }]}
        effectiveSelectedModelId="model-1"
        isSending={false}
        models={[]}
        showModelPicker={false}
        input=""
        onOpenChange={() => undefined}
        onSelect={() => undefined}
        onSend={() => undefined}
        onValueChange={() => undefined}
        scrollRef={scrollRef}
      />,
    );

    const scrollContainer = scrollRef.current;
    expect(scrollContainer).not.toBeNull();
    expect(scrollContainer?.className).toContain("custom-scrollbar");
    expect(scrollContainer?.className).not.toContain("no-scrollbar");

    const scrollTo = vi.fn();
    Object.defineProperties(scrollContainer as HTMLDivElement, {
      scrollHeight: { configurable: true, value: 1200 },
      clientHeight: { configurable: true, value: 400 },
      scrollTop: { configurable: true, writable: true, value: 0 },
      scrollTo: { configurable: true, value: scrollTo },
    });

    fireEvent.scroll(scrollContainer as HTMLDivElement);

    const button = screen.getByRole("button", { name: "Scroll to latest message" });
    fireEvent.click(button);

    expect(scrollTo).toHaveBeenCalledWith({ top: 1200, behavior: "smooth" });
  });
});

describe("Message", () => {
  it("uses the Wyrefy-branded agent avatar", () => {
    render(<Message role="agent" content="Hello" />);

    expect(screen.getByAltText("Wyrefy")).toBeInTheDocument();
  });
});

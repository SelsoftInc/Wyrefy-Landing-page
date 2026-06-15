import { act, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { HowItWorksSection } from "@/src/features/landing/components/HowItWorksSection";
import { renderWithProviders } from "@/test/render";

describe("HowItWorksSection", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it("renders all step titles", () => {
    renderWithProviders(<HowItWorksSection />);

    expect(screen.getByText("1. Open a project")).toBeInTheDocument();
    expect(screen.getByText("2. Import context")).toBeInTheDocument();
    expect(screen.getByText("3. Iterate in chat")).toBeInTheDocument();
    expect(screen.getByText("4. Review live preview")).toBeInTheDocument();
  });

  it("shows the first step as active by default", () => {
    renderWithProviders(<HowItWorksSection />);

    expect(screen.getByText("Project workspace")).toBeInTheDocument();
    expect(screen.getByText("Metadata loaded")).toBeInTheDocument();
  });

  it("switches active step when a step button is clicked", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderWithProviders(<HowItWorksSection />);

    await user.click(screen.getByText("3. Iterate in chat"));

    await waitFor(() => {
      expect(screen.getByText("Agent run")).toBeInTheDocument();
    });
  });

  it("auto-advances the active tab after intervals", async () => {
    renderWithProviders(<HowItWorksSection />);

    expect(screen.getByText("Project workspace")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(6000);
    });

    await waitFor(() => {
      expect(screen.getByText("Figma revision")).toBeInTheDocument();
    });

    act(() => {
      vi.advanceTimersByTime(6000);
    });

    await waitFor(() => {
      expect(screen.getByText("Agent run")).toBeInTheDocument();
    });
  });
});

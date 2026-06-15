import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ThemeSwitcher } from "@/src/components/ui/theme-switcher";
import { renderWithProviders } from "@/test/render";

describe("ThemeSwitcher", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders the trigger button", () => {
    renderWithProviders(<ThemeSwitcher />);

    expect(screen.getByText("System")).toBeInTheDocument();
  });

  it("opens the dropdown on click", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ThemeSwitcher />);

    await user.click(screen.getByText("System"));

    await waitFor(() => {
      expect(screen.getByText("Light")).toBeInTheDocument();
      expect(screen.getByText("Dark")).toBeInTheDocument();
    });
  });

  it("switches theme when a theme option is clicked", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ThemeSwitcher />);

    await user.click(screen.getByText("System"));

    const darkButton = await screen.findByText("Dark");
    await user.click(darkButton);

    expect(localStorage.getItem("wyrefy-theme")).toBe("dark");
  });
});

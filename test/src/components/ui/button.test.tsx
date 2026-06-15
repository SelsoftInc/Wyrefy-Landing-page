import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Button } from "@/src/components/ui/button";
import { renderWithProviders } from "@/test/render";

describe("Button", () => {
  it("renders children text", () => {
    renderWithProviders(<Button>Click me</Button>);
    expect(screen.getByText("Click me")).toBeInTheDocument();
  });

  it("shows loading state and disables button", () => {
    renderWithProviders(<Button loading>Saving</Button>);
    expect(screen.getByText("Processing…")).toBeInTheDocument();
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("calls onClick when clicked", async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    renderWithProviders(<Button onClick={onClick}>Click</Button>);

    await user.click(screen.getByText("Click"));

    expect(onClick).toHaveBeenCalledOnce();
  });

  it("does not call onClick when loading", async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    renderWithProviders(<Button onClick={onClick} loading>Click</Button>);

    await user.click(screen.getByRole("button"));

    expect(onClick).not.toHaveBeenCalled();
  });

  it("accepts custom className", () => {
    renderWithProviders(<Button className="custom-class">Styled</Button>);
    expect(screen.getByText("Styled").className).toContain("custom-class");
  });

  it("renders with icon", () => {
    renderWithProviders(<Button icon={<span>icon</span>}>With Icon</Button>);
    expect(screen.getByText("icon")).toBeInTheDocument();
  });
});

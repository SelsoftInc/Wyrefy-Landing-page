import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";

vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, style, className, ...rest }: { children?: ReactNode; style?: Record<string, unknown>; className?: string }) => (
      <div className={className} style={style} {...rest}>{children}</div>
    ),
  },
  useMotionTemplate: () => "radial-gradient-test",
  useMotionValue: (val: number) => ({ get: () => val, set: vi.fn() }),
}));

import { CardSpotlight } from "@/src/components/ui/card-spotlight";

describe("CardSpotlight", () => {
  it("renders children", () => {
    render(<CardSpotlight><p>Content</p></CardSpotlight>);
    expect(screen.getByText("Content")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = render(<CardSpotlight className="custom-class"><div /></CardSpotlight>);
    const outerDiv = container.firstChild as HTMLElement;
    expect(outerDiv.className).toContain("custom-class");
  });

  it("renders without crashing with default props", () => {
    render(<CardSpotlight><span>Hello</span></CardSpotlight>);
    expect(screen.getByText("Hello")).toBeInTheDocument();
  });
});

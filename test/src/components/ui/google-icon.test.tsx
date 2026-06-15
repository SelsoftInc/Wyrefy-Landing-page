import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { GoogleIcon } from "@/src/components/ui/google-icon";

describe("GoogleIcon", () => {
  it("renders an SVG with default class", () => {
    render(<GoogleIcon />);
    const svg = document.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute("aria-hidden", "true");
  });

  it("accepts custom className", () => {
    render(<GoogleIcon className="custom-size" />);
    const svg = document.querySelector("svg");
    expect(svg?.getAttribute("class")).toContain("custom-size");
  });
});

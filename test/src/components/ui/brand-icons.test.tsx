import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AwsIcon, FigmaIcon, GithubIcon, VercelIcon } from "@/src/components/ui/brand-icons";

describe("brand icons", () => {
  it("renders FigmaIcon with default size", () => {
    const { container } = render(<FigmaIcon />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg?.getAttribute("class")).toContain("size-4");
  });

  it("renders GithubIcon with custom className", () => {
    const { container } = render(<GithubIcon className="size-6" />);
    const svg = container.querySelector("svg");
    expect(svg?.getAttribute("class")).toContain("size-6");
  });

  it("renders VercelIcon", () => {
    const { container } = render(<VercelIcon />);
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("renders AwsIcon", () => {
    const { container } = render(<AwsIcon />);
    expect(container.querySelector("svg")).toBeInTheDocument();
  });
});

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { BrandLogo } from "@/src/components/ui/brand-logo";

describe("BrandLogo", () => {
  it("renders both logo images", () => {
    render(<BrandLogo />);

    const images = screen.getAllByAltText("Wyrefy");
    expect(images.length).toBe(2);
  });
});

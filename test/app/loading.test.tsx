import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Loading from "@/app/loading";
import { renderWithProviders } from "@/test/render";

describe("Loading page", () => {
  it("renders the app loading state", () => {
    renderWithProviders(<Loading />);
    expect(screen.getByText("Loading Wyrefy")).toBeInTheDocument();
  });
});

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { DataTable } from "@/src/components/ui/data-table";

describe("DataTable", () => {
  it("renders headers", () => {
    render(<DataTable headers={["Name", "Email", "Role"]}><tbody><tr><td>A</td><td>B</td><td>C</td></tr></tbody></DataTable>);
    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("Email")).toBeInTheDocument();
    expect(screen.getByText("Role")).toBeInTheDocument();
  });

  it("renders children in tbody", () => {
    render(<DataTable headers={["Name"]}><tbody><tr><td>John</td></tr></tbody></DataTable>);
    expect(screen.getByText("John")).toBeInTheDocument();
  });

  it("renders table element", () => {
    render(<DataTable headers={["A"]}><tbody><tr><td>1</td></tr></tbody></DataTable>);
    expect(screen.getByRole("table")).toBeInTheDocument();
  });
});

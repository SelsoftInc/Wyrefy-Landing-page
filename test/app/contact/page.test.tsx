import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";

vi.mock("@/src/features/landing/components", () => ({
  Navbar: () => <nav data-testid="navbar" />,
  Footer: () => <footer data-testid="footer" />,
}));

vi.mock("@/src/components/ui/form-field", () => ({
  SelectField: ({ label, id, children }: { label: string; id: string; children: ReactNode }) => (
    <div data-testid="select-field">
      <label htmlFor={id}>{label}</label>
      <select id={id}>{children}</select>
    </div>
  ),
}));

const ContactPage = (await import("@/app/contact/page")).default;

describe("ContactPage", () => {
  it("renders heading", () => {
    render(<ContactPage />);
    expect(screen.getByText("Get in Touch")).toBeInTheDocument();
  });

  it("renders subtitle", () => {
    render(<ContactPage />);
    expect(screen.getByText("Let's build something remarkable")).toBeInTheDocument();
  });

  it("renders Navbar", () => {
    render(<ContactPage />);
    expect(screen.getByTestId("navbar")).toBeInTheDocument();
  });

  it("renders Footer", () => {
    render(<ContactPage />);
    expect(screen.getByTestId("footer")).toBeInTheDocument();
  });

  it("renders email address", () => {
    render(<ContactPage />);
    expect(screen.getByText("hello@wyrefy.com")).toBeInTheDocument();
  });

  it("renders location", () => {
    render(<ContactPage />);
    expect(screen.getByText("San Francisco, CA, USA")).toBeInTheDocument();
  });

  it("renders full name input", () => {
    render(<ContactPage />);
    expect(screen.getByLabelText("Full Name")).toBeInTheDocument();
  });

  it("renders email input", () => {
    render(<ContactPage />);
    expect(screen.getByLabelText("Email Address")).toBeInTheDocument();
  });

  it("renders message textarea", () => {
    render(<ContactPage />);
    expect(screen.getByLabelText("Message")).toBeInTheDocument();
  });

  it("renders SelectField with options", () => {
    render(<ContactPage />);
    expect(screen.getByTestId("select-field")).toBeInTheDocument();
    expect(screen.getByText("General Inquiry")).toBeInTheDocument();
    expect(screen.getByText("Enterprise Sales")).toBeInTheDocument();
    expect(screen.getByText("Technical Support")).toBeInTheDocument();
  });

  it("renders Send Message button", () => {
    render(<ContactPage />);
    expect(screen.getByText("Send Message")).toBeInTheDocument();
  });
});

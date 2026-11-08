import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import { RouteError } from "@/components/article/RouteError";

import { render } from "../../content/__tests__/test-utils";

vi.mock("@tanstack/react-router", () => ({
  Link: ({ to, children, className }: { to: string; children: ReactNode; className?: string }) => (
    <a href={to} className={className}>
      {children}
    </a>
  ),
}));

describe("RouteError", () => {
  it("renders the error message, retry, and home link", () => {
    const html = render(<RouteError error={new Error("Loader exploded")} reset={() => {}} />);

    expect(html).toContain("Something went wrong");
    expect(html).toContain("Loader exploded");
    expect(html).toContain("Try again");
    expect(html).toContain('href="/"');
    expect(html).toContain("Back to home");
  });

  it("falls back to a generic message for unknown errors", () => {
    const html = render(<RouteError error="nope" reset={() => {}} />);

    expect(html).toContain("An unexpected error occurred.");
  });
});

import { afterEach, describe, expect, it, vi } from "vitest";

import { SiteFooter } from "@/routes/__root";

import { render } from "../components/content/__tests__/test-utils";

afterEach(() => {
  vi.useRealTimers();
});

describe("SiteFooter", () => {
  it("computes the current year at render time", () => {
    vi.useFakeTimers();

    vi.setSystemTime(new Date("2030-06-01T00:00:00.000Z"));
    expect(render(<SiteFooter />)).toContain("2030");

    vi.setSystemTime(new Date("2031-06-01T00:00:00.000Z"));
    expect(render(<SiteFooter />)).toContain("2031");
  });
});

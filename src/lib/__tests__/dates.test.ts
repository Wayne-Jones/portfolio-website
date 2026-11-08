import { describe, expect, it } from "vitest";

import { formatMonthYear } from "@/lib/dates";

describe("formatMonthYear", () => {
  it("formats a midnight-UTC timestamp without shifting the month", () => {
    expect(formatMonthYear("2026-01-01T00:00:00.000Z")).toBe("Jan 2026");
    expect(formatMonthYear("2025-12-31T23:59:59.000Z")).toBe("Dec 2025");
  });

  it("formats timestamps across the year boundary in UTC", () => {
    expect(formatMonthYear("2024-02-29T12:00:00.000Z")).toBe("Feb 2024");
    expect(formatMonthYear("2023-07-15T00:00:00.000Z")).toBe("Jul 2023");
  });

  it("returns the original string when the date is invalid", () => {
    expect(formatMonthYear("not-a-date")).toBe("not-a-date");
    expect(formatMonthYear("")).toBe("");
  });
});

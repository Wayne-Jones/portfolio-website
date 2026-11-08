import { describe, expect, it } from "vitest";

import {
  pageSize,
  paginate,
  paginationPaths,
  parsePageNumber,
  resolvePage,
} from "@/content/pagination";

describe("paginate", () => {
  it("uses a page size of 12 by default", () => {
    expect(pageSize).toBe(12);
  });

  it("reports a single page when content fits", () => {
    expect(paginate(0)).toEqual({ pageCount: 1, lastPage: 1 });
    expect(paginate(12)).toEqual({ pageCount: 1, lastPage: 1 });
  });

  it("rounds up when content exceeds the page size", () => {
    expect(paginate(13)).toEqual({ pageCount: 2, lastPage: 2 });
    expect(paginate(24)).toEqual({ pageCount: 2, lastPage: 2 });
    expect(paginate(25)).toEqual({ pageCount: 3, lastPage: 3 });
  });
});

describe("resolvePage", () => {
  const items = Array.from({ length: 25 }, (_, index) => index + 1);

  it("returns the first page slice", () => {
    expect(resolvePage(items, 1)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  });

  it("returns the second page slice", () => {
    expect(resolvePage(items, 2)).toEqual([13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24]);
  });

  it("returns the final partial page", () => {
    expect(resolvePage(items, 3)).toEqual([25]);
  });

  it("returns an empty slice past the end", () => {
    expect(resolvePage(items, 4)).toEqual([]);
  });
});

describe("paginationPaths", () => {
  it("omits the page suffix for page 1", () => {
    expect(paginationPaths("/blog", 12)).toEqual(["/blog"]);
  });

  it("enumerates later pages", () => {
    expect(paginationPaths("/blog", 25)).toEqual(["/blog", "/blog/page/2", "/blog/page/3"]);
  });
});

describe("parsePageNumber", () => {
  it("accepts canonical positive integers", () => {
    expect(parsePageNumber("1")).toBe(1);
    expect(parsePageNumber("12")).toBe(12);
  });

  it("rejects zero, negatives, decimals, and leading zeros", () => {
    expect(parsePageNumber("0")).toBeNull();
    expect(parsePageNumber("-2")).toBeNull();
    expect(parsePageNumber("2.5")).toBeNull();
    expect(parsePageNumber("02")).toBeNull();
  });

  it("rejects non-numeric segments", () => {
    expect(parsePageNumber("abc")).toBeNull();
    expect(parsePageNumber("")).toBeNull();
  });
});

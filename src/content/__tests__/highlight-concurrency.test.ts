import { describe, expect, it, vi } from "vitest";

const createHighlighter = vi.fn(() =>
  Promise.resolve({
    codeToHtml: () => "<pre></pre>",
    loadTheme: () => Promise.resolve(),
  }),
);

vi.mock("shiki", () => ({ createHighlighter }));

describe("highlighter initialization", () => {
  it("shares one in-flight instance across concurrent callers", async () => {
    vi.resetModules();
    const { getHighlighter } = await import("@/content/highlight");

    const instances = await Promise.all([getHighlighter(), getHighlighter(), getHighlighter()]);

    expect(new Set(instances).size).toBe(1);
    expect(createHighlighter).toHaveBeenCalledTimes(1);
  });
});

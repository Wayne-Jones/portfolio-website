import { describe, expect, it } from "vitest";

import { getHighlighter, highlightCodeBlocks } from "@/content/highlight";
import type { ContentBlock } from "@/content/types";

function codeBlock(language: string | undefined, code: string): ContentBlock {
  return { type: "codeBlock", language, code };
}

describe("highlightCodeBlocks", () => {
  it("populates highlightedHtml for whitelisted languages", async () => {
    const tree: ContentBlock[] = [codeBlock("typescript", "const value: number = 1;")];
    const result = await highlightCodeBlocks(tree);

    expect(result).toBe(tree);
    const [block] = result;
    if (block?.type !== "codeBlock") throw new Error("Expected a code block");
    expect(block.highlightedHtml).toContain("<pre");
    expect(block.highlightedHtml).toContain("language-typescript");
  });

  it("skips languages outside the whitelist", async () => {
    const tree: ContentBlock[] = [codeBlock("rust", "fn main() {}"), codeBlock("typescript", "")];
    const result = await highlightCodeBlocks(tree);

    for (const block of result) {
      if (block.type !== "codeBlock") throw new Error("Expected a code block");
      expect(block.highlightedHtml).toBeUndefined();
    }
  });
});

describe("language handling", () => {
  it("leaves un-normalized aliases unhighlighted", async () => {
    const tree: ContentBlock[] = [codeBlock("js", "const x = 1;")];
    const [block] = await highlightCodeBlocks(tree);

    if (block?.type !== "codeBlock") throw new Error("Expected a code block");
    // `js` is normalized to `javascript` by the translator, not the highlighter.
    expect(block.highlightedHtml).toBeUndefined();
  });
});

describe("nested highlighting", () => {
  it("walks code blocks nested in quotes and list items", async () => {
    const tree: ContentBlock[] = [
      {
        type: "blockquote",
        children: [codeBlock("javascript", "const a = 1;")],
      },
      {
        type: "list",
        ordered: false,
        items: [[codeBlock("css", "a { color: red; }")]],
      },
    ];

    const result = await highlightCodeBlocks(tree);

    const [quote, list] = result;
    if (quote?.type !== "blockquote") throw new Error("Expected a blockquote");
    if (list?.type !== "list") throw new Error("Expected a list");
    const quoteCode = quote.children[0];
    const listCode = list.items[0]?.[0];
    if (quoteCode?.type !== "codeBlock") throw new Error("Expected a code block");
    if (listCode?.type !== "codeBlock") throw new Error("Expected a code block");

    expect(quoteCode.highlightedHtml).toBeDefined();
    expect(listCode.highlightedHtml).toBeDefined();
  });
});

describe("highlighter lifecycle", () => {
  it("reuses a single highlighter instance", async () => {
    expect(await getHighlighter()).toBe(await getHighlighter());
  });
});

import { parse } from "parse5";

import { inlineToText, slugify } from "../text.ts";
import type { ContentBlock, ContentTree } from "../types.ts";
import { translateNode } from "./ghost-translate.ts";
import { findDescendant, type Parse5Node } from "./parse5-utils.ts";

/**
 * Translate Ghost's HTML body into the canonical `ContentTree`.
 *
 * Pure, synchronous translation — the adapter is responsible for the async
 * Shiki highlighting pass afterwards. Unrecognized markup is preserved via
 * the `html` escape hatch instead of throwing.
 */
export function htmlToTree(html: string): ContentTree {
  if (html.trim() === "") {
    return [];
  }
  const tree = walkAndTranslate(parse(html));
  assignHeadingIds(tree);
  return tree;
}

/** Translate a parsed document (or fragment root) into a canonical tree. */
function walkAndTranslate(node: Parse5Node): ContentTree {
  const body = findDescendant(node, (child) => child.nodeName === "body");
  const root = body ?? node;
  const blocks: ContentBlock[] = [];
  for (const child of root.childNodes ?? []) {
    translateNode(child, blocks);
  }
  return blocks;
}

/**
 * Give every heading a unique, non-empty anchor id. Repeated heading text gets
 * a numeric suffix (`section`, `section-1`, …) so in-page anchors stay valid.
 */
function assignHeadingIds(blocks: ContentBlock[]): void {
  const seen = new Map<string, number>();

  for (const block of blocks) {
    if (block.type === "heading") {
      const base = (block.id ?? slugify(inlineToText(block.children))).trim();
      if (base === "") {
        block.id = undefined;
        continue;
      }
      const count = seen.get(base) ?? 0;
      seen.set(base, count + 1);
      block.id = count === 0 ? base : `${base}-${count}`;
      continue;
    }
    if (block.type === "blockquote") {
      assignHeadingIds(block.children);
      continue;
    }
    if (block.type === "list") {
      for (const item of block.items) {
        assignHeadingIds(item);
      }
    }
  }
}

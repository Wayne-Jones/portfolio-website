import type { ContentInline } from "../types.ts";
import type { Parse5Node } from "./parse5-utils.ts";
import { extractAttr, extractTextContent } from "./parse5-utils.ts";

/**
 * Translate a single inline-level parse5 node into one or more canonical
 * `ContentInline` nodes. Unknown inline elements are treated as transparent
 * wrappers so nested marks are preserved.
 */
export function translateInlineChild(node: Parse5Node, result: ContentInline[]): void {
  const nodeName = node.nodeName;
  if (nodeName === undefined || nodeName === "") return;

  if (nodeName === "#text") {
    const text = node.value ?? "";
    if (text !== "") result.push({ type: "text", value: text });
    return;
  }

  if (nodeName.startsWith("#")) return; // comments, doctype

  switch (nodeName.toLowerCase()) {
    case "strong":
    case "b": {
      pushWrapped(node, result, "strong");
      return;
    }
    case "em":
    case "i": {
      pushWrapped(node, result, "emphasis");
      return;
    }
    case "a": {
      pushLink(node, result);
      return;
    }
    case "code": {
      const code = node.value ?? extractTextContent(node);
      if (code !== "") result.push({ type: "inlineCode", value: code });
      return;
    }
    case "br": {
      result.push({ type: "hardBreak" });
      return;
    }
    default: {
      // Transparent wrapper (span, mark, u, sup, sub, ...): keep nested marks.
      for (const child of node.childNodes ?? []) {
        translateInlineChild(child, result);
      }
    }
  }
}

/** Translate an element's children into normalized inline nodes. */
export function extractInlineChildren(node: Parse5Node): ContentInline[] {
  const result: ContentInline[] = [];
  for (const child of node.childNodes ?? []) {
    translateInlineChild(child, result);
  }
  return normalizeInlineWhitespace(result);
}

/** Collapse runs of whitespace and trim the edges of an inline sequence. */
export function normalizeInlineWhitespace(children: ContentInline[]): ContentInline[] {
  const normalized = children.map((child) => {
    if (child.type === "text") {
      return { type: "text" as const, value: child.value.replace(/\s+/gu, " ") };
    }
    return child;
  });

  const first = normalized[0];
  if (first !== undefined && first.type === "text") {
    first.value = first.value.trimStart();
  }
  const last = normalized.at(-1);
  if (last !== undefined && last.type === "text") {
    last.value = last.value.trimEnd();
  }

  return normalized.filter((child) => child.type !== "text" || child.value !== "");
}

function pushWrapped(node: Parse5Node, result: ContentInline[], type: "strong" | "emphasis"): void {
  const children: ContentInline[] = [];
  for (const child of node.childNodes ?? []) {
    translateInlineChild(child, children);
  }
  if (children.length > 0) result.push({ type, children });
}

function pushLink(node: Parse5Node, result: ContentInline[]): void {
  const href = extractAttr(node, "href");
  const children: ContentInline[] = [];
  for (const child of node.childNodes ?? []) {
    translateInlineChild(child, children);
  }
  if (children.length === 0) return;
  if (href === undefined || href === "") {
    result.push(...children);
    return;
  }
  result.push({ type: "link", href, children });
}

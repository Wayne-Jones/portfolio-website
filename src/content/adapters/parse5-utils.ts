import type { ContentBlock } from "../types.ts";

/**
 * Minimal structural type for parse5 nodes.
 *
 * parse5's default tree adapter uses `attrs` (not `attribs`) for element
 * attributes and `value` (not `rawText`) for text nodes. Keeping this small
 * local shape avoids importing parse5 types into the canonical content layer.
 */
export interface Parse5Node {
  nodeName?: string;
  tagName?: string;
  /** Text content for `#text` nodes. */
  value?: string;
  attrs?: Array<{ name: string; value: string }>;
  childNodes?: Parse5Node[];
}

const VOID_ELEMENTS = new Set([
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr",
]);

/** Read an attribute, returning `undefined` when absent. */
export function extractAttr(node: Parse5Node, attr: string): string | undefined {
  if (!node.attrs || !Array.isArray(node.attrs)) return undefined;
  return node.attrs.find((a) => a.name === attr)?.value;
}

/** Concatenate the text content of a node tree. */
export function extractTextContent(node: Parse5Node): string {
  if (node.nodeName === "#text") return node.value ?? "";
  if (!node.childNodes) return "";
  return node.childNodes.map(extractTextContent).join("");
}

/** Find the first descendant (depth-first) matching a predicate. */
export function findDescendant(
  node: Parse5Node,
  predicate: (candidate: Parse5Node) => boolean,
): Parse5Node | undefined {
  for (const child of node.childNodes ?? []) {
    if (predicate(child)) return child;
    const nested = findDescendant(child, predicate);
    if (nested !== undefined) return nested;
  }
  return undefined;
}

/** Find every descendant (depth-first) matching a predicate. */
export function findAllDescendants(
  node: Parse5Node,
  predicate: (candidate: Parse5Node) => boolean,
): Parse5Node[] {
  const matches: Parse5Node[] = [];
  for (const child of node.childNodes ?? []) {
    if (predicate(child)) matches.push(child);
    matches.push(...findAllDescendants(child, predicate));
  }
  return matches;
}

/** Does the element's `class` attribute include the given class name? */
export function hasClass(node: Parse5Node, className: string): boolean {
  const classes = extractAttr(node, "class");
  if (classes === undefined) return false;
  return classes.split(/\s+/u).includes(className);
}

/** Collect the classes applied to an element. */
export function getClassList(node: Parse5Node): string[] {
  const classes = extractAttr(node, "class");
  if (classes === undefined) return [];
  return classes.split(/\s+/u).filter((c) => c !== "");
}

/**
 * Serialize a parse5 node back to HTML. Used by the `html` escape hatch so
 * unrecognized Ghost cards survive translation unchanged.
 */
export function serializeNode(node: Parse5Node): string {
  if (node.nodeName === undefined) return "";
  if (node.nodeName === "#text") return escapeHtml(node.value ?? "");
  if (node.nodeName.startsWith("#")) return "";

  const tag = node.tagName ?? node.nodeName;
  const attrs = (node.attrs ?? []).map((a) => ` ${a.name}="${escapeHtml(a.value)}"`).join("");

  if (VOID_ELEMENTS.has(tag.toLowerCase())) return `<${tag}${attrs}>`;

  const children = (node.childNodes ?? []).map(serializeNode).join("");
  return `<${tag}${attrs}>${children}</${tag}>`;
}

/** Preserve unrecognized markup through the `html` escape hatch. */
export function pushHtmlFallback(node: Parse5Node, blocks: ContentBlock[]): void {
  const html = serializeNode(node);
  if (html !== "") blocks.push({ type: "html", html });
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/gu, "&amp;")
    .replace(/</gu, "&lt;")
    .replace(/>/gu, "&gt;")
    .replace(/"/gu, "&quot;");
}

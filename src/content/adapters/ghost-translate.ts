import { inlineToText, slugify } from "../text.ts";
import type { ContentBlock, ContentInline, HeadingLevel } from "../types.ts";
import {
  translateAnchor,
  translateDiv,
  translateFigure,
  translateIframe,
  translateImage,
} from "./ghost-cards.ts";
import {
  extractInlineChildren,
  normalizeInlineWhitespace,
  translateInlineChild,
} from "./ghost-inline.ts";
import type { Parse5Node } from "./parse5-utils.ts";
import {
  extractAttr,
  extractTextContent,
  findDescendant,
  getClassList,
  pushHtmlFallback,
} from "./parse5-utils.ts";

type Translator = (node: Parse5Node, blocks: ContentBlock[]) => void;

/**
 * Block-level dispatch table. Unknown tags fall through to the `html` escape
 * hatch instead of failing translation.
 */
const BLOCK_TRANSLATORS: Record<string, Translator> = {
  h1: translateHeading,
  h2: translateHeading,
  h3: translateHeading,
  h4: translateHeading,
  h5: translateHeading,
  h6: translateHeading,
  p: translateParagraph,
  blockquote: translateBlockquote,
  ul: (node, blocks) => {
    translateList(node, false, blocks);
  },
  ol: (node, blocks) => {
    translateList(node, true, blocks);
  },
  hr: (_node, blocks) => {
    blocks.push({ type: "divider" });
  },
  pre: translatePre,
  figure: (node, blocks) => {
    translateFigure(node, blocks, extractBlockChildren);
  },
  img: translateImage,
  div: (node, blocks) => {
    translateDiv(node, blocks, extractBlockChildren);
  },
  a: translateAnchor,
  section: translateContainer,
  article: translateContainer,
  main: translateContainer,
  body: translateContainer,
  iframe: translateIframe,
  span: translateParagraph,
  mark: translateParagraph,
  u: translateParagraph,
  small: translateParagraph,
  sup: translateParagraph,
  sub: translateParagraph,
};

/** Translate a single block-level parse5 node, appending zero or more blocks. */
export function translateNode(node: Parse5Node, blocks: ContentBlock[]): void {
  const nodeName = node.nodeName;
  if (nodeName === undefined || nodeName === "") return;

  if (nodeName === "#text") {
    handleTopLevelText(node, blocks);
    return;
  }
  if (nodeName.startsWith("#")) return;

  const translator = BLOCK_TRANSLATORS[nodeName.toLowerCase()];
  if (translator === undefined) {
    pushHtmlFallback(node, blocks);
    return;
  }
  translator(node, blocks);
}

/** Translate an element's children into block nodes. */
function extractBlockChildren(node: Parse5Node): ContentBlock[] {
  const blocks: ContentBlock[] = [];
  for (const child of node.childNodes ?? []) {
    translateNode(child, blocks);
  }
  return blocks;
}

function handleTopLevelText(node: Parse5Node, blocks: ContentBlock[]): void {
  const text = (node.value ?? "").trim();
  if (text === "") return;
  blocks.push({ type: "paragraph", children: [{ type: "text", value: text }] });
}

function translateHeading(node: Parse5Node, blocks: ContentBlock[]): void {
  const levelChar = (node.nodeName ?? "h2").slice(1);
  const levelMap: Record<string, HeadingLevel> = {
    "1": 2,
    "2": 2,
    "3": 3,
    "4": 4,
    "5": 5,
    "6": 6,
  };
  const children = extractInlineChildren(node);
  if (children.length === 0) return;

  const id = extractAttr(node, "id") ?? slugify(inlineToText(children));

  blocks.push({
    type: "heading",
    level: levelMap[levelChar] ?? 2,
    id: id === "" ? undefined : id,
    children,
  });
}

function translateParagraph(node: Parse5Node, blocks: ContentBlock[]): void {
  const children = extractInlineChildren(node);
  if (children.length > 0) blocks.push({ type: "paragraph", children });
}

function translateBlockquote(node: Parse5Node, blocks: ContentBlock[]): void {
  const children: ContentBlock[] = [];
  for (const child of node.childNodes ?? []) translateNode(child, children);
  if (children.length > 0) blocks.push({ type: "blockquote", children });
}

function translateList(node: Parse5Node, ordered: boolean, blocks: ContentBlock[]): void {
  const items = extractListItems(node);
  if (items.length > 0) blocks.push({ type: "list", ordered, items });
}

function translateContainer(node: Parse5Node, blocks: ContentBlock[]): void {
  for (const child of node.childNodes ?? []) translateNode(child, blocks);
}

function translatePre(node: Parse5Node, blocks: ContentBlock[]): void {
  const codeEl = findDescendant(node, isCodeElement);
  const rawCode = codeEl === undefined ? extractTextContent(node) : extractTextContent(codeEl);
  const code = stripOuterNewlines(rawCode);
  if (code === "") return;

  blocks.push({ type: "codeBlock", language: parseLanguage(codeEl ?? node), code });
}

function isCodeElement(node: Parse5Node): boolean {
  return node.nodeName?.toLowerCase() === "code";
}

const LANGUAGE_ALIASES: Record<string, string> = {
  js: "javascript",
  mjs: "javascript",
  cjs: "javascript",
  ts: "typescript",
  mts: "typescript",
  cts: "typescript",
  sh: "bash",
  shell: "bash",
  zsh: "bash",
  md: "markdown",
  py: "python",
};

function parseLanguage(node: Parse5Node): string | undefined {
  const languageClass = getClassList(node).find((c) => c.startsWith("language-"));
  if (languageClass === undefined) return undefined;
  const raw = languageClass.slice("language-".length).toLowerCase();
  if (raw === "") return undefined;
  return LANGUAGE_ALIASES[raw] ?? raw;
}

function stripOuterNewlines(code: string): string {
  return code.replace(/^\n+/u, "").replace(/\n+$/u, "");
}

/**
 * Inline-level elements allowed inside a list item's running text. Anything
 * else (headings, nested lists, images, ...) is translated as a block.
 */
const INLINE_ELEMENT_NAMES = new Set([
  "a",
  "abbr",
  "b",
  "bdi",
  "bdo",
  "br",
  "cite",
  "code",
  "data",
  "del",
  "dfn",
  "em",
  "i",
  "ins",
  "kbd",
  "mark",
  "q",
  "s",
  "samp",
  "small",
  "span",
  "strong",
  "sub",
  "sup",
  "time",
  "u",
  "var",
]);

function isInlineNode(node: Parse5Node): boolean {
  if (node.nodeName === "#text") return true;
  if (node.nodeName === undefined) return false;
  return INLINE_ELEMENT_NAMES.has(node.nodeName.toLowerCase());
}

/**
 * Translate `<li>` children into ordered rows of block nodes.
 *
 * Ghost emits `<li>plain text</li>` rather than `<li><p>…</p></li>`. Running
 * inline content is grouped into a single paragraph so marks such as
 * `<strong>`/`<code>` stay inline; nested block content (lists, images, …)
 * flushes the run and translates normally.
 */
function extractListItems(node: Parse5Node): ContentBlock[][] {
  const items: ContentBlock[][] = [];
  for (const child of node.childNodes ?? []) {
    if (child.nodeName?.toLowerCase() !== "li") continue;
    const blocks = translateListItem(child);
    if (blocks.length > 0) items.push(blocks);
  }
  return items;
}

function translateListItem(node: Parse5Node): ContentBlock[] {
  const blocks: ContentBlock[] = [];
  let inlineRun: ContentInline[] = [];

  const flushInlineRun = (): void => {
    const children = normalizeInlineWhitespace(inlineRun);
    if (children.length > 0) {
      blocks.push({ type: "paragraph", children });
    }
    inlineRun = [];
  };

  for (const child of node.childNodes ?? []) {
    if (isInlineNode(child)) {
      translateInlineChild(child, inlineRun);
      continue;
    }
    flushInlineRun();
    translateNode(child, blocks);
  }
  flushInlineRun();

  return blocks;
}

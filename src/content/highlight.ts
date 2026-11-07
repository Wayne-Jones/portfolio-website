import type { BundledTheme } from "shiki";

import type { ContentTree, ContentBlock, ContentInline } from "./types.ts";

/**
 * Whitelisted language subset for syntax highlighting. Only these languages
 * are highlighted; anything else skips to plain `<pre><code>` rendering.
 */
export const HIGHLIGHT_LANGUAGES = [
  "javascript",
  "typescript",
  "tsx",
  "jsx",
  "json",
  "html",
  "css",
  "bash",
  "markdown",
  "python",
] as const;

export type HighlightLanguage = (typeof HIGHLIGHT_LANGUAGES)[number];

export interface HighlightOptions {
  /** Shiki theme name. Defaults to `github-light`. */
  theme?: BundledTheme;
}

type Highlighter = Awaited<ReturnType<typeof import("shiki").createHighlighter>>;

/**
 * Shiki highlighter promise, cached at module scope so themes and grammars
 * load once per build process and are reused across every post.
 *
 * The *promise* (not the resolved instance) is cached so concurrent adapter
 * calls — `getPosts()` maps with `Promise.all` — share one initialization
 * instead of each constructing their own highlighter.
 */
let highlighterPromise: Promise<Highlighter> | null = null;
const loadedThemes = new Set<BundledTheme>();

/** Get (and lazily create) the shared highlighter instance. */
export async function getHighlighter(theme: BundledTheme = "github-light"): Promise<Highlighter> {
  highlighterPromise ??= import("shiki")
    .then((shiki) =>
      shiki.createHighlighter({
        themes: [theme],
        langs: [...HIGHLIGHT_LANGUAGES],
      }),
    )
    .then((instance) => {
      loadedThemes.add(theme);
      return instance;
    })
    .catch((error) => {
      // Allow a later call to retry after a failed initialization.
      highlighterPromise = null;
      throw error;
    });

  const highlighter = await highlighterPromise;

  if (!loadedThemes.has(theme)) {
    await highlighter.loadTheme(theme);
    loadedThemes.add(theme);
  }

  return highlighter;
}

/**
 * Walk a `ContentTree` and populate `highlightedHtml` on every `codeBlock`
 * node. Empty code and languages outside the whitelist are left
 * unhighlighted so the renderer falls back to plain markup.
 */
export async function highlightCodeBlocks(
  tree: ContentTree,
  options: HighlightOptions = {},
): Promise<ContentTree> {
  const codeBlocks = collectCodeBlocks(tree);
  if (codeBlocks.length === 0) return tree;

  const theme = options.theme ?? "github-light";
  const highlighter = await getHighlighter(theme);
  for (const node of codeBlocks) {
    highlightNode(highlighter, node, theme);
  }
  return tree;
}

function collectCodeBlocks(blocks: ContentBlock[] | ContentInline[]): CodeBlockNode[] {
  const found: CodeBlockNode[] = [];
  for (const block of blocks) {
    if (block.type === "codeBlock") {
      found.push(block);
      continue;
    }
    if (block.type === "blockquote") {
      found.push(...collectCodeBlocks(block.children));
      continue;
    }
    if (block.type === "list") {
      for (const item of block.items) {
        found.push(...collectCodeBlocks(item));
      }
      continue;
    }
    if ("children" in block && Array.isArray(block.children)) {
      found.push(...collectCodeBlocks(block.children));
    }
  }
  return found;
}

type CodeBlockNode = Extract<ContentBlock, { type: "codeBlock" }>;

function highlightNode(highlighter: Highlighter, node: CodeBlockNode, theme: BundledTheme): void {
  if (node.code.trim() === "") return;
  if (node.language === undefined || node.language === "") return;

  const language = node.language.toLowerCase();
  if (!isHighlightLanguage(language)) return;

  try {
    const html = highlighter.codeToHtml(node.code, {
      lang: language,
      theme,
    });
    node.highlightedHtml = withLanguageClass(html, language);
  } catch (error) {
    // Highlighting is best-effort: fall back to plain <pre><code>.
    console.warn(`Syntax highlighting failed for language "${language}":`, error);
  }
}

function isHighlightLanguage(value: string): value is HighlightLanguage {
  return HIGHLIGHT_LANGUAGES.some((language) => language === value);
}

/** Add `language-X` to Shiki's wrapping `<pre>` class list for downstream CSS. */
function withLanguageClass(html: string, language: string): string {
  const safeLanguage = language.replace(/[^a-z0-9-]/gu, "");
  const preMatch = /<pre\b([^>]*)>/u.exec(html);
  if (preMatch === null) return html;

  const attrs = preMatch[1] ?? "";
  const openTag = /\bclass="/u.test(attrs)
    ? `<pre${attrs.replace(/\bclass="/u, `class="language-${safeLanguage} `)}>`
    : `<pre${attrs} class="language-${safeLanguage}">`;

  const start = preMatch.index;
  const end = start + preMatch[0].length;
  return `${html.slice(0, start)}${openTag}${html.slice(end)}`;
}

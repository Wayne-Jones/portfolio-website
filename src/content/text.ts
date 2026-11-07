import type { ContentInline } from "./types.ts";

/** Flatten inline nodes to plain text (used for heading slugs and labels). */
export function inlineToText(children: ContentInline[]): string {
  return children
    .map((child) => {
      switch (child.type) {
        case "text":
        case "inlineCode": {
          return child.value;
        }
        case "hardBreak": {
          return " ";
        }
        case "link":
        case "emphasis":
        case "strong": {
          return inlineToText(child.children);
        }
        default: {
          return "";
        }
      }
    })
    .join("");
}

/** Generate a URL-safe anchor id from heading text. */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/gu, "")
    .replace(/[\s-]+/gu, "-")
    .replace(/^-+|-+$/gu, "");
}

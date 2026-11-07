import type {
  Author,
  CalloutVariant,
  ContentBlock,
  ContentInline,
  EmbedProvider,
  GalleryImage,
} from "./types.ts";

/**
 * Runtime validation for canonical content-tree nodes.
 *
 * Every guard accepts `unknown` because they validate untrusted JSON at the
 * snapshot boundary. On success they narrow to the canonical type.
 */

export type JsonRecord = Record<string, unknown>;

const CALLOUT_VARIANTS: Readonly<Record<CalloutVariant, true>> = {
  info: true,
  warning: true,
  success: true,
};

const EMBED_PROVIDERS: Readonly<Record<EmbedProvider, true>> = {
  youtube: true,
  twitter: true,
  codepen: true,
  generic: true,
  unknown: true,
};

export function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function isOptionalString(value: unknown): boolean {
  return value === undefined || typeof value === "string";
}

export function isOptionalNumber(value: unknown): boolean {
  return value === undefined || typeof value === "number";
}

export function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((entry: unknown) => typeof entry === "string");
}

export function isAuthor(value: unknown): value is Author {
  return (
    isRecord(value) &&
    typeof value.name === "string" &&
    typeof value.slug === "string" &&
    isOptionalString(value.avatar)
  );
}

export function isGalleryImage(value: unknown): value is GalleryImage {
  return (
    isRecord(value) &&
    typeof value.src === "string" &&
    typeof value.alt === "string" &&
    isOptionalString(value.caption) &&
    isOptionalNumber(value.width) &&
    isOptionalNumber(value.height)
  );
}

export function isContentInline(value: unknown): value is ContentInline {
  if (!isRecord(value)) return false;
  const type = value.type;
  if (typeof type !== "string") return false;

  switch (type) {
    case "text":
    case "inlineCode": {
      return typeof value.value === "string";
    }
    case "hardBreak": {
      return true;
    }
    case "link": {
      return typeof value.href === "string" && isContentInlineArray(value.children);
    }
    case "emphasis":
    case "strong": {
      return isContentInlineArray(value.children);
    }
    default: {
      return false;
    }
  }
}

function isContentInlineArray(value: unknown): value is ContentInline[] {
  return Array.isArray(value) && value.every((entry: unknown) => isContentInline(entry));
}

function isHeading(value: JsonRecord): boolean {
  return (
    (value.level === 2 ||
      value.level === 3 ||
      value.level === 4 ||
      value.level === 5 ||
      value.level === 6) &&
    isOptionalString(value.id) &&
    isContentInlineArray(value.children)
  );
}

function isImageBlock(value: JsonRecord): boolean {
  return (
    typeof value.src === "string" &&
    typeof value.alt === "string" &&
    isOptionalString(value.caption) &&
    isOptionalNumber(value.width) &&
    isOptionalNumber(value.height)
  );
}

function isCodeBlock(value: JsonRecord): boolean {
  return (
    typeof value.code === "string" &&
    isOptionalString(value.language) &&
    isOptionalString(value.highlightedHtml)
  );
}

function isListBlock(value: JsonRecord): boolean {
  return (
    typeof value.ordered === "boolean" &&
    Array.isArray(value.items) &&
    value.items.every((item: unknown) => isContentBlockArray(item))
  );
}

function isEmbedBlock(value: JsonRecord): boolean {
  return (
    typeof value.provider === "string" &&
    Object.hasOwn(EMBED_PROVIDERS, value.provider) &&
    typeof value.html === "string" &&
    isOptionalString(value.url)
  );
}

function isGalleryBlock(value: JsonRecord): boolean {
  return (
    Array.isArray(value.images) && value.images.every((image: unknown) => isGalleryImage(image))
  );
}

function isCalloutBlock(value: JsonRecord): boolean {
  return (
    (value.variant === undefined ||
      (typeof value.variant === "string" && Object.hasOwn(CALLOUT_VARIANTS, value.variant))) &&
    isContentInlineArray(value.children)
  );
}

function isBookmarkBlock(value: JsonRecord): boolean {
  return (
    typeof value.url === "string" &&
    typeof value.title === "string" &&
    isOptionalString(value.description) &&
    isOptionalString(value.image)
  );
}

export function isContentBlock(value: unknown): value is ContentBlock {
  if (!isRecord(value)) return false;
  const type = value.type;
  if (typeof type !== "string") return false;

  switch (type) {
    case "paragraph": {
      return isContentInlineArray(value.children);
    }
    case "heading": {
      return isHeading(value);
    }
    case "image": {
      return isImageBlock(value);
    }
    case "codeBlock": {
      return isCodeBlock(value);
    }
    case "blockquote": {
      return isContentBlockArray(value.children);
    }
    case "list": {
      return isListBlock(value);
    }
    case "divider": {
      return true;
    }
    case "embed": {
      return isEmbedBlock(value);
    }
    case "gallery": {
      return isGalleryBlock(value);
    }
    case "callout": {
      return isCalloutBlock(value);
    }
    case "bookmark": {
      return isBookmarkBlock(value);
    }
    case "html": {
      return typeof value.html === "string";
    }
    default: {
      return false;
    }
  }
}

export function isContentBlockArray(value: unknown): value is ContentBlock[] {
  return Array.isArray(value) && value.every((entry: unknown) => isContentBlock(entry));
}

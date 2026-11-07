import type { CalloutVariant, ContentBlock, EmbedProvider, GalleryImage } from "../types.ts";
import { extractInlineChildren } from "./ghost-inline.ts";
import type { Parse5Node } from "./parse5-utils.ts";
import {
  extractAttr,
  extractTextContent,
  findDescendant,
  findAllDescendants,
  getClassList,
  hasClass,
  pushHtmlFallback,
  serializeNode,
} from "./parse5-utils.ts";

type ImageBlock = Extract<ContentBlock, { type: "image" }>;
type EmbedBlock = Extract<ContentBlock, { type: "embed" }>;
type CalloutBlock = Extract<ContentBlock, { type: "callout" }>;
type BookmarkBlock = Extract<ContentBlock, { type: "bookmark" }>;
type TranslateBlocks = (node: Parse5Node) => ContentBlock[];

/** `figure` — Ghost image, gallery, and embed cards. */
export function translateFigure(
  node: Parse5Node,
  blocks: ContentBlock[],
  translateBlocks: TranslateBlocks,
): void {
  const classes = getClassList(node);

  if (classes.includes("kg-image-card")) {
    pushOptionalImage(node, blocks);
    return;
  }

  if (classes.includes("kg-gallery-card")) {
    const images = findAllDescendants(node, isImageElement)
      .map((img) => parseGalleryImage(img))
      .filter((image): image is NonNullable<typeof image> => image !== undefined);
    if (images.length > 0) {
      blocks.push({ type: "gallery", images });
    } else {
      pushHtmlFallback(node, blocks);
    }
    return;
  }

  if (classes.includes("kg-embed-card")) {
    blocks.push(parseEmbed(node));
    return;
  }

  if (classes.some((c) => c.startsWith("kg-"))) {
    pushHtmlFallback(node, blocks);
    return;
  }

  const image = parseImage(node);
  if (image !== undefined) {
    blocks.push(image);
    return;
  }

  const children = translateBlocks(node);
  if (children.length > 0) blocks.push(...children);
}

/** `div` — Ghost callout and bookmark cards, transparent otherwise. */
export function translateDiv(
  node: Parse5Node,
  blocks: ContentBlock[],
  translateBlocks: TranslateBlocks,
): void {
  if (hasClass(node, "kg-callout-card")) {
    blocks.push(parseCallout(node));
    return;
  }

  if (hasClass(node, "kg-bookmark-card")) {
    const bookmark = parseBookmark(node);
    if (bookmark === undefined) {
      pushHtmlFallback(node, blocks);
    } else {
      blocks.push(bookmark);
    }
    return;
  }

  if (getClassList(node).some((c) => c.startsWith("kg-"))) {
    pushHtmlFallback(node, blocks);
    return;
  }

  // Transparent wrapper: translate its children as blocks.
  const children = translateBlocks(node);
  if (children.length > 0) blocks.push(...children);
}

/** Bare `<img>` block. */
export function translateImage(node: Parse5Node, blocks: ContentBlock[]): void {
  const image = parseImage(node);
  if (image !== undefined) blocks.push(image);
}

/** Bare `<a>` block: anchors around images become images, otherwise a paragraph. */
export function translateAnchor(node: Parse5Node, blocks: ContentBlock[]): void {
  const images = findAllDescendants(node, isImageElement);
  if (images.length > 0) {
    for (const img of images) {
      const image = parseImage(img);
      if (image !== undefined) blocks.push(image);
    }
    return;
  }
  const children = extractInlineChildren(node);
  if (children.length > 0) blocks.push({ type: "paragraph", children });
}

/** Bare `<iframe>` block. */
export function translateIframe(node: Parse5Node, blocks: ContentBlock[]): void {
  const src = extractAttr(node, "src");
  blocks.push({
    type: "embed",
    provider: providerFromUrl(src),
    html: serializeNode(node),
    url: src,
  });
}

function pushOptionalImage(node: Parse5Node, blocks: ContentBlock[]): void {
  const image = parseImage(node);
  if (image === undefined) {
    pushHtmlFallback(node, blocks);
  } else {
    blocks.push(image);
  }
}

function isImageElement(node: Parse5Node): boolean {
  return node.nodeName?.toLowerCase() === "img";
}

function parseImage(node: Parse5Node): ImageBlock | undefined {
  const img = isImageElement(node) ? node : findDescendant(node, isImageElement);
  if (img === undefined) return undefined;

  const src = extractAttr(img, "src");
  if (src === undefined || src === "") return undefined;

  const captionEl = findDescendant(node, (child) => child.nodeName === "figcaption");
  const caption = captionEl === undefined ? "" : extractTextContent(captionEl).trim();

  return {
    type: "image",
    src,
    alt: extractAttr(img, "alt") ?? "",
    caption: caption === "" ? undefined : caption,
    width: parseDimension(extractAttr(img, "width")),
    height: parseDimension(extractAttr(img, "height")),
  };
}

function parseGalleryImage(node: Parse5Node): GalleryImage | undefined {
  const src = extractAttr(node, "src");
  if (src === undefined || src === "") return undefined;
  return {
    src,
    alt: extractAttr(node, "alt") ?? "",
  };
}

function parseDimension(value: string | undefined): number | undefined {
  if (value === undefined) return undefined;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function parseEmbed(node: Parse5Node): EmbedBlock {
  const iframe = findDescendant(node, (child) => child.nodeName === "iframe");
  if (iframe !== undefined) {
    const src = extractAttr(iframe, "src");
    return {
      type: "embed",
      provider: providerFromUrl(src),
      html: serializeNode(node),
      url: src,
    };
  }

  const anchor = findDescendant(node, isTwitterAnchor);
  if (anchor !== undefined) {
    return {
      type: "embed",
      provider: "twitter",
      html: serializeNode(node),
      url: extractAttr(anchor, "href"),
    };
  }

  return {
    type: "embed",
    provider: "generic",
    html: serializeNode(node),
  };
}

function isTwitterAnchor(node: Parse5Node): boolean {
  if (node.nodeName?.toLowerCase() !== "a") return false;
  const href = extractAttr(node, "href") ?? "";
  return /(?:^|\/\/)(?:www\.)?(?:twitter\.com|x\.com)\//u.test(href);
}

function providerFromUrl(url: string | undefined): EmbedProvider {
  if (url === undefined || url === "") return "generic";
  if (/youtube\.com|youtu\.be/u.test(url)) return "youtube";
  if (/codepen\.io/u.test(url)) return "codepen";
  if (/(?:twitter\.com|x\.com)\//u.test(url)) return "twitter";
  return "generic";
}

function parseCallout(node: Parse5Node): CalloutBlock {
  const textEl = findDescendant(node, (child) => hasClass(child, "kg-callout-text"));
  const source = textEl ?? node;
  const children = extractInlineChildren(source);

  return {
    type: "callout",
    variant: calloutVariantFromClasses(getClassList(node)),
    children,
  };
}

function calloutVariantFromClasses(classes: string[]): CalloutVariant {
  const joined = classes.join(" ");
  if (/green|success/u.test(joined)) return "success";
  if (/yellow|red|orange|pink|purple|warning/u.test(joined)) return "warning";
  return "info";
}

function parseBookmark(node: Parse5Node): BookmarkBlock | undefined {
  const anchor = findDescendant(
    node,
    (child) => child.nodeName?.toLowerCase() === "a" && extractAttr(child, "href") !== undefined,
  );
  const url = anchor === undefined ? extractAttr(node, "href") : extractAttr(anchor, "href");
  if (url === undefined || url === "") return undefined;

  const titleEl = findDescendant(node, (child) => hasClass(child, "kg-bookmark-title"));
  const descriptionEl = findDescendant(node, (child) => hasClass(child, "kg-bookmark-description"));
  const thumbnailEl = findDescendant(node, (child) => hasClass(child, "kg-bookmark-thumbnail"));
  const imageEl =
    thumbnailEl === undefined ? undefined : findDescendant(thumbnailEl, isImageElement);

  const title = titleEl === undefined ? "" : extractTextContent(titleEl).trim();
  const description = descriptionEl === undefined ? "" : extractTextContent(descriptionEl).trim();
  const image = imageEl === undefined ? "" : (extractAttr(imageEl, "src") ?? "");

  return {
    type: "bookmark",
    url,
    title: title === "" ? url : title,
    description: description === "" ? undefined : description,
    image: image === "" ? undefined : image,
  };
}

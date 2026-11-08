import type { ReactNode } from "react";

import { FigureImage } from "@/components/content/nodes/FigureImage";

import { hasSlot, hasText } from "./lib";

interface ArticleImage {
  src: string;
  alt: string;
  width?: number;
  height?: number;
}

interface ArticleHeaderProps {
  title: string;
  /** Optional label rendered above the title (e.g. the content type). */
  eyebrow?: ReactNode;
  /** Metadata line rendered below the title (`<ArticleMeta />`). */
  meta?: ReactNode;
  /** Tag chip row rendered below the metadata. */
  tags?: ReactNode;
  /** Hero image rendered above the title. */
  image?: ArticleImage;
  /** View-transition name applied to the hero wrapper. */
  imageTransitionName?: string;
  /** Render an empty headline band when no image is supplied. */
  emptyImageFallback?: boolean;
}

/**
 * Article header shared by blog posts and case studies.
 *
 * The hero image comes first (matching the editorial order), followed by the
 * title, metadata, and tag chips.
 */
export function ArticleHeader({
  title,
  eyebrow,
  meta,
  tags,
  image,
  imageTransitionName,
  emptyImageFallback = false,
}: ArticleHeaderProps) {
  return (
    <header>
      {image === undefined ? (
        emptyImageFallback ? (
          <div
            aria-hidden="true"
            className="mb-8 aspect-4/3 w-full rounded-md bg-muted/5"
            style={
              hasText(imageTransitionName) ? { viewTransitionName: imageTransitionName } : undefined
            }
          />
        ) : null
      ) : (
        <div
          className="mb-8 [&>figure]:my-0"
          style={
            hasText(imageTransitionName) ? { viewTransitionName: imageTransitionName } : undefined
          }
        >
          <FigureImage image={image} />
        </div>
      )}

      <div className="max-w-[60ch]">
        {hasSlot(eyebrow) ? (
          <p className="mb-3 text-xs tracking-widest text-muted uppercase">{eyebrow}</p>
        ) : null}

        <h1 className="font-display text-3xl font-semibold tracking-tight text-fg md:text-4xl">
          {title}
        </h1>

        {hasSlot(meta) ? <div className="mt-4 text-sm text-muted">{meta}</div> : null}
        {hasSlot(tags) ? <div className="mt-5">{tags}</div> : null}
      </div>
    </header>
  );
}

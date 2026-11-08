import { Link } from "@tanstack/react-router";

import { TileMedia } from "@/components/photography/TileMedia";
import type { Photo } from "@/content/types";

interface PhotoTileProps {
  photo: Photo;
  index: number;
}

export function PhotoTile({ photo, index }: PhotoTileProps) {
  // Detail pages name their cover `photo-<slug>`; unlinked mock photos fall
  // back to a per-index name so names stay unique on the page.
  const transitionName = photo.setSlug === undefined ? `photo-${index}` : `photo-${photo.setSlug}`;
  const style = { viewTransitionName: transitionName };
  const className =
    "group relative mb-4 block overflow-hidden rounded-md bg-muted/20 no-underline last:mb-0";

  const content = (
    <>
      <TileMedia
        src={photo.src}
        alt={photo.alt}
        aspect={photo.aspect}
        sizes="(min-width: 768px) 33vw, 50vw"
      />
      <span
        aria-hidden="true"
        className="absolute inset-0 flex items-end p-3 text-xs text-bg opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100"
      >
        {photo.alt}
      </span>
    </>
  );

  if (photo.setSlug === undefined) {
    return (
      <Link to="/photography" viewTransition style={style} className={className}>
        {content}
      </Link>
    );
  }

  return (
    <Link
      to="/photography/$slug"
      params={{ slug: photo.setSlug }}
      viewTransition
      style={style}
      className={className}
    >
      {content}
    </Link>
  );
}

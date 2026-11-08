import { Link } from "@tanstack/react-router";

import { TileMedia } from "@/components/photography/TileMedia";
import type { PhotoSet } from "@/content/types";

interface PhotoSetTileProps {
  photoSet: PhotoSet;
}

/** Masonry tile for one photo set; links to the set detail route. */
export function PhotoSetTile({ photoSet }: PhotoSetTileProps) {
  const cover = photoSet.coverImage ?? photoSet.images[0];
  const metadata = [photoSet.location, photoSet.camera]
    .filter((part) => part !== undefined && part !== "")
    .join(" · ");

  return (
    <Link
      to="/photography/$slug"
      params={{ slug: photoSet.slug }}
      viewTransition
      style={{ viewTransitionName: `photo-${photoSet.slug}` }}
      className="group block no-underline"
    >
      <div className="overflow-hidden rounded-md bg-muted/10">
        <TileMedia
          src={cover}
          alt=""
          aspect="landscape"
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
        />
      </div>
      <h2 className="mt-3 font-display text-lg font-semibold tracking-tight text-fg transition-colors duration-200 group-hover:text-accent">
        {photoSet.title}
      </h2>
      {metadata === "" ? null : <p className="mt-1 text-sm text-muted">{metadata}</p>}
    </Link>
  );
}

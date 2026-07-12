import { Link } from "@tanstack/react-router";

import type { Photo } from "@/content/types";

interface PhotoTileProps {
  photo: Photo;
  index: number;
}

export function PhotoTile({ photo, index }: PhotoTileProps) {
  const transitionName = `photo-${index}`;

  return (
    <Link
      to="/photography"
      viewTransition
      style={{ viewTransitionName: transitionName }}
      className="group relative mb-4 block overflow-hidden rounded-md bg-muted/20 no-underline last:mb-0"
    >
      <div className="overflow-hidden">
        <div
          className="bg-muted/10 transition-transform duration-500 group-hover:scale-[1.03]"
          style={{ aspectRatio: aspectRatios[photo.aspect] }}
        />
      </div>
      <span className="absolute inset-0 flex items-end p-3 text-xs text-bg opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        {photo.alt}
      </span>
    </Link>
  );
}

const aspectRatios: Record<Photo["aspect"], string> = {
  portrait: "3/4",
  landscape: "4/3",
  square: "1/1",
};

import type { PhotoSet } from "@/content/types";

import { PhotoSetTile } from "./PhotoSetTile";

interface PhotoSetGalleryProps {
  photoSets: PhotoSet[];
}

/** `/photography` index: a masonry gallery of every photo set. */
export function PhotoSetGallery({ photoSets }: PhotoSetGalleryProps) {
  return (
    <section className="mx-auto w-full max-w-5xl pb-16">
      <header className="mb-8">
        <p className="mb-2 text-xs tracking-widest text-muted uppercase">Photography</p>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-fg md:text-4xl">
          Photography
        </h1>
        <p className="mt-3 max-w-[55ch] text-muted">
          Selected sets from the archive — coastlines, cities, and the spaces in between.
        </p>
      </header>

      {photoSets.length === 0 ? (
        <p className="text-muted">No photo sets yet.</p>
      ) : (
        <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
          {photoSets.map((photoSet) => (
            <div key={photoSet.id} className="mb-4 break-inside-avoid">
              <PhotoSetTile photoSet={photoSet} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

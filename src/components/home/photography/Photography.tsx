import { PhotoTile } from "@/components/home/photography/PhotoTile";
import { Section } from "@/components/home/shared/Section";
import type { Photo } from "@/content/types";

interface PhotographyProps {
  photos: Photo[];
}

const skeletonCount = 6;

export function Photography({ photos }: PhotographyProps) {
  if (photos.length === 0) {
    return (
      <Section eyebrow="PHOTOGRAPHY" title="Recent work">
        <div className="columns-2 gap-4 md:columns-3">
          {Array.from({ length: skeletonCount }, (_, i) => (
            <div
              key={i}
              className="animate-shimmer mb-4 break-inside-avoid rounded-md"
              style={{ aspectRatio: i % 3 === 0 ? "3/4" : i % 3 === 1 ? "4/3" : "1/1" }}
            />
          ))}
        </div>
      </Section>
    );
  }

  return (
    <Section eyebrow="PHOTOGRAPHY" title="Recent work">
      <div className="columns-2 gap-4 md:columns-3">
        {photos.map((photo, i) => (
          <div key={`${photo.alt}-${i}`} className="mb-4 break-inside-avoid">
            <PhotoTile photo={photo} index={i} />
          </div>
        ))}
      </div>
    </Section>
  );
}

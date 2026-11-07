import type { GalleryImage } from "@/content/types";

import { FigureImage } from "./FigureImage";

/**
 * Gallery block. Uses the same CSS-columns masonry rhythm as the homepage
 * photography section and renders each image through `FigureImage`, so
 * Cloudinary `srcset`s apply automatically.
 */
export function Gallery({ images }: { images: GalleryImage[] }) {
  if (images.length === 0) return null;

  return (
    <div className="my-8 columns-2 gap-4 md:columns-3">
      {images.map((image, index) => (
        <div key={`${image.src}-${index}`} className="mb-4 break-inside-avoid [&>figure]:my-0">
          <FigureImage image={image} />
        </div>
      ))}
    </div>
  );
}

import type { GalleryImage } from "@/content/types";

import { CONTENT_IMAGE_SIZES, cloudinaryDefaultSrc, cloudinarySrcSet } from "../lib/cloudinary";

/**
 * Image block. Cloudinary URLs get a responsive `srcset`; everything else
 * falls back to the original source. Images are lazy by default.
 */
export function FigureImage({ image }: { image: GalleryImage }) {
  const srcSet = cloudinarySrcSet(image.src);
  const src = cloudinaryDefaultSrc(image.src);

  return (
    <figure className="my-8">
      <img
        src={src}
        srcSet={srcSet}
        sizes={srcSet === undefined ? undefined : CONTENT_IMAGE_SIZES}
        alt={image.alt}
        width={image.width}
        height={image.height}
        loading="lazy"
        decoding="async"
        className="h-auto w-full rounded-md bg-muted/5"
      />
      {image.caption !== undefined && image.caption !== "" ? (
        <figcaption className="mt-2 text-center text-sm text-muted">{image.caption}</figcaption>
      ) : null}
    </figure>
  );
}

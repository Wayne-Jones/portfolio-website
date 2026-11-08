import { useState } from "react";

import type { GalleryImage } from "@/content/types";

import {
  CLOUDINARY_HERO_DEFAULT_WIDTH,
  CLOUDINARY_HERO_WIDTHS,
  CLOUDINARY_WIDTHS,
  CONTENT_IMAGE_SIZES,
  HERO_IMAGE_SIZES,
  useCloudinaryImage,
} from "../lib/cloudinary";

interface FigureImageProps {
  image: GalleryImage;
  /** Hero context: eager, high priority, wider variants, and an LQIP. */
  priority?: boolean;
  /** Responsive `sizes` hint; defaults to the inline or hero preset. */
  sizes?: string;
  /** Explicit aspect ratio when the image node has no intrinsic dimensions. */
  aspectRatio?: string;
}

interface ImageFrameProps extends FigureImageProps {
  src: string;
  srcSet: string | undefined;
  sizes: string | undefined;
  lqip: string | undefined;
}

function ImageFrame({
  image,
  priority = false,
  aspectRatio,
  src,
  srcSet,
  sizes,
  lqip,
}: ImageFrameProps) {
  const [loaded, setLoaded] = useState(false);
  const showPlaceholder = lqip !== undefined && !loaded;
  const hasAspect = aspectRatio !== undefined;
  const background = lqip === undefined ? "bg-muted/5" : "";
  const handleLoad = () => {
    setLoaded(true);
  };

  return (
    <div
      className="relative overflow-hidden rounded-md"
      style={hasAspect ? { aspectRatio } : undefined}
    >
      {showPlaceholder ? (
        <img
          src={lqip}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 size-full scale-110 object-cover blur-2xl"
        />
      ) : null}
      <img
        src={src}
        srcSet={srcSet}
        sizes={sizes}
        alt={image.alt}
        width={image.width}
        height={image.height}
        loading={priority ? "eager" : "lazy"}
        decoding={priority ? "sync" : "async"}
        fetchPriority={priority ? "high" : undefined}
        onLoad={lqip === undefined ? undefined : handleLoad}
        className={
          hasAspect
            ? `relative size-full rounded-md object-cover ${background}`
            : `relative h-auto w-full rounded-md ${background}`
        }
      />
    </div>
  );
}

/**
 * Image block. Cloudinary URLs get a responsive `srcset`; everything else
 * falls back to the original source. Images are lazy by default; `priority`
 * opts a hero into eager loading, wider variants, and a blur-up placeholder.
 */
export function FigureImage({ image, priority = false, sizes, aspectRatio }: FigureImageProps) {
  const {
    src,
    srcSet,
    sizes: resolvedSizes,
    lqip,
  } = useCloudinaryImage(image.src, {
    widths: priority ? CLOUDINARY_HERO_WIDTHS : CLOUDINARY_WIDTHS,
    sizes: sizes ?? (priority ? HERO_IMAGE_SIZES : CONTENT_IMAGE_SIZES),
    defaultWidth: priority ? CLOUDINARY_HERO_DEFAULT_WIDTH : undefined,
    lqip: priority,
  });

  return (
    <figure className="my-8">
      <ImageFrame
        image={image}
        priority={priority}
        aspectRatio={aspectRatio}
        src={src}
        srcSet={srcSet}
        sizes={resolvedSizes}
        lqip={lqip}
      />
      {image.caption !== undefined && image.caption !== "" ? (
        <figcaption className="mt-2 text-center text-sm text-muted">{image.caption}</figcaption>
      ) : null}
    </figure>
  );
}

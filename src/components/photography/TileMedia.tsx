import { useCloudinaryImage } from "@/components/content/lib/cloudinary";

/** Shared aspect ratio union for media frames across cards and tiles. */
export type MediaAspect = "portrait" | "landscape" | "square";

const aspectRatios: Record<MediaAspect, string> = {
  portrait: "3/4",
  landscape: "4/3",
  square: "1/1",
};

interface TileMediaProps {
  src: string | undefined;
  alt: string;
  /** Aspect ratio used for the placeholder when there is no source. */
  aspect: MediaAspect;
  /** Responsive `sizes` hint; only used when the source emits a `srcset`. */
  sizes?: string;
}

/**
 * Shared media frame for photo tiles. Cloudinary sources get a responsive
 * `srcset`; everything else falls back to the original URL. Renders a neutral
 * aspect-ratio placeholder when there is no image.
 */
export function TileMedia({ src, alt, aspect, sizes }: TileMediaProps) {
  const {
    src: resolvedSrc,
    srcSet,
    sizes: resolvedSizes,
  } = useCloudinaryImage(src ?? "", {
    sizes,
  });

  if (resolvedSrc === "") {
    return (
      <div className="overflow-hidden">
        <div
          aria-hidden="true"
          className="bg-muted/10 transition-transform duration-500 group-hover:scale-[1.03]"
          style={{ aspectRatio: aspectRatios[aspect] }}
        />
      </div>
    );
  }

  return (
    <div className="overflow-hidden">
      <img
        src={resolvedSrc}
        srcSet={srcSet}
        sizes={resolvedSizes}
        alt={alt}
        loading="lazy"
        decoding="async"
        className="h-auto w-full transition-transform duration-500 group-hover:scale-[1.03]"
      />
    </div>
  );
}

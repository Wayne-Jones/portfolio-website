import { afterEach, describe, expect, it, vi } from "vitest";

import { useCloudinaryImage } from "@/components/content/lib/cloudinary";
import { Embed } from "@/components/content/nodes/Embed";
import { FigureImage } from "@/components/content/nodes/FigureImage";
import { Gallery } from "@/components/content/nodes/Gallery";

import { render } from "./test-utils";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("FigureImage", () => {
  it("renders non-Cloudinary images with lazy defaults", () => {
    const html = render(
      <FigureImage image={{ src: "https://example.com/a.jpg", alt: "A", caption: "Cap" }} />,
    );

    expect(html).toContain('src="https://example.com/a.jpg"');
    expect(html).toContain('loading="lazy"');
    expect(html).toContain('decoding="async"');
    expect(html).not.toContain("srcset=");
    expect(html).toContain("<figcaption");
  });

  it("emits a Cloudinary srcset with width variants", () => {
    vi.stubEnv("VITE_CLOUDINARY_CLOUD_NAME", "demo");
    const html = render(
      <FigureImage
        image={{
          src: "https://res.cloudinary.com/demo/image/upload/v1/sample.jpg",
          alt: "Sample",
        }}
      />,
    );

    expect(html).toContain("c_scale,w_400,f_auto,q_auto/v1/sample.jpg 400w");
    expect(html).toContain("c_scale,w_800,f_auto,q_auto/v1/sample.jpg 800w");
    expect(html).toContain("c_scale,w_1200,f_auto,q_auto/v1/sample.jpg 1200w");
    expect(html).toContain("c_scale,w_1600,f_auto,q_auto/v1/sample.jpg 1600w");
    expect(html).toContain(
      'src="https://res.cloudinary.com/demo/image/upload/c_scale,w_1200,f_auto,q_auto/v1/sample.jpg"',
    );
    expect(html).toContain('sizes="(min-width: 768px) 720px, 100vw"');
  });
});

describe("FigureImage hero srcset", () => {
  const cloudinarySrc = "https://res.cloudinary.com/demo/image/upload/v1/sample.jpg";

  it("emits six widths, priority hints, hero sizes, and an LQIP", () => {
    vi.stubEnv("VITE_CLOUDINARY_CLOUD_NAME", "demo");
    const html = render(<FigureImage priority image={{ src: cloudinarySrc, alt: "Hero" }} />);
    const lower = html.toLowerCase();

    for (const width of [400, 800, 1200, 1600, 2400, 3200]) {
      expect(html).toContain(
        `${cloudinarySrc.replace("/upload/", `/upload/c_scale,w_${width},f_auto,q_auto/`)} ${width}w`,
      );
    }
    expect(html).toContain(
      'src="https://res.cloudinary.com/demo/image/upload/c_scale,w_1600,f_auto,q_auto/v1/sample.jpg"',
    );
    expect(lower).toContain('fetchpriority="high"');
    expect(lower).toContain('loading="eager"');
    expect(lower).toContain('decoding="sync"');
    expect(html).toContain('sizes="(min-width: 1024px) 1024px, 100vw"');
    expect(html).toContain("w_40,e_blur:1000,q_auto,f_auto/v1/sample.jpg");
    expect(html).toContain('aria-hidden="true"');
  });

  it("keeps a visible real image and a decorative placeholder for non-Cloudinary sources", () => {
    const html = render(
      <FigureImage priority image={{ src: "https://example.com/hero.jpg", alt: "Hero" }} />,
    );

    expect(html).toContain('src="https://example.com/hero.jpg"');
    expect(html.toLowerCase()).toContain('fetchpriority="high"');
    expect(html).not.toContain("srcset=");
    expect(html).not.toContain("e_blur");
  });
});

describe("FigureImage hero layout", () => {
  it("applies an explicit aspect ratio override", () => {
    const html = render(
      <FigureImage
        priority
        aspectRatio="16/9"
        image={{ src: "https://example.com/hero.jpg", alt: "Hero" }}
      />,
    );

    expect(html).toContain("aspect-ratio:16/9");
    expect(html).toContain("object-cover");
  });

  it("keeps intrinsic dimensions when no aspect override is given", () => {
    const html = render(
      <FigureImage
        priority
        image={{ src: "https://example.com/hero.jpg", alt: "Hero", width: 1200, height: 800 }}
      />,
    );

    expect(html).toContain('width="1200"');
    expect(html).toContain('height="800"');
    expect(html).not.toContain("aspect-ratio:");
  });
});

describe("useCloudinaryImage", () => {
  it("returns src, srcSet, sizes, and an LQIP for Cloudinary URLs", () => {
    vi.stubEnv("VITE_CLOUDINARY_CLOUD_NAME", "demo");
    const html = render(
      <HookProbe
        src="https://res.cloudinary.com/demo/image/upload/v1/sample.jpg"
        options={{ widths: [400, 800], sizes: "100vw", lqip: true }}
      />,
    );

    expect(html).toContain(
      'data-src="https://res.cloudinary.com/demo/image/upload/c_scale,w_1200,f_auto,q_auto/v1/sample.jpg"',
    );
    expect(html).toContain("c_scale,w_400,f_auto,q_auto/v1/sample.jpg 400w");
    expect(html).toContain('data-sizes="100vw"');
    expect(html).toContain("w_40,e_blur:1000,q_auto,f_auto/v1/sample.jpg");
    expect(html).toContain('data-cloudinary="true"');
  });

  it("passes non-Cloudinary URLs through without variants", () => {
    const html = render(
      <HookProbe src="https://example.com/a.jpg" options={{ widths: [400], sizes: "100vw" }} />,
    );

    expect(html).toContain('data-src="https://example.com/a.jpg"');
    expect(html).not.toContain("data-srcset");
    expect(html).not.toContain("data-sizes");
    expect(html).not.toContain("data-lqip");
    expect(html).toContain('data-cloudinary="false"');
  });
});

interface HookProbeProps {
  src: string;
  options: Parameters<typeof useCloudinaryImage>[1];
}

function HookProbe({ src, options }: HookProbeProps) {
  const image = useCloudinaryImage(src, options);
  return (
    <div
      data-src={image.src}
      data-srcset={image.srcSet}
      data-sizes={image.sizes}
      data-lqip={image.lqip}
      data-cloudinary={String(image.isCloudinary)}
    />
  );
}

describe("FigureImage URL safety", () => {
  it("ignores lookalike hosts and already-transformed URLs", () => {
    vi.stubEnv("VITE_CLOUDINARY_CLOUD_NAME", "demo");

    const lookalike = render(
      <FigureImage
        image={{
          src: "https://evil.example/?u=res.cloudinary.com/demo/image/upload/v1/a.jpg",
          alt: "A",
        }}
      />,
    );
    expect(lookalike).not.toContain("srcset=");

    const transformed = render(
      <FigureImage
        image={{
          src: "https://res.cloudinary.com/demo/image/upload/c_scale,w_800/v1/a.jpg",
          alt: "A",
        }}
      />,
    );
    expect(transformed).not.toContain("srcset=");
    expect(transformed).toContain(
      'src="https://res.cloudinary.com/demo/image/upload/c_scale,w_800/v1/a.jpg"',
    );
  });
});

describe("embeds", () => {
  it("renders a YouTube embed as a lazy iframe", () => {
    const html = render(
      <Embed
        node={{
          type: "embed",
          provider: "youtube",
          url: "https://www.youtube.com/embed/abc12345678",
          html: "",
        }}
      />,
    );

    expect(html).toContain('src="https://www.youtube.com/embed/abc12345678"');
    expect(html).toContain('loading="lazy"');
    expect(html).toContain('allow="accelerometer; encrypted-media; picture-in-picture"');
  });

  it("renders a Twitter embed as a blockquote with a citation link", () => {
    const html = render(
      <Embed
        node={{
          type: "embed",
          provider: "twitter",
          url: "https://twitter.com/user/status/1",
          html: "",
        }}
      />,
    );

    expect(html).toContain("<blockquote");
    expect(html).toContain('href="https://twitter.com/user/status/1"');
    expect(html).not.toContain("<script");
  });
});

describe("galleries", () => {
  it("renders galleries with the masonry column layout", () => {
    const html = render(
      <Gallery
        images={[
          { src: "https://example.com/1.jpg", alt: "One" },
          { src: "https://example.com/2.jpg", alt: "Two" },
          { src: "https://example.com/3.jpg", alt: "Three" },
        ]}
      />,
    );

    expect(html).toContain("columns-2");
    expect(html).toContain("break-inside-avoid");
    expect(html.match(/<img/gu)).toHaveLength(3);
  });
});

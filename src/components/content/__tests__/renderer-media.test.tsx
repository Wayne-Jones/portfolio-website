import { afterEach, describe, expect, it, vi } from "vitest";

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

    expect(html).toContain("c_scale,w_400/v1/sample.jpg 400w");
    expect(html).toContain("c_scale,w_800/v1/sample.jpg 800w");
    expect(html).toContain("c_scale,w_1200/v1/sample.jpg 1200w");
    expect(html).toContain("c_scale,w_1600/v1/sample.jpg 1600w");
    expect(html).toContain(
      'src="https://res.cloudinary.com/demo/image/upload/c_scale,w_1200/v1/sample.jpg"',
    );
  });
});

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

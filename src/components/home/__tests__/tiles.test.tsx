import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import { PhotoTile } from "@/components/home/photography/PhotoTile";
import { WorkTile } from "@/components/home/work-portfolio/WorkTile";
import { PhotoSetTile } from "@/components/photography/PhotoSetTile";
import type { Photo, PhotoSet, Project } from "@/content/types";

import { render } from "../../content/__tests__/test-utils";

vi.mock("@tanstack/react-router", () => ({
  Link: ({ to, children, className }: { to: string; children: ReactNode; className?: string }) => (
    <a href={to} className={className}>
      {children}
    </a>
  ),
}));

const project: Project = {
  id: "project-1",
  slug: "featured-project",
  title: "Featured Project",
  excerpt: "A project",
  content: [],
  publishedAt: "2026-01-01T00:00:00.000Z",
  role: "Designer",
  client: "Acme",
  tags: [],
};

const photo: Photo = {
  src: "https://example.com/photo.jpg",
  alt: "Harbour at dusk",
  aspect: "landscape",
  setSlug: "harbour",
};

const photoSet: PhotoSet = {
  id: "set-1",
  slug: "harbour",
  title: "Harbour Lights",
  excerpt: "A set",
  content: [],
  coverImage: "https://example.com/cover.jpg",
  publishedAt: "2026-01-01T00:00:00.000Z",
  images: ["https://example.com/one.jpg"],
  tags: [],
};

describe("WorkTile", () => {
  it("reveals the overlay on both hover and keyboard focus", () => {
    const html = render(<WorkTile project={project} />);

    expect(html).toContain("group-hover:opacity-100");
    expect(html).toContain("group-focus-visible:opacity-100");
    expect(html).toContain("group-focus-visible:translate-y-0");
  });

  it("renders the feature image when one is set", () => {
    const html = render(
      <WorkTile project={{ ...project, featureImage: "https://example.com/f.jpg" }} />,
    );

    expect(html).toContain("<img");
    expect(html).toContain('src="https://example.com/f.jpg"');
    expect(html).toContain('alt=""');
  });

  it("renders a placeholder when there is no feature image", () => {
    const html = render(<WorkTile project={project} />);

    expect(html).not.toContain("<img");
    expect(html).toContain('aria-hidden="true"');
  });

  it("defaults to an h3 and accepts an h2 for listing pages", () => {
    expect(render(<WorkTile project={project} />)).toContain("<h3");
    expect(render(<WorkTile project={project} headingLevel={2} />)).toContain("<h2");
  });
});

describe("PhotoTile", () => {
  it("hides the duplicate caption overlay from assistive technology", () => {
    const html = render(<PhotoTile photo={photo} index={0} />);

    expect(html).toContain('alt="Harbour at dusk"');
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain("group-focus-visible:opacity-100");
  });
});

describe("PhotoSetTile", () => {
  it("renders the cover as decorative and announces the title once", () => {
    const html = render(<PhotoSetTile photoSet={photoSet} />);

    expect(html).toContain('alt=""');
    expect(html.match(/Harbour Lights/gu)).toHaveLength(1);
  });
});

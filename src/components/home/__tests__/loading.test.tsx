import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import { RecentPosts } from "@/components/home/blog/RecentPosts";
import { Photography } from "@/components/home/photography/Photography";
import { Section } from "@/components/home/shared/Section";
import { WorkPortfolio } from "@/components/home/work-portfolio/WorkPortfolio";

import { render } from "../../content/__tests__/test-utils";

vi.mock("@tanstack/react-router", () => ({
  Link: ({ to, children, className }: { to: string; children: ReactNode; className?: string }) => (
    <a href={to} className={className}>
      {children}
    </a>
  ),
}));

describe("Section", () => {
  it("marks the section busy and announces a status while loading", () => {
    const html = render(
      <Section eyebrow="WORK" title="Selected projects" loading loadingMessage="Loading projects…">
        <p aria-hidden="true">Skeleton</p>
      </Section>,
    );

    expect(html).toContain('aria-busy="true"');
    expect(html).toContain("<output");
    expect(html).toContain("Loading projects…");
  });
});

describe("homepage loading states", () => {
  it("renders a busy work section with hidden skeletons while loading", () => {
    const html = render(<WorkPortfolio projects={[]} loading />);

    expect(html).toContain('aria-busy="true"');
    expect(html).toContain("<output");
    expect(html).toContain("Loading selected projects…");
    expect(html).toContain('aria-hidden="true"');
    expect(html).not.toContain("<a ");
  });

  it("renders an empty message once loaded without projects", () => {
    const html = render(<WorkPortfolio projects={[]} />);

    expect(html).toContain("No projects yet.");
    expect(html).not.toContain('aria-busy="true"');
  });

  it("renders a busy photography section while loading", () => {
    const html = render(<Photography photos={[]} loading />);

    expect(html).toContain('aria-busy="true"');
    expect(html).toContain("Loading recent photography…");
    expect(html).toContain('aria-hidden="true"');
  });

  it("renders an empty message once loaded without photos", () => {
    const html = render(<Photography photos={[]} />);

    expect(html).toContain("No photographs yet.");
    expect(html).not.toContain('aria-busy="true"');
  });

  it("renders a busy posts section while loading", () => {
    const html = render(<RecentPosts posts={[]} loading />);

    expect(html).toContain('aria-busy="true"');
    expect(html).toContain("Loading recent posts…");
    expect(html).toContain('aria-hidden="true"');
  });

  it("renders an empty message once loaded without posts", () => {
    const html = render(<RecentPosts posts={[]} />);

    expect(html).toContain("No posts yet.");
    expect(html).not.toContain('aria-busy="true"');
  });
});

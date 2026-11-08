import { describe, expect, it } from "vitest";

import { ContactFooter } from "@/components/home/contact-footer/ContactFooter";
import { Hero } from "@/components/home/hero/Hero";
import { Section } from "@/components/home/shared/Section";

import { render } from "../../content/__tests__/test-utils";

describe("Section", () => {
  it("hides the decorative rule from assistive technology", () => {
    const html = render(
      <Section eyebrow="WORK" title="Selected projects">
        <p>Child</p>
      </Section>,
    );

    expect(html).toContain('<hr aria-hidden="true"');
  });
});

describe("ContactFooter", () => {
  it("renders the call to action as a heading", () => {
    const html = render(<ContactFooter />);

    expect(html).toContain("<h2");
    expect(html).toContain("work together");
  });
});

describe("Hero", () => {
  it("hides the emoji and leaves the greeting as plain text", () => {
    const html = render(<Hero />);

    // The emoji appears once, inside an aria-hidden span, so assistive
    // technology reads only the greeting that follows it.
    expect(html).toContain(
      '<span aria-hidden="true">👋</span> My name is Wayne Jones and I am a...',
    );
    expect(html.match(/👋/gu)).toHaveLength(1);
  });

  it("keeps a single h1 on the homepage hero and contact footer", () => {
    const html = render(
      <>
        <Hero />
        <ContactFooter />
      </>,
    );

    expect(html.match(/<h1/gu)).toHaveLength(1);
  });
});

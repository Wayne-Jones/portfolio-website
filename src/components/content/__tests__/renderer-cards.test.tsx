import { describe, expect, it } from "vitest";

import { BookmarkCard } from "@/components/content/nodes/BookmarkCard";
import { Callout } from "@/components/content/nodes/Callout";
import { HtmlFallback } from "@/components/content/nodes/HtmlFallback";

import { render } from "./test-utils";

describe("callouts and bookmark cards", () => {
  it("renders callouts with variant styling", () => {
    const html = render(<Callout variant="success">Saved</Callout>);

    expect(html).toContain("border-green-600");
    expect(html).toContain("Saved");
  });

  it("renders bookmark cards as links", () => {
    const html = render(
      <BookmarkCard
        node={{
          type: "bookmark",
          url: "https://example.com/post",
          title: "Example",
          description: "A post",
        }}
      />,
    );

    expect(html).toContain('href="https://example.com/post"');
    expect(html).toContain("Example");
    expect(html).toContain("example.com");
  });

  it("does not emit unsafe bookmark hrefs", () => {
    const html = render(
      <BookmarkCard
        node={{
          type: "bookmark",
          url: "javascript:alert(1)",
          title: "Unsafe",
        }}
      />,
    );

    expect(html).not.toContain("javascript:");
    expect(html).not.toContain("<a ");
  });
});

describe("html fallback sanitization", () => {
  it("strips scripts, event handlers, and javascript: URLs", () => {
    const html = render(
      <HtmlFallback
        html={
          '<div onclick="x()"><script>alert(1)</script><a href="javascript:alert(1)">x</a><p>Safe</p></div>'
        }
      />,
    );

    expect(html).toContain("Safe");
    expect(html).not.toContain("<script");
    expect(html).not.toContain("onclick");
    expect(html).not.toContain("javascript:");
  });
});

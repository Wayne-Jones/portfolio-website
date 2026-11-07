import { describe, expect, it } from "vitest";

import { htmlToTree } from "@/content/adapters/ghost-html-to-tree";
import type { ContentBlock, ContentInline } from "@/content/types";

function firstBlock(html: string): ContentBlock {
  const tree = htmlToTree(html);
  const [block] = tree;
  if (block === undefined) throw new Error(`Expected a block for HTML: ${html}`);
  return block;
}

function paragraphInline(html: string): ContentInline[] {
  const block = firstBlock(html);
  if (block.type !== "paragraph") throw new Error(`Expected paragraph, got ${block.type}`);
  return block.children;
}

describe("text blocks and inline marks", () => {
  it("maps paragraphs and nested inline marks", () => {
    const children = paragraphInline(
      '<p>Hello <strong>bold <em>both</em></strong> and <a href="https://example.com">link</a> <code>inline()</code></p>',
    );

    expect(children[0]).toEqual({ type: "text", value: "Hello " });
    expect(children[1]).toEqual({
      type: "strong",
      children: [
        { type: "text", value: "bold " },
        { type: "emphasis", children: [{ type: "text", value: "both" }] },
      ],
    });
    expect(children[2]).toEqual({ type: "text", value: " and " });
    expect(children[3]).toEqual({
      type: "link",
      href: "https://example.com",
      children: [{ type: "text", value: "link" }],
    });
    expect(children[4]).toEqual({ type: "text", value: " " });
    expect(children[5]).toEqual({ type: "inlineCode", value: "inline()" });
  });

  it("maps h2–h6 to heading levels with slug ids", () => {
    const h2 = firstBlock("<h2>Section title</h2>");
    const h6 = firstBlock("<h6>Fine print</h6>");

    expect(h2).toEqual({
      type: "heading",
      level: 2,
      id: "section-title",
      children: [{ type: "text", value: "Section title" }],
    });
    expect(h6).toMatchObject({ type: "heading", level: 6 });
  });

  it("de-duplicates heading anchor ids", () => {
    const tree = htmlToTree("<h2>Intro</h2><h2>Intro</h2>");

    expect(tree[0]).toMatchObject({ type: "heading", id: "intro" });
    expect(tree[1]).toMatchObject({ type: "heading", id: "intro-1" });
  });

  it("returns an empty tree for empty HTML", () => {
    expect(htmlToTree("   ")).toEqual([]);
  });
});

describe("structural blocks", () => {
  it("maps blockquotes with nested blocks", () => {
    const block = firstBlock("<blockquote><p>Quoted</p></blockquote>");

    expect(block).toEqual({
      type: "blockquote",
      children: [{ type: "paragraph", children: [{ type: "text", value: "Quoted" }] }],
    });
  });

  it("maps ordered and unordered lists", () => {
    const unordered = firstBlock("<ul><li><p>One</p></li><li><p>Two</p></li></ul>");
    const ordered = firstBlock("<ol><li><p>First</p></li></ol>");

    expect(unordered).toMatchObject({ type: "list", ordered: false });
    expect(ordered).toMatchObject({ type: "list", ordered: true });
    expect(unordered).toMatchObject({
      items: [
        [{ type: "paragraph", children: [{ type: "text", value: "One" }] }],
        [{ type: "paragraph", children: [{ type: "text", value: "Two" }] }],
      ],
    });
  });

  it("maps hr to divider", () => {
    expect(firstBlock("<hr>")).toEqual({ type: "divider" });
  });
});

describe("list item contents", () => {
  it("keeps inline marks inside Ghost-style list items", () => {
    const block = firstBlock("<ul><li>Use <code>foo</code> and <strong>bar</strong></li></ul>");

    expect(block).toEqual({
      type: "list",
      ordered: false,
      items: [
        [
          {
            type: "paragraph",
            children: [
              { type: "text", value: "Use " },
              { type: "inlineCode", value: "foo" },
              { type: "text", value: " and " },
              { type: "strong", children: [{ type: "text", value: "bar" }] },
            ],
          },
        ],
      ],
    });
  });

  it("translates nested lists inside list items", () => {
    const block = firstBlock("<ul><li>One<ul><li>Nested</li></ul></li></ul>");

    expect(block).toMatchObject({
      type: "list",
      items: [
        [
          { type: "paragraph", children: [{ type: "text", value: "One" }] },
          { type: "list", ordered: false },
        ],
      ],
    });
  });
});

describe("media blocks", () => {
  it("maps kg-image-card figures to image blocks", () => {
    const block = firstBlock(
      '<figure class="kg-card kg-image-card"><img src="https://example.com/a.jpg" alt="A" width="1200" height="800"><figcaption>Caption</figcaption></figure>',
    );

    expect(block).toEqual({
      type: "image",
      src: "https://example.com/a.jpg",
      alt: "A",
      caption: "Caption",
      width: 1200,
      height: 800,
    });
  });

  it("maps gallery cards to image arrays", () => {
    const block = firstBlock(
      '<figure class="kg-card kg-gallery-card"><div class="kg-gallery-container"><div class="kg-gallery-row"><div class="kg-gallery-image"><img src="https://example.com/1.jpg" alt="One"></div><div class="kg-gallery-image"><img src="https://example.com/2.jpg" alt="Two"></div></div></div></figure>',
    );

    expect(block).toEqual({
      type: "gallery",
      images: [
        { src: "https://example.com/1.jpg", alt: "One" },
        { src: "https://example.com/2.jpg", alt: "Two" },
      ],
    });
  });
});

describe("embed cards", () => {
  it("maps YouTube embed cards", () => {
    const block = firstBlock(
      '<figure class="kg-card kg-embed-card"><iframe src="https://www.youtube.com/embed/abc12345678"></iframe></figure>',
    );

    expect(block).toMatchObject({
      type: "embed",
      provider: "youtube",
      url: "https://www.youtube.com/embed/abc12345678",
    });
  });

  it("maps Twitter embed cards", () => {
    const block = firstBlock(
      '<figure class="kg-card kg-embed-card"><blockquote class="twitter-tweet"><a href="https://twitter.com/user/status/1">tweet</a></blockquote></figure>',
    );

    expect(block).toMatchObject({
      type: "embed",
      provider: "twitter",
      url: "https://twitter.com/user/status/1",
    });
  });

  it("maps generic iframe embeds", () => {
    const block = firstBlock(
      '<figure class="kg-card kg-embed-card"><iframe src="https://example.com/embed"></iframe></figure>',
    );

    expect(block).toMatchObject({ type: "embed", provider: "generic" });
  });
});

describe("rich cards and code", () => {
  it("maps callout cards with variants", () => {
    const block = firstBlock(
      '<div class="kg-card kg-callout-card kg-callout-card-green"><div class="kg-callout-emoji">💡</div><div class="kg-callout-text">Save <strong>this</strong></div></div>',
    );

    expect(block).toEqual({
      type: "callout",
      variant: "success",
      children: [
        { type: "text", value: "Save " },
        { type: "strong", children: [{ type: "text", value: "this" }] },
      ],
    });
  });

  it("maps bookmark cards", () => {
    const block = firstBlock(
      '<div class="kg-card kg-bookmark-card"><a class="kg-bookmark-container" href="https://example.com/post"><div class="kg-bookmark-content"><div class="kg-bookmark-title">Title</div><div class="kg-bookmark-description">Description</div></div><div class="kg-bookmark-thumbnail"><img src="https://example.com/thumb.jpg"></div></a></div>',
    );

    expect(block).toEqual({
      type: "bookmark",
      url: "https://example.com/post",
      title: "Title",
      description: "Description",
      image: "https://example.com/thumb.jpg",
    });
  });

  it("maps code blocks and normalizes language aliases", () => {
    const block = firstBlock('<pre><code class="language-js">const x = 1;</code></pre>');

    expect(block).toEqual({
      type: "codeBlock",
      language: "javascript",
      code: "const x = 1;",
    });
  });

  it("routes unknown kg-* cards to the html escape hatch", () => {
    const block = firstBlock(
      '<figure class="kg-card kg-product-card"><img src="https://example.com/p.jpg"></figure>',
    );

    expect(block.type).toBe("html");
    expect(block).toMatchObject({ html: expect.stringContaining("kg-product-card") });
  });
});

import { describe, expect, it } from "vitest";

import { CodeBlock } from "@/components/content/nodes/CodeBlock";
import { Divider } from "@/components/content/nodes/Divider";
import { Heading } from "@/components/content/nodes/Heading";
import { List } from "@/components/content/nodes/List";
import { Paragraph } from "@/components/content/nodes/Paragraph";
import { PullQuote } from "@/components/content/nodes/PullQuote";
import type { ContentBlock } from "@/content/types";

import { render } from "./test-utils";

describe("text components", () => {
  it("renders paragraphs", () => {
    expect(render(<Paragraph>Hello</Paragraph>)).toBe(
      '<p class="my-5 leading-relaxed text-fg">Hello</p>',
    );
  });

  it("renders headings with slug ids and anchor links", () => {
    const node: Extract<ContentBlock, { type: "heading" }> = {
      type: "heading",
      level: 2,
      children: [{ type: "text", value: "Hello World" }],
    };
    const html = render(<Heading node={node}>Hello World</Heading>);

    expect(html).toContain('<h2 id="hello-world"');
    expect(html).toContain('href="#hello-world"');
  });
});

describe("code components", () => {
  it("renders highlighted code HTML verbatim", () => {
    const html = render(
      <CodeBlock
        node={{
          type: "codeBlock",
          language: "javascript",
          code: "const x = 1;",
          highlightedHtml: '<pre class="language-javascript"><code>const x = 1;</code></pre>',
        }}
      />,
    );

    expect(html).toContain('<pre class="language-javascript">');
    expect(html).toContain("const x = 1;");
  });

  it("falls back to plain pre/code when highlighting is absent", () => {
    const html = render(
      <CodeBlock node={{ type: "codeBlock", code: "plain < code", language: "rust" }} />,
    );

    expect(html).toContain("<pre");
    expect(html).toContain("<code");
    expect(html).toContain("plain &lt; code");
  });
});

describe("structural components", () => {
  it("renders pull quotes with nested content", () => {
    const html = render(<PullQuote>Quoted</PullQuote>);
    expect(html).toContain("<blockquote");
    expect(html).toContain("Quoted");
  });

  it("renders ordered and unordered lists", () => {
    expect(
      render(
        <List ordered={true}>
          <li>One</li>
        </List>,
      ),
    ).toContain("<ol");
    expect(
      render(
        <List ordered={false}>
          <li>One</li>
        </List>,
      ),
    ).toContain("<ul");
  });

  it("renders a semantic divider", () => {
    const html = render(<Divider />);
    expect(html).toContain("<hr");
    expect(html).toContain("data-content-divider");
  });
});

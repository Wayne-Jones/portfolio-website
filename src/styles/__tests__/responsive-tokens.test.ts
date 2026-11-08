/// <reference types="node" />
import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const read = (relativePath: string): string =>
  readFileSync(new URL(relativePath, import.meta.url), "utf8");

const globalsCss = read("../globals.css");
const rootRoute = read("../../routes/__root.tsx");
const hero = read("../../components/home/hero/Hero.tsx");

describe("responsive design tokens", () => {
  it("keeps the 8px spacing base", () => {
    expect(globalsCss).toContain("--spacing: 0.5rem;");
  });

  it("does not load the legacy scaffold stylesheet", () => {
    expect(rootRoute).not.toContain("index.css");
  });

  it("sizes body copy fluidly with an anchored clamp", () => {
    const bodyBlock = globalsCss.match(/body\s*\{[\s\S]*?\}/u)?.[0] ?? "";

    expect(bodyBlock).toMatch(/font-size:\s*clamp\(\s*1rem,/u);
    expect(globalsCss).not.toMatch(/@media\s*\(width\s*>=\s*64rem\)\s*\{\s*body/u);
  });

  it("sizes the hero headline fluidly instead of a fixed step", () => {
    expect(hero).toMatch(/<h1[\s\S]*?text-\[clamp\(/u);
    expect(hero).not.toContain("whitespace-nowrap");
  });
});

import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import type { Post } from "../../src/content/types.ts";
import { writeSnapshot } from "../snapshot-content.ts";

let root: string;

function entry(id: string, slug: string, publishedAt: string): Post {
  return { id, slug, publishedAt } as Post;
}

function directoryUrl(name: string): URL {
  return pathToFileURL(path.join(root, name, path.sep));
}

beforeEach(() => {
  root = mkdtempSync(path.join(tmpdir(), "portfolio-snapshot-"));
});

afterEach(() => {
  rmSync(root, { recursive: true, force: true });
});

describe("writeSnapshot", () => {
  it("writes byte-identical files for shuffled input", async () => {
    const first = [
      entry("1", "a", "2025-01-01T00:00:00.000Z"),
      entry("2", "b", "2026-01-01T00:00:00.000Z"),
      entry("3", "c", "2025-01-01T00:00:00.000Z"),
    ];
    const shuffled = [first[2], first[0], first[1]];
    const firstDirectory = directoryUrl("first");
    const secondDirectory = directoryUrl("second");

    await writeSnapshot({ "posts.json": first }, firstDirectory);
    await writeSnapshot({ "posts.json": shuffled }, secondDirectory);

    const firstFile = readFileSync(new URL("posts.json", firstDirectory), "utf8");
    const secondFile = readFileSync(new URL("posts.json", secondDirectory), "utf8");

    expect(secondFile).toBe(firstFile);
    expect((JSON.parse(firstFile) as Post[]).map((post) => post.slug)).toEqual(["b", "a", "c"]);
  });
});

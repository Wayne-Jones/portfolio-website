import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { readSlugs } from "../read-slugs.ts";

let directory: string;

beforeEach(() => {
  directory = mkdtempSync(path.join(tmpdir(), "portfolio-slugs-"));
});

afterEach(() => {
  rmSync(directory, { recursive: true, force: true });
});

describe("readSlugs", () => {
  it("returns no slugs when the file is missing", () => {
    expect(readSlugs("posts.json", directory)).toEqual([]);
  });

  it("fails with the file name when the JSON is malformed", () => {
    writeFileSync(path.join(directory, "posts.json"), "{ not json", "utf8");

    expect(() => readSlugs("posts.json", directory)).toThrow(
      /Failed to parse snapshot .*posts\.json/u,
    );
  });

  it("fails when the root is not an array", () => {
    writeFileSync(path.join(directory, "posts.json"), "{}", "utf8");

    expect(() => readSlugs("posts.json", directory)).toThrow(/expected a JSON array/u);
  });

  it("returns every string slug from a valid snapshot", () => {
    writeFileSync(
      path.join(directory, "posts.json"),
      JSON.stringify([{ slug: "first" }, { slug: "second" }, { title: "no slug" }]),
      "utf8",
    );

    expect(readSlugs("posts.json", directory)).toEqual(["first", "second"]);
  });
});

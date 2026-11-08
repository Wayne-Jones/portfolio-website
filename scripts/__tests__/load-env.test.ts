import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { loadEnv } from "../load-env.ts";

let directory: string;

function writeEnv(contents: string): string {
  const file = path.join(directory, ".env");
  writeFileSync(file, contents, "utf8");
  return file;
}

beforeEach(() => {
  directory = mkdtempSync(path.join(tmpdir(), "portfolio-env-"));
});

afterEach(() => {
  rmSync(directory, { recursive: true, force: true });
});

describe("loadEnv values", () => {
  it("preserves equals signs inside values", () => {
    const target: Record<string, string | undefined> = {};
    loadEnv(writeEnv("VITE_GHOST_CONTENT_API_KEY=abc=def\n"), target);

    expect(target.VITE_GHOST_CONTENT_API_KEY).toBe("abc=def");
  });

  it("unquotes single and double quoted values", () => {
    const target: Record<string, string | undefined> = {};
    loadEnv(writeEnv(`SINGLE='x y'\nDOUBLE="a b"\n`), target);

    expect(target.SINGLE).toBe("x y");
    expect(target.DOUBLE).toBe("a b");
  });

  it("interprets escape sequences inside double quotes", () => {
    const target: Record<string, string | undefined> = {};
    loadEnv(writeEnv('MULTI="line1\\nline2"\n'), target);

    expect(target.MULTI).toBe("line1\nline2");
  });
});

describe("loadEnv syntax", () => {
  it("accepts comments, blank lines, export, CRLF, and empty values", () => {
    const target: Record<string, string | undefined> = {};
    loadEnv(
      writeEnv("# comment\r\n\r\nexport EXPORTED=yes\r\nEMPTY=\r\nNEIGHBOUR=ok\r\n"),
      target,
    );

    expect(target.EXPORTED).toBe("yes");
    expect(target.EMPTY).toBe("");
    expect(target.NEIGHBOUR).toBe("ok");
  });

  it("does not overwrite an existing environment value", () => {
    const target: Record<string, string | undefined> = { KEEP: "real" };
    loadEnv(writeEnv("KEEP=from-file\nNEW=from-file\n"), target);

    expect(target.KEEP).toBe("real");
    expect(target.NEW).toBe("from-file");
  });

  it("does nothing when the file is missing", () => {
    const target: Record<string, string | undefined> = {};
    loadEnv(path.join(directory, "missing.env"), target);

    expect(target).toEqual({});
  });
});

describe("loadEnv errors", () => {
  it("reports a line without a key/value pair", () => {
    const file = writeEnv("GOOD=1\nNOT_A_PAIR\n");

    expect(() => loadEnv(file, {})).toThrow(/Malformed \.env entry at .*:2/u);
  });

  it("reports an invalid key", () => {
    const file = writeEnv("BAD KEY=1\n");

    expect(() => loadEnv(file, {})).toThrow(/invalid key "BAD KEY"/u);
  });
});

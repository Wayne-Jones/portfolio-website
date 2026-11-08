import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const defaultDataDirectory = path.resolve(import.meta.dirname, "../src/content/data");

/**
 * Reads the `slug` values from a snapshot file.
 *
 * A missing file returns no slugs (the content type simply has no pages yet).
 * A file that exists but cannot be parsed, or whose root is not an array, is a
 * build error so a broken snapshot cannot silently prerender an empty site.
 */
export function readSlugs(filename: string, dataDirectory: string = defaultDataDirectory): string[] {
  const file = path.join(dataDirectory, filename);
  if (!existsSync(file)) return [];

  let parsed: unknown;
  try {
    parsed = JSON.parse(readFileSync(file, "utf8"));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to parse snapshot ${file}: ${message}`, { cause: error });
  }

  if (!Array.isArray(parsed)) {
    throw new Error(`Invalid snapshot ${file}: expected a JSON array of entries with string slugs`);
  }

  const slugs: string[] = [];
  for (const entry of parsed) {
    if (
      typeof entry === "object" &&
      entry !== null &&
      "slug" in entry &&
      typeof entry.slug === "string"
    ) {
      slugs.push(entry.slug);
    }
  }
  return slugs;
}

import { existsSync, readFileSync } from "node:fs";
import { parseEnv } from "node:util";

export type EnvTarget = Record<string, string | undefined>;

const exportPrefix = /^\s*export\s+/u;
const keyPattern = /^[A-Za-z_][A-Za-z0-9_]*$/u;

/** Rejects lines that cannot be a `KEY=value` pair before Node parses them. */
function validateEntry(line: string, lineNumber: number, envPath: string): void {
  const trimmed = line.trim();
  if (trimmed === "" || trimmed.startsWith("#")) return;

  const entry = trimmed.replace(exportPrefix, "");
  const equals = entry.indexOf("=");
  const location = `${envPath}:${lineNumber}`;

  if (equals === -1) {
    throw new Error(`Malformed .env entry at ${location}: expected KEY=value`);
  }

  const key = entry.slice(0, equals).trim();
  if (!keyPattern.test(key)) {
    throw new Error(`Malformed .env entry at ${location}: invalid key "${key}"`);
  }
}

/**
 * Loads `.env` into the target environment without overwriting variables that
 * are already set.
 *
 * Node's `parseEnv` handles quoting, escapes, comments, `export`, and CRLF.
 * The line validation runs first so malformed entries fail loudly instead of
 * being silently skipped.
 */
export function loadEnv(envPath = ".env", target: EnvTarget = process.env): void {
  if (!existsSync(envPath)) return;

  const source = readFileSync(envPath, "utf8");
  source.split(/\r?\n/u).forEach((line, index) => {
    validateEntry(line, index + 1, envPath);
  });

  let parsed: Record<string, string | undefined>;
  try {
    parsed = parseEnv(source);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to parse ${envPath}: ${message}`, { cause: error });
  }

  for (const [key, value] of Object.entries(parsed)) {
    if (value !== undefined && target[key] === undefined) target[key] = value;
  }
}

import { existsSync, readFileSync } from "node:fs";
import { mkdir, rename, writeFile } from "node:fs/promises";

import { GhostAdapter } from "../src/content/adapters/ghost.ts";
import { MockAdapter } from "../src/content/adapters/mock.ts";
import type { PhotoSet, Post, Project } from "../src/content/types.ts";
import { parsePhotoSets, parsePosts, parseProjects } from "../src/content/validate.ts";

const dataDirectory = new URL("../src/content/data/", import.meta.url);

// Load .env if it exists; skip if missing (Vercel-friendly).
const envPath = ".env";
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const [k, ...v] = line.split("=");
    // Real environment variables win over `.env` (same as dotenv defaults).
    if (k && v.length && process.env[k] === undefined) process.env[k] = v.join("=");
  }
}

type SnapshotMode = "ghost" | "snapshot" | "mock";

type SnapshotSource = {
  getPosts(): Promise<Post[]>;
  getProjects(): Promise<Project[]>;
  getPhotoSets(): Promise<PhotoSet[]>;
};

type SnapshotEntry = Post[] | Project[] | PhotoSet[];

type SnapshotData = Record<string, SnapshotEntry>;

interface GhostCredentials {
  baseUrl: string;
  apiKey: string;
}

type GhostConfig =
  | { status: "missing" }
  | { status: "partial" }
  | { status: "ok"; credentials: GhostCredentials };

function readEnv(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value === undefined || value === "" ? undefined : value;
}

function readGhostConfig(): GhostConfig {
  const baseUrl = readEnv("VITE_GHOST_URL");
  const apiKey = readEnv("VITE_GHOST_CONTENT_API_KEY");
  if (baseUrl === undefined && apiKey === undefined) return { status: "missing" };
  if (baseUrl === undefined || apiKey === undefined) return { status: "partial" };
  return { status: "ok", credentials: { baseUrl, apiKey } };
}

function resolveMode(ghost: GhostConfig): SnapshotMode {
  const explicit = readEnv("SNAPSHOT_SOURCE")?.toLowerCase();

  if (explicit === "mock" || explicit === "snapshot") return explicit;
  if (explicit === "ghost") {
    if (ghost.status !== "ok") {
      throw new Error(
        "SNAPSHOT_SOURCE=ghost requires both VITE_GHOST_URL and VITE_GHOST_CONTENT_API_KEY.",
      );
    }
    return "ghost";
  }
  if (explicit !== undefined) {
    throw new Error(`Unknown SNAPSHOT_SOURCE "${explicit}". Use "ghost", "snapshot", or "mock".`);
  }
  if (ghost.status === "partial") {
    throw new Error(
      "Set both VITE_GHOST_URL and VITE_GHOST_CONTENT_API_KEY, or neither. " +
        "A single Ghost variable is treated as a configuration error.",
    );
  }
  return ghost.status === "ok" ? "ghost" : "snapshot";
}

function buildContentService(mode: SnapshotMode, ghost: GhostConfig): SnapshotSource {
  if (mode === "mock") return new MockAdapter();
  if (ghost.status !== "ok") {
    throw new Error("Ghost credentials are required for the ghost snapshot source.");
  }
  return new GhostAdapter(ghost.credentials.baseUrl, ghost.credentials.apiKey);
}

/**
 * Validate the full snapshot before writing, stage every file as `.tmp`, then
 * rename them into place so a failure cannot leave a mixed snapshot.
 */
async function writeSnapshot(entries: SnapshotData): Promise<void> {
  await mkdir(dataDirectory, { recursive: true });

  const staged = await Promise.all(
    Object.entries(entries).map(async ([filename, data]) => {
      const temp = new URL(`${filename}.tmp`, dataDirectory);
      await writeFile(temp, `${JSON.stringify(data, null, 2)}\n`, "utf8");
      return { filename, temp };
    }),
  );

  await Promise.all(
    staged.map(({ filename, temp }) => rename(temp, new URL(filename, dataDirectory))),
  );
}

export async function run(): Promise<void> {
  const ghost = readGhostConfig();
  const mode = resolveMode(ghost);

  if (mode === "snapshot") {
    console.log(
      "No snapshot written: using the committed snapshot in src/content/data/. " +
        "Set SNAPSHOT_SOURCE=mock to refresh fixtures or configure Ghost to fetch.",
    );
    return;
  }

  const service = buildContentService(mode, ghost);
  const [posts, projects, photoSets] = await Promise.all([
    service.getPosts(),
    service.getProjects(),
    service.getPhotoSets(),
  ]);

  const snapshot: SnapshotData = {
    "posts.json": parsePosts(posts),
    "projects.json": parseProjects(projects),
    "photosets.json": parsePhotoSets(photoSets),
  };

  await writeSnapshot(snapshot);

  console.log(
    `Snapshot written from ${mode}: ${posts.length} posts, ${projects.length} projects, ` +
      `${photoSets.length} photo sets -> src/content/data/`,
  );
}

run().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(
    `Snapshot generation failed; the committed snapshot was not regenerated.\n${message}`,
  );
  process.exitCode = 1;
});

import { existsSync, readFileSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";

import { GhostAdapter } from "../src/content/adapters/ghost.ts";
import { MockAdapter } from "../src/content/adapters/mock.ts";
import type { PhotoSet, Post, Project } from "../src/content/types.ts";
import { parsePhotoSets, parsePosts, parseProjects } from "../src/content/validate.ts";

const dataDirectory = new URL("../src/content/data/", import.meta.url);

// Load .env if it exists, skip if missing (Vercel-friendly)
const envPath = ".env";
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const [k, ...v] = line.split("=");
    if (k && v.length) process.env[k] = v.join("=");
  }
}

type SnapshotSource = {
  getPosts(): Promise<Post[]>;
  getProjects(): Promise<Project[]>;
  getPhotoSets(): Promise<PhotoSet[]>;
};

function buildContentService(): SnapshotSource {
  const baseUrl = process.env.VITE_GHOST_URL;
  const apiKey = process.env.VITE_GHOST_CONTENT_API_KEY;
  if (baseUrl && apiKey) {
    return new GhostAdapter(baseUrl, apiKey);
  }
  console.warn(
    "No VITE_GHOST_URL / VITE_GHOST_CONTENT_API_KEY set; writing a mock snapshot. " +
      "Set both to snapshot real Ghost content.",
  );
  return new MockAdapter();
}

type SnapshotEntry = Post[] | Project[] | PhotoSet[];

async function writeJson(filename: string, data: SnapshotEntry): Promise<void> {
  await mkdir(dataDirectory, { recursive: true });
  await writeFile(new URL(filename, dataDirectory), `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

export async function run(): Promise<void> {
  const service = buildContentService();
  const [posts, projects, photoSets] = await Promise.all([
    service.getPosts(),
    service.getProjects(),
    service.getPhotoSets(),
  ]);

  // Validate before writing so a broken translation fails the build instead of
  // committing a snapshot the static adapter will reject.
  await writeJson("posts.json", parsePosts(posts));
  await writeJson("projects.json", parseProjects(projects));
  await writeJson("photosets.json", parsePhotoSets(photoSets));

  console.log(
    `Snapshot written: ${posts.length} posts, ${projects.length} projects, ${photoSets.length} photo sets -> src/content/data/`,
  );
}

run().catch((error) => {
  console.error("Snapshot generation failed:", error);
  process.exitCode = 1;
});

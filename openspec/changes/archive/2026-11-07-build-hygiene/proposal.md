## Why

`pnpm build` runs `prebuild` → `pnpm snapshot` on every build. When `VITE_GHOST_URL` and `VITE_GHOST_CONTENT_API_KEY` are absent, `scripts/snapshot-content.ts` silently selects `MockAdapter` and overwrites the committed `src/content/data/*.json` with placeholder content. That contradicts `ssg-build`'s "fails with a clear error" scenario and makes local builds non-deterministic: a developer who just wants to build the committed site can accidentally replace the production snapshot with mock posts.

The script also writes each collection as it validates it, so a validation failure after the first write leaves a partially updated snapshot behind.

## What Changes

- Resolve the snapshot source explicitly instead of always choosing Ghost-or-mock:
  - Both Ghost env vars present → fetch from Ghost (**default**).
  - No Ghost env vars → keep the committed snapshot and exit successfully (**default**), with a clear message.
  - `SNAPSHOT_SOURCE=mock` → write the mock fixtures (explicit opt-in for fixture work).
  - `SNAPSHOT_SOURCE=snapshot` → keep the committed snapshot explicitly.
  - `SNAPSHOT_SOURCE=ghost` → require Ghost credentials and fail with a clear error if they are missing.
- Fail with a clear error, without touching the committed snapshot, when a configured Ghost fetch fails.
- Validate all three collections before writing any file, and stage-then-rename the JSON files so a failure cannot leave a mixed snapshot.
- Update the README and `.env.example` to document the modes and the safe local-build path.
- Correct the `ssg-build` prebuild requirement so it distinguishes "unconfigured → keep snapshot" from "configured but unreachable → fail".

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `ssg-build`

## Impact

- Build tooling and documentation only; the content service and rendered output are unchanged.
- `pnpm build` no longer overwrites `src/content/data/*.json` when Ghost is unconfigured.
- Intentional fixture refreshes use `SNAPSHOT_SOURCE=mock pnpm snapshot`.
- Local builds without Ghost credentials succeed against the committed snapshot, which also keeps Vercel previews without Ghost env vars working.

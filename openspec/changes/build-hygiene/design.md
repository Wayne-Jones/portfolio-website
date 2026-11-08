## Context

`package.json` wires `prebuild` to `pnpm snapshot`, and `scripts/snapshot-content.ts` chooses `GhostAdapter` only when both Ghost env vars are present, otherwise it warns and writes `MockAdapter` data. The committed snapshot is the source of truth for production and for offline builds, so an accidental mock write is both surprising and hard to notice (the files still validate).

The canonical `ssg-build` requirement says a build that cannot reach Ghost must fail at the snapshot step rather than render partially. The current fallback does neither: it succeeds and replaces real content with placeholders.

## Goals / Non-Goals

**Goals:**

- A build without Ghost credentials leaves `src/content/data/*.json` untouched and renders from the committed snapshot.
- A configured Ghost fetch failure stops the build with a clear, actionable error.
- Refreshing the snapshot from mock fixtures is explicit (`SNAPSHOT_SOURCE=mock`).
- A partially configured Ghost environment (one var set) is an error, not a silent fallback.
- All three collections are validated before any file is written, and writes are staged.

**Non-Goals:**

- Changing the adapter layer, the content service, or the snapshot schema.
- Running Ghost during the render pass; the render pass continues to read local JSON only.
- Adding a new content source or changing `VITE_CMS`.

## Decisions

### Decision 1: Explicit source matrix

| Configuration | Source | Behavior |
| --- | --- | --- |
| Both Ghost vars set | `ghost` | Fetch and write |
| Neither Ghost var set | `snapshot` | Keep committed files, exit 0 |
| `SNAPSHOT_SOURCE=ghost` | `ghost` | Require credentials, then fetch |
| `SNAPSHOT_SOURCE=mock` | `mock` | Write mock fixtures |
| `SNAPSHOT_SOURCE=snapshot` | `snapshot` | Keep committed files, exit 0 |
| One Ghost var set | — | Fail: both or neither |
| Unknown `SNAPSHOT_SOURCE` | — | Fail with the accepted values |

`SNAPSHOT_SOURCE` overrides inference so CI/Vercel can be explicit. The default is safe: no credentials means no writes.

### Decision 2: "Unconfigured" is not an error, but "misconfigured" is

Failing every local build without Ghost secrets would make previews and offline builds unusable. Keeping the committed snapshot is deterministic and matches the production render path. A single Ghost variable, however, is almost certainly a typo, so it fails loudly instead of silently using stale content.

### Decision 3: Validate everything, then stage and rename

The script parses posts, projects, and photo sets into local values before writing. It writes `.tmp` files first and renames them into place only after all three writes succeed, so a validation error or a failed write cannot leave a mixed snapshot.

### Decision 4: Keep loading `.env`

The existing loader lets a local `.env` provide credentials without extra tooling. On Vercel the real environment is already populated, and a missing `.env` stays harmless.

## Risks / Trade-offs

- **[Risk] A deploy loses Ghost credentials and keeps a stale snapshot** → The no-op is logged with the reason and the resolved source; production can set `SNAPSHOT_SOURCE=ghost` to make missing credentials fatal.
- **[Risk] Preview deployments without Ghost credentials use committed content** → Intended: previews stay deterministic and do not touch the snapshot.
- **[Risk] A failed fetch leaves `.tmp` files** → They are ignored by the content service and overwritten on the next run; the committed JSON is untouched.
- **[Risk] `SNAPSHOT_SOURCE` becomes another env var to learn** → Documented in `.env.example` and the README command list, with safe defaults.

## Migration Plan

1. Rewrite the snapshot source resolution and write path.
2. Update the README and `.env.example`.
3. Verify all modes locally:
   - no credentials → snapshot unchanged;
   - `SNAPSHOT_SOURCE=mock` → files refreshed;
   - `SNAPSHOT_SOURCE=ghost` without credentials → clear failure;
   - one credential set → clear failure.
4. Run lint/typecheck/tests and a production build.
5. Archive the change and sync `ssg-build` with the `openspec-sync-specs` workflow.

No data migration is required; the committed snapshot is already valid.

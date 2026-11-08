## 1. Snapshot Script

- [x] 1.1 Resolve `SNAPSHOT_SOURCE` (`ghost` | `snapshot` | `mock`) with safe inference from Ghost env vars
- [x] 1.2 Treat a single Ghost env var as a configuration error
- [x] 1.3 Exit successfully without writing when the source is `snapshot`
- [x] 1.4 Keep the mock fallback available only through `SNAPSHOT_SOURCE=mock`
- [x] 1.5 Fail with a clear message when a configured Ghost fetch fails, leaving the committed snapshot untouched
- [x] 1.6 Validate all three collections before writing and stage `.tmp` files before renaming them into place

## 2. Documentation

- [x] 2.1 Update the README command list and snapshot workflow with the safe defaults and `SNAPSHOT_SOURCE`
- [x] 2.2 Document `SNAPSHOT_SOURCE` in `.env.example`

## 3. Verification

- [x] 3.1 `pnpm snapshot` with no Ghost credentials leaves `src/content/data/*.json` byte-identical
- [x] 3.2 `SNAPSHOT_SOURCE=mock pnpm snapshot` refreshes the fixtures and reports the mock source
- [x] 3.3 `SNAPSHOT_SOURCE=ghost pnpm snapshot` without credentials fails with the expected message
- [x] 3.4 One Ghost env var set fails with the expected message
- [x] 3.5 `pnpm exec tsc -b`, `pnpm lint`, `pnpm format:check`, `pnpm test`
- [x] 3.6 `pnpm exec vite build` still prerenders from the committed snapshot

## 4. Archive

- [ ] 4.1 Archive `build-hygiene`, syncing the `ssg-build` delta with the `openspec-sync-specs` workflow
- [ ] 4.2 `pnpm exec openspec validate --specs --strict`

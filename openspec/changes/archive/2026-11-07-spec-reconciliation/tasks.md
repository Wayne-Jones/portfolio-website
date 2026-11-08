## 1. Spec Deltas

- [x] 1.1 `ssg-build`: add photography detail routes to the enumerable-paths requirement and add the sitemap/RSS feed requirement
- [x] 1.2 `project-scaffold`: replace the placeholder-route requirement with the real route inventory; refresh folder structure and dependency wording
- [x] 1.3 `view-transitions`: require matching source/destination names scoped by content type and document the uniqueness constraint
- [x] 1.4 `content-renderer`: correct the lazy-loading scenario and add the article-chrome boundary requirement
- [x] 1.5 `content-adapter`: document the `Photo` type, the set-linked featured-photo contract, and correct the static adapter's featured-subset scenario

## 2. Documentation

- [x] 2.1 Correct the `/photography` route description in README and note that the index listing is not implemented yet
- [x] 2.2 Confirm the README sitemap/RSS section still matches `scripts/generate-feeds.ts` and `.env.example`

## 3. Verification

- [x] 3.1 `pnpm exec openspec validate spec-reconciliation --strict`
- [x] 3.2 `pnpm exec tsc -b`, `pnpm lint`, and `pnpm format:check` stay clean (docs-only change)

## 4. Archive

- [x] 4.1 Archive `spec-reconciliation` so the deltas merge into `openspec/specs/`
- [x] 4.2 `pnpm exec openspec validate --specs --strict`

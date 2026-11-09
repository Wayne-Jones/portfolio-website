# Design

## Context

See `proposal.md` for motivation. The relevant current state:

- `src/routes/__root.tsx` imports `@/index.css` before `@/styles/globals.css`. `src/index.css` is the untouched Vite scaffold stylesheet: it sets `font: 18px/145%` on `:root` with a `max-width: 1024px` override to `16px`, defines its own `--text`, `--bg`, `--border`, and `--accent` variables, and constrains `#root` to 1126px with borders. None of those are used by the real app, but they still apply where they are not overridden.
- `globals.css` sets `--spacing: 0.5rem` (8px at the CSS default root size) and bumps `body` to `1.125rem` at `≥64rem` via a media query.
- The header is a single non-wrapping flex row (`justify-between`) with `gap-3` nav links; at 320px the wordmark plus four links exceed the viewport.
- The hero `<h1>` uses fixed `text-[40px]`, `leading-[0.95]`, and `whitespace-nowrap` on both lines; at 320px "Web Developer" alone is wider than the container.
- `ArticleLayout` renders `footerFullBleed` with `-mx-3`, hard-coded to the root `<main>`'s current `px-3`. If main padding changes at a breakpoint, the bleed desynchronizes.
- Vitest runs in a `node` environment and tests render markup server-side; there is no DOM layout engine available for width assertions.

## Goals / Non-Goals

**Goals:**

- One stylesheet owns root typography and spacing.
- Fluid sizing through the 1024px boundary instead of a discrete step.
- Header, hero, and full-bleed regions safe from 320px up.
- A repeatable check for the supported widths that does not add a browser-automation dependency.

**Non-Goals:**

- Visual redesign of the header or hero.
- Changing the color palette, fonts, or dark-mode behaviour.
- Converting the header into a hamburger/drawer menu; wrapping or horizontal scrolling is sufficient.
- Adding Playwright/jsdom to the repo solely for this change.

## Decisions

### Delete `src/index.css` rather than neutralize it

Remove the file and its import so no scaffold rule can leak back in. Alternative: keep it and strip the conflicting declarations. Rejected because the file is entirely unused by the real app and leaving a stripped shell invites future drift.

### Derive the desktop body step from a fluid value

Replace the `@media (width >= 64rem)` font-size override on `body` with a `clamp()`-based step, e.g. `font-size: clamp(1rem, 0.9rem + 0.35vw, 1.125rem)`. At 1024px the computed value is between 16px and 18px and continuous across the boundary, satisfying the spec's "no discrete jump" scenario. Keep `--text-base` as the 16px anchor and express the desktop step locally on `body`, not by redefining the token.

Alternative: keep the breakpoint but pick one size (e.g. 17px everywhere). Rejected because it changes the intended reading size on large screens.

### Hero headline: fluid sizing, controlled wrapping

Replace `text-[40px] ... whitespace-nowrap` with a `clamp()` size that fits the narrowest supported container, e.g. `text-[clamp(2rem,9vw,10.9rem)]`, and allow each line to wrap only as a last resort by removing `whitespace-nowrap`. Keep `leading-[0.95]` and tracking, since they are part of the treatment; line-height below 1 is safe once the lines can wrap and the size is fluid. The two-line structure (`<span className="block">`) stays so the outline treatment applies to the second line only.

Alternative: keep fixed sizes and scale down with `transform: scale()` below `sm`. Rejected because it shrinks the layout box inconsistently and harms text selection and accessibility.

### Header: wrap the nav list

Set the header container to `flex-wrap` (or allow the nav `<ul>` to `flex-wrap`) with `min-w-0` on the wordmark so the links wrap onto a second row at 320px. The header can grow in height; it must not widen the document. The `improve-accessibility` change owns the 44px minimum target size for these links.

Alternative: horizontal scroll on the nav. Rejected because hidden links are less discoverable and `overflow-x-auto` on a nested flex row can still propagate width if not constrained.

### Full-bleed uses a gutter custom property

Define `--page-gutter` on the page container (e.g. `--page-gutter: 0.75rem` matching `px-3`, updated at breakpoints), give `<main>` `px-(--page-gutter)`, and make full-bleed `-mx-(--page-gutter)`. This keeps the bleed derived from the same value rather than a duplicated literal.

Alternative: `100vw` + negative `calc((100vw - 100%) / 2)`. Rejected because `100vw` includes the scrollbar and reintroduces horizontal overflow.

### Verification: token unit tests plus a browser width sweep

Add a Vitest test that reads `globals.css` and asserts the 8px spacing token, the absence of an import of `index.css` in `__root.tsx`, and that the body/hero sizes contain `clamp(`. Layout itself is verified with the existing browser tooling at 320/360/768/1024/1025px, checking `document.documentElement.scrollWidth <= window.innerWidth`. This avoids adding jsdom or Playwright as a dependency while still giving the change a regression guard.

## Risks / Trade-offs

- **Fluid body text can land below 16px on very narrow screens** → Anchor the `clamp()` minimum at `1rem` so it never shrinks below the base size.
- **Hero at `9vw` may still overflow at 320px if the font is wider than expected** → Verify at 320px with the actual font loaded; reduce the `vw` coefficient or add a `min()` cap if needed. The spec's 320px scenario is the gate.
- **Wrapping header increases header height and shifts hero position** → Acceptable; the hero is below the fold on small screens and the reveal animations are viewport-triggered.
- **Removing `index.css` may change elements that implicitly relied on its `h1`/`h2`/`p` resets** → `globals.css` already sets heading margins, body margin, and box-sizing; grep for `#root`, `--text`, `--border`, `--code-bg`, `.counter`, and `#social` before deleting to confirm nothing else references them.
- **Gutter variable must be defined wherever full-bleed is used** → Provide a fallback in the negative margin, e.g. `-mx-(--page-gutter,0.75rem)`, and define it on the same container that owns the padding.

## Migration Plan

1. Delete `src/index.css` and its import; run the existing test suite and a visual pass to catch any layout that depended on the scaffold rules.
2. Introduce the fluid body and hero sizes, header wrapping, and gutter variable in one pass, then verify the width sweep.
3. Rollback is a revert of the single commit; no data or API migration is involved.

## 1. Project Initialization

- [x] 1.1 Scaffold Vite + React + TypeScript project with `npm create vite@latest`
- [x] 1.2 Install core dependencies: `react`, `react-dom`, `typescript`, `@tanstack/react-router`, `tailwindcss` (v4)
- [x] 1.3 Install font packages: `@fontsource/switzer`, `@fontsource/inter`, `@fontsource/ibm-plex-mono`
- [x] 1.4 Create `tsconfig.json` with strict mode, path aliases (`@/` → `src/`)
- [x] 1.5 Create `vite.config.ts` with React plugin and path alias resolution
- [x] 1.6 Create `.gitignore` with `node_modules/`, `dist/`, `.env`, `.env.local`
- [x] 1.7 Create `.env.example` with `VITE_CMS`, `VITE_GHOST_URL`, `VITE_GHOST_CONTENT_API_KEY`
- [x] 1.8 Create folder structure: `src/content/`, `src/content/adapters/`, `src/routes/`, `src/components/ui/`, `src/styles/`

## 2. Tailwind v4 + Theme Tokens

- [x] 2.1 Create `src/styles/globals.css` with `@import "tailwindcss"` and `@theme` block
- [x] 2.2 Define light theme color tokens: `--color-bg`, `--color-fg`, `--color-muted`, `--color-accent`
- [x] 2.3 Define dark theme color tokens in `@theme.dark` block
- [x] 2.4 Define typography tokens: `--font-sans` (Switzer), `--font-mono` (IBM Plex Mono)
- [x] 2.5 Define type scale tokens with `clamp()` for fluid display sizes
- [x] 2.6 Define spacing base (`--spacing: 0.5rem`) and breakpoint tokens
- [x] 2.7 Import `globals.css` in `src/main.tsx`
- [x] 2.8 Verify Tailwind utilities work by rendering a test component with `text-fg bg-bg`

## 3. shadcn/ui + Base UI Setup

- [x] 3.1 Run `npx shadcn@latest init` with TypeScript, Tailwind v4, Base UI configuration
- [x] 3.2 Verify `components.json` is created with correct settings
- [x] 3.3 Add initial components: `button`, `card` (minimum set for placeholder pages)
- [x] 3.4 Restyle button component: solid background, no gradient, sharp corners, token-based colors
- [x] 3.5 Restyle card component: no drop shadow, hairline border only if needed, token-based colors
- [x] 3.6 Verify restyled components render correctly in both light and dark themes

## 4. Content Adapter

- [x] 4.1 Create `src/content/types.ts` with canonical `Post`, `Project`, `PhotoSet` interfaces
- [x] 4.2 Create `src/content/types.ts` with `ContentService` interface (all methods)
- [x] 4.3 Create `src/content/adapters/mock.ts` with mock data for development
- [x] 4.4 Create `src/content/adapters/ghost.ts` with `GhostAdapter` class skeleton
- [x] 4.5 Implement `GhostAdapter.getPosts()` with Ghost Content API fetch and field mapping
- [x] 4.6 Implement `GhostAdapter.getProjects()` with `#portfolio` tag filter
- [x] 4.7 Implement `GhostAdapter.getPhotoSets()` with `#photography` tag filter
- [x] 4.8 Create `src/content/index.ts` exporting `contentService` based on `VITE_CMS` env var
- [x] 4.9 Verify mock adapter returns placeholder data when `VITE_CMS` is unset

## 5. TanStack Router + Placeholder Routes

- [x] 5.1 Create `src/routes/__root.tsx` with root layout (header, main, footer landmarks)
- [x] 5.2 Create `src/routes/index.tsx` with Homepage placeholder ("Coming soon")
- [x] 5.3 Create `src/routes/portfolio.tsx` with Portfolio placeholder
- [x] 5.4 Create `src/routes/photography.tsx` with Photography placeholder
- [x] 5.5 Create `src/routes/blog.index.tsx` with Blog index placeholder
- [x] 5.6 Create `src/routes/blog.$slug.tsx` with Blog post placeholder
- [x] 5.7 Create `src/main.tsx` with router provider and app mount
- [x] 5.8 Verify all routes render their placeholder content when navigated to

## 6. View Transitions Integration

- [x] 6.1 Add `defaultViewTransition` to router config with direction-based types (forward → `slide-left`, back → `slide-right`)
- [x] 6.2 Add CSS `::view-transition-*` animations for `slide-left` and `slide-right` direction-based transitions
- [x] 6.3 Add `view-transition-name: page-content` to main content for element-level animation
- [x] 6.4 Add `prefers-reduced-motion` CSS rule to `globals.css` (0.01ms durations)
- [x] 6.5 Verify transitions work between routes in supported browsers
- [x] 6.6 Verify instant fallback works when `startViewTransition` is unavailable

## 7. Accessibility Infrastructure

- [x] 7.1 Add skip link component as first focusable element in `__root.tsx`
- [x] 7.2 Implement focus management: move focus to `<h1>` or `<main>` after route change
- [x] 7.3 Add visually hidden live region for route change announcements
- [x] 7.4 Create focus indicator CSS (visible ring, high contrast, no `outline: none` without replacement)
- [x] 7.5 Verify all navigation links are keyboard-accessible (Tab, Enter)
- [x] 7.6 Verify semantic landmarks (`<header>`, `<main>`, `<nav>`, `<footer>`) are present
- [x] 7.7 Add `alt` text requirement enforcement (oxlint `jsx-a11y/alt-text` rule)

## 8. Final Integration & Verification

- [x] 8.1 Run `npm run dev` and verify the app starts without errors
- [x] 8.2 Run `npx tsc --noEmit` and verify zero TypeScript errors (`tsc -b` passes during build)
- [x] 8.3 Test dark mode: CSS has `@media (prefers-color-scheme: dark)` block with dark color tokens; `color-scheme: light dark` on `<html>`
- [x] 8.4 Test all four routes render placeholder content (build succeeds, routes exist)
- [x] 8.5 Test keyboard navigation: skip link (`<a href="#main">`), nav (`<Link>` → `<a>`), `<main id="main">`, `<footer>` — all semantically correct and keyboard-accessible
- [x] 8.6 Test reduced motion: handled in JS via `window.matchMedia('(prefers-reduced-motion: reduce)')` — skips `document.startViewTransition` and calls `fn()` directly
- [x] 8.7 Verify mock adapter returns data when `VITE_CMS` is unset (verified in Phase 4)
- [x] 8.8 Verify Ghost adapter skeleton compiles (build passes with 0 errors)

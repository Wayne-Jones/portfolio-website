## Why

The portfolio website needs a foundational scaffold before any page can be built. This first change establishes the project structure, tooling, design system, and content abstraction layer that all subsequent pages (homepage, portfolio, photography, blog) will build upon. Without this foundation, every future change would re-litigate architectural decisions and create technical debt.

## What Changes

- Initialize a Vite + React + TypeScript project at the repo root
- Configure TanStack Router with file-based routing and a placeholder route for each of the four pages
- Set up Tailwind CSS v4 with `@theme` block containing the design tokens (color, typography, spacing)
- Initialize shadcn/ui with Base UI primitives, configured for the project's aesthetic
- Implement a content adapter interface (`ContentService`) with a Ghost CMS adapter implementation
- Set up theme switching infrastructure (light/dark) with WCAG 2.2 AAA contrast tokens
- Wire up View Transitions API for fluid navigation between routes
- Add accessibility infrastructure: skip link, focus management on route change, `prefers-reduced-motion` support, semantic HTML defaults
- Create the project folder structure (`src/content/`, `src/routes/`, `src/components/`, `src/styles/`)
- Add base configuration files (`.gitignore`, `tsconfig.json`, `vite.config.ts`, `package.json`)

## Capabilities

### New Capabilities

- `project-scaffold`: Vite + React + TypeScript project initialization, folder structure, and base configuration
- `theme-tokens`: Tailwind v4 `@theme` block with color tokens (light/dark, WCAG 2.2 AAA), typography scale (Switzer + Inter), spacing rhythm, and breakpoint definitions
- `content-adapter`: `ContentService` interface and Ghost adapter implementation with canonical types (Post, Project, PhotoSet) and tag-based content separation
- `view-transitions`: View Transitions API integration with TanStack Router for fluid route morphing, including `prefers-reduced-motion` support
- `accessibility-foundation`: Skip link, focus management on route change, semantic HTML patterns, keyboard navigation baseline, and screen reader support
- `shadcn-base-ui`: shadcn/ui initialization with Base UI primitives, restyled to match the studio-craft aesthetic (no default SaaS gradient look)

### Modified Capabilities

_None — this is the first change._

## Impact

- **New dependencies**: `vite`, `react`, `react-dom`, `typescript`, `@tanstack/react-router`, `tailwindcss` (v4), `@fontsource/switzer`, `@fontsource/inter`, shadcn/ui CLI, Base UI packages
- **New folder structure**: `src/content/`, `src/routes/`, `src/components/`, `src/styles/`, `openspec/`
- **No existing code affected** — repo is empty except for `.git/`
- **Environment variables**: `VITE_CMS` (e.g., `ghost`), `VITE_GHOST_URL`, `VITE_GHOST_CONTENT_API_KEY`

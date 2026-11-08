# Project Scaffold

## Purpose

Define the foundational project structure, tooling, and configuration for the Vite + React + TypeScript portfolio application.

## Requirements

### Requirement: Vite + React + TypeScript project initialization

The project SHALL be initialized as a Vite + React + TypeScript project at the repository root (`./portfolio-website`).

#### Scenario: Project is runnable

- **WHEN** `pnpm install && pnpm dev` is executed
- **THEN** a Vite dev server starts and serves a React application on localhost

#### Scenario: TypeScript compilation succeeds

- **WHEN** `npx tsc --noEmit` is executed
- **THEN** no TypeScript errors are reported

### Requirement: TanStack Router with file-based routing

The project SHALL use TanStack Router configured with file-based routing. The route tree SHALL include the homepage, the blog and portfolio listings with their paginated variants, all content detail routes, and the photography index.

#### Scenario: Routes are defined

- **WHEN** the application loads
- **THEN** routes exist for `/`, `/blog`, `/blog/page/$page`, `/blog/$slug`, `/portfolio`, `/portfolio/page/$page`, `/portfolio/$slug`, `/photography`, and `/photography/$slug`

#### Scenario: Placeholder content renders

- **WHEN** navigating to a route
- **THEN** the route renders either its content or an explicit empty/placeholder state for content that is not available yet

### Requirement: Project folder structure

The project SHALL follow the folder structure: `src/content/` (content adapter and snapshot data), `src/routes/` (TanStack Router routes), `src/components/` (shared UI, including article chrome under `src/components/article/` and content leaves under `src/components/content/`), `src/lib/` (shared utilities), and `src/styles/` (Tailwind CSS and theme tokens).

#### Scenario: Folder structure exists

- **WHEN** the project is scaffolded
- **THEN** all five directories exist under `src/`

### Requirement: Base configuration files

The project SHALL include `.gitignore`, `tsconfig.json`, `vite.config.ts`, and `package.json` with all required dependencies.

#### Scenario: Dependencies are declared

- **WHEN** `pnpm install` is executed
- **THEN** every dependency declared in `package.json` installs successfully, including React, Vite, TypeScript, TanStack Router and Start, Tailwind CSS, and Base UI

### Requirement: Environment variable support

The project SHALL support environment variables via Vite's `import.meta.env` for CMS configuration (`VITE_CMS`, `VITE_GHOST_URL`, `VITE_GHOST_CONTENT_API_KEY`).

#### Scenario: Environment variables are accessible

- **WHEN** a `.env` file defines `VITE_CMS=ghost`
- **THEN** `import.meta.env.VITE_CMS` returns `"ghost"` in application code

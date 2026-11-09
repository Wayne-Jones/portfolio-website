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
- **THEN** every dependency declared in `package.json` installs successfully, including React, Vite, TypeScript, TanStack Router and Start, and Tailwind CSS
- **AND** UI primitive packages are declared only when an in-repo component imports them

### Requirement: Environment variable support

The project SHALL support environment variables via Vite's `import.meta.env` for CMS configuration (`VITE_CMS`, `VITE_GHOST_URL`, `VITE_GHOST_CONTENT_API_KEY`).

#### Scenario: Environment variables are accessible

- **WHEN** a `.env` file defines `VITE_CMS=ghost`
- **THEN** `import.meta.env.VITE_CMS` returns `"ghost"` in application code

### Requirement: Continuous integration

The project SHALL run its quality gates in CI on every push and pull request, using the same commands documented for local development.

#### Scenario: CI runs the quality gates

- **WHEN** a commit is pushed or a pull request is opened
- **THEN** CI installs dependencies from the frozen lockfile
- **AND** it runs lint, format check, the TypeScript build, the test suite, and the production build
- **AND** any failing command fails the job

#### Scenario: CI matches local commands

- **WHEN** inspecting the CI workflow and `package.json`
- **THEN** the workflow invokes the repository's own scripts rather than reimplementing them
- **AND** the Node version matches the version the project targets

### Requirement: Dependency and dead-code hygiene

The project SHALL declare only dependencies that shipped code imports, SHALL keep build-only and type-only packages in `devDependencies`, and SHALL not retain unreferenced UI components or their primitive dependencies.

#### Scenario: No unused runtime dependencies

- **WHEN** inspecting `package.json` dependencies
- **THEN** every package is imported by code that ships to the browser or is used at runtime
- **AND** packages used only by build scripts or the Ghost adapter live in `devDependencies`

#### Scenario: No unreferenced UI components

- **WHEN** inspecting `src/components/ui/`
- **THEN** every file is imported by at least one route or component
- **AND** components that nothing uses are deleted along with any dependency that existed only for them

#### Scenario: Scaffold assets are not shipped

- **WHEN** inspecting `src/assets/`
- **THEN** no unused scaffold logo or placeholder asset remains

# project-scaffold Delta

## MODIFIED Requirements

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

## ADDED Requirements

### Requirement: Vite + React + TypeScript project initialization

The project SHALL be initialized as a Vite + React + TypeScript project at the repository root (`D:\Websites\portfolio-website`).

#### Scenario: Project is runnable

- **WHEN** `npm install && npm run dev` is executed
- **THEN** a Vite dev server starts and serves a React application on localhost

#### Scenario: TypeScript compilation succeeds

- **WHEN** `npx tsc --noEmit` is executed
- **THEN** no TypeScript errors are reported

### Requirement: TanStack Router with file-based routing

The project SHALL use TanStack Router configured with file-based routing and placeholder routes for all four pages.

#### Scenario: Routes are defined

- **WHEN** the application loads
- **THEN** routes exist for `/` (Homepage), `/portfolio`, `/photography`, and `/blog`

#### Scenario: Placeholder content renders

- **WHEN** navigating to any route
- **THEN** a placeholder component renders indicating the page is coming soon

### Requirement: Project folder structure

The project SHALL follow the folder structure: `src/content/` (content adapter), `src/routes/` (TanStack Router routes), `src/components/` (shared UI components), `src/styles/` (Tailwind CSS and theme tokens).

#### Scenario: Folder structure exists

- **WHEN** the project is scaffolded
- **THEN** all four directories exist under `src/`

### Requirement: Base configuration files

The project SHALL include `.gitignore`, `tsconfig.json`, `vite.config.ts`, and `package.json` with all required dependencies.

#### Scenario: Dependencies are declared

- **WHEN** `npm install` is executed
- **THEN** all dependencies (vite, react, react-dom, typescript, @tanstack/react-router, tailwindcss, @fontsource/switzer, @fontsource/inter) are installed

### Requirement: Environment variable support

The project SHALL support environment variables via Vite's `import.meta.env` for CMS configuration (`VITE_CMS`, `VITE_GHOST_URL`, `VITE_GHOST_CONTENT_API_KEY`).

#### Scenario: Environment variables are accessible

- **WHEN** a `.env` file defines `VITE_CMS=ghost`
- **THEN** `import.meta.env.VITE_CMS` returns `"ghost"` in application code

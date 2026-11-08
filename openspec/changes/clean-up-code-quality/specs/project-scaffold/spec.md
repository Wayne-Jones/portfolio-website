# Spec Delta

## ADDED Requirements

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

## MODIFIED Requirements

### Requirement: Base configuration files

The project SHALL include `.gitignore`, `tsconfig.json`, `vite.config.ts`, and `package.json` with all required dependencies.

#### Scenario: Dependencies are declared

- **WHEN** `pnpm install` is executed
- **THEN** every dependency declared in `package.json` installs successfully, including React, Vite, TypeScript, TanStack Router and Start, and Tailwind CSS
- **AND** UI primitive packages are declared only when an in-repo component imports them

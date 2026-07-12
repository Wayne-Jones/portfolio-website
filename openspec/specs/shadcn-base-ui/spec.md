# shadcn Base UI

## Purpose

Define how shadcn/ui is configured with Base UI primitives and restyled to match the studio-craft aesthetic.

## Requirements

### Requirement: shadcn/ui initialization

The project SHALL initialize shadcn/ui using the shadcn CLI, configured for TypeScript, Tailwind v4, and Base UI primitives.

#### Scenario: shadcn CLI runs successfully

- **WHEN** `npx shadcn@latest init` is executed with the project's configuration
- **THEN** `components.json` is created at the project root with correct settings

#### Scenario: Base UI is the component source

- **WHEN** inspecting `components.json`
- **THEN** the configuration references Base UI as the primitive library (not Radix UI)

### Requirement: Components are owned in-repo

The project SHALL use shadcn/ui's copy-paste model where components live in `src/components/ui/` and are fully editable.

#### Scenario: Components are in source control

- **WHEN** a component is added via `npx shadcn@latest add`
- **THEN** the component file is created in `src/components/ui/` and committed to the repo

### Requirement: Studio-craft aesthetic restyling

The project SHALL restyle shadcn/ui components to match the studio-craft aesthetic: no gradients, no drop shadows, sharp corners, hairline borders only where structurally needed, and solid color blocks.

#### Scenario: Buttons have no gradient

- **WHEN** inspecting a button component
- **THEN** it uses a solid background color, not a gradient

#### Scenario: Cards have no drop shadow

- **WHEN** inspecting a card component
- **THEN** it has no `box-shadow` or uses `shadow-none`

#### Scenario: Components use sharp corners

- **WHEN** inspecting any component
- **THEN** `border-radius` is `0` or minimal (≤2px) unless the component semantically requires rounding

### Requirement: Component styling uses design tokens

The project SHALL ensure all shadcn/ui components reference the project's design tokens (`text-fg`, `bg-bg`, `text-muted`, `text-accent`) rather than hardcoded colors.

#### Scenario: Component uses token-based classes

- **WHEN** inspecting a restyled button
- **THEN** it uses `bg-accent text-bg` (or equivalent token classes), not hardcoded hex values

# Theme Tokens

## Purpose

Define the design token system using Tailwind CSS v4 `@theme` block, covering colors, typography, spacing, and theme switching for light and dark modes with WCAG AAA contrast.

## Requirements

### Requirement: Tailwind CSS v4 with @theme block

The project SHALL use Tailwind CSS v4 with design tokens defined in a CSS `@theme` block, not a `tailwind.config.js` file.

#### Scenario: Tailwind utilities are available

- **WHEN** a component uses `className="text-fg bg-bg"`
- **THEN** the text color matches the `--color-fg` token and background matches `--color-bg`

#### Scenario: No tailwind.config.js exists

- **WHEN** the project is scaffolded
- **THEN** no `tailwind.config.js` or `tailwind.config.ts` file exists

### Requirement: Light theme color tokens

The project SHALL define light theme color tokens with WCAG 2.2 AAA contrast ratios (minimum 7:1 for normal text).

#### Scenario: Light theme colors meet AAA contrast

- **WHEN** the light theme is active
- **THEN** `bg` is `#ffffff`, `fg` is `#0a0a0b` (19.5:1 contrast), `muted` is `#404046` (7.4:1 contrast), `accent` is `#2b1bb5` (9.0:1 contrast)

### Requirement: Dark theme color tokens

The project SHALL define dark theme color tokens with WCAG 2.2 AAA contrast ratios (minimum 7:1 for normal text).

#### Scenario: Dark theme colors meet AAA contrast

- **WHEN** the dark theme is active
- **THEN** `bg` is `#050507`, `fg` is `#f2f2f5` (18.0:1 contrast), `muted` is `#c2c2c8` (11:1 contrast), `accent` is `#b9a3ff` (7.5:1 contrast)

### Requirement: Typography tokens

The project SHALL define typography tokens using Switzer for display/headings and Inter for body/UI, self-hosted via `@fontsource`.

#### Scenario: Font families are defined

- **WHEN** inspecting the `@theme` block
- **THEN** `--font-sans` is `"Switzer", system-ui, sans-serif` and `--font-mono` is `"IBM Plex Mono", ui-monospace, monospace`

#### Scenario: Type scale uses fluid sizing

- **WHEN** the hero display text renders
- **THEN** it uses `clamp()` for fluid sizing between mobile and desktop without breakpoint jumps

### Requirement: Spacing and breakpoint tokens

The project SHALL define an 8px base spacing rhythm and responsive breakpoints.

#### Scenario: Spacing is 8px-based

- **WHEN** using Tailwind spacing utilities
- **THEN** `p-4` equals 16px (2 × 8px base)

#### Scenario: Breakpoints are defined

- **WHEN** the `@theme` block is inspected
- **THEN** breakpoints exist at `sm` (640px), `md` (768px), `lg` (1024px), `xl` (1280px)

### Requirement: Theme switching infrastructure

The project SHALL support toggling between light and dark themes via a `.dark` class on the root element, respecting `prefers-color-scheme` by default.

#### Scenario: System preference is respected

- **WHEN** the user's OS is set to dark mode and no manual preference is stored
- **THEN** the dark theme is active

#### Scenario: Manual toggle overrides system

- **WHEN** the user manually selects light theme
- **THEN** the light theme is active regardless of OS preference

# Spec Delta

## ADDED Requirements

### Requirement: Single source of base styles

The project SHALL define root typography, spacing, and base element styles in one token stylesheet, with no competing scaffold stylesheet loaded ahead of it.

#### Scenario: Only the token stylesheet sets root typography

- **WHEN** the application loads
- **THEN** the root font size and spacing base come from the token stylesheet alone
- **AND** no legacy scaffold stylesheet sets a competing root font size, spacing scale, or color palette

#### Scenario: Root sizing is continuous

- **WHEN** the viewport crosses the desktop breakpoint at 1024px and 1025px
- **THEN** the root font size and body font size change only through a fluid value
- **AND** no discrete root font-size step occurs at that boundary

## MODIFIED Requirements

### Requirement: Typography tokens

The project SHALL define typography tokens using Switzer for display/headings and Inter for body/UI, self-hosted via `@fontsource`.

#### Scenario: Font families are defined

- **WHEN** inspecting the `@theme` block
- **THEN** `--font-sans` is `"Inter Variable", "Inter", system-ui, sans-serif` (self-hosted via `@fontsource-variable/inter`), `--font-display` is `"Switzer", system-ui, sans-serif` (self-hosted via local `switzer.css`), and `--font-mono` is `"IBM Plex Mono", ui-monospace, monospace` (self-hosted via `@fontsource/ibm-plex-mono`)

#### Scenario: Type scale uses fluid sizing

- **WHEN** body copy or hero display text renders
- **THEN** every responsive type step uses `clamp()` between its mobile and desktop sizes
- **AND** no breakpoint introduces a discrete font-size jump

### Requirement: Spacing and breakpoint tokens

The project SHALL define an 8px base spacing rhythm and responsive breakpoints.

#### Scenario: Spacing is 8px-based

- **WHEN** using Tailwind spacing utilities at any supported viewport
- **THEN** `p-4` equals 16px (2 × 8px base)
- **AND** the value does not change across the 1024px breakpoint

#### Scenario: Breakpoints are defined

- **WHEN** the `@theme` block is inspected
- **THEN** breakpoints exist at `sm` (640px), `md` (768px), `lg` (1024px), `xl` (1280px)

# Spec Delta

## MODIFIED Requirements

### Requirement: Components are owned in-repo

The project SHALL keep shadcn/ui configured with `components.json`, add components on demand into `src/components/ui/` under the copy-paste model, and delete components that no route or component imports.

#### Scenario: Components are in source control

- **WHEN** a component is added via `npx shadcn@latest add`
- **THEN** the component file is created in `src/components/ui/` and committed to the repo

#### Scenario: Components are added only when used

- **WHEN** a UI component is not imported by any route or component
- **THEN** it is not kept in the repository
- **AND** any dependency that existed only for it is removed

#### Scenario: Empty UI directory is valid

- **WHEN** no route or component needs a shadcn/ui primitive
- **THEN** `components.json` remains configured for future additions
- **AND** `src/components/ui/` may be absent from the tree

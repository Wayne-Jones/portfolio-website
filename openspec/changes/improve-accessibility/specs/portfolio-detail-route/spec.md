# Spec Delta

## MODIFIED Requirements

### Requirement: Article header renders project metadata

The portfolio detail page SHALL render, in order: the optional feature image (or empty headline band), the eyebrow label, the title as `<h1>`, and the project metadata line (role, client, year).

#### Scenario: Title renders

- **WHEN** the loaded project has `title`
- **THEN** the header renders `<h1 class="font-display ...">{title}</h1>`

#### Scenario: Metadata row renders role / client / year

- **WHEN** the loaded project specifies `role`, `client`, and `year`
- **THEN** the header renders a metadata row, e.g., `"{role} · {client} · {year}"`
- **AND** any field that is missing contributes an empty placeholder rather than missing semicolons

#### Scenario: Feature image or hero

- **WHEN** the loaded project has `featureImage`
- **THEN** the header renders it as a hero, similar to the blog detail page
- **AND** the image uses `alt=""` because the `<h1>` that follows already names the project
- **AND** if `featureImage` is absent, the header renders an empty headline band instead (so case studies without cover images still render)

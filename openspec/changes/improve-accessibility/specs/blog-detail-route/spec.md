# Spec Delta

## MODIFIED Requirements

### Requirement: Article header renders slugged metadata

The blog detail page SHALL render, in order: the post's feature image, title as an `<h1>`, eyebrow metadata (publish date formatted `MMM YYYY`, optional reading time as `<N> min read`, optional author byline), and tag chips.

#### Scenario: Header renders feature image

- **WHEN** the loaded post has `featureImage`
- **THEN** the header includes the image with intrinsic aspect-ratio preservation
- **AND** the image uses `alt=""` because the `<h1>` that follows already names the post
- **AND** the post title is announced once, from the heading

#### Scenario: Header renders title

- **WHEN** the loaded post has `title`
- **THEN** the header renders `<h1 class="font-display ...">{title}</h1>` styled consistently with the homepage hero

#### Scenario: Header renders metadata

- **WHEN** the loaded post has `publishedAt`, `readingTime`, and `author`
- **THEN** the header renders publish date in `MMM YYYY` format
- **AND** if `readingTime` is set, renders `"{N} min read"` as a secondary line
- **AND** if `author` is set, renders the author byline with an optional avatar
- **AND** the author name renders as text unless the site provides a dedicated author page

#### Scenario: Tag chips render

- **WHEN** the loaded post has `tags[]`
- **THEN** the header renders each tag as a small chip / pill, using the muted color token
- **AND** if `tags` is empty or missing, no tag chip row is rendered

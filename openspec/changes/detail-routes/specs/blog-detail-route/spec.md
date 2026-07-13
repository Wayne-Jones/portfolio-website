# Blog Detail Route

## Purpose

Define the `/blog/$slug` route that loads and renders a single blog post with full body, header metadata, and tag chips.

## Requirements

### Requirement: Page loads the post by slug

The `/blog/$slug` route SHALL load the post corresponding to the slug route parameter via the content service, returning a 404 affordance when the slug does not resolve to any post.

#### Scenario: Loader resolves post
- **WHEN** a user navigates to `/blog/<slug>` for a valid slug
- **THEN** the route's loader resolves the post by calling `contentService.getPost(<slug>)`
- **AND** the post is rendered in the article layout

#### Scenario: Missing post returns 404
- **WHEN** a user navigates to `/blog/<slug>` for an unknown slug
- **THEN** the loader returns null and the route renders the editorial 404 affordance

### Requirement: Article header renders slugged metadata

The blog detail page SHALL render, in order: the post's feature image, title as an `<h1>`, eyebrow metadata (publish date formatted `MMM YYYY`, optional reading time as `<N> min read`, optional author byline), and tag chips.

#### Scenario: Header renders feature image
- **WHEN** the loaded post has `featureImage`
- **THEN** the header includes the image with intrinsic aspect-ratio preservation
- **AND** the image has `alt` text from the canonical `featureImage` alt (the renderer emits an empty alt for decorative feature images, leveraging `image.alt` from the renderer)

#### Scenario: Header renders title
- **WHEN** the loaded post has `title`
- **THEN** the header renders `<h1 class="font-display ...">{title}</h1>` styled consistently with the homepage hero

#### Scenario: Header renders metadata
- **WHEN** the loaded post has `publishedAt`, `readingTime`, and `author`
- **THEN** the header renders publish date in `MMM YYYY` format
- **AND** if `readingTime` is set, renders `"{N} min read"` as a secondary line
- **AND** if `author` is set, renders the author byline with optional avatar and link to author's other posts

#### Scenario: Tag chips render
- **WHEN** the loaded post has `tags[]`
- **THEN** the header renders each tag as a small chip / pill, using the muted color token
- **AND** if `tags` is empty or missing, no tag chip row is rendered

### Requirement: Body content renders via PostBody

The blog detail page SHALL render the post's `content` field by passing it to `<PostBody />`, the canonical-tree renderer.

#### Scenario: PostBody renders canonical tree
- **WHEN** the loaded post has `content: ContentTree`
- **THEN** `<PostBody content={post.content} />` renders the body
- **AND** the renderer walks the tree dispatcher-style per the `content-renderer` capability

#### Scenario: Heading-2 anchors enable in-body navigation
- **WHEN** the `content` tree contains `heading` blocks with `level: 2`
- **THEN** each heading renders with a stable `id` attribute
- **AND** the heading label acts as a clickable anchor link to its `id`

### Requirement: View transition naming ties tile to hero

The blog hero image SHALL declare `viewTransitionName: "blog-<slug>"` so the morph animation between the `BlogCard` on the homepage and this detail page fires automatically.

#### Scenario: Hero declares matching transition name
- **WHEN** the blog detail page mounts at `/blog/<slug>`
- **THEN** the hero image (or its nearest styled image element in the header) has inline style `viewTransitionName: "blog-<slug>"`
- **AND** the matching `BlogCard` on the homepage uses the same `viewTransitionName` value

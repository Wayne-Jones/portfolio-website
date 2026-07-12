## ADDED Requirements

### Requirement: Homepage content adapter exposes typed data

The homepage SHALL source its content from a typed content adapter that exposes projects, photos, and blog posts as strongly typed arrays.

#### Scenario: Adapter exports projects array

- **WHEN** the homepage renders
- **THEN** it reads project data from the adapter's `getFeaturedProjects()` method returning 4 items

#### Scenario: Adapter exports photos array

- **WHEN** the homepage renders
- **THEN** it reads photo data from the adapter's `getFeaturedPhotos()` method returning at least 6 items with varied aspect ratios

#### Scenario: Adapter exports blog posts array

- **WHEN** the homepage renders
- **THEN** it reads blog post data from the adapter's `getRecentPosts()` method returning 3 items

### Requirement: Project shape includes name, role, client, image, and slug

Each project exposed by the adapter SHALL include the project name, a role/discipline tag, the client name, an image URL, and a slug for routing.

#### Scenario: Project fields present

- **WHEN** a project is returned by the adapter
- **THEN** it includes `name` (string), `role` (string), `client` (string), `image` (string URL), and `slug` (string)

### Requirement: Photo shape includes src, alt, and aspect ratio

Each photo exposed by the adapter SHALL include the image source URL, descriptive alt text, and an aspect ratio for masonry layout.

#### Scenario: Photo fields present

- **WHEN** a photo is returned by the adapter
- **THEN** it includes `src` (string URL), `alt` (string), and `aspect` ("portrait" | "landscape" | "square")

### Requirement: Blog post shape includes title, date, read time, and slug

Each blog post exposed by the adapter SHALL include the post title, publication date, read time, and slug for routing.

#### Scenario: Blog post fields present

- **WHEN** a blog post is returned by the adapter
- **THEN** it includes `title` (string), `date` (ISO date string), `readTime` (string), and `slug` (string)

### Requirement: Placeholder content uses realistic copy

The default adapter implementation SHALL use realistic placeholder copy for projects, photos, and blog posts so the homepage reads as intentional rather than stubbed.

#### Scenario: Projects use realistic names

- **WHEN** the default adapter returns projects
- **THEN** project names include realistic examples (e.g. "Northwind Studio", "Halcyon Coffee") rather than generic labels like "Project One"

#### Scenario: Photos use realistic captions

- **WHEN** the default adapter returns photos
- **THEN** photo alt text includes realistic location and year examples (e.g. "Brooklyn, 2025")

#### Scenario: Blog posts use realistic titles

- **WHEN** the default adapter returns blog posts
- **THEN** post titles include realistic editorial examples (e.g. "Designing for the quiet web") rather than generic labels like "Post One"

### Requirement: Skeleton placeholders render while data loads

The homepage SHALL render shimmer skeleton placeholders matching each section's layout while content data is loading.

#### Scenario: Hero skeleton renders

- **WHEN** hero data is loading
- **THEN** a skeleton placeholder matching the hero's layout is shown

#### Scenario: Section skeletons render

- **WHEN** section data is loading
- **THEN** skeleton placeholders matching each section's grid layout are shown

#### Scenario: Skeleton shimmer animates

- **WHEN** skeletons are visible and motion is allowed
- **THEN** they display a gentle shimmer animation

#### Scenario: Skeletons are static under reduced motion

- **WHEN** skeletons are visible and `prefers-reduced-motion: reduce` is set
- **THEN** they render as static gray fills without shimmer

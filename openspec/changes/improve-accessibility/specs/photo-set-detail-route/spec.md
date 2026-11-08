# Spec Delta

## MODIFIED Requirements

### Requirement: Header renders photo set metadata

The photo set detail page SHALL render: title, location, camera, publish date, and optional cover image. The body of the photo set's `content` field renders via `<PostBody />` if present.

#### Scenario: Header renders title and metadata

- **WHEN** the loaded photo set has `title`, `location`, `camera`, `publishedAt`
- **THEN** the header renders title and a metadata line containing location and camera

#### Scenario: Cover image renders

- **WHEN** the loaded photo set has `coverImage`
- **THEN** the cover image is rendered above the image grid with `FigureImage`-style Cloudinary optimization
- **AND** the cover uses `alt=""` because the adjacent `<h1>` already names the set
- **AND** the set title is announced once, from the heading

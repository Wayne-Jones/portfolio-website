# content-renderer Delta

## ADDED Requirements

### Requirement: Article chrome is composed outside the renderer

The renderer SHALL contain only content-tree components. Article chrome — headers, metadata, tag chips, listings, and pagination — SHALL live under `src/components/article/` and compose `<PostBody />` for the body instead of extending the renderer.

#### Scenario: Routes compose chrome around the renderer

- **WHEN** a route renders an article or listing
- **THEN** the body comes from `<PostBody content={...} />`
- **AND** the surrounding header, metadata, chips, and pagination come from `src/components/article/`

#### Scenario: Adding a block does not touch chrome

- **WHEN** a new `ContentBlock` type is added
- **THEN** only the renderer's leaf components and dispatcher change
- **AND** article chrome is unaffected

## MODIFIED Requirements

### Requirement: FigureImage detects Cloudinary URLs and emits srcset

The `FigureImage` component SHALL detect URLs pointing at `res.cloudinary.com/<cloudName>/image/upload/...` (where `<cloudName>` is configured via the `VITE_CLOUDINARY_CLOUD_NAME` env var) and SHALL emit a `srcset` derived from the source URL by inserting Cloudinary transformation tokens (`c_scale,w_<N>/`) at the standard image-variant position.

#### Scenario: Cloudinary URL produces srcset

- **WHEN** `<FigureImage />` receives an `image` node with `src` matching the Cloudinary pattern
- **THEN** the rendered `<img>` element has `srcset="..."` containing width variants `w_400`, `w_800`, `w_1200`, and `w_1600` with `c_scale`
- **AND** the `src` attribute is the variant URL closest in width to the responsive size

#### Scenario: Non-Cloudinary URL falls back

- **WHEN** the `src` URL does not match the configured Cloudinary pattern
- **THEN** the rendered `<img>` element uses the original `src` as both `src` and as a fallback
- **AND** includes `loading="lazy"` and `decoding="async"` attributes

#### Scenario: Lazy loading by default

- **WHEN** an `image` block or article hero is rendered through `FigureImage`
- **THEN** the produced `<img>` element sets `loading="lazy"` and `decoding="async"`
- **AND** eager or priority loading for above-the-fold images is not part of this component's contract

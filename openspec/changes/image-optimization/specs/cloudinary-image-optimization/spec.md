# Cloudinary Image Optimization

## Purpose

Optimize how Cloudinary-hosted images are served across the site: format negotiation, width-based `srcset`, blur-up LQIP placeholders, hero priority hints, and CSS-background contexts — all without changing the canonical `ContentTree` shape or adapter layer.

## Requirements

### Requirement: Cloudinary URL detection

Image-emitting components SHALL detect URLs that contain the configured Cloudinary cloud name segment (`res.cloudinary.com/<VITE_CLOUDINARY_CLOUD_NAME>/image/upload/`) and SHALL emit transformed URLs using Cloudinary URL tokens.

#### Scenario: Detection requires the env var
- **WHEN** `VITE_CLOUDINARY_CLOUD_NAME` is set to a non-empty string
- **THEN** image-components match URLs containing that cloud name and apply transform tokens

#### Scenario: Non-Cloudinary URLs fall back
- **WHEN** the `src` URL does not contain the configured cloud name
- **THEN** the component passes the URL through unmodified

### Requirement: Inline image srcset with width variants

When rendering an inline `image` block, the component SHALL emit a `srcset` with widths `400`, `800`, `1200`, `1600`, generated from the source Cloudinary URL using `c_scale,w_<N>` insertion at the standard variant position.

#### Scenario: Inline srcset contains all four widths
- **WHEN** `FigureImage` renders an inline image with a Cloudinary URL
- **THEN** the resulting `<img>` element has `srcset` containing `w_400`, `w_800`, `w_1200`, and `w_1600` entries, each with `2x` density descriptors

#### Scenario: Default sizes attribute
- **WHEN** no `sizes` prop is provided
- **THEN** `FigureImage` renders the `sizes` attribute `(min-width: 768px) 720px, 100vw`

### Requirement: Hero image srcset with extended widths

When rendering a hero image (priority=true), the component SHALL emit a `srcset` with widths `400`, `800`, `1200`, `1600`, `2400`, and `3200`, denoting currently meaningful retina-aware variants.

#### Scenario: Hero srcset contains six widths
- **WHEN** `FigureImage` renders a hero image (priority=true) with a Cloudinary URL
- **THEN** the resulting `<img>` element has `srcset` containing `w_400`, `w_800`, `w_1200`, `w_1600`, `w_2400`, and `w_3200` entries

#### Scenario: Extended sizes for hero
- **WHEN** no `sizes` prop is provided on a hero image
- **THEN** `FigureImage` renders the `sizes` attribute `(min-width: 1024px) 1024px, 100vw`

### Requirement: Hero priority hints

When rendering a hero image, the component SHALL set `fetchpriority="high"`, `loading="eager"`, and `decoding="sync"` on the rendered `<img>` so the browser prioritizes loading the hero before deferring other content.

#### Scenario: Hero image declares high priority
- **WHEN** `FigureImage` renders a hero image
- **THEN** the `<img>` element has `fetchPriority="high"`, `loading="eager"`, and `decoding="sync"`

#### Scenario: Inline image declares default lazy
- **WHEN** `FigureImage` renders a non-hero image
- **THEN** the `<img>` element has `loading="lazy"` and `decoding="async"`, and no `fetchpriority` attribute

### Requirement: HeroImage wrapper component

A `<HeroImage>` component SHALL wrap a `FigureImage` with `priority` enabled, an `aspect` prop for the hero's expected aspect ratio (so the layout reserves space and prevents CLS), and a default accessible alt-text fall-back if the upstream image node lacks `alt`.

#### Scenario: HeroImage locks aspect ratio
- **WHEN** `<HeroImage node={image} aspect="16/9" />` is rendered
- **THEN** the rendered element has `aspect-ratio: 16/9` styling on the wrapper

#### Scenario: HeroImage passes through to FigureImage
- **WHEN** `<HeroImage>` mounts
- **THEN** the inner `<img>` is a `FigureImage` with `priority=true`
- **AND** if `node.alt` is empty, the `<img>`'s `alt` is the empty string with `aria-hidden="true"` flagging the wrapper as decorative-only

### Requirement: Blur-up LQIP via tiny blurred variant

A hero image SHALL be rendered initially with a tiny heavily-blurred variant as a placeholder (created from the same base Cloudinary URL with `w_40,e_blur:1000,q_auto,f_auto` inserted) and SHALL fade out the placeholder once the real image's `onload` fires.

#### Scenario: Blur-up placeholder renders in DOM
- **WHEN** a hero image first renders
- **THEN** the wrapper renders a placeholder `<img>` with `src=<tiny blurred URL>`, `alt=""`, `aria-hidden="true"`, and `className` for blur/scale styling

#### Scenario: Placeholder fades out on load
- **WHEN** the real hero image's `onload` event fires
- **THEN** the placeholder's opacity transitions to 0 (or the placeholder is removed)
- **AND** the real image's opacity transitions from 0 to 1

#### Scenario: Blur-up is for hero contexts only
- **WHEN** `FigureImage` renders a non-hero image
- **THEN** no blur-up placeholder is rendered

### Requirement: BackgroundImage component

A `BackgroundImage` component SHALL apply Cloudinary URL transformations to inline-styled CSS background contexts.

#### Scenario: BackgroundImage emits optimized inline style
- **WHEN** `<BackgroundImage src={cloudinaryUrl} />` renders
- **THEN** the rendered `<div>` has `style.backgroundImage: url(<transformed URL>)` with `c_scale,w_1200,f_auto` inserted (or size matching the parent's expected dimensions)
- **AND** the rendering includes `background-size: cover` and `background-position: center` baseline

#### Scenario: BackgroundImage without src
- **WHEN** the `src` prop is empty or undefined
- **THEN** the component renders no `background-image` styling whatsoever

### Requirement: useCloudinaryImage hook consolidates variants

A `useCloudinaryImage(url, options)` hook SHALL centralize Cloudinary URL transformations and variant generation, so component-level components do not need to manage transformer token math.

#### Scenario: Hook returns variants
- **WHEN** called with a Cloudinary URL and a `{ widths, format: "auto", quality: "auto" }` options object
- **THEN** it returns `{ src, srcset, sizes, lqip, isCloudinary }` derived from the input

#### Scenario: Hook skips transformations for non-Cloudinary URLs
- **WHEN** called with a URL not matching the Cloudinary pattern
- **THEN** it returns `{ src: <original>, srcset: <original>, sizes: <default>, lqip: null, isCloudinary: false }` and does not modify the URL

### Requirement: Existing users continue to work

The change SHALL NOT alter the public API of `FigureImage` beyond adding new optional props. Existing call sites render unchanged when the new props are unspecified.

#### Scenario: Backward-compatible defaults
- **WHEN** `<FigureImage node={image} />` is rendered with no other props (as in `content-renderer`)
- **THEN** the renderer still emits the existing srcset with `w_400`/`w_800`/`w_1200`/`w_1600` and the default `sizes` attribute

#### Scenario: No breaking change in tree shape
- **WHEN** inspecting the canonical `ContentTree`
- **THEN** the `image` block has the same `src`, `alt`, `caption`, `width`, `height` fields as before

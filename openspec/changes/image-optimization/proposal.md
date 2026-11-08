## Why

The renderer in `content-format` already detects Cloudinary URLs and emits a `srcset` with several width variants inside `FigureImage` for inline post images. But detail-page heroes — the blog cover, the portfolio feature image, and the photo-set cover — render through the same `FigureImage` with no priority hints, so the browser treats the largest image on the page like any other. The hero also ships without `f_auto`/`q_auto` negotiation and without a low-quality placeholder. On a portfolio site, hero images dominate Largest Contentful Paint, and cold loads pay for a full-size transfer before paint.

Homepage and index tiles already render real images through `TileMedia`, which uses the shared Cloudinary helpers. That component is not a CSS-background context, so this change does not need a separate background-image component.

The change deepens `FigureImage` itself rather than adding a pass-through hero wrapper: every detail hero already reaches the renderer through `ArticleHeader` → `FigureImage`, so `priority` plus the existing image node data is enough to cover blog, portfolio, and photography heroes with one component.

## What Changes

- Add a `priority?: boolean` prop to `FigureImage`. When true, the rendered `<img>` gets `fetchpriority="high"`, `loading="eager"`, and `decoding="sync"`, and emits the extended hero width set (`400`, `800`, `1200`, `1600`, `2400`, `3200`). The default remains four widths with lazy loading.
- Add a `sizes?: string` prop with context-aware defaults: `(min-width: 1024px) 1024px, 100vw` for priority heroes and `(min-width: 768px) 720px, 100vw` for inline images.
- Add an optional `aspectRatio?: string` prop. Priority heroes reserve layout from the image node's `width`/`height` attributes; `aspectRatio` is the explicit override when the caller has no intrinsic dimensions.
- Add `f_auto,q_auto` to generated Cloudinary variants so the CDN negotiates AVIF/WebP and automatic quality. Already-transformed URLs still pass through untouched.
- Add Cloudinary blur-up LQIP support: priority Cloudinary images render a tiny `w_40,e_blur:1000,q_auto,f_auto` placeholder behind the real image and remove it once the real image loads. The real image stays visible, so the hero does not depend on hydration to paint.
- Add a `useCloudinaryImage(url, options)` hook that returns `{ src, srcSet, sizes, lqip, isCloudinary }` and consolidate the transform math there. `FigureImage` and `TileMedia` both consume it.
- Opt detail heroes into priority rendering through `ArticleHeader` (blog, portfolio, and photography detail routes).
- Document the Cloudinary setup, env var, variant widths, and hero behavior in the README.

This change does **not** change the renderer's canonical tree shape (the `image` block is unchanged). It deepens the leaf components that consume it.

## Capabilities

### New Capabilities

- `cloudinary-image-optimization`: Utilities and component-level behavior that read Cloudinary URLs and emit optimized variants — width-based `srcset`, `f_auto`/`q_auto`, blur-up LQIP, priority hints, and hero layout reservation.

### Modified Capabilities

- None.

## Impact

- New env var usage: `VITE_CLOUDINARY_CLOUD_NAME` (the Cloudinary cloud name, e.g. `demo`). Already documented; this change uses it more thoroughly.
- Generated variant URLs gain `f_auto,q_auto`; the existing `c_scale,w_<N>` segment is preserved.
- Hero images emit up to six `srcset` widths instead of four, plus one tiny LQIP request.
- `FigureImage` gains three optional props; existing call sites and the canonical `ContentTree` are unchanged.
- Performance characteristics improve:
  - Hero LCP improves (priority fetch + correctly sized variants).
  - CLS becomes predictable (intrinsic dimensions or an explicit aspect ratio).
  - Cloudinary bandwidth drops because the browser selects a width instead of always fetching the original.

## Scope corrections

The original artifacts were written before `detail-routes` and `photography-gallery` landed. This revision:

- replaces the `HeroImage` wrapper requirement with priority behavior on `FigureImage` (no pass-through component);
- removes the `BackgroundImage` requirement (no CSS-background image contexts remain; tiles use `<img>` through `TileMedia`);
- corrects the inline srcset scenario to use `w` width descriptors, not `2x` densities;
- corrects the `node` prop wording to the existing `image: GalleryImage` API;
- bases layout reservation on the image's `width`/`height`, with `aspectRatio` as an override, instead of requiring a fixed ratio for every hero.

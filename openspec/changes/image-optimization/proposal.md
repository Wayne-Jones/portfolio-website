## Why

The renderer in `content-format` already detects Cloudinary URLs and emits a `srcset` with several width variants inside `FigureImage` for inline post images. But hero images on detail pages (`blog.$slug`, `portfolio.$slug`, `photography.$slug`) and cover images on photo sets are also fetched from Cloudinary — they currently ship as a single URL without optimization. On a portfolio site, hero images dominate the Largest Contentful Paint metric, and the home page's contact/work tiles already use unoptimized background images for their hover-overlay treatments. Without dedicated optimization, Cloudinary traffic scales linearly with visits and the LCP score on cold loads suffers.

This change layer extends the renderer with hero-image–specific responsive behavior (priority hints, `fetchpriority="high"`, webp/avif negotiation), a `BackgroundImage` Cloudinary helper for the homepage tile overlays, blur-up LQIP placeholders for hero images, and a pre-computed "expected aspect ratio" hook to keep CLS low.

## What Changes

- Extend `FigureImage` with a `priority` prop and `sizes` prop. When `priority=true`, the rendered `<img>` has `fetchpriority="high"`, `loading="eager"`, and a `decoding="sync"` attribute. The default sizes attribute covers a fixed bucket scheme.
- Add hero-image variants (1600/2400/3200 pixel widths) emitted when `priority=true`, alongside the existing 400/800/1200/1600 widths used for inline images.
- Add Cloudinary blur-up LQIP support: the `FigureImage` component fetches a tiny `w_40,e_blur:1000,q_auto,f_auto` variant by URL-pattern, displays it as a placeholder, fades it out on `onload`, and removes it from the DOM.
- Add a `BackgroundImage` component for homepage hero/tile overlays. It applies the same Cloudinary URL detection and resolution to inline-styled layers.
- Add a `<HeroImage>` wrapper dedicated to detail-page heroes: same as `FigureImage priority=true` plus a fixed aspect ratio (using inline `<img>` with `aspectRatio` or a Tailwind `aspect-*` class) to lock CLS.
- Add a `useCloudinaryImage` hook consolidating image-variant generation so the homepage and detail pages share logic.
- Document the Cloudinary setup, env vars, and how to add new image contexts in the README.

This change does **not** change the renderer's canonical tree shape (the `image` block is unchanged). It deepens the leaf components that consume it.

## Capabilities

### New Capabilities
- `cloudinary-image-optimization`: A small set of utilities and component-level behaviors that read Cloudinary URLs and emit optimized variants — width-based `srcset`, blur-up LQIP, priority hints, hero-aspect-ratio CLS prevention.

### Modified Capabilities
- None.

## Impact

- New env var usage: `VITE_CLOUDINARY_CLOUD_NAME` (= `cl_xxxxxxx`). Already documented in the previous change; this change uses it more thoroughly.
- Renders slightly more variants in HTML (srcset with up to 6 widths on hero images, vs. 4 previously).
- New hook in `src/components/content/lib/cloudinary.ts` for variant generation.
- Two new leaf components in the renderer (`HeroImage`, `BackgroundImage`) used by detail routes and the homepage.
- Performance characteristics improve:
  - Hero LCP improves (smaller initial fetch due to `fetchpriority="high"` + sized variants).
  - CLS becomes more predictable (locked aspect-ratio + blur-up).
  - Total Cloudinary bandwidth drops (browser picks the right variant via `srcset` rather than always fetching the original).

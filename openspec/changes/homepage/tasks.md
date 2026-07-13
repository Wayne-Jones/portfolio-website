## 1. Foundation & Assets

- [x] 1.1 Create `src/components/home/` directory structure with subfolders for hero, work-portfolio, photography, blog, contact-footer, and shared primitives
- [x] 1.2 Add portrait placeholder asset to `public/portrait-placeholder.svg`
- [x] 1.3 Add shared `Section` primitive component (`src/components/home/shared/Section.tsx`) with eyebrow + hairline rule + title + children pattern
- [x] 1.4 Add `outlined-text` utility class to `src/index.css` using `-webkit-text-stroke` with Firefox fallback

## 2. Content Adapter

- [x] 2.1 Add `Photo` type to `src/content/types.ts` with `src`, `alt`, and `aspect` fields
- [x] 2.2 Add `getFeaturedProjects(limit)`, `getFeaturedPhotos(limit)`, and `getRecentPosts(limit)` methods to `ContentService` interface
- [x] 2.3 Implement the new methods in the mock adapter with realistic placeholder data (4 projects, 6+ photos with mixed aspects, 3 blog posts)
- [x] 2.4 Implement the new methods in the Ghost adapter (delegating to existing tag-based filtering)
- [x] 2.5 Update `src/content/index.ts` to export the new types

## 3. Hero Section

- [x] 3.1 Create `Hero` component (`src/components/home/hero/Hero.tsx`) with intro, headline, location, and portrait
- [x] 3.2 Apply mixed solid + outlined treatment to the two-line headline
- [x] 3.3 Implement responsive overlap (desktop) vs. vertical stack (mobile <640px)
- [x] 3.4 Apply fluid typography using `clamp()` for the headline
- [x] 3.5 Add alt text to the portrait image
- [x] 3.6 Verify WCAG AAA contrast in both light and dark modes

## 4. Work Portfolio Section

- [x] 4.1 Create `WorkPortfolio` section component (`src/components/home/work-portfolio/WorkPortfolio.tsx`)
- [x] 4.2 Create `WorkTile` component (`src/components/home/work-portfolio/WorkTile.tsx`) with 4:3 aspect ratio and 8px corners
- [x] 4.3 Implement asymmetric grid (first tile spans 2 columns on desktop, 2 columns on tablet, 1 column on mobile)
- [x] 4.4 Add hover state that reveals metadata overlay (name, role, client)
- [x] 4.5 Use `view-transition-name` on each tile for click-through morphing
- [x] 4.6 Wire up link to `/portfolio/<slug>` using existing TanStack Router pattern
- [x] 4.7 Add skeleton placeholder matching the grid layout

## 5. Photography Section

- [x] 5.1 Create `Photography` section component (`src/components/home/photography/Photography.tsx`)
- [x] 5.2 Create `PhotoTile` component (`src/components/home/photography/PhotoTile.tsx`)
- [x] 5.3 Implement CSS columns-based masonry layout preserving intrinsic aspect ratios
- [x] 5.4 Add subtle hover zoom (1.02–1.05) on photos
- [x] 5.5 Use `view-transition-name` on each photo for click-through morphing
- [x] 5.6 Wire up link to `/photography` using existing TanStack Router pattern
- [x] 5.7 Add skeleton placeholder matching the masonry layout

## 6. Recent Blog Posts Section

- [x] 6.1 Create `RecentPosts` section component (`src/components/home/blog/RecentPosts.tsx`)
- [x] 6.2 Create `BlogCard` component (`src/components/home/blog/BlogCard.tsx`) with title, date, and read time
- [x] 6.3 Implement 3-column grid on desktop, single column on mobile
- [x] 6.4 Use `view-transition-name` on each card for click-through morphing
- [x] 6.5 Wire up link to `/blog/<slug>` using existing TanStack Router pattern
- [x] 6.6 Add skeleton placeholder matching the grid layout

## 7. Contact Footer

- [x] 7.1 Create `ContactFooter` component (`src/components/home/contact-footer/ContactFooter.tsx`)
- [x] 7.2 Render massive display statement "Let's work together"
- [x] 7.3 Render email link with arrow (`hello@wayne.me →`) using the accent color
- [x] 7.4 Verify link opens mail client with correct subject/prefill

## 8. Motion System

- [x] 8.1 Create `useReveal` hook (`src/components/home/shared/useReveal.ts`) using IntersectionObserver
- [x] 8.2 Apply reveal data attributes to each section
- [x] 8.3 Add CSS for reveal transition (opacity + transform) honoring `prefers-reduced-motion`
- [x] 8.4 Add hero entrance animation (intro → headline → location → portrait, staggered)
- [x] 8.5 Add hero portrait scroll parallax using `requestAnimationFrame` and scroll position
- [x] 8.6 Add shimmer keyframe animation for skeleton placeholders
- [x] 8.7 Verify all motion is disabled under `prefers-reduced-motion: reduce`

## 9. View Transitions Integration

- [x] 9.1 Confirm existing view-transitions infrastructure supports `view-transition-name` per element
- [x] 9.2 Add unique `view-transition-name` per work tile, photo tile, and blog card
- [x] 9.3 Ensure destination routes declare matching `view-transition-name` on their hero images
- [x] 9.4 Verify transitions fall back gracefully when API is unsupported

## 10. Navigation Integration

- [ ] 10.1 Inspect `src/routes/__root.tsx` to understand existing nav structure
- [ ] 10.2 Ensure homepage links to `/portfolio`, `/photography`, and `/blog` exist in the nav
- [ ] 10.3 Add homepage link/logo to the nav if missing

## 11. Homepage Composition

- [ ] 11.1 Rewrite `src/routes/index.tsx` to compose all sections in the correct order: Hero → WorkPortfolio → Photography → RecentPosts → ContactFooter
- [ ] 11.2 Apply generous section spacing (≥96px desktop, ≥64px mobile)
- [ ] 11.3 Verify the page is keyboard-navigable with visible focus states
- [ ] 11.4 Verify all images have alt text
- [ ] 11.5 Verify the page renders correctly in both light and dark modes
- [ ] 11.6 Verify the page renders correctly from 320px to 2560px viewport widths

## 12. Verification

- [ ] 12.1 Run `pnpm dev` and visually confirm homepage matches the brief
- [ ] 12.2 Run `pnpm build` and confirm no TypeScript or build errors
- [ ] 12.3 Run `pnpm lint` (if configured) and resolve any warnings
- [ ] 12.4 Test keyboard navigation through all sections
- [ ] 12.5 Test with `prefers-reduced-motion: reduce` enabled in DevTools
- [ ] 12.6 Test light and dark mode rendering
- [ ] 12.7 Test mobile rendering at 375px and 320px widths
- [ ] 12.8 Test view transitions by clicking work tiles, photos, and blog cards

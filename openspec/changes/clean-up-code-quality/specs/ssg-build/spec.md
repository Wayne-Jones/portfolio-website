# Spec Delta

## ADDED Requirements

### Requirement: Malformed snapshot fails prerender enumeration

The build SHALL distinguish a missing snapshot file from a malformed one. A missing file MAY produce no dynamic pages for that type; a file that exists but cannot be parsed, or that is not an array, SHALL fail the build with the file name and parse error.

#### Scenario: Missing snapshot file

- **WHEN** `src/content/data/posts.json` does not exist
- **THEN** the build continues and enumerates no blog detail pages
- **AND** it does not report a parse error

#### Scenario: Malformed JSON fails the build

- **WHEN** a snapshot file exists but contains invalid JSON
- **THEN** the build fails
- **AND** the error names the file and includes the parse failure

#### Scenario: Wrong root shape fails the build

- **WHEN** a snapshot file parses but is not a JSON array
- **THEN** the build fails
- **AND** the error names the file and states that an array was expected

## MODIFIED Requirements

### Requirement: Root entry adapts to the SSG pipeline

The project SHALL expose the router through a `getRouter()` factory in `src/router.tsx` so both the build-time render pass and the client hydration share one router definition, with the HTML document produced by the root route.

#### Scenario: router.tsx exports a router factory

- **WHEN** inspecting `src/router.tsx`
- **THEN** it exports a `getRouter()` function creating the router from `routeTree.gen.ts` with the existing options (`defaultPreload: "intent"`, `defaultViewTransition: true`, `trailingSlash: "never"`), the `startViewTransition` override, and the `Register` module augmentation
- **AND** `src/main.tsx` and the standalone `index.html` template are removed (the root route renders the document)

#### Scenario: Root route renders the HTML document

- **WHEN** inspecting `src/routes/__root.tsx`
- **THEN** it renders `<html>`/`<head>`/`<body>` with `HeadContent` and `Scripts`, and declares meta/favicon via a `head` export

#### Scenario: Unknown paths render the 404 UI

- **WHEN** a browser requests a path that was not pre-rendered
- **THEN** a `$.tsx` splat route renders the not-found UI instead of the static host's default 404

#### Scenario: Dev mode serves SSR pages

- **WHEN** `pnpm dev` or `pnpm dev:ghost` is invoked
- **THEN** the Start dev server renders pages server-side with HMR, using `MockAdapter`/`GhostAdapter` per `VITE_CMS`

#### Scenario: Route render errors show a recoverable page

- **WHEN** a route component or loader throws an unexpected error at runtime
- **THEN** the router renders a shared error component inside the site shell
- **AND** the error page offers a way to retry or return home instead of showing a blank document
- **AND** the error is logged for diagnosis

# TelecomAI Lab coding instructions

## Scope and workflow

- Read [README](README.md) and the relevant guide: [architecture](docs/architecture.md),
  [development](docs/development.md), or [content management](docs/content-management.md).
  Inspect affected implementation and tests before editing.
- Work on a separate branch; preserve unrelated local changes. Never commit, push,
  deploy, or dispatch workflows without authorization. Local builds are allowed.
- Preserve current design, responsiveness, accessibility, content, IDs, URLs, and
  relationships unless explicitly requested. Use English in source and docs. Avoid
  unrelated refactoring or upgrades; keep Zod and TypeScript aligned and avoid `any`.
- Current stack: Astro 7, Tailwind 4, Zod 4, TypeScript 6, Node >=22.12. Recheck manifests.

## Content contracts

- Fictional samples must remain visible in **normal local development**. Keep active
  data under `src/`, `isMock`, and record-specific demo/illustration labels. Do not
  restore global banners or hide samples behind fixture mode. Never present invented
  academic information as verified; leave unknown real fields blank.
- JSON is authoritative for People, Publications, Research, News, Talks, Funding,
  Materials, and Lab Life albums (`src/data/gallery.json`). Preserve official `file()`
  loaders and `getCollection()` consumers.
  Funding/Materials are currently Zod-validated modules, not Astro collections.
- People biographies are separate Markdown rendered with `getEntry()`/`render()`.
  Keep metadata in JSON, native Astro images, initials fallback, preferred names,
  current/alumni support, and shared group/order behavior. No real photos for fake people.
- Relationships use explicit stable IDs only; never infer `personId` from names.
  Preserve legacy IDs; use positive numeric IDs for new People/Publications. External
  authors need no member record. Profiles show all associated publications without a cap.
- Publication types and research topics are separate. Store canonical `venue` and
  `citationCount`; aliases are derived. Preserve badges, featured overrides, filters,
  sorting, author names/headshots, optional resources, BibTeX, and stable anchors.
- Keep figure rights fail-closed. Draft/future articles generate no routes or sitemap
  entries. Scheduling uses UTC build dates. Talks require explicit offsets/IANA zones;
  calendar actions require a supplied end after the start. Never invent a duration.
- `generate:demo` overwrites curated files; never run it as routine validation.
  Imports only report candidates and must not silently overwrite curated records.

## Interface contracts

- Navigation: People, Research, Funding, Publications, Talks & Seminars, Resources,
  About. Resources contains Materials (`/mare`), Blog, Notes. About contains Contact Us
  then Lab Life. `/contact` and `/lab-life` were removed without redirects. News stays
  contextual; `/figures` stays valid. Preserve the 80rem navigation breakpoint.
- Lab Life uses one JSON event with a photos array per album; no Markdown per photo.
  Only this section now uses real uploaded photos; its old mock records were removed.
  Random covers stay within their event; photo featured limits cover candidates, while
  featuredHome independently controls Home. Preserve album-only navigation and thumbnails.
- Keep shared container widths; constrain only profile biography prose. Research
  descriptions come from JSON without publication lists. Preserve gallery accessibility.
- Keep the original lower footer attribution/dynamic year and all nine icons; seven
  social destinations are labeled `.invalid` placeholders pending verified links.
- Pagefind derives from rendered HTML through the Astro build integration. Preserve
  stable anchors, exclusions/deduplication, keyboard/focus behavior, lazy loading, and
  race protection. Development uses the last built index.
- Resolve light/dark/auto in the inline head bootstrap before styles. Preserve guarded
  storage, OS/cross-tab updates, semantic tokens, reduced motion, and focus behavior.
  Do not invert images or scatter palette overrides across pages.

## Validation and maintenance

- Run `npm run build`, then `npx astro check`, then relevant tests (`npm test` runs all).
  Retain useful regression coverage; fixture inputs are not production assets.
- Check affected links, routes, assets, downloads, and local pages. Report browser
  limitations honestly: DOM simulations and contrast tests are not visual screenshots.
- Update the three maintained guides instead of adding task-history documents. Remove
  files only with evidence of non-use, including collections, dynamic loading, and tests.
- Do not commit outputs/caches/dependencies/secrets/screenshots or change deployment
  settings incidentally. Existing Actions can publish automatically. Leave requested
  local servers available for review.

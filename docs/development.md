# Development and validation

## Commands

Use Node >=22.12 and `npm ci` for the lockfile-pinned dependencies.

| Command | Purpose |
| --- | --- |
| `npm run dev` | Ordinary local site at `http://localhost:4321`, including visible demo records |
| `npm run build` | Validate content and generate static pages, assets, sitemap, and Pagefind |
| `npx astro check` | Astro/TypeScript diagnostics |
| `npm test` | All existing unit, rendered-output, and DOM interaction tests; build first |
| `npm run preview -- --port 4322` | Inspect the built artifact locally |
| `npm run test:people` | Member schemas, assets, biographies, IDs, profiles, enrichment safeguards |
| `npm run test:publications` | Publication schemas, relationships, filters, citations, imports, cards |
| `npm run test:editorial` | Scheduling, drafts, relations, Markdown/math/code, filters |
| `npm run test:ui` | Calendar/DST/ICS, News, Research, gallery, footer, About, links/assets |
| `npm run test:search-theme` | Actual Pagefind WASM, theme/storage, navigation/search keyboard and races |
| `npm run test:site` | Built sample pages, counts, navigation, usable downloads |
| `npm run check:links` | External DOI/URL checks for curated papers |
| `npm run enrich:orcid` | Dry-run ORCID suggestions; details below |
| `npm run refresh:citations` | Refresh the separate citation store using configured Scholar credentials |
| `npm run import:pi -- --help` | Read-only PI CSV conversion and row-level review report |
| `npm run import:publications -- --help` | Review-only JSON import workflow |

Run build, then Astro check, then tests. Build-based tests read `dist/`; stale output
can hide source changes. Keep a dev server for content/UI review and use preview for
the actual search artifact. Rebuild after content edits to refresh dev's search index;
restart dev after changing integration middleware. If Astro 7 retains old collection
schemas, stop dev before removing only generated `.astro/data-store.json`, then restart.
Never delete JSON/Markdown sources to fix a cache. `astro sync --force` may refresh a
different cache than an active dev server. `npm run dev -- --force` can restart an
already-running project server.

## Tests and artifact boundaries

Tests use Node's built-in runner with TypeScript stripping, Cheerio for rendered HTML,
small DOM simulations, and the generated Pagefind runtime. There is no Python or
browser-testing dependency. Unit tests cover invalid inputs and pure behavior;
build tests protect output/relationships; interaction simulations protect keyboard,
filter, lightbox, and asynchronous behavior. Retain these complementary checks.

Historical records in `tests/fixtures` do not determine normal website content.
Their four biographies and two original JPEG headshots remain regression dependencies.
The old figure/legacy-publication fixtures are retained as migration reference data;
they are not active collection sources and no dedicated test currently consumes them.
Public fixture downloads are still inputs to the optional wrapper below. Test files,
docs, scratch files, and `node_modules` are outside `public/` and are not copied into
the static artifact. Intended examples in `public/files/` are public downloads.

Optional `dev:fixtures`, `build:fixtures`, `check:fixtures` use the same active content
but isolate output/cache/public staging in `.fixture-dist`, `.astro-fixtures`, and
`.fixture-public`. `scripts/fixtures.mjs` stages public files and fixture downloads.
`prebuild` prevents fixture mode overwriting ordinary `dist/`. These directories are
ignored/regenerable; they are not required to see the mock website.

Visual review still needs a working browser host. Check desktop/tablet/mobile sizes,
both color schemes, controls, console errors, and real URLs/downloads when available.
DOM assertions and contrast calculations do not establish screenshot appearance.
External link verification may require network access; `.invalid` social links are
intentional placeholders, not functioning accounts.

## Metadata tools

Publication imports accept structured JSON and print reports only. DOI checks use
Crossref; manual review remains required. See [content management](content-management.md).

`enrich:orcid` reads curated DOI/PMID metadata from Crossref/PubMed and considers only
members already explicitly referenced on that publication. It uses normalized names
to rank ORCID suggestions, **never** to establish publication membership. Default is
dry run; `--write` fills empty ORCID links for its strongest matches, and
`--include-partial` permits lower-confidence matches only after review. Ambiguities
and conflicts remain unresolved; existing values are not overwritten. `--email=…`
or `CONTACT_EMAIL` supplies an API contact. Verify suggestions against primary sources,
especially abbreviated/compound names; social/profile links need independent review.

`npm run refresh:citations` reads publications and writes **only**
`src/data/citations.json` atomically; it never edits publications, authors or Scholar
links. `SERPAPI_KEY` and `SCHOLAR_AUTHOR_ID` enable the
[SerpAPI Google Scholar Author API](https://serpapi.com/google-scholar-author-api).
Pagination follows `serpapi_pagination.next` (including `start`/`cstart`); HTTP/API,
invalid payload, repeated-token or safety-limit failures retain the entire saved
snapshot. Matches require a unique normalized title with a compatible supplied year;
ambiguous entries retain saved values. A curator-supplied Scholar citation URL can
disambiguate matching titles. Unmatched/invalid counts stay unchanged, new unknown
counts are null, and zero remains valid. This profile-based source does not guarantee
coverage of every lab paper; do not invent counts for unmatched work.

`SERPAPI_FIXTURE` supplies an article-array/response for isolated tooling tests. The
citation suites inject HTTP responses and temporary directories; they need no API
key, spend no quota, and verify that publication bytes never change. Do not run
writing/enrichment tools as routine cleanup validation. The destructive demo generator
has been retired to protect curated People/Publications.

## Existing deployment reference

This describes existing configuration; changing it or publishing requires approval.
Do not dispatch deployment workflows as a test.

- `.github/workflows/deploy.yml` runs on `main` pushes or manual dispatch. The Astro
  action v6 uses Node 22, builds/uploads `dist`, then deploy-pages publishes it.
- `.github/workflows/refresh-citations.yml` runs Monday 08:00 UTC or manually. If
  citation data changes it stages/commits only `src/data/citations.json`, rebases over
  concurrent metadata edits without force-pushing, then builds and deploys. Repository secret
  `SERPAPI_KEY` and variable `SCHOLAR_AUTHOR_ID` configure it. Without credentials
  or during API failures the refresh is a no-op. Human edits to the citation file
  itself can still conflict; bibliographic edits no longer share the bot's file.
- Pages source must be GitHub Actions when this workflow is used. Neither a local
  build nor preview runs these workflows.
- `astro.config.mjs` still uses `https://example.com`; `public/robots.txt` also has
  a placeholder sitemap URL. There is currently no `public/CNAME`. For an approved
  custom domain, align Astro `site`, CNAME, Pages domain/HTTPS, DNS, and robots.
  Project-subpath hosting additionally needs a full root-relative URL audit before
  configuring `base`; simply changing that option is insufficient for this codebase.
  Do not carry out domain/deployment changes incidentally.

## Maintenance decisions

The cleanup consolidated eight overlapping feature/history guides into
[architecture](architecture.md), this guide, and [content management](content-management.md).
The Simple Icons license remains separate. README is the quick start; SETUP and
CLAUDE remain short entry points because workflows/external tooling may reference them.

Removed code had no callers: FigureCard, SectionHeading, the template PipelineHero,
its commented homepage example, obsolete research-group descriptions/query, unused
demo-mode calculations, and unused export surfaces. Two unreferenced stock gallery
JPEGs, five obsolete template screenshots, populated-directory `.gitkeep` markers,
and the generator alias wrapper were removed. Duplicate `generate:fixtures` and
`test:production` aliases were dropped; `test:site` remains the rendered site check.
The later curated-data migration retired the destructive demo generator entirely.
TypeScript exclusions for absent legacy directories were removed. Stale isolated
fixture outputs/caches were deleted; the retained wrapper recreates them when needed.
All substantive tests and dependencies were retained: every dependency has a current
build, rendering, script, or validation consumer. Standard `npm test` runs every suite.

Retain public icon variants even where current markup does not name them: browser or
external consumers may request these conventional URLs. Retain historical fixture
records for migration reference and test headshots for actual test usage. Avoid
deleting an asset based only on whether it appears in a current page screenshot.

Remaining limitations include intentional mock content/social placeholders, static
scheduling and dev search snapshots, manual import/identity review, no automatic application of CSV plans or
arbitrary BibTeX parser, and no access control for “by request” materials. Rendered
counts and profile associations are checked against current data; type/role edge
cases remain covered by independent fixtures rather than requiring the old demo roster.

## Partial sample removal and private working files

`src/lib/mock-references.ts` resolves only `isMock: true` records for rendering.
Missing member/publication references produce contextual build messages; unavailable
links are omitted from the loaded view while source JSON/Markdown stays unchanged.
Author names and flags remain, and an ID-only missing speaker/author gets an explicit
not-listed label. Valid explicit IDs are never reassigned by name. Real records,
duplicate IDs/DOIs, malformed metadata, assets, and imports retain strict validation.
People/Publications no longer use this resolver: both are curated-only strict schemas.
To restore a sample link later, restore its referenced record or deliberately correct
the source ID after verification; do not fabricate a member to satisfy a pointer.

After changing collection schemas/loaders, use `npm run dev -- --force` to restart
the project server if it retains an old in-memory snapshot. A successful build tests
the production artifact; verify the affected live local URLs too.

`.gitignore` excludes generated output, dependencies, local environment files (except
example environment templates), caches, logs, coverage/browser-test reports, TypeScript
build metadata, and root `.local/`. Use the **future ignored destination** `.local/`
for private returns, review reports, and working notes. No files were moved there
automatically. Keep source data/assets, package-lock, tests/fixtures, scripts, and
maintained documentation versioned because clean-checkout builds/tests need them.
They are not all copied into `dist`; GitHub repository contents and Pages output are
different things. `.gitignore` cannot hide an individual field inside a JSON/CSV file
or stop tracking a file already in Git. For example, hardware reviewNotes are omitted
from public cards but remain visible in a public source repository unless separately
curated into private storage. Review such fields before publishing the repository.

PI import tests cover multiline/BOM CSV parsing, preservation of every baseline
record, identity/configuration conflicts, missing files and idempotent reruns.
Hardware rendered tests cover optional-field fallbacks, exact reported values,
internal-note exclusion, shared category/search filtering and announced counts.
Run `npm run import:pi > /private/tmp/telecomai-pi-review.json` to review future
returns; it has no write flag. Keep reports outside public/build inputs.
Use the content guide for held records and manual metadata/asset editing.


## Event album checks

Lab Life now reads src/data/gallery.json through file(), one event with photos per
record. test:ui includes gallery schema/selection and rendered/interaction suites.
They cover all nine current uploaded images, missing/duplicate/empty records, honest
year-only dates, independent featured/featuredHome pools, optimized asset references,
event-only thumbnail navigation/wrapping, category counts, dismissal and focus.
The old per-photo gallery interaction fixture was replaced with multi-event scenarios.
Browser-host unavailability must still be reported; DOM simulations are not a visual
browser review. After changing this loader, restart dev with npm run dev -- --force
if it retains the former Markdown collection snapshot.

## Research taxonomy validation

Research schema checks reject mock flags and retired direction IDs. Build validation
requires every publication area to resolve to an actual Research record. Retained
Funding examples keep their mock labels but use current area IDs; Materials taxonomy
tags were updated without changing downloads or deleting examples. Rendered tests
derive Research counts/images from JSON, rather than the former eight-section demo.
Publication fixtures use canonical topic IDs while historical archives remain intact.

## Curated News checks

News is curated-only and bypasses the mock-reference resolver. Its strict schema
rejects isMock; missing explicit member/publication IDs still fail validation.
Rendered tests cover day/month/year dates on both Home and News, chronological
selection, valid profile/paper anchors and absence of demo announcements. Search
counts follow eligible source records rather than the old ten-entry example feed.
The read-only CSV planner emits News candidates without mock fields.

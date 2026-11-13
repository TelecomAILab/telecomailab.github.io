# Architecture

## Runtime and source map

The site uses Astro static output, Tailwind 4 through Vite, Zod schemas, and small
bundled DOM scripts. There is no server adapter, UI framework, database, authentication,
or CMS. Frontmatter resolves content at build time; browser scripts handle filtering,
navigation, galleries, search, and appearance. Check `package.json` for exact versions.

| Concern | Implementation |
| --- | --- |
| Collections and pre-load integrity checks | `src/content.config.ts` |
| Structured records | `src/data/` |
| Markdown biographies/articles/figures | `src/content/` |
| Collection queries, ordering, relationships | `src/lib/content.ts`, `src/lib/editorial.ts` |
| Typed schemas | `src/lib/*-schema.ts` |
| Funding/Materials/Hardware schemas and relationships | `src/lib/lab-schemas.ts`, `src/lib/lab-data.ts` |
| Publication badges, citations, queries, review imports | `src/lib/publication-{authors,format,query,import}.ts` |
| Independent citation records and read-time join | `src/data/citations.json`, `src/lib/citations.ts` |
| Shared shell | `BaseLayout.astro`, `SEO.astro`, `Nav.astro`, `Footer.astro` |
| Identity, contacts, navigation, social links | `src/data/site.ts` |
| Shared CSS and appearance | `src/styles/global.css`, `src/styles/themes.css` |

Official Astro `file()` loaders read People, Publications, Research, News, Talks, and
Gallery event albums. Official `glob()` loaders read biographies, Blog, Notes, and figures.
Funding, Materials and Hardware are validated JSON modules, **not** Astro collections. Hardware lives only in `src/data/hardware.json` and joins the existing `/mare` grid/filter/count/search flow through `HardwareCard.astro`; it adds no navigation item. Local equipment assets are discovered by a native Astro image glob. Internal review notes are removed from the public hardware model. No active
CV overlay, author override file, or Markdown publication/member source competes with
centralized records. `content-sources.ts` only names active source paths; fixture
commands isolate output rather than select a different roster.
See [content management](content-management.md) for fields and authoring.

## Identity, queries, and assets

Astro normalizes IDs to strings. People URLs use stable IDs; preferred names do not
change them. Publication-specific author names/order remain authoritative. Only an
explicit `personId` connects an author to a member; external/unresolved authors omit
it. Current, former, and alumni profiles show all associated papers without a cap.
Group order comes from `PERSON_GROUPS`, then numeric member `order`; status does not
replace that ordering. The curated roster was deliberately rekeyed to 100–112
(order 1–13); all explicit references were migrated together. These IDs now define
profile URLs; future edits must not renumber them. People/Publications/Research/News reject `isMock`;
other collections retain labeled examples and their mock-reference resolver.

Structured member data stays in JSON; Markdown-only biographies resolve through
`getEntry()` and `render()`. Collection `image()` helpers and Astro `Image`/`getImage`
process assets relative to the owning JSON/Markdown. Missing headshots use initials;
missing optional publication illustrations use a neutral fallback. Raw import records
retain string image paths; bibliographic helpers use `PublicationMetadata`, excluding
the processed image representation.

Publication filters combine type/topic/year/role/access/featured/search with AND
semantics. Preserve newest/oldest/citation sorting, deterministic ties, unknown counts,
reset, announced counts, mobile controls, and legacy hashes. Search includes title,
author, venue, keywords, and linked members' full/preferred names. Canonical `venue`
produces the derived `journal` alias. Citation counts live only in `citations.json`,
not bibliographic records. Its unique publication ID and nullable nonnegative integer
are validated before loading. The Publications schema transform joins counts into
`citationCount`/`citations`, preserving `getCollection("publications")` consumers. Null
or an absent row means unknown; zero is a confirmed zero. Orphan/duplicate citation
IDs fail validation. The weekly writer matches unambiguous Scholar titles/years or
an explicitly supplied citation link and writes only the independent count store.
`publicationRole` (`pi`, `senior`, `mentee`) drives shared badges; legacy assertions
remain compatible. Explicit `featured` overrides the automatic mentee/PI policy
(excluding reviews/letters and retaining the 2019 threshold). Homepage selection is
capped at five; profiles are uncapped. Only the main Publications list emits
`#publication-<id>` anchors, avoiding duplicates when papers appear elsewhere.

Figures reference publication IDs and render only with explicit `rightsConfirmed:
true`. Queries group by paper and order figure numbers parsed from captions;
graphical abstracts lead. Keep citation/licensing metadata even on unconfirmed
entries. Gallery uses one JSON event record with a photos array, explicit optional
member IDs, and native Astro image processing. `gallery-schema.ts` validates IDs,
references, dates, nonempty albums, duplicate photos, and file existence. Dates can
be an honest year only with a seasonal dateLabel, or an exact ISO day. Events sort
newest first, then explicit order/ID for ties. Current Lab Life uses the nine uploaded
2025/2026 photos in three real albums; its former mock Markdown and SVGs were removed.

`GalleryGrid` prepares optimized WebP responsive thumbnails/full views with getImage.
Stable initial HTML is enhanced with a fresh random cover per album on each browser
load. Photo `featured` limits the cover candidate pool; without it every photo is
eligible. Home uses only photo `featuredHome`, selected independently, and links to
`/about#event-<id>`. No home candidate means no Home image. These flags never filter
photos out of the album. One native dialog renders only the selected event's photos,
with thumbnails, count, wrapping arrows, keyboard, Escape/backdrop close and focus
restoration. Category filters count events rather than individual photos. No image
paths are hand-written into generated /_astro URLs; Astro owns optimization.
`public/files/` downloads are copied directly, without image optimization or access control.

## Routes and layout

| Routes | Purpose |
| --- | --- |
| `/`, `/people`, `/people/<id>` | Home, grouped roster, profiles |
| `/research`, `/funding`, `/publications`, `/figures` | Research descriptions, projects, papers, permitted figures |
| `/mare` | Materials & Resources catalogue |
| `/news`, `/talks`, `/talks/<id>.ics` | Announcements, events, eligible calendar downloads |
| `/blog`, `/blog/<slug>`, `/notes`, `/notes/<slug>` | Published long-form content |
| `/about#contact`, `/about#lab-life` | Contact Us and Lab Life |
| `/404.html` | Not-found page |

No publication-detail route exists. `/contact` and `/lab-life` were intentionally
removed without redirects. Blog/Notes drafts and future articles generate neither
detail routes nor sitemap entries. Slugs define public article URLs.

`BaseLayout` loads Inter/Newsreader, SEO, CSS, Nav, content, and Footer. Shared
`container-page` is max-width 6xl; only profile biography prose is max-width 3xl.
Blog/Notes headers/covers/body use max-width 5xl and prose 92ch; code, equations,
tables, and figures can use the wider space. Markdown supports highlighted code,
local images, tables, links, and KaTeX through official Unified processing with
remark-math/rehype-katex. KaTeX CSS/fonts are local; MDX is not configured.

Research now contains three supplied directions plus planned Open tools & datasets
(`methods`). Legacy topic-one/two/three and theory IDs are rejected in content;
`research-aliases.ts` preserves old Research bookmarks and publication filter hashes.
Publication areas and Funding areas use the current directions; publication topics
were reviewed against supplied titles/abstracts, with empty lists for unrelated work.
Research images use intrinsic proportions (full width, automatic height), a neutral
border and surface, and native Astro optimization. They have no forced aspect ratio,
colored letterboxing, distortion or crop.

Home shows the six latest dated News items and shared Research summaries. News uses
the shared UTC day/month/year formatter on both Home and the yearly News archive;
its strict schema rejects mock flags and validates explicit member/paper references. Research
uses image/text descriptions from JSON without paper lists. About uses one BaseLayout,
`ContactSection` then `LabLifeSection`, stable anchors, an accessible h1, h2 section
headers, and h3 gallery titles. `PageHeader` defaults to h1 elsewhere and accepts
optional heading level/ID. Contact/map data stays in site config. Research images are optional when no approved asset exists. Funding permits unknown administrative fields and uses a separate status-unsupplied section; names alone never establish member IDs. Resources preserve
category/search counts, downloads, maintainers, and paper anchors; an explicit hidden
selector prevents flex display overriding filters.

Seven configured navigation items are People, Research, Funding, Publications,
Talks & Seminars, Resources, About. Typed `NavLink | NavGroup` supplies desktop/mobile
together. Resources is a disclosure containing Materials, Blog, Notes; About is a
direct link. News is contextual; Figures remains reachable. `NavigationResources`
and `navigation.ts` handle click/touch, outside/focus/Escape dismissal, arrow/Home/End,
focus restoration, selection, and breakpoint cleanup. Desktop starts at 80rem;
mobile links have 44px targets and a scrollable `100dvh - 4rem` menu. Search/theme
controls stay outside collapsed links; desktop disclosure does not shift page content.

Footer upper rows show lab, affiliation, and nine icons. The original lower copyright,
technology attribution, responsive spacing, and dynamic year remain. Scholar/GitHub
links are preserved; seven missing destinations use labeled reserved
`placeholder.invalid` URLs. No RSS feed exists.

## Calendars, search, and appearance

Talk timestamps require an offset or `Z` and a validated IANA zone (default
Europe/Luxembourg). Display respects the zone and DST. Calendar actions/files require
an explicit positive duration. Google/Outlook compose links and ICS share metadata;
UTC instants preserve event times. ICS uses stable UIDs, DTSTAMP, escaping, CRLF,
and Unicode-safe 75-octet folding per [RFC 5545](https://www.rfc-editor.org/rfc/rfc5545).
Import creates a copy, not a subscription; provider links depend on visitor accounts,
with ICS as the portable fallback. Period filters use the current browser clock;
initial HTML remains static.

`integrations/search-index.mjs` indexes rendered public HTML at `astro:build:done`,
including direct Astro builds in Actions. Output is `dist/pagefind/` (or isolated
fixture output), never a second curated dataset. Stable `data-search-entry`,
`data-search-title`, `data-search-category`, and optional `data-search-extra` mark
cards. `data-search-page` selects primary bodies; `data-search-ignore` excludes
repeats. Missing/duplicate anchors or Pagefind errors fail the build.

The index includes public member/article pages, papers, projects, resources, Research,
News, Talks, Figures, home introduction, and both About sections. It excludes duplicate
listings/profile papers, controls, navigation/footer, BibTeX, related blocks,
404/noindex, drafts, future articles, downloads, and calendars. Curated records and
retained examples remain searchable; counts are derived from current content. The native search dialog
lazy-loads local Pagefind/WASM, supports Cmd/Ctrl+K outside editable fields, keyboard
results, focus restoration, empty/error/retry/more states, and stale-response protection.
Same-page results navigate freshly to clear filters. Paths respect Astro base handling.
Dev serves the **last build's** index. See [Pagefind Node API](https://pagefind.app/docs/node-api/)
and [browser API](https://pagefind.app/docs/api/).

`theme-init.js` runs inline after charset and before styles. It restores
`telecomai-theme` (`light`, `dark`, `auto`, default auto), sets HTML attributes/native
color-scheme before paint, guards storage failures, listens for OS changes, and
synchronizes tabs. Appearance controls retain keyboard/radio/focus behavior.
`themes.css` centralizes semantic surfaces/text/links/borders and a palette bridge
for existing utilities. New components should use semantic tokens. Images are never
inverted; Shiki GitHub Dark remains in both modes; third-party map contents control
their own appearance. Transitions respect reduced motion. See
[Tailwind dark mode](https://tailwindcss.com/docs/dark-mode).

## Asset provenance

Original Research vectors are concept illustrations, not paper figures or photographs.
Unused fictional member avatars were removed with the mock roster; the historical
JPEG headshots remain test dependencies.
Lab Life now uses user-supplied event photographs; no person identities are inferred
from faces, and original uploaded files remain unchanged. Nine social paths are vendored from
[Simple Icons 11.15.0](https://github.com/simple-icons/simple-icons/tree/11.15.0/icons)
under [CC0](LICENSE-Simple-Icons.md), with 24×24 currentColor SVGs and accessible link
labels; no icon package/CDN is needed. Template credit and the original
[MIT license](../LICENSE) remain.

Structural references: [WINLAB sponsorship](https://www.winlab.rutgers.edu/sponsors/),
[BU CNRLab resources](https://sites.bu.edu/cnrlab/lab-resources/),
[IDEAS Lab Research](https://www.gokcincinar.com/research/) and
[navigation](https://www.gokcincinar.com/). Their descriptions, images, grants,
partners, and achievements are not represented as TelecomAI's.

## PI CSV conversion

`scripts/import-pi-data.ts` is a read-only planner for the available PI returns. It
reports candidates, duplicate/conflicting identities, unsupported columns and source
notes; deliberate append edits remain separate. It never rewrites curated JSON or
biographies. People/Publications retain optional source URLs without manufacturing
verification receipts. Unknown publication roles remain unset; real papers without a reviewed PI role or explicit collaboration assertion receive no inferred collaboration badge. Explicit legacy badges remain compatible. Existing official
Astro loaders and `getCollection()` consumers remain authoritative. See the content
guide for exact mappings, held rows, hardware fields and image instructions.

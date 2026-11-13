# Content management

## Sources and editing rules

The Zod schemas and collection registration are the field/type authorities. This
guide explains editing and relationships; [architecture](architecture.md) explains
rendering, and [development](development.md) lists checks/tooling. Normal local
development displays the sample records directly, without fixture mode.

| Content | Authoritative source | Schema | Route |
| --- | --- | --- | --- |
| People | `src/data/people.json` | `src/lib/people-schema.ts` | `/people`, `/people/<id>` |
| Biographies | `src/content/biographies/*.md` | Empty structured frontmatter | Member profile |
| Publications | `src/data/publications.json` | `src/lib/publication-schema.ts` | `/publications#publication-<id>` |
| Citation counts | `src/data/citations.json` | `src/lib/citations.ts` | Joined into publication cards |
| Research | `src/data/research.json` | `src/lib/research-schema.ts` | `/research#<id>` |
| Funding | `src/data/funding.json` | `src/lib/lab-schemas.ts` | `/funding` |
| Materials | `src/data/resources.json` | `src/lib/lab-schemas.ts` | `/mare` |
| Hardware | `src/data/hardware.json` | `src/lib/lab-schemas.ts` | `/mare#resource-<id>` |
| News | `src/data/news.json` | `src/lib/editorial-schema.ts` | `/news#news-<id>` |
| Talks & Seminars | `src/data/talks.json` | `src/lib/editorial-schema.ts` | `/talks#talk-<id>` |
| Blog / Notes | `src/content/blog/**/*.md`, `src/content/notes/**/*.md` | `src/lib/editorial-schema.ts` | `/blog/<slug>`, `/notes/<slug>` |
| Lab Life albums | `src/data/gallery.json` | `src/lib/gallery-schema.ts` | `/about#lab-life`, `/about#event-<id>` |
| Figures | `src/content/figures/**/*.md` | `src/content.config.ts` | `/figures` |

Keep IDs stable. New People/Publications IDs are positive integers; legacy string
IDs remain valid and Astro normalizes them to strings. Other JSON IDs follow their
schema; do not renumber existing records. Keep article slugs stable. Relationships
store IDs, never duplicate member profiles or publication metadata. Do not infer
member identity from names. External authors/speakers can supply names without IDs.

When selectively removing demo records, keep remaining example sources intact.
The loader resolves missing relationships only for `isMock: true` entries: it logs
the source/ID and omits invalid links from the rendered view, without writing to
JSON/Markdown. Names/flags remain; unknown ID-only example speakers/authors are labeled
not listed. Strict reference validation still applies to real data and imports.
Do not reuse an old person ID for a different identity without reviewing every
publication/project reference: a valid ID is not proof that its displayed name is
the intended researcher. Correct uncertain mappings manually, never by fuzzy matching.

People/Publications now contain 13 curated members and 43 curated papers; their
strict schemas reject `isMock`. Research, Funding, Materials, News, Talks, Blog and
Notes retain record-specific labeled examples and their mock flags. Do not remove
these examples during People/Publications edits or hide them behind fixture mode.
Lab Life uses three real event albums with nine uploaded photos from 2025/2026.
Omit unknown fields in real records; do not invent missing information.

The destructive demo generator and its npm command were removed to protect curated
data. Legacy migration fixtures under `tests/fixtures` remain separate regression/
reference inputs, not another active publication/member source.

## People and biographies

| Field | Meaning |
| --- | --- |
| `id`, `name` | Stable unique ID and full name; both required |
| `displayName` | Optional preferred name; does not change URL or publication author text |
| `status`, `group`, `role` | Required current/alumni status, `PERSON_GROUPS` value, academic role text |
| `publicationRole` | Optional `pi`, `senior`, `mentee`; omission means unknown and drives no role badge |
| `title`, `affiliation`, `researchInterests` | Optional strings and interest list (default empty) |
| `biography`, `headshot` | Optional Markdown entry ID and local asset path |
| `sourceUrls` | Optional HTTP(S) source evidence; not an independent verification receipt |
| `links` | Optional email, website, scholar, orcid, linkedin, github, twitter; use schema-valid values |
| `order`, `featured` | Numeric display order (default 0), featured flag (default false) |

Shared `PERSON_GROUPS` includes leadership, scientists, postdocs, PhD/master's,
interns, collaborators, guests, former members, alumni, and legacy Faculty/Researchers/
Staff/Students/Affiliates groups. Use exact schema values. Directory ordering follows
that list, then `order`, rather than alphabetical or automatic status regrouping.

Put long-form biography text in `src/content/biographies/<id>.md` and set `biography`
to that ID. No structured member fields belong in biography frontmatter. Markdown
formatting remains supported. Headshots normally use `../assets/people/<file>` relative
to `people.json`; native Astro assets preserve optimization. Omitting a headshot
renders initials. Do not use a real person's photograph for a fictional profile.
Historical fixture IDs such as `jane-doe` are not active members.

The deliberate roster migration follows the user-supplied file order:

| New ID | Previous ID | Member | Order |
| --- | --- | --- | --- |
| 100 | 1000 | Vu Ha | 1 |
| 101 | 1001 | Symeon Chatzinotas | 2 |
| 102 | 1004 | Ti Ti Nguyen | 3 |
| 103 | 1005 | Duc-Dung Tran | 4 |
| 104 | 1006 | Dinh-Hieu Tran | 5 |
| 105 | 1007 | Ons Aouedi | 6 |
| 106 | 1008 | Muhammad Awais | 7 |
| 107 | 1009 | Suleima Briseno Ramirez | 8 |
| 108 | 1010 | Van Thieu NGUYEN | 9 |
| 109 | 1011 | Huruy ZERIHUN | 10 |
| 110 | 2016 | Bjorn Ottersten | 11 |
| 111 | 2020 | Thanh-Dung Le | 12 |
| 112 | 2001 | Kha Hung Nguyen | 13 |

These IDs define the current `/people/<id>` URLs; old IDs were replaced, not retained
as aliases. Do not renumber again when changing display order. The next new member
can use 113 if still unused. Biography entry IDs/filenames need not match person IDs.
Sara Kim and five other mock profiles were removed. Thanh-Dung Le remains without
the incorrectly attached “[Demo] Zoe…” biography, as confirmed by the curator.
Six previously saved real biographies were moved from numeric filenames to the
correct member-named files, replacing demonstration/template text; Ti Ti Nguyen's
real biography was retained. Members 107–112 have no supplied matching biography
and omit that optional reference. Their profiles and publications still render.

Pending manual identity checks (no automatic assignments were made):

- Members 101 and 106 currently supply the same Google Scholar URL. Confirm Muhammad
  Awais's link before changing either source field.
- Unlinked Bjorn/Björn Ottersten author names occur in `wang2026multi`,
  `nguyen2026digital`, `zaeem2026closed`, `nguyen2026joint`, `wang2026statistical`,
  `he2025spatio`, `khan2024deep`, `wang2021completion`, `mehrizi2021trend`,
  `lei2020deep`, `mehrizi2020online`, `lei2019learning`, and
  `tsakmalis2018constrained`. Confirm whether each should reference member 110.
- `tran2023multi` has unlinked author names Duc-Dung Tran and Vu Nguyen Ha. Confirm
  the intended members 103 and 100 respectively. Names alone are not identity proof.

Only publication authors with explicit `personId` appear as member associations.
Current/alumni/former records all resolve consistently; every associated paper appears
on the profile, without a fifteen-paper cap. Uncertain mappings remain unresolved
until a curator confirms identity.

Minimal structural example for a **new, unused** member ID (documentation only;
replace the name and role with approved information before adding it):

```json
{"id":900001,"name":"<Approved full name>","status":"current","group":"PhD Students","role":"<Approved role>"}
```

Append a new object or edit the existing object by ID; never replace the whole roster.
For a biography, create the future destination `src/content/biographies/900001.md`
with approved Markdown body text and add `"biography": "900001"` to that person.
For a photo, use the asset procedure below. Do not add CSV education/date columns as
JSON keys: People uses a strict schema. Retain them for review or approved biography
prose. Validate with build/check and `npm run test:people`; an omitted headshot is
valid, while a path to a missing file is not.

## Publications

Required core: `id`, `title`, ordered nonempty `authors`, integer `year`. New optional
fields preserve older records. Source schema: `src/lib/publication-schema.ts`.

| Fields | Contract |
| --- | --- |
| `publicationType` | `journal-article`, `conference-paper`, `workshop-paper`, `preprint`, `book-chapter`, `review-article`, `other` |
| `authors[]` | Required `name`; optional `personId`, `coFirst`, `coSenior`, `corresponding`, `email`, string-array `contributions` |
| `journalName`, `conferenceName`, `venue`, `publisher` | Optional names; display prefers venue, journal name, conference name |
| `volume`, `issue`, `pages` | Optional strings supporting supplements, article numbers, ranges |
| `doi`, `arxivId`, `pmid`, `pmcid` | Optional identifiers; DOI is bare `10.…/…`, not a resolver URL; arXiv accepts modern/legacy forms |
| `abstract`, `keywords` | Optional text and string array |
| `areas` | Research taxonomy slugs, default empty; separate from publication type |
| `image`, `imageAlt` | Optional local `../assets/…` path relative to JSON and alt text |
| `pdfUrl`, `codeUrl`, `slidesUrl` | HTTP(S) or local `/files/…`; GitHub/GitLab are valid code hosts |
| `projectUrl` | HTTP(S) or supported local page/anchor |
| `url`, `scholarUrl` | Optional HTTP(S) links |
| `presentationMaterials` | Optional `{label, url}` array; HTTP(S) or `/files/…` |
| `bibtex` | Optional curated entry, preferred over generated citation |
| `openAccess`, `featured` | Access defaults false; featured is an optional explicit override |
| `verification` | Optional `{method: "doi" or "manual", sourceUrl, checkedAt}` review receipt |
| Legacy flags | `isMenteePaper`, `menteeFirstAuthor`, `piFirstOrSenior`, `collaboration` remain supported |

Never store derived `journal`/`citations` aliases in JSON. Missing type displays Other
Academic Output except legacy `review` fallback. Old review/letter area tags/hashes
remain compatibility cases; new type values belong in `publicationType`. Research
topic slugs/labels are shared with Research/Funding/Materials; taxonomy changes need
schema, labels, filters, data, and anchor review together.

Cards retain PI first/senior, mentee-led, collaboration, open-access, and featured
badges, linked member names/headshots, contribution details, and conditional PDF/Code/
DOI/arXiv/Slides/Project/Scholar/material links. Shared authorship uses labeled asterisks;
corresponding authors use a labeled dagger. Filtering/search/sorting behavior is
documented in [architecture](architecture.md).

BibTeX can be downloaded without JS or copied with clipboard permission; otherwise
it remains selectable. Generation uses article/inproceedings/incollection/misc by
type, ordered literal source names, escaped characters, normalized page ranges,
and supplied metadata only. Curated BibTeX needs human syntax/content review beyond
the schema's basic entry shape. Never invent missing bibliographic fields.

Validation rejects duplicate IDs/DOIs (case-insensitive DOI comparison), unresolved
person references, missing local materials, and missing specified images. Real paper
IDs were preserved during migration. Two mock figure records were removed alongside
their deleted mock papers; the rights gate and `/figures` empty state remain valid.
Do not restore CV/author overlay JSON or active Markdown publication copies.

Use `journal-article`, not `journal-paper`. `areas` accepts only existing taxonomy
IDs; free-form subjects belong in `keywords`. During migration unsupported terms
were retained as keywords and mapped to existing directions where clear (wireless,
edge, satellite, optimization, semantic Earth observation); computer vision remains
a keyword. Ti Ti Nguyen's first-author reference in `nguyen2026optimization` was
corrected to 102 with the curator's confirmation. Other unresolved authors stay
unlinked; no name-based membership inference was applied.

Local PDF links were omitted for the following absent uploads. Add the actual file
under `public`, then restore `pdfUrl`; existing DOI/publisher links remain available:

| Paper ID | Pending `pdfUrl` |
| --- | --- |
| `nguyen2026privacy` | `/files/publications/privacy-preserving-uav-2026.pdf` |
| `wang2026multi` | `/files/publications/multi-satellite-beamspace-2026.pdf` |
| `tran2026reinforcement` | `/files/publications/southeastcon-rl-compression-routing-2026.pdf` |

Five missing `methods.svg` references now use the existing concept illustration
`tools.svg`, matching the Methods direction's asset. Actual uploaded paper images
and files were retained.

### Citation counts

Store counts exclusively in `src/data/citations.json`:

```json
[
  {"id":"<existing-publication-id>","citationCount":null}
]
```

IDs must identify existing papers and be unique; counts are nonnegative integers
or null. Null/missing means unknown and produces no citation badge; 0 is a known
zero and sorts above unknown values. Original known counts were migrated; no
new counts were invented. Adding a paper may include a null row; a missing row is
also safe until the next successful refresh. Remove its count row when deleting a
paper. Do not put `citationCount`, `citations`, or `isMock` into publications.json.

The loader joins counts into the collection's read model so cards, profiles,
homepage and citation sorting continue using the same derived aliases. The weekly
Scholar script writes only citations.json; it never modifies bibliographic metadata
or Scholar URLs. Review/import count values separately from publication candidates.
See [development](development.md#metadata-tools) for credentials, pagination,
matching safeguards, offline tests and the existing weekly workflow.

### Review imports

```bash
npm run import:publications -- --input candidates.json --verify-dois
# Inspect the report, sources, resources, and member relationships yourself.
npm run import:publications -- --input candidates.json --verify-dois --reviewed
```

The reusable importer accepts structured JSON arrays and prints a review report;
it has no production write operation. Duplicate IDs/DOIs against existing data are
rejected, never merged. It never assigns person IDs from names. Approved candidates
must be deliberately merged into JSON; edits to curated records remain separate.

Optional [Crossref checks](https://www.crossref.org/documentation/retrieve-metadata/rest-api/)
compare DOI, title, year, ordered author names, venue, and supplied publisher/volume/
issue/pages. Abbreviations, metadata differences, non-Crossref DOIs, unavailable
services, resource links, and contribution assertions need manual source review.
Non-DOI records can supply a manual receipt with primary source URL and timestamp.
The receipt alone is insufficient: `--reviewed` confirms operator review. The strict
schema rejects `isMock` and inline citation fields. Arbitrary BibTeX input is not parsed.

Minimal structural record (documentation only; replace placeholders with approved
publication metadata):

```json
{"id":900001,"title":"<Approved title>","authors":[{"name":"<Author as published>"}],"year":2026,"publicationType":"preprint"}
```

Add `personId` only after confirming a member from the roster above. Preserve author order and display
names independently of profile names. Validate combined existing/candidate records,
not candidates alone, to detect collisions. Never match by fuzzy name or create a
People record solely to make an external author link. Run build/check and
`npm run test:publications`; the import command checks JSON, not CSV or local files.

## Research, Funding, and Materials

Research records require existing taxonomy `id`, `title`, `summary`, `description`,
`approach`, and `applications`; `image` and `imageAlt` are optional when no approved image exists. Optional `motivation`, `challenges`, `keywords`, `links: [{label,url}]`,
`order`, and `isMock` have defaults. Keep old topic IDs/anchors. Image paths are
relative to JSON. Home and Research share these records without duplicate summaries.

Funding JSON is an object containing `funders` and `projects`, validated by `lab-schemas.ts` and consumed through `lab-data.ts`. Funders require `id`,
`name`, `shortName`, `programme`; optional `isMock` defaults false. Projects require
`id`, `acronym`, `title`, `areas`, `summary`. Optional `funderId`, `status` (active/completed), `startYear`, `endYear`, `leadPersonId`, `startDate`, `endDate`, `leadName`, `teamNames`, `programme`, and `website` preserve incomplete source records. Optional `budgetEUR` is positive, `grantId` is text;
`teamPersonIds`, `partners`, `outputs`, `publicationIds` default empty, and `isMock`
defaults false. End year must not precede start; funder/member/paper IDs must resolve.
Store partner names only where no separate partner entity exists; do not invent grants.

Materials is a JSON array. Required fields: `id`, `title`, `category`, `summary`, `url`,
`format`, `license`, `version`, `access` (open/request), ISO `updated`, and
`maintainerPersonIds`. Optional `publicationId`, `tags`, `featured`, `isMock` support
relationships and display. Categories: Software, Datasets, Benchmarks, Tutorials,
Presentations, Templates; Hardware uses the dedicated source below. URLs are HTTP(S) or `/files/…`; referenced files must exist.
“By request” is a contact/UI label, not authentication: static downloads remain public.

Minimal fictional Research object (documentation only; never replace a sample during append-only imports):

```json
{"id":"topic-one","title":"[Fictional example] Wireless AI","summary":"Example summary.","description":"Example motivation and challenges.","approach":"Compare controlled baselines.","applications":"Example scheduling.","image":"../assets/research/wireless.svg","imageAlt":"Illustrated wireless network","isMock":true}
```

Select the existing direction by confirmed ID before editing. Motivation/challenges
can become approved description prose; Methods becomes approach. Related project
links can use `/funding#project-<id>` after checking the target. The three additional PI directions have explicit IDs in `RESEARCH_IDS`, `AREA_SLUGS`, `AREA_LABELS`, and publication filters. Unknown CSV titles do not create taxonomy IDs automatically.
Build/check and `npm run test:ui` protect the homepage summaries and Research layout.

Minimal fictional Funding pair, to merge into the **existing** funders/projects arrays:

```json
{
  "funders":[{"id":"example-only","name":"Fictional Example Funder","shortName":"EXAMPLE","programme":"Fictional programme","isMock":true}],
  "projects":[{"id":900001,"acronym":"EXAMPLE","title":"[Fictional example] Project","funderId":"example-only","status":"active","startYear":2026,"endYear":2027,"leadName":"Fictional project lead","areas":[],"summary":"Fictional project description.","isMock":true}]
}
```

Resolve the lead/team to People IDs and titles/DOIs to publication IDs. Reuse a funder
only if its programme metadata agrees; one funder record currently carries one
programme. Different programmes need explicit curator decisions, not name-only merging.
Full CSV dates remain in `startDate`/`endDate`; the year fields support compact period labels. Missing status does not become Active or Completed: these cards appear in More research projects. Unknown PI/funder/date fields remain omitted. `leadName`/`teamNames` preserve supplied names without assigning member IDs. Completed cards link to a paper only when a reference exists. Project `website` is supported; funder logos remain review-only.
Run build/check and `npm run test:site`, then inspect `/funding` and its links.

Minimal fictional Materials object, using an existing demo download:

```json
{"id":900001,"title":"[Fictional example] Resource","category":"Presentations","summary":"Fictional resource description.","url":"/files/publications/mock-paper.pdf","format":"PDF","license":"Example only","version":"example-1","access":"open","updated":"2026-11-10","maintainerPersonIds":[],"isMock":true}
```

Pick one primary link for `url`; separate repository/documentation/download links
cannot all become card actions in the current schema. Resolve at least one lab
maintainer (the request action uses the first); credit external creators in approved
summary prose. Map reviewed research titles to taxonomy tags alongside ordinary tags;
Materials has no typed Research relation. Run build/check and `npm run test:site`, and
open the resource/download on `/mare`. Never use an access label as a security boundary.

### Hardware catalogue

Hardware stays under **Resources → Materials**, with the same All/category/search
filters and stable `#resource-<id>` anchors. `src/data/hardware.json` is the only
active equipment source; do not duplicate it in `resources.json`. `HardwareCard.astro`
provides responsive cards, a shared neutral icon, and native keyboard-accessible
Details disclosures for longer descriptions/specifications and additional metadata.
It uses the existing semantic theme palette in Light, Dark and Automatic modes.

Required fields are stable unique `id` and `title`; `category` is Hardware. Optional
fields: `hardwareCategory`, `manufacturer`, `model`, `purchaseYear`, `purchaseDate`,
`specifications`, positive integer `quantity`, `description`, `researchApplications`
(string array), `location`, `availability` (Available / By arrangement / Unavailable),
`relatedProjectIds` (explicit Funding IDs), `image`, `imageAlt`, `order`, `sourceUrl`,
`reviewNotes`, and `isMock`. Unknown values are omitted. IDs must be unique across
Hardware and ordinary Materials. Missing availability never means Available. Never
infer a purchase date from its year, units from a plural name, or configurations.

Keep original wording in `title` and `specifications`. Cards label specifications
**Reported specifications · unverified**. Verify against the actual owned model and
primary manufacturer documentation before editing values; do not silently expand or
correct the CSV, or claim independent verification. For Orin Nano, confirm memory
and kit variant; for AGX Thor, confirm precision, performance and memory. Confirm
Versal/Precision configurations, Vision Pro generation and the iPad product name.
`reviewNotes` stays in the source record for editing; `lab-data.ts` strips it from
the public model. It is never rendered, searched or serialized into browser code.
Source files are still review material, not a private secrets store.

Place a verified equipment image in `src/assets/hardware/` (create the directory
when adding the first photograph). Supported formats: `.jpg`, `.jpeg`, `.png`,
`.webp`, approved `.svg`; use lowercase hyphenated names such as
`hardware-5-orin-nano.webp`. Set `image` to
`../assets/hardware/hardware-5-orin-nano.webp` and provide descriptive `imageAlt`.
These are the only two edits needed; the component discovers local assets and uses
Astro Image optimization. Missing images use the shared icon; a specified missing
file fails the build. Keep original/example assets. No remote photos are fetched.

## News and Talks & Seminars

News requires unique `id`, `title`, ISO date `YYYY-MM-DD`, `summary`, and `category`.
Optional `image`/`imageAlt` are validated assets, though the compact feed displays
text; `externalLink` is HTTP(S), and `links` is a `{label,url}` array supporting local
pages/anchors or HTTP(S). `relatedMembers` and `relatedPublications` store IDs;
`featured`/`isMock` default false. Listings are chronological: homepage always shows
six newest eligible items, without an old featured item displacing recent news.
Future dates are hidden using UTC at build time.

Talks require `id`, `title`, `speaker`, explicit-offset `date`, `event`, `location`,
and `abstract`. `speaker` needs `name` or `personId`; an optional name with personId
is an event-specific display override. `type` is Seminar (default), Conference talk,
Workshop, or Tutorial. Optional `endDate` must be strictly later than start;
`timeZone` defaults Europe/Luxembourg and must be an IANA name. Example winter/summer
timestamps: `2026-12-03T14:00:00+01:00`, `2026-07-03T14:00:00+02:00`.

Optional `relatedPublications`, `slides` (HTTP(S) or `/files/…`), `video`,
`eventWebsite` (HTTP(S)), and `isMock` complete the record. Search covers title,
speaker, event, location, abstract; period/type/year filters combine with search and
newest/oldest sorting. Period switches after end, or start when no end is supplied.
Calendar actions require supplied duration; see [architecture](architecture.md).

Minimal fictional News object for `src/data/news.json`:

```json
{"id":900001,"title":"[Fictional example] Seminar announced","date":"2026-11-10","summary":"A fictional short announcement.","category":"Events","isMock":true}
```

Append/update by stable ID, resolve related people/papers, and check linked targets.
An optional News image is accepted but not shown by the current text feed. Featured
does not change the six-latest homepage rule. Future dates stay hidden until a rebuild
on/after their UTC publication day. Run build/check and `npm run test:editorial`.

Minimal fictional Talk object for `src/data/talks.json`:

```json
{"id":900001,"title":"[Fictional example] Seminar","speaker":{"name":"Fictional External Speaker"},"date":"2026-12-03T14:00:00+01:00","endDate":"2026-12-03T15:00:00+01:00","timeZone":"Europe/Luxembourg","event":"Fictional seminar series","location":"Online","abstract":"Fictional event description.","isMock":true}
```

Combine CSV date and 24-hour time using the named zone, then verify the start and
end offsets separately with a timezone-aware tool. Luxembourg winter is usually
+01:00, summer +02:00; do not hardcode either for every event. DST can make a local
time ambiguous or nonexistent: confirm with the organizer instead of guessing.
Blank End Time omits endDate and calendar files/actions. If End Time is supplied,
blank End Date means the start date; a next-day event needs its explicit end date.
End must be strictly later than start. Period is derived from time, not CSV Event
Status. Cancelled events need a curator decision before publication because no
cancellation field or calendar update mechanism exists. Posters/affiliations have
no dedicated fields. Run build/check, `npm run test:editorial`, `npm run test:ui`,
then inspect Google/Outlook links and `/talks/<id>.ics` for eligible events.

## Blog and Notes

Create Markdown under the appropriate directory, for example:

```yaml
---
title: "Article title"
slug: your-stable-slug
date: "2026-11-10"
authors:
  - personId: "100"
  - name: "External contributor"
summary: "One or two introductory sentences."
tags: [Wireless AI, Reproducibility]
coverImage: ../../assets/editorial/wireless.svg
coverAlt: "Describe the image"
status: draft
relatedPublications: []
isMock: true
---
```

Required frontmatter: title, slug, date, nonempty authors, summary. Tags default empty;
cover/alt and related papers are optional. Authors need name or personId. Default
status is draft; use published and a current/past UTC date to generate listings,
detail routes, sitemap, and search entries. Draft/future content stays hidden even
in dev. Rebuild when a scheduled date arrives; there is no scheduling service.

Slug defines the public URL and must be unique within each collection. Astro's glob
loader can also use explicit frontmatter slug for its entry ID; do not assume a file
rename or filename alone controls identity. Queries validate author/paper references
and slug uniqueness even for drafts. Long-form body uses Markdown headings/contents,
tables, blockquotes, images, code fences, inline `$x$`, and display `$$` equations.
Use Notes for short derivations/checklists and Blog for longer articles. See
[Astro Markdown](https://docs.astro.build/en/guides/markdown-content/) and
[remark-math](https://github.com/remarkjs/remark-math). MDX is not installed.

Use the frontmatter example above as the minimal draft template for either collection;
cover/tags/related papers can be omitted. Add the actual article body below `---`.
For example, `A short explanation of $J = R - \lambda E$` demonstrates inline math.
Use Markdown links such as `[Resources](/mare)` and relative local image paths.
The future file `src/content/blog/new-article.md` or `src/content/notes/new-note.md`
does not exist until you create it. Confirm authors explicitly; preserve a published
slug on updates and use `status: published` only after source/editorial review.
Run build/check and `npm run test:editorial`; a valid draft being absent from the
website is expected. Do not put private material in draft source intended for public
version control simply because no route is generated.

## Lab Life event albums

Edit **one event object** in `src/data/gallery.json`; do not create a Markdown file
for each photo. Upload originals to `src/assets/gallery/<year>/` and list their paths
in the event's `photos` array. The collection still supports getCollection("gallery")
and Astro image optimization, but the old per-photo Markdown source is inactive/removed.

Required event fields: stable `id`, `title`, `date`, nonempty `photos`. Each photo
requires `src` (relative to gallery.json, under ../assets/gallery/) and descriptive
`alt`. Optional photo `caption` provides visible text; otherwise the alt is displayed.
Optional event fields are `dateLabel`, `description`, `category`, explicit member IDs
in `members`, `location`, HTTP(S) `eventUrl`, and numeric `order` (default 0).
Categories remain Conferences, Workshops & Seminars, Lab Activities, Research Visits,
Celebrations, Team Events; default is Lab Activities.

Example using an existing uploaded photo (edit the existing event, do not append a
second event with the same ID):

```json
{
  "id": "2026-summer",
  "title": "SnT Summer Staff Assembly 2026",
  "date": "2026",
  "dateLabel": "Summer 2026",
  "category": "Team Events",
  "photos": [
    {
      "src": "../assets/gallery/2026/2026-summer-001.jpg",
      "alt": "Group photo at the SnT Summer Staff Assembly 2026.",
      "featured": false,
      "featuredHome": true
    }
  ]
}
```

The real event contains three photos; the abbreviated example shows the structure.
Add/remove photo objects in that same array. No photo ID or separate metadata file
is required. Keep event IDs and `/about#event-<id>` anchors stable. Members are optional:
only add confirmed People IDs; never identify people by their faces automatically.

Dates accept `YYYY-MM-DD` **or just YYYY** when the exact day is unknown. dateLabel
can say Summer 2026/Winter 2025 without inventing dates. Sorting uses date descending,
then order ascending and ID; use order to arrange events with the same year-only date.
The initial real names/years come from uploaded filenames and the printed event
borders; locations, exact dates, and member tags were intentionally left unspecified.

Selection flags belong to **photos**, not to the event:

- `featured` defaults false. If an event has featured photos, its card randomly chooses
  among those; otherwise it randomly chooses among all photos in that album.
- `featuredHome` defaults false and is independent. Home randomly chooses only among
  photos marked featuredHome across all events. With no marked photos, the Home image
  is omitted. It never falls back to featured. The current Home pool contains the first
  two landscape photos from the Summer 2026 event.
- Neither flag removes a photo from its album. Randomization runs once per browser
  page load, with a stable initial image in static HTML before JavaScript loads.

About displays one card/count per event. Opening a card shows that event's photos
only, with thumbnails, previous/next, keyboard arrows, Escape/backdrop/close button,
position announcements, and focus restoration. Changing category filters changes
visible events, not the photos within an album. Home links to the matching event
anchor. Image generation uses getImage with responsive WebP thumbnails and a full
view capped at 1600px without upscaling; originals are not overwritten.

Validation rejects duplicate event IDs, repeated photo paths within an event, empty
albums, invalid dates, missing files/alt text, unsafe paths, and unknown member IDs.
Run build/check and `npm run test:ui` (or npm test), then inspect Home and About.
The eight old mock Markdown records and their eight unreferenced SVG illustrations
were explicitly removed; mock data in other collections remains untouched.

For PI CSV returns, one lab-life.csv row now becomes one event. Split Photo Filenames,
Captions and Image Descriptions in matching order into photos[].src/caption/alt;
reject mismatched counts. The CSV Featured column is a cover-selection hint for the
curator, not a Home instruction. Set featuredHome manually on the chosen JSON photos;
no extra CSV column or automatic Lab Life import is required. Keep photographer
credits and permission evidence with the reviewed source material; event descriptions
or per-photo captions may include approved public credits. Confirm publication
permission before adding new real photographs.

## Figures

Figures remain Markdown in `src/content/figures/`; this migration does not change
publication relationships, licensing, or rights gates. Required fields: image, paper
publication ID, caption, citation, license (CC-BY, CC-BY-SA, CC0, publisher-permission,
unknown). Optional licenseUrl/DOI/PMID/journal/order accompany them. rightsConfirmed
still defaults false; only explicitly confirmed rights permit rendering.

## General lab information and branding

Edit values in the existing `site` object in `src/data/site.ts`. It is a typed
singleton, not JSON or an Astro collection. Required string properties are name,
shortName, pi, researchGroup, institution, university, url, description, email,
phone, mapQuery; address is a string array, social an object of optional URLs, and
nav the existing typed navigation list. Retain required properties and navigation.
The director name is text, not a People reference; changing it does not assign authors.

A minimal, typed partial-update example (illustrative, not a replacement site file):

```ts
import { site, type SiteConfig } from "./src/data/site";
const proposedSite = {
  ...site,
  name: "Fictional Example Lab",
  description: "Fictional example mission.",
  email: "demo-contact@example.invalid",
  social: { ...site.social, github: "https://example.invalid/demo/lab" },
} satisfies SiteConfig;
```

Apply approved values to the existing object; this snippet itself is documentation
only. Mission appears on the homepage and as default SEO description. Map Location
becomes `mapQuery` search text; ContactSection constructs the embed/search links.
Map CSV Twitter/X to `social.twitter`; use full URLs for all nine social services.
Keep old values when a return cell is blank. A requested removal needs deliberate
review because the current footer contract keeps all nine icons visible; seven
destinations are currently labeled placeholders. RSS accepts an existing feed URL;
the site does not generate one. No configurable logo field exists: Nav uses
`/favicon.svg`. Collecting a different logo does not change that UI.

Changing `site.url` alone does not change Astro.site, which currently takes precedence
for canonicals; sitemap/robots/domain settings require a separately approved
deployment configuration task. Run build/check, `npm run test:ui`, and
`npm run test:search-theme` after approved contact/social/branding edits.

## Images, documents, and local review

| Purpose | Existing destination | Stored reference |
| --- | --- | --- |
| Member headshot | `src/assets/people/` | `../assets/people/<filename>` in People JSON |
| Research image | `src/assets/research/` | `../assets/research/<filename>` in Research JSON |
| Publication illustration | `src/assets/research/` or `src/assets/editorial/` | `../assets/<folder>/<filename>` in publication JSON |
| News image | `src/assets/editorial/` | `../assets/editorial/<filename>` in News JSON |
| Blog/Notes cover or body image | `src/assets/editorial/` | `../../assets/editorial/<filename>` from a top-level Markdown file |
| Lab Life event photo | `src/assets/gallery/<year>/` (future year folders as needed) | `../assets/gallery/<year>/<filename>` in gallery.json photos[].src |
| Paper PDF | `public/files/publications/` | `/files/publications/<filename>` |
| Slides | `public/files/presentations/` | `/files/presentations/<filename>` |
| Software/data/other downloads | `public/files/resources/` | `/files/resources/<filename>` |
| Existing branding/icon assets | `public/` | `/favicon.svg`, `/favicon.ico`, `/favicon-32.png`, `/apple-touch-icon.png`, `/icon-192.png`, `/icon-512.png` |

Angle-bracket filenames above are **future destinations**, not existing files. Paths
for JSON/Markdown images are relative to the owning source file; nested article files
need adjusted `../` depth. Download URLs omit `public`. Respect filename case, use
short lowercase hyphenated names, and avoid spaces, path traversal, `?`, and `#` in
local download names. Keep image descriptions/captions accurate and use supported
JPG/PNG/WebP or approved SVG source assets; never put PDF files in an image field.
Use Astro assets for content images, not remote photo hotlinks or manual `/_astro/`
URLs. The build creates optimized filenames. Never edit files in `dist` to update content.

For replacements, retain a filename only when it still identifies the same asset;
otherwise copy the new file, update every reviewed reference, and check consumers
before removing the old file. Preserve member/gallery IDs and published slugs. Build
again to refresh assets/search. For branding, preserve the established favicon/icon
filenames and supply appropriate variants; Nav/SEO reference them directly. A distinct
logo or changed icon wiring is a separate functional task. Favicon caching may require
an approved version query in SEO later; it is not controlled by CSV fields.

Store PDF/slides/download files in the existing public directories above, reference
their exact names, and open the resulting `/files/…` URL locally. External HTTP(S)
PDF/slides links are accepted where schemas allow. Every file in public is publicly
accessible after deployment; drafts and By request labels do not protect it. Keep
unapproved originals, consent evidence, and returned personal data outside public
and version control unless their storage is explicitly agreed. Future private return
folders may live outside this repository; none are created by this package.

After an edit, run from the repository root:

```bash
npm run build
npx astro check
npm test
npm run dev
# In another terminal, inspect the artifact after the build:
npm run preview -- --port 4322
```

Use an existing running server instead of starting duplicates. Open the affected
page, profile/paper links, images, files, filters, and calendar actions; review narrow
and wide layouts. Pagefind dev search uses the last built index. Existing demo-count
tests will need deliberate updates when verified data replaces samples; do not delete
useful relationship/interaction tests to hide a failure. Run `npm run check:links` for
curated external publication links when network access is available.
No local command above publishes; commit/push/deploy need explicit approval.

## CSV return and import workflow

The PI returns are in `docs/data-collection/`: People, Publications, Research,
Funding, News, Equipment, Materials, Talks & Seminars, Lab Life, and Site Information.
The separate `docs 2/data-collection/` copies contain older examples. CSV downloads
in `public/files/resources/` are sample datasets, not PI content returns.

```bash
npm run import:pi > /private/tmp/telecomai-pi-review.json
# Optional: npm run import:pi -- --directory /absolute/path/to/returned-csvs
```

`import:pi` never writes production files. Its JSON report contains `candidates`,
Markdown `biographies`, per-file counts, and a row-level `report` with status,
reason, warnings, unconsumed columns and original review notes. Parse quoted CSV
with BOM, CRLF and multiline support; malformed columns are rejected. Missing files
are reported while other files continue. Example Row = Yes is excluded from import
but neither the CSV examples nor existing website samples are deleted. No means
submitted data, not independently verified data.

Review the plan against the existing files before deliberately appending candidates
to the corresponding arrays. Append `funders` and `projects` to their separate
arrays in funding.json. Create only new biography paths; never overwrite existing
Markdown. Compare every old record before/after, including its ID, field values and
relationships. There is deliberately no `--write` option. Rerunning against the
updated JSON must return zero new candidates for the same input. The retired demo
generator must not be reintroduced as an import step.

Duplicate rules: People use shared institutional profile source URLs, email or
ORCID plus a consistent name; name-only collisions are held for review. Publications
use case-insensitive bare DOI or normalized title/year; conflicting metadata is held.
Funding uses grant number or normalized title/funder, and reuses funders only when
name and programme agree. News uses headline/date. Research uses explicitly mapped
stable IDs/titles. Equipment uses name plus consistent supplied model/configuration;
changes require manual review, never an overwrite. No relationship is inferred
from author, speaker or maintainer names. The current publication CSV supplies no
member-author mappings, so authors remain ordered, named and unlinked. Real records
with unknown PI roles do not acquire an inferred collaboration badge. Future talk
manual reconciliation must compare title/date/speaker as well as stable IDs.

The current converter handles the available real People, Publications, Research,
Funding, News and Equipment rows. Materials, Talks and Lab Life returns currently
contain **only examples**, so they add nothing; future real rows in these three
files are reported for manual conversion using the tables below. Site Information
is a singleton configuration, so replacement fields are reported for review rather
than changing existing identity/contact/navigation/deployment settings.

The original CSV pass supplied People, Publications, Research, Funding, News and
Equipment candidates. JSON now also includes later direct curator edits; the current
People/Publications roster replaces the old samples and is authoritative. Suleima Briseno Ramirez is held
because the Postdocs/Research Associate fields conflict with a technician biography.
The proposed Foundations and Methods of Artificial Intelligence direction explicitly
requires lab approval and is held. Review the original CSVs for all source notes,
including Duc-Dung Tran's appointment, funding dates/status/PI, unresolved RUTINE
publication, and Flor Ortiz's name-only News association. No missing field produces
a fabricated receipt, headshot, author relationship, availability, duration or budget.

To edit imported People, find the stable JSON ID and edit metadata there; edit its
biography Markdown separately. Add verified headshots using `../assets/people/<name>`;
omitting them preserves initials on listing/profile pages. Publication edits stay in
publications.json; preserve author order and add `personId` only after explicit
identity review. `sourceUrls` records provenance for People and Publications without
claiming verification. The existing `import:publications` Crossref workflow remains
available for independent metadata review; do not invent a verification timestamp.

## CSV column mapping

**R** = required collection input (sometimes stricter than a schema default for usable
content); **C** = required when its documented condition applies; **O** = optional.
Blank optional values on **updates** preserve existing data. Required fields unavailable
from the PI block that record's publication pending clarification. Review-only fields
are intentionally collected but not added to schemas. All ten CSVs include Example
Row and Existing Website URL; internal IDs, biography references, mock status, derived
aliases/badges, calendar period/URLs, and verification timestamps are curator-managed.

Publication Type conversion is explicit:

| CSV value | Stored value |
| --- | --- |
| Journal Article | `journal-article` |
| Conference Paper | `conference-paper` |
| Workshop Paper | `workshop-paper` |
| Preprint | `preprint` |
| Book Chapter | `book-chapter` |
| Review Article | `review-article` |
| Other Academic Output | `other` |

Current Research title-to-ID lookup (confirm against research.json when curating):

| Direction title | Stable ID |
| --- | --- |
| AI for wireless networks | `topic-one` |
| Cloud & edge intelligence | `topic-two` |
| Satellite communications | `topic-three` |
| Open tools & datasets | `methods` |
| Optimization & learning | `theory` |
| Resource Allocation and Network Management with Edge AI | `edge-ai-network-management` |
| Semantic Communications for Earth Observation | `semantic-earth-observation` |
| Data and AI Model Marketplace Ecosystems | `data-model-ecosystems` |

`review` and `letter` are legacy publication compatibility tags, not new research
directions. Never derive a new ID by lowercasing a returned Research title.

### people.csv

| CSV column | Requirement | Destination / conversion |
| --- | --- | --- |
| Example Row | R | `Review only; never a schema property` — Change Yes to No only for real submitted information. This is not verification. |
| Existing Website URL | O | `Curator lookup; preserve the existing ID` — For updates, supply the existing profile/page/anchor if known; never infer identity solely from the URL or a name. |
| Full Name | R | `name` — Use the member's full name. |
| Display Name | O | `displayName` — Preferred public name. |
| Member Category | R | `group` — Use a PERSON_GROUPS value; choices are in the PI guide. |
| Academic Position | R | `role` — Position shown on directory cards. |
| Profile Title | O | `title` — Additional title on the profile. |
| Current/Alumni Status | R | `status` — Current → current; Alumni → alumni, including former members. |
| Affiliation | O | `affiliation` — Verified affiliation text. |
| Email | O | `links.email` — Address only, without mailto:. |
| Personal Website | O | `links.website` — Absolute URL. |
| Google Scholar | O | `links.scholar` — Profile URL. |
| ORCID | O | `links.orcid` — Full ORCID profile URL. |
| GitHub | O | `links.github` — Profile URL. |
| LinkedIn | O | `links.linkedin` — Profile URL. |
| Twitter/X | O | `links.twitter` — Profile URL. |
| Research Interests | O | `researchInterests[]` — Semicolon-separated text. |
| Short Biography | O | `Markdown biography body + biography reference` — Create/update a separate biography Markdown file. |
| Education | O | `Curator-reviewed biography prose` — No structured education field; append only approved prose to the biography. |
| Joining Date | O | `Review archive / optional approved biography prose` — No structured field; do not add unknown JSON keys. |
| Leaving Date | O | `Review archive / optional approved biography prose` — No structured field; does not automatically set status. |
| Profile Photo Filename | O | `headshot` — Copy supplied image to src/assets/people; construct a relative JSON path. |
| Display Order | O | `order` — Numeric; blank defaults to 0 for new records. Preserve existing order on updates. |
| Featured | O | `featured` — Yes/No; blank uses default false for new records. |
| Publication Role | O | `publicationRole` — PI → pi; Senior researcher → senior; Mentee → mentee. Confirm explicitly; omission means unknown. |
| Source URL | O | `sourceUrls[]` — Source evidence only, not independent verification. |
| Review Notes | O | `Review archive` — Clarifications/permissions; not public by default. |

### publications.csv

| CSV column | Requirement | Destination / conversion |
| --- | --- | --- |
| Example Row | R | `Review only; never a schema property` — Change Yes to No only for real submitted information. This is not verification. |
| Existing Website URL | O | `Curator lookup; preserve the existing ID` — For updates, supply the existing profile/page/anchor if known; never infer identity solely from the URL or a name. |
| Title | R | `title` — As published. |
| Ordered Authors | R | `authors[].name` — Semicolon-separated names in exact publication order. |
| Year | R | `year` — Integer year, not a full date. |
| Publication Type | R | `publicationType` — Human labels map to the seven PUBLICATION_TYPES. |
| Journal Name | O | `journalName` — Use journal name for an article. |
| Conference Name | O | `conferenceName` — Use conference name for proceedings. |
| Venue | O | `venue` — Display venue; takes precedence over journal/conference name. |
| Publisher | O | `publisher` — Verified publisher. |
| Volume | O | `volume` — Text, preserving leading zeros/supplements. |
| Issue | O | `issue` — Text. |
| Pages | O | `pages` — Page range or article number. |
| DOI | O | `doi` — Strip a supplied resolver prefix; store bare DOI. Blank if unavailable. |
| arXiv Identifier | O | `arxivId` — Identifier only; no invented values. |
| PubMed ID | O | `pmid` — Optional legacy identifier. |
| PubMed Central ID | O | `pmcid` — Optional legacy identifier. |
| Abstract | O | `abstract` — Plain text; multiline is supported. |
| Keywords | O | `keywords[]` — Semicolon-separated. |
| Research Areas | O | `areas[]` — Reviewed direction titles map to existing taxonomy IDs. |
| PDF URL or Filename | O | `pdfUrl` — HTTP(S) or supplied file copied to public/files/publications. |
| Code URL or Filename | O | `codeUrl` — GitHub/GitLab URL or supplied file under public/files. |
| Slides URL or Filename | O | `slidesUrl` — HTTP(S) or local public download. |
| Project URL | O | `projectUrl` — HTTP(S) or supported existing local route/anchor. |
| Publication URL | O | `url` — Primary HTTP(S) source. |
| Google Scholar URL | O | `scholarUrl` — Paper URL. |
| BibTeX | O | `bibtex` — Preserve full multiline entry; do not split on semicolons. |
| Open Access | O | `openAccess` — Yes/No. Blank does not assert verified open access. |
| Citation Count | O | `citations.json[].citationCount` — Review separately by publication ID; nonnegative integer, blank becomes null, 0 is a known zero. Never a publication field. |
| Featured | O | `featured` — Blank omits the override; Yes/No explicitly overrides automatic selection. |
| Lab Member Authors (author numbers) | O | `authors[position-1].personId` — One-based positions; curator confirms each identity and supplies IDs. |
| Co-first Authors (author numbers) | O | `authors[position-1].coFirst` — One-based positions. |
| Co-senior Authors (author numbers) | O | `authors[position-1].coSenior` — One-based positions. |
| Corresponding Authors (author numbers) | O | `authors[position-1].corresponding` — One-based positions. |
| Corresponding Author Emails | O | `authors[position-1].email` — Write e.g. 2: name@example.edu; curator associates by position. |
| Author Contributions | O | `authors[position-1].contributions[]` — Readable numbered statements; curator structures each author's contribution list. |
| Additional Materials | O | `presentationMaterials[]` — One label and URL/filename per line; curator creates label/url objects. |
| Illustration Filename | O | `image` — Local file copied to src/assets; optional. |
| Illustration Description | C | `imageAlt` — Required by editorial policy if an illustration is supplied. |
| Source URL | O | `sourceUrls[]` — Source evidence; a verification receipt requires actual independent review. |
| Review Notes | O | `Review archive` — Source/authorship uncertainties. |

### research.csv

| CSV column | Requirement | Destination / conversion |
| --- | --- | --- |
| Example Row | R | `Review only; never a schema property` — Change Yes to No only for real submitted information. This is not verification. |
| Existing Website URL | O | `Curator lookup; preserve the existing ID` — For updates, supply the existing profile/page/anchor if known; never infer identity solely from the URL or a name. |
| Research Direction Title | R | `title` — Curator preserves the corresponding existing taxonomy ID. |
| Short Summary | R | `summary` — Used on the homepage. |
| Detailed Description | R | `description` — Main descriptive text. |
| Motivation | O | `motivation` — Supplied motivation text. |
| Research Challenges | O | `challenges[]` — Semicolon-separated challenges. |
| Methods | R | `approach` — Approach text. |
| Applications | R | `applications` — Application text. |
| Keywords | O | `keywords[]` — Descriptive keywords; never automatic taxonomy IDs. |
| Representative Image Filename | O | `image` — Approved local image; omit if missing. |
| Image Description | C | `imageAlt` — Alt text when an image is supplied. |
| Related Projects | O | `links[] after curator resolution` — Exact project titles/acronyms become existing /funding#project-ID links; no dedicated relationship field. |
| Additional Links | O | `links[]` — One label and URL per line. |
| Display Order | O | `order` — Numeric, default 0 for new records. |
| Review Notes | O | `Review archive` — Source and scope clarification. |

### funding.csv

| CSV column | Requirement | Destination / conversion |
| --- | --- | --- |
| Example Row | R | `Review only; never a schema property` — Change Yes to No only for real submitted information. This is not verification. |
| Existing Website URL | O | `Curator lookup; preserve the existing ID` — For updates, supply the existing profile/page/anchor if known; never infer identity solely from the URL or a name. |
| Project Title | R | `projects[].title` — Public project title. |
| Acronym | R | `projects[].acronym` — Public short name. |
| Funder | O | `funders[].name` — Resolve/create a funder entity; do not duplicate conflicting funder metadata. |
| Funder Short Name | O | `funders[].shortName` — Displayed programme label is currently shortName. |
| Funding Program | O | `funders[].programme` and `projects[].programme` — Supplied programme text. |
| Grant Number | O | `projects[].grantId` — Text; preserve leading zeros. |
| Project Description | R | `projects[].summary` — Plain text. |
| Principal Investigator | O | `projects[].leadName`; use `leadPersonId` only after explicit identity confirmation. |
| Lab Team Members | O | `projects[].teamNames[]`; use `teamPersonIds` only after explicit identity confirmation. |
| Collaborators / Partner Organizations | O | `projects[].partners[]` — Semicolon-separated partner names; external people have no structured partner entity. |
| Start Date | O | `projects[].startDate` and `startYear` — Preserve full supplied date; never invent a day. |
| End Date | O | `projects[].endDate` and `endYear` — Preserve full supplied date; do not infer from duration. |
| Project Status | O | `projects[].status` — Active → active; Completed → completed. |
| Website | O | `projects[].website` — Supplied HTTP(S) project link. |
| Funder Logo Filename | O | `Review archive / future asset` — No funder logo field/rendering currently. |
| Related Research Areas | O | `projects[].areas[]` — Direction titles resolved to existing taxonomy IDs. |
| Funding Amount (EUR) | O | `projects[].budgetEUR` — Positive lab budget, digits/decimal point only; no currency symbols/group separators. |
| Expected Outputs | O | `projects[].outputs[]` — Semicolon-separated descriptions. |
| Related Publications | O | `projects[].publicationIds[]` — Exact DOI/source URL resolved to IDs; unresolved references remain in the CSV/report. |
| Source URL | O | `Review evidence` — Grant/project source. |
| Review Notes | O | `Review archive` — Known years if full dates unavailable; funding scope/permission notes. |

### talks-seminars.csv

| CSV column | Requirement | Destination / conversion |
| --- | --- | --- |
| Example Row | R | `Review only; never a schema property` — Change Yes to No only for real submitted information. This is not verification. |
| Existing Website URL | O | `Curator lookup; preserve the existing ID` — For updates, supply the existing profile/page/anchor if known; never infer identity solely from the URL or a name. |
| Title | R | `title` — Talk title. |
| Event Type | R | `type` — Seminar, Conference talk, Workshop, Tutorial; invited talk maps to its actual event type. |
| Speaker | R | `speaker.name / speaker.personId` — Curator verifies member identity; external speaker needs only a name. |
| Speaker Affiliation | O | `Review archive / optional approved abstract prose` — No dedicated talk affiliation field. |
| Event Name | R | `event` — Seminar series/conference name. |
| Date | R | `date (combined with time/offset)` — Start date YYYY-MM-DD. |
| Start Time | R | `date (combined)` — 24-hour HH:MM. |
| End Date | C | `endDate (combined)` — If End Time given, blank means same day; specify explicitly for overnight events. |
| End Time | O | `endDate (combined)` — Never infer duration when blank; calendar actions then remain absent. |
| Timezone | R | `timeZone + offset conversion` — IANA name, e.g. Europe/Luxembourg; curator verifies DST offsets for start and end. |
| Location | R | `location` — Room/address or Online. |
| Abstract | R | `abstract` — Plain text. |
| Event Website | O | `eventWebsite` — HTTP(S). |
| Slides URL or Filename | O | `slides` — HTTP(S) or local /files path after asset review. |
| Video URL | O | `video` — HTTP(S). |
| Poster Image Filename | O | `Review archive / future asset` — No poster schema/rendering currently. |
| Event Status | O | `Review archive; period is clock-derived` — Scheduled, Past, Cancelled; cancellation has no automatic suppression/calendar behavior. |
| Related Publications | O | `relatedPublications[]` — Titles/DOIs resolved to stable IDs. |
| Review Notes | O | `Review archive` — Resolve DST ambiguity, changed/cancelled schedule, and source verification. |

### news.csv

| CSV column | Requirement | Destination / conversion |
| --- | --- | --- |
| Example Row | R | `Review only; never a schema property` — Change Yes to No only for real submitted information. This is not verification. |
| Existing Website URL | O | `Curator lookup; preserve the existing ID` — For updates, supply the existing profile/page/anchor if known; never infer identity solely from the URL or a name. |
| Date | R | `date` — YYYY-MM-DD; future items are hidden until eligible at build time. |
| Category | R | `category` — Free text such as Research, People, Events. |
| Headline | R | `title` — Short announcement heading. |
| Short Announcement | R | `summary` — One or two concise sentences. |
| Related People | O | `relatedMembers[]` — Semicolon-separated full names resolved by curator. |
| Related Publications | O | `relatedPublications[]` — Semicolon-separated exact titles/DOIs. |
| External URL | O | `externalLink` — HTTP(S). |
| Additional Links | O | `links[]` — One label and URL per line. |
| Image Filename | O | `image` — Optional local image; current compact feed does not display it. |
| Image Description | C | `imageAlt` — Supply if image provided. |
| Featured | O | `featured` — Metadata only; feed remains chronological. |
| Review Notes | O | `Review archive` — Source/approval notes. |

### materials.csv

| CSV column | Requirement | Destination / conversion |
| --- | --- | --- |
| Example Row | R | `Review only; never a schema property` — Change Yes to No only for real submitted information. This is not verification. |
| Existing Website URL | O | `Curator lookup; preserve the existing ID` — For updates, supply the existing profile/page/anchor if known; never infer identity solely from the URL or a name. |
| Title | R | `title` — Resource title. |
| Resource Type | R | `format / review description` — Technical format e.g. Python, PDF, Web guide; catalogue category is separate. |
| Category | R | `category` — Software, Datasets, Benchmarks, Tutorials, Presentations, Templates. |
| Description | R | `summary` — Plain text. |
| Authors / Maintainers | R | `maintainerPersonIds[] + optional approved summary prose` — At least one verified People maintainer required by current request links; external creators can be credited in summary. |
| Primary Resource URL or Filename | R | `url` — Choose the single primary link rendered on the card. |
| GitHub / GitLab URL | O | `url candidate / review archive` — Use as primary if chosen; otherwise not a separate card link. |
| Documentation URL | O | `url candidate / review archive` — No separate documentation link field. |
| Download URL or Filename | O | `url candidate / review archive` — No separate secondary download field. |
| Related Publication | O | `publicationId` — One paper title/DOI, resolved by curator. |
| Related Research Areas | O | `tags[] after taxonomy resolution` — Direction titles mapped to topic IDs mixed with other tags; not a typed relation field. |
| Tags | O | `tags[]` — Semicolon-separated descriptive labels. |
| License | R | `license` — Verified license text; do not assume. |
| Version | R | `version` — Version/release label. |
| Access | R | `access` — Open → open; By request → request. Static files are not access-controlled. |
| Updated Date | R | `updated` — YYYY-MM-DD. |
| Image Filename | O | `Review archive / future asset` — No image field; current category icons are generated by the component. |
| Featured | O | `featured` — Yes/No, default false. |
| Review Notes | O | `Review archive` — Clarify primary link, external credits, permissions. |

### equipment.csv

| CSV column | Destination / conversion |
| --- | --- |
| Example Row; Existing Website URL | Review controls/source context, never identity by themselves |
| Equipment Name | `title`; preserve exact supplied wording |
| Category | `hardwareCategory`; Materials category is always Hardware |
| Purchase Year; Purchase Date | `purchaseYear`; optional ISO `purchaseDate`, no inferred month/day |
| Specifications as Reported | `specifications`; exact unverified source value |
| Quantity | Optional positive integer `quantity`; blank stays unknown |
| Description | Optional `description`; never substitute internal notes |
| Research Applications | `researchApplications[]`; semicolon-separated |
| Location; Availability | Optional `location` / explicitly verified `availability` |
| Related Projects | Review names, then supply explicit `relatedProjectIds[]` |
| Image Filename; Image Description | `image` under `src/assets/hardware/`; required `imageAlt` when present |
| Display Order | Numeric `order`; no implied inventory count |
| Source URL | `sourceUrl`; source attribution, no independent verification claim |
| Review Notes | `reviewNotes`; retained in JSON, stripped from public model |

Stable equipment IDs are allocated once; do not rename after import. Optional
Manufacturer/Model columns, when added to a return, map to verified `manufacturer`
and `model` strings. Never derive either from an ambiguous product name.

### lab-life.csv

| CSV column | Requirement | Destination / conversion |
| --- | --- | --- |
| Example Row | R | `Review only; never a schema property` — Change Yes to No only for real submitted information. This is not verification. |
| Existing Website URL | O | `Curator lookup; preserve the existing ID` — For updates, supply the existing profile/page/anchor if known; never infer identity solely from the URL or a name. |
| Activity Title | R | `title` — One event record per activity. |
| Date | R | `date` — YYYY-MM-DD; Lab Life also accepts YYYY with a dateLabel for partial dates. |
| Category | R | `category` — Use gallery category choices in PI guide. |
| Description | O | `description` — Event description, shared by the album. |
| Photo Filenames | R | `photos[].src` — Semicolon-separated filenames; order must match captions/descriptions. |
| Captions | R | `photos[].caption` — Semicolon-separated photo captions, exactly one per filename; avoid semicolons inside captions. |
| Image Descriptions | C | `photos[].alt` — Match each photo; a descriptive alt is required in JSON. |
| Related Members | O | `members[]` — Semicolon-separated full names; curator supplies explicit IDs. |
| Location | O | `location` — Optional event location. |
| Event URL | O | `eventUrl` — Optional HTTP(S) event link. |
| Image Kind | O | Review evidence only; the active gallery contains real event photographs. |
| Featured | O | `photos[].featured` — Cover-selection hint; curate per photo. Home uses independent photos[].featuredHome in JSON. |
| Photo Credit | O | `Review archive / approved caption prose` — Keep credit with each file. |
| Permission to Publish | C | `Review evidence` — Confirm permission for every supplied photograph before adding it publicly. No permission schema field. |
| Review Notes | O | `Review archive` — Consent, credit, existing filenames/entry identity. |

### site-information.csv

| CSV column | Requirement | Destination / conversion |
| --- | --- | --- |
| Example Row | R | `Review only; never a schema property` — Change Yes to No only for real submitted information. This is not verification. |
| Existing Website URL | O | `Curator lookup; preserve the existing ID` — For updates, supply the existing profile/page/anchor if known; never infer identity solely from the URL or a name. |
| Official Lab Name | R | `site.name` — Confirmed official name. |
| Short Name | R | `site.shortName` — Navigation label. |
| Research Group | R | `site.researchGroup` — Affiliation. |
| Institution | R | `site.institution` — Centre/institute. |
| University | R | `site.university` — University. |
| Lab Director | R | `site.pi` — Name text; no automatic People relationship. |
| Mission | R | `site.description` — Site metadata/introduction text. |
| Contact Email | R | `site.email` — Address only. |
| Phone | O | `site.phone` — SiteConfig requires a string; preserve existing unless explicitly approved for removal. |
| Address | R | `site.address[]` — Semicolon-separated address lines. |
| Website URL | C | `site.url + separate deployment review` — Collect verified URL; changing it alone does not update Astro.site/canonical/sitemap settings. |
| Google Maps Location | R | `site.mapQuery` — Address/place/search text, not iframe HTML or a sharing URL. |
| Google Scholar | O | `site.social.scholar` — Verified lab/director profile URL. |
| GitHub | O | `site.social.github` — Verified organization URL. |
| LinkedIn | O | `site.social.linkedin` — Verified URL. |
| Facebook | O | `site.social.facebook` — Verified URL. |
| Twitter/X | O | `site.social.twitter` — Verified URL. |
| YouTube | O | `site.social.youtube` — Verified URL. |
| Telegram | O | `site.social.telegram` — Verified URL. |
| Slack | O | `site.social.slack` — Approved public invitation/destination only. |
| RSS | O | `site.social.rss` — An existing feed URL; this site generates no RSS feed. |
| Logo Filename | O | `Review archive / existing favicon assets` — No configurable logo property; Nav currently uses public/favicon.svg. A distinct logo needs a later UI task. |
| Favicon Filename | O | `public/favicon.svg and approved icon variants` — Replace at existing destinations; filename alone does not configure SEO/Nav. |
| Review Notes | O | `Review archive` — Domain, logo, public contact approval, and deliberate removals. |

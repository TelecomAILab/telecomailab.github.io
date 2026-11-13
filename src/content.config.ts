import { defineCollection, reference } from "astro:content";
import { file, glob } from "astro/loaders";
import { z } from "zod";
import { existsSync, statSync } from "node:fs";
import { publicationSchema, withPublicationAliases, validatePublicationRecords } from "./lib/publication-schema";
import { personSchema, validatePeopleRecords } from "./lib/people-schema";
import { sources } from "./lib/content-sources";
import { resources, hardware } from "./lib/lab-data";
import peopleData from "./data/people.json";
import publicationData from "./data/publications.json";
import newsData from "./data/news.json";
import talksData from "./data/talks.json";
import { newsSchema, talksSchema, articleSchema, validateEditorialReferences } from "./lib/editorial-schema";
import researchData from "./data/research.json";
import { researchSchema } from "./lib/research-schema";
import { resolveMockReferences } from "./lib/mock-references";
import galleryData from "./data/gallery.json";
import { galleryEventSchema, galleryPhotoSchema, validateGalleryRecords } from "./lib/gallery-schema";
import citationsData from "./data/citations.json";
import { createCitationIndex, withCitationCount } from "./lib/citations";

const isFile = (url: URL) => existsSync(url) && statSync(url).isFile();
const root = new URL("../", import.meta.url);
const referenceDirectory = {
  people: new Set(peopleData.map((person) => String(person.id))),
  publications: new Set(publicationData.map((paper) => String(paper.id))),
};
validateGalleryRecords(galleryData, referenceDirectory.people, path => isFile(new URL(path, new URL("src/data/gallery.json", root))));
const resolve = (input: unknown) => resolveMockReferences(input, referenceDirectory, "content collections");
// The parser transforms only the loaded view; JSON/Markdown remains authoritative.
const referenceParser = (text: string) => (JSON.parse(text) as Record<string, unknown>[]).map((record) =>
  resolveMockReferences(record, referenceDirectory, `JSON record ${record.id}`) as Record<string, unknown>);
const researchRecords = z.array(researchSchema).parse(researchData);
if (new Set(researchRecords.map((area) => area.id)).size !== researchRecords.length) throw new Error("Duplicate research area IDs");
const validatedPeople = validatePeopleRecords(peopleData, {
  headshotExists: (path) => isFile(new URL(path, new URL(sources.people, root))),
  biographyExists: (id) => isFile(new URL(`${sources.biographies}/${id}.md`, root)),
});
const citationCounts = createCitationIndex(citationsData, referenceDirectory.publications);
const validatedPublications = validatePublicationRecords(publicationData, new Set(validatedPeople.map((person) => person.id)),
  (path) => isFile(new URL(`public${path}`, root)));
const researchIds = new Set<string>(researchRecords.map(area => area.id));
for (const paper of validatedPublications) {
  for (const area of paper.areas) if (!researchIds.has(area)) throw new Error(`${paper.id}: unknown research direction ${area}`);
  if (paper.image && !isFile(new URL(paper.image, new URL("src/data/publications.json", root)))) throw new Error(`Missing publication image: ${paper.image}`);
}
for (const resource of resources) {
  if (resource.url.startsWith("/files/") && !isFile(new URL(`public${resource.url}`, root))) throw new Error(`Missing resource file ${resource.url}`);
}
for (const item of hardware) {
  if (item.image && !isFile(new URL(item.image, new URL("src/data/hardware.json", root)))) throw new Error(`Missing equipment image: ${item.image}`);
}
const editorialPeople = new Set(validatedPeople.map((person) => person.id));
const editorialPublications = new Set(publicationData.map((paper) => String(paper.id)));
const newsRecords = z.array(newsSchema).parse(newsData.map(resolve));
const talkRecords = z.array(talksSchema).parse(talksData.map(resolve));
validateEditorialReferences(newsRecords, editorialPeople, editorialPublications);
validateEditorialReferences(talkRecords, editorialPeople, editorialPublications);
for (const item of newsRecords) {
  if (item.image && !isFile(new URL(item.image, new URL("src/data/news.json", root)))) throw new Error(`Missing news image: ${item.image}`);
}
for (const talk of talkRecords) {
  if (talk.slides?.startsWith("/files/") && !isFile(new URL(`public${talk.slides}`, root))) throw new Error(`Missing talk slides: ${talk.slides}`);
}

/*
  Content collections for the lab site.

  People, publications, gallery events, news, and talks use JSON. Biographies,
  figures, blog articles, and notes use Markdown.
  Safety defaults fail closed: figures default to rightsConfirmed:false and are
  filtered out of every figure query, so a half-filled record can never leak.
*/

// Structured members remain compatible with getCollection("people") and Astro assets.
const people = defineCollection({
  loader: file(sources.people),
  schema: ({ image }) =>
    personSchema.extend({
      headshot: image().optional(),
      biography: reference("biographies").optional(),
    }),
});

// Markdown rendering stays in Astro's native content pipeline; no member metadata here.
const biographies = defineCollection({
  loader: glob({ pattern: "*.md", base: sources.biographies }),
  schema: z.strictObject({}),
});

// Publications — the only active publication source; existing IDs remain stable.
const publications = defineCollection({
  loader: file(sources.publications),
  schema: ({ image }) => publicationSchema.extend({ image: image().optional() }).transform(record => withPublicationAliases(withCitationCount(record, citationCounts))),
});

// Figures — gated by rightsConfirmed (hard gate, defaults closed).
const figures = defineCollection({
  loader: glob({ pattern: "**/*.md", base: sources.figures }),
  schema: ({ image }) =>
    z.object({
      image: image(),
      paper: reference("publications"),
      caption: z.string(),
      citation: z.string(),
      doi: z.string().optional(),
      pmid: z.string().optional(),
      journal: z.string().optional(),
      license: z.enum([
        "CC-BY",
        "CC-BY-SA",
        "CC0",
        "publisher-permission",
        "unknown",
      ]),
      licenseUrl: z.url().optional(),
      // Hard gate: only true figures are ever rendered.
      rightsConfirmed: z.boolean().default(false),
      order: z.number().default(0),
    }),
});

// One JSON record per event, with native Astro assets for every album photo.
const gallery = defineCollection({
  loader: file("src/data/gallery.json"),
  schema: ({ image }) => galleryEventSchema.extend({
    members: z.array(reference("people")).default([]),
    photos: z.array(galleryPhotoSchema.extend({ src: image() })).min(1),
  }),
});

const news = defineCollection({
  loader: file("src/data/news.json", { parser: referenceParser }),
  schema: ({ image }) => newsSchema.extend({
    image: image().optional(),
    relatedMembers: z.array(reference("people")).default([]),
    relatedPublications: z.array(reference("publications")).default([]),
  }),
});

const talks = defineCollection({
  loader: file("src/data/talks.json", { parser: referenceParser }),
  schema: talksSchema,
});

const longFormSchema = ({ image }: { image: import("astro:content").SchemaContext["image"] }) => z.preprocess(resolve, articleSchema.extend({
  coverImage: image().optional(),
  relatedPublications: z.array(reference("publications")).default([]),
}));
const blog = defineCollection({ loader: glob({ pattern: "**/*.md", base: "./src/content/blog" }), schema: longFormSchema });
const notes = defineCollection({ loader: glob({ pattern: "**/*.md", base: "./src/content/notes" }), schema: longFormSchema });
const research = defineCollection({ loader: file("src/data/research.json"), schema: ({ image }) => researchSchema.extend({ image: image().optional() }) });

export const collections = { people, biographies, publications, figures, gallery, news, talks, blog, notes, research };

import { z } from "zod";

const contentId = z.union([
  z.string().regex(/^[A-Za-z0-9][A-Za-z0-9_-]*$/),
  z.number().int().positive(),
]).transform(String);
const text = z.string().trim().min(1);
const externalUrl = z.url().refine((value) => /^https?:\/\//.test(value), "Use an HTTP(S) URL");
export const contentLink = z.object({ label: text, url: z.union([externalUrl, z.string().regex(/^\/(?!\/)[a-z0-9/_-]*(?:#[a-z0-9_-]+)?$/i)]) });
const materialUrl = z.union([externalUrl, z.string().regex(/^\/files\/[A-Za-z0-9_./-]+$/).refine((value) => !value.split("/").includes(".."))]);
const relations = {
  relatedMembers: z.array(contentId).default([]),
  relatedPublications: z.array(contentId).default([]),
};

export const newsSchema = z.strictObject({
  id: contentId, title: text, date: z.iso.date(), summary: text, category: text,
  image: text.optional(), imageAlt: text.optional(), externalLink: externalUrl.optional(),
  links: z.array(contentLink).default([]),
  ...relations, featured: z.boolean().default(false),
});

export const TALK_TYPES = ["Seminar", "Conference talk", "Workshop", "Tutorial"] as const;
const timeZone = z.string().refine((value) => {
  try { new Intl.DateTimeFormat("en", { timeZone: value }); return true; } catch { return false; }
}, "Use a valid IANA time zone");
export const talksSchema = z.strictObject({
  id: contentId, title: text,
  speaker: z.object({ name: text.optional(), personId: contentId.optional() }).refine((speaker) => speaker.name || speaker.personId, "A speaker needs a name or personId"),
  date: z.iso.datetime({ offset: true }), endDate: z.iso.datetime({ offset: true }).optional(),
  timeZone: timeZone.default("Europe/Luxembourg"),
  event: text, type: z.enum(TALK_TYPES).default("Seminar"), location: text, abstract: text,
  relatedPublications: z.array(contentId).default([]), slides: materialUrl.optional(),
  video: externalUrl.optional(), eventWebsite: externalUrl.optional(),
}).refine((talk) => !talk.endDate || Date.parse(talk.endDate) > Date.parse(talk.date), "A timed talk must end after it starts");

const authorSchema = z.object({ name: text.optional(), personId: contentId.optional() })
  .refine((author) => author.name || author.personId, "An author needs a name or personId");

// Explicit slugs keep public URLs independent of Markdown file names.
export const articleSchema = z.object({
  title: text, slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/), date: z.iso.date(),
  authors: z.array(authorSchema).min(1), summary: text, tags: z.array(text).default([]),
  coverImage: text.optional(), coverAlt: text.optional(),
  status: z.enum(["draft", "published"]).default("draft"),
  relatedPublications: z.array(contentId).default([]), isMock: z.boolean().default(false),
});

export function isPublishedArticle(article: { status: "draft" | "published"; date: string }, today = new Date().toISOString().slice(0, 10)) {
  return article.status === "published" && article.date <= today;
}

interface Relations { relatedMembers?: string[]; relatedPublications?: string[]; speaker?: { personId?: string }; authors?: { personId?: string }[] }
export function validateEditorialReferences(records: readonly (Relations & { id: string })[], people: Set<string>, publications: Set<string>) {
  const seen = new Set<string>();
  for (const record of records) {
    if (seen.has(record.id)) throw new Error(`Duplicate editorial ID: ${record.id}`);
    seen.add(record.id);
    const members = [...(record.relatedMembers ?? []), ...(record.authors ?? []).flatMap((author) => author.personId ? [author.personId] : []), ...(record.speaker?.personId ? [record.speaker.personId] : [])];
    for (const id of members) if (!people.has(id)) throw new Error(`${record.id}: unknown member ${id}`);
    for (const id of record.relatedPublications ?? []) if (!publications.has(id)) throw new Error(`${record.id}: unknown publication ${id}`);
  }
}

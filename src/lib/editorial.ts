import { getCollection } from "astro:content";
import { personDisplayName } from "./people-schema";
import { isPublishedArticle } from "./editorial-schema";

export const formatDate = (date: string) => new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(date));
export const formatTalkTime = (date: string, timeZone = "Europe/Luxembourg") => new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone, timeZoneName: "short" }).format(new Date(date));

export const talkHasEnded = (talk: { date: string; endDate?: string }, now = Date.now()) => Date.parse(talk.endDate ?? talk.date) <= now;

export async function getEditorialContext() {
  const [people, publications] = await Promise.all([getCollection("people"), getCollection("publications")]);
  return { people: new Map(people.map((person) => [person.id, person])), publications: new Map(publications.map((paper) => [paper.id, paper])) };
}

export async function getNews() {
  const today = new Date().toISOString().slice(0, 10);
  return (await getCollection("news")).filter((entry) => entry.data.date <= today).sort((a, b) => b.data.date.localeCompare(a.data.date) || a.id.localeCompare(b.id));
}

export async function getArticles(collection: "blog" | "notes") {
  const entries = await getCollection(collection);
  const slugs = new Set<string>();
  const context = await getEditorialContext();
  for (const entry of entries) {
    if (slugs.has(entry.data.slug)) throw new Error(`Duplicate ${collection} slug: ${entry.data.slug}`);
    slugs.add(entry.data.slug);
    for (const author of entry.data.authors) if (author.personId && !context.people.has(author.personId)) throw new Error(`${entry.id}: unknown author ${author.personId}`);
    for (const paper of entry.data.relatedPublications) if (!context.publications.has(paper.id)) throw new Error(`${entry.id}: unknown publication ${paper.id}`);
  }
  return entries.filter((entry) => isPublishedArticle(entry.data)).sort((a, b) => b.data.date.localeCompare(a.data.date) || a.id.localeCompare(b.id));
}

export function authorName(author: { name?: string; personId?: string }, context: Awaited<ReturnType<typeof getEditorialContext>>) {
  return author.name ?? (author.personId && context.people.has(author.personId) ? personDisplayName(context.people.get(author.personId)!.data) : "Unknown author");
}

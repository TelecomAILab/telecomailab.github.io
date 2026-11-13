import { getCollection, type CollectionEntry } from "astro:content";
import type { AreaSlug } from "./publication-schema";
import { publicationRoles } from "./publication-authors";
import { PERSON_GROUPS } from "./people-schema";
export type { AreaSlug } from "./publication-schema";

export type Person = CollectionEntry<"people">;
export type Publication = CollectionEntry<"publications">;
export type Figure = CollectionEntry<"figures">;

// Research taxonomy labels match AREA_SLUGS in publication-schema.ts.
// Review/letter are legacy compatibility tags; new publication types are separate.
export const AREA_LABELS: Record<AreaSlug, string> = {
  methods: "Open tools & datasets",
  "edge-ai-network-management": "Resource Allocation and Network Management with Edge AI",
  "semantic-earth-observation": "Semantic Communications for Earth Observation",
  "data-model-ecosystems": "Data and AI Model Marketplace Ecosystems",
  review: "Review",
  letter: "Letter / commentary",
};

// Publications filter chips, grouped (slugs reference AREA_LABELS).
export const FILTER_GROUPS: { title: string; slugs: AreaSlug[] }[] = [
  { title: "Topic", slugs: ["edge-ai-network-management", "semantic-earth-observation", "data-model-ecosystems", "methods"] },
];

/** Count of publications per area slug (for filter-chip labels). */
export async function getAreaCounts() {
  const pubs = await getPublications();
  const counts: Partial<Record<AreaSlug, number>> = {};
  for (const p of pubs) for (const a of p.data.areas as AreaSlug[]) counts[a] = (counts[a] || 0) + 1;
  return counts;
}

// Display order of members within each group.
const byOrder = (a: Person, b: Person) => a.data.order - b.data.order;

/** People in the shared group order, then numeric order within each group. */
export async function getGroupedPeople() {
  const people = await getCollection("people");
  return PERSON_GROUPS.map((group) => ({
    group,
    people: people.filter((p) => p.data.group === group).sort(byOrder),
  })).filter((g) => g.people.length > 0);
}

/** Publications newest-first. */
export async function getPublications() {
  const pubs = await getCollection("publications");
  return pubs.sort(
    (a, b) => b.data.year - a.data.year || a.data.title.localeCompare(b.data.title),
  );
}

/** Only rights-confirmed figures may ever be rendered (hard gate). */
async function getConfirmedFigures() {
  const figs = await getCollection("figures");
  return figs
    .filter((f) => f.data.rightsConfirmed === true)
    .sort((a, b) => a.data.order - b.data.order);
}

/** Rights-confirmed figures grouped by their publication, ordered for display. */
export async function getFiguresByPaper() {
  const figs = await getConfirmedFigures();
  const pubById = new Map((await getCollection("publications")).map((p) => [p.id, p]));
  const groups = new Map<string, { paper: Publication; figures: Figure[]; order: number }>();
  for (const f of figs) {
    const id = f.data.paper.id;
    const paper = pubById.get(id);
    if (!paper) continue;
    if (!groups.has(id)) groups.set(id, { paper, figures: [], order: f.data.order });
    groups.get(id)!.figures.push(f);
  }
  // Order a paper's figures by figure number parsed from the legend (Figure 2,
  // 5, 9, …); a graphical abstract (no number) leads, anything unparsed trails.
  const figNum = (caption: string) => {
    const m = /^\s*fig(?:ure)?\.?\s*(\d+)/i.exec(caption);
    if (m) return Number(m[1]);
    if (/graphical abstract/i.test(caption)) return 0;
    return Number.POSITIVE_INFINITY;
  };
  const arr = [...groups.values()];
  for (const g of arr) g.figures.sort((a, b) => figNum(a.data.caption) - figNum(b.data.caption));
  // Papers chronological, most recent first.
  arr.sort((a, b) => b.paper.data.year - a.paper.data.year || a.order - b.order);
  return arr;
}

/** Publications linked by explicit person ID, preserving the supplied ordering. */
export function publicationsForPerson(person: Person, pubs: Publication[]) {
  return pubs.filter((p) => p.data.authors.some((author) => author.personId === person.id));
}

/** Shared role policy for homepage selection and publication badges. */
export function featuredMatcher(people: Person[]) {
  const directory = new Map(people.map((person) => [person.id, person]));
  return (p: Publication) => publicationRoles(p.data, directory).featured;
}

/** Sort featured papers: mentee-led first, then most recent. */
export function featuredSorter(people: Person[]) {
  const directory = new Map(people.map((person) => [person.id, person]));
  return (a: Publication, b: Publication) => {
    const diff = Number(publicationRoles(b.data, directory).menteeLed)
      - Number(publicationRoles(a.data, directory).menteeLed);
    return diff || b.data.year - a.data.year;
  };
}

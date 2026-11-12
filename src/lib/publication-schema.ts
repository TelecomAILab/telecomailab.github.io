import { z } from "zod";

export const AREA_SLUGS = [
  "topic-one", "topic-two", "topic-three", "methods", "theory", "review", "letter",
  "edge-ai-network-management", "semantic-earth-observation", "data-model-ecosystems",
] as const;
export type AreaSlug = (typeof AREA_SLUGS)[number];

export const PUBLICATION_TYPES = [
  "journal-article", "conference-paper", "workshop-paper", "preprint",
  "book-chapter", "review-article", "other",
] as const;
export type PublicationType = (typeof PUBLICATION_TYPES)[number];
export const PUBLICATION_TYPE_LABELS: Record<PublicationType, string> = {
  "journal-article": "Journal Article",
  "conference-paper": "Conference Paper",
  "workshop-paper": "Workshop Paper",
  preprint: "Preprint",
  "book-chapter": "Book Chapter",
  "review-article": "Review Article",
  other: "Other Academic Output",
};

// Web links must be navigable; locally hosted materials live below public/files/.
const webUrl = z.url({ protocol: /^https?$/ });
const materialUrl = z.union([
  webUrl,
  z.string().regex(/^\/files\/(?!.*(?:\.\.|[?#\\])).+$/, "Local materials must use /files/ paths"),
]);

// Existing slug IDs remain valid. New numeric IDs become strings in Astro's store.
const identifier = z.union([
  z.string().min(1).regex(/^\S+$/, "IDs must not contain whitespace"),
  z.number().int().positive(),
])
  .transform(String);

const authorSchema = z.strictObject({
  name: z.string().trim().min(1),
  personId: identifier.optional(),
  coFirst: z.boolean().optional(),
  coSenior: z.boolean().optional(),
  corresponding: z.boolean().optional(),
  email: z.email().optional(),
  contributions: z.array(z.string().trim().min(1)).optional(),
});

export const publicationSchema = z.strictObject({
  id: identifier,
  title: z.string().trim().min(1),
  authors: z.array(authorSchema).min(1),
  year: z.number().int().min(1800).max(2200),
  publicationType: z.enum(PUBLICATION_TYPES).optional(),
  journalName: z.string().trim().min(1).optional(),
  conferenceName: z.string().trim().min(1).optional(),
  venue: z.string().trim().min(1).optional(),
  publisher: z.string().trim().min(1).optional(),
  volume: z.string().trim().min(1).optional(),
  issue: z.string().trim().min(1).optional(),
  pages: z.string().trim().min(1).optional(),
  doi: z.string().trim().regex(/^10\.\d{4,9}\/\S+$/i).optional(),
  pmid: z.string().optional(),
  pmcid: z.string().optional(),
  arxivId: z.string().regex(/^(?:\d{4}\.\d{4,5}|[a-z-]+(?:\.[A-Z]{2})?\/\d{7})(?:v\d+)?$/i).optional(),
  url: webUrl.optional(),
  pdfUrl: materialUrl.optional(),
  codeUrl: materialUrl.optional(),
  projectUrl: z.union([webUrl, z.string().regex(/^\/(?!\/)[a-z0-9/_-]+(?:#[a-z0-9_-]+)?$/i)]).optional(),
  slidesUrl: materialUrl.optional(),
  presentationMaterials: z.array(z.strictObject({ label: z.string().trim().min(1), url: materialUrl })).optional(),
  bibtex: z.string().trim().regex(/^@[A-Za-z]+\s*[{(][\s\S]*[})]$/, "BibTeX must be an entry beginning with @type").optional(),
  scholarUrl: webUrl.optional(),
  citationCount: z.number().int().nonnegative().optional(),
  abstract: z.string().trim().min(1).optional(),
  image: z.string().regex(/^\.\.\/assets\//, "Publication images must reference local src/assets").optional(),
  imageAlt: z.string().trim().min(1).optional(),
  keywords: z.array(z.string().trim().min(1)).optional(),
  sourceUrls: z.array(webUrl).optional(),
  verification: z.strictObject({
    method: z.enum(["doi", "manual"]),
    sourceUrl: webUrl,
    checkedAt: z.iso.datetime(),
  }).optional(),
  // Optional legacy assertions preserve metadata while author mappings are reviewed.
  isMenteePaper: z.boolean().optional(),
  menteeFirstAuthor: z.boolean().optional(),
  piFirstOrSenior: z.boolean().optional(),
  collaboration: z.boolean().optional(),
  featured: z.boolean().optional(),
  openAccess: z.boolean().default(false),
  isMock: z.boolean().default(false),
  areas: z.array(z.enum(AREA_SLUGS)).default([]),
});

export type PublicationRecord = z.output<typeof publicationSchema>;
// Bibliographic helpers accept both raw paths and Astro's processed image assets.
export type PublicationMetadata = Omit<PublicationRecord, "image">;
export type PublicationAuthor = z.output<typeof authorSchema>;

export const publicationRecordsSchema = z.array(publicationSchema).superRefine((records, ctx) => {
  const ids = new Set<string>();
  const dois = new Map<string, string>();
  records.forEach((record, index) => {
    if (ids.has(record.id)) ctx.addIssue({ code: "custom", path: [index, "id"], message: `Duplicate publication ID: ${record.id}` });
    ids.add(record.id);
    if (record.doi) {
      const doi = record.doi.toLowerCase();
      if (dois.has(doi)) ctx.addIssue({ code: "custom", path: [index, "doi"], message: `Duplicate DOI: ${record.doi} (also in ${dois.get(doi)})` });
      dois.set(doi, record.id);
    }
  });
});

/** Fail before file() can overwrite duplicate IDs or retain stale collection data. */
export function validatePublicationRecords(input: unknown, personIds: ReadonlySet<string>, localAssetExists?: (path: string) => boolean) {
  const records = publicationRecordsSchema.parse(input);
  const invalid = records.flatMap((record) => record.authors.flatMap((author) =>
    author.personId && !personIds.has(author.personId)
      ? [`${record.id}: ${author.name} references unknown personId ${author.personId}`]
      : [],
  ));
  if (invalid.length) throw new Error(`Invalid publication author references:\n${invalid.join("\n")}`);
  if (localAssetExists) {
    const missing = records.flatMap((record) => [record.pdfUrl, record.codeUrl, record.slidesUrl, ...(record.presentationMaterials ?? []).map((material) => material.url)]
      .filter((path): path is string => !!path && path.startsWith("/") && !localAssetExists(path))
      .map((path) => `${record.id}: missing local material ${path}`));
    if (missing.length) throw new Error(missing.join("\n"));
  }
  return records;
}

// Compatibility aliases are derived, never stored as competing JSON fields.
export const withPublicationAliases = <T extends { venue?: string; journalName?: string; conferenceName?: string; citationCount?: number }>(record: T) => ({
  ...record,
  journal: record.venue ?? record.journalName ?? record.conferenceName,
  citations: record.citationCount,
});
export const publicationCollectionSchema = publicationSchema.transform(withPublicationAliases);

import { z } from "zod";
import { validatePublicationRecords, type PublicationRecord } from "./publication-schema.ts";

const crossrefWork = z.object({
  DOI: z.string(), title: z.array(z.string()),
  author: z.array(z.object({ given: z.string().optional(), family: z.string().optional(), name: z.string().optional() })),
  issued: z.object({ "date-parts": z.array(z.array(z.number())) }),
  "container-title": z.array(z.string()).optional(),
  publisher: z.string().optional(), volume: z.string().optional(), issue: z.string().optional(), page: z.string().optional(),
});
const normalized = (text: string) => text.normalize("NFKD").toLowerCase().replace(/[^a-z0-9]/g, "");

/** Verify supplied core fields against source metadata; never infer member identities. */
export function verifyDoiMetadata(record: PublicationRecord, input: unknown) {
  const work = crossrefWork.parse(input);
  const errors: string[] = [];
  if (!record.doi || work.DOI.toLowerCase() !== record.doi.toLowerCase()) errors.push("DOI differs");
  if (!work.title.some((title) => normalized(title) === normalized(record.title))) errors.push("Title differs");
  if (work.issued["date-parts"][0]?.[0] !== record.year) errors.push("Year differs");
  const names = work.author.map((author) => author.name ?? [author.given, author.family].filter(Boolean).join(" "));
  if (names.length !== record.authors.length || names.some((name, index) => normalized(name) !== normalized(record.authors[index]?.name ?? ""))) errors.push("Ordered author names differ; manual verification required");
  const venue = record.journalName ?? record.conferenceName ?? record.venue;
  if (venue && !work["container-title"]?.some((title) => normalized(title) === normalized(venue))) errors.push("Venue differs");
  for (const field of ["publisher", "volume", "issue"] as const) {
    if (record[field] && normalized(record[field]) !== normalized(work[field] ?? "")) errors.push(`${field} differs`);
  }
  if (record.pages && normalized(record.pages) !== normalized(work.page ?? "")) errors.push("Pages differ");
  return errors;
}

interface ImportOptions {
  reviewed?: boolean;
  lookupDoi?: (doi: string) => Promise<unknown>;
}

/** Return a review report only. This module has no filesystem write capability. */
export async function preparePublicationImport(input: unknown, existing: unknown, personIds: ReadonlySet<string>, options: ImportOptions = {}) {
  const current = validatePublicationRecords(existing, personIds);
  const candidates = validatePublicationRecords(input, personIds);
  // Also catches cross-file ID/DOI collisions, so curated records cannot be replaced.
  validatePublicationRecords([...current, ...candidates], personIds);
  const report = [];
  for (const candidate of candidates) {
    const issues: string[] = [];
    let verification = candidate.verification;
    if (candidate.isMock) issues.push("Fictional records cannot be verified import candidates");
    else if (candidate.doi && options.lookupDoi) {
      try {
        const metadata = await options.lookupDoi(candidate.doi);
        issues.push(...verifyDoiMetadata(candidate, metadata));
        if (!issues.length) verification = { method: "doi", sourceUrl: `https://api.crossref.org/works/${encodeURIComponent(candidate.doi)}`, checkedAt: new Date().toISOString() };
      } catch (error) {
        issues.push(`DOI verification unavailable: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
    if (!verification) issues.push("A verified source URL and verification date are required");
    if (!options.reviewed) issues.push("Review all metadata, resources, and author relationships; rerun with --reviewed after confirmation");
    report.push({ id: candidate.id, status: issues.length ? "needs-review" : "ready", issues,
      ...(issues.length ? {} : { record: { ...candidate, verification } }),
    });
  }
  return { writesProduction: false, report };
}

import { z } from "zod";

export const citationRecordSchema = z.strictObject({
  id: z.union([z.string().trim().min(1).regex(/^\S+$/), z.number().int().positive()]).transform(String),
  // null is unknown; a confirmed zero is a number and remains visible.
  citationCount: z.number().int().nonnegative().nullable(),
});
export const citationRecordsSchema = z.array(citationRecordSchema).superRefine((records, ctx) => {
  const seen = new Set<string>();
  records.forEach((record, index) => {
    if (seen.has(record.id)) ctx.addIssue({code: "custom", path: [index, "id"], message: `Duplicate citation ID: ${record.id}`});
    seen.add(record.id);
  });
});

export function createCitationIndex(input: unknown, publicationIds: ReadonlySet<string>) {
  const records = citationRecordsSchema.parse(input);
  for (const record of records) if (!publicationIds.has(record.id)) throw new Error(`Unknown publication in citations.json: ${record.id}`);
  return new Map(records.map(record => [record.id, record.citationCount]));
}

/** Citation metadata is joined at read time and never written back to publications. */
export function withCitationCount<T extends {id: string}>(record: T, counts: ReadonlyMap<string, number | null>) {
  return { ...record, citationCount: counts.get(record.id) ?? undefined };
}

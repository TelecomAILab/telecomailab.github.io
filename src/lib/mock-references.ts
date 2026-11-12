interface ReferenceDirectory {
  people: ReadonlySet<string>;
  publications: ReadonlySet<string>;
  funders?: ReadonlySet<string>;
  projects?: ReadonlySet<string>;
}

const object = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);
const referenceId = (value: unknown): string | undefined => {
  if (typeof value === "string" || typeof value === "number") return String(value);
  if (object(value) && (typeof value.id === "string" || typeof value.id === "number")) return String(value.id);
};

/** Resolve retained examples for display without changing their editable source records.
 * Real records pass through unchanged so the normal strict validators still apply.
 */
export function resolveMockReferences(input: unknown, directory: ReferenceDirectory, source: string, warn: (message: string) => void = console.warn): unknown {
  if (!object(input) || input.isMock !== true) return input;
  const result = { ...input };
  const label = `${source} [${input.id ?? input.slug ?? input.title ?? "mock"}]`;
  const present = (value: unknown, known: ReadonlySet<string>, field: string) => {
    const id = referenceId(value);
    // Leave malformed values to the schema, rather than silently correcting them.
    if (id === undefined || known.has(id)) return true;
    warn(`[mock reference] ${label}: ${field} → ${id} is unavailable; omitted from display only. Source retained.`);
    return false;
  };
  const person = (value: unknown, field: string, fallback: string) => {
    if (!object(value) || value.personId === undefined || present(value.personId, directory.people, `${field}.personId`)) return value;
    const { personId: _id, ...remaining } = value;
    return { ...remaining, name: remaining.name || fallback };
  };
  if (Array.isArray(result.authors)) result.authors = result.authors.map((author, index) => person(author, `authors[${index}]`, "Author not listed"));
  if (result.speaker) result.speaker = person(result.speaker, "speaker", "Speaker not listed");
  const arrays: Record<string, ReadonlySet<string> | undefined> = {
    members: directory.people, relatedMembers: directory.people,
    teamPersonIds: directory.people, maintainerPersonIds: directory.people,
    relatedPublications: directory.publications, publicationIds: directory.publications,
    relatedProjectIds: directory.projects,
  };
  for (const [field, known] of Object.entries(arrays)) {
    const values = result[field];
    if (known && Array.isArray(values)) result[field] = values.filter((value) => present(value, known, field));
  }
  const scalars: Record<string, ReadonlySet<string> | undefined> = {
    leadPersonId: directory.people, publicationId: directory.publications, funderId: directory.funders,
  };
  for (const [field, known] of Object.entries(scalars)) {
    if (known && result[field] !== undefined && !present(result[field], known, field)) delete result[field];
  }
  return result;
}

import { z } from "zod";

export const PERSON_GROUPS = [
  "Lab Leadership", "Faculty", "Research Scientists", "Researchers", "Postdocs",
  "Staff", "PhD Students", "Master's Students", "Students", "Interns",
  "Collaborators", "Guests", "Affiliates", "Former Members", "Alumni",
] as const;

// Single path segments preserve existing profile URLs and numeric fixture IDs.
const personId = z.union([
  z.string().regex(/^[A-Za-z0-9][A-Za-z0-9_-]*$/, "Person IDs must be valid profile path segments"),
  z.number().int().positive(),
]).transform(String);

export const personSchema = z.strictObject({
  id: personId,
  name: z.string().trim().min(1),
  displayName: z.string().trim().min(1).optional(),
  status: z.enum(["current", "alumni"]),
  group: z.enum(PERSON_GROUPS),
  role: z.string().trim().min(1),
  publicationRole: z.enum(["pi", "senior", "mentee"]).optional(),
  title: z.string().trim().min(1).optional(),
  affiliation: z.string().trim().min(1).optional(),
  researchInterests: z.array(z.string().trim().min(1)).default([]),
  // Reference a Markdown-only biography; no structured member fields live there.
  biography: personId.optional(),
  // Paths resolve relative to src/data/people.json, not the biography file.
  headshot: z.string().regex(/^(?:\.\.\/)+(?:src\/)?assets\//, "Headshots must reference local src/assets images").optional(),
  sourceUrls: z.array(z.url({ protocol: /^https?$/ })).optional(),
  links: z.strictObject({
    email: z.email().optional(),
    website: z.url().optional(),
    scholar: z.url().optional(),
    orcid: z.url().optional(),
    linkedin: z.url().optional(),
    github: z.url().optional(),
    twitter: z.url().optional(),
  }).default({}),
  order: z.number().default(0),
  featured: z.boolean().default(false),
});


export const peopleRecordsSchema = z.array(personSchema).superRefine((people, ctx) => {
  const ids = new Set<string>();
  people.forEach((person, index) => {
    if (ids.has(person.id)) {
      ctx.addIssue({ code: "custom", path: [index, "id"], message: `Duplicate person ID: ${person.id}` });
    }
    ids.add(person.id);
  });
});

interface PeopleResources {
  headshotExists: (path: string) => boolean;
  biographyExists: (id: string) => boolean;
}

/** Validate before file() can overwrite duplicate records or leave broken references. */
export function validatePeopleRecords(input: unknown, resources: PeopleResources) {
  const people = peopleRecordsSchema.parse(input);
  const errors: string[] = [];
  for (const person of people) {
    if (person.headshot && !resources.headshotExists(person.headshot)) {
      errors.push(`${person.id}: missing headshot ${person.headshot}`);
    }
    if (person.biography && !resources.biographyExists(person.biography)) {
      errors.push(`${person.id}: missing biography ${person.biography}`);
    }
  }
  if (errors.length) throw new Error(`Invalid People resources:\n${errors.join("\n")}`);
  return people;
}

export function personDisplayName(person: { name: string; displayName?: string }) {
  return person.displayName ?? person.name;
}

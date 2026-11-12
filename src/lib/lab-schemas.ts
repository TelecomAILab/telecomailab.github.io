import { z } from "zod";
import { AREA_SLUGS } from "./publication-schema.ts";

const id = z.union([z.string().min(1), z.number().int().positive()]).transform(String);
export const RESOURCE_CATEGORIES = ["Software", "Datasets", "Benchmarks", "Tutorials", "Presentations", "Templates", "Hardware"] as const;
export const funderSchema = z.object({ id, name: z.string(), shortName: z.string(), programme: z.string(), isMock: z.boolean().default(false) });
export const projectSchema = z.object({
  id, acronym: z.string().trim().min(1), title: z.string().trim().min(1), funderId: id.optional(), status: z.enum(["active", "completed"]).optional(),
  startYear: z.number().int().optional(), endYear: z.number().int().optional(),
  startDate: z.iso.date().optional(), endDate: z.iso.date().optional(),
  programme: z.string().optional(), website: z.url().optional(),
  leadName: z.string().optional(), teamNames: z.array(z.string()).default([]), budgetEUR: z.number().positive().optional(),
  grantId: z.string().optional(), leadPersonId: id.optional(), teamPersonIds: z.array(id).default([]),
  partners: z.array(z.string()).default([]), areas: z.array(z.enum(AREA_SLUGS)),
  summary: z.string().trim().min(1), outputs: z.array(z.string()).default([]), publicationIds: z.array(id).default([]),
  isMock: z.boolean().default(false),
});
export const resourceSchema = z.object({
  id, title: z.string(), category: z.enum(RESOURCE_CATEGORIES).exclude(["Hardware"]), summary: z.string(),
  url: z.string().regex(/^(https?:\/\/|\/files\/)/), format: z.string(), license: z.string(), version: z.string(),
  access: z.enum(["open", "request"]), tags: z.array(z.string()).default([]), updated: z.iso.date(),
  maintainerPersonIds: z.array(id), publicationId: id.optional(), featured: z.boolean().default(false), isMock: z.boolean().default(false),
});

export const fundingSchema = z.object({ funders: z.array(funderSchema), projects: z.array(projectSchema) });

// Hardware has no implied access, quantity, configuration, or purchase date.
export const hardwareSchema = z.strictObject({
  id, title: z.string().trim().min(1), category: z.literal("Hardware").default("Hardware"),
  hardwareCategory: z.string().trim().min(1).optional(),
  manufacturer: z.string().trim().min(1).optional(), model: z.string().trim().min(1).optional(),
  purchaseYear: z.number().int().min(1900).max(2200).optional(), purchaseDate: z.iso.date().optional(),
  specifications: z.string().trim().min(1).optional(), quantity: z.number().int().positive().optional(),
  description: z.string().trim().min(1).optional(), researchApplications: z.array(z.string()).default([]),
  location: z.string().trim().min(1).optional(),
  availability: z.enum(["Available", "By arrangement", "Unavailable"]).optional(),
  relatedProjectIds: z.array(id).default([]),
  image: z.string().regex(/^\.\.\/assets\/hardware\/[a-z0-9]+(?:-[a-z0-9]+)*\.(?:jpg|jpeg|png|webp|svg)$/).optional(),
  imageAlt: z.string().trim().min(1).optional(), order: z.number().default(0),
  sourceUrl: z.url({ protocol: /^https?$/ }).optional(), reviewNotes: z.string().optional(),
  isMock: z.boolean().default(false),
}).refine((item) => !item.image || !!item.imageAlt, "Equipment images need descriptive alt text")
  .refine((item) => !item.purchaseDate || !item.purchaseYear || Number(item.purchaseDate.slice(0, 4)) === item.purchaseYear, "Purchase date and year must agree");
export type Hardware = Omit<z.output<typeof hardwareSchema>, "reviewNotes">;

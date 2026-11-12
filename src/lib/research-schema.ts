import { z } from "zod";
import { AREA_SLUGS } from "./publication-schema.ts";
import { contentLink } from "./editorial-schema.ts";

export const researchSchema = z.object({
  id: z.enum(AREA_SLUGS), title: z.string().min(1), summary: z.string().min(1), description: z.string().min(1),
  approach: z.string().min(1), applications: z.string().min(1),
  image: z.string().min(1).optional(), imageAlt: z.string().min(1).optional(),
  motivation: z.string().optional(), challenges: z.array(z.string()).optional(), keywords: z.array(z.string()).optional(),
  links: z.array(contentLink).default([]), order: z.number().default(0), isMock: z.boolean().default(false),
});

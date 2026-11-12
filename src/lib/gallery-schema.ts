import { z } from "zod";

export const GALLERY_CATEGORIES = ["Conferences", "Workshops & Seminars", "Lab Activities", "Research Visits", "Celebrations", "Team Events"] as const;
const id = z.union([z.string().regex(/^[A-Za-z0-9][A-Za-z0-9_-]*$/), z.number().int().positive()]).transform(String);
// A year is sufficient when the organizer has not supplied an exact event date.
const eventDate = z.union([z.iso.date(), z.string().regex(/^\d{4}$/)]);
export const galleryPhotoSchema = z.strictObject({
  src: z.string().regex(/^\.\.\/assets\/gallery\/(?!.*(?:\.\.|[?#\\])).+\.(?:jpe?g|png|webp|avif|svg)$/i),
  alt: z.string().trim().min(1),
  caption: z.string().trim().min(1).optional(),
  featured: z.boolean().default(false),
  featuredHome: z.boolean().default(false),
});
export const galleryEventSchema = z.strictObject({
  id, title: z.string().trim().min(1), date: eventDate,
  dateLabel: z.string().trim().min(1).optional(),
  description: z.string().trim().min(1).optional(),
  category: z.enum(GALLERY_CATEGORIES).default("Lab Activities"),
  members: z.array(id).default([]),
  location: z.string().trim().min(1).optional(),
  eventUrl: z.url({ protocol: /^https?$/ }).optional(),
  order: z.number().default(0),
  photos: z.array(galleryPhotoSchema).min(1),
});

export function validateGalleryRecords(input: unknown, members: ReadonlySet<string>, imageExists: (path: string) => boolean) {
  const events = z.array(galleryEventSchema).parse(input);
  const ids = new Set<string>();
  for (const event of events) {
    if (ids.has(event.id)) throw new Error(`Duplicate gallery event ID: ${event.id}`);
    ids.add(event.id);
    for (const member of event.members) if (!members.has(member)) throw new Error(`${event.id}: unknown gallery member ${member}`);
    const photos = new Set<string>();
    for (const photo of event.photos) {
      if (photos.has(photo.src)) throw new Error(`${event.id}: duplicate gallery photo ${photo.src}`);
      photos.add(photo.src);
      if (!imageExists(photo.src)) throw new Error(`${event.id}: missing gallery photo ${photo.src}`);
    }
  }
  return events;
}

export function galleryDate(event: { date: string; dateLabel?: string }) {
  if (event.dateLabel) return event.dateLabel;
  if (event.date.length === 4) return event.date;
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(event.date));
}

export function compareGalleryEvents(a: { date: string; order: number; id: string }, b: { date: string; order: number; id: string }) {
  return b.date.localeCompare(a.date) || a.order - b.order || a.id.localeCompare(b.id);
}

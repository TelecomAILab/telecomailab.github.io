import { getImage } from "astro:assets";
import type { CollectionEntry } from "astro:content";
import type { GalleryImage } from "./gallery-selection";

export async function prepareGalleryPhoto(photo: CollectionEntry<"gallery">["data"]["photos"][number]): Promise<GalleryImage> {
  const widths = [...new Set([Math.min(400, photo.src.width), Math.min(800, photo.src.width)])];
  const [full, ...thumbnails] = await Promise.all([
    getImage({ src: photo.src, width: Math.min(1600, photo.src.width), format: "webp" }),
    ...widths.map(width => getImage({ src: photo.src, width, format: "webp" })),
  ]);
  const width = widths.at(-1)!;
  return {
    src: full.src, thumbnail: thumbnails.at(-1)!.src,
    srcset: thumbnails.map((image, index) => `${image.src} ${widths[index]}w`).join(", "),
    width, height: Math.round(width * photo.src.height / photo.src.width),
    alt: photo.alt, caption: photo.caption, featured: photo.featured, featuredHome: photo.featuredHome,
  };
}

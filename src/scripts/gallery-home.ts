import { selectGalleryPhoto, type GalleryImage } from "../lib/gallery-selection";
const root = document.querySelector<HTMLElement>("[data-home-gallery]");
if (root) {
  const candidates: (GalleryImage & { eventId: string; title: string })[] = JSON.parse(root.querySelector("[data-home-gallery-photos]")!.textContent!);
  const selected = selectGalleryPhoto(candidates, "home")?.photo;
  const link = root.querySelector<HTMLAnchorElement>("[data-home-gallery-link]");
  const image = link?.querySelector("img");
  if (selected && link && image) {
    image.srcset = selected.srcset;
    image.src = selected.thumbnail;
    image.alt = selected.alt;
    image.width = selected.width;
    image.height = selected.height;
    link.href = `/about#event-${selected.eventId}`;
    link.setAttribute("aria-label", `View album: ${selected.title}`);
  }
}

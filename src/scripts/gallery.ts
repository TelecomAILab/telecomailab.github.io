import { selectGalleryPhoto, type GalleryAlbum } from "../lib/gallery-selection";

const root = document.querySelector<HTMLElement>("[data-gallery-root]");
if (root) {
  const albums: GalleryAlbum[] = JSON.parse(root.querySelector("[data-gallery-albums]")!.textContent!);
  const byId = new Map(albums.map(album => [album.id, album]));
  const figures = [...root.querySelectorAll<HTMLElement>("[data-gallery-item]")];
  const filters = [...root.querySelectorAll<HTMLButtonElement>("[data-gallery-category]")];
  const dialog = root.querySelector<HTMLDialogElement>("#lightbox")!;
  const image = root.querySelector<HTMLImageElement>("#lightbox-img")!;
  const caption = root.querySelector<HTMLElement>("#lightbox-caption")!;
  const title = root.querySelector<HTMLElement>("#lightbox-title")!;
  const date = root.querySelector<HTMLElement>("#lightbox-date")!;
  const position = root.querySelector<HTMLElement>("[data-gallery-position]")!;
  const thumbnails = root.querySelector<HTMLElement>("[data-gallery-thumbnails]")!;
  const previous = root.querySelector<HTMLButtonElement>("[data-gallery-prev]")!;
  const next = root.querySelector<HTMLButtonElement>("[data-gallery-next]")!;
  let selected: HTMLButtonElement | undefined;
  let album: GalleryAlbum | undefined;
  let photoIndex = 0;
  const showPhoto = (index: number) => {
    if (!album?.photos.length) return;
    photoIndex = (index + album.photos.length) % album.photos.length;
    const photo = album.photos[photoIndex];
    image.src = photo.src;
    image.alt = photo.alt;
    caption.textContent = photo.caption ?? photo.alt;
    position.textContent = `${photoIndex + 1} of ${album.photos.length} photos`;
    previous.disabled = next.disabled = album.photos.length < 2;
    thumbnails.querySelectorAll<HTMLButtonElement>("button").forEach((button, index) => {
      const active = index === photoIndex;
      button.setAttribute("aria-current", String(active));
      button.classList.toggle("ring-2", active);
      button.classList.toggle("ring-primary-600", active);
    });
  };
  root.querySelectorAll<HTMLButtonElement>("[data-lightbox]").forEach(button => {
    const event = byId.get(button.dataset.album!);
    if (!event) return;
    const cover = selectGalleryPhoto(event.photos, "cover");
    const cardImage = button.querySelector("img");
    if (cover && cardImage) {
      button.dataset.coverIndex = String(cover.index);
      cardImage.srcset = cover.photo.srcset;
      cardImage.src = cover.photo.thumbnail;
      cardImage.alt = cover.photo.alt;
      cardImage.width = cover.photo.width;
      cardImage.height = cover.photo.height;
    }
    button.addEventListener("click", () => {
      selected = button;
      album = event;
      title.textContent = event.title;
      date.textContent = event.date;
      thumbnails.replaceChildren();
      event.photos.forEach((photo, index) => {
        const thumbnail = document.createElement("button");
        thumbnail.type = "button";
        thumbnail.className = "m-1 h-16 w-24 shrink-0 overflow-hidden rounded-lg ring-offset-2 ring-offset-[var(--surface-card)] focus-visible:outline-primary-600";
        thumbnail.setAttribute("aria-label", `View photo ${index + 1} of ${event.photos.length}`);
        const preview = document.createElement("img");
        preview.src = photo.thumbnail;
        preview.alt = "";
        preview.className = "h-full w-full object-cover";
        preview.loading = "lazy";
        thumbnail.appendChild(preview);
        thumbnail.addEventListener("click", () => showPhoto(index));
        thumbnails.appendChild(thumbnail);
      });
      showPhoto(Number(button.dataset.coverIndex ?? 0));
      if (!dialog.open) dialog.showModal();
    });
  });
  previous.addEventListener("click", () => showPhoto(photoIndex - 1));
  next.addEventListener("click", () => showPhoto(photoIndex + 1));
  root.querySelector("#lightbox-close")?.addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", event => { if (event.target === dialog) dialog.close(); });
  dialog.addEventListener("keydown", event => {
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      showPhoto(photoIndex + (event.key === "ArrowLeft" ? -1 : 1));
    }
    if (event.key === "Escape") { event.preventDefault(); dialog.close(); }
  });
  dialog.addEventListener("close", () => {
    image.removeAttribute("src");
    thumbnails.replaceChildren();
    album = undefined;
    selected?.focus();
  });
  filters.forEach(button => button.addEventListener("click", () => {
    const category = button.dataset.galleryCategory;
    let count = 0;
    figures.forEach(figure => { figure.hidden = category !== "all" && figure.dataset.category !== category; if (!figure.hidden) count++; });
    filters.forEach(filter => filter.setAttribute("aria-pressed", String(filter === button)));
    root.querySelector("[data-gallery-count]")!.textContent = `${count} of ${figures.length} events`;
  }));
}

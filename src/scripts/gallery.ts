const root = document.querySelector<HTMLElement>("[data-gallery-root]");
if (root) {
  const figures = [...root.querySelectorAll<HTMLElement>("[data-gallery-item]")];
  const filters = [...root.querySelectorAll<HTMLButtonElement>("[data-gallery-category]")];
  const dialog = root.querySelector<HTMLDialogElement>("#lightbox")!;
  const image = root.querySelector<HTMLImageElement>("#lightbox-img")!;
  const caption = root.querySelector<HTMLElement>("#lightbox-caption")!;
  const previous = root.querySelector<HTMLButtonElement>("[data-gallery-prev]")!;
  const next = root.querySelector<HTMLButtonElement>("[data-gallery-next]")!;
  let selected: HTMLButtonElement | undefined;
  const visible = () => figures.filter((figure) => !figure.hidden).map((figure) => figure.querySelector<HTMLButtonElement>("[data-lightbox]")!);
  const show = (button: HTMLButtonElement) => {
    selected = button;
    image.src = button.dataset.full!;
    image.alt = button.dataset.caption ?? "";
    caption.textContent = `${button.dataset.caption ?? ""} · ${button.dataset.date ?? ""}`;
    previous.disabled = next.disabled = visible().length < 2;
    if (!dialog.open) dialog.showModal();
  };
  const move = (direction: number) => {
    const buttons = visible();
    const index = selected ? buttons.indexOf(selected) : 0;
    const button = buttons[(index + direction + buttons.length) % buttons.length];
    if (button) show(button);
  };
  root.querySelectorAll<HTMLButtonElement>("[data-lightbox]").forEach((button) => button.addEventListener("click", () => show(button)));
  previous.addEventListener("click", () => move(-1));
  next.addEventListener("click", () => move(1));
  root.querySelector("#lightbox-close")?.addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (event) => { if (event.target === dialog) dialog.close(); });
  dialog.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") { event.preventDefault(); move(event.key === "ArrowLeft" ? -1 : 1); }
  });
  dialog.addEventListener("close", () => { image.removeAttribute("src"); selected?.focus(); });
  filters.forEach((button) => button.addEventListener("click", () => {
    const category = button.dataset.galleryCategory;
    let count = 0;
    figures.forEach((figure) => { figure.hidden = category !== "all" && figure.dataset.category !== category; if (!figure.hidden) count++; });
    filters.forEach((filter) => filter.setAttribute("aria-pressed", String(filter === button)));
    root.querySelector("[data-gallery-count]")!.textContent = `${count} of ${figures.length} moments`;
  }));
}
export {};

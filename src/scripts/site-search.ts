interface SearchResult {
  url: string;
  excerpt: string;
  meta: { title?: string; category?: string };
}
interface SearchReference { data(): Promise<SearchResult> }
interface SearchEngine { options(options: { baseUrl: string }): Promise<void>; search(query: string): Promise<{ results: SearchReference[] }> }
const dialog = document.querySelector<HTMLDialogElement>("#site-search");
const trigger = document.querySelector<HTMLButtonElement>("#search-toggle");
if (dialog && trigger) {
  const input = dialog.querySelector<HTMLInputElement>("#site-search-input")!;
  const list = dialog.querySelector<HTMLOListElement>("#search-results")!;
  const status = dialog.querySelector<HTMLElement>("#search-status")!;
  const more = dialog.querySelector<HTMLButtonElement>("[data-search-more]")!;
  const retry = dialog.querySelector<HTMLButtonElement>("[data-search-retry]")!;
  let engine: Promise<SearchEngine> | undefined;
  let revision = 0;
  let timer: ReturnType<typeof setTimeout>;
  let matches: SearchReference[] = [];
  let shown = 0;
  let restoreFocus: HTMLElement | null = null;
  const load = () => engine ??= import(/* @vite-ignore */ `${import.meta.env.BASE_URL}pagefind/pagefind.js`).then(async (module: SearchEngine) => {
    // Custom records already include Astro's base. Prevent Pagefind adding it twice.
    await module.options({ baseUrl: "/" });
    return module;
  }).catch((error) => { engine = undefined; throw error; });
  const initial = () => { status.textContent = "Search publications, people, research, projects, and more."; };
  const append = async (version: number) => {
    more.disabled = true;
    const batch = await Promise.all(matches.slice(shown, shown + 15).map((result) => result.data()));
    if (version !== revision) return;
    for (const result of batch) {
      const url = new URL(result.url, window.location.href);
      if (url.origin !== window.location.origin || !["http:", "https:"].includes(url.protocol)) continue;
      const item = document.createElement("li");
      const link = document.createElement("a");
      link.href = url.pathname + url.search + url.hash;
      link.dataset.searchResult = "";
      link.addEventListener("click", (event) => {
        if (!event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey && event.button === 0 && url.pathname === window.location.pathname && url.search === window.location.search) {
          // A fresh navigation reveals anchors even when this listing has active filters.
          event.preventDefault();
          dialog.close();
          window.location.assign(link.href);
          window.location.reload();
        }
      });
      link.className = "search-result block rounded-xl border border-transparent px-3 py-3 focus-visible:outline-primary-500";
      const category = document.createElement("span");
      category.className = "text-xs font-medium text-accent-label";
      category.textContent = result.meta.category ?? "Page";
      const title = document.createElement("p");
      title.className = "mt-1 font-medium text-heading";
      title.textContent = result.meta.title ?? "Untitled page";
      const excerpt = document.createElement("p");
      excerpt.className = "mt-1 line-clamp-2 text-sm leading-relaxed text-muted";
      // Pagefind escapes indexed text and inserts only its own <mark> elements.
      excerpt.innerHTML = result.excerpt;
      link.append(category, title, excerpt); item.append(link); list.append(item);
    }
    shown += batch.length;
    status.textContent = matches.length ? `Showing ${shown} of ${matches.length} results.` : "No results found. Try another name, topic, or keyword.";
    more.hidden = shown >= matches.length;
    more.disabled = false;
  };
  const failed = () => {
    status.textContent = dialog.dataset.searchDev === "true" ? "The local search index is unavailable. Run npm run build, then npm run preview to test search." : "Search could not load. Please try again.";
    more.hidden = true; retry.hidden = false;
  };
  const search = async (version: number) => {
    const query = input.value.trim();
    retry.hidden = true; more.hidden = true;
    if (!query) { list.replaceChildren(); initial(); return; }
    status.textContent = "Searching…";
    try {
      const response = await (await load()).search(query);
      if (version !== revision) return;
      matches = response.results; shown = 0; list.replaceChildren();
      await append(version);
    } catch { if (version === revision) failed(); }
  };
  const open = () => {
    if (dialog.open) return;
    restoreFocus = document.activeElement instanceof HTMLElement ? document.activeElement : trigger;
    dialog.showModal(); trigger.setAttribute("aria-expanded", "true"); input.focus();
    // Fetch the small search runtime on demand. Index shards load only for a query.
    void load().catch(() => {});
  };
  trigger.addEventListener("click", open);
  dialog.querySelector("[data-search-close]")?.addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (event) => { if (event.target === dialog) { const box = dialog.getBoundingClientRect(); const pointer = event as MouseEvent; if (pointer.clientX < box.left || pointer.clientX > box.right || pointer.clientY < box.top || pointer.clientY > box.bottom) dialog.close(); } });
  dialog.addEventListener("close", () => { trigger.setAttribute("aria-expanded", "false"); restoreFocus?.focus(); });
  document.addEventListener("keydown", (event) => {
    const editing = event.target instanceof Element && event.target.closest('input, textarea, select, [contenteditable]:not([contenteditable="false"]), [role="textbox"]');
    if (!event.defaultPrevented && !editing && (event.metaKey || event.ctrlKey) && !event.altKey && !event.shiftKey && event.key.toLowerCase() === "k") { event.preventDefault(); open(); }
  });
  dialog.addEventListener("keydown", (event) => {
    const links = [...list.querySelectorAll<HTMLAnchorElement>("[data-search-result]")];
    const index = links.indexOf(document.activeElement as HTMLAnchorElement);
    if (event.key === "ArrowDown" && (event.target === input || index >= 0)) { event.preventDefault(); links[Math.min(index + 1, links.length - 1)]?.focus(); }
    if (event.key === "ArrowUp" && (event.target === input || index >= 0)) { event.preventDefault(); if (event.target === input) links.at(-1)?.focus(); else if (index === 0) input.focus(); else links[index - 1]?.focus(); }
    if (event.key === "Enter" && event.target === input && links[0]) { event.preventDefault(); links[0].click(); }
    if (index >= 0 && ["Home", "End"].includes(event.key)) { event.preventDefault(); links[event.key === "Home" ? 0 : links.length - 1]?.focus(); }
  });
  input.addEventListener("input", () => { clearTimeout(timer); const version = ++revision; if (!input.value.trim()) { list.replaceChildren(); more.hidden = true; retry.hidden = true; initial(); } else timer = setTimeout(() => void search(version), 200); });
  more.addEventListener("click", () => void append(revision).catch(failed));
  retry.addEventListener("click", () => void search(++revision));
}
export {};

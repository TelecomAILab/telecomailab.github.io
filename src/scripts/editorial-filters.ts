// The same AND filtering works for article tags and talk type/year/period.
for (const root of document.querySelectorAll<HTMLElement>("[data-editorial-list]")) {
  const cards = [...root.querySelectorAll<HTMLElement>("[data-editorial-card]")];
  const filters = [...root.querySelectorAll<HTMLSelectElement>("[data-editorial-filter]")];
  const search = root.querySelector<HTMLInputElement>("[data-editorial-search]");
  const sort = root.querySelector<HTMLSelectElement>("[data-editorial-sort]");
  const apply = () => {
    const query = (search?.value ?? "").trim().toLowerCase();
    let visible = 0;
    for (const card of cards) {
      const period = card.dataset.end ? (Date.parse(card.dataset.end) <= Date.now() ? "past" : "upcoming") : "";
      const matches = filters.every((filter) => filter.value === "all" || (filter.dataset.editorialFilter === "tag" ? (JSON.parse(card.dataset.tag ?? "[]") as string[]).includes(filter.value) : filter.dataset.editorialFilter === "period" ? period === filter.value : card.dataset[filter.dataset.editorialFilter!] === filter.value));
      card.hidden = !(matches && (card.dataset.search ?? "").includes(query));
      if (!card.hidden) visible++;
      const badge = card.querySelector<HTMLElement>("[data-talk-period]");
      if (badge) badge.textContent = period === "past" ? "Past event" : "Upcoming";
    }
    const count = root.querySelector("[data-editorial-count]");
    if (count) count.textContent = `${visible} of ${cards.length} ${root.dataset.noun ?? "articles"}`;
    const empty = root.querySelector<HTMLElement>("[data-editorial-empty]");
    if (empty) empty.hidden = visible !== 0;
    const list = root.querySelector("[data-editorial-cards]");
    if (list && sort) {
      const direction = sort.value === "oldest" ? 1 : -1;
      [...cards].sort((a, b) => direction * (Date.parse(a.dataset.date!) - Date.parse(b.dataset.date!)) || a.id.localeCompare(b.id)).forEach((card) => list.appendChild(card));
    }
  };
  filters.forEach((filter) => filter.addEventListener("change", apply));
  search?.addEventListener("input", apply);
  sort?.addEventListener("change", apply);
  root.querySelector("[data-editorial-reset]")?.addEventListener("click", () => { filters.forEach((filter) => filter.value = "all"); if (search) search.value = ""; if (sort) sort.value = "newest"; apply(); });
  apply();
}

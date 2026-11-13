import { comparePublications, matchesPublication, type PublicationFilter, type PublicationIndex } from "../lib/publication-query";
import { RESEARCH_ALIASES } from "../lib/research-aliases";

const list = document.querySelector<HTMLOListElement>("[data-pub-list]");
const nodes = [...(list?.querySelectorAll<HTMLElement>("[data-pub]") ?? [])];
const roles: Record<string, string> = { mentee: "mentee", pi: "piSenior", collaboration: "collaboration", openaccess: "openaccess", featured: "featured" };
const items = nodes.map((node) => ({
  node,
  index: {
    id: node.dataset.pubId ?? "", title: node.dataset.title ?? "", search: node.dataset.search ?? "",
    areas: (node.dataset.areas ?? "").split(" "), type: node.dataset.type ?? "other",
    year: Number(node.dataset.year), citations: Number(node.dataset.citations ?? -1),
    roles: Object.keys(roles).filter((role) => node.dataset[roles[role]] === "true"),
  } satisfies PublicationIndex,
}));
const search = document.querySelector<HTMLInputElement>("#pub-search");
const year = document.querySelector<HTMLSelectElement>("#pub-year");
const sort = document.querySelector<HTMLSelectElement>("#pub-sort");
const panel = document.getElementById("pub-filters");
const toggle = document.getElementById("filters-toggle");
const filter: PublicationFilter = { query: "", role: "all", area: "all", type: "all", year: "all" };
const groups = [
  { key: "role", attribute: "data-filter" }, { key: "area", attribute: "data-area" },
  { key: "type", attribute: "data-type-filter" },
] as const;

function update() {
  filter.query = search?.value ?? "";
  filter.year = year?.value ?? "all";
  let count = 0;
  for (const { node, index } of [...items].sort((a, b) => comparePublications(a.index, b.index, sort?.value ?? "date"))) {
    node.hidden = !matchesPublication(index, filter);
    if (!node.hidden) count++;
    list?.appendChild(node);
  }
  for (const group of groups) {
    document.querySelectorAll<HTMLElement>(`[${group.attribute}]`).forEach((button) => {
      const active = button.getAttribute(group.attribute) === filter[group.key];
      button.toggleAttribute("data-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
  }
  const countElement = document.getElementById("pub-count");
  if (countElement) countElement.textContent = `${count} of ${items.length} publications`;
  document.getElementById("pub-empty")?.classList.toggle("hidden", count !== 0);
  document.getElementById("pub-legacy-filter")?.classList.toggle("hidden", filter.area !== "letter");
}

for (const group of groups) {
  document.querySelectorAll<HTMLElement>(`[${group.attribute}]`).forEach((button) => {
    button.addEventListener("click", () => { filter[group.key] = button.getAttribute(group.attribute) ?? "all"; update(); });
  });
}
document.querySelectorAll<HTMLElement>("[data-filter]").forEach((button) => {
  const role = button.dataset.filter ?? "all";
  const count = role === "all" ? items.length : items.filter(({ index }) => index.roles.includes(role)).length;
  const span = button.querySelector("[data-count]");
  if (span) span.textContent = `(${count})`;
});
search?.addEventListener("input", update);
year?.addEventListener("change", update);
sort?.addEventListener("change", update);
toggle?.addEventListener("click", () => {
  const open = toggle.getAttribute("aria-expanded") === "true";
  toggle.setAttribute("aria-expanded", String(!open));
  panel?.classList.toggle("hidden", open);
});
document.getElementById("pub-reset")?.addEventListener("click", () => {
  filter.role = filter.area = filter.type = "all";
  if (search) search.value = "";
  if (year) year.value = "all";
  if (sort) sort.value = "date";
  if (location.hash) history.replaceState(null, "", location.pathname + location.search);
  update();
});
function applyHash() {
  let area = "";
  try { area = decodeURIComponent(location.hash.slice(1)); } catch { /* Ignore malformed external hashes. */ }
  area = RESEARCH_ALIASES[area] ?? area;
  filter.area = area === "letter" || [...document.querySelectorAll<HTMLElement>("[data-area]")].some((button) => button.dataset.area === area) ? area : "all";
  if (area === "review") filter.type = "review-article";
  if (filter.area !== "all") {
    panel?.classList.remove("hidden");
    toggle?.setAttribute("aria-expanded", "true");
  }
  update();
}
window.addEventListener("hashchange", applyHash);
applyHash();

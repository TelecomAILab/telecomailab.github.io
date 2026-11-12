export interface PublicationFilter {
  query: string;
  area: string;
  type: string;
  year: string;
  role: string;
}
export interface PublicationIndex {
  id: string;
  title: string;
  search: string;
  areas: string[];
  type: string;
  year: number;
  citations: number;
  roles: string[];
}

export function matchesPublication(item: PublicationIndex, filter: PublicationFilter) {
  return (!filter.query.trim() || item.search.includes(filter.query.trim().toLowerCase()))
    && (filter.area === "all" || item.areas.includes(filter.area))
    && (filter.type === "all" || item.type === filter.type)
    && (filter.year === "all" || item.year === Number(filter.year))
    && (filter.role === "all" || item.roles.includes(filter.role));
}

export function comparePublications(a: PublicationIndex, b: PublicationIndex, sort: string) {
  return (sort === "citations" ? b.citations - a.citations || b.year - a.year
    : sort === "oldest" ? a.year - b.year : b.year - a.year)
    || a.title.localeCompare(b.title) || a.id.localeCompare(b.id);
}

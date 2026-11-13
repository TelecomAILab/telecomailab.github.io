// Read curated publications; write only the independent citation-count store.
import { readFileSync, writeFileSync, renameSync, existsSync, unlinkSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import { z } from "zod";
import { publicationRecordsSchema } from "../src/lib/publication-schema.ts";
import { citationRecordsSchema } from "../src/lib/citations.ts";

const GREEK = {α:"alpha",β:"beta",γ:"gamma",δ:"delta",ε:"epsilon",ζ:"zeta",η:"eta",θ:"theta",ι:"iota",κ:"kappa",λ:"lambda",μ:"mu",ν:"nu",ξ:"xi",ο:"omicron",π:"pi",ρ:"rho",σ:"sigma",ς:"sigma",τ:"tau",υ:"upsilon",φ:"phi",χ:"chi",ψ:"psi",ω:"omega"};
const normalized = value => String(value ?? "").toLowerCase().replace(/[α-ω]/g, char => GREEK[char] ?? char).normalize("NFKD").replace(/\p{M}/gu, "").replace(/[^\p{L}\p{N}]/gu, "");
const articleSchema = z.object({
  title: z.string(), year: z.union([z.string(), z.number()]).optional(),
  citation_id: z.string().optional(), link: z.string().optional(),
  cited_by: z.object({value: z.unknown().optional()}).optional(),
});

/** Follow SerpAPI's author pagination even when a page contains fewer than num items. */
export async function fetchScholarArticles({authorId, key, fetchImpl = fetch, maxPages = 50}) {
  const articles = [], visited = new Set();
  let offsetKey = "start", offset = "0";
  for (let page = 0; page < maxPages; page++) {
    const token = `${offsetKey}:${offset}`;
    if (visited.has(token)) throw new Error("Repeated Scholar pagination token");
    visited.add(token);
    const url = new URL("https://serpapi.com/search.json");
    url.search = new URLSearchParams({engine: "google_scholar_author", author_id: authorId, api_key: key, num: "100", hl: "en", sort: "title", [offsetKey]: offset}).toString();
    const response = await fetchImpl(url, {signal: AbortSignal.timeout(20000)});
    if (!response.ok) throw new Error(`SerpAPI HTTP ${response.status}`);
    const result = await response.json();
    if (result.error || !Array.isArray(result.articles)) throw new Error("Invalid Scholar author response");
    articles.push(...result.articles);
    const next = result.serpapi_pagination?.next;
    if (!next) return articles;
    const nextUrl = new URL(next);
    if (nextUrl.origin !== "https://serpapi.com" || !["/search", "/search.json"].includes(nextUrl.pathname)) throw new Error("Unexpected Scholar pagination destination");
    offsetKey = nextUrl.searchParams.has("cstart") ? "cstart" : "start";
    offset = nextUrl.searchParams.get(offsetKey);
    if (!offset || !/^\d+$/.test(offset)) throw new Error("Invalid Scholar pagination offset");
  }
  // Never save a partial refresh if a profile is larger than our safety bound.
  throw new Error("Scholar pagination limit reached");
}

/** Match only unambiguous titles/years or a curator-supplied Scholar citation URL. */
export function refreshCitationRecords(publications, previous, input) {
  const papers = publicationRecordsSchema.parse(publications);
  const saved = new Map(citationRecordsSchema.parse(previous).map(row => [row.id, row.citationCount]));
  const articles = z.array(articleSchema).parse(input);
  const citationId = url => { try { return new URL(url).searchParams.get("citation_for_view"); } catch { return null; } };
  return papers.map(paper => {
    const title = normalized(paper.title);
    const sameWork = papers.filter(other => normalized(other.title) === title && other.year === paper.year);
    const explicit = paper.scholarUrl && citationId(paper.scholarUrl);
    let matches = articles.filter(article => normalized(article.title) === title && (!article.year || Number(article.year) === paper.year));
    if (explicit) matches = matches.filter(article => article.citation_id === explicit || citationId(article.link) === explicit);
    const hit = matches.length === 1 && (explicit || (sameWork.length === 1 &&
      (matches[0].year || papers.filter(other => normalized(other.title) === title).length === 1))) ? matches[0] : undefined;
    const count = hit?.cited_by?.value;
    return {id: paper.id, citationCount: Number.isSafeInteger(count) && count >= 0 ? count : saved.get(paper.id) ?? null};
  }).sort((a, b) => a.id.localeCompare(b.id));
}

/** Dependency injection lets tests exercise the full writer without API keys or real data. */
export async function refreshCitations({root = fileURLToPath(new URL("../", import.meta.url)), env = process.env, fetchImpl = fetch, log = console.log} = {}) {
  const publicationPath = resolve(root, "src/data/publications.json");
  const citationPath = resolve(root, "src/data/citations.json");
  const publications = publicationRecordsSchema.parse(JSON.parse(readFileSync(publicationPath, "utf8")));
  const previous = citationRecordsSchema.parse(existsSync(citationPath) ? JSON.parse(readFileSync(citationPath, "utf8")) : []);
  if (!publications.length || (!env.SERPAPI_FIXTURE && (!env.SERPAPI_KEY || !env.SCHOLAR_AUTHOR_ID))) {
    log("Citation refresh skipped: no publications or missing SERPAPI_KEY/SCHOLAR_AUTHOR_ID.");
    return {changed: false};
  }
  let updated;
  try {
    const fixture = env.SERPAPI_FIXTURE ? JSON.parse(readFileSync(env.SERPAPI_FIXTURE, "utf8")) : undefined;
    const articles = fixture ? (Array.isArray(fixture) ? fixture : fixture.articles) : await fetchScholarArticles({authorId: env.SCHOLAR_AUTHOR_ID, key: env.SERPAPI_KEY, fetchImpl});
    updated = refreshCitationRecords(publications, previous, articles);
  } catch {
    // API errors must not leak credentials, erase saved counts, or produce partial data.
    log("Citation refresh unavailable or invalid; saved counts retained.");
    return {changed: false};
  }
  if (JSON.stringify(updated) === JSON.stringify(previous)) { log("Citation counts unchanged."); return {changed: false}; }
  const temporary = `${citationPath}.${process.pid}.tmp`;
  try { writeFileSync(temporary, JSON.stringify(updated, null, 2) + "\n"); renameSync(temporary, citationPath); }
  finally { if (existsSync(temporary)) unlinkSync(temporary); }
  log(`Refreshed citations.json for ${updated.length} publications; publications.json was read only.`);
  return {changed: true};
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await refreshCitations();

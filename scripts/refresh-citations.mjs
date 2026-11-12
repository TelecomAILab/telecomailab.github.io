// Refresh the canonical publications JSON through SerpAPI. Mock records are skipped.
// Missing credentials/API failures preserve the last saved data.
// SERPAPI_FIXTURE can supply an article array or SerpAPI response for local testing.
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";

const PUBLICATIONS = new URL("../src/data/publications.json", import.meta.url);
const AUTHOR_ID = process.env.SCHOLAR_AUTHOR_ID || "";
const KEY = process.env.SERPAPI_KEY;
const FIXTURE = process.env.SERPAPI_FIXTURE;

// Greek letters appear as symbols in some Scholar titles (e.g. "α-dystrobrevin")
// but spelled out in ours ("alpha-dystrobrevin"); transliterate so they match.
const GREEK = {
  α: "alpha", β: "beta", γ: "gamma", δ: "delta", ε: "epsilon", ζ: "zeta",
  η: "eta", θ: "theta", ι: "iota", κ: "kappa", λ: "lambda", μ: "mu", ν: "nu",
  ξ: "xi", ο: "omicron", π: "pi", ρ: "rho", σ: "sigma", ς: "sigma", τ: "tau",
  υ: "upsilon", φ: "phi", χ: "chi", ψ: "psi", ω: "omega",
};
const norm = (s) =>
  s
    .toLowerCase()
    .replace(/[α-ω]/g, (c) => GREEK[c] ?? "")
    .normalize("NFKD")
    .replace(/[^a-z0-9]/g, "");

async function getArticles() {
  if (FIXTURE) {
    const data = JSON.parse(readFileSync(FIXTURE, "utf8"));
    return Array.isArray(data) ? data : data.articles || [];
  }
  const articles = [];
  for (let start = 0; start < 500; start += 100) {
    const url =
      `https://serpapi.com/search.json?engine=google_scholar_author` +
      `&author_id=${AUTHOR_ID}&num=100&start=${start}&api_key=${KEY}`;
    const r = await fetch(url);
    if (!r.ok) throw new Error(`SerpAPI HTTP ${r.status}`);
    const j = await r.json();
    if (j.error) throw new Error(`SerpAPI: ${j.error}`);
    const batch = j.articles || [];
    articles.push(...batch);
    if (batch.length < 100) break;
  }
  return articles;
}

/** Return new records without changing IDs, author relationships, or other metadata. */
export function refreshCitationRecords(records, articles) {
  const byTitle = new Map(articles.filter((article) => article.title).map((article) => [
    norm(article.title), article,
  ]));
  return records.map((record) => {
    if (record.isMock) return record;
    const hit = byTitle.get(norm(record.title));
    if (!hit) return record;
    const count = hit.cited_by?.value;
    return {
      ...record,
      ...(Number.isInteger(count) && count >= 0 ? { citationCount: count } : {}),
      ...(hit.link ? { scholarUrl: hit.link } : {}),
    };
  });
}

async function main() {
  const records = JSON.parse(readFileSync(PUBLICATIONS, "utf8"));
  if (!records.length) {
    console.log("No production publications yet — skipping citation refresh.");
    return;
  }
  if (records.every((record) => record.isMock)) {
    console.log("Only mock publications are present — skipping live citation refresh.");
    return;
  }
  if ((!KEY || !AUTHOR_ID) && !FIXTURE) {
    console.log("Set SERPAPI_KEY and SCHOLAR_AUTHOR_ID to enable citation refresh — skipping.");
    return;
  }
  let articles;
  try {
    articles = await getArticles();
  } catch (error) {
    console.log(`Citation refresh failed (${error.message}) — keeping existing values.`);
    return;
  }
  const updated = refreshCitationRecords(records, articles);
  const changed = updated.filter((record, index) => JSON.stringify(record) !== JSON.stringify(records[index])).length;
  if (changed) writeFileSync(PUBLICATIONS, JSON.stringify(updated, null, 2) + "\n");
  console.log(`SerpAPI articles: ${articles.length}; updated ${changed} publication(s).`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) await main();

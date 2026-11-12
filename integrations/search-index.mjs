import { readFile, readdir, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { join, relative } from "node:path";
import { load } from "cheerio";
import * as pagefind from "pagefind";

const listingOnly = new Set(["/people", "/blog", "/notes"]);
const categories = { people: "People", blog: "Blog", notes: "Notes", figures: "Figures" };
async function htmlFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  return (await Promise.all(entries.filter((entry) => !["files", "pagefind", "_astro"].includes(entry.name)).map((entry) => entry.isDirectory() ? htmlFiles(join(directory, entry.name)) : entry.name.endsWith(".html") ? [join(directory, entry.name)] : []))).flat();
}

/** Build from rendered public content, without maintaining a second content source. */
export async function collectSearchRecords(directory, base = "/") {
  const records = new Map();
  for (const filename of await htmlFiles(directory)) {
    const path = relative(directory, filename).replaceAll("\\", "/");
    if (path === "404.html") continue;
    const route = `/${path.replace(/(?:^|\/)index\.html$/, "").replace(/\/$/, "")}`;
    if (listingOnly.has(route)) continue;
    const $ = load(await readFile(filename, "utf8"));
    if ($('meta[name="robots"][content*="noindex"]').length) continue;
    const main = $("main");
    if (!main.length) continue;
    const entries = main.find("[data-search-entry]");
    const targets = entries.length ? entries.toArray() : [(main.find("[data-search-page]").first().length ? main.find("[data-search-page]").first() : main)[0]];
    for (const target of targets) {
      const node = $(target);
      const id = entries.length ? node.attr("id") : undefined;
      if (entries.length && !id) throw new Error(`Search entry missing a stable anchor in ${route}`);
      const url = `${base.replace(/\/$/, "")}${route}${id ? `#${encodeURIComponent(id)}` : ""}` || "/";
      const title = node.attr("data-search-title") || main.find("h1").first().text().trim();
      const category = node.attr("data-search-category") || categories[route.split("/")[1]] || "About the lab";
      const content = node.clone();
      content.find("[data-search-ignore], script, style, button, dialog, nav, footer, [aria-hidden='true'], [data-bibtex]").remove();
      const text = content.text().replace(/\s+/g, " ").trim();
      if (!title || !text) continue;
      if (records.has(url)) throw new Error(`Duplicate search URL ${url}`);
      records.set(url, { url, content: `${title} ${text} ${node.attr("data-search-extra") ?? ""}`, language: "en", meta: { title, category }, filters: { category: [category] } });
    }
  }
  return [...records.values()];
}

export default function searchIndex() {
  let base = "/";
  let output;
  return {
    name: "telecomai-pagefind",
    hooks: {
      "astro:config:done": ({ config }) => { base = config.base; output = fileURLToPath(config.outDir); },
      "astro:server:setup": ({ server }) => {
        const prefix = `${base.replace(/\/$/, "")}/pagefind/`;
        server.middlewares.use(async (request, response, next) => {
          const pathname = new URL(request.url ?? "/", "http://localhost").pathname;
          if (!pathname.startsWith(prefix)) return next();
          const name = decodeURIComponent(pathname.slice(prefix.length));
          if (!/^[a-zA-Z0-9_./-]+$/.test(name) || name.split("/").includes("..")) return next();
          try {
            const content = await readFile(join(output, "pagefind", name));
            const type = name.endsWith(".js") ? "text/javascript" : name.endsWith(".wasm") ? "application/wasm" : name.endsWith(".json") ? "application/json" : "application/octet-stream";
            response.setHeader("Content-Type", type);
            response.setHeader("Cache-Control", "no-cache");
            response.end(request.method === "HEAD" ? undefined : content);
          } catch { next(); }
        });
      },
      "astro:build:done": async ({ dir, logger }) => {
        const directory = fileURLToPath(dir);
        const records = await collectSearchRecords(directory, base);
        const { index, errors } = await pagefind.createIndex({ forceLanguage: "en" });
        if (!index || errors?.length) throw new Error(`Pagefind: ${errors?.join("; ")}`);
        try {
          for (const record of records) {
            const result = await index.addCustomRecord(record);
            if (result.errors?.length) throw new Error(result.errors.join("; "));
          }
          const outputPath = join(directory, "pagefind");
          await mkdir(outputPath, { recursive: true });
          const result = await index.writeFiles({ outputPath });
          if (result.errors?.length) throw new Error(result.errors.join("; "));
          logger.info(`Pagefind indexed ${records.length} public entries across ${new Set(records.map((record) => record.meta.category)).size} categories.`);
        } finally { await index.deleteIndex(); await pagefind.close(); }
      },
    },
  };
}

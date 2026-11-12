// Structured JSON import with optional Crossref verification; outputs review candidates only.
import { readFileSync } from "node:fs";
import { preparePublicationImport } from "../src/lib/publication-import.ts";
import { peopleRecordsSchema } from "../src/lib/people-schema.ts";

const args = process.argv.slice(2);
if (args.includes("--help") || !args.includes("--input")) {
  console.log("Usage: npm run import:publications -- --input candidates.json [--verify-dois] [--reviewed]\nOutputs a review report to stdout. Never writes or overwrites production JSON. --reviewed confirms that you checked all supplied metadata and relationships against the sources.");
} else {
  const path = args[args.indexOf("--input") + 1];
  if (!path || path.startsWith("--")) throw new Error("--input requires a JSON path");
  const existing = JSON.parse(readFileSync(new URL("../src/data/publications.json", import.meta.url), "utf8"));
  const people = peopleRecordsSchema.parse(JSON.parse(readFileSync(new URL("../src/data/people.json", import.meta.url), "utf8")));
  const result = await preparePublicationImport(JSON.parse(readFileSync(path, "utf8")), existing, new Set(people.map((person) => person.id)), {
    reviewed: args.includes("--reviewed"),
    ...(args.includes("--verify-dois") ? { lookupDoi: async (doi: string) => {
      const response = await fetch(`https://api.crossref.org/works/${encodeURIComponent(doi)}`, {
        signal: AbortSignal.timeout(15000), headers: { "User-Agent": "TelecomAI-Lab-publication-review/1.0" },
      });
      if (!response.ok) throw new Error(`Crossref HTTP ${response.status}`);
      const data = await response.json() as { message: unknown };
      return data.message;
    } } : {}),
  });
  console.log(JSON.stringify(result, null, 2));
  if (result.report.some((record) => record.status !== "ready")) process.exitCode = 2;
}

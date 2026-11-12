// Review-only CSV conversion. Applying a reviewed plan is a separate, deliberate edit.
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { personSchema, peopleRecordsSchema } from "../src/lib/people-schema.ts";
import { publicationSchema, publicationRecordsSchema, PUBLICATION_TYPES } from "../src/lib/publication-schema.ts";
import { researchSchema } from "../src/lib/research-schema.ts";
import { newsSchema } from "../src/lib/editorial-schema.ts";
import { fundingSchema, funderSchema, projectSchema, hardwareSchema } from "../src/lib/lab-schemas.ts";
import { z } from "zod";

/** RFC 4180 cells, including BOM, escaped quotes, CRLF and embedded newlines. */
export function parseCsv(input: string): Record<string, string>[] {
  const rows: string[][] = [];
  let row: string[] = [], cell = "", quoted = false, closed = false;
  const data = input.replace(/^\uFEFF/, "");
  for (let index = 0; index < data.length; index++) {
    const char = data[index];
    if (quoted) {
      if (char === '"') {
        if (data[index + 1] === '"') { cell += '"'; index++; }
        else { quoted = false; closed = true; }
      } else cell += char;
    } else if (char === '"') {
      if (cell || closed) throw new Error("Unexpected quote in CSV cell");
      quoted = true;
    } else if (char === "," || char === "\n" || char === "\r") {
      row.push(cell); cell = ""; closed = false;
      if (char !== ",") {
        if (row.some((value) => value !== "")) rows.push(row);
        row = [];
        if (char === "\r" && data[index + 1] === "\n") index++;
      }
    } else {
      if (closed) throw new Error("Unexpected text after quoted CSV cell");
      cell += char;
    }
  }
  if (quoted) throw new Error("Unclosed quoted CSV cell");
  if (cell || row.length || closed) { row.push(cell); rows.push(row); }
  const headers = rows.shift();
  if (!headers || new Set(headers).size !== headers.length || headers.some((header) => !header.trim())) throw new Error("Missing or duplicate CSV headers");
  return rows.map((values, index) => {
    if (values.length !== headers.length) throw new Error(`CSV row ${index + 2}: expected ${headers.length} cells, received ${values.length}`);
    return Object.fromEntries(headers.map((header, column) => [header, values[column].trim()]));
  });
}

export const RESEARCH_IDS: Record<string, string> = {
  "AI for wireless networks": "topic-one", "Cloud & edge intelligence": "topic-two", "Satellite communications": "topic-three",
  "Open tools & datasets": "methods", "Optimization & learning": "theory",
  "Resource Allocation and Network Management with Edge AI": "edge-ai-network-management",
  "Semantic Communications for Earth Observation": "semantic-earth-observation",
  "Data and AI Model Marketplace Ecosystems": "data-model-ecosystems",
};
const list = (value = "") => value.split(";").map((item) => item.trim()).filter(Boolean);
const normalize = (value: string) => value.normalize("NFKD").replace(/\p{M}/gu, "").toLowerCase().replace(/[^a-z0-9]/g, "");
const doi = (value: string) => value.replace(/^https?:\/\/(?:dx\.)?doi\.org\//i, "").toLowerCase();
const number = (value: string) => value ? Number(value) : undefined;
const boolean = (value: string) => value ? ({ yes: true, no: false }[value.toLowerCase()] ?? (() => { throw new Error(`Invalid Yes/No value: ${value}`); })()) : undefined;
const compact = (value: Record<string, unknown>) => Object.fromEntries(Object.entries(value).filter(([, entry]) => entry !== undefined && entry !== ""));
const nextId = (records: {id: string | number}[]) => Math.max(0, ...records.map((record) => Number(record.id)).filter(Number.isSafeInteger)) + 1;
const nextNamedId = (records: {id: string | number}[], prefix: string) => {
  const ids = new Set(records.map((record) => String(record.id)));
  let next = records.length + 1;
  while (ids.has(`${prefix}-${next}`)) next++;
  return `${prefix}-${next}`;
};
const json = (root: string, file: string): unknown => JSON.parse(readFileSync(resolve(root, "src/data", file), "utf8"));
type Status = "candidate" | "duplicate" | "skipped" | "example" | "missing";
interface RowReport { file: string; row?: number; label?: string; status: Status; reason?: string; warnings?: string[]; reviewNotes?: string; unmapped?: Record<string, string> }

export function preparePiImport(root = resolve(fileURLToPath(new URL("../", import.meta.url))), directory = resolve(root, "docs/data-collection")) {
  const current = {
    people: peopleRecordsSchema.parse(json(root, "people.json")), publications: publicationRecordsSchema.parse(json(root, "publications.json")),
    research: z.array(researchSchema).parse(json(root, "research.json")), funding: fundingSchema.parse(json(root, "funding.json")),
    news: z.array(newsSchema).parse(json(root, "news.json")), hardware: z.array(hardwareSchema).parse(json(root, "hardware.json")),
  };
  const candidates = {
    people: [] as z.output<typeof personSchema>[], publications: [] as z.output<typeof publicationSchema>[], research: [] as z.output<typeof researchSchema>[],
    funders: [] as z.output<typeof funderSchema>[], projects: [] as z.output<typeof projectSchema>[], news: [] as z.output<typeof newsSchema>[], hardware: [] as z.output<typeof hardwareSchema>[],
  };
  const biographies: Record<string, string> = {};
  const report: RowReport[] = [];
  const files = ["people", "publications", "research", "funding", "news", "equipment", "materials", "talks-seminars", "lab-life", "site-information"];
  for (const file of files) {
    const path = resolve(directory, `${file}.csv`);
    if (!existsSync(path)) { report.push({ file, status: "missing", reason: "CSV not found; other files continue" }); continue; }
    for (const [index, row] of parseCsv(readFileSync(path, "utf8")).entries()) {
      const used = new Set(["Example Row", "Existing Website URL", "Review Notes"]);
      const get = (key: string) => { used.add(key); return row[key] ?? ""; };
      const label = row["Full Name"] || row["Title"] || row["Research Direction Title"] || row["Project Title"] || row["Headline"] || row["Equipment Name"] || row["Official Lab Name"];
      const entry: RowReport = { file, row: index + 2, label, status: "skipped", warnings: [], reviewNotes: row["Review Notes"] || undefined };
      report.push(entry);
      try {
        if (get("Example Row") === "Yes") { entry.status = "example"; entry.reason = "Template example retained in CSV; existing site samples remain untouched"; continue; }
        if (row["Example Row"] !== "No") throw new Error("Example Row must explicitly be No for real-data candidates");
        if (file === "people") {
          const name = get("Full Name"), sources = list(get("Source URL")), email = get("Email"), orcid = get("ORCID");
          const people = [...current.people, ...candidates.people];
          const identity = people.find((person) => (orcid && person.links.orcid === orcid) || (email && person.links.email?.toLowerCase() === email.toLowerCase()) || sources.some((url) => person.sourceUrls?.includes(url) && /\/people\//.test(url)));
          if (identity) {
            if (normalize(identity.name) !== normalize(name)) throw new Error(`Identity evidence conflicts with existing person ${identity.id}`);
            entry.status = "duplicate"; entry.reason = `Existing person ${identity.id}; no fields changed`; continue;
          }
          if (people.some((person) => normalize(person.name) === normalize(name))) throw new Error("Name collision without reliable shared identity evidence; review manually");
          const bio = get("Short Biography"), education = get("Education");
          if (/support technician/i.test(bio) && /associate/i.test(get("Academic Position"))) throw new Error("Academic Position/Member Category conflict with the technician biography; confirm role before importing");
          const id = nextId(people);
          const links: Record<string, string> = {};
          for (const [column, key] of Object.entries({ Email: "email", "Personal Website": "website", "Google Scholar": "scholar", ORCID: "orcid", GitHub: "github", LinkedIn: "linkedin", "Twitter/X": "twitter" })) if (get(column)) links[key] = get(column);
          const roles: Record<string, string> = { PI: "pi", "Senior researcher": "senior", Mentee: "mentee" };
          const role = get("Publication Role");
          if (role && !roles[role]) throw new Error("Unknown publication role");
          const person = personSchema.parse(compact({ id, name, displayName: get("Display Name"), status: get("Current/Alumni Status").toLowerCase(), group: get("Member Category"), role: get("Academic Position"), title: get("Profile Title"), affiliation: get("Affiliation"), researchInterests: list(get("Research Interests")), links, biography: bio || education ? String(id) : undefined, sourceUrls: sources, publicationRole: roles[role], order: number(get("Display Order")), featured: boolean(get("Featured")), isMock: false }));
          if (get("Profile Photo Filename")) entry.warnings!.push("Photo not attached automatically; add a verified local asset manually");
          if (!role) entry.warnings!.push("Publication role unknown; no inferred badge role");
          if (person.biography) biographies[person.biography] = [bio, education].filter(Boolean).join("\n\n") + "\n";
          candidates.people.push(person);
        } else if (file === "publications") {
          const records = [...current.publications, ...candidates.publications];
          const title = get("Title"), year = number(get("Year")), identifier = doi(get("DOI"));
          const match = records.find((paper) => (identifier && paper.doi?.toLowerCase() === identifier) || (paper.year === year && normalize(paper.title) === normalize(title)));
          if (match) {
            if ((identifier && match.doi && identifier !== match.doi.toLowerCase()) || normalize(match.title) !== normalize(title) || match.year !== year) throw new Error(`Conflicting publication evidence for ${match.id}`);
            entry.status = "duplicate"; entry.reason = `Existing publication ${match.id}; no fields changed`; continue;
          }
          const record: Record<string, unknown> = { id: nextId(records), title, year, authors: list(get("Ordered Authors")).map((name) => ({ name })), isMock: false };
          const type = get("Publication Type");
          const types = ["Journal Article", "Conference Paper", "Workshop Paper", "Preprint", "Book Chapter", "Review Article", "Other Academic Output"];
          if (type && !types.includes(type)) throw new Error("Unknown publication type");
          if (type) record.publicationType = PUBLICATION_TYPES[types.indexOf(type)];
          for (const [column, key] of Object.entries({ "Journal Name": "journalName", "Conference Name": "conferenceName", Venue: "venue", Publisher: "publisher", Volume: "volume", Issue: "issue", Pages: "pages", "arXiv Identifier": "arxivId", "PubMed ID": "pmid", "PubMed Central ID": "pmcid", Abstract: "abstract", "PDF URL or Filename": "pdfUrl", "Code URL or Filename": "codeUrl", "Slides URL or Filename": "slidesUrl", "Project URL": "projectUrl", "Publication URL": "url", "Google Scholar URL": "scholarUrl", BibTeX: "bibtex" })) if (get(column)) record[key] = get(column);
          if (identifier) record.doi = identifier;
          record.keywords = list(get("Keywords"));
          record.sourceUrls = list(get("Source URL"));
          record.areas = list(get("Research Areas")).map((title) => { if (!RESEARCH_IDS[title]) throw new Error(`Unmapped research area: ${title}`); return RESEARCH_IDS[title]; });
          for (const [column, key] of [["Open Access", "openAccess"], ["Featured", "featured"]]) if (get(column)) record[key] = boolean(get(column));
          if (get("Citation Count")) record.citationCount = number(get("Citation Count"));
          entry.warnings!.push("Author personIds and verification receipt intentionally omitted; CSV provides no confirmed identity mappings or review timestamp");
          candidates.publications.push(publicationSchema.parse(record));
        } else if (file === "research") {
          const title = get("Research Direction Title"), id = RESEARCH_IDS[title];
          if (/PROPOSED DRAFT/i.test(row["Review Notes"])) throw new Error("Proposed research agenda explicitly requires lab confirmation before publication");
          if (!id) throw new Error("Research title has no explicitly configured stable taxonomy ID");
          if ([...current.research, ...candidates.research].some((area) => area.id === id || normalize(area.title) === normalize(title))) { entry.status = "duplicate"; entry.reason = `Existing research direction ${id}`; continue; }
          candidates.research.push(researchSchema.parse({ id, title, summary: get("Short Summary"), description: get("Detailed Description"), motivation: get("Motivation"), challenges: list(get("Research Challenges")), approach: get("Methods"), applications: get("Applications"), keywords: list(get("Keywords")), links: list(get("Additional Links")).map((url) => ({ label: new URL(url).hostname, url })), order: number(get("Display Order")), isMock: false }));
          entry.warnings!.push("No approved image supplied; displayed without an image");
        } else if (file === "funding") {
          const records = [...current.funding.projects, ...candidates.projects];
          const title = get("Project Title"), grantId = get("Grant Number"), name = get("Funder"), programme = get("Funding Program");
          const allFunders = [...current.funding.funders, ...candidates.funders];
          const funder = allFunders.find((entry) => normalize(entry.name) === normalize(name) && entry.programme === programme);
          const match = records.find((project) => (grantId && project.grantId?.toLowerCase() === grantId.toLowerCase()) || (normalize(project.title) === normalize(title) && normalize(allFunders.find((item) => item.id === project.funderId)?.name ?? "") === normalize(name)));
          if (match) { if (normalize(match.title) !== normalize(title)) throw new Error(`Grant conflicts with project ${match.id}`); entry.status = "duplicate"; entry.reason = `Existing project ${match.id}`; continue; }
          let funderId = funder?.id;
          let newFunder: z.output<typeof funderSchema> | undefined;
          if (name && !funder) {
            funderId = nextNamedId(allFunders, "pi-funder");
            while (allFunders.some((item) => item.id === funderId)) funderId += "-new";
            newFunder = funderSchema.parse({id: funderId, name, shortName: get("Funder Short Name") || name, programme, isMock: false});
          }
          const areas = list(get("Related Research Areas")).map((title) => { if (!RESEARCH_IDS[title]) throw new Error(`Unmapped research area ${title}`); return RESEARCH_IDS[title]; });
          const papers = [...current.publications, ...candidates.publications];
          const publicationIds = list(get("Related Publications")).flatMap((reference) => {
            const paper = papers.find((paper) => (paper.doi && paper.doi.toLowerCase() === doi(reference)) || paper.url === reference || paper.sourceUrls?.includes(reference));
            if (!paper) entry.warnings!.push(`Unresolved publication retained in CSV: ${reference}`);
            return paper ? [paper.id] : [];
          });
          const start = get("Start Date"), end = get("End Date"), status = get("Project Status").toLowerCase();
          const project = projectSchema.parse(compact({ id: nextNamedId(records, "pi-project"), title, acronym: get("Acronym"), funderId, programme, status, startDate: start, endDate: end, startYear: start ? Number(start.slice(0, 4)) : undefined, endYear: end ? Number(end.slice(0, 4)) : undefined, leadName: get("Principal Investigator"), teamNames: list(get("Lab Team Members")), partners: list(get("Collaborators / Partner Organizations")), summary: get("Project Description"), grantId, areas, publicationIds, budgetEUR: number(get("Funding Amount (EUR)")), website: get("Website"), outputs: list(get("Expected Outputs")), isMock: false }));
          if (newFunder) candidates.funders.push(newFunder);
          candidates.projects.push(project);
          if (!start || !end || !status || !project.leadName || !name) entry.warnings!.push("Missing dates, status, PI or funder left unknown; no inferred completion or member IDs");
        } else if (file === "news") {
          const records = [...current.news, ...candidates.news], title = get("Headline"), date = get("Date");
          if (records.some((item) => normalize(item.title) === normalize(title) && item.date === date)) { entry.status = "duplicate"; entry.reason = "Existing headline/date"; continue; }
          candidates.news.push(newsSchema.parse(compact({ id: nextNamedId(records, "pi-news"), title, date, category: get("Category"), summary: get("Short Announcement"), externalLink: get("External URL"), links: list(get("Additional Links")).map((url) => ({label: new URL(url).hostname, url})), featured: boolean(get("Featured")), isMock: false })));
        } else if (file === "equipment") {
          const records = [...current.hardware, ...candidates.hardware];
          const title = get("Equipment Name"), model = get("Model"), specifications = get("Specifications as Reported");
          const match = records.find((item) => normalize(item.title) === normalize(title));
          if (match) {
            if ((match.model ?? "") !== model || (match.specifications ?? "") !== specifications || (get("Purchase Year") && match.purchaseYear !== number(get("Purchase Year")))) throw new Error(`Equipment configuration conflicts with ${match.id}; review manually`);
            entry.status = "duplicate"; entry.reason = `Existing equipment ${match.id}`; continue;
          }
          if (get("Related Projects")) entry.warnings!.push("Project names require explicit reviewed project IDs; retained in CSV");
          candidates.hardware.push(hardwareSchema.parse(compact({ id: nextNamedId(records, "hardware"), title, category: "Hardware", hardwareCategory: get("Category"), manufacturer: get("Manufacturer"), model, purchaseYear: number(get("Purchase Year")), purchaseDate: get("Purchase Date"), specifications, quantity: number(get("Quantity")), description: get("Description"), researchApplications: list(get("Research Applications")), location: get("Location"), availability: get("Availability"), image: get("Image Filename") ? `../assets/hardware/${get("Image Filename")}` : undefined, imageAlt: get("Image Description"), order: number(get("Display Order")), sourceUrl: get("Source URL"), reviewNotes: get("Review Notes"), isMock: false })));
          entry.warnings!.push("Specifications are unverified reported source values; unspecified equipment details remain omitted");
        } else if (file === "site-information") {
          throw new Error("Singleton site configuration already exists; append-only import cannot replace mission, contact, branding or social links");
        } else {
          throw new Error("This file currently contains template examples only; real rows require the documented manual mapping and schema review");
        }
        entry.status = "candidate";
      } catch (error) { entry.reason = error instanceof Error ? error.message : String(error); }
      finally {
        entry.unmapped = Object.fromEntries(Object.entries(row).filter(([key, value]) => value && !used.has(key)));
        if (!entry.warnings?.length) delete entry.warnings;
        if (!Object.keys(entry.unmapped).length) delete entry.unmapped;
      }
    }
  }
  peopleRecordsSchema.parse([...current.people, ...candidates.people]);
  publicationRecordsSchema.parse([...current.publications, ...candidates.publications]);
  const summary = Object.fromEntries(files.map((file) => [file, Object.fromEntries(["candidate", "duplicate", "skipped", "example", "missing"].map((status) => [status, report.filter((entry) => entry.file === file && entry.status === status).length]))]));
  // Keep new source IDs numeric; Astro's loaders normalize them to strings later.
  const sourceCandidates = {
    ...candidates,
    people: candidates.people.map((person) => ({ ...person, id: Number(person.id) })),
    publications: candidates.publications.map((paper) => ({ ...paper, id: Number(paper.id) })),
  };
  return { writesProduction: false, summary, candidates: sourceCandidates, biographies, report };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  if (args.includes("--help")) console.log("Usage: npm run import:pi -- [--directory path]\nPrints candidate JSON, biographies, row-level warnings and skipped records. Never writes authoritative files. Review the plan before deliberately appending new records.");
  else {
    const index = args.indexOf("--directory");
    if (index >= 0 && (!args[index + 1] || args[index + 1].startsWith("--"))) throw new Error("--directory requires a path");
    console.log(JSON.stringify(preparePiImport(undefined, index >= 0 ? resolve(args[index + 1]) : undefined), null, 2));
  }
}

// Editable fictional content for the normal local website. Never publish as real lab data.
import { mkdirSync, writeFileSync } from "node:fs";
import { publicationRecordsSchema, publicationSchema } from "../src/lib/publication-schema.ts";
import { peopleRecordsSchema } from "../src/lib/people-schema.ts";
import { toBibtex } from "../src/lib/publication-format.ts";
const rows = [
  ["jane-doe", "Jane Doe, PhD", "Lab Leadership", "Lab Head & Principal Investigator"],
  [1001, "Mira Chen", "Research Scientists", "Research Scientist"],
  [2001, "Amina Idris", "Research Scientists", "Senior Research Scientist"],
  [2002, "Leo Martin", "Research Scientists", "Research Scientist"],
  [2003, "Sofia Costa", "Postdocs", "Postdoctoral Researcher"],
  [2004, "Noah Meyer", "Postdocs", "Postdoctoral Researcher"],
  [2005, "Lina Park", "Postdocs", "Postdoctoral Researcher"],
  ["john-roe", "John Roe", "PhD Students", "PhD Researcher"],
  [2006, "Arjun Rao", "PhD Students", "PhD Researcher"],
  [2007, "Eva Laurent", "PhD Students", "PhD Researcher"],
  [2008, "Minh Tran", "PhD Students", "PhD Researcher"],
  [2009, "Omar Haddad", "PhD Students", "PhD Researcher"],
  [2010, "Sara Kim", "Master's Students", "Master's Thesis Student"],
  [2011, "Nora Weiss", "Master's Students", "Master's Research Student"],
  [2012, "Daniel Moreau", "Master's Students", "Master's Thesis Student"],
  [2013, "Leila Hassan", "Interns", "Research Intern"],
  [2014, "Theo Ruiz", "Interns", "Research Intern"],
  [2015, "Elena Rossi", "Collaborators", "Academic Collaborator"],
  [2016, "Mateo Silva", "Collaborators", "Industry Research Collaborator"],
  [2017, "Aya Sato", "Guests", "Visiting Professor"],
  [2018, "Iris Becker", "Guests", "Visiting PhD Researcher"],
  [2019, "Alex Rivera", "Former Members", "Former Research Engineer"],
  [2020, "Zoe Campbell", "Former Members", "Former Postdoctoral Researcher"],
  [1002, "Adrian Blake", "Alumni", "PhD Alumnus"],
  [2021, "Hana Novak", "Alumni", "PhD Alumna"],
  [2022, "Gabriel Santos", "Alumni", "Master's Alumnus"],
];
const interests = [
  ["Learning for wireless networks", "Resource allocation"],
  ["Cloud and edge intelligence", "Federated learning"],
  ["Satellite communications", "Non-terrestrial networks"],
  ["Open wireless benchmarks", "Reproducible research"],
  ["Optimization", "Energy-efficient communications"],
];
mkdirSync("src/content/biographies", { recursive: true });
mkdirSync("src/assets/people", { recursive: true });
const people = rows.map(([id, name, group, role], index) => {
  const alumni = group === "Alumni" || group === "Former Members";
  const trainee = ["PhD Students", "Master's Students", "Interns", "Alumni"].includes(group);
  const withHeadshot = index % 7 !== 5;
  const affiliation = ["Collaborators", "Guests"].includes(group) ? "Example Partner Research Institute" : "TelecomAI Lab · demo profile";
  const person = { id, name, ...(id === "jane-doe" ? { displayName: "Jane Doe" } : {}), status: alumni ? "alumni" : "current", group, role,
    publicationRole: index === 0 ? "pi" : trainee ? "mentee" : "senior",
    title: role, affiliation, researchInterests: interests[index % interests.length], biography: String(id),
    ...(withHeadshot ? { headshot: `../assets/people/demo-${id}.svg` } : {}),
    links: { email: `demo-${id}@example.com`, ...(index % 2 === 0 ? { website: `https://example.com/people/${id}`, scholar: `https://example.com/scholar/${id}` } : {}),
      ...(index % 3 === 0 ? { github: `https://example.com/github/${id}`, orcid: `https://example.com/orcid/${id}` } : {}),
      ...(index % 4 === 0 ? { linkedin: `https://example.com/linkedin/${id}` } : {}) },
    order: index + 1, featured: index < 4, isMock: true };
  const short = name.replace(/,.*/, "").split(" ")[0];
  writeFileSync(`src/content/biographies/${id}.md`, `[Demo] ${short} explores ${person.researchInterests[0].toLowerCase()} and ${person.researchInterests[1].toLowerCase()}.\n`);
  if (withHeadshot) {
    const backgrounds = ["#e1edf8", "#f4e4ef", "#e1f1ec", "#ece7f6", "#fff0db", "#dfeaf0"];
    const shirts = ["#235b80", "#664e89", "#296d66", "#a9536c", "#455a77", "#a46f45"];
    const skins = ["#edc2a1", "#ce9d7a", "#b57f5f", "#f3d2b5", "#98664f"];
    const hair = ["#283340", "#574237", "#302934", "#755344"];
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="480" viewBox="0 0 480 480"><rect width="480" height="480" fill="${backgrounds[index % 6]}"/><circle cx="365" cy="95" r="100" fill="#ffffff" opacity=".35"/><path d="M70 480v-52c0-98 74-151 170-151s170 53 170 151v52" fill="${shirts[index % 6]}"/><path d="M206 270h68v72c-20 21-49 21-68 0z" fill="${skins[index % 5]}"/><ellipse cx="240" cy="199" rx="88" ry="106" fill="${skins[index % 5]}"/><path d="M151 202c-12-85 18-127 91-127 73 0 103 46 88 133l-22-30-6-57c-44 34-92 41-140 36z" fill="${hair[index % 4]}"/><path d="M192 205h21m54 0h21" stroke="#35404a" stroke-width="8" stroke-linecap="round"/><path d="M222 247q18 14 36 0" fill="none" stroke="#865747" stroke-width="6" stroke-linecap="round"/>${index % 3 === 0 ? '<g fill="none" stroke="#455567" stroke-width="5"><rect x="177" y="185" width="52" height="37" rx="12"/><rect x="251" y="185" width="52" height="37" rx="12"/><path d="M229 199h22"/></g>' : ''}<path d="m206 317-29 24 37 56 26-47 26 47 37-56-29-24-34 31z" fill="#fff" opacity=".9"/></svg>`;
    writeFileSync(`src/assets/people/demo-${id}.svg`, svg + "\n");
  }
  return person;
});
peopleRecordsSchema.parse(people);
writeFileSync("src/data/people.json", JSON.stringify(people, null, 2) + "\n");
const byId = new Map(people.map(p => [String(p.id), p]));
const author = (id, flags = {}) => { const p = byId.get(String(id)); const tokens = p.name.replace(/,.*/, "").split(" "); return { name: `${tokens.at(-1)} ${tokens[0][0]}`, personId: id, ...flags }; };
const definitions = [
  ["sample-2024-network", "journal-article", 2024, "Learning to schedule energy-efficient wireless networks"],
  [1001, "journal-article", 2026, "Cloud-edge intelligence for adaptive radio access"],
  ["adam2025generative", "conference-paper", 2023, "Federated traffic prediction with heterogeneous edge devices"],
  [1002, "conference-paper", 2025, "Joint beam selection for integrated satellite-terrestrial networks"],
  [1003, "workshop-paper", 2026, "Practical evaluation of shared spectrum learning"],
  [1004, "workshop-paper", 2021, "Reproducible experiments for wireless network control"],
  [1005, "preprint", 2026, "Robust resource allocation with delayed channel feedback"],
  [1006, "preprint", 2024, "Communication-efficient training across mobile edge devices"],
  [1007, "book-chapter", 2023, "A practical introduction to learning-enabled satellite networks"],
  [1008, "book-chapter", 2020, "Optimization foundations for reliable wireless systems"],
  ["nguyen2025semantic", "review-article", 2022, "A review of artificial intelligence for non-terrestrial networks"],
  [1009, "review-article", 2025, "Open challenges in energy-aware edge intelligence"],
  [1010, "other", 2024, "Wireless learning benchmark: a technical report and evaluation guide"],
  [1011, "other", 2026, "Community notes on reproducible communication research"],
];
const areas = ["topic-one", "topic-two", "topic-three", "methods", "theory"];
const publications = definitions.map(([id, publicationType, year, title], index) => {
  const offset = index * 2;
  const ids = [people[1 + offset % 25].id, people[1 + (offset + 1) % 25].id, people[1 + (offset + 12) % 25].id, "jane-doe"];
  let authors = [...new Set(ids.map(String))].map((key, i) => author(byId.get(key).id, i === 0 && index % 3 === 0 ? { coFirst: true, contributions: ["Methodology", "Software"] } : i === 1 && index % 3 === 0 ? { coFirst: true } : {}));
  if (index % 3 === 0) authors.push({ name: `External Demo Collaborator ${index + 1}` });
  const pi = authors.find(a => a.personId === "jane-doe");
  if (pi) Object.assign(pi, { corresponding: true, email: "demo-jane@example.com", contributions: ["Supervision", "Writing – review and editing"], ...(index % 4 === 0 ? { coSenior: true } : {}) });
  if (index === 13) authors = Array.from({ length: 16 }, (_, i) => ({ name: `External Demo Author ${i + 1}` }));
  const record = { id, title: `[Demo] ${title}`, authors, year, publicationType,
    venue: publicationType.includes("conference") || publicationType.includes("workshop") ? "Example Conference on Intelligent Communications" : publicationType === "book-chapter" ? "Example Handbook of Intelligent Networks" : publicationType === "preprint" ? "Demo preprint series" : "Example Journal of Communication Systems",
    ...(publicationType === "journal-article" || publicationType === "review-article" ? { journalName: "Example Journal of Communication Systems", volume: String(index + 1), issue: String(index % 4 + 1), pages: `${101 + index * 10}–${110 + index * 10}` } : {}),
    ...(publicationType.includes("conference") || publicationType.includes("workshop") ? { conferenceName: "Example Conference on Intelligent Communications", pages: `${11 + index * 10}–${18 + index * 10}` } : {}),
    publisher: "Example Academic Press", doi: `10.0000/telecomai.demo.${year}.${id}`,
    ...(publicationType === "preprint" ? { arxivId: `2601.${90000 + index}` } : {}),
    abstract: `This demo study explores ${title.toLowerCase()} using synthetic network traces and simulated workloads. The sample record describes the research question, evaluation setup, and reproducibility materials to demonstrate the publication interface. All authorship, results, identifiers, and citation counts in this preview are fictional.`,
    keywords: ["wireless networks", index % 2 ? "edge intelligence" : "satellite systems", "synthetic evaluation"],
    ...(index < 5 ? { image: `../assets/research/${["wireless", "edge", "satellite", "tools", "theory"][index]}.svg`, imageAlt: "Concept illustration for this demonstration publication" } : {}),
    areas: [areas[index % areas.length], areas[(index + 2) % areas.length]],
    citationCount: index === 1 ? 0 : index % 6 === 0 ? 84 : 5 + index * 7,
    ...(index !== 13 ? { pdfUrl: "/files/publications/mock-paper.pdf" } : {}),
    ...(index % 3 !== 1 ? { codeUrl: "/files/resources/demo-scheduler.js" } : {}),
    ...(index % 4 !== 2 ? { projectUrl: "/mare" } : {}),
    ...(index % 2 ? { slidesUrl: "/files/presentations/mock-slides.pdf" } : {}),
    openAccess: index % 3 !== 2, featured: [0, 1, 2, 3].includes(index), isMock: true };
  // Code/project links use real local demo resources; source schema accepts local resource paths.
  if (index === 13) { delete record.doi; delete record.publisher; delete record.citationCount; }
  if (index % 4 === 0) record.bibtex = toBibtex(publicationSchema.parse(record));
  return record;
});
publicationRecordsSchema.parse(publications);
writeFileSync("src/data/publications.json", JSON.stringify(publications, null, 2) + "\n");
console.log(`Local website demo: ${people.length} people, ${publications.length} publications; two of every type, 2020–2026.`);

const funders = [
  { id: "national", name: "Example Research Foundation", shortName: "ERF", programme: "National research programmes", isMock: true },
  { id: "collaboration", name: "Example Collaborative Research Programme", shortName: "ECRP", programme: "International collaborations", isMock: true },
  { id: "industry", name: "Example Industry Research Partnership", shortName: "EIRP", programme: "Industry partnerships", isMock: true },
];
const projectRows = [
  [701, "AIRWISE", "Learning-driven, energy-aware wireless networks", "national", 2024, 2027, 360000, "active", ["topic-one", "theory"]],
  [702, "EDGECOLLAB", "Collaborative intelligence across cloud and edge", "collaboration", 2025, 2028, 280000, "active", ["topic-two", "methods"]],
  [703, "ORBITAI", "Intelligent resource management for satellite systems", "industry", 2023, 2026, 195000, "active", ["topic-three", "theory"]],
  [704, "OPEN-RADIO", "Open and reproducible radio access research", "collaboration", 2026, 2029, 420000, "active", ["methods", "topic-one"]],
  [705, "GREENLINK", "Energy-efficient learning for connected systems", "national", 2021, 2024, 210000, "completed", ["topic-one", "topic-two"]],
  [706, "SYNTHNET", "Synthetic network traces for reliable evaluation", "industry", 2020, 2022, 95000, "completed", ["methods", "theory"]],
];
const projects = projectRows.map(([id, acronym, title, funderId, startYear, endYear, budgetEUR, status, areas], index) => ({
  id, acronym, title, funderId, startYear, endYear, budgetEUR, status, areas,
  grantId: `DEMO-${startYear}-${id}`, leadPersonId: "jane-doe", teamPersonIds: [people[1 + index].id, people[7 + index].id],
  partners: ["Example Partner University", index % 2 ? "Example Network Systems Company" : "Example Communications Institute"],
  summary: ["Exploring efficient learning and resource allocation under changing traffic, coverage, and reliability constraints.", "Studying collaborative training, deployment, and inference across resource-constrained edge devices.", "Investigating adaptive scheduling and robust connectivity across terrestrial and non-terrestrial links.", "Developing reusable experiment descriptions, baseline implementations, and reproducibility guidance.", "Evaluating the trade-offs between energy consumption, model quality, and communication cost.", "Building a shared approach to documenting synthetic traces and benchmarking network algorithms."][index],
  outputs: ["Algorithms & models", "Open evaluation tools", "Research publications"],
  publicationIds: [publications[index].id], isMock: true,
}));
writeFileSync("src/data/funding.json", JSON.stringify({ funders, projects }, null, 2) + "\n");
const resourceRows = [
  [801, "Wireless scheduling toolkit", "Software", "A compact reference implementation for allocating a shared radio resource budget.", "/files/resources/demo-scheduler.js", "JavaScript", "MIT", "v1.2.0"],
  [802, "Edge learning starter kit", "Software", "A small starting point for understanding client updates and aggregation in federated learning.", "/files/resources/demo-edge-training.py", "Python", "MIT", "v0.4.0"],
  [803, "Synthetic channel traces", "Datasets", "A small, documented set of channel and signal measurements for trying data-loading workflows.", "/files/resources/channel-traces.csv", "CSV", "CC0-1.0", "v1.0"],
  [804, "Edge workload samples", "Datasets", "Example device workloads with compute budgets, network demand, and latency targets.", "/files/resources/edge-workloads.json", "JSON", "CC0-1.0", "v1.1"],
  [805, "Wireless baseline benchmark", "Benchmarks", "Reference settings and example scores for comparing scheduling strategies consistently.", "/files/resources/benchmark-results.csv", "CSV", "CC-BY-4.0", "2026.1"],
  [806, "Satellite evaluation scenarios", "Benchmarks", "Reusable scenario descriptions covering visibility windows and changing link conditions.", "/files/resources/satellite-scenarios.json", "JSON", "CC-BY-4.0", "v0.3"],
  [807, "Reproduce a wireless experiment", "Tutorials", "A short walkthrough of recording inputs, running a baseline, and reporting an experiment.", "/files/resources/reproducibility-guide.md", "Markdown", "CC-BY-4.0", "v1.0"],
  [808, "Getting started with the lab tools", "Tutorials", "An introductory guide to the example code, datasets, and evaluation resources on this page.", "/files/resources/getting-started.html", "Web guide", "CC-BY-4.0", "v1.0"],
  [809, "Wireless AI seminar slides", "Presentations", "A sample seminar deck connecting learning methods with communication system design.", "/files/presentations/mock-slides.pdf", "PDF", "CC-BY-4.0", "2026"],
  [810, "Satellite networks research overview", "Presentations", "An example research presentation covering intelligent satellite and terrestrial connectivity.", "/files/publications/mock-paper.pdf", "PDF", "CC-BY-4.0", "2025"],
  [811, "Publication citation template", "Templates", "A ready-to-edit BibTeX entry illustrating the bibliographic fields used by the lab website.", "/files/resources/citation-template.bib", "BibTeX", "CC0-1.0", "v1.0"],
  [812, "Experiment documentation template", "Templates", "A concise template for assumptions, dependencies, parameters, and reproducibility notes.", "/files/resources/experiment-template.md", "Markdown", "CC0-1.0", "v1.0"],
];
const resources = resourceRows.map(([id, title, category, summary, url, format, license, version], index) => ({
  id, title, category, summary, url, format, license, version, access: index === 5 ? "request" : "open",
  tags: [areas[index % areas.length], index % 2 ? "Reproducibility" : "Getting started"],
  updated: `2026-${String(3 + index % 8).padStart(2, "0")}-15`,
  maintainerPersonIds: [people[1 + index % 6].id, people[7 + index % 8].id],
  publicationId: publications[index % publications.length].id,
  featured: index < 2, isMock: true,
}));
writeFileSync("src/data/resources.json", JSON.stringify(resources, null, 2) + "\n");
writeFileSync("public/files/resources/channel-traces.csv", "sample,time_ms,snr_db,bandwidth_mhz\n1,0,18.2,20\n2,10,19.1,20\n3,20,17.6,40\n4,30,21.3,40\n5,40,20.7,20\n");
writeFileSync("public/files/resources/edge-workloads.json", JSON.stringify({ demo: true, devices: [{ id: "edge-01", computeBudget: 8, latencyTargetMs: 25 }, { id: "edge-02", computeBudget: 4, latencyTargetMs: 50 }] }, null, 2) + "\n");
writeFileSync("public/files/resources/benchmark-results.csv", "demo_strategy,throughput_score,energy_score\nfixed_allocation,0.65,0.72\nproportional_allocation,0.78,0.68\nlearning_baseline,0.83,0.74\n");
writeFileSync("public/files/resources/satellite-scenarios.json", JSON.stringify({ demo: true, scenarios: [{ name: "Short visibility window", durationSeconds: 120 }, { name: "Changing user density", users: [10, 25, 50] }] }, null, 2) + "\n");
writeFileSync("public/files/resources/reproducibility-guide.md", "# Reproduce an experiment\n\nDemo learning material.\n\n1. Record the dataset version and assumptions.\n2. Save the configuration and random seed.\n3. Run a documented baseline.\n4. Report metrics, uncertainty, and limitations.\n");
writeFileSync("public/files/resources/getting-started.html", '<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Getting started · Demo guide</title><body style="font:18px/1.7 system-ui;color:#25364a;max-width:760px;margin:60px auto;padding:24px"><p style="color:#155e9c">TELECOMAI · DEMO MATERIAL</p><h1>Start with a small experiment</h1><p>Download a sample dataset, inspect its fields, and choose an evaluation baseline.</p><ol><li>Read the resource license and version.</li><li>Inspect the configuration.</li><li>Record how results were produced.</li></ol><p><a href="/mare">Back to Materials &amp; Resources</a></p></body></html>\n');
writeFileSync("public/files/resources/citation-template.bib", toBibtex(publicationSchema.parse(publications[0])) + "\n");
writeFileSync("public/files/resources/experiment-template.md", "# Experiment title\n\nDemo documentation template.\n\n## Research question\n\n## Dataset and license\n\n## Environment and dependencies\n\n## Parameters and random seeds\n\n## Metrics and uncertainty\n\n## Limitations\n");
console.log(`Also generated ${projects.length} funding projects and ${resources.length} downloadable resources.`);

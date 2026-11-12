import type { PublicationMetadata, PublicationType } from "./publication-schema.ts";

export const publicationType = (record: PublicationMetadata): PublicationType => record.publicationType
  ?? (record.areas.includes("review") ? "review-article" : "other");
const venueName = (record: PublicationMetadata) => record.venue ?? record.journalName ?? record.conferenceName ?? "";

/** A consistent compact citation using only supplied bibliographic fields. */
export function venueCitation(record: PublicationMetadata) {
  const volumeIssue = `${record.volume ?? ""}${record.issue ? `(${record.issue})` : ""}`;
  return [venueName(record), String(record.year), volumeIssue, record.pages ? `pp. ${record.pages}` : "", record.publisher]
    .filter(Boolean).join(" · ");
}

const latex = (value: string) => value.replace(/[\\{}&%$#_~^]/g, (char) => ({
  "\\": "\\textbackslash{}", "{": "\\{", "}": "\\}", "&": "\\&", "%": "\\%",
  "$": "\\$", "#": "\\#", "_": "\\_", "~": "\\textasciitilde{}", "^": "\\textasciicircum{}",
})[char]!);

/** Preserve source author strings as literal names rather than guessing surnames. */
export function toBibtex(record: PublicationMetadata) {
  if (record.bibtex) return record.bibtex;
  const type = publicationType(record);
  const entryType = type === "journal-article" || type === "review-article" ? "article"
    : type === "conference-paper" || type === "workshop-paper" ? "inproceedings"
    : type === "book-chapter" ? "incollection" : "misc";
  const fields: [string, string | undefined][] = [
    ["title", record.title], ["year", String(record.year)],
    [entryType === "article" ? "journal" : entryType === "inproceedings" || entryType === "incollection" ? "booktitle" : "howpublished", venueName(record)],
    ["publisher", record.publisher], ["volume", record.volume], ["number", record.issue],
    ["pages", record.pages?.replace(/\s*[-–—]+\s*/g, "--")], ["doi", record.doi],
    ["eprint", record.arxivId], ["archivePrefix", record.arxivId ? "arXiv" : undefined],
    ["url", [record.url, record.projectUrl, record.pdfUrl].find((url) => url?.startsWith("http"))],
  ];
  const key = `telecomai${record.id.replace(/[^a-z0-9_-]/gi, "")}`;
  const authors = record.authors.map((author) => `{${latex(author.name)}}`).join(" and ");
  const lines = [`  author = {${authors}}`, ...fields.filter(([, value]) => !!value).map(([name, value]) => `  ${name} = {${latex(value!)}}`)];
  return `@${entryType}{${key},\n${lines.join(",\n")}\n}`;
}

export function publicationSearchText(record: PublicationMetadata) {
  return [record.title, ...record.authors.map((author) => author.name), record.venue,
    record.journalName, record.conferenceName, ...(record.keywords ?? [])].filter(Boolean).join(" ").toLowerCase();
}

import type { PublicationAuthor, PublicationMetadata } from "./publication-schema.ts";

interface Member {
  id: string;
  data: { publicationRole?: "pi" | "senior" | "mentee" };
}

/** Only an explicit ID can link an author; names never participate in matching. */
export function personForAuthor<T extends { id: string }>(author: PublicationAuthor, people: ReadonlyMap<string, T>) {
  return author.personId ? people.get(author.personId) : undefined;
}

export function publicationRoles(record: PublicationMetadata, people: ReadonlyMap<string, Member>) {
  const isPI = (author: PublicationAuthor) => personForAuthor(author, people)?.data.publicationRole === "pi";
  const isMentee = (author: PublicationAuthor) => personForAuthor(author, people)?.data.publicationRole === "mentee";
  const first = record.authors[0];
  const last = record.authors.at(-1)!;
  const leadAuthors = record.authors.filter((author, index) => index === 0 || author.coFirst);
  const piFirstOrSenior = record.piFirstOrSenior ?? record.authors.some((author, index) =>
    isPI(author) && (index === 0 || index === record.authors.length - 1 || author.coFirst || author.coSenior),
  );
  const menteeLed = record.menteeFirstAuthor ?? leadAuthors.some(isMentee);
  const sharedFirst = record.authors.some((author) => author.coFirst);
  const sharedSenior = record.authors.some((author) => author.coSenior);
  const soleFirst = isPI(first) && !sharedFirst && !first.coSenior;
  const soleLast = isPI(last) && !sharedSenior && !last.coFirst;
  // Real records with unreviewed identities cannot establish a PI collaboration.
  const knownPiRole = record.authors.some(isPI);
  const collaboration = record.collaboration ?? ((record.isMock || knownPiRole) && !soleFirst && !soleLast);
  const primaryResearch = record.publicationType !== "review-article" && !record.areas.includes("letter") && !record.areas.includes("review");
  return { menteeLed, piFirstOrSenior, collaboration, featured: record.featured ?? (primaryResearch && (menteeLed || (piFirstOrSenior && record.year >= 2019))) };
}

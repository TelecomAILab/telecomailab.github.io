import { z } from "zod";
import fundingData from "../data/funding.json";
import resourceData from "../data/resources.json";
import peopleData from "../data/people.json";
import publicationData from "../data/publications.json";
import hardwareData from "../data/hardware.json";
import { fundingSchema, resourceSchema, hardwareSchema } from "./lab-schemas";
import { resolveMockReferences } from "./mock-references";
export { RESOURCE_CATEGORIES } from "./lab-schemas";

const directory = {
  people: new Set(peopleData.map((person) => String(person.id))),
  publications: new Set(publicationData.map((paper) => String(paper.id))),
  funders: new Set(fundingData.funders.map((funder) => String(funder.id))),
  projects: new Set(fundingData.projects.map((project) => String(project.id))),
};
export const funding = fundingSchema.parse({ ...fundingData, projects: fundingData.projects.map((project) => resolveMockReferences(project, directory, `project ${project.id}`)) });
export const resources = z.array(resourceSchema).parse(resourceData.map((resource) => resolveMockReferences(resource, directory, `resource ${resource.id}`)));
// Keep internal notes out of the public card model.
export const hardware = z.array(hardwareSchema).parse(hardwareData).map(({ reviewNotes: _notes, ...item }) => item).sort((a, b) => a.order - b.order || a.id.localeCompare(b.id));

const personIds = new Set(peopleData.map((person) => String(person.id)));
const pubIds = new Set(publicationData.map((paper) => String(paper.id)));
const funderIds = new Set(funding.funders.map((funder) => funder.id));
for (const [label, entries] of [["funders", funding.funders], ["projects", funding.projects], ["resources", resources], ["hardware", hardware]] as const) {
  if (new Set(entries.map((entry) => entry.id)).size !== entries.length) throw new Error(`Duplicate ${label} IDs`);
}
for (const project of funding.projects) {
  if ((project.funderId && !funderIds.has(project.funderId)) || (project.endYear !== undefined && project.startYear !== undefined && project.endYear < project.startYear) || (project.startDate && project.endDate && project.endDate < project.startDate)) throw new Error(`Invalid funding project ${project.id}`);
  for (const personId of [...(project.leadPersonId ? [project.leadPersonId] : []), ...project.teamPersonIds]) if (!personIds.has(personId)) throw new Error(`Unknown member ${personId} in project ${project.id}`);
  for (const pubId of project.publicationIds) if (!pubIds.has(pubId)) throw new Error(`Unknown publication ${pubId} in project ${project.id}`);
}
for (const resource of resources) {
  for (const personId of resource.maintainerPersonIds) if (!personIds.has(personId)) throw new Error(`Unknown maintainer ${personId}`);
  if (resource.publicationId && !pubIds.has(resource.publicationId)) throw new Error(`Unknown resource publication ${resource.publicationId}`);
}

const projectIds = new Set(funding.projects.map((project) => project.id));
for (const item of hardware) {
  if (resources.some((resource) => resource.id === item.id)) throw new Error(`Duplicate material ID ${item.id}`);
  for (const projectId of item.relatedProjectIds) if (!projectIds.has(projectId)) throw new Error(`Unknown hardware project ${projectId}`);
}

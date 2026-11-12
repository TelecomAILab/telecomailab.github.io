/** Fill empty ORCID fields without altering IDs, biographies, or other metadata. */
export function applyOrcidUpdates(records, updates) {
  return records.map((record) => {
    const orcid = updates.get(String(record.id));
    if (!orcid || record.links?.orcid) return record;
    return { ...record, links: { ...record.links, orcid } };
  });
}

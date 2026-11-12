# TelecomAI Lab website information collection

Please complete the relevant CSV files and return them with the supporting images
and documents. You can use Microsoft Excel. You do not need to assign website IDs
or understand website development.

## Start here

1. Keep an untouched copy of this package. Every sample row is **fictional** and has
   `Example Row` set to `Yes`; it describes no real person, project, paper, or event.
2. Replace or delete the sample rows. Add one row per real record and set `Example
   Row` to `No`. Do not change column headings. Leave unrelated files unfilled.
3. Leave unknown optional cells empty. Do not enter `N/A`, `unknown`, `0`, a made-up
   date, or an example URL in place of missing information. Explain missing required
   information in `Review Notes`; the website editor will follow up before adding it.
4. For an update, put the existing public page/link in `Existing Website URL` when
   available. Blank optional cells do not request deletion of existing information;
   request a removal explicitly in `Review Notes`.

## Files and required information

All other columns are optional unless the conditions below apply. The website editor
handles internal IDs, links between records, formatting, and technical validation.

| File | One row represents | Required information |
| --- | --- | --- |
| [people.csv](people.csv) | A member, collaborator, guest, former member, or alumnus | Full Name, Member Category, Academic Position, Current/Alumni Status |
| [publications.csv](publications.csv) | One publication | Title, Ordered Authors, Year, Publication Type |
| [research.csv](research.csv) | One research direction | Research Direction Title, Short Summary, Detailed Description, Methods, Applications, Representative Image Filename, Image Description |
| [funding.csv](funding.csv) | One funded project | Project Title, Acronym, Funder, Funder Short Name, Funding Program, Project Description, Principal Investigator, Project Status, start/end dates or confirmed years in Review Notes |
| [talks-seminars.csv](talks-seminars.csv) | One seminar, presentation, or event | Title, Event Type, Speaker, Event Name, Date, Start Time, Timezone, Location, Abstract |
| [news.csv](news.csv) | A short announcement | Date, Category, Headline, Short Announcement |
| [materials.csv](materials.csv) | One software/data/learning resource | Title, Resource Type, Category, Description, Authors / Maintainers, Primary Resource URL or Filename, License, Version, Access, Updated Date |
| [lab-life.csv](lab-life.csv) | One activity with one or more photographs | Activity Title, Date, Category, Photo Filenames, matching Captions, permission for every photograph |
| [site-information.csv](site-information.csv) | The lab's general information | Official Lab Name, Short Name, Research Group, Institution, University, Lab Director, Mission, Contact Email, Address, Google Maps Location; confirmed Website URL when approved |

For Materials, identify at least one lab maintainer; external creators may also be
credited. A completed Funding project needs a related publication for its current
website link. Supply an image description whenever you supply a News or publication
image. A talk's end time is optional, but needed for Add to Calendar features.

## Entering names and multiple values

- Separate lists with a **semicolon**: `Wireless learning; Edge intelligence`.
  Use this for authors, keywords, members, areas, partners, and address lines. A comma
  within a name is allowed. Avoid semicolons inside a single list item.
- `Ordered Authors` must follow the published author order. For example:
  `Demo Élodie Example; Demo External Collaborator; Demo Alex Rivera`.
  Use those positions, starting at **1**, in the lab-member/co-first/co-senior/
  corresponding-author columns: `1; 3`. The website editor will confirm identities;
  identical or similar names alone are insufficient. External authors need no profile.
- In `Author Contributions`, write one numbered statement per line, for example
  `1: Methodology, Software`. Corresponding emails can use `3: name@example.edu`.
  Contributions and email assignments will be reviewed individually.
- Related people use full names; related papers use exact titles or DOIs; related
  projects use titles/acronyms; Research Areas use the direction titles agreed with
  the editor. Keep spelling consistent across files. Add email/affiliation context in
  Review Notes if two people share a name.
- `Additional Links` / `Additional Materials`: one descriptive label and URL or
  supplied filename per line. Long biographies, abstracts, and BibTeX may contain
  line breaks within one cell. Do not split BibTeX into multiple rows.

## Categories and formats

- **Member Category:** Lab Leadership, Faculty, Research Scientists, Researchers,
  Postdocs, Staff, PhD Students, Master's Students, Students, Interns, Collaborators,
  Guests, Affiliates, Former Members, Alumni. Use Academic Position for the precise
  title. Status is `Current` or `Alumni`; former members use Alumni status.
- **Publication Type:** Journal Article, Conference Paper, Workshop Paper, Preprint,
  Book Chapter, Review Article, Other Academic Output. Research Areas are separate.
- **Publication Role** (People, optional): PI, Senior researcher, Mentee. This helps
  identify publication contributions; do not infer it from an author's list position.
- **Event Type:** Seminar, Conference talk, Workshop, Tutorial. An invited talk uses
  the applicable type; mention the invitation in the description if relevant.
- **Project Status:** Active or Completed. **Event Status:** Scheduled, Past, Cancelled.
  Tell the editor about cancellations explicitly; they are not automatically handled.
- **Materials Category:** Software, Datasets, Benchmarks, Tutorials, Presentations,
  Templates. Resource Type describes the format, e.g. Python, CSV, PDF, Web guide.
  Access is Open or By request; select one primary resource link.
- **Lab Life Category:** Conferences, Workshops & Seminars, Lab Activities, Research
  Visits, Celebrations, Team Events. Image Kind is Photo or Illustration.
- Use `Yes` / `No` for other choice flags. Dates use **YYYY-MM-DD**, for example
  `2026-11-10`. Publication Year is just `2026`. Times use 24-hour **HH:MM** and a
  named zone such as **Europe/Luxembourg**, not an ambiguous abbreviation like CET.
  Give End Date for an overnight event; otherwise blank End Date means the start day
  when End Time is supplied. Do not guess an unknown end time or duration.
- If only a joining/leaving/project year is known, leave its date blank and put the
  confirmed year in Review Notes. Use a decimal point for EUR amounts, without a
  currency sign/thousands separator. Citation Count blank means unknown; `0` means
  a confirmed count of zero. Omit amounts you cannot disclose.
- URLs should be complete, beginning `https://` (or an existing `http://` source).
  DOI should be the identifier `10.…/…`; arXiv should be its identifier. If supplying
  an attachment instead of a URL, enter its exact filename. Leave unavailable links blank.

## Excel and attachments

These files use UTF-8, comma separators, and quoted cells. If double-clicking produces
one column or changes names/dates/identifiers, use **Data → From Text/CSV**, choose
**UTF-8** and **comma**, then set columns to **Text** before loading. This preserves
DOIs, grant numbers, phone numbers, dates, Unicode names, and leading zeros. Widen
columns or enable Wrap Text to read long entries. Save as **CSV UTF-8 (comma delimited)**;
Excel's warning that CSV keeps only the active sheet is expected. Review the saved
file, especially dates, multiline abstracts/BibTeX, and leading zeros. Do not add
formulas, merged cells, headings above the first row, or extra worksheets to a CSV.

Supply the actual photos/logos/diagrams, PDF papers, slides, and downloads separately.
Use short, unique lowercase filenames such as `surname-givenname.jpg`,
`project-diagram.png`, or `paper-short-title.pdf`. JPG/PNG/WebP suit photographs;
SVG suits approved vector logos/diagrams. A clear square portrait of at least
600×600 pixels is a useful source; avoid tiny screenshots or stretched images.
Keep an original high-resolution copy. Supply readable PDFs and the original slides
when useful; the website editor will choose supported public formats.

For multiple Lab Life photos, list filenames and captions in matching semicolon order:
`activity-01.jpg; activity-02.jpg` and `First photo caption; Second photo caption`.
Include photographer credit and publication permission for each image. Do not supply
confidential data, unapproved photos, or documents whose redistribution is prohibited.
Example filenames in these CSVs are placeholders; no example attachments are included.

Return the completed CSVs and attachments together, for example in one ZIP containing
the nine CSVs plus `images/` and `documents/` folders (suggested return folders, not
existing website directories). Include any long biography, Blog article, or Note as
a separate text/Markdown document. Keep filenames identical to their CSV cells and
explain missing files in Review Notes.

The editor will review the package before publication. Some collected details are
retained for editing because the website does not yet display them as separate fields
(education/dates, posters, logos, secondary resource links, and others). They will not
be silently published or discarded. Technical mappings and procedures are maintained
in [Content management](../content-management.md#csv-column-mapping).

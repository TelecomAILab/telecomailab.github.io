# TelecomAI Lab website

Research website for TelecomAI Lab, part of SigCOM at SnT, University of Luxembourg.
Built with Astro, Tailwind CSS, and typed content collections, based on the Cohen
Lab Website Template. This is a static site without a CMS, database, or login.

## Local development

Use Node **22.12 or newer** and npm:

```bash
npm ci
npm run dev
```

Open [localhost:4321](http://localhost:4321). Normal development displays the current
lab records together with retained fictional examples. Keep record-specific demo
labels on examples. Removing some sample records does not require restoring the
original sample counts; missing relationships on retained examples are reported at
build time and omitted only from the rendered links, without editing source data.

```bash
npm run build
npx astro check
npm test
npm run preview -- --port 4322
```

Search uses the last built Pagefind index, including during development. Rebuild
after content changes before reviewing search. Preview the production artifact at
[localhost:4322](http://localhost:4322).

## Documentation

- [Architecture](docs/architecture.md): loaders, relationships, routes, UI contracts,
  search, appearance, and asset provenance.
- [Development](docs/development.md): commands, validation, tooling, deployment
  reference, and known limitations.
- [Content management](docs/content-management.md): editable sources, schemas,
  publishing, imports, assets, and CSV-to-content mappings.
- [PI data collection package](docs/data-collection/README.md): nine Excel-compatible
  CSV templates and instructions for completing them.
- [Agent instructions](AGENTS.md): project-specific rules for coding assistants.

Structured content lives in `src/data/`; biographies, Blog, Notes, figures, and
gallery entries use Markdown in `src/content/`. Images live in `src/assets/`;
public downloads live in `public/files/`. Tests and historical fixtures stay under
`tests/` and are not copied to the website.

`npm run generate:demo` **overwrites** sample data, biographies, avatars, and
downloads. Do not run it over curated records without authorization.

Local builds do not deploy. Existing Actions can publish on a push to `main` or
an explicit workflow run; do not commit, push, or deploy without approval.
Production domain settings still contain placeholders; see the development guide.

## Attribution

The original Cohen Lab Website Template is credited in the footer and
[MIT license](LICENSE). Vendored social icons retain their
[Simple Icons CC0 license](docs/LICENSE-Simple-Icons.md).

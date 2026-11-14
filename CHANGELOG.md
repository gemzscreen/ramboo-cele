# Changelog

All notable changes to the Ramboo CELE App. Versions follow SemVer from v0.0.0
(ROADMAP §2); git tags match (`v0.0.1`). Roadmap-only changes are logged in
`ROADMAP.md` §10.

## v0.0.1 — 2026-11-14

Foundation scaffold. No exam content yet.

- Repo structure per ROADMAP §7: `css/`, `js/{engine,models,figures,live,ui}`,
  `content/{templates/{psad,mste,hge},terms,concepts}`, `tests/`, `docs/`.
- Placeholder app shell (`index.html`, `css/base.css`, `js/main.js`) with the
  version badge and the standard disclaimer. Relative paths only, so it works
  under the GitHub Pages sub-path.
- Quality harness stages 1–3 (`npm test`):
  - Stage 1 — `node --check` on every script, JSON parse on every `.json`.
  - Stage 2 — jsdom: unique IDs, references resolve, no remote assets, app
    boots with no console errors, version strings agree.
  - Stage 3 — fails closed: passes only while there are no templates or
    models; the per-template checks arrive with schema v1 (D5).
- GitHub Actions workflow runs stages 1–3 on every push and pull request.
- `.gitignore` blocks `ramboo-private/`, past-board folders and all PDFs.

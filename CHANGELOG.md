# Changelog

All notable changes to the Ramboo CELE App. Versions follow SemVer from v0.0.0
(ROADMAP §2); git tags match (`v0.0.1`). Roadmap-only changes are logged in
`ROADMAP.md` §10.

## v0.0.3 — 2026-11-14

First model, template engine and Live Figure proof of concept (ROADMAP D5).

- `js/models/beamSimplePoint.js`: pure solver for a simply supported beam with
  one point load; returns reactions, V(x), M(x), maxima and diagram points.
- `js/engine/`: seeded generator (`generator.js`, `rng.js`, `format.js`) —
  samples variables under constraints, fills the stem, keys each item from the
  model and builds choices from named common mistakes.
- `content/templates/psad/PSAD-BEAM-SS-001.js`: first template (status
  `draft`), original wording, three items, hand-solved reference instance.
- `js/figures/beamSimplePoint.js`: SVG figure drawn from the variables, themed
  by `css/figures.css`.
- `js/live/beamSimplePointLive.js`: Live Figure — drag the load or use the
  sliders; reactions, shear and moment diagrams and stat tiles redraw.
- Page now shows a Live Figure preview and one generated board-style sample
  with "New values" and "Show answers".
- Harness Stage 3 is real: closed-form and equilibrium checks per model
  (`tests/models/*.check.js`, required for every model), and per template a
  schema check, 1000 random instances, distinct choices, one correct choice
  matching the model, even answer positions, determinism and the reference
  instance. Stage 2 also checks IDs after the app boots.

## v0.0.2 — 2026-11-14

Design system draft (ROADMAP D6).

- `docs/design-system.md`: colour (one meaning per colour), type, spacing,
  surfaces, components, figure drawing rules, motion and accessibility.
- `css/tokens.css`: all design tokens. Day palette sampled from
  `docs/reference/live-figure-hero.png`; Night palette drafted.
- Placeholder shell restyled from the tokens: engineering-paper panel, and
  Night theme following the OS setting.
- Fonts not loaded yet (Barlow to be confirmed and self-hosted); the shell
  uses the system font meanwhile.

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

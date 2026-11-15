# Changelog

All notable changes to the Ramboo CELE App. Versions follow SemVer from v0.0.0
(ROADMAP §2); git tags match (`v0.0.1`). Roadmap-only changes are logged in
`ROADMAP.md` §10.

## v0.0.5 — 2026-11-15

First HGE template; every subject now has one. Early Phase 1 groundwork.

- `js/models/hydroGateVertical.js`: hydrostatic force on a submerged vertical
  rectangular gate — resultant, centre of pressure, stop and hinge forces.
  Checked against direct integration of the pressure and the pressure-prism
  split, independent of the centroid formulas the solver uses.
- `HGE-HYDRO-GATE-001` (draft): total force, depth of the centre of pressure,
  force on the stop. Passes Stage 3 on all 357 value sets with no fallback
  choices.
- `js/figures/hydroGateVertical.js`: side elevation with water, wall, hinge,
  stop and dimensions. New `--water-fill` token and wall/water figure styles,
  documented in `docs/design-system.md`.

## v0.0.4 — 2026-11-14

Second and third models; engine hardened. Early Phase 1 groundwork.

- `js/models/beamSimpleUdlPoint.js` + template `PSAD-BEAM-SS-002` (draft):
  simply supported beam with a full-span uniform load and a point load —
  reaction, zero-shear location, maximum moment. Solver covers all three
  zero-shear cases (before, under, beyond the load).
- `js/models/simpleCurve.js` + template `MSTE-SURV-CURVE-001` (draft): simple
  horizontal curve, external distance. First `single`-format item, no figure.
- `js/engine/bank.js`: the list of shipped templates.
- `js/figures/beamParts.js`: shared beam drawing parts; new uniform-load figure.
- Sample section gains a problem-type picker across the bank.
- Engine:
  - rounding is exact decimal half-up (no floating-point drift at x.x5);
  - value sets whose keyed answer sits on a rounding boundary are never used;
  - items may declare `valid` to reject impossible choices (e.g. a distance
    beyond the span);
  - a labelled fallback choice (`arithmeticSlip`) when named mistakes cannot
    give three well-separated wrong answers.
- Harness Stage 3 now checks **every** allowed value combination per template
  (13,973 across the three templates) instead of 1000 random ones, tests the
  formatter, fails an item that uses the fallback choice in more than 10% of
  instances, and fails if the bank and the template files disagree.

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

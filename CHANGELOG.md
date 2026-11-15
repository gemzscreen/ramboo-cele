# Changelog

All notable changes to the Ramboo CELE App. Versions follow SemVer from v0.0.0
(ROADMAP §2); git tags match (`v0.0.1`). Roadmap-only changes are logged in
`ROADMAP.md` §10.

## v0.0.13 — 2026-11-15

Past-board topic frequency (D4, first half). Content and harness only; the app
itself is unchanged.

- New `content/frequency.json`: for each subject, how many items and
  situations each taxonomy topic had in each past-board sitting, how many
  sittings it appeared in, its average share of a sitting, and its rank.
  Counts only; no question text, figures or choices (ROADMAP §3).
- Source: the private legacy bank (1,098 items, 7 sittings per subject, Apr 2023
  to Mar 2026). Each situation was placed under one taxonomy topic by reading
  its stem. MSTE has 62 items (19%) with no matching topic, kept as
  "unmapped" for Gemz to decide.
- Harness Stage 3 checks the file: every taxonomy topic listed once, totals and
  per-sitting numbers add up, ranks follow the ordering, and only the expected
  count fields are allowed, so no text can enter this public file.

## v0.0.12 — 2026-11-15

Self-hosted fonts; templates verified.

- Barlow (400, 600, 700) and Barlow Condensed (600, 700) are served from the
  repo (`fonts/`, Latin subset, about 22 kB each, SIL Open Font License in
  `fonts/OFL.txt`). The app no longer falls back to the system font.
- The four templates move from `draft` to `verified` (approved by Gemz).
- Harness Stage 2 checks that every font face points at a file in the repo
  and that the CSS uses no weight without a face.

## v0.0.11 — 2026-11-15

App shell. Early Phase 1 groundwork.

- A fixed app bar with four tabs: Practice, Progress, Explore (Live Figure
  and template preview) and About. One view shows at a time; the address,
  Back button and a reload keep your place.
- Theme switch: Auto (follows the device), Day, Night. The choice is kept on
  the device and applied before the page paints.
- About page: what the app is, how the problems are made, the disclaimer,
  what is stored and where, how to install.
- Installable: web app manifest and an app icon (beam, load and moment
  diagram). No offline mode yet — the app still needs a connection to load.
- TERMS is listed in the subject choice, disabled until its bank exists.
- Taxonomy: the 165 subtopics are approved (origin `ramboo`, revision 2).
- Fix: the forced Night theme lacked the water colour used in HGE figures.
- Harness Stage 2 checks the tabs, the theme switch, that the two Night
  token blocks match, the manifest and icon sizes, and that the About
  disclaimer matches the footer word for word.

## v0.0.10 — 2026-11-15

Progress: KPI dashboard, Reset KPIs and backup. Early Phase 1 groundwork.

- New Progress card: sets done, items correct, average and time spent; a
  table per subject (score, minutes per item against the board pace, items
  left to fix); a table per CELE topic, weakest first.
- "What to study next": a topic is judged after 3 answered items — under 50%
  says review, under 75% says keep practising; a subject slower than board
  pace is flagged; subjects not yet tried are listed.
- Each finished set now saves its per-topic results under the taxonomy topic
  id. Sets saved earlier count in the totals but not in the topic table.
- Reset KPIs forgets the finished sets after a confirmation; the mistakes
  list is kept.
- Export backup downloads everything the app stores on the device as one
  JSON file. Restore backup checks the file, asks, then replaces what is
  stored; a file that is not a sound backup is refused with a reason and
  changes nothing.
- Harness: KPI figures against a hand-computed history; per-topic grading
  adds up; backup round trip; 14 kinds of damaged backup refused; Stage 2
  plays reset and restore through the real UI.

## v0.0.9 — 2026-11-15

Topic taxonomy (decision D4, first cut). Phase 0 content groundwork.

- `content/taxonomy.json`: subject → topic → subtopic for CELE 2026. The 3
  subjects, their weights (35 / 35 / 30) and 39 topics follow the PRC
  program of the examination, in its order. The program lists no subtopics,
  so the 165 subtopics are drafts from the standard CE syllabus, marked
  `"origin": "draft"` for review. IDs read `subject.topic.subtopic` and are
  permanent once a bank is released.
- Templates carry `topic_id` and `subtopic_id`. Their `topic` label is now the
  PRC topic name, so the results table groups by CELE topic ("Theory of
  Structures", "Hydrostatics", "Construction Surveying and Layout") instead
  of the earlier free-text paths.
- Harness Stage 3 checks the taxonomy (structure, unique ids, id pattern,
  weights add up to 100) and every template's tags (ids exist, under the
  template's own subject, label equals the taxonomy name).
- Not in this release: past-board frequency per topic, and archetype IDs per
  subtopic. Both wait on the private sittings (`board_frequency` stays null).

## v0.0.8 — 2026-11-15

Practice my mistakes, and avoid-repeat. Early Phase 1 groundwork.

- Mistake bank: a mistake is one item of one problem type. It is stored once,
  and answering that item correctly in any later set clears it. Results say
  how many items were added and cleared, and how many are left in the subject.
- Setup screen gains a Problems choice: All, or My mistakes (shown with the
  number of items to fix; disabled when there are none). Counts are per
  subject.
- A mistakes set draws only the problem types you missed, most-missed first,
  with new values — so it tests the method, not a remembered answer.
- Avoid-repeat: the last 400 problems shown (type plus values) are remembered
  on the device, and new sets steer away from them.
- Harness: engine checks for the mistake lifecycle, per-subject counting and
  avoid-repeat; Stage 2 plays a mistakes set through the real UI with the
  keyed answers and confirms the mistakes clear.

## v0.0.7 — 2026-11-15

Exam mode. Early Phase 1 groundwork.

- Setup screen gains a Mode choice: Practice (check each answer) or Exam
  (answers at the end).
- Exam mode: an item navigator shows which items are answered; Previous and
  Next move freely; answers can be changed; no key, feedback or solution is
  shown until the set is submitted. Submitting asks first and says how many
  items are unanswered. Time running out submits automatically.
- Results (both modes) now include each unit's problem and worked solution in
  a fold, and name the mode.
- "Discard without saving" in the end/submit confirmation, for both modes.
- Starting a set moves keyboard focus to the first choice.
- Saved history records the mode.
- Harness Stage 2 plays an exam through the real UI: navigation, changed
  answers, nothing revealed early, the submit confirmation, results, discard.

## v0.0.6 — 2026-11-15

Exam engine and the first exam screen: Practice mode. Early Phase 1 groundwork.

- `js/engine/exam.js`: assembles a set from the bank — whole situations for
  PSAD and HGE, single items for MSTE — and grades it. Quick drill is 1
  situation or 5 items; Full set is 3 situations or 10 items. Every template
  is used once before any repeats, and a repeat always has different values.
- `js/engine/timer.js`: countdown at board pace (PSAD and HGE 4.8 min per
  item, MSTE 4.0), with pause.
- `js/engine/storage.js`: set history and the mistake bank, kept in the
  browser only. Works for the visit when storage is unavailable or full.
- Practice screen: pick subject and size; answer one item at a time; each
  answer is checked on the spot; the worked solution appears after the last
  item of a situation; pause hides the problem; ending early asks first and
  counts unanswered items as wrong; results show score, time, a per-topic
  breakdown and an item-by-item review.
- The earlier sample section stays as "Template preview" for reviewing each
  problem type.
- Harness: Stage 3 runs engine checks (`tests/engine/`); Stage 2 plays a
  practice set through the real UI for every subject, plus the pause and
  end-early paths.

Not yet built: Exam mode, mock sets, "exam from my mistakes" (misses are
recorded but there is no screen for them), the KPI dashboard, export/import.

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

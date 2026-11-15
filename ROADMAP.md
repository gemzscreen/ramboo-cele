# Ramboo CELE App — Revamp Roadmap

**Roadmap doc:** R1.18 · created 2026-11-14 · updated 2026-11-15 · owner: Gemz (Engr. Gemar C. Tubalado)
**Product:** Ramboo CELE App (Darkwiz Lab family) — public rebuild of the personal "CELE Training App"
**Repo:** `gemzscreen/ramboo-cele` on GitHub (created 2026-11-14)
**App version:** v0.0.14 (14 problem types: 4 verified, 10 draft; past-board topic frequency table; self-hosted fonts; app shell with tabs, theme switch, About, installable; taxonomy; Practice and Exam modes; mistake bank; KPI dashboard and backup; tags pending — see §9) · legacy personal build = `legacy-4.9.1` (frozen, private)
**Current phase:** PHASE 0 — Foundation & Decisions (in progress)
**Workflow:** GitHub repo + Claude Code (from Phase 0 onward)
**Source of truth:** `ROADMAP.md` in the repo. The claude.ai Project copy (`claude/CELE_REVAMP_ROADMAP.md`) is a mirror, refreshed only when Gemz works in claude.ai again.

> **Session protocol (read this first in every Claude Code session or chat)**
> 1. Read this file before doing anything else. It is the single source of truth.
> 2. Work only on the current phase unless Gemz says otherwise.
> 3. At the end of every session, update §9 Status Board and §10 Changelog in `ROADMAP.md`, and commit.
> 4. Never re-introduce JDCELearn / De La Cruz wording, figures, or solutions into the public app (see §3).
> 5. The repo is public (GitHub Pages). Never commit past-board PDFs, the legacy 4.9.1 bank, or anything from §3's "Never take" list. Private material lives outside the repo (see §7).

---

## 1. Vision

A free-first, mobile-first web app that helps CELE takers **understand** civil engineering and pass the PRC board exam, built entirely on **original** board-style problems. Free during growth (donation-supported), then tiered premium plans to fund development and hosting.

Reference model studied: ceboardexamgenerator.com (Engr. Clidez). We follow the **business path** (free generator → study content → accounts/leaderboards → paid tiers), not its look, names, wording, or content.

### What the reference site offers (studied 2026-11-14)
- Randomized exam generator with shuffled choices; settings for topics, number of situations, set number
- Exam styles: full "submit at end" exam and one-item-at-a-time live check
- Per-mode timers, mistake bank, avoid-repeat history
- Lecture notes per subject, video lessons, calculators/solvers, downloads
- Monthly/all-time leaderboards; Google sign-in; public usernames
- Community problem submission
- Premium: worked solutions, notes hub, saved solver work, ad-free; prepaid ₱99/1 mo, ₱249/3 mo, ₱799/1 yr; PayMongo (QR Ph) + Google Play

### Our differentiators
1. **True parametric generation** — same board pattern, new values every time, answer computed by code.
2. **Code-verified answers** — every template passes an automated solver test harness before release.
3. **Interactive "Live Figures"** — drag a load or change a value and the reactions, shear and moment diagrams redraw (see §4A).
4. **Understanding-first solutions** — every item links to its concept page and NSCP 2015 / ASEP reference.
5. **Board-faithful format** — PSAD/HGE as situations (3 sub-items), MSTE as standalone items; board-paced timers.
6. **Topic-weakness analytics** — mistakes mapped to the CELE 2026 coverage outline.

---

## 2. Versioning scheme (fresh start at v0.0.0)

| Layer | Format | Example | Bumps when |
|---|---|---|---|
| App | SemVer `MAJOR.MINOR.PATCH` | v0.3.2 | pre-1.0: MINOR = feature milestone, PATCH = fix. From v1.0.0: MAJOR = phase milestone / breaking data change |
| Content bank | `BANK-YYYY.MM-rN` | BANK-2026.12-r3 | templates added/revised |
| Roadmap doc | `R#.#` | R1.3 | plan changes |

Git tags match app versions (`v0.1.0`), and every release has a `CHANGELOG.md` entry.

**Phase → version map**
| Phase | App versions | Theme |
|---|---|---|
| 0 | v0.0.x | Foundation: decisions, repo scaffold, taxonomy, design system, template engine skeleton |
| 1 | v0.1.0 → **v1.0.0** | Free core. v1.0.0 = first public launch |
| 2 | v1.1 – v1.x | Study hub, Live Figures, calculators, content scale-up |
| 3 | v2.0 – v2.x | Accounts, cloud sync, leaderboards (Supabase) |
| 4 | v3.0 – v3.x | Monetization (tiers, payments) |
| 5 | v4.0+ | Growth (community bank, faculty mode, Android) |

`legacy-4.9.1` (the old single-file CELE Training App) is **frozen as a private archive** and is never deployed publicly.

---

## 3. Original Content Policy (non-negotiable)

Copyright protects **expression** (wording, figures, worked solutions, layout), not **ideas** (a topic, a structure type, a formula, an exam pattern). Changing only the numbers on someone else's problem keeps their expression, so it can still be treated as a copy. Our rule therefore goes further than "change the values."

**Allowed to take from past boards / JDCELearn booklets**
- Topic, concept, and frequency (e.g., "propped cantilever, find reaction — seen 4 of 7 sittings")
- Generic problem archetype (e.g., "simply supported beam with overhang, UDL + point load, find max moment")
- Exam structure facts (situations of 3, item counts, timing)

**Never take**
- Stem wording or sentence structure, answer choices, figures (including traced redraws), solution text or solution sequence, branding/watermarks

**Every public item must be**
1. Written fresh from the archetype (new scenario, own wording)
2. Drawn from our own geometry (figure generated from template variables, not traced)
3. Solved independently and coded as a solver function
4. Verified by the harness (§6) on many random instances
5. Tagged with concept + code reference (NSCP 2015 section / standard formula)

**Role of the legacy bank (1,098 transcribed items):** private topic/frequency index only. Never shipped, never committed.

**Labels:** use "board-style" / "patterned after recurring board topics." Never claim "actual board question" or "official PRC key." Keep Gemz's standard disclaimer on all generated sets:
> "The problems in this test questionnaire are not exact copies of the actual board exam. They are designed to closely resemble the style, structure, and level of difficulty of real board exam questions to help examinees prepare effectively."

*Not legal advice — before charging money (Phase 4), have the policy and terms reviewed by a lawyer familiar with PH IP law (RA 8293).*

---

## 4. Product scope by phase

### PHASE 0 — Foundation & Decisions (v0.0.x)
Goal: lock every decision that is expensive to change later, and stand up the repo.
- [x] D1 Brand: **Ramboo CELE App**, Darkwiz Lab family (renamed from WREN on 2026-11-14). Repo is `gemzscreen/ramboo-cele` → Pages URL `https://gemzscreen.github.io/ramboo-cele/`. Spelling check closed 2026-11-14: the repo on GitHub is spelled "ramboo" (double o), matching the app name
- [x] D2 Stack & workflow: **GitHub repo + Claude Code**; plain HTML/CSS/JS ES modules, no build step to start
- [x] D3 Hosting: **GitHub Pages** (static front end) + **Supabase** back end on a new, separate account (new email; QS CRM stays on its own account). Account can be created now; first tables needed in Phase 3
- [ ] D4 Topic taxonomy: build from `CELE Coverage 2026 1.pdf` + frequency table from the 12 past-board sittings → `content/taxonomy.json` (subject → topic → subtopic → archetype IDs). Source PDFs read from the private folder (§7), never committed. **First cut built 2026-11-15 (v0.0.9):** `content/taxonomy.json` has the 3 subjects, weights and 39 PRC topics from the coverage PDF, plus 165 draft subtopics (the PDF lists none; marked `origin: draft`); the four templates are tagged and Stage 3 checks it. **Subtopics and placements approved 2026-11-15** (origin now `ramboo`). **Frequency counted 2026-11-15 (v0.0.13):** `content/frequency.json` holds items and situations per topic per sitting, sittings seen, average share and rank for each subject, from the private legacy bank (counts only; Stage 3 checks it). The bank covers **7 sittings per subject (Apr 2023 to Mar 2026), not 12**. **Still open:** archetype IDs per subtopic (needs the private sittings), and counts for any sittings beyond the 7
- [x] D5 Template schema v1 (draft in §5) — **approved 2026-11-15** as implemented (§5, five points), with the four templates as the pattern for later ones. Implemented 2026-11-14 with three changes from the draft, listed in §5 "Schema v1 as implemented"; first template `PSAD-BEAM-SS-001` passes Stage 3. Must satisfy the Live Figures requirement (§4A)
- [x] D6 Design system: Darkwiz Lab look → `docs/design-system.md` (v0.1 with `css/tokens.css`) — **approved 2026-11-15**, Night palette included. Follow-up, not a blocker: the Darkwiz Lab site URL is now on record (`https://darkwizlab.com/`, received 2026-11-15); Barlow / Barlow Condensed are self-hosted (v0.0.12) and still to be compared with the site's CSS. Starting cues captured from the Live Figure hero (§4A "Visual spec"); confirm fonts/colors against the Darkwiz Lab site CSS
- [x] D7 Phase 1 content and structure: **mirror the legacy CELE Training App setup** (see Phase 1), rebuilt with original templates. Minimum: enough templates to fill one full board-paced mock per subject without repeating an archetype — PSAD 75 items (25 situations), MSTE 75 items, HGE 50 items (~17 situations)
- [x] D8 Donations: **GCash/Maya QR + Ko-fi** — Ko-fi link `https://ko-fi.com/darkwizlab` and the GCash/Maya (InstaPay) QR image received 2026-11-15; the image is not in the repo yet and goes in with the donation buttons
- [x] D9 Analytics & privacy — **approved 2026-11-15:** no analytics until v1.0.0, then one cookieless counter (GoatCounter); notice wording in `docs/privacy-notice.md` approved. Public contact email received 2026-11-15: `admin@darkwizlab.com`; still to be added to `docs/privacy-notice.md` before the notice is published
- [x] D10 Timeline: Gemz is in the Philippines and available for about 1 month from 2026-11-14 (before the Brunei move). Target: finish Phase 0 in week 1, Phase 1 in weeks 2–4 (stretch goal: v1.0.0 before departure)
- [x] Repo scaffold (§7), `CLAUDE.md`, `ROADMAP.md`, `CHANGELOG.md`, `.gitignore`, harness stages 1–3 wired, GitHub Pages on — merged to `main` 2026-11-14 (PR #1), hero PNG added. Tag **v0.0.1** still to be created by Gemz (see §9)

**Exit criteria:** D4, D5, D6, D9 closed; repo live on GitHub Pages showing a placeholder shell.

### PHASE 1 — Free Core (v0.1.0 → v1.0.0)
Mirrors the legacy CELE Training App structure, rebuilt clean:
- New UI per design system; PWA installable; Auto/Day/Night theme; frozen app bar, clock/greeting
- Subject tabs: **PSAD / MSTE / HGE / TERMS**
- Drill sizes like legacy: **5 items** (quick drill), **10 items** (full set), **Random Mock Set** (full board length). PSAD/HGE drills draw whole situations (1 or 3 situations); MSTE draws individual items
- Board pacing from legacy, timer locked on start: PSAD 75 items / 6 h (4.8 min/item) · MSTE 75 items / 5 h (4.0 min/item) · HGE 50 items / 4 h (4.8 min/item); pause/cancel with in-app modals
- Modes: *Practice* (each answer checked on the spot; the worked solution appears once the situation's last item is checked, so it cannot give away later items — confirmed 2026-11-15) · *Exam* (solutions at the end; mock sets are exam-only)
- **Exam Generator** settings: subject → topics → size → mode
- Avoid-repeat history; **mistake bank** (local) with "exam from my mistakes"
- Results and KPI dashboard: score, time, per-topic breakdown, study recommendations, Reset KPIs
- Self-study lectures screen (subject tabs) carried over as a stub, filled in Phase 2
- "Predicted Sets" reborn as **Board-Trend Sets**: original templates ranked by past-board topic frequency
- Local progress (localStorage/IndexedDB), export/import backup JSON
- Disclaimer, About, donation buttons (GCash/Maya QR, Ko-fi)
- Past Boards tab (verbatim transcriptions) is **dropped** from the public app

### PHASE 2 — Study Hub, Live Figures & Scale-up (v1.1+)
- Concept pages per topic: theory, formulas, NSCP 2015 references, 1–2 worked examples (original)
- **Live Figures** in solutions and study pages (§4A)
- Formula sheets per subject (printable)
- Calculators built on the same engine: beam (V/M), truss, column/footing checks, soil phase relations, hydrostatics, curve/surveying tools
- Content scale-up toward full taxonomy coverage; TERMS bank rewritten originally

### 4A. Live Figures — interactive training and solutions (build in Phase 2, design for it in Phase 0)
Reference: Darkwiz Lab site hero (screenshot received 2026-11-14 → commit as `docs/reference/live-figure-hero.png`). A working simply supported beam: the user moves the point load or changes P, and the reactions, shear diagram and moment diagram redraw, checked against hand formulas (R_A = Pb/L, R_B = Pa/L, M_max = Pab/L).

**Reference values (use as the first Stage-3 test case):** L = 6.00 m, P = 40 kN, a = 2.00 m, b = 4.00 m → R_A = 26.7 kN, R_B = 13.3 kN, V_max = 26.7 kN, M_max = 53.3 kN·m. (Checked: 40·4/6 = 26.67; 40·2/6 = 13.33; 40·2·4/6 = 53.33.)

**Visual spec (from the screenshot):**
- Canvas: off-white "engineering paper" panel with a fine blue-grey grid (minor + major lines); thin outer border, soft shadow
- Beam: white rectangle, dark ink outline; pin support at A (triangle + hatched ground), roller at B (triangle + wheels + hatched ground); A/B labels above the supports
- Point load: amber/gold arrow with a circular drag handle on top; label "P = 40 kN" in amber
- Reactions: black upward arrows outside each support, labelled R_A / R_B with subscripts and values
- Dimension line under the beam: tick marks at A, the load and B; "a = …", "b = …" above, "L = …" below
- Dotted vertical guide from the load down through both diagrams
- Shear diagram "V": blue outline, light blue fill, end values labelled (+26.7 / −13.3)
- Moment diagram "M": red outline, light red fill, peak value labelled at the load (53.3 kN·m); positive moment drawn upward
- Control strip: two sliders (Load position, Load P) with blue ring thumbs on a grey track; current value right-aligned in bold
- Stat row: four tiles (Reaction at A, Reaction at B, Max shear, Max moment), small grey caption, large bold value; max shear in blue and max moment in red to match the diagrams
- Type: condensed grotesque sans (looks like Barlow / Barlow Condensed — confirm from the site CSS); bold condensed letters for V and M

**Engine rules:**
- **One engine, three uses:** the same pure solver + figure-generator functions drive (1) the generated exam item, (2) an "Explore" panel in its solution, (3) the Study-hub calculators.
- **Phase 0 requirement (D5):** solvers must be pure functions of the template variables and return intermediate values (reactions, V(x), M(x), etc.), not only final answers; figure generators take the same variables.
- **Interactions:** drag loads/supports along the member, sliders for P, w, L, a; live diagrams with max values labelled; "reset to problem values" button.
- **Verification:** each Live Figure gets Stage-3 harness tests comparing its outputs against closed-form hand formulas over random inputs.
- Candidate first set: simply supported beam (point load, UDL), overhang beam, cantilever, truss joint forces, Mohr's circle, hydrostatic force on a gate, soil phase diagram, horizontal curve.

### PHASE 3 — Accounts & Cloud (v2.0+)
- Backend: Supabase (Postgres + Auth + Row Level Security + Edge Functions) on the dedicated Ramboo account
- Google sign-in; public username (real name hidden); avatar
- Cloud sync of history, mistakes, analytics
- Leaderboards: monthly + all-time, timed Exam mode only, reset 1st of month PH time
- Move templates/solutions server-side (prerequisite for paywall — anything shipped in client JS cannot be gated)

### PHASE 4 — Monetization (v3.0+)
- Tiers (draft, finalize later): **Free** (generator, instant check, limited solutions/day) · **Premium** (full step-by-step solutions, Live Figures in solutions, unlimited mistake-bank exams, analytics, printable sets, ad-free)
- Prepaid plans (no auto-renew to start); price benchmark: ₱99 / ₱249 / ₱799
- Payments: PayMongo (QR Ph / e-wallets / cards); webhook → Edge Function → entitlement table
- Prerequisites: business registration (DTI) + BIR registration for app income, Terms of Service, Refund policy, Privacy Notice; lawyer review of §3

### PHASE 5 — Growth (v4.0+)
- Community problem submission with moderation + originality check + contributor credit
- Faculty mode (generate printable sets with answer keys for review centers/schools)
- Live-check mode for livestream teaching
- Android app (TWA wrapper of the PWA) / Google Play billing

---

## 5. Data model — Template schema v1 (draft)

```json
{
  "id": "PSAD-BEAM-OH-001",
  "subject": "PSAD",
  "topic": "Structural Analysis > Beams",
  "archetype": "Simply supported beam with overhang, UDL + point load",
  "format": "situation",          // "situation" (3 sub-items) | "single"
  "board_frequency": "4/7 sittings (2023-2026)",
  "difficulty": 2,                // 1-3
  "vars": {
    "L":  {"min": 5, "max": 9, "step": 0.5, "unit": "m"},
    "a":  {"min": 1.5, "max": 3, "step": 0.5, "unit": "m"},
    "w":  {"min": 10, "max": 30, "step": 2, "unit": "kN/m"},
    "P":  {"min": 20, "max": 60, "step": 5, "unit": "kN"}
  },
  "constraints": ["a < L/2"],
  "stem": "A beam {L} m long rests on supports ... (original wording)",
  "figure": "fig_beam_overhang",  // SVG generator: (vars) -> SVG; reused by Live Figures
  "model": "beamOverhangModel",   // pure solver: (vars) -> {RA, RB, V(x), M(x), Mmax, ...}
  "live": {"draggable": ["P.x"], "sliders": ["P", "w", "L", "a"]},
  "items": [
    {"ask": "Reaction at A (kN)", "pick": "RA", "sig": 3,
     "distractors": ["swapSupports", "omitOverhangLoad", "halfUDL"]}
  ],
  "solution_steps": "solutionBeamOverhang",
  "refs": ["Statics: equilibrium", "NSCP 2015 Sec. 405 (if applicable)"],
  "reference_instance": {"L": 6, "a": 2, "w": 20, "P": 40, "answers": [ ... hand-verified ... ]},
  "status": "draft|verified|live",
  "bank_version": "BANK-2026.12-r1"
}
```
Distractors come from **named common mistakes** (wrong support, missing load, unit slip), so wrong choices teach something.

### Schema v1 as implemented (2026-11-14; approved 2026-11-15 — D5)
Working example: `content/templates/psad/PSAD-BEAM-SS-001.js`. Templates are ES modules, which allowed three changes from the draft above:
1. **`model`, `figure`, `solution` are imported functions, not name strings.** No registry to keep in step; a missing solver is a load error instead of a runtime lookup failure. (`solution_steps` is renamed `solution`.)
2. **Constraints are `{rule, test}` pairs** — `rule` is the readable text (`"a <= L - 1"`), `test` is the function the generator and harness run. No expression parser needed.
3. **Each distractor is `{name, value}`** — the named mistake plus its formula. List more than three: the generator takes them in order and skips any that lands on, or within 2% of, a choice already chosen, so two choices can never differ by a rounding slip. Stage 3 fails the template if any instance ends with fewer than four distinct choices.

4. **Engine rules added with the second and third templates (v0.0.4):** an item may declare `valid(value, vars, result)` to reject impossible choices; a value set is never used when a keyed answer sits on a rounding boundary at the item's `sig` (next digit a bare 5); rounding is decimal half-up; if named mistakes run out, a labelled `arithmeticSlip` fallback fills the gap, and Stage 3 fails an item that needs it in more than 10% of value sets. Every template must be listed in `js/engine/bank.js`.

5. **Taxonomy tags (v0.0.9):** a template carries `topic_id` and `subtopic_id` (ids from `content/taxonomy.json`, pattern `subject.topic.subtopic`). `topic` stays as the display label and must equal the taxonomy's topic name; Stage 3 enforces this so the two cannot drift.

Also: items carry `unit`; `reference_instance` is `{vars, answers}` with answers as the displayed strings; `board_frequency` and `bank_version` are `null` until D4 and the first bank release. Solution text must be written from the given values, never from rounded intermediates, so the working shown reproduces the key.

---

## 6. Quality harness (carried from legacy, extended)
1. **Stage 1 — Syntax:** `node --check` on every script/module
2. **Stage 2 — DOM:** jsdom run of the full app; counts, IDs unique, references resolve, no console errors
3. **Stage 3 — Models and templates:** per template, run every allowed value combination (≥1000 random instances when the grid is too large) → answers finite and physically valid, all choices distinct, correct choice present, constraints respected, **reference instance matches hand-solved values**; Live Figure models checked against closed-form formulas
4. **Stage 4 — Originality check:** scan stems against the private legacy bank for long verbatim overlaps (fail if any ≥8-word run matches). Runs locally only (needs the private folder); skipped in CI
5. Accuracy principles stay: flag, don't silently fix; numeric re-derivation before any key change.

Harness runs locally in Claude Code and (stages 1–3) in GitHub Actions on every push.

---

## 7. Repo structure (approved direction, finalize at scaffold)
```
ramboo-cele/                     (PUBLIC — GitHub Pages)
  index.html            app shell
  manifest.webmanifest  web app manifest (installable)
  icons/                app icon: icon.svg + PNG 180 / 192 / 512
  css/                  design system: fonts.css, tokens.css (all tokens), base.css, components.css, figures.css
  fonts/                Barlow and Barlow Condensed .woff2 (self-hosted) + OFL.txt
  js/  engine/          generator, rng, format, bank, exam, timer, storage
       models/          pure solvers (shared by items, Live Figures, calculators)
       figures/         SVG generators
       live/            Live Figure interaction layer
       ui/              screens
  content/
    taxonomy.json
    templates/psad/*.js  mste/*.js  hge/*.js
    terms/*.json
    concepts/*.md
  tests/                harness stages 1-4 (run.js + one file per stage; `npm test` = stages 1-3)
    models/             <model>.check.js — closed-form checks, one per file in js/models/ (required)
    engine/             *.check.js — exam engine, timer and storage checks
  docs/                 design-system.md, content-policy.md, privacy-and-analytics.md, privacy-notice.md, reference/live-figure-hero.png
  CLAUDE.md             tells Claude Code to read ROADMAP.md first + session protocol
  ROADMAP.md            this file (source of truth)
  CHANGELOG.md
  package.json          dev-only: jsdom for the harness (the app itself has no build step)
  .github/workflows/    harness.yml — stages 1-3 on every push / PR
  .nojekyll             serve files as-is on GitHub Pages
  .gitignore

ramboo-private/                  (NOT in any public repo — sibling folder on Gemz's PC)
  past-boards/          PSAD/MSTC/HPGE board PDFs, CELE Coverage 2026 PDF
  legacy-4.9.1/         old index.html + transcribed bank (frequency index, Stage 4 input)
```

---

## 8. Decision Log
| # | Date | Decision | Notes |
|---|---|---|---|
| — | 2026-11-14 | Revamp approved; legacy 4.9.1 frozen private | Gemz |
| — | 2026-11-14 | Content is original parametric problems only; JDCELearn used as topic/frequency index only | See §3 |
| D1 | 2026-11-14 | Name: **Ramboo CELE App** (Darkwiz Lab family); repo `ramboo-cele` | Replaces "WREN"; repo spelling confirmed (double o) |
| D2 | 2026-11-14 | GitHub repo + Claude Code workflow | Replaces single-file chat uploads |
| D3 | 2026-11-14 | GitHub Pages + Supabase (new separate account) | QS CRM keeps its own Supabase |
| D7 | 2026-11-14 | Phase 1 mirrors legacy app structure, original content | Full mock per subject: 75 / 75 / 50 |
| D8 | 2026-11-14 | Donations: GCash/Maya QR + Ko-fi | |
| D10 | 2026-11-14 | ~1 month available in PH before Brunei | Phase 0 wk 1, Phase 1 wks 2–4 |
| V | 2026-11-14 | Versioning restarts at **v0.0.0**; v1.0.0 = public launch | Replaces the v5.x plan in R1.0 |
| LF | 2026-11-14 | Live Figures (interactive diagrams in training/solutions) adopted | Build Phase 2; schema ready in Phase 0 |
| SOT | 2026-11-14 | Repo `ROADMAP.md` is the source of truth; Project doc is a mirror | Claude Code can't read Project docs |
| D4 | 2026-11-15 | Taxonomy subtopics approved; determinate beams under Theory of Structures; simple curves under Construction Surveying and Layout; "Water Supply" and "Soil Properties" are two topics | D4 stays open for past-board frequency and archetype IDs |
| D5 | 2026-11-15 | Template schema v1 approved as implemented; the four templates are the pattern | §5, five points |
| D6 | 2026-11-15 | Design system v0.1 approved, Night palette included | Fonts: Barlow family, to self-host; site URL still wanted |
| D9 | 2026-11-15 | No analytics until v1.0.0, then one cookieless counter (GoatCounter); notice wording approved | Contact email needed before publishing |
| D4 | 2026-11-15 | Past-board frequency counted from the legacy bank into `content/frequency.json`; ranked per subject by average share of a sitting | 7 sittings per subject, not 12; MSTE algebra / geometry / trig items (54) and 8 others kept "unmapped" pending Gemz |
| D4 | 2026-11-15 | The MSTE algebra / geometry / trigonometry items (54) and the 8 others stay unmapped; no pre-calculus topic is added | Gemz; the taxonomy keeps to the PRC topic list |
| — | 2026-11-15 | Practice mode holds a situation's solution until its last item is checked | As built |
| — | 2026-11-15 | Study advice: a topic is judged after 3 items; under 50% review, under 75% keep practising. Reset KPIs keeps the mistakes list | As built in v0.0.10 |

---

## 9. Status Board
- **Phase:** 0 — Foundation & Decisions: D5, D6, D9 closed 2026-11-15. D4 now has its past-board frequency table (v0.0.13); only archetype IDs per subtopic are left, and they need the private sittings. Phase 1 groundwork continues · **App:** v0.0.14 on branch `claude/topic-frequency-status-board-f8bmsq` (PR #8 still open on GitHub, now holds v0.0.13 and v0.0.14); `main` is at v0.0.12 (PR #7, merged 2026-11-15 as `a5f3814`)
- **Done:** roadmap R1.18; D1, D2, D3, D5, D6, D7, D8, D9, D10 decided. On `main` (v0.0.12): scaffold, harness, CI, Pages; design system and tokens; template engine, Live Figure, exhaustive Stage 3; D9 paper and privacy notice; four templates, all `verified` — `PSAD-BEAM-SS-001`, `PSAD-BEAM-SS-002`, `MSTE-SURV-CURVE-001`, `HGE-HYDRO-GATE-001`; exam engine, Practice and Exam modes, mistake bank, avoid-repeat; (v0.0.9) `content/taxonomy.json` — 3 subjects, 39 PRC topics, 165 approved subtopics, templates tagged; (v0.0.10) Progress card — KPI dashboard, study recommendations, Reset KPIs, backup; (v0.0.11) app shell — tabs, Auto/Day/Night switch, About, manifest and icon; (v0.0.12) self-hosted Barlow fonts. On the branch: (v0.0.13) `content/frequency.json` — 1,098 legacy items counted into the 39 topics across 7 sittings, ranked per subject, checked by Stage 3. Top of each ranking: PSAD Theory of Structures, Steel, Strength of Materials; MSTE Construction Management, Physics, Calculus; HGE Hydrostatics, Fluid Flow, Soil Strength and Tests. (v0.0.14) ten new `draft` templates with their own solvers and checks — PSAD: `PSAD-TOS-PROPPED-001`, `PSAD-STEEL-COL-001`, `PSAD-SOM-TORSION-001`, `PSAD-RC-BEAM-001`; MSTE: `MSTE-ECON-LOAN-001`, `MSTE-PHYS-PROJ-001`, `MSTE-CALC-BOX-001`; HGE: `HGE-FLOW-PIPE-001`, `HGE-SOIL-TRIAX-001`, `HGE-SOIL-PHASE-001`; `board_frequency` filled on all 14 templates and checked by Stage 3
- **Phase 1 checklist (§4) so far:** Practice mode ✔ and Exam mode ✔ (quick drill and full set) · pause and cancel ✔ · board pacing ✔ · local progress ✔ · mistake bank with "practice my mistakes" ✔ · avoid-repeat ✔ · results with per-topic breakdown ✔ · KPI dashboard with study recommendations and Reset KPIs ✔ · export/import backup ✔ · app bar and tabs ✔ · Auto/Day/Night theme ✔ · disclaimer and About ✔ · installable (manifest and icon; no offline mode) ✔. Not yet: Random Mock Set, Exam Generator topic filter, Board-Trend Sets, offline service worker, clock/greeting, TERMS (listed, disabled), lectures stub, donation buttons
- **Waiting on Gemz:**
  - Review and merge PR #8 (v0.0.13 frequency table and v0.0.14 bank growth). It was reported merged on 2026-11-15 but GitHub still showed it open, so the new work went onto the same branch
  - Review the ten `draft` templates (list under Done) and say which may move to `verified`. Points worth a look: the steel column uses NSCP 2015 Section 505.3 with LRFD (φ = 0.90); the RC beam is kept tension-controlled (ε<sub>t</sub> ≥ 0.006) so φ is always 0.90; none of the ten has a figure
  - Tags: **v0.0.1** on `4a00702`; **v0.0.3** on `f497357`; **v0.0.5** on `6f7e0d2`; **v0.0.6** on `b6c4ff5`; **v0.0.7** on `79b5486`; **v0.0.8** on `d0c0ad0`; **v0.0.12** on `a5f3814` (v0.0.9 to v0.0.11 have no merge commit of their own); **v0.0.13** on the next merge commit (GitHub → Releases → Draft a new release). Cloud sessions cannot push tags
  - One call on the frequency table: the borderline placements listed in the `notes` of `content/frequency.json` (for example dam stability under Engineering Mechanics) — say if any should move
  - D4 close-out: the roadmap says 12 sittings, the legacy bank holds 7 per subject. If more sittings exist, supply them (private folder, or one Google Drive folder named to Claude) so they can be counted; the archetype IDs per subtopic need the sittings too
  - Received 2026-11-15, no longer waiting: Darkwiz Lab site `https://darkwizlab.com/`; privacy-notice contact `admin@darkwizlab.com`; Ko-fi `https://ko-fi.com/darkwizlab`; GCash/Maya QR image (re-attach it, or say so, when the donation buttons are built; it is not in the repo yet)
- **Next (in order):**
  1. D4 close-out — archetype IDs per subtopic in `content/taxonomy.json`. **Blocked in cloud sessions:** `../ramboo-private/` does not exist there; run it in a local Claude Code session on Gemz's PC, or put the sittings in one Google Drive folder and name it to Claude. Phase 0 exits when this closes
  2. Grow the bank: new templates across the approved taxonomy, on the approved schema and pattern, ordered by `content/frequency.json`. **Bank now: PSAD 6 of 25 situations, MSTE 4 of 75 items, HGE 4 of 17 situations** (D7 targets for one full mock). Topics with a template: PSAD Theory of Structures (3), Steel, Strength of Materials, RC; MSTE Surveying, Economics, Physics, Calculus; HGE Hydrostatics, Fluid Flow, Soil Strength, Soil Properties. Next in rank without one: PSAD Engineering Mechanics, Footings, Prestressed; MSTE Construction Management, Safety, Materials, Data Analysis, Transportation; HGE Stresses in Soil, Buoyancy, Consolidation. Also due: figures for the new situations (truss, column and Mohr-circle generators), and second archetypes in the top topics
  3. Exam Generator topic filter (uses `topic_id`), then Random Mock Set once the bank can fill one; Board-Trend Sets (ranked by the frequency table) are no longer blocked
  4. Smaller shell items, now unblocked: donation buttons (Ko-fi link and QR received), contact email into `docs/privacy-notice.md`, font and colour check against `darkwizlab.com`; still open: offline service worker, clock/greeting, lectures stub
- **Blockers:** the archetype-ID half of the D4 close-out needs the private sources (above). With 6 PSAD, 4 MSTE and 4 HGE templates, a full set still repeats problem types with new values (the setup screen says so)
- **Known limits:** on phones the Live Figure labels are enlarged but still small (about 11 px); a compact phone layout for figures is Phase 2 work. A mistakes set repeats the whole situation a missed item belongs to, not the single item. Installed as an app it still needs a connection. Switching tabs during a running set leaves the timer running. The live site could not be checked from the cloud session (the network policy blocks `github.io`)
- **Not built yet:** harness Stage 4 (originality) — needs `../ramboo-private/`, local only
- **Carry-over from legacy 4.9.1 (private archive, low priority):** PSAD Mar 2026 solutions PDF still pending; ~8 flagged items; 40 held-out MSTE items

---

## 10. Changelog
- **R1.18 — 2026-11-15:** App v0.0.14 on the same branch: the bank grows from 4 to 14 templates (4 PSAD situations, 3 MSTE items, 3 HGE situations), chosen from the top of the frequency table, each with a pure solver, an independent Stage 3 check and a hand-solved reference; all `draft`. `board_frequency` is filled on every template from `content/frequency.json` and enforced by Stage 3. PR #8 was found still open, so it now carries v0.0.13 and v0.0.14. Status Board gains the bank count against the D7 targets and the next topics in rank.
- **R1.17 — 2026-11-15:** PR #7 merged (`a5f3814`, app v0.0.12 on `main`); the stale "PR #7 open, main at v0.0.8" Status Board line fixed. App v0.0.13 on a new branch: D4 first half. `content/frequency.json` counts the private legacy bank (1,098 items, 7 sittings per subject) into the 39 taxonomy topics by sitting, ranks topics per subject, and lists 62 MSTE items with no matching topic as unmapped; counts only, no text, checked by a new Stage 3 test. Decision Log gains a D4 row. Gemz supplied the Darkwiz Lab URL, the privacy-notice contact email, the Ko-fi link and the QR image; recorded in D6, D8, D9 and the Status Board (their follow-up edits are the next small items). D4 stays open for archetype IDs. Later the same day Gemz decided the unmapped MSTE items stay unmapped (Decision Log).
- **R1.16 — 2026-11-15:** App v0.0.12 on the same branch: Barlow and Barlow Condensed self-hosted (D6 follow-up done; site-CSS comparison still waits for the URL); the four templates moved to `verified` on Gemz's say-so. Next is growing the bank.
- **R1.15 — 2026-11-15:** Gemz approved every pending decision: D5 (schema and template pattern), D6 (design system, Night palette), D9 (no analytics until v1.0.0, then GoatCounter; notice wording), the D4 subtopics and placements, Practice-mode solution timing, the study-advice thresholds and Reset KPIs behaviour. Decision Log updated. D4 stays open for past-board frequency. App v0.0.11 on the same branch: app shell (tabs, theme switch, About, manifest and icon). Status Board rewritten; growing the bank is now the main Phase 1 work.
- **R1.14 — 2026-11-15:** App v0.0.10 on the same branch (PR #7 still open): Progress card — KPI dashboard from the stored history, study recommendations, Reset KPIs, export/restore backup; sets now save per-topic results under the taxonomy topic id. Phase 1 checklist updated; app shell is next. Decisions D4, D5, D6, D9 unchanged.
- **R1.13 — 2026-11-15:** PR #6 merged (`d0c0ad0`, app v0.0.8 on `main`). App v0.0.9 on the branch: D4 first cut. `content/taxonomy.json` built from the PRC coverage PDF (3 subjects, weights 35/35/30, 39 topics in PRC order) with 165 draft subtopics; the four templates tagged with `topic_id` / `subtopic_id` and their `topic` label now the PRC topic name; Stage 3 checks the taxonomy and the tags. §5 gains point 5. D4 stays open: subtopic review, past-board frequency and archetype IDs outstanding. D5, D6, D9 unchanged.
- **R1.12 — 2026-11-15:** PR #5 merged (`79b5486`, app v0.0.7 on `main`). App v0.0.8 on the branch: mistake bank with clearing, "My mistakes" sets, avoid-repeat. Phase 1 checklist and next-steps list updated; KPI dashboard is next. Decisions D4, D5, D6, D9 unchanged.
- **R1.11 — 2026-11-15:** PR #4 merged (`b6c4ff5`, app v0.0.6 on `main`). App v0.0.7 on the branch: Exam mode on the same engine, discard-without-saving, solutions in the results, keyboard focus fix. Phase 1 checklist and next-steps list updated; Practice-mode solution timing listed for Gemz to confirm. Decisions D4, D5, D6, D9 unchanged.
- **R1.10 — 2026-11-15:** PR #3 merged (`6f7e0d2`, app v0.0.5 on `main`). App v0.0.6 on the branch: exam engine (set assembly, board-pace timer, grading, local history and mistake bank) and Practice mode; engine checks added to Stage 3 and a scripted practice run-through to Stage 2. Status Board gains a Phase 1 checklist and an ordered list of the remaining groundwork. Decisions D4, D5, D6, D9 unchanged.
- **R1.9 — 2026-11-15:** App v0.0.5: first HGE model and template (`HGE-HYDRO-GATE-001`), so PSAD, MSTE and HGE each have a verified draft template. `--water-fill` token and liquid/wall figure rules added to the design system. Next groundwork item is now the exam engine. Decisions D4, D5, D6, D9 unchanged.
- **R1.8 — 2026-11-14:** PR #2 merged (`f497357`). With every Phase 0 decision waiting on Gemz, work moved to Phase 1 groundwork at his go-ahead (app v0.0.4): second and third models and templates, bank registry, engine rules (exact rounding, no boundary answers, `valid`, labelled fallback), Stage 3 now exhaustive over each template's value grid. §5 gains point 4; §6 Stage 3 wording updated. Status Board rewritten.
- **R1.7 — 2026-11-14:** D9 drafted: `docs/privacy-and-analytics.md` (recommendation: no analytics before v1.0.0, then one cookieless aggregate counter; RA 10173 obligations by phase) and `docs/privacy-notice.md` (notice draft, unpublished). No app change. PR #2 still open. All four open Phase 0 decisions now wait on Gemz.
- **R1.6 — 2026-11-14:** D5 implemented (app v0.0.3): beam solver, template engine, first template, SVG figure, Live Figure proof of concept, sample problem; Stage 3 replaced with real model and template checks. §5 gains "Schema v1 as implemented" (three changes from the draft, for approval). §7 updated. PR #2 found still open; work continued on the same branch. D4 still blocked in cloud sessions.
- **R1.5 — 2026-11-14:** Item 1 merged to `main` (PR #1) with the hero PNG; scaffold line ticked (tag v0.0.1 still for Gemz — cloud sessions cannot push tags). D4 found blocked in cloud sessions (no `ramboo-private/`), so work moved to D6: `docs/design-system.md` draft v0.1 and `css/tokens.css` (Day sampled from the hero PNG, Night drafted), shell restyled; app v0.0.2. Status Board reordered with a "Waiting on Gemz" list.
- **R1.4 — 2026-11-14:** First Claude Code session (app v0.0.1). Scaffolded §7; added placeholder shell, `.gitignore`, `CHANGELOG.md`, `docs/content-policy.md`, harness stages 1–3 and CI workflow. Repo name corrected throughout to `ramboo-cele` (the name on GitHub; D1 spelling check closed). §7 updated with `package.json`, `.github/workflows/`, `.nojekyll`. Stage 3 fails closed until schema v1 (D5). Pages found already enabled on `main`. Open from item 1: merge, tag v0.0.1, hero PNG.
- **R1.3 — 2026-11-14:** Repo `rambo-cele` created. Repo `ROADMAP.md` becomes the source of truth (Project doc = mirror). Added public/private split (`ramboo-private/` sibling folder) and session rule 5. Live Figure hero screenshot received: reference values verified and visual spec recorded in §4A; D6 seeded from it.
- **R1.2 — 2026-11-14:** Renamed product WREN → **Ramboo CELE App**. D3 updated (Supabase account can be created now). D7 filled with legacy mock sizes and pacing (PSAD 75/6 h, MSTE 75/5 h, HGE 50/4 h) and legacy drill sizes (5 / 10 / mock). Added `CLAUDE.md` to repo plan. Legacy bank kept outside the public repo.
- **R1.1 — 2026-11-14:** Versioning restarted at v0.0.0 (v1.0.0 = public launch). Decisions D2, D3, D7, D8, D10 recorded. Added §4A Live Figures and `model`/`live` fields in the schema. Repo structure updated (models/, live/). Timeline set for the 1-month PH window.
- **R1.0 — 2026-11-14:** Initial roadmap. Phases 0–5, versioning scheme, Original Content Policy, template schema v1, harness stages 3–4 added.

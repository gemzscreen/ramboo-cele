# Ramboo CELE App — Revamp Roadmap

**Roadmap doc:** R1.4 · created 2026-11-14 · updated 2026-11-14 · owner: Gemz (Engr. Gemar C. Tubalado)
**Product:** Ramboo CELE App (Darkwiz Lab family) — public rebuild of the personal "CELE Training App"
**Repo:** `gemzscreen/ramboo-cele` on GitHub (created 2026-11-14)
**App version:** v0.0.1 (scaffold; tag pending — see §9) · legacy personal build = `legacy-4.9.1` (frozen, private)
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
- [ ] D4 Topic taxonomy: build from `CELE Coverage 2026 1.pdf` + frequency table from the 12 past-board sittings → `content/taxonomy.json` (subject → topic → subtopic → archetype IDs). Source PDFs read from the private folder (§7), never committed
- [ ] D5 Template schema v1 (draft in §5) — approve. Must satisfy the Live Figures requirement (§4A)
- [ ] D6 Design system: Darkwiz Lab look → `docs/design-system.md`. Starting cues captured from the Live Figure hero (§4A "Visual spec"); confirm fonts/colors against the Darkwiz Lab site CSS
- [x] D7 Phase 1 content and structure: **mirror the legacy CELE Training App setup** (see Phase 1), rebuilt with original templates. Minimum: enough templates to fill one full board-paced mock per subject without repeating an archetype — PSAD 75 items (25 situations), MSTE 75 items, HGE 50 items (~17 situations)
- [x] D8 Donations: **GCash/Maya QR + Ko-fi**
- [ ] D9 Analytics & privacy: privacy-respecting analytics choice; privacy notice draft (RA 10173 Data Privacy Act)
- [x] D10 Timeline: Gemz is in the Philippines and available for about 1 month from 2026-11-14 (before the Brunei move). Target: finish Phase 0 in week 1, Phase 1 in weeks 2–4 (stretch goal: v1.0.0 before departure)
- [ ] Repo scaffold (§7), `CLAUDE.md`, `ROADMAP.md`, `CHANGELOG.md`, `.gitignore`, harness stages 1–3 wired, GitHub Pages on → tag **v0.0.1** — scaffold, docs and harness done 2026-11-14; still open: merge to `main`, turn Pages on, tag, add the hero PNG (see §9)

**Exit criteria:** D4, D5, D6, D9 closed; repo live on GitHub Pages showing a placeholder shell.

### PHASE 1 — Free Core (v0.1.0 → v1.0.0)
Mirrors the legacy CELE Training App structure, rebuilt clean:
- New UI per design system; PWA installable; Auto/Day/Night theme; frozen app bar, clock/greeting
- Subject tabs: **PSAD / MSTE / HGE / TERMS**
- Drill sizes like legacy: **5 items** (quick drill), **10 items** (full set), **Random Mock Set** (full board length). PSAD/HGE drills draw whole situations (1 or 3 situations); MSTE draws individual items
- Board pacing from legacy, timer locked on start: PSAD 75 items / 6 h (4.8 min/item) · MSTE 75 items / 5 h (4.0 min/item) · HGE 50 items / 4 h (4.8 min/item); pause/cancel with in-app modals
- Modes: *Practice* (solution after each answer) · *Exam* (solutions at the end; mock sets are exam-only)
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

---

## 6. Quality harness (carried from legacy, extended)
1. **Stage 1 — Syntax:** `node --check` on every script/module
2. **Stage 2 — DOM:** jsdom run of the full app; counts, IDs unique, references resolve, no console errors
3. **Stage 3 — Models and templates:** per template, run ≥500 random instances → answers finite and physically valid, all choices distinct, correct choice present, constraints respected, **reference instance matches hand-solved values**; Live Figure models checked against closed-form formulas
4. **Stage 4 — Originality check:** scan stems against the private legacy bank for long verbatim overlaps (fail if any ≥8-word run matches). Runs locally only (needs the private folder); skipped in CI
5. Accuracy principles stay: flag, don't silently fix; numeric re-derivation before any key change.

Harness runs locally in Claude Code and (stages 1–3) in GitHub Actions on every push.

---

## 7. Repo structure (approved direction, finalize at scaffold)
```
ramboo-cele/                     (PUBLIC — GitHub Pages)
  index.html            app shell
  css/                  design system
  js/  engine/          generator, timer, scoring, storage
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
  docs/                 design-system.md, content-policy.md, reference/live-figure-hero.png
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

---

## 9. Status Board
- **Phase:** 0 — Foundation & Decisions · **App:** v0.0.1 (tag pending)
- **Done:** roadmap R1.4; reference site studied; D1, D2, D3, D7, D8, D10 decided; repo `ramboo-cele` created (spelling confirmed); Live Figure hero reference specified (§4A); §7 scaffold, placeholder shell, `.gitignore`, `CHANGELOG.md`, `docs/content-policy.md`, harness stages 1–3 (`npm test`) and the GitHub Actions workflow — all on branch `claude/trusting-noether-l070u1`
- **Next (in order):**
  1. Finish item 1 (needs Gemz, on GitHub): (a) merge branch `claude/trusting-noether-l070u1` into `main`; (b) Settings → Pages → Deploy from a branch → `main` / root, then check `https://gemzscreen.github.io/ramboo-cele/`; (c) tag the merge commit **v0.0.1**; (d) add `docs/reference/live-figure-hero.png` (the screenshot never reached the repo)
  2. Build `content/taxonomy.json` from `CELE Coverage 2026 1.pdf` + past-board frequency (D4), reading PDFs from `ramboo-private/` — must be done in a local Claude Code session on Gemz's PC; cloud sessions cannot see `ramboo-private/`
  3. `docs/design-system.md` (D6), starting from §4A visual spec + Darkwiz Lab site CSS
  4. Approve template schema v1 (D5); build the first model: simply supported beam with point load, as the template engine and Live Figure proof of concept (reference values in §4A). Replace the fail-closed `tests/stage3-models.js` with the real per-template checks in the same change
  5. D9 analytics/privacy choice
- **Blockers:** none for the code. Items 1(a)–(d) above wait on Gemz
- **Not built yet:** harness Stage 4 (originality) — needs `../ramboo-private/`, local only
- **Carry-over from legacy 4.9.1 (private archive, low priority):** PSAD Mar 2026 solutions PDF still pending; ~8 flagged items; 40 held-out MSTE items

---

## 10. Changelog
- **R1.4 — 2026-11-14:** First Claude Code session (app v0.0.1). Scaffolded §7; added placeholder shell, `.gitignore`, `CHANGELOG.md`, `docs/content-policy.md`, harness stages 1–3 and CI workflow. Repo name corrected throughout to `ramboo-cele` (the name on GitHub; D1 spelling check closed). §7 updated with `package.json`, `.github/workflows/`, `.nojekyll`. Stage 3 fails closed until schema v1 (D5). Open from item 1: merge, Pages on, tag v0.0.1, hero PNG.
- **R1.3 — 2026-11-14:** Repo `rambo-cele` created. Repo `ROADMAP.md` becomes the source of truth (Project doc = mirror). Added public/private split (`ramboo-private/` sibling folder) and session rule 5. Live Figure hero screenshot received: reference values verified and visual spec recorded in §4A; D6 seeded from it.
- **R1.2 — 2026-11-14:** Renamed product WREN → **Ramboo CELE App**. D3 updated (Supabase account can be created now). D7 filled with legacy mock sizes and pacing (PSAD 75/6 h, MSTE 75/5 h, HGE 50/4 h) and legacy drill sizes (5 / 10 / mock). Added `CLAUDE.md` to repo plan. Legacy bank kept outside the public repo.
- **R1.1 — 2026-11-14:** Versioning restarted at v0.0.0 (v1.0.0 = public launch). Decisions D2, D3, D7, D8, D10 recorded. Added §4A Live Figures and `model`/`live` fields in the schema. Repo structure updated (models/, live/). Timeline set for the 1-month PH window.
- **R1.0 — 2026-11-14:** Initial roadmap. Phases 0–5, versioning scheme, Original Content Policy, template schema v1, harness stages 3–4 added.

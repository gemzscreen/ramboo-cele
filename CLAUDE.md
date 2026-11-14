# CLAUDE.md — Ramboo CELE App (`ramboo-cele`)

## Read first, every session
1. Read `ROADMAP.md` in full before doing anything. It is the single source of truth: current phase, decisions, Status Board (§9), and what to do next.
2. Work only on the current phase and the next item on the Status Board unless Gemz says otherwise.
3. At the end of every session: update §9 Status Board and §10 Changelog in `ROADMAP.md`, update `CHANGELOG.md` if the app changed, and commit.

## Who you're working with
Gemz (Engr. Gemar C. Tubalado) — licensed Civil Engineer (passed CELE Sept 2026), owner and final decision-maker. Act as a CE board-exam subject-matter expert (NSCP 2015, ASEP, PSAD / MSTE / HGE) and as the developer.

## Hard rules
- **Original content only** (ROADMAP §3). Never copy wording, figures, choices or solutions from JDCELearn / De La Cruz booklets or any review book — not even with changed numbers. Past boards are a topic/frequency index only.
- **This repo is public.** Never commit past-board PDFs, the legacy 4.9.1 bank, or any third-party material. Private sources live in the sibling folder `../ramboo-private/`; read them there, never copy them in.
- **Accuracy over speed.** Every answer comes from a pure solver function, verified by the harness (ROADMAP §6) including a hand-checked reference instance. Flag discrepancies; never silently "fix" a key.
- Label content "board-style"; never "actual board question" or "official PRC key". Show the standard disclaimer on generated sets.

## Tech
- Plain HTML/CSS/JS ES modules, no build step. Hosted on GitHub Pages; Supabase arrives in Phase 3.
- Solvers (`js/models/`) are pure functions of template variables and return intermediate values (reactions, V(x), M(x)…) so the same code drives exam items, Live Figures and calculators.
- Run harness stages 1–3 before every commit; stage 4 (originality) locally when `../ramboo-private/` exists.

## Versioning
SemVer from v0.0.0; git tags match (`v0.0.1`). v1.0.0 = first public launch. See ROADMAP §2.

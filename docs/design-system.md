# Design system — Ramboo CELE App

**Status:** v0.1, approved by Gemz 2026-11-15 (ROADMAP D6), Night palette
included. Two follow-ups remain under [Open items](#open-items).

**Source:** `docs/reference/live-figure-hero.png` (the Darkwiz Lab Live Figure
hero) and the visual spec in ROADMAP §4A. Day colours below were sampled from
that screenshot. The Darkwiz Lab site CSS has not been checked yet.

**Implementation:** every value lives in `css/tokens.css` as a CSS custom
property. Components use the tokens; they never hard-code a colour, size or
font. If a value here and the token file disagree, the token file is wrong —
fix it to match this page.

## The idea

The app looks like an engineer's calculation sheet: off-white drawing paper
with a fine grid, dark ink, square corners, and a small set of colours that
each mean one thing. A figure and the screen around it are drawn with the same
pen. Nothing is decorative; if an element is coloured, the colour is telling
the user something.

## Colour

### Day (reference)

| Token | Value | Use |
|---|---|---|
| `--page` | `#e6e9e4` | Behind everything |
| `--paper` | `#f5f6f2` | Panels, cards, figure canvas, beam fill |
| `--grid-minor` | `#e9edee` | Fine grid on paper |
| `--grid-major` | `#d3dce7` | Every 5th grid line |
| `--line` | `#a9adad` | Borders, dividers, slider track |
| `--ink` | `#17202a` | Text, beam outline, supports, reaction arrows |
| `--ink-soft` | `#56606a` | Captions, dimensions, secondary text |
| `--shear` | `#1f4fa8` | Shear (V) |
| `--moment` | `#b8372a` | Moment (M) |
| `--load` | `#c98a12` | Applied loads and their drag handles |
| `--load-text` | `#8a5d06` | Amber at body-text size |
| `--ok` | `#1e7a4c` | Correct answer, success (not in the reference; added) |

Fills under diagrams and behind tinted UI are the same hues at low opacity:
`--shear-fill`, `--moment-fill`, `--load-fill`, `--ok-fill`.

### One meaning per colour

| Colour | In a figure | In the interface |
|---|---|---|
| Ink | Structure, supports, reactions | Text, default borders, neutral buttons |
| Blue (`--shear`) | Shear diagram and shear values | Links, focus ring, primary action, selected state, slider thumb |
| Red (`--moment`) | Moment diagram and moment values | Wrong answer, error, destructive action |
| Amber (`--load`) | Loads the user can move | Things the user can drag or adjust; timer warning |
| Green (`--ok`) | — | Correct answer, success |

Rules:

- Never signal with colour alone. A right or wrong answer also gets an icon and
  a word; a diagram is also labelled V or M.
- Amber `--load` reaches only 2.7:1 on paper. Use it for graphics and for
  large bold labels. For amber text at body size use `--load-text` (5.3:1).
- `--line` is for borders only, never text.

Contrast on `--paper` (WCAG 2.x): ink 15.2, ink-soft 5.9, shear 7.1,
moment 5.4, load-text 5.3, ok 4.9 — all pass AA for body text.

### Night

The reference shows Day only. Night keeps the same meanings on a dark sheet:
page `#0f1318`, paper `#161b22`, ink `#e8ebe6`, ink-soft `#9aa4ae`, shear
`#7fa6ee`, moment `#ee8377`, load `#e3a93a`, ok `#5fc48f`. Every text colour is
6.7:1 or better on night paper. Full list in `css/tokens.css`.

Theme switching: `Auto` follows the OS (`prefers-color-scheme`); `Day` and
`Night` set `data-theme="day"` or `data-theme="night"` on `<html>`.

## Type

| Role | Token | Size | Weight | Family |
|---|---|---|---|---|
| Screen title | `--text-2xl` | 36–56 px, fluid | 700 | display |
| Stat value | `--text-xl` | 28 px | 700 | display |
| Section title | `--text-lg` | 22 px | 600 | display |
| Body, problem stem, choices | `--text-md` | 17 px | 400 | ui |
| Secondary | `--text-sm` | 15 px | 400 | ui |
| Caption, tile label | `--text-xs` | 13 px | 400 | ui |

- `--font-ui`: Barlow, then the system sans.
- `--font-display`: Barlow Condensed — titles, stat values, subject tabs, and
  the V / M diagram letters.
- Numbers that change or line up (timers, scores, stat values, answer choices)
  use `font-variant-numeric: tabular-nums`.
- Body text never goes below 13 px; problem stems stay at 17 px on phones.
- Line length: `--measure` (40 rem) at most for reading text.

**Barlow is not loaded yet**, so the app currently falls back to the system
font. See Open items.

### Engineering notation

- Units are separated from the value by a space and never italic: `26.7 kN`,
  `53.3 kN·m` (middle dot, not a period or hyphen), `6.00 m`.
- Subscripts are real subscripts: R<sub>A</sub>, M<sub>max</sub>, f′<sub>c</sub>.
- Use the true minus sign `−` for negative values, not a hyphen.
- Show the number of decimals the answer key uses; do not let the layout
  truncate a value.

## Space and shape

- Spacing scale on a 4 px base: `--s1` 4, `--s2` 8, `--s3` 12, `--s4` 16,
  `--s5` 24, `--s6` 32, `--s7` 48.
- Corners: `--radius` 2 px for panels, tiles, buttons and inputs. Only pills
  (version badge, chips) and round handles use `--radius-pill`.
- Borders: 1 px `--line`. Panels sit on the page with `--shadow-panel`; nothing
  else gets a shadow.
- Tap targets: at least `--touch` (44 px) in both directions.
- Layout is mobile-first: one column up to 640 px; wider screens centre the
  content at `--measure` and may place a figure beside its solution.

## Surfaces

- **Page** (`--page`): the desk. Plain, no grid.
- **Paper** (`.paper`): the drawing sheet, with the minor grid every 16 px and a
  major line every 5th. Use it for figure canvases and hero panels only. Text
  blocks longer than a few lines sit on plain `--paper` without the grid, so
  the grid never competes with reading.
- **Panel** (`.panel`): border, 2 px corners, shadow. A panel may be divided
  into strips by 1 px `--line` rules (figure / controls / stats in the
  reference).

## Components

Specified now so Phase 1 builds them consistently. Only the shell exists so far.

- **Stat tile** — caption in `--text-xs` `--ink-soft` above a value in
  `--text-xl` display bold. Tiles sit in a row split by 1 px rules; the row
  wraps to 2 × 2 on phones. The value takes the colour of what it measures
  (shear blue, moment red), otherwise ink.
- **Slider** — 6 px `--line` track, round thumb with a 3 px `--shear` ring and
  `--paper` centre, label on the left in `--ink-soft`, current value on the
  right in bold ink with its unit. Thumb hit area is 44 px.
- **Button** — primary: `--shear` fill, paper text. Secondary: 1 px `--ink`
  border on paper. Destructive: `--moment`. 44 px tall, 2 px corners, label in
  display 600.
- **Subject tab** (PSAD / MSTE / HGE / TERMS) — display 600, uppercase;
  selected tab has a 3 px `--shear` underline and ink text, others `--ink-soft`.
- **Answer choice** — full-width row, 1 px `--line` border, letter in display
  bold. Selected: `--shear` border and `--shear-fill`. After checking: correct
  gets `--ok` border, `--ok-fill` and a check mark; a wrong pick gets `--moment`
  border, `--moment-fill` and a cross.
- **Timer** — display bold, tabular numbers. Turns `--load-text` in the last
  10% of the time and `--moment` in the last 2%; the change is also announced
  in text.
- **Disclaimer** — `--text-xs` `--ink-soft`, always present on generated sets.

## Figures (applies to every SVG generator in `js/figures/`)

Figure generators read the same tokens through `currentColor` and CSS
variables, so a figure follows the theme without being redrawn.

- Line weight `--stroke` (2 px) for structure and diagrams; 1 px for
  dimensions, guides and hatching.
- Member: `--paper` fill, `--ink` outline. Pin: triangle on hatched ground.
  Roller: triangle on wheels on hatched ground. Support letters in display bold
  above the supports.
- Loads: `--load` arrow; if draggable, a ring handle at the tail. Label beside
  the arrow in `--load`, display 600 (large enough to pass contrast).
- Reactions: `--ink` arrows outside the supports, labelled with subscripts and
  values.
- Dimensions: 1 px `--ink-soft` line with slash ticks; segment lengths above
  the line, total below.
- Guides: 1 px dotted `--ink-soft` from a load down through the diagrams.
- Shear diagram: `--shear` outline, `--shear-fill`; end values labelled with
  sign. Moment diagram: `--moment` outline, `--moment-fill`; peak labelled;
  positive moment drawn upward.
- Liquids: `--water-fill` tint with an ink free-surface line and the ∇ surface mark. It is a material tint, not
  one of the meaning colours, and is never used for interface states.
- Walls and ground: `--grid-major` fill with an ink outline; ground lines are hatched.
- Every figure carries a text alternative stating the given values, so the
  problem is answerable without seeing the drawing.

## Motion

- Live Figures redraw directly with the input; no easing between values.
- Interface transitions are 150 ms or less and limited to opacity and colour.
- Respect `prefers-reduced-motion`: no transitions at all.

## Accessibility

- Text contrast at least 4.5:1; graphics and borders that carry meaning at
  least 3:1.
- Visible focus: 2 px `--shear` outline with 2 px offset on every interactive
  element.
- Everything works by keyboard, including sliders and draggable loads (arrow
  keys move by one step).
- Layout holds from 320 px wide and at 200% text zoom.

## Open items

1. **Fonts.** The screenshot looks like Barlow and Barlow Condensed, as §4A
   says. Confirm against the Darkwiz Lab site CSS. Once confirmed, self-host
   the `.woff2` files in the repo (Barlow is under the SIL Open Font License),
   because the harness forbids loading assets from other hosts.
2. **Darkwiz Lab site.** The site's URL is not recorded in the roadmap, so its
   CSS could not be compared. Any brand colours or logo rules it defines should
   be folded in here.
3. **Night palette.** Approved 2026-11-15.
4. **Logo / app icon.** First icon added in v0.0.11 (`icons/icon.svg`: beam,
   load and moment diagram on engineering paper). Replace if Darkwiz Lab has a
   logo rule.

// Shared drawing parts for beam figures (docs/design-system.md § Figures).
// Each function returns SVG markup; colours come from css/figures.css.
import { formatFixed } from '../engine/format.js';

// Also used by js/live/ to map pointer x to a position on the span.
export const GEOMETRY = { width: 640, x0: 90, x1: 550, beamTop: 96, beamHeight: 14 };
export const BEAM_BOTTOM = GEOMETRY.beamTop + GEOMETRY.beamHeight;

export const metres = (v) => formatFixed(v, 2);
export const spanX = (x, L) => GEOMETRY.x0 + (x / L) * (GEOMETRY.x1 - GEOMETRY.x0);

// "R" with subscript "A", followed by a thin space.
export const sub = (base, s) => `${base}<tspan dy="4" font-size="0.72em">${s}</tspan><tspan dy="-4"> </tspan>`;

function hatch(x, y) {
  let s = `<line class="fig-thin" x1="${x - 20}" y1="${y}" x2="${x + 20}" y2="${y}"/>`;
  for (let i = -16; i <= 16; i += 8) s += `<line class="fig-thin" x1="${x + i}" y1="${y}" x2="${x + i - 6}" y2="${y + 7}"/>`;
  return s;
}

// Member AB with a pin at A and a roller at B, each on hatched ground.
export function simplySupportedBeam() {
  const { x0, x1, beamTop, beamHeight } = GEOMETRY;
  const yb = BEAM_BOTTOM;
  let s = `<polygon class="fig-member" points="${x0},${yb} ${x0 - 13},${yb + 22} ${x0 + 13},${yb + 22}"/>`;
  s += hatch(x0, yb + 22);
  s += `<polygon class="fig-member" points="${x1},${yb} ${x1 - 13},${yb + 16} ${x1 + 13},${yb + 16}"/>`;
  for (const dx of [-8, 0, 8]) s += `<circle class="fig-member" cx="${x1 + dx}" cy="${yb + 19.5}" r="3"/>`;
  s += hatch(x1, yb + 23.5);
  s += `<rect class="fig-member" x="${x0 - 8}" y="${beamTop}" width="${x1 - x0 + 16}" height="${beamHeight}"/>`;
  s += `<text class="fig-letter" x="${x0 - 26}" y="${beamTop + 12}" text-anchor="middle">A</text>`;
  s += `<text class="fig-letter" x="${x1 + 26}" y="${beamTop + 12}" text-anchor="middle">B</text>`;
  return s;
}

// Downward concentrated load ending on the beam's top face.
export function pointLoad({ x, top, label, labelY = top - 6, handle = false }) {
  const { x1, beamTop } = GEOMETRY;
  const labelRight = x < x1 - 110;
  let s = `<g class="fig-load"${handle ? ' data-drag="load"' : ''}>`;
  s += `<line x1="${x}" y1="${top + (handle ? 9 : 0)}" x2="${x}" y2="${beamTop - 12}"/>`;
  s += `<polygon points="${x},${beamTop - 1} ${x - 7},${beamTop - 15} ${x + 7},${beamTop - 15}"/>`;
  if (handle) s += `<circle class="fig-handle" cx="${x}" cy="${top}" r="9"/>`;
  s += `<text x="${labelRight ? x + 16 : x - 16}" y="${labelY}" text-anchor="${labelRight ? 'start' : 'end'}">${label}</text>`;
  return `${s}</g>`;
}

// Uniform load over the whole span: a top line with evenly spaced arrows.
export function uniformLoad({ top, label, labelSide }) {
  const { x0, x1, beamTop } = GEOMETRY;
  let s = '<g class="fig-load fig-udl">';
  s += `<line x1="${x0}" y1="${top}" x2="${x1}" y2="${top}"/>`;
  const n = 12;
  for (let i = 0; i <= n; i++) {
    const x = x0 + (i * (x1 - x0)) / n;
    s += `<line x1="${x}" y1="${top}" x2="${x}" y2="${beamTop - 8}"/>`;
    s += `<polygon points="${x},${beamTop - 1} ${x - 4},${beamTop - 9} ${x + 4},${beamTop - 9}"/>`;
  }
  s += labelSide === 'left'
    ? `<text x="${x0}" y="${top - 8}" text-anchor="start">${label}</text>`
    : `<text x="${x1}" y="${top - 8}" text-anchor="end">${label}</text>`;
  return `${s}</g>`;
}

// Dimension line at height y with ticks at each x; `above` labels sit over
// the segments between ticks, `below` under the whole line.
export function dimensionLine({ y, xs, above, below }) {
  let s = `<line class="fig-dim" x1="${xs[0]}" y1="${y}" x2="${xs[xs.length - 1]}" y2="${y}"/>`;
  for (const x of xs) s += `<line class="fig-dim" x1="${x - 5}" y1="${y + 6}" x2="${x + 5}" y2="${y - 6}"/>`;
  above.forEach((text, i) => {
    s += `<text class="fig-dim-text" x="${(xs[i] + xs[i + 1]) / 2}" y="${y - 9}" text-anchor="middle">${text}</text>`;
  });
  if (below) s += `<text class="fig-dim-text" x="${(xs[0] + xs[xs.length - 1]) / 2}" y="${y + 20}" text-anchor="middle">${below}</text>`;
  return s;
}

export function svgFigure({ height, label, body }) {
  return `<svg class="fig" viewBox="0 0 ${GEOMETRY.width} ${Math.ceil(height)}" role="img" aria-label="${label}" xmlns="http://www.w3.org/2000/svg">${body}</svg>`;
}

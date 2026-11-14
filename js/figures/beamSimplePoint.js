// SVG for a simply supported beam with one point load. Drawn from the template
// variables per docs/design-system.md § Figures; colours come from CSS classes
// (css/figures.css), so the figure follows the theme.
//
//   figBeamSimplePoint(vars)                                  exam figure: givens only
//   figBeamSimplePoint(vars, { reactions: true, diagrams: true })   Live Figure
import { beamSimplePoint } from '../models/beamSimplePoint.js';
import { formatSig, formatFixed } from '../engine/format.js';

// Shared with the interaction layer (js/live/) to map pointer x to load position.
export const GEOMETRY = { width: 640, x0: 90, x1: 550, beamTop: 96, beamHeight: 14 };

const sub = (base, s) => `${base}<tspan dy="4" font-size="0.72em">${s}</tspan><tspan dy="-4"> </tspan>`;

export function figBeamSimplePoint(vars, opts = {}) {
  const { reactions = false, diagrams = false, handle = false, scale = {} } = opts;
  const r = beamSimplePoint(vars);
  const { L, P, a, b, RA, RB, Mmax } = r;
  const { width: W, x0, x1, beamTop, beamHeight } = GEOMETRY;
  const beamBottom = beamTop + beamHeight;
  const xp = x0 + (a / L) * (x1 - x0);
  const kN = (v) => formatSig(v, 3);
  const m = (v) => formatFixed(v, 2);
  const out = [];

  // Supports: pin at A, roller at B, each on hatched ground.
  const hatch = (x, y) => {
    let s = `<line class="fig-thin" x1="${x - 20}" y1="${y}" x2="${x + 20}" y2="${y}"/>`;
    for (let i = -16; i <= 16; i += 8) s += `<line class="fig-thin" x1="${x + i}" y1="${y}" x2="${x + i - 6}" y2="${y + 7}"/>`;
    return s;
  };
  out.push(`<polygon class="fig-member" points="${x0},${beamBottom} ${x0 - 13},${beamBottom + 22} ${x0 + 13},${beamBottom + 22}"/>`);
  out.push(hatch(x0, beamBottom + 22));
  out.push(`<polygon class="fig-member" points="${x1},${beamBottom} ${x1 - 13},${beamBottom + 16} ${x1 + 13},${beamBottom + 16}"/>`);
  for (const dx of [-8, 0, 8]) out.push(`<circle class="fig-member" cx="${x1 + dx}" cy="${beamBottom + 19.5}" r="3"/>`);
  out.push(hatch(x1, beamBottom + 23.5));

  // Member and support letters.
  out.push(`<rect class="fig-member" x="${x0 - 8}" y="${beamTop}" width="${x1 - x0 + 16}" height="${beamHeight}"/>`);
  out.push(`<text class="fig-letter" x="${x0 - 26}" y="${beamTop + 12}" text-anchor="middle">A</text>`);
  out.push(`<text class="fig-letter" x="${x1 + 26}" y="${beamTop + 12}" text-anchor="middle">B</text>`);

  // Load.
  const loadTop = 30;
  const labelRight = xp < x1 - 110;
  out.push(`<g class="fig-load"${handle ? ' data-drag="load"' : ''}>`);
  out.push(`<line x1="${xp}" y1="${loadTop + (handle ? 9 : 0)}" x2="${xp}" y2="${beamTop - 12}"/>`);
  out.push(`<polygon points="${xp},${beamTop - 1} ${xp - 7},${beamTop - 15} ${xp + 7},${beamTop - 15}"/>`);
  if (handle) out.push(`<circle class="fig-handle" cx="${xp}" cy="${loadTop}" r="9"/>`);
  out.push(`<text x="${labelRight ? xp + 16 : xp - 16}" y="${loadTop - 6}" text-anchor="${labelRight ? 'start' : 'end'}">P = ${P} kN</text>`);
  out.push('</g>');

  let y = beamBottom + 34;

  if (reactions) {
    for (const [x, name, value] of [[x0, 'A', RA], [x1, 'B', RB]]) {
      out.push(`<line class="fig-ink" x1="${x}" y1="${y + 34}" x2="${x}" y2="${y + 14}"/>`);
      out.push(`<polygon class="fig-ink-fill" points="${x},${y + 2} ${x - 6},${y + 15} ${x + 6},${y + 15}"/>`);
      out.push(`<text class="fig-text" x="${x}" y="${y + 52}" text-anchor="middle">${sub('R', name)}= ${kN(value)} kN</text>`);
    }
    y += 62;
  }

  // Dimension line: a and b above, L below.
  const yd = y + 22;
  out.push(`<line class="fig-dim" x1="${x0}" y1="${yd}" x2="${x1}" y2="${yd}"/>`);
  for (const x of [x0, xp, x1]) out.push(`<line class="fig-dim" x1="${x - 5}" y1="${yd + 6}" x2="${x + 5}" y2="${yd - 6}"/>`);
  out.push(`<text class="fig-dim-text" x="${(x0 + xp) / 2}" y="${yd - 9}" text-anchor="middle">a = ${m(a)} m</text>`);
  out.push(`<text class="fig-dim-text" x="${(xp + x1) / 2}" y="${yd - 9}" text-anchor="middle">b = ${m(b)} m</text>`);
  out.push(`<text class="fig-dim-text" x="${(x0 + x1) / 2}" y="${yd + 20}" text-anchor="middle">L = ${m(L)} m</text>`);
  y = yd + 30;

  if (diagrams) {
    // A fixed reference load keeps the scale steady while P changes.
    const Pref = scale.Pref ?? P;
    const sV = 40 / Pref;
    const sM = 60 / ((Pref * L) / 4);

    const yV = y + 52;
    out.push(`<text class="fig-letter fig-shear-text" x="40" y="${yV + 6}" text-anchor="middle">V</text>`);
    out.push(`<path class="fig-shear" d="M${x0},${yV} V${yV - RA * sV} H${xp} V${yV + RB * sV} H${x1} V${yV} Z"/>`);
    out.push(`<text class="fig-text fig-shear-text" x="${x0 + 6}" y="${yV - RA * sV - 7}">+${kN(RA)}</text>`);
    out.push(`<text class="fig-text fig-shear-text" x="${x1 - 6}" y="${yV + RB * sV + 17}" text-anchor="end">−${kN(RB)}</text>`);

    const yM = yV + 40 + 30 + 72;
    out.push(`<text class="fig-letter fig-moment-text" x="40" y="${yM}" text-anchor="middle">M</text>`);
    out.push(`<path class="fig-moment" d="M${x0},${yM} L${xp},${yM - Mmax * sM} L${x1},${yM} Z"/>`);
    out.push(`<text class="fig-text fig-moment-text" x="${xp}" y="${yM - Mmax * sM - 9}" text-anchor="middle">${kN(Mmax)} kN·m</text>`);

    out.push(`<line class="fig-guide" x1="${xp}" y1="${beamBottom}" x2="${xp}" y2="${yM + 8}"/>`);
    y = yM + 14;
  }

  const H = Math.ceil(y + 6);
  const label = `Simply supported beam AB, span ${m(L)} m, pin at A and roller at B, with a ${P} kN downward point load ${m(a)} m from A.`
    + (reactions ? ` Reactions ${kN(RA)} kN at A and ${kN(RB)} kN at B.` : '')
    + (diagrams ? ` Maximum moment ${kN(Mmax)} kN·m under the load.` : '');

  return `<svg class="fig" viewBox="0 0 ${W} ${H}" role="img" aria-label="${label}" xmlns="http://www.w3.org/2000/svg">${out.join('')}</svg>`;
}

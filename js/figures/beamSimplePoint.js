// SVG for a simply supported beam with one point load, drawn from the template
// variables.
//
//   figBeamSimplePoint(vars)                                        exam figure: givens only
//   figBeamSimplePoint(vars, { reactions: true, diagrams: true })   Live Figure
import { beamSimplePoint } from '../models/beamSimplePoint.js';
import { formatSig } from '../engine/format.js';
import {
  GEOMETRY, BEAM_BOTTOM, metres as m, spanX, sub,
  simplySupportedBeam, pointLoad, dimensionLine, svgFigure,
} from './beamParts.js';

export { GEOMETRY };

export function figBeamSimplePoint(vars, opts = {}) {
  const { reactions = false, diagrams = false, handle = false, scale = {} } = opts;
  const r = beamSimplePoint(vars);
  const { L, P, a, b, RA, RB, Mmax } = r;
  const { x0, x1 } = GEOMETRY;
  const xp = spanX(a, L);
  const kN = (v) => formatSig(v, 3);
  const out = [simplySupportedBeam(), pointLoad({ x: xp, top: 30, label: `P = ${P} kN`, handle })];

  let y = BEAM_BOTTOM + 34;

  if (reactions) {
    for (const [x, name, value] of [[x0, 'A', RA], [x1, 'B', RB]]) {
      out.push(`<line class="fig-ink" x1="${x}" y1="${y + 34}" x2="${x}" y2="${y + 14}"/>`);
      out.push(`<polygon class="fig-ink-fill" points="${x},${y + 2} ${x - 6},${y + 15} ${x + 6},${y + 15}"/>`);
      out.push(`<text class="fig-text" x="${x}" y="${y + 52}" text-anchor="middle">${sub('R', name)}= ${kN(value)} kN</text>`);
    }
    y += 62;
  }

  const yd = y + 22;
  out.push(dimensionLine({
    y: yd, xs: [x0, xp, x1],
    above: [`a = ${m(a)} m`, `b = ${m(b)} m`],
    below: `L = ${m(L)} m`,
  }));
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

    out.push(`<line class="fig-guide" x1="${xp}" y1="${BEAM_BOTTOM}" x2="${xp}" y2="${yM + 8}"/>`);
    y = yM + 14;
  }

  const label = `Simply supported beam AB, span ${m(L)} m, pin at A and roller at B, with a ${P} kN downward point load ${m(a)} m from A.`
    + (reactions ? ` Reactions ${kN(RA)} kN at A and ${kN(RB)} kN at B.` : '')
    + (diagrams ? ` Maximum moment ${kN(Mmax)} kN·m under the load.` : '');

  return svgFigure({ height: y + 6, label, body: out.join('') });
}

// SVG for a simply supported beam with a full-span uniform load and one point
// load. Exam figure: shows the givens only.
import {
  GEOMETRY, BEAM_BOTTOM, metres as m, spanX,
  simplySupportedBeam, pointLoad, uniformLoad, dimensionLine, svgFigure,
} from './beamParts.js';

export function figBeamSimpleUdlPoint({ L, w, P, a }) {
  const { x0, x1 } = GEOMETRY;
  const xp = spanX(a, L);
  const b = L - a;
  const body = [
    simplySupportedBeam(),
    // The w label sits at the end away from the point load.
    uniformLoad({ top: 66, label: `w = ${w} kN/m`, labelSide: xp < (x0 + x1) / 2 ? 'right' : 'left' }),
    pointLoad({ x: xp, top: 26, label: `P = ${P} kN`, labelY: 22 }),
    dimensionLine({
      y: BEAM_BOTTOM + 56, xs: [x0, xp, x1],
      above: [`${m(a)} m`, `${m(b)} m`],
      below: `L = ${m(L)} m`,
    }),
  ].join('');

  return svgFigure({
    height: BEAM_BOTTOM + 92,
    label: `Simply supported beam AB, span ${m(L)} m, pin at A and roller at B, carrying a uniform load of ${w} kN/m `
      + `over the whole span and a ${P} kN downward point load ${m(a)} m from A.`,
    body,
  });
}

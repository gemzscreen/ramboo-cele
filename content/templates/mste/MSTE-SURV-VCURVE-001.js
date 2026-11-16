// MSTE-SURV-VCURVE-001 — lowest point of a parabolic vertical (sag) curve.
// Standalone item, no figure. Original scenario and wording (ROADMAP §3).
import { verticalCurveLowPoint } from '../../../js/models/verticalCurveLowPoint.js';
import { formatSig } from '../../../js/engine/format.js';

const f = (x) => formatSig(x, 4);

export default {
  id: 'MSTE-SURV-VCURVE-001',
  subject: 'MSTE',
  topic: 'Construction Surveying and Layout',
  topic_id: 'mste.construction-surveying-and-layout',
  subtopic_id: 'mste.construction-surveying-and-layout.vertical-curves',
  archetype: 'Equal-tangent sag curve: elevation of the lowest point',
  format: 'single',
  board_frequency: '6/7 sittings', // the topic's count in content/frequency.json
  difficulty: 2,

  vars: {
    d1: { min: 2, max: 6, step: 1, unit: '%' },
    u2: { min: 1, max: 5, step: 1, unit: '%' },
    L: { min: 100, max: 240, step: 20, unit: 'm' },
    E: { min: 10, max: 40, step: 0.5, unit: 'm' },
  },
  constraints: [],

  stem: 'A road centreline descends at {d1}% and then climbs at {u2}%. The two grades are joined by a {L} m equal-tangent parabolic vertical curve '
    + 'whose point of curvature (PVC) is at elevation {E} m. Stations are measured horizontally from the PVC.',

  figure: null,
  model: (v) => verticalCurveLowPoint({ g1: -v.d1, g2: v.u2, L: v.L, E: v.E }),
  live: null,

  items: [
    {
      ask: 'Determine the elevation of the lowest point of the curve.',
      pick: 'y', unit: 'm', sig: 4,
      distractors: [
        { name: 'tookCurveMidpoint', value: (v, r) => r.mid },
        { name: 'usedTangentGradeOnly', value: (v, r) => r.tangentOnly },
        { name: 'gaveElevationAtEndOfCurve', value: (v, r) => r.pvt },
        { name: 'subtractedCurveCorrectionInsteadOfAdding', value: (v, r) => r.tangentOnly - (r.y - r.tangentOnly) },
        { name: 'measuredLowPointFromEndOfCurve', value: (v, r) => r.elevation(v.L - r.x) },
        { name: 'forgotHalfInParabolaTerm', value: (v, r) => r.tangentOnly + 2 * (r.y - r.tangentOnly) },
        { name: 'tookTangentGradeToMidCurve', value: (v) => v.E - (v.d1 / 100) * (v.L / 2) },
      ],
    },
  ],

  solution: (v, r) => [
    `Grades as decimals: g₁ = −${v.d1 / 100}, g₂ = +${v.u2 / 100}. The elevation at distance x from the PVC is y = ${v.E} + g₁x + (g₂ − g₁)x²/(2L).`,
    `Lowest point: slope = 0, so g₁ + (g₂ − g₁)x/L = 0 and x = −g₁L/(g₂ − g₁) = ${v.d1 / 100}(${v.L})/${(v.d1 + v.u2) / 100} = ${f(r.x)} m from the PVC.`,
    `y = ${v.E} − ${v.d1 / 100}(${f(r.x)}) + ${(v.d1 + v.u2) / 100}(${f(r.x)})²/(2 × ${v.L}) = ${f(r.y)} m.`,
  ],

  refs: ['Route surveying: parabolic vertical curve, y = y₀ + g₁x + (g₂ − g₁)x²/(2L); turning point at x = −g₁L/(g₂ − g₁)'],

  // Hand-solved: x = 0.04(140)/0.07 = 80 m; y = 22 − 3.2 + 0.07(6400)/280 = 22 − 3.2 + 1.6 = 20.40 m.
  reference_instance: {
    vars: { d1: 4, u2: 3, L: 140, E: 22 },
    answers: ['20.40'],
  },

  status: 'draft',
  bank_version: null,
};

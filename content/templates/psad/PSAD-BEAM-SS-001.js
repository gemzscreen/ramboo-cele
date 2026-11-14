// PSAD-BEAM-SS-001 — simply supported beam, one concentrated load.
// Original scenario and wording (ROADMAP §3). Archetype only: a simple span
// with a point load, asking for a reaction and bending moments.
import { beamSimplePoint } from '../../../js/models/beamSimplePoint.js';
import { figBeamSimplePoint } from '../../../js/figures/beamSimplePoint.js';
import { formatSig } from '../../../js/engine/format.js';

const f = (x) => formatSig(x, 3);

export default {
  id: 'PSAD-BEAM-SS-001',
  subject: 'PSAD',
  topic: 'Structural Analysis > Beams',
  archetype: 'Simply supported beam, single concentrated load',
  format: 'situation',
  board_frequency: null, // filled from the taxonomy (D4)
  difficulty: 1,

  vars: {
    L: { min: 4, max: 10, step: 0.5, unit: 'm' },
    a: { min: 1, max: 9, step: 0.5, unit: 'm' },
    P: { min: 10, max: 80, step: 5, unit: 'kN' },
  },
  constraints: [
    { rule: 'a <= L - 1', test: (v) => v.a <= v.L - 1 },
    // Off-centre load, so the midspan moment is not the maximum moment.
    { rule: 'a != L/2', test: (v) => v.a !== v.L / 2 },
  ],

  stem: 'A steel girder AB of a pedestrian walkway spans {L} m between a pin at A and a roller at B. '
    + 'During maintenance, a loaded service cart stops on the girder and delivers a single concentrated '
    + 'load of {P} kN at a point {a} m from A. Neglect the weight of the girder.',

  figure: figBeamSimplePoint,
  model: beamSimplePoint,
  live: { draggable: ['a'], sliders: ['a', 'P'] },

  items: [
    {
      ask: 'Determine the reaction at support A.',
      pick: 'RA', unit: 'kN', sig: 3,
      distractors: [
        { name: 'swappedSupports', value: (v, r) => r.RB },
        { name: 'splitLoadEqually', value: (v) => v.P / 2 },
        { name: 'tookFullLoad', value: (v) => v.P },
      ],
    },
    {
      ask: 'Determine the maximum bending moment in the girder.',
      pick: 'Mmax', unit: 'kN·m', sig: 3,
      distractors: [
        { name: 'usedMidspanLoadFormula', value: (v) => (v.P * v.L) / 4 },
        { name: 'loadTimesDistanceFromA', value: (v) => v.P * v.a },
        { name: 'loadTimesDistanceFromB', value: (v, r) => v.P * r.b },
        { name: 'reactionTimesWrongArm', value: (v, r) => r.RA * r.b },
      ],
    },
    {
      ask: 'Determine the bending moment at midspan.',
      pick: 'Mmid', unit: 'kN·m', sig: 3,
      distractors: [
        { name: 'reportedMaximumMoment', value: (v, r) => r.Mmax },
        { name: 'usedMidspanLoadFormula', value: (v) => (v.P * v.L) / 4 },
        { name: 'usedReactionOnLoadedSide', value: (v, r) => (Math.max(r.RA, r.RB) * v.L) / 2 },
        { name: 'usedUniformLoadFormula', value: (v) => (v.P * v.L) / 8 },
      ],
    },
  ],

  // Every line of working is written from the given values, never from a
  // rounded intermediate, so the arithmetic shown reproduces the keyed answer.
  solution: (v, r) => {
    const farSide = v.a < v.L / 2 ? 'B' : 'A';
    const nearArm = farSide === 'B' ? v.a : r.b; // R_B = P·a/L, R_A = P·b/L
    const farReaction = farSide === 'B' ? r.RB : r.RA;
    return [
      `Distance from the load to B: b = L \u2212 a = ${v.L} \u2212 ${v.a} = ${r.b} m.`,
      `Sum moments about B: R<sub>A</sub>\u00b7L = P\u00b7b, so R<sub>A</sub> = (${v.P})(${r.b})/${v.L} = ${f(r.RA)} kN. `
        + `Sum moments about A: R<sub>B</sub> = P\u00b7a/L = (${v.P})(${v.a})/${v.L} = ${f(r.RB)} kN. `
        + 'Check: the two reactions add up to P.',
      'Shear is +R<sub>A</sub> left of the load and \u2212R<sub>B</sub> right of it, so it changes sign under the load and the '
        + `moment peaks there: M<sub>max</sub> = R<sub>A</sub>\u00b7a = P\u00b7a\u00b7b/L = (${v.P})(${v.a})(${r.b})/${v.L} = ${f(r.Mmax)} kN\u00b7m.`,
      `Midspan lies between the load and support ${farSide}, where no other load acts. Cutting there and taking the `
        + `${farSide} side: M<sub>mid</sub> = R<sub>${farSide}</sub>\u00b7(L/2) = [(${v.P})(${nearArm})/${v.L}](${v.L / 2}) = ${f(r.Mmid)} kN\u00b7m `
        + `(R<sub>${farSide}</sub> = ${f(farReaction)} kN, carried unrounded).`,
    ];
  },

  refs: ['Statics: equilibrium of a rigid body (ΣM = 0, ΣF = 0)', 'Shear and moment relationship: dM/dx = V'],

  // Hand-solved (ROADMAP §4A): R_A = 40(4)/6 = 26.67; M_max = 40(2)(4)/6 = 53.33;
  // R_B = 40(2)/6 = 13.33, M_mid = 13.33(3) = 40.0.
  reference_instance: {
    vars: { L: 6, a: 2, P: 40 },
    answers: ['26.7', '53.3', '40.0'],
  },

  status: 'draft',
  bank_version: null,
};

// PSAD-TOS-FIXED-001 — fixed-ended beam, uniform load plus a midspan point load.
// Situation, no figure. Original scenario and wording (ROADMAP §3).
import { beamFixedUdlPoint } from '../../../js/models/beamFixedUdlPoint.js';
import { formatSig } from '../../../js/engine/format.js';

const f = (x) => formatSig(x, 3);
const g = (x) => formatSig(x, 5);

export default {
  id: 'PSAD-TOS-FIXED-001',
  subject: 'PSAD',
  topic: 'Theory of Structures',
  topic_id: 'psad.theory-of-structures',
  subtopic_id: 'psad.theory-of-structures.indeterminate-structures',
  archetype: 'Fixed-ended beam, uniform load plus midspan point load: reactions, fixed-end moment, midspan moment',
  format: 'situation',
  board_frequency: '7/7 sittings', // the topic's count in content/frequency.json
  difficulty: 2,

  vars: {
    L: { min: 4, max: 10, step: 1, unit: 'm' },
    w: { min: 8, max: 30, step: 2, unit: 'kN/m' },
    P: { min: 20, max: 80, step: 10, unit: 'kN' },
  },
  constraints: [],

  stem: 'A transfer girder in a parking building is built into deep concrete walls at both ends, which hold it fully '
    + 'fixed against rotation. The clear span is {L} m. The girder carries a uniformly distributed load of {w} kN/m over '
    + 'its whole length, self-weight included, and a column load of {P} kN at midspan. EI is constant.',

  figure: null,
  model: beamFixedUdlPoint,
  live: null,

  items: [
    {
      ask: 'Determine the vertical reaction at each wall.',
      pick: 'R', unit: 'kN', sig: 3,
      distractors: [
        { name: 'gaveTotalLoad', value: (v, r) => 2 * r.R },
        { name: 'ignoredThePointLoad', value: (v, r) => r.W / 2 },
        { name: 'gaveWholePointLoadToOneWall', value: (v, r) => r.W / 2 + v.P },
        { name: 'usedProppedCantileverCoefficients', value: (v, r) => (5 * r.W) / 8 + (11 * v.P) / 16 },
        { name: 'ignoredTheUniformLoad', value: (v) => v.P / 2 },
      ],
    },
    {
      ask: 'Determine the magnitude of the bending moment at each wall.',
      pick: 'Mend', unit: 'kN·m', sig: 3,
      distractors: [
        { name: 'treatedAsSimplySupported', value: (v, r) => r.MsimpleMid },
        { name: 'gaveMidspanMoment', value: (v, r) => r.Mmid },
        { name: 'ignoredThePointLoad', value: (v) => (v.w * v.L ** 2) / 12 },
        { name: 'usedSimpleSpanTermForPointLoad', value: (v) => (v.w * v.L ** 2) / 12 + (v.P * v.L) / 4 },
        { name: 'usedSimpleSpanTermForUniformLoad', value: (v) => (v.w * v.L ** 2) / 8 + (v.P * v.L) / 8 },
      ],
    },
    {
      ask: 'Determine the bending moment at midspan.',
      pick: 'Mmid', unit: 'kN·m', sig: 3,
      distractors: [
        { name: 'treatedAsSimplySupported', value: (v, r) => r.MsimpleMid },
        { name: 'gaveFixedEndMoment', value: (v, r) => r.Mend },
        { name: 'ignoredThePointLoad', value: (v) => (v.w * v.L ** 2) / 24 },
        { name: 'usedSimpleSpanTermForPointLoad', value: (v) => (v.w * v.L ** 2) / 24 + (v.P * v.L) / 4 },
        { name: 'subtractedHalfTheEndMoment', value: (v, r) => r.MsimpleMid - r.Mend / 2 },
      ],
    },
  ],

  solution: (v, r) => [
    `The beam and its loading are symmetric, so each wall carries half the load: R = (wL + P)/2 = [(${v.w})(${v.L}) + ${v.P}]/2 = ${f(r.R)} kN.`,
    `Fixed-end moments add by superposition. Uniform load: wL²/12 = (${v.w})(${v.L})²/12 = ${g((v.w * v.L ** 2) / 12)} kN·m. Midspan point load: PL/8 = (${v.P})(${v.L})/8 = ${g((v.P * v.L) / 8)} kN·m.`,
    `Moment at each wall: M = wL²/12 + PL/8 = ${f(r.Mend)} kN·m, tension on top.`,
    `Midspan moment: take the left half as a free body. M = R(L/2) − w(L/2)²/2 − M<sub>wall</sub> = (${g(r.R)})(${v.L / 2}) − (${v.w})(${v.L / 2})²/2 − ${g(r.Mend)} = ${f(r.Mmid)} kN·m (= wL²/24 + PL/8), tension at the bottom.`,
    `Check: the same loads on a simply supported span give wL²/8 + PL/4 = ${g(r.MsimpleMid)} kN·m at midspan; fixing the ends lifts the whole diagram by the end moment, ${g(r.MsimpleMid)} − ${g(r.Mend)} = ${f(r.Mmid)} kN·m.`,
  ],

  refs: ['Fixed-end moments: wL²/12 (uniform load), PL/8 (midspan point load)', 'Superposition; symmetry of structure and loading'],

  // Hand-solved: R = (96 + 40)/2 = 68; M_wall = 12(64)/12 + 40(8)/8 = 64 + 40 = 104;
  // M_mid = 68(4) - 12(16)/2 - 104 = 272 - 96 - 104 = 72.
  reference_instance: {
    vars: { L: 8, w: 12, P: 40 },
    answers: ['68.0', '104', '72.0'],
  },

  status: 'draft',
  bank_version: null,
};

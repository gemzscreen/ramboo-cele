// PSAD-TOS-PROPPED-001 — propped cantilever under a full-span uniform load.
// Situation, no figure. Original scenario and wording (ROADMAP §3).
import { beamProppedUdl } from '../../../js/models/beamProppedUdl.js';
import { formatSig } from '../../../js/engine/format.js';

const f = (x) => formatSig(x, 3);

export default {
  id: 'PSAD-TOS-PROPPED-001',
  subject: 'PSAD',
  topic: 'Theory of Structures',
  topic_id: 'psad.theory-of-structures',
  subtopic_id: 'psad.theory-of-structures.indeterminate-structures',
  archetype: 'Propped cantilever, uniform load: prop reaction, fixed-end moment, maximum sagging moment',
  format: 'situation',
  board_frequency: '7/7 sittings', // the topic's count in content/frequency.json
  difficulty: 2,

  vars: {
    L: { min: 4, max: 10, step: 0.5, unit: 'm' },
    w: { min: 10, max: 40, step: 2, unit: 'kN/m' },
  },
  constraints: [],

  stem: 'A canopy beam AB over a loading dock is cast monolithically into a thick shear wall at A, which holds it '
    + 'fully fixed. Its other end B, {L} m from the wall, sits on a steel post that acts as a roller. The beam carries a '
    + 'uniformly distributed load of {w} kN/m over its whole length, self-weight included. EI is constant and the post does not settle.',

  figure: null,
  model: beamProppedUdl,
  live: null,

  items: [
    {
      ask: 'Determine the reaction at the post B.',
      pick: 'RB', unit: 'kN', sig: 3,
      distractors: [
        { name: 'gaveWallReaction', value: (v, r) => r.RA },
        { name: 'treatedAsSimplySupported', value: (v, r) => r.W / 2 },
        { name: 'usedMomentCoefficient', value: (v, r) => r.W / 8 },
        { name: 'tookTotalLoad', value: (v, r) => r.W },
        { name: 'usedQuarterOfLoad', value: (v, r) => r.W / 4 },
      ],
    },
    {
      ask: 'Determine the magnitude of the bending moment at the wall A.',
      pick: 'MA', unit: 'kN·m', sig: 3,
      distractors: [
        { name: 'usedFixedBothEnds', value: (v) => (v.w * v.L ** 2) / 12 },
        { name: 'ignoredTheProp', value: (v) => (v.w * v.L ** 2) / 2 },
        { name: 'gaveSaggingMoment', value: (v, r) => r.Mpos },
        { name: 'usedFixedBothEndsMidspan', value: (v) => (v.w * v.L ** 2) / 24 },
        { name: 'tookMidspanMoment', value: (v) => (v.w * v.L ** 2) / 16 },
      ],
    },
    {
      ask: 'Determine the maximum positive (sagging) bending moment in the beam.',
      pick: 'Mpos', unit: 'kN·m', sig: 3,
      distractors: [
        { name: 'treatedAsSimplySupported', value: (v) => (v.w * v.L ** 2) / 8 },
        { name: 'tookMidspanMoment', value: (v) => (v.w * v.L ** 2) / 16 },
        { name: 'usedFixedBothEndsMidspan', value: (v) => (v.w * v.L ** 2) / 24 },
        { name: 'usedFixedBothEndsSupport', value: (v) => (v.w * v.L ** 2) / 12 },
      ],
    },
  ],

  solution: (v, r) => [
    `The beam has four reaction components (three at the wall, one at the post) and three equations of statics, so it is indeterminate to the first degree. Take the post reaction R<sub>B</sub> as the redundant.`,
    `Remove the post. The beam becomes a cantilever whose free end deflects wL⁴/(8EI) downward. R<sub>B</sub> alone pushes it up by R<sub>B</sub>L³/(3EI). The post does not settle, so the two cancel: R<sub>B</sub> = 3wL/8 = 3(${v.w})(${v.L})/8 = ${f(r.RB)} kN.`,
    `Vertical equilibrium: R<sub>A</sub> = wL − R<sub>B</sub> = ${r.W} − ${f(r.RB)} = ${f(r.RA)} kN.`,
    `Moments about A: M<sub>A</sub> = wL²/2 − R<sub>B</sub>L = (${v.w})(${v.L})²/2 − (${r.RB})(${v.L}) = ${f(r.MA)} kN·m (= wL²/8), tension on top.`,
    `Shear is zero where R<sub>B</sub> = w·x measured from B: x = ${r.RB}/${v.w} = ${f(r.xV0fromB)} m from the post (3L/8). `
      + `Taking the part to the right: M<sub>max</sub> = R<sub>B</sub>·x − w·x²/2 = (${r.RB})(${r.xV0fromB}) − (${v.w})(${r.xV0fromB})²/2 = ${f(r.Mpos)} kN·m (= 9wL²/128).`,
    `The fixed-end moment is the larger of the two, so the wall section governs. The moment changes sign at L/4 = ${f(r.xInflection)} m from the wall.`,
  ],

  refs: ['Method of consistent deformations (force method)', 'Cantilever deflections: wL⁴/(8EI) for a uniform load, PL³/(3EI) for an end load'],

  // Hand-solved: R_B = 3(24)(8)/8 = 72; M_A = 24(8^2)/2 - 72(8) = 768 - 576 = 192;
  // zero shear 72/24 = 3 m from B; M = 72(3) - 24(9)/2 = 108.
  reference_instance: {
    vars: { L: 8, w: 24 },
    answers: ['72.0', '192', '108'],
  },

  status: 'draft',
  bank_version: null,
};

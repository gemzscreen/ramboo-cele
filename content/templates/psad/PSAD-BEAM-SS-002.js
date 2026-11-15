// PSAD-BEAM-SS-002 — simply supported beam, full-span uniform load plus one
// concentrated load. Original scenario and wording (ROADMAP §3).
import { beamSimpleUdlPoint } from '../../../js/models/beamSimpleUdlPoint.js';
import { figBeamSimpleUdlPoint } from '../../../js/figures/beamSimpleUdlPoint.js';
import { formatSig } from '../../../js/engine/format.js';

const f = (x) => formatSig(x, 3);
const g = (x) => formatSig(x, 5); // intermediates to 5 figures, so the working shown reproduces the key

export default {
  id: 'PSAD-BEAM-SS-002',
  subject: 'PSAD',
  topic: 'Theory of Structures', // label of topic_id, kept in step by Stage 3
  topic_id: 'psad.theory-of-structures',
  subtopic_id: 'psad.theory-of-structures.determinate-beams',
  archetype: 'Simply supported beam, uniform load plus a concentrated load',
  format: 'situation',
  board_frequency: null, // filled from the taxonomy (D4)
  difficulty: 2,

  vars: {
    L: { min: 5, max: 10, step: 0.5, unit: 'm' },
    a: { min: 1, max: 9, step: 0.5, unit: 'm' },
    w: { min: 6, max: 20, step: 2, unit: 'kN/m' },
    P: { min: 20, max: 80, step: 5, unit: 'kN' },
  },
  constraints: [
    { rule: 'a <= L - 1', test: (v) => v.a <= v.L - 1 },
    // Off-centre load, so the reactions differ and the peak is not at midspan.
    { rule: 'a != L/2', test: (v) => v.a !== v.L / 2 },
  ],

  stem: 'A floor beam AB in a warehouse mezzanine is simply supported over a span of {L} m, with a pin at A and a '
    + 'roller at B. It carries a uniformly distributed load of {w} kN/m along its entire length, self-weight included. '
    + 'A stored pallet rack adds a concentrated load of {P} kN at {a} m from A.',

  figure: figBeamSimpleUdlPoint,
  model: beamSimpleUdlPoint,
  live: { draggable: ['a'], sliders: ['a', 'P', 'w'] },

  items: [
    {
      ask: 'Determine the reaction at support B.',
      pick: 'RB', unit: 'kN', sig: 3,
      distractors: [
        { name: 'swappedSupports', value: (v, r) => r.RA },
        { name: 'splitTotalLoadEqually', value: (v, r) => (r.W + v.P) / 2 },
        { name: 'ignoredPointLoad', value: (v, r) => r.W / 2 },
        { name: 'forgotToHalveUniformLoad', value: (v, r) => r.W + (v.P * v.a) / v.L },
        { name: 'ignoredUniformLoad', value: (v) => (v.P * v.a) / v.L },
        { name: 'tookTotalLoad', value: (v, r) => r.W + v.P },
      ],
    },
    {
      ask: 'Determine the distance from A to the point of zero shear.',
      pick: 'xV0', unit: 'm', sig: 3,
      valid: (value, v) => value < v.L, // a choice beyond the span would give itself away
      distractors: [
        { name: 'assumedMidspan', value: (v) => v.L / 2 },
        // Each of the next two is the right method for a different case, so
        // one of them always coincides with the answer and is skipped.
        { name: 'ignoredPointLoadInShear', value: (v, r) => r.RA / v.w },
        { name: 'subtractedPointLoadTooEarly', value: (v, r) => (r.RA - v.P) / v.w },
        { name: 'assumedUnderTheLoad', value: (v) => v.a },
        { name: 'measuredFromB', value: (v, r) => v.L - r.xV0 },
        { name: 'usedDistanceFromLoadToB', value: (v, r) => r.b },
        // Zero shear placed at the resultant of all the loads.
        { name: 'usedResultantLocation', value: (v, r) => (r.W * (v.L / 2) + v.P * v.a) / (r.W + v.P) },
        // Point load smeared into an equivalent uniform load.
        { name: 'spreadPointLoadOverSpan', value: (v, r) => r.RA / (v.w + v.P / v.L) },
      ],
    },
    {
      ask: 'Determine the maximum bending moment in the beam.',
      pick: 'Mmax', unit: 'kN·m', sig: 3,
      distractors: [
        { name: 'addedSeparateMaxima', value: (v, r) => (v.w * v.L ** 2) / 8 + (v.P * v.a * r.b) / v.L },
        { name: 'ignoredPointLoad', value: (v) => (v.w * v.L ** 2) / 8 },
        { name: 'ignoredUniformLoad', value: (v, r) => (v.P * v.a * r.b) / v.L },
        { name: 'usedMidspanFormulasForBoth', value: (v) => (v.w * v.L ** 2) / 8 + (v.P * v.L) / 4 },
        { name: 'tookMomentAtMidspan', value: (v, r) => r.Mmid },
        { name: 'tookMomentUnderLoad', value: (v, r) => r.Mload },
        { name: 'treatedAllLoadAsCentralPointLoad', value: (v, r) => ((r.W + v.P) * v.L) / 4 },
      ],
    },
  ],

  // Working is written from the given values, not rounded intermediates.
  solution: (v, r) => {
    const steps = [
      `Total uniform load: W = wL = (${v.w})(${v.L}) = ${r.W} kN, acting at midspan. Distance from the point load to B: b = ${v.L} − ${v.a} = ${r.b} m.`,
      `Sum moments about A: R<sub>B</sub>·L = W(L/2) + P·a, so R<sub>B</sub> = ${r.W}/2 + (${v.P})(${v.a})/${v.L} = ${f(r.RB)} kN. `
        + `Then R<sub>A</sub> = W + P − R<sub>B</sub> = ${f(r.RA)} kN.`,
      `Shear starts at +R<sub>A</sub> and falls by w for every metre. Just left of the load: V = R<sub>A</sub> − w·a = ${f(r.VleftOfLoad)} kN. `
        + `Just right of it: ${f(r.VleftOfLoad)} − ${v.P} = ${f(r.VrightOfLoad)} kN.`,
    ];
    if (r.zeroShearCase === 'beforeLoad') {
      steps.push(`Shear is already negative (or zero) on reaching the load, so it crossed zero before it: x = R<sub>A</sub>/w = ${f(r.xV0)} m from A.`);
      steps.push(`Maximum moment is at that point, using the left side: M<sub>max</sub> = R<sub>A</sub>·x − w·x²/2 = (${g(r.RA)})(${g(r.xV0)}) − (${v.w})(${g(r.xV0)})²/2 = ${f(r.Mmax)} kN·m.`);
    } else if (r.zeroShearCase === 'atLoad') {
      steps.push(`Shear is positive just left of the load and negative just right of it, so it passes through zero under the load: x = a = ${f(r.xV0)} m from A.`);
      steps.push(`Maximum moment is under the load, using the left side: M<sub>max</sub> = R<sub>A</sub>·a − w·a²/2 = (${g(r.RA)})(${v.a}) − (${v.w})(${v.a})²/2 = ${f(r.Mmax)} kN·m.`);
    } else {
      steps.push(`Shear is still positive just right of the load, so it reaches zero farther along: R<sub>A</sub> − P − w·x = 0 gives x = (R<sub>A</sub> − P)/w = ${f(r.xV0)} m from A.`);
      steps.push(`Maximum moment is at that point, using the left side: M<sub>max</sub> = R<sub>A</sub>·x − w·x²/2 − P(x − a) = (${g(r.RA)})(${g(r.xV0)}) − (${v.w})(${g(r.xV0)})²/2 − (${v.P})(${g(r.xV0 - v.a)}) = ${f(r.Mmax)} kN·m.`);
    }
    steps.push('Carry at least five figures of the reaction and distance through the last step; rounding them to three first can shift the answer.');
    return steps;
  },

  refs: ['Statics: equilibrium of a rigid body (ΣM = 0, ΣF = 0)', 'Shear and moment relationships: dV/dx = −w, dM/dx = V; maximum moment where V = 0'],

  // Hand-solved: R_B = 80/2 + 40(2)/8 = 50; R_A = 120 - 50 = 70. Shear right of the
  // load = 70 - 10(2) - 40 = 10 > 0, so x = (70 - 40)/10 = 3.00 m.
  // M_max = 70(3) - 10(3^2)/2 - 40(1) = 125; from B: 50(5) - 10(5^2)/2 = 125.
  reference_instance: {
    vars: { L: 8, a: 2, w: 10, P: 40 },
    answers: ['50.0', '3.00', '125'],
  },

  status: 'draft',
  bank_version: null,
};

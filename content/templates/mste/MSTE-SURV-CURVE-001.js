// MSTE-SURV-CURVE-001 — simple horizontal curve, external distance.
// Standalone item, no figure. Original scenario and wording (ROADMAP §3).
import { simpleCurve } from '../../../js/models/simpleCurve.js';
import { formatSig } from '../../../js/engine/format.js';

const f = (x, sig = 3) => formatSig(x, sig);
const rad = (deg) => (deg * Math.PI) / 180;

export default {
  id: 'MSTE-SURV-CURVE-001',
  subject: 'MSTE',
  topic: 'Construction Surveying and Layout', // label of topic_id, kept in step by Stage 3
  topic_id: 'mste.construction-surveying-and-layout',
  subtopic_id: 'mste.construction-surveying-and-layout.horizontal-curves',
  archetype: 'Simple curve: an element from radius and intersection angle',
  format: 'single',
  board_frequency: null, // filled from the taxonomy (D4)
  difficulty: 1,

  vars: {
    R: { min: 150, max: 600, step: 10, unit: 'm' },
    // From 30 degrees up, the external distance and the middle ordinate (the
    // classic mix-up) differ by at least 3.5%, so the two choices stay clearly apart.
    I: { min: 30, max: 80, step: 2, unit: 'deg' },
  },
  constraints: [],

  stem: 'Two straight sections of a provincial road meet at an intersection angle of {I}°. They are to be joined '
    + 'by a simple circular curve of radius {R} m. A drainage inlet is planned on the curve at its midpoint, and the '
    + 'crew needs to know how far that midpoint lies from the point where the two tangents intersect.',

  figure: null,
  model: simpleCurve,
  live: null,

  items: [
    {
      ask: 'Determine the external distance of the curve.',
      pick: 'E', unit: 'm', sig: 3,
      distractors: [
        { name: 'gaveMiddleOrdinate', value: (v, r) => r.M },
        { name: 'usedFullAngleInsteadOfHalf', value: (v) => v.R * (1 / Math.cos(rad(v.I)) - 1) },
        { name: 'gaveTangentDistance', value: (v, r) => r.T },
        { name: 'middleOrdinateWithFullAngle', value: (v) => v.R * (1 - Math.cos(rad(v.I))) },
        { name: 'multipliedTangentByHalfAngleTangent', value: (v, r) => r.T * Math.tan(rad(v.I / 2)) },
      ],
    },
  ],

  solution: (v, r) => [
    `The external distance runs from the point of intersection (PI) to the midpoint of the curve. In the right triangle `
      + `formed by the centre, the PC and the PI, the hypotenuse is R + E and the angle at the centre is I/2 = ${v.I / 2}°.`,
    `So cos(I/2) = R/(R + E), which gives E = R[sec(I/2) − 1].`,
    `E = ${v.R}[1/cos ${v.I / 2}° − 1] = ${v.R}(${f(1 / Math.cos(rad(v.I / 2)) - 1, 5)}) = ${f(r.E)} m.`,
    `Do not confuse it with the middle ordinate, M = R[1 − cos(I/2)] = ${f(r.M)} m, which is measured from the long chord, not from the PI.`,
  ],

  refs: ['Route surveying: elements of a simple curve (T, L, C, E, M)'],

  // Hand-solved: I/2 = 20 deg, cos 20 = 0.939693, E = 300(1/0.939693 - 1) = 300(0.064178) = 19.25.
  reference_instance: {
    vars: { R: 300, I: 40 },
    answers: ['19.3'],
  },

  status: 'draft',
  bank_version: null,
};

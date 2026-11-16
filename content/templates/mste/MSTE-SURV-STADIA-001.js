// MSTE-SURV-STADIA-001 — horizontal distance by stadia with an inclined sight.
// Standalone item, no figure. Original scenario and wording (ROADMAP §3).
import { stadiaDistance } from '../../../js/models/stadiaDistance.js';
import { formatSig } from '../../../js/engine/format.js';

const f = (x) => formatSig(x, 4);
const K = 100;
const C = 0.3;

export default {
  id: 'MSTE-SURV-STADIA-001',
  subject: 'MSTE',
  topic: 'Construction Surveying and Layout',
  topic_id: 'mste.construction-surveying-and-layout',
  subtopic_id: 'mste.construction-surveying-and-layout.stadia',
  archetype: 'Stadia: horizontal distance from rod intercept and vertical angle',
  format: 'single',
  board_frequency: '6/7 sittings', // the topic's count in content/frequency.json
  difficulty: 2,

  vars: {
    s: { min: 0.6, max: 2.4, step: 0.05, unit: 'm' },
    theta: { min: 10, max: 28, step: 1, unit: '°' },
  },
  constraints: [],

  stem: 'An instrument with stadia constant K = 100 and additive constant C = 0.30 m is set up over a point. The telescope is inclined {theta}° above the horizontal '
    + 'and a rod held vertically at the far point shows a stadia intercept of {s} m.',

  figure: null,
  model: (v) => stadiaDistance({ ...v, K, C }),
  live: null,

  items: [
    {
      ask: 'Determine the horizontal distance from the instrument to the rod.',
      pick: 'H', unit: 'm', sig: 4,
      distractors: [
        { name: 'gaveSlopeDistance', value: (v, r) => r.S },
        { name: 'ignoredTheInclination', value: (v) => K * v.s + C },
        { name: 'gaveVerticalDistance', value: (v, r) => r.V },
        { name: 'calculatorLeftInRadianMode', value: (v) => K * v.s * Math.cos(v.theta) ** 2 + C * Math.cos(v.theta) },
        { name: 'usedSineSquaredForCosineSquared', value: (v) => K * v.s * Math.sin((v.theta * Math.PI) / 180) ** 2 + C * Math.sin((v.theta * Math.PI) / 180) },
      ],
    },
  ],

  solution: (v, r) => [
    `Inclined stadia sight on a vertical rod: H = Ks cos²θ + C cosθ, with K = ${K}, C = ${C} m, s = ${v.s} m and θ = ${v.theta}°.`,
    `Slope distance: S = Ks cosθ + C = ${f(r.S)} m.`,
    `H = ${K}(${v.s})cos²${v.theta}° + ${C} cos ${v.theta}° = ${f(r.H)} m.`,
  ],

  refs: ['Surveying: stadia with inclined sights, H = Ks cos²θ + C cosθ'],

  // Hand-solved: cos 12° = 0.978148, cos² = 0.956773; H = 140(0.956773) + 0.30(0.978148) = 133.948 + 0.293 = 134.242 m.
  reference_instance: {
    vars: { s: 1.4, theta: 12 },
    answers: ['134.2'],
  },

  status: 'draft',
  bank_version: null,
};

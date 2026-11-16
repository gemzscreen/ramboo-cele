// MSTE-HWY-SUPER-001 — minimum radius of a horizontal curve from superelevation and side friction.
// Standalone item, no figure. Original scenario and wording (ROADMAP §3).
import { superelevation } from '../../../js/models/superelevation.js';
import { formatSig } from '../../../js/engine/format.js';

const f = (x) => formatSig(x, 3);

export default {
  id: 'MSTE-HWY-SUPER-001',
  subject: 'MSTE',
  topic: 'Highway Engineering',
  topic_id: 'mste.highway-engineering',
  subtopic_id: 'mste.highway-engineering.geometric-design',
  archetype: 'Minimum curve radius from design speed, superelevation and side friction',
  format: 'single',
  board_frequency: '7/7 sittings', // the topic's count in content/frequency.json
  difficulty: 1,

  vars: {
    V: { min: 60, max: 110, step: 10, unit: 'km/h' },
    e: { min: 0.04, max: 0.10, step: 0.01, unit: 'm/m' },
    f: { min: 0.08, max: 0.16, step: 0.01, unit: '' },
  },
  constraints: [],

  stem: 'A horizontal curve on a two-lane rural highway is to be designed for {V} km/h. The pavement is superelevated at {e} m/m and the '
    + 'design side-friction factor is {f}. Use e + f = V²/(127R), with V in km/h and R in metres.',

  figure: null,
  model: superelevation,
  live: null,

  items: [
    {
      ask: 'Determine the minimum radius of the curve.',
      pick: 'R', unit: 'm', sig: 3,
      distractors: [
        { name: 'ignoredSideFriction', value: (v) => (v.V * v.V) / (127 * v.e) },
        { name: 'ignoredSuperelevation', value: (v) => (v.V * v.V) / (127 * v.f) },
        { name: 'usedMilesPerHourConstant', value: (v) => (v.V * v.V) / (15 * (v.e + v.f)) },
        { name: 'usedGravityWithSpeedInKmh', value: (v) => (v.V * v.V) / (9.81 * (v.e + v.f)) },
        { name: 'multipliedEAndF', value: (v) => (v.V * v.V) / (127 * v.e * v.f) },
      ],
    },
  ],

  solution: (v, r) => [
    `Combined effect of banking and side friction: e + f = ${v.e} + ${v.f} = ${f(r.eAndF)}.`,
    `R = V²/[127(e + f)] = ${v.V}²/[127(${f(r.eAndF)})] = ${v.V * v.V}/${f(127 * r.eAndF)} = ${f(r.R)} m.`,
  ],

  refs: ['Highway geometric design: point-mass curve equation, e + f = V²/(127R)'],

  // Hand-solved: 80² = 6400; 127(0.20) = 25.4; R = 6400/25.4 = 251.97 m.
  reference_instance: {
    vars: { V: 80, e: 0.08, f: 0.12 },
    answers: ['252'],
  },

  status: 'draft',
  bank_version: null,
};

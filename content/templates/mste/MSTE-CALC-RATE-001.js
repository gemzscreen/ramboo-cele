// MSTE-CALC-RATE-001 — related rates: height of a conical stockpile.
// Standalone item, no figure. Original scenario and wording (ROADMAP §3).
import { conePileRate } from '../../../js/models/conePileRate.js';
import { formatSig } from '../../../js/engine/format.js';

const f = (x) => formatSig(x, 3);
const h = (x) => formatSig(x, 4);

export default {
  id: 'MSTE-CALC-RATE-001',
  subject: 'MSTE',
  topic: 'Calculus',
  topic_id: 'mste.calculus',
  subtopic_id: 'mste.calculus.differentiation-applications',
  archetype: 'Related rates: conical pile growing under a steady inflow',
  format: 'single',
  board_frequency: '7/7 sittings', // the topic's count in content/frequency.json
  difficulty: 2,

  vars: {
    q: { min: 4, max: 20, step: 2, unit: 'm³/min' },
    k: { min: 1.2, max: 2, step: 0.1, unit: '' },
    h: { min: 1.5, max: 5, step: 0.5, unit: 'm' },
  },
  constraints: [],

  stem: 'A conveyor drops crushed stone onto a stockpile at a steady {q} m³ per minute. The stone keeps the shape of a right circular cone '
    + 'whose base radius is always {k} times its height. Find the rate at the instant when the pile is {h} m high.',

  figure: null,
  model: conePileRate,
  live: null,

  items: [
    {
      ask: 'Determine how fast the height of the pile is increasing at the stated instant.',
      pick: 'rate', unit: 'm/min', sig: 3,
      distractors: [
        { name: 'keptOneThirdAfterDifferentiating', value: (v, r) => r.rate / 3 },
        { name: 'tookRadiusEqualToHeight', value: (v) => v.q / (Math.PI * v.h * v.h) },
        { name: 'dividedInflowByVolume', value: (v, r) => v.q / r.volume },
        { name: 'multipliedByThreeInsteadOfDividing', value: (v, r) => 3 * r.rate },
        { name: 'tookBaseDiameterForRadius', value: (v) => v.q / (Math.PI * (2 * v.k * v.h) ** 2) },
      ],
    },
  ],

  solution: (v, r) => [
    `Radius r = ${v.k}h, so the volume is V = (1/3)πr²h = (1/3)π(${v.k}h)²h = (π(${v.k})²/3)h³.`,
    `Differentiate with respect to time: dV/dt = π(${v.k})²h² dh/dt.`,
    `At h = ${v.h} m: dV/dt = ${v.q}, so dh/dt = ${v.q}/[π(${v.k})²(${v.h})²] = ${v.q}/${h(r.baseArea)} = ${f(r.rate)} m/min.`,
  ],

  refs: ['Calculus: related rates, chain rule applied to V = πk²h³/3'],

  // Hand-solved: dV/dt = π(2.25)(4) dh/dt = 28.274 dh/dt = 12, so dh/dt = 0.4244 m/min.
  reference_instance: {
    vars: { q: 12, k: 1.5, h: 2 },
    answers: ['0.424'],
  },

  status: 'draft',
  bank_version: null,
};

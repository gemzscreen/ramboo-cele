// MSTE-TRANS-WEBSTER-001 — Webster's optimum signal cycle.
// Standalone item, no figure. Original scenario and wording (ROADMAP §3).
import { websterCycle } from '../../../js/models/websterCycle.js';
import { formatSig } from '../../../js/engine/format.js';

const f = (x) => formatSig(x, 3);
const h = (x) => formatSig(x, 4);

export default {
  id: 'MSTE-TRANS-WEBSTER-001',
  subject: 'MSTE',
  topic: 'Transportation Engineering',
  topic_id: 'mste.transportation-engineering',
  subtopic_id: 'mste.transportation-engineering.intersections-signals',
  archetype: 'Webster optimum cycle length for a three-phase signal',
  format: 'single',
  board_frequency: '6/7 sittings', // the topic's count in content/frequency.json
  difficulty: 2,

  vars: {
    l: { min: 3, max: 5, step: 1, unit: 's' },
    q1: { min: 300, max: 600, step: 30, unit: 'veh/h' },
    q2: { min: 300, max: 600, step: 30, unit: 'veh/h' },
    q3: { min: 300, max: 600, step: 30, unit: 'veh/h' },
    s: { min: 1700, max: 1900, step: 100, unit: 'veh/h' },
  },
  constraints: [
    { rule: 'sum of critical flow ratios is between 0.45 and 0.85', test: (v) => {
      const Y = (v.q1 + v.q2 + v.q3) / v.s;
      return Y >= 0.45 && Y <= 0.85;
    } },
  ],

  stem: 'A junction is run by a three-phase fixed-time signal. Each phase loses {l} seconds per cycle to start-up and clearance. '
    + 'The critical lane volumes of the three phases are {q1}, {q2} and {q3} veh/h, and every critical lane has a saturation flow of {s} veh/h. '
    + 'Use Webster’s formula C₀ = (1.5L + 5)/(1 − Y), with L the total lost time per cycle in seconds and Y the sum of the critical flow ratios '
    + '(volume ÷ saturation flow).',

  figure: null,
  model: websterCycle,
  live: null,

  items: [
    {
      ask: 'Determine the optimum cycle length.',
      pick: 'C0', unit: 's', sig: 3,
      distractors: [
        { name: 'forgotTheFactorOnePointFive', value: (v, r) => (r.L + 5) / (1 - r.Y) },
        { name: 'forgotTheConstantFive', value: (v, r) => (1.5 * r.L) / (1 - r.Y) },
        { name: 'usedOnlyTheLargestFlowRatio', value: (v, r) => (1.5 * r.L + 5) / (1 - Math.max(...r.ratios)) },
        { name: 'usedLostTimeOfOnePhaseOnly', value: (v, r) => (1.5 * v.l + 5) / (1 - r.Y) },
        { name: 'addedYInsteadOfSubtracting', value: (v, r) => (1.5 * r.L + 5) / (1 + r.Y) },
      ],
    },
  ],

  solution: (v, r) => [
    `Total lost time per cycle: L = 3 × ${v.l} = ${r.L} s.`,
    `Critical flow ratios: ${v.q1}/${v.s} = ${h(r.ratios[0])}, ${v.q2}/${v.s} = ${h(r.ratios[1])}, ${v.q3}/${v.s} = ${h(r.ratios[2])}. Y = ${h(r.Y)}.`,
    `C₀ = (1.5L + 5)/(1 − Y) = (1.5(${r.L}) + 5)/(1 − ${h(r.Y)}) = ${f(1.5 * r.L + 5)}/${h(1 - r.Y)} = ${f(r.C0)} s.`,
  ],

  refs: ['Traffic signal design: Webster’s optimum cycle, C₀ = (1.5L + 5)/(1 − Y)'],

  // Hand-solved: L = 12 s; Y = 0.30 + 0.25 + 0.20 = 0.75; C0 = (18 + 5)/0.25 = 92 s.
  reference_instance: {
    vars: { l: 4, q1: 540, q2: 450, q3: 360, s: 1800 },
    answers: ['92.0'],
  },

  status: 'draft',
  bank_version: null,
};

// MSTE-TRANS-GREEN-001 — capacity from a linear speed-density relation.
// Standalone item, no figure. Original scenario and wording (ROADMAP §3).
import { greenshields } from '../../../js/models/greenshields.js';
import { formatSig } from '../../../js/engine/format.js';

const f = (x) => formatSig(x, 3);

export default {
  id: 'MSTE-TRANS-GREEN-001',
  subject: 'MSTE',
  topic: 'Transportation Engineering',
  topic_id: 'mste.transportation-engineering',
  subtopic_id: 'mste.transportation-engineering.traffic-flow',
  archetype: 'Greenshields model: capacity from free-flow speed and jam density',
  format: 'single',
  board_frequency: '6/7 sittings', // the topic's count in content/frequency.json
  difficulty: 1,

  vars: {
    uf: { min: 60, max: 110, step: 2, unit: 'km/h' },
    kj: { min: 100, max: 160, step: 2, unit: 'veh/km' },
  },
  constraints: [],

  stem: 'Speed and density counts on one lane of a provincial highway fit a straight line: vehicles travel at '
    + '{uf} km/h when the lane is nearly empty, and traffic comes to a standstill at {kj} vehicles per kilometre.',

  figure: null,
  model: greenshields,
  live: null,

  items: [
    {
      ask: 'Determine the capacity of the lane.',
      pick: 'qMax', unit: 'veh/h', sig: 3,
      distractors: [
        { name: 'halvedOnlyOneQuantity', value: (v) => (v.uf * v.kj) / 2 },
        { name: 'multipliedFreeFlowSpeedByJamDensity', value: (v) => v.uf * v.kj },
        { name: 'tookFlowAtQuarterOfJamDensity', value: (v) => (3 * v.uf * v.kj) / 16 },
        { name: 'dividedByEight', value: (v) => (v.uf * v.kj) / 8 },
        { name: 'tookFlowAtThirdOfJamDensity', value: (v) => (2 * v.uf * v.kj) / 9 },
      ],
    },
  ],

  solution: (v, r) => [
    `Linear speed–density relation (Greenshields): u = u<sub>f</sub>(1 − k/k<sub>j</sub>) = ${v.uf}(1 − k/${v.kj}).`,
    `Flow is speed times density: q = uk = ${v.uf}(k − k²/${v.kj}).`,
    `Capacity is the largest flow. Set dq/dk = 0: 1 − 2k/${v.kj} = 0, so k = k<sub>j</sub>/2 = ${f(r.kCap)} veh/km, where the speed is u<sub>f</sub>/2 = ${f(r.uCap)} km/h.`,
    `q<sub>max</sub> = (u<sub>f</sub>/2)(k<sub>j</sub>/2) = u<sub>f</sub>k<sub>j</sub>/4 = (${v.uf})(${v.kj})/4 = ${f(r.qMax)} veh/h.`,
  ],

  refs: ['Traffic flow theory: q = uk; Greenshields linear speed–density model, qmax = uf·kj/4'],

  // Hand-solved: k = 60 veh/km, u = 40 km/h, q = 2400 veh/h.
  reference_instance: {
    vars: { uf: 80, kj: 120 },
    answers: ['2400'],
  },

  status: 'draft',
  bank_version: null,
};

// MSTE-TRANS-PHF-001 — peak-hour factor from four 15-minute counts.
// Standalone item, no figure. Original scenario and wording (ROADMAP §3).
import { peakHourFactor } from '../../../js/models/peakHourFactor.js';
import { formatSig } from '../../../js/engine/format.js';

const f = (x) => formatSig(x, 3);

export default {
  id: 'MSTE-TRANS-PHF-001',
  subject: 'MSTE',
  topic: 'Transportation Engineering',
  topic_id: 'mste.transportation-engineering',
  subtopic_id: 'mste.transportation-engineering.capacity-los',
  archetype: 'Peak-hour factor from four consecutive 15-minute counts',
  format: 'single',
  board_frequency: '6/7 sittings', // the topic's count in content/frequency.json
  difficulty: 1,

  vars: {
    v1: { min: 150, max: 330, step: 10, unit: 'veh' },
    v2: { min: 150, max: 330, step: 10, unit: 'veh' },
    v3: { min: 150, max: 330, step: 10, unit: 'veh' },
    v4: { min: 150, max: 330, step: 10, unit: 'veh' },
  },
  constraints: [
    { rule: 'peak-hour factor between 0.75 and 0.95', test: (v) => {
      const c = [v.v1, v.v2, v.v3, v.v4];
      const phf = (c[0] + c[1] + c[2] + c[3]) / (4 * Math.max(...c));
      return phf >= 0.75 && phf <= 0.95;
    } },
    { rule: 'one interval is clearly the highest (no tie for the peak)', test: (v) => {
      const c = [v.v1, v.v2, v.v3, v.v4].sort((a, b) => b - a);
      return c[0] > c[1];
    } },
  ],

  stem: 'A traffic count on one approach lane of a city street recorded {v1}, {v2}, {v3} and {v4} vehicles in the four consecutive '
    + '15-minute intervals of the peak hour. The peak-hour factor is the hourly volume divided by four times the highest 15-minute volume.',

  figure: null,
  model: peakHourFactor,
  live: null,

  items: [
    {
      ask: 'Determine the peak-hour factor.',
      pick: 'phf', unit: '', sig: 3,
      valid: (value) => value <= 1,
      distractors: [
        { name: 'dividedHighestIntervalByHourlyVolume', value: (v, r) => r.max15 / r.total },
        { name: 'comparedTheTwoHighestIntervalsOnly', value: (v, r) => r.second / r.max15 },
        { name: 'smallestOverLargestInterval', value: (v, r) => r.min15 / r.max15 },
        { name: 'droppedTheLowestInterval', value: (v, r) => (r.total - r.min15) / (3 * r.max15) },
        { name: 'usedAverageOverSecondHighest', value: (v, r) => r.total / (4 * r.second) },
      ],
    },
  ],

  solution: (v, r) => [
    `Hourly volume: ${v.v1} + ${v.v2} + ${v.v3} + ${v.v4} = ${r.total} veh.`,
    `Highest 15-minute volume: ${r.max15} veh, which is a flow rate of 4 × ${r.max15} = ${r.peakRate} veh/h.`,
    `PHF = ${r.total}/(4 × ${r.max15}) = ${r.total}/${r.peakRate} = ${f(r.phf)}.`,
  ],

  refs: ['Traffic engineering: peak-hour factor, PHF = V/(4 × V₁₅)'],

  // Hand-solved: 210 + 250 + 300 + 240 = 1000; PHF = 1000/(4 × 300) = 0.8333.
  reference_instance: {
    vars: { v1: 210, v2: 250, v3: 300, v4: 240 },
    answers: ['0.833'],
  },

  status: 'draft',
  bank_version: null,
};

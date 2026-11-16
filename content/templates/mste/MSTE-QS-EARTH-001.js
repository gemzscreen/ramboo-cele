// MSTE-QS-EARTH-001 — earthwork volume by the average end area method.
// Standalone item, no figure. Original scenario and wording (ROADMAP §3).
import { endAreaVolume } from '../../../js/models/endAreaVolume.js';
import { formatSig } from '../../../js/engine/format.js';

const f = (x) => formatSig(x, 4);

export default {
  id: 'MSTE-QS-EARTH-001',
  subject: 'MSTE',
  topic: 'Quantity Surveying',
  topic_id: 'mste.quantity-surveying',
  subtopic_id: 'mste.quantity-surveying.earthwork',
  archetype: 'Earthwork volume by the average end area method, four sections',
  format: 'single',
  board_frequency: '5/7 sittings', // the topic's count in content/frequency.json
  difficulty: 1,

  vars: {
    d: { min: 10, max: 25, step: 5, unit: 'm' },
    A1: { min: 8, max: 30, step: 0.5, unit: 'm²' },
    A2: { min: 8, max: 30, step: 0.5, unit: 'm²' },
    A3: { min: 8, max: 30, step: 0.5, unit: 'm²' },
    A4: { min: 8, max: 30, step: 0.5, unit: 'm²' },
  },
  constraints: [
    { rule: 'the largest area is at least 1.3 times the smallest', test: (v) => Math.max(v.A1, v.A2, v.A3, v.A4) >= 1.3 * Math.min(v.A1, v.A2, v.A3, v.A4) },
  ],

  stem: 'A road cut is surveyed at four cross-sections {d} m apart along a straight centreline. The excavation areas at the first, second, '
    + 'third and fourth sections are {A1}, {A2}, {A3} and {A4} m². Compute volumes by the average end area method: '
    + 'between two adjacent sections the volume is the spacing times the mean of the two end areas.',

  figure: null,
  model: endAreaVolume,
  live: null,

  items: [
    {
      ask: 'Determine the volume of excavation between the first and fourth sections, in bank measure.',
      pick: 'volume', unit: 'm³', sig: 4,
      distractors: [
        { name: 'countedEndSectionsInFull', value: (v) => v.d * (v.A1 + v.A2 + v.A3 + v.A4) },
        { name: 'usedFourSpacings', value: (v, r) => 4 * v.d * r.meanArea },
        { name: 'forgotSpacing', value: (v) => (v.A1 + v.A4) / 2 + v.A2 + v.A3 },
        { name: 'averagedEndSectionsOnly', value: (v) => 3 * v.d * ((v.A1 + v.A4) / 2) },
        { name: 'halvedTheWholeSum', value: (v) => (v.d * (v.A1 + v.A2 + v.A3 + v.A4)) / 2 },
      ],
    },
  ],

  solution: (v, r) => [
    `Section 1 to 2: ${v.d}(${v.A1} + ${v.A2})/2 = ${f(r.seg[0])} m³.`,
    `Section 2 to 3: ${v.d}(${v.A2} + ${v.A3})/2 = ${f(r.seg[1])} m³.`,
    `Section 3 to 4: ${v.d}(${v.A3} + ${v.A4})/2 = ${f(r.seg[2])} m³.`,
    `Total volume = ${f(r.seg[0])} + ${f(r.seg[1])} + ${f(r.seg[2])} = ${f(r.volume)} m³. (Same as ${v.d}[(${v.A1} + ${v.A4})/2 + ${v.A2} + ${v.A3}]: the two end sections count once, half each.)`,
  ],

  refs: ['Quantity surveying: earthwork by average end area, V = L(A₁ + A₂)/2 between sections'],

  // Hand-solved: 20(12.5 + 18)/2 = 305; 20(18 + 22.5)/2 = 405; 20(22.5 + 15)/2 = 375; total 1085 m³.
  reference_instance: {
    vars: { d: 20, A1: 12.5, A2: 18, A3: 22.5, A4: 15 },
    answers: ['1085'],
  },

  status: 'draft',
  bank_version: null,
};

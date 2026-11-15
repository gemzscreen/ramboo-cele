// MSTE-ECON-SYD-001 — book value by sum-of-the-years'-digits depreciation.
// Standalone item, no figure. Original scenario and wording (ROADMAP §3).
import { depreciationSyd } from '../../../js/models/depreciationSyd.js';
import { formatSig } from '../../../js/engine/format.js';

const f = (x) => formatSig(x, 4);
const g = (x) => formatSig(x, 5);

export default {
  id: 'MSTE-ECON-SYD-001',
  subject: 'MSTE',
  topic: 'Economics',
  topic_id: 'mste.economics',
  subtopic_id: 'mste.economics.depreciation',
  archetype: 'Sum-of-the-years’-digits depreciation: book value after k years',
  format: 'single',
  board_frequency: '7/7 sittings', // the topic's count in content/frequency.json
  difficulty: 1,

  vars: {
    C: { min: 800, max: 3000, step: 100, unit: 'thousand pesos' },
    S: { min: 100, max: 400, step: 50, unit: 'thousand pesos' },
    n: { min: 5, max: 10, step: 1, unit: 'yr' },
    k: { min: 2, max: 5, step: 1, unit: 'yr' },
  },
  constraints: [
    { rule: 'k <= n - 2', test: (v) => v.k <= v.n - 2 },
    { rule: 'salvage at most 20% of first cost', test: (v) => v.S <= 0.2 * v.C },
  ],

  stem: 'A surveying firm buys a robotic total station for ₱{C} thousand. It expects to use the instrument for '
    + '{n} years and then sell it for ₱{S} thousand. The firm depreciates its equipment by the sum-of-the-years’-digits '
    + 'method and needs the book value of the instrument at the end of year {k}.',

  figure: null,
  model: depreciationSyd,
  live: null,

  items: [
    {
      ask: 'Determine that book value.',
      pick: 'bookValue', unit: 'thousand pesos', sig: 4,
      distractors: [
        { name: 'usedStraightLine', value: (v, r) => r.straightLineBookValue },
        { name: 'gaveTotalDepreciation', value: (v, r) => r.total },
        { name: 'ignoredSalvageValue', value: (v, r) => v.C * (1 - r.total / r.base) },
        { name: 'countedDigitsFromOneUpward', value: (v, r) => v.C - (((v.k * (v.k + 1)) / 2) / r.sum) * r.base },
        { name: 'subtractedOnlyTheLastYearsCharge', value: (v, r) => v.C - r.chargeInYearK },
      ],
    },
  ],

  solution: (v, r) => {
    const digits = Array.from({ length: v.k }, (_, j) => v.n - j);
    return [
      `Depreciable amount: C − S = ${v.C} − ${v.S} = ${r.base} thousand pesos.`,
      `Sum of the years’ digits: 1 + 2 + … + ${v.n} = ${v.n}(${v.n + 1})/2 = ${r.sum}.`,
      `The digits are used in reverse, largest first. Over the first ${v.k} years they are ${digits.join(', ')}, which add to ${digits.reduce((a, b) => a + b, 0)}.`,
      `Depreciation to date: (${digits.reduce((a, b) => a + b, 0)}/${r.sum})(${r.base}) = ${g(r.total)} thousand pesos.`,
      `Book value: ${v.C} − ${g(r.total)} = ${f(r.bookValue)} thousand pesos. (Straight-line depreciation would leave ${f(r.straightLineBookValue)}; the digits method writes the asset down faster in its early years.)`,
    ];
  },

  refs: ['Engineering economy: sum-of-the-years’-digits depreciation, d_j = (n − j + 1)/SYD × (C − S)'],

  // Hand-solved: base 1050; digits 6 + 5 + 4 = 15 of 21; depreciation = (15/21)(1050) = 750; book value = 450.
  reference_instance: {
    vars: { C: 1200, S: 150, n: 6, k: 3 },
    answers: ['450.0'],
  },

  status: 'draft',
  bank_version: null,
};

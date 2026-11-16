// MSTE-EDA-NORMAL-001 — normal distribution: share of concrete cylinders below a limit.
// Standalone item, no figure. Original scenario and wording (ROADMAP §3).
import { normalProbability, phi } from '../../../js/models/normalProbability.js';
import { formatSig } from '../../../js/engine/format.js';

const f = (x) => formatSig(x, 3);
const z3 = (x) => x.toFixed(3).replace('-', '−');
const z2 = (x) => x.toFixed(2).replace('-', '−');

export default {
  id: 'MSTE-EDA-NORMAL-001',
  subject: 'MSTE',
  topic: 'Engineering Data Analysis',
  topic_id: 'mste.engineering-data-analysis',
  subtopic_id: 'mste.engineering-data-analysis.distributions',
  archetype: 'Normal distribution: lower-tail probability from mean, standard deviation and a limit',
  format: 'single',
  board_frequency: '6/7 sittings', // the topic's count in content/frequency.json
  difficulty: 2,

  vars: {
    mu: { min: 28, max: 40, step: 1, unit: 'MPa' },
    sigma: { min: 2, max: 5, step: 0.5, unit: 'MPa' },
    x: { min: 18, max: 38, step: 0.5, unit: 'MPa' },
  },
  constraints: [
    { rule: 'the limit lies 0.5 to 2.5 standard deviations below the mean', test: (v) => {
      const z = (v.mu - v.x) / v.sigma;
      return z >= 0.5 && z <= 2.5;
    } },
    { rule: 'z is not a half-way case at the third decimal (so rounding to two places is unambiguous)', test: (v) => {
      const third = Math.round(Math.abs(v.x - v.mu) / v.sigma * 1000);
      return third % 10 !== 5;
    } },
  ],

  stem: 'The 28-day compressive strengths of cylinders cast at a batching plant follow a normal distribution with a mean of {mu} MPa and a standard '
    + 'deviation of {sigma} MPa. A cylinder is rejected when it tests below {x} MPa. Round z to two decimal places and read the standard normal '
    + 'table (area to the left of z).',

  figure: null,
  model: normalProbability,
  live: null,

  items: [
    {
      ask: 'What percentage of the cylinders is expected to be rejected?',
      pick: 'pctBelow', unit: '%', sig: 3,
      distractors: [
        { name: 'tookTheUpperTail', value: (v, r) => r.pctAbove },
        { name: 'doubledForTwoTails', value: (v, r) => 2 * r.pctBelow },
        { name: 'usedVarianceInPlaceOfStandardDeviation', value: (v) => 100 * phi(Math.round(((v.x - v.mu) / (v.sigma * v.sigma)) * 100) / 100) },
        { name: 'tookAreaFromMeanToZ', value: (v, r) => 50 - r.pctBelow },
        { name: 'divideByMeanInsteadOfSigma', value: (v) => 100 * phi(Math.round(((v.x - v.mu) / v.mu) * 100) / 100) },
      ],
    },
  ],

  solution: (v, r) => [
    `Standardise the limit: z = (x − μ)/σ = (${v.x} − ${v.mu})/${v.sigma} = ${z3(r.zExact)}, which rounds to ${z2(r.z)}.`,
    `Table area to the left of z = ${z2(r.z)}: P = ${formatSig(r.p, 4)}.`,
    `Expected rejection rate = ${f(r.pctBelow)}% of the cylinders.`,
  ],

  refs: ['Statistics: standard normal distribution, z = (x − μ)/σ'],

  // Hand-solved: z = (24 − 30)/4 = −1.50; table area to the left of −1.50 is 0.0668, so 6.68%.
  reference_instance: {
    vars: { mu: 30, sigma: 4, x: 24 },
    answers: ['6.68'],
  },

  status: 'draft',
  bank_version: null,
};

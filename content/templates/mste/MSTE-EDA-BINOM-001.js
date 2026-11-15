// MSTE-EDA-BINOM-001 — probability of exactly k occurrences in n trials.
// Standalone item, no figure. Original scenario and wording (ROADMAP §3).
import { binomialProb } from '../../../js/models/binomialProb.js';
import { formatSig } from '../../../js/engine/format.js';

const f = (x) => formatSig(x, 3);
const g = (x) => formatSig(x, 5);
const model = (v) => binomialProb({ n: v.n, k: v.k, p: v.p / 100 });

export default {
  id: 'MSTE-EDA-BINOM-001',
  subject: 'MSTE',
  topic: 'Engineering Data Analysis',
  topic_id: 'mste.engineering-data-analysis',
  subtopic_id: 'mste.engineering-data-analysis.distributions',
  archetype: 'Binomial distribution: probability of exactly k occurrences in n independent trials',
  format: 'single',
  board_frequency: '6/7 sittings', // the topic's count in content/frequency.json
  difficulty: 2,

  vars: {
    n: { min: 6, max: 20, step: 1, unit: 'cylinders' },
    k: { min: 1, max: 4, step: 1, unit: 'cylinders' },
    p: { min: 5, max: 30, step: 1, unit: '%' },
  },
  constraints: [
    { rule: 'answer between 0.02 and 0.45', test: (v) => { const x = model(v).exactly; return x >= 0.02 && x <= 0.45; } },
  ],

  stem: 'Records at a ready-mix plant show that {p}% of its concrete test cylinders break below the specified '
    + 'strength, independently of one another. A set of {n} cylinders is cast from different truckloads for a slab pour, and the engineer wants the chance that '
    + 'exactly {k} of the {n} will break below the specified strength.',

  figure: null,
  model,
  live: null,

  items: [
    {
      ask: 'Determine that probability.',
      pick: 'exactly', unit: '', sig: 3,
      valid: (value) => value < 1,
      distractors: [
        { name: 'gaveAtMost', value: (v, r) => r.atMost },
        { name: 'forgotNumberOfArrangements', value: (v, r) => r.exactly / r.C },
        { name: 'gaveAtLeast', value: (v, r) => r.atLeast },
        { name: 'ignoredThePassingCylinders', value: (v, r) => r.C * (v.p / 100) ** v.k },
        { name: 'swappedTheTwoProbabilities', value: (v, r) => r.C * (v.p / 100) ** (v.n - v.k) * (1 - v.p / 100) ** v.k },
        { name: 'gaveComplement', value: (v, r) => 1 - r.exactly },
      ],
    },
  ],

  solution: (v, r) => [
    `Each cylinder either fails (probability p = ${v.p / 100}) or passes (q = 1 − p = ${g(1 - v.p / 100)}), independently, so the number of failures in ${v.n} cylinders is binomial.`,
    `P(X = k) = C(n, k)·p<sup>k</sup>·q<sup>n−k</sup>. Number of ways to choose which ${v.k} fail: C(${v.n}, ${v.k}) = ${r.C}.`,
    `p<sup>k</sup> = (${v.p / 100})<sup>${v.k}</sup> = ${g((v.p / 100) ** v.k)}; q<sup>n−k</sup> = (${g(1 - v.p / 100)})<sup>${v.n - v.k}</sup> = ${g((1 - v.p / 100) ** (v.n - v.k))}.`,
    `P(X = ${v.k}) = (${r.C})(${g((v.p / 100) ** v.k)})(${g((1 - v.p / 100) ** (v.n - v.k))}) = ${f(r.exactly)}.`,
    `"Exactly ${v.k}" is one term only. "At most ${v.k}" would add the terms for fewer failures and give ${f(r.atMost)}.`,
  ],

  refs: ['Binomial distribution: P(X = k) = C(n, k) pᵏ (1 − p)ⁿ⁻ᵏ'],

  // Hand-solved: C(10, 2) = 45; 0.1^2 = 0.01; 0.9^8 = 0.430467; P = 45(0.01)(0.430467) = 0.1937.
  reference_instance: {
    vars: { n: 10, k: 2, p: 10 },
    answers: ['0.194'],
  },

  status: 'draft',
  bank_version: null,
};

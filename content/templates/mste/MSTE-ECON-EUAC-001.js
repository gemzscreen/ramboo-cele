// MSTE-ECON-EUAC-001 — equivalent uniform annual cost of owning and running an asset.
// Standalone item, no figure. Original scenario and wording (ROADMAP §3).
import { equivalentAnnualCost } from '../../../js/models/equivalentAnnualCost.js';
import { formatSig } from '../../../js/engine/format.js';

const f = (x) => formatSig(x, 4);
const h = (x) => formatSig(x, 6);

export default {
  id: 'MSTE-ECON-EUAC-001',
  subject: 'MSTE',
  topic: 'Economics',
  topic_id: 'mste.economics',
  subtopic_id: 'mste.economics.alternatives',
  archetype: 'Equivalent uniform annual cost with salvage value and yearly operating cost',
  format: 'single',
  board_frequency: '7/7 sittings', // the topic's count in content/frequency.json
  difficulty: 2,

  vars: {
    P: { min: 600, max: 1500, step: 50, unit: 'thousand pesos' },
    S: { min: 50, max: 250, step: 50, unit: 'thousand pesos' },
    OM: { min: 30, max: 90, step: 10, unit: 'thousand pesos' },
    n: { min: 5, max: 12, step: 1, unit: 'yr' },
    i: { min: 8, max: 14, step: 1, unit: '%' },
  },
  constraints: [
    { rule: 'salvage is at most 20% of first cost', test: (v) => v.S <= 0.2 * v.P },
  ],

  stem: 'A quarry buys a wheel loader for ₱{P} thousand. It will use the loader for {n} years and then sell it for ₱{S} thousand. '
    + 'Fuel, servicing and repairs cost ₱{OM} thousand, paid at the end of each year. Money is worth {i}% per year, compounded annually, '
    + 'and every amount other than the purchase falls at a year end.',

  figure: null,
  model: equivalentAnnualCost,
  live: null,

  items: [
    {
      ask: 'Determine the equivalent uniform annual cost of owning and running the loader.',
      pick: 'euac', unit: 'thousand pesos/yr', sig: 4,
      distractors: [
        { name: 'ignoredSalvageValue', value: (v, r) => v.P * r.crf + v.OM },
        { name: 'addedSalvageToFirstCost', value: (v, r) => (v.P + v.S) * r.crf + v.OM },
        { name: 'forgotInterestOnSalvage', value: (v, r) => r.capital + v.OM },
        { name: 'ignoredInterestEntirely', value: (v) => (v.P - v.S) / v.n + v.OM },
        { name: 'usedSinkingFundFactorForCapital', value: (v, r) => ((v.P - v.S) * (v.i / 100)) / ((1 + v.i / 100) ** v.n - 1) + v.S * (v.i / 100) + v.OM },
      ],
    },
  ],

  solution: (v, r) => [
    `Capital recovery factor: (A/P, ${v.i}%, ${v.n}) = i(1 + i)<sup>n</sup>/[(1 + i)<sup>n</sup> − 1] = ${h(r.crf)}.`,
    `Capital cost per year, on the part of the price that salvage does not return: (${v.P} − ${v.S})(${h(r.crf)}) = ${f(r.capital)}.`,
    `Interest on the salvage value, which stays invested for the whole life: ${v.S}(${v.i / 100}) = ${f(r.salvageInterest)}.`,
    `EUAC = ${f(r.capital)} + ${f(r.salvageInterest)} + ${v.OM} = ${f(r.euac)} thousand pesos per year.`,
  ],

  refs: ['Engineering economy: EUAC = (P − S)(A/P, i, n) + S·i + annual operating cost'],

  // Hand-solved: 1.1^6 = 1.771561; A/P = 0.1771561/0.771561 = 0.229607; 700(0.229607) = 160.725; + 10 + 60 = 230.725.
  reference_instance: {
    vars: { P: 800, S: 100, OM: 60, n: 6, i: 10 },
    answers: ['230.7'],
  },

  status: 'draft',
  bank_version: null,
};

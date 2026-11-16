// MSTE-ECON-BE-001 — break-even output between buying and hiring.
// Standalone item, no figure. Original scenario and wording (ROADMAP §3).
import { breakEvenTwoOptions } from '../../../js/models/breakEvenTwoOptions.js';
import { formatSig } from '../../../js/engine/format.js';

const f = (x) => formatSig(x, 3);

export default {
  id: 'MSTE-ECON-BE-001',
  subject: 'MSTE',
  topic: 'Economics',
  topic_id: 'mste.economics',
  subtopic_id: 'mste.economics.breakeven',
  archetype: 'Break-even output between two options with different fixed and variable costs',
  format: 'single',
  board_frequency: '7/7 sittings', // the topic's count in content/frequency.json
  difficulty: 1,

  vars: {
    F1: { min: 70000, max: 120000, step: 5000, unit: '₱/month' },
    v1: { min: 300, max: 500, step: 50, unit: '₱/m³' },
    F2: { min: 20000, max: 50000, step: 5000, unit: '₱/month' },
    v2: { min: 450, max: 750, step: 50, unit: '₱/m³' },
  },
  constraints: [
    { rule: 'v2 is at least ₱100 above v1', test: (v) => v.v2 - v.v1 >= 100 },
    { rule: 'F1 is at least ₱30 000 above F2', test: (v) => v.F1 - v.F2 >= 30000 },
  ],

  stem: 'A ready-mix supplier can either buy a mobile batching plant or hire one. Buying adds ₱{F1} a month in fixed charges '
    + '(loan repayment, insurance, yard rent) and ₱{v1} for every cubic metre mixed. Hiring adds ₱{F2} a month and ₱{v2} for every cubic metre '
    + '(operator and fuel are charged by the hirer). Cost is assumed to be linear in output.',

  figure: null,
  model: breakEvenTwoOptions,
  live: null,

  items: [
    {
      ask: 'At what monthly output do buying and hiring cost the same?',
      pick: 'Q', unit: 'm³/month', sig: 3,
      distractors: [
        { name: 'addedTheVariableRates', value: (v) => (v.F1 - v.F2) / (v.v1 + v.v2) },
        { name: 'addedTheFixedCharges', value: (v) => (v.F1 + v.F2) / (v.v2 - v.v1) },
        { name: 'ignoredHiringFixedCharge', value: (v) => v.F1 / (v.v2 - v.v1) },
        { name: 'dividedByHiringRateOnly', value: (v) => (v.F1 - v.F2) / v.v2 },
        { name: 'dividedByBuyingRateOnly', value: (v) => (v.F1 - v.F2) / v.v1 },
      ],
    },
  ],

  solution: (v, r) => [
    `Monthly cost of buying: ${v.F1} + ${v.v1}Q. Monthly cost of hiring: ${v.F2} + ${v.v2}Q, with Q in m³.`,
    `Set them equal: ${v.F1} + ${v.v1}Q = ${v.F2} + ${v.v2}Q.`,
    `Collect terms: (${v.v2} − ${v.v1})Q = ${v.F1} − ${v.F2}, so Q = ${v.F1 - v.F2}/${v.v2 - v.v1} = ${f(r.Q)} m³ per month.`,
    `At that output each option costs ₱${f(r.costAtQ)} a month. Above it buying is cheaper; below it hiring is cheaper.`,
  ],

  refs: ['Engineering economy: break-even analysis, F₁ + v₁Q = F₂ + v₂Q'],

  // Hand-solved: (90 000 − 30 000)/(650 − 500) = 60 000/150 = 400 m³ per month.
  reference_instance: {
    vars: { F1: 90000, v1: 500, F2: 30000, v2: 650 },
    answers: ['400'],
  },

  status: 'draft',
  bank_version: null,
};

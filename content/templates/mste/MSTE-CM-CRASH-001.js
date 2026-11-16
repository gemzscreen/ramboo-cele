// MSTE-CM-CRASH-001 — cheapest way to shorten a critical path (time-cost trade-off).
// Standalone item, no figure. Original scenario and wording (ROADMAP §3).
import { crashCost } from '../../../js/models/crashCost.js';
import { formatSig } from '../../../js/engine/format.js';

const f = (x) => formatSig(x, 3);

export default {
  id: 'MSTE-CM-CRASH-001',
  subject: 'MSTE',
  topic: 'Construction Management Principles and Methods',
  topic_id: 'mste.construction-management-principles-and-methods',
  subtopic_id: 'mste.construction-management-principles-and-methods.time-cost',
  archetype: 'Time-cost trade-off: crash the cheapest critical activities first',
  format: 'single',
  board_frequency: '7/7 sittings', // the topic's count in content/frequency.json
  difficulty: 2,

  vars: {
    mA: { min: 2, max: 5, step: 1, unit: 'days' },
    mB: { min: 2, max: 5, step: 1, unit: 'days' },
    mC: { min: 2, max: 5, step: 1, unit: 'days' },
    cA: { min: 3, max: 12, step: 1, unit: 'thousand pesos/day' },
    cB: { min: 3, max: 12, step: 1, unit: 'thousand pesos/day' },
    cC: { min: 3, max: 12, step: 1, unit: 'thousand pesos/day' },
    d: { min: 3, max: 10, step: 1, unit: 'days' },
  },
  constraints: [
    { rule: 'the three cost slopes are all different', test: (v) => v.cA !== v.cB && v.cB !== v.cC && v.cA !== v.cC },
    { rule: 'd is more than the cheapest activity can give, and no more than all three can give', test: (v) => {
      const cheapest = [[v.cA, v.mA], [v.cB, v.mB], [v.cC, v.mC]].sort((x, y) => x[0] - y[0])[0][1];
      return v.d > cheapest && v.d <= v.mA + v.mB + v.mC;
    } },
  ],

  stem: 'Three activities, A, B and C, run one after another on the critical path of a bridge-approach job, and no other path is close to critical. '
    + 'Each can be shortened by paying for extra crews, at a constant extra direct cost for every day saved, up to a limit: '
    + 'A by at most {mA} days at ₱{cA} thousand per day; B by at most {mB} days at ₱{cB} thousand per day; '
    + 'C by at most {mC} days at ₱{cC} thousand per day. The owner asks for the completion date to be brought forward by {d} days.',

  figure: null,
  model: crashCost,
  live: null,

  items: [
    {
      ask: 'Determine the least extra direct cost of meeting the earlier completion date.',
      pick: 'cost', unit: 'thousand pesos', sig: 3,
      distractors: [
        { name: 'priceOfAllDaysAtCheapestSlope', value: (v, r) => r.sortedSlopes[0] * v.d },
        { name: 'crashedDearestActivityFirst', value: (v, r) => r.dearestFirstCost },
        { name: 'averagedTheThreeSlopes', value: (v, r) => ((v.cA + v.cB + v.cC) / 3) * v.d },
        { name: 'crashedEveryActivityToItsLimit', value: (v, r) => r.fullCrashCost },
        { name: 'priceOfAllDaysAtSecondCheapestSlope', value: (v, r) => r.sortedSlopes[1] * v.d },
      ],
    },
  ],

  solution: (v, r) => {
    const order = r.taken.map((t) => `${t.name}: ${t.days} day${t.days > 1 ? 's' : ''}`).join(', ');
    return [
      `Shorten the cheapest activity first, up to its limit, then the next cheapest, until ${v.d} days are saved. Cost per day, cheapest to dearest: ${r.sortedSlopes.join(', ')} thousand pesos.`,
      `Days taken from each: ${order}.`,
      r.taken.map((t) => `${t.name}: ${t.days} × ${t.cost / t.days} = ${t.cost}`).join('; ') + '.',
      `Least extra direct cost = ${r.taken.map((t) => t.cost).join(' + ')} = ${r.cost} thousand pesos.`,
    ];
  },

  refs: ['Project control: time-cost trade-off; crash cost slope = extra cost per day saved; crash the cheapest critical activity first'],

  // Hand-solved: save 5 days. A (4/day) gives 3 days = 12; B (6/day) gives the other 2 days = 12; total 24. C (9/day) is not needed.
  reference_instance: {
    vars: { mA: 3, mB: 4, mC: 2, cA: 4, cB: 6, cC: 9, d: 5 },
    answers: ['24.0'],
  },

  status: 'draft',
  bank_version: null,
};

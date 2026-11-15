// MSTE-CM-PERT-001 — expected duration of a chain of activities (PERT).
// Standalone item, no figure. Original scenario and wording (ROADMAP §3).
import { pertPath } from '../../../js/models/pertPath.js';
import { formatSig } from '../../../js/engine/format.js';

const f = (x) => formatSig(x, 3);
const g = (x) => formatSig(x, 5);
const acts = (v) => [{ a: v.a1, m: v.m1, b: v.b1 }, { a: v.a2, m: v.m2, b: v.b2 }, { a: v.a3, m: v.m3, b: v.b3 }];
const sum = (v, fn) => acts(v).reduce((s, x) => s + fn(x), 0);

export default {
  id: 'MSTE-CM-PERT-001',
  subject: 'MSTE',
  topic: 'Construction Management Principles and Methods',
  topic_id: 'mste.construction-management-principles-and-methods',
  subtopic_id: 'mste.construction-management-principles-and-methods.network-scheduling',
  archetype: 'PERT: expected duration of a critical path from three-point time estimates',
  format: 'single',
  board_frequency: '7/7 sittings', // the topic's count in content/frequency.json
  difficulty: 1,

  // Ranges are chosen so optimistic < most likely < pessimistic always holds.
  vars: {
    a1: { min: 4, max: 8, step: 1, unit: 'days' }, m1: { min: 9, max: 12, step: 1, unit: 'days' }, b1: { min: 14, max: 22, step: 1, unit: 'days' },
    a2: { min: 8, max: 12, step: 1, unit: 'days' }, m2: { min: 13, max: 17, step: 1, unit: 'days' }, b2: { min: 20, max: 30, step: 2, unit: 'days' },
    a3: { min: 3, max: 6, step: 1, unit: 'days' }, m3: { min: 7, max: 10, step: 1, unit: 'days' }, b3: { min: 11, max: 18, step: 1, unit: 'days' },
  },
  constraints: [
    // Skewed enough that adding up the most likely times gives a visibly different total.
    { rule: 'expected duration at least 3% above the sum of most likely times', test: (v) => pertPath(acts(v)).T >= 1.03 * (v.m1 + v.m2 + v.m3) },
  ],

  stem: 'The critical path for fitting out a barangay health station runs through three activities in sequence. '
    + 'The site engineer gives these time estimates, in working days (optimistic, most likely, pessimistic): '
    + 'ceiling and partition framing ({a1}, {m1}, {b1}); electrical and plumbing rough-in ({a2}, {m2}, {b2}); '
    + 'painting and finishing ({a3}, {m3}, {b3}). Use the PERT three-point estimate.',

  figure: null,
  model: (v) => pertPath(acts(v)),
  live: null,

  items: [
    {
      ask: 'Determine the expected duration of the path.',
      pick: 'T', unit: 'working days', sig: 3,
      distractors: [
        { name: 'addedMostLikelyTimes', value: (v) => v.m1 + v.m2 + v.m3 },
        { name: 'usedSimpleAverageOfThree', value: (v) => sum(v, (x) => (x.a + x.m + x.b) / 3) },
        { name: 'addedPessimisticTimes', value: (v) => v.b1 + v.b2 + v.b3 },
        { name: 'averagedOptimisticAndPessimistic', value: (v) => sum(v, (x) => (x.a + x.b) / 2) },
        { name: 'dividedByFourInsteadOfSix', value: (v) => sum(v, (x) => (x.a + 4 * x.m + x.b) / 4) },
        { name: 'addedOptimisticTimes', value: (v) => v.a1 + v.a2 + v.a3 },
      ],
    },
  ],

  solution: (v, r) => [
    `PERT weights the most likely time four times as heavily as the two extremes: t<sub>e</sub> = (a + 4m + b)/6.`,
    ...acts(v).map((x, i) => `Activity ${i + 1}: t<sub>e</sub> = [${x.a} + 4(${x.m}) + ${x.b}]/6 = ${g(r.rows[i].te)} days.`),
    `The activities follow one another, so the expected durations add: T<sub>e</sub> = ${r.rows.map((x) => g(x.te)).join(' + ')} = ${f(r.T)} working days.`,
    `For comparison, the most likely times alone add up to ${v.m1 + v.m2 + v.m3} days; the expected duration is longer because each pessimistic estimate lies farther from the most likely time than the optimistic one does. The standard deviation of the path is √Σ[(b − a)/6]² = ${f(r.sd)} days.`,
  ],

  refs: ['PERT: expected activity time te = (a + 4m + b)/6; variance = [(b − a)/6]²'],

  // Hand-solved: (6 + 36 + 15)/6 = 9.5; (10 + 56 + 24)/6 = 15; (5 + 32 + 11)/6 = 8; total 32.5.
  reference_instance: {
    vars: { a1: 6, m1: 9, b1: 15, a2: 10, m2: 14, b2: 24, a3: 5, m3: 8, b3: 11 },
    answers: ['32.5'],
  },

  status: 'draft',
  bank_version: null,
};

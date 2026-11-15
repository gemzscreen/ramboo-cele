// MSTE-NM-SIMPSON-001 — area from equally spaced offsets by Simpson's 1/3 rule.
// Standalone item, no figure. Original scenario and wording (ROADMAP §3).
import { simpsonRule } from '../../../js/models/simpsonRule.js';
import { formatSig } from '../../../js/engine/format.js';

const f = (x) => formatSig(x, 3);
const g = (x) => formatSig(x, 5);
const ys = (v) => [v.y0, v.y1, v.y2, v.y3, v.y4];
const model = (v) => simpsonRule({ h: v.h, y: ys(v) });

export default {
  id: 'MSTE-NM-SIMPSON-001',
  subject: 'MSTE',
  topic: 'Numerical Methods',
  topic_id: 'mste.numerical-methods',
  subtopic_id: 'mste.numerical-methods.numerical-calculus',
  archetype: 'Numerical integration: area from five equally spaced ordinates by Simpson’s one-third rule',
  format: 'single',
  board_frequency: '1/7 sittings', // the topic's count in content/frequency.json
  difficulty: 1,

  vars: {
    h: { min: 5, max: 20, step: 5, unit: 'm' },
    y0: { min: 4, max: 8, step: 2, unit: 'm' },
    y1: { min: 6, max: 20, step: 2, unit: 'm' },
    y2: { min: 6, max: 20, step: 2, unit: 'm' },
    y3: { min: 6, max: 20, step: 2, unit: 'm' },
    y4: { min: 4, max: 8, step: 2, unit: 'm' },
  },
  constraints: [
    // Otherwise the trapezoidal rule gives nearly the same number and is no test of the method.
    { rule: 'Simpson and trapezoidal results differ by at least 3%', test: (v) => { const r = model(v); return Math.abs(r.simpson - r.trapezoid) >= 0.03 * r.simpson; } },
  ],

  stem: 'One side of a riverside lot follows the bank and is irregular. From a straight baseline along the opposite '
    + 'side, a surveyor measures offsets to the bank at equal intervals of {h} m. In order, the offsets are {y0} m, '
    + '{y1} m, {y2} m, {y3} m and {y4} m.',

  figure: null,
  model,
  live: null,

  items: [
    {
      ask: 'Determine the area between the baseline and the bank by Simpson’s one-third rule.',
      pick: 'simpson', unit: 'm²', sig: 3,
      distractors: [
        { name: 'usedTrapezoidalRule', value: (v, r) => r.trapezoid },
        { name: 'swappedTheFourAndTwoWeights', value: (v, r) => (v.h / 3) * (r.ends + 2 * r.odd + 4 * r.even) },
        { name: 'usedHOverTwoWithSimpsonWeights', value: (v, r) => (v.h / 2) * (r.ends + 4 * r.odd + 2 * r.even) },
        { name: 'multipliedSpacingBySumOfOffsets', value: (v, r) => v.h * (r.ends + r.odd + r.even) },
        { name: 'weightedEveryInteriorOffsetByFour', value: (v, r) => (v.h / 3) * (r.ends + 4 * (r.odd + r.even)) },
      ],
    },
  ],

  solution: (v, r) => [
    `Five offsets make four strips, an even number, so Simpson’s one-third rule applies: A = (h/3)[(first + last) + 4(sum of even-numbered offsets) + 2(sum of the remaining interior offsets)], counting the first offset as number 1.`,
    `First + last = ${v.y0} + ${v.y4} = ${r.ends}. Offsets 2 and 4: ${v.y1} + ${v.y3} = ${r.odd}. Offset 3: ${r.even}.`,
    `A = (${v.h}/3)[${r.ends} + 4(${r.odd}) + 2(${r.even})] = (${v.h}/3)(${r.ends + 4 * r.odd + 2 * r.even}) = ${f(r.simpson)} m².`,
    `For comparison, the trapezoidal rule gives (${v.h}/2)[${r.ends} + 2(${r.odd + r.even})] = ${g(r.trapezoid)} m². Simpson’s rule fits parabolas through the offsets instead of straight lines.`,
  ],

  refs: ['Numerical integration: Simpson’s one-third rule, A = (h/3)[y0 + 4(y1 + y3 + …) + 2(y2 + y4 + …) + yn]'],

  // Hand-solved: (10/3)[4 + 6 + 4(12 + 14) + 2(8)] = (10/3)(130) = 433.3; trapezoidal would give 390.
  reference_instance: {
    vars: { h: 10, y0: 4, y1: 12, y2: 8, y3: 14, y4: 6 },
    answers: ['433'],
  },

  status: 'draft',
  bank_version: null,
};

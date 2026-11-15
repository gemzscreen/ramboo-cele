// MSTE-CALC-BOX-001 — largest open-top box from a rectangular sheet.
// Standalone item, no figure. Original scenario and wording (ROADMAP §3).
import { openBoxMaxVolume } from '../../../js/models/openBoxMaxVolume.js';
import { formatSig } from '../../../js/engine/format.js';

const f = (x) => formatSig(x, 3);
const g = (x) => formatSig(x, 5);

export default {
  id: 'MSTE-CALC-BOX-001',
  subject: 'MSTE',
  topic: 'Calculus',
  topic_id: 'mste.calculus',
  subtopic_id: 'mste.calculus.differentiation-applications',
  archetype: 'Maxima and minima: corner cut that maximizes the volume of an open box from a rectangular sheet',
  format: 'single',
  board_frequency: '7/7 sittings', // the topic's count in content/frequency.json
  difficulty: 2,

  vars: {
    a: { min: 30, max: 80, step: 2, unit: 'cm' },
    b: { min: 20, max: 60, step: 1, unit: 'cm' },
  },
  constraints: [
    // Clearly rectangular, so the square-sheet shortcut (side/6) gives a different number.
    { rule: 'a >= b + 10', test: (v) => v.a >= v.b + 10 },
  ],

  stem: 'A tinsmith is making an open-top drip tray for an air-conditioning unit from a flat rectangular sheet of '
    + 'galvanized steel measuring {a} cm by {b} cm. Equal squares are cut from the four corners and the sides are '
    + 'folded up and soldered.',

  figure: null,
  model: openBoxMaxVolume,
  live: null,

  items: [
    {
      ask: 'Determine the side of the square that should be cut from each corner so the tray holds the largest possible volume.',
      pick: 'x', unit: 'cm', sig: 3,
      valid: (value, v) => value < v.b / 2, // a cut of half the short side or more leaves no tray
      distractors: [
        { name: 'usedSquareSheetRuleOnShortSide', value: (v) => v.b / 6 },
        { name: 'droppedTheSquaredTerm', value: (v) => (v.a * v.b) / (4 * (v.a + v.b)) },
        { name: 'usedSquareSheetRuleOnAverageSide', value: (v) => (v.a + v.b) / 12 },
        { name: 'usedSquareSheetRuleOnLongSide', value: (v) => v.a / 6 },
        { name: 'tookTheOtherRoot', value: (v, r) => r.xOther },
        { name: 'cutQuarterOfShortSide', value: (v) => v.b / 4 },
      ],
    },
  ],

  solution: (v, r) => [
    `Let x be the side of each cut square. The tray is then (${v.a} − 2x) long, (${v.b} − 2x) wide and x deep: V = x(${v.a} − 2x)(${v.b} − 2x) = 4x³ − ${2 * (v.a + v.b)}x² + ${v.a * v.b}x.`,
    `Set dV/dx = 0: 12x² − ${4 * (v.a + v.b)}x + ${v.a * v.b} = 0.`,
    `Quadratic formula: x = [(a + b) ± √(a² − ab + b²)]/6 = [${v.a + v.b} ± √${v.a * v.a - v.a * v.b + v.b * v.b}]/6, giving x = ${g(r.x)} cm or x = ${g(r.xOther)} cm.`,
    `The larger root is not possible: it would make the width ${v.b} − 2x zero or negative. So x = ${f(r.x)} cm. (d²V/dx² = 24x − ${4 * (v.a + v.b)} is negative there, confirming a maximum.)`,
    `The tray is then ${f(r.length)} cm by ${f(r.width)} cm by ${f(r.x)} cm deep, holding ${formatSig(r.Vmax, 4)} cm³.`,
  ],

  refs: ['Differential calculus: maxima and minima (first- and second-derivative tests)'],

  // Hand-solved: V = x(40 - 2x)(25 - 2x); 12x^2 - 260x + 1000 = 0;
  // x = [65 - sqrt(1600 - 1000 + 625)]/6 = (65 - 35)/6 = 5.00 (other root 16.67 > 12.5, rejected).
  reference_instance: {
    vars: { a: 40, b: 25 },
    answers: ['5.00'],
  },

  status: 'draft',
  bank_version: null,
};

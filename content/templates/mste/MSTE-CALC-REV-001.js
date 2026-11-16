// MSTE-CALC-REV-001 — volume of a solid of revolution between a parabola and a line.
// Standalone item, no figure. Original scenario and wording (ROADMAP §3).
import { revolveBetweenCurves } from '../../../js/models/revolveBetweenCurves.js';
import { formatSig } from '../../../js/engine/format.js';

const f = (x) => formatSig(x, 4);
const n = (x) => String(Number(x.toPrecision(10))); // 2.8 × 2.8 prints 7.84, not 7.839999999999999

export default {
  id: 'MSTE-CALC-REV-001',
  subject: 'MSTE',
  topic: 'Calculus',
  topic_id: 'mste.calculus',
  subtopic_id: 'mste.calculus.integration-applications',
  archetype: 'Washer method: volume between a parabola and a line revolved about the x-axis',
  format: 'single',
  board_frequency: '7/7 sittings', // the topic's count in content/frequency.json
  difficulty: 2,

  vars: {
    a: { min: 0.5, max: 3, step: 0.1, unit: '1/m' },
    b: { min: 1, max: 5, step: 0.1, unit: '' },
  },
  constraints: [],

  stem: 'On a drawing in metres, the parabola y = ax² and the straight line y = bx, with a = {a} and b = {b}, enclose a region. '
    + 'A mould is made by revolving this region once about the x-axis.',

  figure: null,
  model: revolveBetweenCurves,
  live: null,

  items: [
    {
      ask: 'Determine the volume of the solid.',
      pick: 'volume', unit: 'm³', sig: 4,
      distractors: [
        { name: 'revolvedTheLineAlone', value: (v, r) => r.outerOnly },
        { name: 'squaredTheDifferenceOfTheCurves', value: (v, r) => Math.PI * ((v.b * v.b * r.X ** 3) / 3 - (2 * v.a * v.b * r.X ** 4) / 4 + (v.a * v.a * r.X ** 5) / 5) },
        { name: 'forgotPi', value: (v, r) => r.volume / Math.PI },
        { name: 'revolvedTheParabolaAlone', value: (v, r) => r.innerOnly },
        { name: 'usedCylindricalShellsAboutTheYAxis', value: (v, r) => 2 * Math.PI * ((v.b * r.X ** 3) / 3 - (v.a * r.X ** 4) / 4) },
      ],
    },
  ],

  solution: (v, r) => [
    `The curves meet where ${v.a}x² = ${v.b}x, so x = 0 and x = ${v.b}/${v.a} = ${n(r.X)}. Between them the line is the outer curve and the parabola the inner curve.`,
    `Washer method: V = π∫(outer² − inner²)dx = π∫₀^${n(r.X)}[(${v.b}x)² − (${v.a}x²)²]dx = π∫₀^${n(r.X)}(${n(v.b * v.b)}x² − ${n(v.a * v.a)}x⁴)dx.`,
    `V = π[${n(v.b * v.b)}x³/3 − ${n(v.a * v.a)}x⁵/5] from 0 to ${r.X}, which simplifies to 2πb⁵/(15a³) = 2π(${v.b})⁵/(15(${v.a})³) = ${f(r.volume)} m³.`,
  ],

  refs: ['Calculus: volume of revolution by the washer method, V = π∫(R² − r²)dx'],

  // Hand-solved: a = 1, b = 2: meet at x = 2; V = π[4x³/3 − x⁵/5]₀² = π(32/3 − 32/5) = 64π/15 = 13.404.
  reference_instance: {
    vars: { a: 1, b: 2 },
    answers: ['13.40'],
  },

  status: 'draft',
  bank_version: null,
};

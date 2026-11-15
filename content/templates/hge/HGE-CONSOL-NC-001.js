// HGE-CONSOL-NC-001 — primary consolidation of a normally consolidated clay.
// Situation, no figure. Original scenario and wording (ROADMAP §3).
import { consolidationNC } from '../../../js/models/consolidationNC.js';
import { formatSig } from '../../../js/engine/format.js';

const f = (x) => formatSig(x, 3);
const g = (x) => formatSig(x, 5);

export default {
  id: 'HGE-CONSOL-NC-001',
  subject: 'HGE',
  topic: 'Consolidation and Settlement',
  topic_id: 'hge.consolidation-and-settlement',
  subtopic_id: 'hge.consolidation-and-settlement.primary-consolidation',
  archetype: 'Normally consolidated clay: change in void ratio, primary consolidation settlement, final void ratio',
  format: 'situation',
  board_frequency: '6/7 sittings', // the topic's count in content/frequency.json
  difficulty: 2,

  vars: {
    H: { min: 2, max: 6, step: 0.5, unit: 'm' },
    e0: { min: 0.8, max: 1.4, step: 0.1, unit: '' },
    Cc: { min: 0.2, max: 0.5, step: 0.02, unit: '' },
    p0: { min: 60, max: 140, step: 10, unit: 'kPa' },
    dp: { min: 30, max: 100, step: 10, unit: 'kPa' },
  },
  constraints: [],

  stem: 'A {H} m thick layer of normally consolidated clay lies beneath the site of a proposed grain silo. At the '
    + 'middle of the layer the effective overburden pressure is {p0} kPa, and the silo will raise the vertical stress '
    + 'there by {dp} kPa. The clay has an initial void ratio of {e0} and a compression index of {Cc}.',

  figure: null,
  model: consolidationNC,
  live: null,

  items: [
    {
      ask: 'Determine the decrease in void ratio caused by the silo load.',
      pick: 'de', unit: '', sig: 3,
      distractors: [
        { name: 'usedNaturalLogarithm', value: (v, r) => v.Cc * Math.log(r.ratio) },
        { name: 'usedStressIncreaseOverInitialOnly', value: (v) => v.Cc * Math.abs(Math.log10(v.dp / v.p0)) },
        { name: 'dividedByOnePlusE0', value: (v, r) => r.strain },
        { name: 'skippedTheLogarithm', value: (v) => (v.Cc * v.dp) / (v.p0 + v.dp) },
      ],
    },
    {
      ask: 'Determine the primary consolidation settlement of the clay layer.',
      pick: 'S', unit: 'mm', sig: 3,
      distractors: [
        { name: 'usedNaturalLogarithm', value: (v, r) => (v.H * 1000 * v.Cc * Math.log(r.ratio)) / (1 + v.e0) },
        { name: 'forgotOnePlusE0', value: (v, r) => v.H * 1000 * r.de },
        { name: 'dividedByE0Only', value: (v, r) => (v.H * 1000 * r.de) / v.e0 },
        { name: 'usedHalfThickness', value: (v, r) => r.S / 2 },
        { name: 'usedFinalVoidRatioInDenominator', value: (v, r) => (v.H * 1000 * r.de) / (1 + r.e1) },
      ],
    },
    {
      ask: 'Determine the void ratio of the clay at the end of primary consolidation.',
      pick: 'e1', unit: '', sig: 3,
      distractors: [
        { name: 'addedInsteadOfSubtracted', value: (v, r) => v.e0 + r.de },
        { name: 'usedNaturalLogarithm', value: (v, r) => v.e0 - v.Cc * Math.log(r.ratio) },
        { name: 'subtractedVerticalStrain', value: (v, r) => v.e0 - r.strain },
        { name: 'scaledByStressRatio', value: (v, r) => v.e0 / r.ratio },
        { name: 'subtractedCompressionIndex', value: (v) => v.e0 - v.Cc },
      ],
    },
  ],

  solution: (v, r) => [
    `For a normally consolidated clay the e–log p′ relation is a straight line of slope C<sub>c</sub>: Δe = C<sub>c</sub> log<sub>10</sub>[(p′<sub>0</sub> + Δp)/p′<sub>0</sub>].`,
    `Stress ratio = (${v.p0} + ${v.dp})/${v.p0} = ${g(r.ratio)}; log<sub>10</sub> = ${g(Math.log10(r.ratio))}. Δe = (${v.Cc})(${g(Math.log10(r.ratio))}) = ${f(r.de)}.`,
    `One-dimensional compression: the strain is Δe/(1 + e<sub>0</sub>), so S = H·Δe/(1 + e<sub>0</sub>) = (${v.H * 1000})(${g(r.de)})/(1 + ${v.e0}) = ${f(r.S)} mm.`,
    `Final void ratio: e = e<sub>0</sub> − Δe = ${v.e0} − ${g(r.de)} = ${f(r.e1)}.`,
    `Use the full layer thickness here. Drainage paths (single or double) affect how fast the settlement happens, not how much.`,
  ],

  refs: ['One-dimensional consolidation: S = Cc·H/(1 + e0) · log10[(p′0 + Δp)/p′0] for normally consolidated clay'],

  // Hand-solved: ratio 1.75, log10 = 0.243038; de = 0.36(0.243038) = 0.08749;
  // S = 4000(0.08749)/2.10 = 166.7 mm; e = 1.10 - 0.0875 = 1.0125.
  reference_instance: {
    vars: { H: 4, e0: 1.1, Cc: 0.36, p0: 80, dp: 60 },
    answers: ['0.0875', '167', '1.01'],
  },

  status: 'draft',
  bank_version: null,
};

// HGE-BEAR-TERZ-001 — Terzaghi bearing capacity of a square footing.
// Situation, no figure. Original scenario and wording (ROADMAP §3).
import { terzaghiSquare } from '../../../js/models/terzaghiSquare.js';
import { formatSig } from '../../../js/engine/format.js';

const f = (x) => formatSig(x, 3);
const g = (x) => formatSig(x, 5);
// Terzaghi's factors for a friction angle of 30 degrees, stated in the stem.
const NC = 37.2; const NQ = 22.5; const NG = 19.7;
const model = (v) => terzaghiSquare({ c: v.c, gamma: v.gamma, Df: v.Df, B: v.B, FS: v.FS, Nc: NC, Nq: NQ, Ng: NG });

export default {
  id: 'HGE-BEAR-TERZ-001',
  subject: 'HGE',
  topic: 'Bearing Capacity',
  topic_id: 'hge.bearing-capacity',
  subtopic_id: 'hge.bearing-capacity.shallow-foundations',
  archetype: 'Terzaghi, square footing, general shear: ultimate and allowable bearing capacity, allowable column load',
  format: 'situation',
  board_frequency: '5/7 sittings', // the topic's count in content/frequency.json
  difficulty: 2,

  vars: {
    c: { min: 5, max: 30, step: 5, unit: 'kPa' },
    gamma: { min: 16, max: 19, step: 0.5, unit: 'kN/m³' },
    Df: { min: 1, max: 2, step: 0.25, unit: 'm' },
    B: { min: 1.5, max: 3, step: 0.25, unit: 'm' },
    FS: { min: 2.5, max: 3, step: 0.5, unit: '' },
  },
  constraints: [],

  stem: 'A square footing {B} m on a side is founded {Df} m below the ground surface in a silty sand with a cohesion '
    + 'of {c} kPa, a friction angle of 30° and a unit weight of {gamma} kN/m³. The water table is far below the footing. '
    + 'For φ = 30°, take Terzaghi’s bearing capacity factors as N<sub>c</sub> = 37.2, N<sub>q</sub> = 22.5 and '
    + 'N<sub>γ</sub> = 19.7. Assume general shear failure and apply a factor of safety of {FS} to the ultimate bearing capacity.',

  figure: null,
  model,
  live: null,

  items: [
    {
      ask: 'Determine the ultimate bearing capacity of the soil under the footing.',
      pick: 'qu', unit: 'kPa', sig: 3,
      distractors: [
        { name: 'usedStripFootingEquation', value: (v, r) => r.quStrip },
        { name: 'usedCircularFootingWeightFactor', value: (v, r) => r.cohesionTerm + r.surchargeTerm + 0.3 * v.gamma * v.B * NG },
        { name: 'leftOutTheSurchargeTerm', value: (v, r) => r.cohesionTerm + r.weightTerm },
        { name: 'forgotShapeFactorOnCohesion', value: (v, r) => v.c * NC + r.surchargeTerm + r.weightTerm },
        { name: 'usedStripWeightFactorOnly', value: (v, r) => r.cohesionTerm + r.surchargeTerm + 0.5 * v.gamma * v.B * NG },
      ],
    },
    {
      ask: 'Determine the allowable bearing capacity.',
      pick: 'qAllow', unit: 'kPa', sig: 3,
      distractors: [
        { name: 'gaveNetAllowable', value: (v, r) => r.qNetAllow },
        { name: 'usedStripFootingEquation', value: (v, r) => r.quStrip / v.FS },
        { name: 'forgotFactorOfSafety', value: (v, r) => r.qu },
        { name: 'subtractedSurchargeAfterDividing', value: (v, r) => r.qAllow - r.q },
        { name: 'appliedSafetyFactorToCohesionTermOnly', value: (v, r) => r.cohesionTerm / v.FS + r.surchargeTerm + r.weightTerm },
      ],
    },
    {
      ask: 'Determine the allowable gross column load on the footing.',
      pick: 'Pallow', unit: 'kN', sig: 3,
      distractors: [
        { name: 'multipliedBySideInsteadOfArea', value: (v, r) => r.qAllow * v.B },
        { name: 'usedUltimateCapacity', value: (v, r) => r.qu * v.B ** 2 },
        { name: 'usedNetAllowable', value: (v, r) => r.qNetAllow * v.B ** 2 },
        { name: 'usedStripFootingEquation', value: (v, r) => (r.quStrip / v.FS) * v.B ** 2 },
        { name: 'usedCircularArea', value: (v, r) => (r.qAllow * Math.PI * v.B ** 2) / 4 },
      ],
    },
  ],

  solution: (v, r) => [
    `Terzaghi, square footing, general shear: q<sub>u</sub> = 1.3cN<sub>c</sub> + qN<sub>q</sub> + 0.4γBN<sub>γ</sub>, with surcharge q = γD<sub>f</sub> = (${v.gamma})(${v.Df}) = ${g(r.q)} kPa.`,
    `Cohesion term: 1.3(${v.c})(37.2) = ${g(r.cohesionTerm)} kPa. Surcharge term: (${g(r.q)})(22.5) = ${g(r.surchargeTerm)} kPa. Self-weight term: 0.4(${v.gamma})(${v.B})(19.7) = ${g(r.weightTerm)} kPa.`,
    `q<sub>u</sub> = ${g(r.cohesionTerm)} + ${g(r.surchargeTerm)} + ${g(r.weightTerm)} = ${f(r.qu)} kPa.`,
    `Allowable bearing capacity: q<sub>all</sub> = q<sub>u</sub>/FS = ${g(r.qu)}/${v.FS} = ${f(r.qAllow)} kPa.`,
    `Allowable gross load: P = q<sub>all</sub>B² = (${g(r.qAllow)})(${v.B})² = ${f(r.Pallow)} kN. This includes the weight of the footing and of the soil above it.`,
  ],

  refs: ['Terzaghi bearing capacity, square footing: qu = 1.3cNc + qNq + 0.4γBNγ', 'NSCP 2015 Section 304 — allowable foundation pressures; Section 303 for the foundation investigation'],

  // Hand-solved: q = 18(1.5) = 27; 1.3(10)(37.2) = 483.6; 27(22.5) = 607.5; 0.4(18)(2)(19.7) = 283.68;
  // qu = 1374.78; q_all = 1374.78/3 = 458.26; P = 458.26(4) = 1833.0.
  reference_instance: {
    vars: { c: 10, gamma: 18, Df: 1.5, B: 2, FS: 3 },
    answers: ['1370', '458', '1830'],
  },

  status: 'draft',
  bank_version: null,
};

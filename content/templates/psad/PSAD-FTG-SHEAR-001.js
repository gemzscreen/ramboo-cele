// PSAD-FTG-SHEAR-001 — square footing: factored soil pressure, one-way and
// two-way shear. Situation, no figure. Original scenario and wording (ROADMAP §3).
import { footingShear } from '../../../js/models/footingShear.js';
import { formatSig } from '../../../js/engine/format.js';

const f = (x) => formatSig(x, 3);
const g = (x) => formatSig(x, 5);

export default {
  id: 'PSAD-FTG-SHEAR-001',
  subject: 'PSAD',
  topic: 'Footings',
  topic_id: 'psad.footings',
  subtopic_id: 'psad.footings.isolated-footings',
  archetype: 'Square isolated footing under a concentric column: factored net pressure, wide-beam shear, punching shear',
  format: 'situation',
  board_frequency: '7/7 sittings', // the topic's count in content/frequency.json
  difficulty: 2,

  vars: {
    B: { min: 2.4, max: 3.6, step: 0.2, unit: 'm' },
    c: { min: 400, max: 600, step: 50, unit: 'mm' },
    d: { min: 400, max: 600, step: 50, unit: 'mm' },
    PD: { min: 700, max: 1300, step: 100, unit: 'kN' },
    PL: { min: 400, max: 900, step: 100, unit: 'kN' },
  },
  constraints: [
    { rule: 'one-way critical section at least 0.3 m inside the edge', test: (v) => (v.B - v.c / 1000) / 2 - v.d / 1000 >= 0.3 },
  ],

  stem: 'A square isolated footing {B} m on each side supports a {c} mm square reinforced-concrete column at its centre. '
    + 'The column delivers a service dead load of {PD} kN and a service live load of {PL} kN, with no moment. The '
    + 'effective depth of the footing is {d} mm. Use the NSCP 2015 load combination U = 1.2D + 1.6L and ignore the '
    + 'weight of the footing and soil when finding the pressure used for strength design.',

  figure: null,
  model: footingShear,
  live: null,

  items: [
    {
      ask: 'Determine the factored net soil pressure under the footing.',
      pick: 'qu', unit: 'kPa', sig: 3,
      distractors: [
        { name: 'usedServiceLoads', value: (v, r) => r.qService },
        { name: 'usedOldLoadFactors', value: (v) => (1.4 * v.PD + 1.7 * v.PL) / v.B ** 2 },
        { name: 'factoredDeadLoadOnly', value: (v) => (1.2 * v.PD + v.PL) / v.B ** 2 },
        { name: 'deductedColumnArea', value: (v, r) => r.Pu / (v.B ** 2 - (v.c / 1000) ** 2) },
        { name: 'dividedBySideOnly', value: (v, r) => r.Pu / v.B },
      ],
    },
    {
      ask: 'Determine the factored one-way (wide-beam) shear force at the critical section.',
      pick: 'Vu1', unit: 'kN', sig: 3,
      distractors: [
        { name: 'tookSectionAtColumnFace', value: (v, r) => r.qu * v.B * r.arm },
        { name: 'tookSectionAtHalfD', value: (v, r) => r.qu * v.B * (r.arm - v.d / 2000) },
        { name: 'usedServicePressure', value: (v, r) => r.qService * v.B * (r.arm - v.d / 1000) },
        { name: 'forgotFootingWidth', value: (v, r) => r.qu * (r.arm - v.d / 1000) },
        { name: 'measuredFromColumnCentre', value: (v, r) => r.qu * v.B * (v.B / 2 - v.d / 1000) },
      ],
    },
    {
      ask: 'Determine the factored two-way (punching) shear force at the critical section.',
      pick: 'Vu2', unit: 'kN', sig: 3,
      distractors: [
        { name: 'tookWholeColumnLoad', value: (v, r) => r.Pu },
        { name: 'tookPerimeterAtColumnFace', value: (v, r) => r.qu * (v.B ** 2 - (v.c / 1000) ** 2) },
        { name: 'tookPerimeterAtFullD', value: (v, r) => r.qu * (v.B ** 2 - (v.c / 1000 + (2 * v.d) / 1000) ** 2) },
        { name: 'usedServicePressure', value: (v, r) => r.qService * (v.B ** 2 - (v.c / 1000 + v.d / 1000) ** 2) },
        { name: 'gaveOneWayShear', value: (v, r) => r.Vu1 },
      ],
    },
  ],

  solution: (v, r) => [
    `Factored column load: P<sub>u</sub> = 1.2(${v.PD}) + 1.6(${v.PL}) = ${g(r.Pu)} kN (1.4D = ${g(1.4 * v.PD)} kN is smaller, so it does not govern).`,
    `Factored net pressure: q<sub>u</sub> = P<sub>u</sub>/B² = ${g(r.Pu)}/(${v.B})² = ${f(r.qu)} kPa.`,
    `One-way shear: the critical section is a distance d from the column face. Projection beyond the face = (${v.B} − ${v.c / 1000})/2 = ${g(r.arm)} m; loaded strip = ${g(r.arm)} − ${v.d / 1000} = ${g(r.arm - v.d / 1000)} m wide over the full ${v.B} m.`,
    `V<sub>u</sub> = q<sub>u</sub>·B·(strip) = (${g(r.qu)})(${v.B})(${g(r.arm - v.d / 1000)}) = ${f(r.Vu1)} kN.`,
    `Two-way shear: the critical perimeter is d/2 from each face, a square of side c + d = ${v.c / 1000} + ${v.d / 1000} = ${g((v.c + v.d) / 1000)} m. `
      + `V<sub>u</sub> = q<sub>u</sub>[B² − (c + d)²] = (${g(r.qu)})[(${v.B})² − (${g((v.c + v.d) / 1000)})²] = ${f(r.Vu2)} kN.`,
  ],

  refs: ['NSCP 2015 Section 203.3.1 — load combinations', 'NSCP 2015 Section 422.5 — one-way shear (critical section at d from the face)', 'NSCP 2015 Section 422.6.4 — two-way shear (critical section at d/2)'],

  // Hand-solved: Pu = 1.2(900) + 1.6(600) = 2040; qu = 2040/9 = 226.67;
  // one-way: 226.67(3)(1.25 - 0.45) = 544.0; two-way: 226.67(9 - 0.95^2) = 226.67(8.0975) = 1835.4.
  reference_instance: {
    vars: { B: 3, c: 500, d: 450, PD: 900, PL: 600 },
    answers: ['227', '544', '1840'],
  },

  status: 'draft',
  bank_version: null,
};

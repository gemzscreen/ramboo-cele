// PSAD-STEEL-TENSION-001 — flat bar in tension with one row of bolt holes.
// Situation, no figure. Original scenario and wording (ROADMAP §3).
import { tensionPlate } from '../../../js/models/tensionPlate.js';
import { formatSig } from '../../../js/engine/format.js';

const f = (x) => formatSig(x, 3);
const g = (x) => formatSig(x, 5);
const FY = 248;
const FU = 400;
const model = (v) => tensionPlate({ w: v.w, t: v.t, n: v.n, dh: v.dh, Fy: FY, Fu: FU });

export default {
  id: 'PSAD-STEEL-TENSION-001',
  subject: 'PSAD',
  topic: 'Steel Beams, Columns and Connections',
  topic_id: 'psad.steel-beams-columns-and-connections',
  subtopic_id: 'psad.steel-beams-columns-and-connections.tension-members',
  archetype: 'Bolted flat bar in tension: net area, design strength in yielding and in rupture',
  format: 'situation',
  board_frequency: '7/7 sittings', // the topic's count in content/frequency.json
  difficulty: 2,

  vars: {
    w: { min: 150, max: 300, step: 25, unit: 'mm' },
    t: { min: 10, max: 20, step: 2, unit: 'mm' },
    n: { min: 2, max: 3, step: 1, unit: 'bolts' },
    dh: { min: 20, max: 28, step: 2, unit: 'mm' },
  },
  constraints: [
    { rule: 'holes take up no more than 40% of the width', test: (v) => v.n * v.dh <= 0.4 * v.w },
  ],

  stem: 'A flat bar of A36 steel (F<sub>y</sub> = 248 MPa, F<sub>u</sub> = 400 MPa), {w} mm wide and {t} mm thick, hangs '
    + 'a mezzanine floor beam from the roof framing. At its end connection, {n} bolts are placed side by side in a single '
    + 'row across the width. For net area, take the hole diameter as {dh} mm. The full width of the bar is connected, '
    + 'so U = 1.0. Use NSCP 2015, LRFD.',

  figure: null,
  model,
  live: null,

  items: [
    {
      ask: 'Determine the net area of the bar at the row of bolts.',
      pick: 'An', unit: 'mm²', sig: 3,
      distractors: [
        { name: 'gaveGrossArea', value: (v, r) => r.Ag },
        { name: 'deductedOneHoleOnly', value: (v) => (v.w - v.dh) * v.t },
        { name: 'deductedCircularHoleAreas', value: (v, r) => r.Ag - (v.n * Math.PI * v.dh ** 2) / 4 },
        { name: 'took85PercentOfGross', value: (v, r) => 0.85 * r.Ag },
        { name: 'deductedOneHoleTooMany', value: (v) => (v.w - (v.n + 1) * v.dh) * v.t },
      ],
    },
    {
      ask: 'Determine the design tensile strength for yielding on the gross section.',
      pick: 'phiYield', unit: 'kN', sig: 3,
      distractors: [
        { name: 'gaveNominalStrength', value: (v, r) => r.yieldNominal },
        { name: 'usedNetArea', value: (v, r) => (0.9 * FY * r.An) / 1000 },
        { name: 'usedRuptureResistanceFactor', value: (v, r) => 0.75 * r.yieldNominal },
        { name: 'usedAsdSafetyFactor', value: (v, r) => r.allowYield },
        { name: 'usedTensileStrength', value: (v, r) => (0.9 * FU * r.Ag) / 1000 },
      ],
    },
    {
      ask: 'Determine the design tensile strength for rupture on the net section.',
      pick: 'phiRupture', unit: 'kN', sig: 3,
      distractors: [
        { name: 'gaveNominalStrength', value: (v, r) => r.ruptureNominal },
        { name: 'usedGrossArea', value: (v, r) => (0.75 * FU * r.Ag) / 1000 },
        { name: 'usedYieldingResistanceFactor', value: (v, r) => 0.9 * r.ruptureNominal },
        { name: 'usedAsdSafetyFactor', value: (v, r) => r.allowRupture },
        { name: 'usedYieldStress', value: (v, r) => (0.75 * FY * r.An) / 1000 },
      ],
    },
  ],

  solution: (v, r) => [
    `Gross area: A<sub>g</sub> = (${v.w})(${v.t}) = ${r.Ag} mm².`,
    `Net area: each hole removes a strip as wide as the hole and as thick as the bar. A<sub>n</sub> = (${v.w} − ${v.n}×${v.dh})(${v.t}) = ${f(r.An)} mm². With U = 1.0, A<sub>e</sub> = A<sub>n</sub>.`,
    `Yielding on the gross section: φ<sub>t</sub>P<sub>n</sub> = 0.90F<sub>y</sub>A<sub>g</sub> = 0.90(248)(${r.Ag})/1000 = ${f(r.phiYield)} kN.`,
    `Rupture on the net section: φ<sub>t</sub>P<sub>n</sub> = 0.75F<sub>u</sub>A<sub>e</sub> = 0.75(400)(${g(r.An)})/1000 = ${f(r.phiRupture)} kN.`,
    `The smaller value governs the bar: ${f(r.design)} kN, by ${r.governs}.`,
  ],

  refs: ['NSCP 2015 Section 504.2 — tensile strength: φ = 0.90 yielding on gross area, φ = 0.75 rupture on effective net area', 'NSCP 2015 Section 504.3 — net and effective net area'],

  // Hand-solved: Ag = 2400; An = (200 - 48)(12) = 1824; 0.9(248)(2400)/1000 = 535.68; 0.75(400)(1824)/1000 = 547.2.
  reference_instance: {
    vars: { w: 200, t: 12, n: 2, dh: 24 },
    answers: ['1820', '536', '547'],
  },

  status: 'draft',
  bank_version: null,
};

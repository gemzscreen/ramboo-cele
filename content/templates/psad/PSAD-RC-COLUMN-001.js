// PSAD-RC-COLUMN-001 — short tied column under concentric axial load.
// Situation, no figure. Original scenario and wording (ROADMAP §3).
import { rcColumnTied } from '../../../js/models/rcColumnTied.js';
import { formatSig } from '../../../js/engine/format.js';

const f = (x) => formatSig(x, 3);
const g = (x) => formatSig(x, 5);
const steelArea = (v) => (v.n * Math.PI * v.db ** 2) / 4;
const model = (v) => rcColumnTied({ b: v.s, h: v.s, Ast: steelArea(v), fc: v.fc, fy: v.fy });

export default {
  id: 'PSAD-RC-COLUMN-001',
  subject: 'PSAD',
  topic: 'Reinforced Concrete Beams and Columns',
  topic_id: 'psad.reinforced-concrete-beams-and-columns',
  subtopic_id: 'psad.reinforced-concrete-beams-and-columns.short-columns',
  archetype: 'Short square tied column, concentric load: steel ratio, nominal axial strength, design axial strength',
  format: 'situation',
  board_frequency: '7/7 sittings', // the topic's count in content/frequency.json
  difficulty: 1,

  vars: {
    s: { min: 350, max: 600, step: 50, unit: 'mm' },
    n: { min: 8, max: 12, step: 4, unit: 'bars' },
    db: { min: 20, max: 28, step: 8, unit: 'mm' },
    fc: { min: 21, max: 35, step: 7, unit: 'MPa' },
    fy: { min: 275, max: 415, step: 140, unit: 'MPa' },
  },
  constraints: [
    { rule: 'steel ratio between 1% and 4%', test: (v) => { const rho = steelArea(v) / (v.s * v.s); return rho >= 0.01 && rho <= 0.04; } },
  ],

  stem: 'A ground-floor column of a three-storey school building is {s} mm square, with {n} longitudinal bars of '
    + '{db} mm diameter enclosed by lateral ties. f′<sub>c</sub> = {fc} MPa and f<sub>y</sub> = {fy} MPa. The column is short and '
    + 'the load may be taken as concentric. Use NSCP 2015.',

  figure: null,
  model,
  live: null,

  items: [
    {
      ask: 'Determine the longitudinal steel ratio, in percent.',
      pick: 'rho', unit: '%', sig: 3,
      distractors: [
        { name: 'dividedByNetConcreteArea', value: (v, r) => (steelArea(v) / (r.Ag - steelArea(v))) * 100 },
        { name: 'forgotPiOverFour', value: (v, r) => ((v.n * v.db ** 2) / r.Ag) * 100 },
        { name: 'usedRadiusAsDiameter', value: (v, r) => r.rho / 4 },
        { name: 'countedOneFaceOfBarsOnly', value: (v, r) => r.rho / 2 },
      ],
    },
    {
      ask: 'Determine the nominal axial strength at zero eccentricity, P<sub>o</sub>.',
      pick: 'Po', unit: 'kN', sig: 3,
      distractors: [
        { name: 'didNotDeductSteelFromConcrete', value: (v, r) => (0.85 * v.fc * r.Ag) / 1000 + r.steel },
        { name: 'forgotThe085Factor', value: (v, r) => r.concrete / 0.85 + r.steel },
        { name: 'ignoredTheSteel', value: (v, r) => (0.85 * v.fc * r.Ag) / 1000 },
        { name: 'gaveMaximumNominalStrength', value: (v, r) => r.PnMax },
        { name: 'applied085ToSteelToo', value: (v, r) => r.concrete + 0.85 * r.steel },
      ],
    },
    {
      ask: 'Determine the maximum design axial strength, φP<sub>n,max</sub>.',
      pick: 'phiPn', unit: 'kN', sig: 3,
      distractors: [
        { name: 'forgotThe080Limit', value: (v, r) => 0.65 * r.Po },
        { name: 'forgotResistanceFactor', value: (v, r) => r.PnMax },
        { name: 'usedSpiralColumnFactors', value: (v, r) => 0.75 * 0.85 * r.Po },
        { name: 'usedTensionControlledFactor', value: (v, r) => 0.9 * 0.8 * r.Po },
        { name: 'gaveNominalStrength', value: (v, r) => r.Po },
      ],
    },
  ],

  solution: (v, r) => {
    const Ast = steelArea(v);
    return [
      `Gross area: A<sub>g</sub> = (${v.s})² = ${r.Ag} mm². Steel area: A<sub>st</sub> = ${v.n}·π(${v.db})²/4 = ${g(Ast)} mm².`,
      `Steel ratio: ρ<sub>g</sub> = A<sub>st</sub>/A<sub>g</sub> = ${g(Ast)}/${r.Ag} = ${f(r.rho)}%, inside the 1% to 8% the code allows.`,
      `Nominal strength at zero eccentricity: P<sub>o</sub> = 0.85f′<sub>c</sub>(A<sub>g</sub> − A<sub>st</sub>) + f<sub>y</sub>A<sub>st</sub> = [0.85(${v.fc})(${r.Ag} − ${g(Ast)}) + (${v.fy})(${g(Ast)})]/1000 = ${g(r.concrete)} + ${g(r.steel)} = ${f(r.Po)} kN.`,
      `For a tied column the code caps the nominal strength at 0.80P<sub>o</sub> to allow for accidental eccentricity: P<sub>n,max</sub> = 0.80(${g(r.Po)}) = ${g(r.PnMax)} kN.`,
      `A tied column is compression-controlled, φ = 0.65: φP<sub>n,max</sub> = 0.65(${g(r.PnMax)}) = ${f(r.phiPn)} kN.`,
    ];
  },

  refs: ['NSCP 2015 Section 422.4.2 — maximum axial compressive strength (0.80Po for tied columns)', 'NSCP 2015 Table 421.2.2 — φ = 0.65 for compression-controlled sections with ties', 'NSCP 2015 Section 410.6.1.1 — longitudinal steel between 0.01Ag and 0.08Ag'],

  // Hand-solved: Ag = 160000; Ast = 8(314.159) = 2513.27; rho = 1.571%;
  // Po = [0.85(28)(157486.73) + 415(2513.27)]/1000 = 3748.18 + 1043.01 = 4791.2; 0.65(0.80)(4791.2) = 2491.4.
  reference_instance: {
    vars: { s: 400, n: 8, db: 20, fc: 28, fy: 415 },
    answers: ['1.57', '4790', '2490'],
  },

  status: 'draft',
  bank_version: null,
};

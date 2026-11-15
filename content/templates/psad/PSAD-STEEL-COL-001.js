// PSAD-STEEL-COL-001 — axially loaded steel column braced at mid-height about
// the weak axis. Situation, no figure. Original scenario and wording (ROADMAP §3).
import { steelColumnAxial } from '../../../js/models/steelColumnAxial.js';
import { formatSig } from '../../../js/engine/format.js';

const f = (x) => formatSig(x, 3);
const g = (x) => formatSig(x, 5);
const E = 200000;
const column = (v, Ly = v.L / 2) => steelColumnAxial({ A: v.A, rx: v.rx, ry: v.ry, Lx: v.L, Ly, Fy: v.Fy, E });
// Critical stress for a given slenderness, used by the distractors.
const fcrFor = (sl, Fy) => { const Fe = (Math.PI ** 2 * E) / sl ** 2; return sl <= 4.71 * Math.sqrt(E / Fy) ? 0.658 ** (Fy / Fe) * Fy : 0.877 * Fe; };

export default {
  id: 'PSAD-STEEL-COL-001',
  subject: 'PSAD',
  topic: 'Steel Beams, Columns and Connections',
  topic_id: 'psad.steel-beams-columns-and-connections',
  subtopic_id: 'psad.steel-beams-columns-and-connections.compression-members',
  archetype: 'Steel column with different unbraced lengths about each axis: governing slenderness, critical stress, design strength',
  format: 'situation',
  board_frequency: '7/7 sittings', // the topic's count in content/frequency.json
  difficulty: 2,

  vars: {
    L: { min: 6, max: 10, step: 0.5, unit: 'm' },
    A: { min: 8000, max: 16000, step: 1000, unit: 'mm²' },
    rx: { min: 130, max: 170, step: 10, unit: 'mm' },
    ry: { min: 50, max: 90, step: 10, unit: 'mm' },
    Fy: { min: 248, max: 345, step: 97, unit: 'MPa' },
  },
  constraints: [
    // Keep the two slenderness ratios clearly apart so the governing axis is not a coin toss.
    { rule: '|L/rx - (L/2)/ry| >= 8% of the larger', test: (v) => { const x = v.L / v.rx; const y = v.L / 2 / v.ry; return Math.abs(x - y) >= 0.08 * Math.max(x, y); } },
  ],

  stem: 'A wide-flange steel column in a warehouse frame is {L} m long and pin-connected at both ends for buckling '
    + 'about either axis (K = 1.0). A horizontal girt at mid-height prevents movement in the weak (y–y) direction only. '
    + 'Section properties: A = {A} mm², r<sub>x</sub> = {rx} mm, r<sub>y</sub> = {ry} mm. Steel: F<sub>y</sub> = {Fy} MPa, '
    + 'E = 200 000 MPa. The section has no slender elements. Use NSCP 2015, LRFD.',

  figure: null,
  model: (v) => column(v),
  live: null,

  items: [
    {
      ask: 'Determine the slenderness ratio that governs the design.',
      pick: 'sl', unit: '', sig: 3,
      distractors: [
        { name: 'tookTheSmallerRatio', value: (v, r) => Math.min(r.slx, r.sly) },
        { name: 'ignoredTheMidHeightBrace', value: (v) => (v.L * 1000) / v.ry },
        { name: 'bracedTheStrongAxisToo', value: (v) => (v.L * 500) / v.rx },
        { name: 'averagedTheTwoRatios', value: (v, r) => (r.slx + r.sly) / 2 },
      ],
    },
    {
      ask: 'Determine the critical (flexural buckling) stress, F<sub>cr</sub>.',
      pick: 'Fcr', unit: 'MPa', sig: 3,
      valid: (value, v) => value < v.Fy, // a stress above yield would give itself away
      distractors: [
        { name: 'usedTheNonGoverningAxis', value: (v, r) => fcrFor(Math.min(r.slx, r.sly), v.Fy) },
        { name: 'invertedTheExponent', value: (v, r) => 0.658 ** (r.Fe / v.Fy) * v.Fy },
        { name: 'ignoredTheMidHeightBrace', value: (v) => fcrFor((v.L * 1000) / v.ry, v.Fy) },
        { name: 'usedElasticFormulaOutOfRange', value: (v, r) => 0.877 * r.Fe },
        { name: 'appliedResistanceFactorToStress', value: (v, r) => 0.9 * r.Fcr },
        { name: 'usedAllowableAxialStressOnly', value: (v) => 0.6 * v.Fy },
      ],
    },
    {
      ask: 'Determine the design compressive strength, φ<sub>c</sub>P<sub>n</sub>.',
      pick: 'phiPn', unit: 'kN', sig: 3,
      distractors: [
        { name: 'gaveNominalStrength', value: (v, r) => r.Pn },
        { name: 'usedAsdSafetyFactor', value: (v, r) => r.Pallow },
        { name: 'usedYieldInsteadOfBuckling', value: (v, r) => 0.9 * r.Py },
        { name: 'usedTheNonGoverningAxis', value: (v, r) => (0.9 * fcrFor(Math.min(r.slx, r.sly), v.Fy) * v.A) / 1000 },
        { name: 'usedTensionFractureFactor', value: (v, r) => 0.75 * r.Pn },
      ],
    },
  ],

  solution: (v, r) => [
    `Buckling about the strong axis uses the full length; buckling about the weak axis is broken by the girt, so its unbraced length is ${v.L}/2 = ${v.L / 2} m.`,
    `K<sub>x</sub>L<sub>x</sub>/r<sub>x</sub> = (1.0)(${v.L * 1000})/${v.rx} = ${f(r.slx)}; K<sub>y</sub>L<sub>y</sub>/r<sub>y</sub> = (1.0)(${v.L * 500})/${v.ry} = ${f(r.sly)}. The larger governs: KL/r = ${f(r.sl)} (about the ${r.governs}-axis).`,
    `Limit between inelastic and elastic buckling: 4.71√(E/F<sub>y</sub>) = 4.71√(200000/${v.Fy}) = ${f(r.limit)}. Since ${f(r.sl)} ${r.inelastic ? '≤' : '>'} ${f(r.limit)}, buckling is ${r.inelastic ? 'inelastic' : 'elastic'}.`,
    `Elastic buckling stress: F<sub>e</sub> = π²E/(KL/r)² = π²(200000)/(${g(r.sl)})² = ${g(r.Fe)} MPa.`,
    r.inelastic
      ? `F<sub>cr</sub> = [0.658^(F<sub>y</sub>/F<sub>e</sub>)]F<sub>y</sub> = [0.658^(${v.Fy}/${g(r.Fe)})](${v.Fy}) = ${f(r.Fcr)} MPa.`
      : `F<sub>cr</sub> = 0.877F<sub>e</sub> = 0.877(${g(r.Fe)}) = ${f(r.Fcr)} MPa.`,
    `P<sub>n</sub> = F<sub>cr</sub>A = (${g(r.Fcr)})(${v.A})/1000 = ${g(r.Pn)} kN, and φ<sub>c</sub>P<sub>n</sub> = 0.90(${g(r.Pn)}) = ${f(r.phiPn)} kN.`,
  ],

  refs: ['NSCP 2015 Section 505.3 — flexural buckling of members without slender elements', 'NSCP 2015 Section 505.1 — φc = 0.90 (LRFD)'],

  // Hand-solved: x: 8000/150 = 53.33; y: 4000/60 = 66.67 (governs) < 133.76.
  // Fe = pi^2(200000)/66.667^2 = 444.13; Fcr = 0.658^(248/444.13)(248) = 0.79158(248) = 196.31;
  // Pn = 196.31(12000)/1000 = 2355.7; 0.9Pn = 2120.2.
  reference_instance: {
    vars: { L: 8, A: 12000, rx: 150, ry: 60, Fy: 248 },
    answers: ['66.7', '196', '2120'],
  },

  status: 'draft',
  bank_version: null,
};

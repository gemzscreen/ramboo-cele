// PSAD-RC-BEAM-001 — singly reinforced rectangular beam, flexural strength.
// Situation, no figure. Original scenario and wording (ROADMAP §3).
import { rcBeamSingly } from '../../../js/models/rcBeamSingly.js';
import { formatSig } from '../../../js/engine/format.js';

const f = (x) => formatSig(x, 3);
const g = (x) => formatSig(x, 5);
const steelArea = (v) => (v.n * Math.PI * v.db ** 2) / 4;
const beam = (v) => rcBeamSingly({ b: v.b, d: v.d, As: steelArea(v), fc: v.fc, fy: v.fy });

export default {
  id: 'PSAD-RC-BEAM-001',
  subject: 'PSAD',
  topic: 'Reinforced Concrete Beams and Columns',
  topic_id: 'psad.reinforced-concrete-beams-and-columns',
  subtopic_id: 'psad.reinforced-concrete-beams-and-columns.beam-flexure',
  archetype: 'Singly reinforced rectangular beam: stress block depth, net tensile strain, design moment strength',
  format: 'situation',
  board_frequency: '7/7 sittings', // the topic's count in content/frequency.json
  difficulty: 2,

  vars: {
    b: { min: 250, max: 400, step: 50, unit: 'mm' },
    d: { min: 400, max: 600, step: 50, unit: 'mm' },
    n: { min: 3, max: 6, step: 1, unit: 'bars' },
    db: { min: 20, max: 28, step: 8, unit: 'mm' },
    fc: { min: 21, max: 35, step: 7, unit: 'MPa' },
    fy: { min: 275, max: 415, step: 140, unit: 'MPa' },
  },
  constraints: [
    { rule: 'bars fit in one layer (50 mm to bar centre each side, clear spacing >= bar diameter and 25 mm)', test: (v) => v.n * v.db + (v.n - 1) * Math.max(25, v.db) + 2 * 50 - v.db <= v.b },
    { rule: 'tension-controlled with margin (net tensile strain >= 0.006)', test: (v) => { try { return beam(v).epsT >= 0.006; } catch { return false; } } },
    { rule: 'at least the minimum steel: the larger of 0.25*sqrt(fc)/fy and 1.4/fy, times b*d', test: (v) => steelArea(v) / (v.b * v.d) >= Math.max(0.25 * Math.sqrt(v.fc), 1.4) / v.fy },
  ],

  stem: 'A lintel beam over a wide classroom doorway has a rectangular section {b} mm wide with an effective depth '
    + 'of {d} mm. It is reinforced for tension only, with {n} bars of {db} mm diameter in a single layer. '
    + 'f′<sub>c</sub> = {fc} MPa and f<sub>y</sub> = {fy} MPa; E<sub>s</sub> = 200 000 MPa. Use the NSCP 2015 strength design provisions.',

  figure: null,
  model: beam,
  live: null,

  items: [
    {
      ask: 'Determine the depth of the equivalent rectangular compressive stress block.',
      pick: 'a', unit: 'mm', sig: 3,
      distractors: [
        { name: 'gaveNeutralAxisDepth', value: (v, r) => r.c },
        { name: 'forgotThe085Factor', value: (v, r) => 0.85 * r.a },
        { name: 'multipliedByBeta1InsteadOfDividing', value: (v, r) => r.b1 * r.a },
        { name: 'usedEffectiveDepthAsWidth', value: (v, r) => (r.a * v.b) / v.d },
        { name: 'usedOneBarFewer', value: (v, r) => (r.a * (v.n - 1)) / v.n },
      ],
    },
    {
      ask: 'Determine the net tensile strain in the reinforcement at nominal strength.',
      pick: 'epsT', unit: '', sig: 3,
      distractors: [
        { name: 'usedStressBlockDepthAsNeutralAxis', value: (v, r) => (0.003 * (v.d - r.a)) / r.a },
        { name: 'measuredFromCompressionFaceOnly', value: (v, r) => (0.003 * v.d) / r.c },
        { name: 'gaveYieldStrain', value: (v, r) => r.epsY },
        { name: 'dividedByEffectiveDepth', value: (v, r) => (0.003 * (v.d - r.c)) / v.d },
        { name: 'invertedTheRatio', value: (v, r) => (0.003 * r.c) / (v.d - r.c) },
      ],
    },
    {
      ask: 'Determine the design moment strength, φM<sub>n</sub>.',
      pick: 'phiMn', unit: 'kN·m', sig: 3,
      distractors: [
        { name: 'gaveNominalStrength', value: (v, r) => r.Mn },
        { name: 'usedFullEffectiveDepthAsLeverArm', value: (v, r) => (0.9 * r.T * v.d) / 1000 },
        { name: 'subtractedWholeStressBlock', value: (v, r) => (0.9 * r.T * (v.d - r.a)) / 1000 },
        { name: 'usedCompressionControlledFactor', value: (v, r) => 0.65 * r.Mn },
        { name: 'usedNeutralAxisInLeverArm', value: (v, r) => (0.9 * r.T * (v.d - r.c)) / 1000 },
      ],
    },
  ],

  solution: (v, r) => {
    const As = steelArea(v);
    return [
      `Steel area: A<sub>s</sub> = ${v.n}·π(${v.db})²/4 = ${g(As)} mm².`,
      `Assume the steel yields. Equilibrium C = T: 0.85f′<sub>c</sub>·a·b = A<sub>s</sub>f<sub>y</sub>, so a = (${g(As)})(${v.fy})/[0.85(${v.fc})(${v.b})] = ${f(r.a)} mm.`,
      `β<sub>1</sub> = ${f(r.b1)} for f′<sub>c</sub> = ${v.fc} MPa${v.fc > 28 ? ' (0.85 less 0.05 for each 7 MPa above 28 MPa)' : ''}. Neutral axis: c = a/β<sub>1</sub> = ${g(r.a)}/${f(r.b1)} = ${g(r.c)} mm.`,
      `Strain diagram (0.003 at the compression face): ε<sub>t</sub> = 0.003(d − c)/c = 0.003(${v.d} − ${g(r.c)})/${g(r.c)} = ${f(r.epsT)}.`,
      `ε<sub>t</sub> is above the yield strain ${v.fy}/200000 = ${f(r.epsY)}, so the assumption holds; it is also at least 0.005, so the section is tension-controlled and φ = 0.90.`,
      `M<sub>n</sub> = A<sub>s</sub>f<sub>y</sub>(d − a/2) = (${g(As)})(${v.fy})(${v.d} − ${g(r.a)}/2)/10⁶ = ${g(r.Mn)} kN·m; φM<sub>n</sub> = 0.90(${g(r.Mn)}) = ${f(r.phiMn)} kN·m.`,
    ];
  },

  refs: ['NSCP 2015 Section 422.2.2 — equivalent rectangular stress block and β1', 'NSCP 2015 Section 421.2 — strength reduction factors; tension-controlled at εt ≥ 0.005', 'NSCP 2015 Section 409.6.1 — minimum flexural reinforcement'],

  // Hand-solved: As = 4(314.159) = 1256.64; a = 1256.64(415)/(0.85*28*300) = 73.04;
  // c = 85.93; eps_t = 0.003(500 - 85.93)/85.93 = 0.014456; Mn = 521505(500 - 36.52)/1e6 = 241.71; 0.9Mn = 217.54.
  reference_instance: {
    vars: { b: 300, d: 500, n: 4, db: 20, fc: 28, fy: 415 },
    answers: ['73.0', '0.0145', '218'],
  },

  status: 'draft',
  bank_version: null,
};

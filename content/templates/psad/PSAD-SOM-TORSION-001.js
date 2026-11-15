// PSAD-SOM-TORSION-001 — solid circular shaft: stress, twist and power.
// Situation, no figure. Original scenario and wording (ROADMAP §3).
import { shaftTorsion } from '../../../js/models/shaftTorsion.js';
import { formatSig } from '../../../js/engine/format.js';

const f = (x) => formatSig(x, 3);
const g = (x) => formatSig(x, 5);

export default {
  id: 'PSAD-SOM-TORSION-001',
  subject: 'PSAD',
  topic: 'Strength of Materials',
  topic_id: 'psad.strength-of-materials',
  subtopic_id: 'psad.strength-of-materials.torsion',
  archetype: 'Solid circular shaft under torque: maximum shear stress, angle of twist, power transmitted',
  format: 'situation',
  board_frequency: '7/7 sittings', // the topic's count in content/frequency.json
  difficulty: 1,

  vars: {
    d: { min: 50, max: 120, step: 10, unit: 'mm' },
    L: { min: 1, max: 3, step: 0.5, unit: 'm' },
    T: { min: 2, max: 12, step: 1, unit: 'kN·m' },
    G: { min: 77, max: 83, step: 3, unit: 'GPa' },
    N: { min: 200, max: 600, step: 100, unit: 'rev/min' },
  },
  constraints: [
    // Keep the shaft elastic and the numbers realistic.
    { rule: 'maximum shear stress between 15 and 120 MPa', test: (v) => { const tau = (16 * v.T * 1e6) / (Math.PI * v.d ** 3); return tau >= 15 && tau <= 120; } },
  ],

  stem: 'A solid steel line shaft in a rice mill is {d} mm in diameter and {L} m long between the motor coupling and '
    + 'the driven pulley. It carries a steady torque of {T} kN·m while turning at {N} rev/min. The shear modulus of the '
    + 'steel is {G} GPa.',

  figure: null,
  model: shaftTorsion,
  live: null,

  items: [
    {
      ask: 'Determine the maximum shear stress in the shaft.',
      pick: 'tau', unit: 'MPa', sig: 3,
      distractors: [
        { name: 'usedBendingMomentOfInertia', value: (v, r) => 2 * r.tau },
        { name: 'gaveAverageStressOverSection', value: (v, r) => (2 * r.tau) / 3 },
        { name: 'usedDiameterInPlaceOfRadius', value: (v, r) => r.tau / 2 },
        { name: 'usedRadiusWhereFormulaNeedsDiameter', value: (v, r) => 8 * r.tau },
      ],
    },
    {
      ask: 'Determine the angle of twist over the length of the shaft, in degrees.',
      pick: 'thetaDeg', unit: '°', sig: 3,
      distractors: [
        { name: 'usedBendingMomentOfInertia', value: (v, r) => 2 * r.thetaDeg },
        { name: 'usedElasticModulus200GPa', value: (v, r) => (r.thetaDeg * v.G) / 200 },
        { name: 'leftAnswerInRadians', value: (v, r) => r.thetaRad },
        { name: 'halvedTheLength', value: (v, r) => r.thetaDeg / 2 },
      ],
    },
    {
      ask: 'Determine the power the shaft transmits.',
      pick: 'power', unit: 'kW', sig: 3,
      distractors: [
        { name: 'forgotTwoPi', value: (v) => (v.N * v.T) / 60 },
        { name: 'usedPiInsteadOfTwoPi', value: (v) => (Math.PI * v.N * v.T) / 60 },
        { name: 'convertedToHorsepowerWrongWay', value: (v, r) => r.power * 0.746 },
        { name: 'reportedHorsepowerAsKilowatts', value: (v, r) => r.power / 0.746 },
        { name: 'forgotToConvertMinutes', value: (v, r) => r.power * 60 },
      ],
    },
  ],

  solution: (v, r) => [
    `Polar moment of inertia of a solid circle: J = πd⁴/32 = π(${v.d})⁴/32 = ${g(r.J)} mm⁴.`,
    `Maximum shear stress is at the surface: τ = Tr/J = 16T/(πd³) = 16(${v.T}×10⁶)/[π(${v.d})³] = ${f(r.tau)} MPa.`,
    `Angle of twist: θ = TL/(JG) = (${v.T}×10⁶)(${v.L * 1000})/[(${g(r.J)})(${v.G * 1000})] = ${g(r.thetaRad)} rad = ${g(r.thetaRad)}(180/π) = ${f(r.thetaDeg)}°.`,
    `Angular speed: ω = 2πN/60 = 2π(${v.N})/60 = ${g(r.omega)} rad/s. Power: P = Tω = (${v.T})(${g(r.omega)}) = ${f(r.power)} kW (kN·m × rad/s = kW).`,
  ],

  refs: ['Torsion of circular shafts: τ = Tρ/J, θ = TL/(JG)', 'Power transmission: P = Tω, ω = 2πN/60'],

  // Hand-solved: tau = 16(6e6)/(pi*80^3) = 59.68 MPa; J = 4.0212e6 mm^4;
  // theta = 6e6(2000)/(4.0212e6*80000) = 0.037302 rad = 2.137 deg; P = 2pi(400)(6)/60 = 251.3 kW.
  reference_instance: {
    vars: { d: 80, L: 2, T: 6, G: 80, N: 400 },
    answers: ['59.7', '2.14', '251'],
  },

  status: 'draft',
  bank_version: null,
};

// HGE-SOIL-TRIAX-001 — drained triaxial test on a cohesionless soil.
// Situation, no figure. Original scenario and wording (ROADMAP §3).
import { triaxialCohesionless } from '../../../js/models/triaxialCohesionless.js';
import { formatSig } from '../../../js/engine/format.js';

const f = (x) => formatSig(x, 3);
const g = (x) => formatSig(x, 5);
const deg = (x) => (x * 180) / Math.PI;
const rad = (x) => (x * Math.PI) / 180;

export default {
  id: 'HGE-SOIL-TRIAX-001',
  subject: 'HGE',
  topic: 'Soil Strength and Tests',
  topic_id: 'hge.soil-strength-and-tests',
  subtopic_id: 'hge.soil-strength-and-tests.lab-shear-tests',
  archetype: 'Drained triaxial test on sand: friction angle, shear and normal stress on the failure plane',
  format: 'situation',
  board_frequency: '7/7 sittings', // the topic's count in content/frequency.json
  difficulty: 2,

  vars: {
    sigma3: { min: 50, max: 300, step: 10, unit: 'kPa' },
    deviator: { min: 100, max: 700, step: 10, unit: 'kPa' },
  },
  constraints: [
    { rule: 'friction angle between 26 and 42 degrees (a realistic sand)', test: (v) => { const s = v.deviator / (v.deviator + 2 * v.sigma3); return s >= Math.sin(rad(26)) && s <= Math.sin(rad(42)); } },
  ],

  stem: 'A consolidated-drained triaxial test is run on a specimen of clean river sand taken from a proposed bridge '
    + 'abutment site. The cell pressure is held at {sigma3} kPa, and the specimen fails when the deviator stress reaches '
    + '{deviator} kPa. Treat the sand as cohesionless.',

  figure: null,
  model: triaxialCohesionless,
  live: null,

  items: [
    {
      ask: 'Determine the angle of internal friction of the sand.',
      pick: 'phi', unit: '°', sig: 3,
      distractors: [
        { name: 'usedTangentInsteadOfSine', value: (v, r) => deg(Math.atan(r.radius / r.centre)) },
        { name: 'dividedDeviatorByMajorStress', value: (v, r) => deg(Math.asin(v.deviator / r.sigma1)) },
        { name: 'gaveFailurePlaneAngle', value: (v, r) => r.theta },
        { name: 'usedDeviatorAsMajorStress', value: (v) => deg(Math.asin(Math.abs(v.deviator - v.sigma3) / (v.deviator + v.sigma3))) },
        { name: 'usedRatioOfPrincipalStresses', value: (v, r) => deg(Math.asin(v.sigma3 / r.sigma1)) },
      ],
    },
    {
      ask: 'Determine the shear stress on the failure plane at failure.',
      pick: 'tauF', unit: 'kPa', sig: 3,
      distractors: [
        { name: 'gaveMaximumShearStress', value: (v, r) => r.radius },
        { name: 'usedSineOfPhi', value: (v, r) => r.radius * Math.sin(rad(r.phi)) },
        { name: 'usedMeanStressTimesTanPhi', value: (v, r) => r.centre * Math.tan(rad(r.phi)) },
        { name: 'usedCellPressureTimesTanPhi', value: (v, r) => v.sigma3 * Math.tan(rad(r.phi)) },
        { name: 'gaveDeviatorStress', value: (v) => v.deviator },
      ],
    },
    {
      ask: 'Determine the normal stress on the failure plane at failure.',
      pick: 'sigmaF', unit: 'kPa', sig: 3,
      distractors: [
        { name: 'gaveMeanPrincipalStress', value: (v, r) => r.centre },
        { name: 'addedInsteadOfSubtracted', value: (v, r) => r.centre + r.radius * Math.sin(rad(r.phi)) },
        { name: 'usedCosineOfPhi', value: (v, r) => r.centre - r.radius * Math.cos(rad(r.phi)) },
        { name: 'gaveCellPressure', value: (v) => v.sigma3 },
        { name: 'gaveMajorPrincipalStress', value: (v, r) => r.sigma1 },
      ],
    },
  ],

  solution: (v, r) => [
    `Principal stresses at failure: σ<sub>3</sub> = ${v.sigma3} kPa (cell pressure); σ<sub>1</sub> = σ<sub>3</sub> + deviator stress = ${v.sigma3} + ${v.deviator} = ${r.sigma1} kPa.`,
    `Mohr circle: centre = (σ<sub>1</sub> + σ<sub>3</sub>)/2 = ${r.centre} kPa; radius = (σ<sub>1</sub> − σ<sub>3</sub>)/2 = ${r.radius} kPa.`,
    `With c = 0 the failure envelope passes through the origin and is tangent to the circle, so sin φ = radius/centre = ${r.radius}/${r.centre} = ${g(r.radius / r.centre)}, φ = ${f(r.phi)}°.`,
    `The failure plane makes θ = 45° + φ/2 = ${f(r.theta)}° with the major principal plane; the tangent point is at 2θ = 90° + φ on the circle.`,
    `Shear stress there: τ<sub>f</sub> = radius·sin 2θ = radius·cos φ = (${r.radius}) cos ${g(r.phi)}° = ${f(r.tauF)} kPa.`,
    `Normal stress there: σ<sub>f</sub> = centre + radius·cos 2θ = centre − radius·sin φ = ${r.centre} − (${r.radius})(${g(r.radius / r.centre)}) = ${f(r.sigmaF)} kPa. Check: σ<sub>f</sub> tan φ = ${f(r.sigmaF * Math.tan(rad(r.phi)))} kPa = τ<sub>f</sub>.`,
  ],

  refs: ['Mohr–Coulomb failure criterion: τf = c + σ tan φ', 'Mohr circle of stress; failure plane at 45° + φ/2 from the major principal plane'],

  // Hand-solved: sigma1 = 300; centre 200, radius 100; sin(phi) = 0.5, phi = 30.0 deg;
  // tau_f = 100 cos 30 = 86.6; sigma_f = 200 - 100(0.5) = 150; check 150 tan 30 = 86.6.
  reference_instance: {
    vars: { sigma3: 100, deviator: 200 },
    answers: ['30.0', '86.6', '150'],
  },

  status: 'draft',
  bank_version: null,
};

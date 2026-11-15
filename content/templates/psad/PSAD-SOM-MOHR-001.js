// PSAD-SOM-MOHR-001 — plane stress: principal stress, maximum shear, direction.
// Situation, no figure. Original scenario and wording (ROADMAP §3).
import { mohrPlane } from '../../../js/models/mohrPlane.js';
import { formatSig } from '../../../js/engine/format.js';

const f = (x) => formatSig(x, 3);
const g = (x) => formatSig(x, 5);
const deg = (x) => (x * 180) / Math.PI;

export default {
  id: 'PSAD-SOM-MOHR-001',
  subject: 'PSAD',
  topic: 'Strength of Materials',
  topic_id: 'psad.strength-of-materials',
  subtopic_id: 'psad.strength-of-materials.combined-stress',
  archetype: 'Plane stress element: larger principal stress, maximum in-plane shear stress, principal angle',
  format: 'situation',
  board_frequency: '7/7 sittings', // the topic's count in content/frequency.json
  difficulty: 2,

  vars: {
    sx: { min: 40, max: 120, step: 10, unit: 'MPa' },
    sy: { min: 10, max: 60, step: 10, unit: 'MPa' },
    txy: { min: 10, max: 60, step: 5, unit: 'MPa' },
  },
  constraints: [
    { rule: 'sx >= sy + 20', test: (v) => v.sx >= v.sy + 20 },
  ],

  stem: 'Strain-gauge readings at a point on the web of a steel plate girder reduce to this state of plane stress: '
    + 'σ<sub>x</sub> = {sx} MPa and σ<sub>y</sub> = {sy} MPa, both tensile, with a shear stress τ<sub>xy</sub> = {txy} MPa.',

  figure: null,
  model: mohrPlane,
  live: null,

  items: [
    {
      ask: 'Determine the larger principal stress at the point.',
      pick: 's1', unit: 'MPa', sig: 3,
      distractors: [
        { name: 'forgotToHalveTheStressDifference', value: (v, r) => r.avg + Math.hypot(v.sx - v.sy, v.txy) },
        { name: 'addedShearToAverageStress', value: (v, r) => r.avg + v.txy },
        { name: 'addedShearToLargerNormalStress', value: (v) => v.sx + v.txy },
        { name: 'gaveRadiusOfCircle', value: (v, r) => r.R },
        { name: 'assumedGivenStressIsPrincipal', value: (v) => v.sx },
      ],
    },
    {
      ask: 'Determine the maximum in-plane shear stress at the point.',
      pick: 'tauMax', unit: 'MPa', sig: 3,
      distractors: [
        { name: 'gaveTheGivenShearStress', value: (v) => v.txy },
        { name: 'forgotToHalveTheStressDifference', value: (v) => Math.hypot(v.sx - v.sy, v.txy) },
        { name: 'ignoredTheShearStress', value: (v) => (v.sx - v.sy) / 2 },
        { name: 'gaveAverageNormalStress', value: (v, r) => r.avg },
        { name: 'halvedTheLargerPrincipalStress', value: (v, r) => r.s1 / 2 },
      ],
    },
    {
      ask: 'Determine the angle between the x-axis and the direction of the larger principal stress.',
      pick: 'thetaP', unit: '°', sig: 3,
      distractors: [
        { name: 'forgotToHalveTheAngle', value: (v, r) => 2 * r.thetaP },
        { name: 'gavePlaneOfMaximumShear', value: (v, r) => r.thetaP + 45 },
        { name: 'forgotTheTwoOnShear', value: (v) => deg(Math.atan(v.txy / (v.sx - v.sy))) / 2 },
        { name: 'usedSumOfNormalStresses', value: (v) => deg(Math.atan((2 * v.txy) / (v.sx + v.sy))) / 2 },
        { name: 'gaveComplementaryAngle', value: (v, r) => 90 - r.thetaP },
      ],
    },
  ],

  solution: (v, r) => [
    `Centre of Mohr's circle: σ<sub>avg</sub> = (σ<sub>x</sub> + σ<sub>y</sub>)/2 = (${v.sx} + ${v.sy})/2 = ${g(r.avg)} MPa.`,
    `Radius: R = √{[(σ<sub>x</sub> − σ<sub>y</sub>)/2]² + τ<sub>xy</sub>²} = √[(${(v.sx - v.sy) / 2})² + (${v.txy})²] = ${g(r.R)} MPa.`,
    `Principal stresses: σ<sub>1</sub> = σ<sub>avg</sub> + R = ${g(r.avg)} + ${g(r.R)} = ${f(r.s1)} MPa; σ<sub>2</sub> = σ<sub>avg</sub> − R = ${formatSig(r.s2, 3)} MPa.`,
    `Maximum in-plane shear stress equals the radius: τ<sub>max</sub> = ${f(r.tauMax)} MPa, on planes at 45° to the principal planes.`,
    `Principal direction: tan 2θ<sub>p</sub> = 2τ<sub>xy</sub>/(σ<sub>x</sub> − σ<sub>y</sub>) = ${2 * v.txy}/${v.sx - v.sy}, so 2θ<sub>p</sub> = ${g(2 * r.thetaP)}° and θ<sub>p</sub> = ${f(r.thetaP)}°, measured from the x-axis toward the positive shear.`,
  ],

  refs: ['Transformation of plane stress; Mohr’s circle', 'σ1,2 = σavg ± R;  τmax = R;  tan 2θp = 2τxy/(σx − σy)'],

  // Hand-solved: avg = 50; R = sqrt(30^2 + 40^2) = 50; s1 = 100; tau_max = 50;
  // tan(2 theta) = 80/60 -> 2 theta = 53.13 deg, theta = 26.57 deg.
  reference_instance: {
    vars: { sx: 80, sy: 20, txy: 40 },
    answers: ['100', '50.0', '26.6'],
  },

  status: 'draft',
  bank_version: null,
};

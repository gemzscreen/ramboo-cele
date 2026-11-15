// PSAD-EM-FRICTION-001 — crate on a rough ramp, force parallel to the ramp.
// Situation, no figure. Original scenario and wording (ROADMAP §3).
import { frictionIncline } from '../../../js/models/frictionIncline.js';
import { formatSig } from '../../../js/engine/format.js';

const f = (x) => formatSig(x, 3);
const g = (x) => formatSig(x, 5);
const rad = (d) => (d * Math.PI) / 180;
const deg = (r) => (r * 180) / Math.PI;

export default {
  id: 'PSAD-EM-FRICTION-001',
  subject: 'PSAD',
  topic: 'Engineering Mechanics',
  topic_id: 'psad.engineering-mechanics',
  subtopic_id: 'psad.engineering-mechanics.friction',
  archetype: 'Block on a rough incline with a force parallel to the slope: force to start it up, force to hold it, angle of repose',
  format: 'situation',
  board_frequency: '7/7 sittings', // the topic's count in content/frequency.json
  difficulty: 1,

  vars: {
    W: { min: 2, max: 10, step: 0.5, unit: 'kN' },
    theta: { min: 25, max: 45, step: 5, unit: 'deg' },
    mu: { min: 0.15, max: 0.4, step: 0.05, unit: '' },
  },
  constraints: [
    // Steep enough that the crate would slide by itself, so the holding force is a real, positive number.
    { rule: 'tan(theta) >= mu + 0.15', test: (v) => Math.tan(rad(v.theta)) >= v.mu + 0.15 },
  ],

  stem: 'A crate of floor tiles weighing {W} kN rests on a timber loading ramp inclined at {theta}° to the horizontal. '
    + 'It is controlled by a winch cable that pulls parallel to the ramp, up the slope. The coefficient of static friction '
    + 'between the crate and the ramp is {mu}.',

  figure: null,
  model: frictionIncline,
  live: null,

  items: [
    {
      ask: 'Determine the cable force needed to start the crate moving up the ramp.',
      pick: 'Pup', unit: 'kN', sig: 3,
      distractors: [
        { name: 'ignoredFriction', value: (v, r) => r.pull },
        { name: 'frictionActedTheWrongWay', value: (v, r) => r.Phold },
        { name: 'usedFullWeightAsNormalForce', value: (v, r) => r.pull + v.mu * v.W },
        { name: 'swappedSineAndCosine', value: (v) => v.W * (Math.cos(rad(v.theta)) + v.mu * Math.sin(rad(v.theta))) },
        { name: 'gaveFrictionForceOnly', value: (v, r) => r.Fmax },
      ],
    },
    {
      ask: 'Determine the least cable force that keeps the crate from sliding down the ramp.',
      pick: 'Phold', unit: 'kN', sig: 3,
      distractors: [
        { name: 'ignoredFriction', value: (v, r) => r.pull },
        { name: 'frictionActedTheWrongWay', value: (v, r) => r.Pup },
        { name: 'usedFullWeightAsNormalForce', value: (v, r) => r.pull - v.mu * v.W },
        { name: 'gaveFrictionForceOnly', value: (v, r) => r.Fmax },
        { name: 'swappedSineAndCosine', value: (v) => v.W * (Math.cos(rad(v.theta)) - v.mu * Math.sin(rad(v.theta))) },
        { name: 'gaveNormalForce', value: (v, r) => r.N },
      ],
    },
    {
      ask: 'With the cable removed, determine the steepest ramp angle at which the crate would stay in place.',
      pick: 'repose', unit: '°', sig: 3,
      distractors: [
        { name: 'gaveComplementaryAngle', value: (v, r) => 90 - r.repose },
        { name: 'gaveTheRampAngle', value: (v) => v.theta },
        { name: 'usedInverseSine', value: (v) => deg(Math.asin(v.mu)) },
        { name: 'subtractedFromRampAngle', value: (v, r) => v.theta - r.repose },
        { name: 'usedInverseCosine', value: (v) => deg(Math.acos(v.mu)) },
      ],
    },
  ],

  solution: (v, r) => [
    `Resolve the weight: normal to the ramp N = W cos θ = ${v.W} cos ${v.theta}° = ${g(r.N)} kN; along the ramp W sin θ = ${v.W} sin ${v.theta}° = ${g(r.pull)} kN, acting down the slope.`,
    `Limiting friction: F = μN = (${v.mu})(${g(r.N)}) = ${g(r.Fmax)} kN. It always opposes the motion that is about to happen.`,
    `Motion impending up the ramp: friction acts down the slope with the weight component. P = W sin θ + μN = ${g(r.pull)} + ${g(r.Fmax)} = ${f(r.Pup)} kN.`,
    `Motion impending down the ramp: friction acts up the slope and helps the cable. P = W sin θ − μN = ${g(r.pull)} − ${g(r.Fmax)} = ${f(r.Phold)} kN.`,
    `With no cable the crate stays as long as W sin θ ≤ μW cos θ, that is tan θ ≤ μ. The limit is θ = tan⁻¹(${v.mu}) = ${f(r.repose)}° (the angle of repose). The ramp, at ${v.theta}°, is steeper than this, which is why a holding force is needed.`,
  ],

  refs: ['Statics: dry (Coulomb) friction, F ≤ μN; impending motion', 'Angle of repose: tan φ = μ'],

  // Hand-solved: N = 5 cos 35 = 4.0958; W sin 35 = 2.8679; F = 0.30(4.0958) = 1.2287;
  // up: 2.8679 + 1.2287 = 4.0966; hold: 2.8679 - 1.2287 = 1.6392; repose = atan 0.30 = 16.70 deg.
  reference_instance: {
    vars: { W: 5, theta: 35, mu: 0.3 },
    answers: ['4.10', '1.64', '16.7'],
  },

  status: 'draft',
  bank_version: null,
};

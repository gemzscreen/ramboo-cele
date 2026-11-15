// MSTE-PHYS-PROJ-001 — projectile released above level ground.
// Standalone item, no figure. Original scenario and wording (ROADMAP §3).
import { projectileFromHeight } from '../../../js/models/projectileFromHeight.js';
import { formatSig } from '../../../js/engine/format.js';

const f = (x) => formatSig(x, 3);
const g5 = (x) => formatSig(x, 5);
const G = 9.81;
const rad = (deg) => (deg * Math.PI) / 180;

export default {
  id: 'MSTE-PHYS-PROJ-001',
  subject: 'MSTE',
  topic: 'Physics for Engineers',
  topic_id: 'mste.physics-for-engineers',
  subtopic_id: 'mste.physics-for-engineers.mechanics',
  archetype: 'Projectile launched at an angle from a height: horizontal distance to landing',
  format: 'single',
  board_frequency: '7/7 sittings', // the topic's count in content/frequency.json
  difficulty: 2,

  vars: {
    v0: { min: 12, max: 30, step: 2, unit: 'm/s' },
    theta: { min: 20, max: 60, step: 5, unit: 'deg' },
    h: { min: 8, max: 40, step: 4, unit: 'm' },
  },
  constraints: [],

  stem: 'During a demolition, a fragment of concrete breaks away from the edge of a roof slab {h} m above level '
    + 'ground. It leaves at {v0} m/s, directed {theta}° above the horizontal. Neglect air resistance and take g = 9.81 m/s². '
    + 'The safety officer needs to know how far from the building to set the exclusion fence.',

  figure: null,
  model: projectileFromHeight,
  live: null,

  items: [
    {
      ask: 'Determine the horizontal distance from the point directly below the roof edge to where the fragment lands.',
      pick: 'range', unit: 'm', sig: 3,
      distractors: [
        { name: 'usedLevelGroundRangeFormula', value: (v) => (v.v0 ** 2 * Math.sin(rad(2 * v.theta))) / G },
        { name: 'tookWrongSignOfLaunchVelocity', value: (v, r) => (r.vx * (Math.sqrt(r.vy ** 2 + 2 * G * v.h) - r.vy)) / G },
        { name: 'ignoredVerticalLaunchVelocity', value: (v, r) => r.vx * Math.sqrt((2 * v.h) / G) },
        { name: 'usedFullSpeedAsHorizontal', value: (v, r) => v.v0 * r.tFlight },
        { name: 'swappedSineAndCosine', value: (v) => { const vx = v.v0 * Math.sin(rad(v.theta)); const vy = v.v0 * Math.cos(rad(v.theta)); return (vx * (vy + Math.sqrt(vy * vy + 2 * G * v.h))) / G; } },
        { name: 'stoppedAtLaunchLevel', value: (v, r) => (r.vx * 2 * r.vy) / G },
      ],
    },
  ],

  solution: (v, r) => [
    `Resolve the launch velocity: v<sub>x</sub> = ${v.v0} cos ${v.theta}° = ${g5(r.vx)} m/s (constant); v<sub>y</sub> = ${v.v0} sin ${v.theta}° = ${g5(r.vy)} m/s upward.`,
    `Vertical motion, measuring y up from the ground: y = ${v.h} + ${g5(r.vy)}t − ½(9.81)t². The fragment lands when y = 0: 4.905t² − ${g5(r.vy)}t − ${v.h} = 0.`,
    `Positive root: t = [v<sub>y</sub> + √(v<sub>y</sub>² + 2gh)]/g = [${g5(r.vy)} + √(${g5(r.vy ** 2)} + ${g5(2 * G * v.h)})]/9.81 = ${g5(r.tFlight)} s.`,
    `Horizontal distance: x = v<sub>x</sub>t = (${g5(r.vx)})(${g5(r.tFlight)}) = ${f(r.range)} m.`,
    `The level-ground formula v₀² sin 2θ/g does not apply here, because the landing point is ${v.h} m below the launch point.`,
  ],

  refs: ['Kinematics of a particle: projectile motion with constant acceleration'],

  // Hand-solved: vx = 17.3205, vy = 10; t = [10 + sqrt(100 + 2(9.81)(16))]/9.81 = (10 + 20.345)/9.81 = 3.0933 s;
  // x = 17.3205(3.0933) = 53.58 m.
  reference_instance: {
    vars: { v0: 20, theta: 30, h: 16 },
    answers: ['53.6'],
  },

  status: 'draft',
  bank_version: null,
};

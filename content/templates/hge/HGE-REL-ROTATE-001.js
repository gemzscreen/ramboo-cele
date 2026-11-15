// HGE-REL-ROTATE-001 — open cylinder of liquid rotating about its axis.
// Situation, no figure. Original scenario and wording (ROADMAP §3).
import { rotatingCylinder } from '../../../js/models/rotatingCylinder.js';
import { formatSig } from '../../../js/engine/format.js';

const f = (x) => formatSig(x, 3);
const g = (x) => formatSig(x, 5);
const G = 9.81;
const rpm = (omega) => (omega * 60) / (2 * Math.PI);

export default {
  id: 'HGE-REL-ROTATE-001',
  subject: 'HGE',
  topic: 'Relative Equilibrium of Liquids',
  topic_id: 'hge.relative-equilibrium-of-liquids',
  subtopic_id: 'hge.relative-equilibrium-of-liquids.rotation-vessels',
  archetype: 'Open cylinder rotating about its axis: height of the paraboloid, depth at the axis, speed at which it spills',
  format: 'situation',
  board_frequency: '5/7 sittings', // the topic's count in content/frequency.json
  difficulty: 2,

  vars: {
    D: { min: 0.8, max: 2, step: 0.2, unit: 'm' },
    H: { min: 1.5, max: 3, step: 0.5, unit: 'm' },
    d: { min: 1, max: 2.5, step: 0.25, unit: 'm' },
    N: { min: 30, max: 90, step: 10, unit: 'rev/min' },
  },
  constraints: [
    { rule: 'at least 0.25 m of freeboard at rest', test: (v) => v.d <= v.H - 0.25 },
    // More than half full, so the water reaches the rim before the bottom is uncovered.
    { rule: 'd >= H/2 + 0.1', test: (v) => v.d >= v.H / 2 + 0.1 },
    { rule: 'no spill at the given speed, and a paraboloid at least 0.1 m high', test: (v) => { const r = rotatingCylinder(v); return !r.spills && r.h >= 0.1 && r.depthAtWall <= v.H - 0.03; } },
  ],

  stem: 'An open cylindrical mixing drum {D} m in inside diameter and {H} m high stands upright and holds water to a '
    + 'depth of {d} m. It is spun about its vertical axis at a steady {N} rev/min until the water turns with it as a '
    + 'rigid body. Take g = 9.81 m/s².',

  figure: null,
  model: rotatingCylinder,
  live: null,

  items: [
    {
      ask: 'Determine the vertical distance between the lowest and highest points of the water surface.',
      pick: 'h', unit: 'm', sig: 3,
      distractors: [
        { name: 'gaveRiseAtTheWallOnly', value: (v, r) => r.h / 2 },
        { name: 'usedDiameterAsRadius', value: (v, r) => 4 * r.h },
        { name: 'forgotTheTwoInTwoG', value: (v, r) => 2 * r.h },
        { name: 'usedRevolutionsPerSecondAsAngularSpeed', value: (v, r) => ((v.N / 60) ** 2 * r.r ** 2) / (2 * G) },
        { name: 'forgotToSquareTheRadius', value: (v, r) => (r.omega ** 2 * r.r) / (2 * G) },
      ],
    },
    {
      ask: 'Determine the depth of water on the axis of the drum while it is spinning.',
      pick: 'depthAtAxis', unit: 'm', sig: 3,
      distractors: [
        { name: 'subtractedTheWholeParaboloidHeight', value: (v, r) => v.d - r.h },
        { name: 'gaveDepthAtTheWall', value: (v, r) => r.depthAtWall },
        { name: 'assumedDepthUnchanged', value: (v) => v.d },
        { name: 'subtractedQuarterOfParaboloidHeight', value: (v, r) => v.d - r.h / 4 },
        { name: 'measuredDownFromTheRim', value: (v, r) => v.H - r.h },
      ],
    },
    {
      ask: 'Determine the highest speed at which the drum can turn without spilling water.',
      pick: 'Nspill', unit: 'rev/min', sig: 3,
      distractors: [
        { name: 'setParaboloidHeightEqualToFreeboard', value: (v, r) => r.Nspill / Math.SQRT2 },
        { name: 'leftAnswerInRadiansPerSecond', value: (v, r) => r.omegaSpill },
        { name: 'usedDiameterAsRadius', value: (v, r) => r.Nspill / 2 },
        { name: 'usedSpeedThatUncoversTheBottom', value: (v, r) => rpm(Math.sqrt(2 * G * 2 * v.d) / r.r) },
        { name: 'usedFullHeightOfDrum', value: (v, r) => rpm(Math.sqrt(2 * G * v.H) / r.r) },
      ],
    },
  ],

  solution: (v, r) => [
    `Angular speed: ω = 2πN/60 = 2π(${v.N})/60 = ${g(r.omega)} rad/s. Radius: r = ${v.D}/2 = ${g(r.r)} m.`,
    `In rigid-body rotation the free surface is a paraboloid. Its height from the axis to the wall is h = ω²r²/(2g) = (${g(r.omega)})²(${g(r.r)})²/[2(9.81)] = ${f(r.h)} m.`,
    `A paraboloid holds half the volume of the cylinder around it, so with no water lost the surface drops h/2 on the axis and rises h/2 at the wall. Depth on the axis = ${v.d} − ${g(r.h)}/2 = ${f(r.depthAtAxis)} m; at the wall, ${v.d} + ${g(r.h)}/2 = ${f(r.depthAtWall)} m, below the ${v.H} m rim.`,
    `Water reaches the rim when h/2 equals the freeboard at rest: h = 2(${v.H} − ${v.d}) = ${g(2 * (v.H - v.d))} m.`,
    `Then ω = √(2gh)/r = √[2(9.81)(${g(2 * (v.H - v.d))})]/${g(r.r)} = ${g(r.omegaSpill)} rad/s, and N = 60ω/(2π) = ${f(r.Nspill)} rev/min.`,
  ],

  refs: ['Relative equilibrium, forced vortex: z = ω²x²/(2g)', 'Volume of a paraboloid = half the circumscribing cylinder'],

  // Hand-solved: w = 6.28319 rad/s; r = 0.6; h = 39.478(0.36)/19.62 = 0.7244 m; axis depth = 1.5 - 0.3622 = 1.138 m;
  // spill: h = 2(0.5) = 1.0; w = sqrt(19.62)/0.6 = 7.3824 rad/s = 70.50 rev/min.
  reference_instance: {
    vars: { D: 1.2, H: 2, d: 1.5, N: 60 },
    answers: ['0.724', '1.14', '70.5'],
  },

  status: 'draft',
  bank_version: null,
};

// MSTE-PHYS-SPRING-001 — block sliding down a rough slope onto a spring (work and energy).
// Standalone item, no figure. Original scenario and wording (ROADMAP §3).
import { springSlide, compressionFor, G } from '../../../js/models/springSlide.js';
import { formatSig } from '../../../js/engine/format.js';

const f = (x) => formatSig(x, 4);
const th = (deg) => (deg * Math.PI) / 180;

export default {
  id: 'MSTE-PHYS-SPRING-001',
  subject: 'MSTE',
  topic: 'Physics for Engineers',
  topic_id: 'mste.physics-for-engineers',
  subtopic_id: 'mste.physics-for-engineers.mechanics',
  archetype: 'Work-energy: block on a rough incline compressing a spring',
  format: 'single',
  board_frequency: '7/7 sittings', // the topic's count in content/frequency.json
  difficulty: 3,

  vars: {
    m: { min: 2, max: 6, step: 1, unit: 'kg' },
    theta: { min: 25, max: 40, step: 5, unit: '°' },
    mu: { min: 0.1, max: 0.25, step: 0.05, unit: '' },
    d: { min: 1, max: 3, step: 0.5, unit: 'm' },
    k: { min: 400, max: 1200, step: 100, unit: 'N/m' },
  },
  constraints: [],

  stem: 'A {m} kg block is released from rest on a rough slope inclined at {theta}° to the horizontal. It slides {d} m down the slope to the free end of a light '
    + 'spring of stiffness {k} N/m that lies along the slope with its lower end fixed, and then compresses the spring. The coefficient of kinetic friction '
    + 'between the block and the slope is {mu}. Take g = 9.81 m/s² and neglect the mass of the spring.',

  figure: null,
  model: springSlide,
  live: null,

  items: [
    {
      ask: 'Determine the maximum compression of the spring.',
      pick: 'xMm', unit: 'mm', sig: 3,
      distractors: [
        { name: 'ignoredWorkDoneWhileCompressing', value: (v, r) => 1000 * Math.sqrt((2 * r.a * v.d) / v.k) },
        { name: 'ignoredFriction', value: (v) => 1000 * compressionFor(v.m * G * Math.sin(th(v.theta)), v.k, v.d) },
        { name: 'swappedSineAndCosineOfSlope', value: (v) => 1000 * compressionFor(v.m * G * (Math.cos(th(v.theta)) - v.mu * Math.sin(th(v.theta))), v.k, v.d) },
        { name: 'droppedHalfFromSpringEnergy', value: (v, r) => 1000 * compressionFor(r.a, v.k, v.d, 1) },
        { name: 'tookStaticEquilibriumCompression', value: (v, r) => 1000 * r.equilibriumCompression },
      ],
    },
  ],

  solution: (v, r) => [
    `Force down the slope after friction: a = mg(sinθ − μcosθ) = ${v.m}(9.81)(sin ${v.theta}° − ${v.mu} cos ${v.theta}°) = ${f(r.a)} N.`,
    `The block moves ${v.d} m plus the compression x before it stops, so the net work done on it is a(${v.d} + x). It ends at rest with the spring holding ½kx².`,
    `Work-energy: a(${v.d} + x) = ½(${v.k})x², i.e. ${v.k / 2}x² − ${f(r.a)}x − ${f(r.a * v.d)} = 0.`,
    `Positive root: x = [a + √(a² + 2kad)]/k = ${f(r.x)} m = ${f(r.xMm)} mm.`,
  ],

  refs: ['Physics: work-energy theorem; kinetic friction F = μN; spring energy ½kx²'],

  // Hand-solved: a = 4(9.81)(0.5 − 0.2(0.866025)) = 12.8230 N; x = [12.8230 + √(164.43 + 41033.6)]/800 = (12.8230 + 202.977)/800 = 0.26975 m.
  reference_instance: {
    vars: { m: 4, theta: 30, mu: 0.2, d: 2, k: 800 },
    answers: ['270'],
  },

  status: 'draft',
  bank_version: null,
};

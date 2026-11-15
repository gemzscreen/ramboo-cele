// MSTE-HWY-SSD-001 — stopping sight distance on a downgrade.
// Standalone item, no figure. Original scenario and wording (ROADMAP §3).
import { stoppingSight } from '../../../js/models/stoppingSight.js';
import { formatSig } from '../../../js/engine/format.js';

const f = (x) => formatSig(x, 3);
const g = (x) => formatSig(x, 5);
const T = 2.5;
const model = (v) => stoppingSight({ V: v.V, t: T, f: v.f, G: -v.G });
const braking = (v, net) => (v.V / 3.6) ** 2 / (2 * 9.81 * net);

export default {
  id: 'MSTE-HWY-SSD-001',
  subject: 'MSTE',
  topic: 'Highway Engineering',
  topic_id: 'mste.highway-engineering',
  subtopic_id: 'mste.highway-engineering.geometric-design',
  archetype: 'Stopping sight distance on a grade from speed, reaction time and friction coefficient',
  format: 'single',
  board_frequency: '7/7 sittings', // the topic's count in content/frequency.json
  difficulty: 2,

  vars: {
    V: { min: 50, max: 110, step: 5, unit: 'km/h' },
    f: { min: 0.28, max: 0.4, step: 0.01, unit: '' },
    G: { min: 2, max: 6, step: 1, unit: '%' },
  },
  constraints: [],

  stem: 'A section of a national road descends on a {G}% grade. The design speed is {V} km/h, the coefficient of '
    + 'friction between tyres and wet pavement is {f}, and the perception-reaction time is 2.5 s. Take g = 9.81 m/s².',

  figure: null,
  model,
  live: null,

  items: [
    {
      ask: 'Determine the stopping sight distance for vehicles travelling downhill.',
      pick: 'ssd', unit: 'm', sig: 3,
      distractors: [
        { name: 'ignoredTheGrade', value: (v, r) => r.reaction + braking(v, v.f) },
        { name: 'treatedDowngradeAsUpgrade', value: (v, r) => r.reaction + braking(v, v.f + v.G / 100) },
        { name: 'gaveBrakingDistanceOnly', value: (v, r) => r.braking },
        { name: 'forgotTheTwoInBrakingTerm', value: (v, r) => r.reaction + 2 * r.braking },
        { name: 'gaveReactionDistanceOnly', value: (v, r) => r.reaction },
      ],
    },
  ],

  solution: (v, r) => [
    `Convert the speed: v = ${v.V}/3.6 = ${g(r.v)} m/s.`,
    `Distance travelled during perception and reaction: d<sub>1</sub> = vt = (${g(r.v)})(2.5) = ${g(r.reaction)} m.`,
    `Braking on a downgrade: gravity works against the brakes, so the grade is subtracted from the friction coefficient. d<sub>2</sub> = v²/[2g(f − G)] = (${g(r.v)})²/[2(9.81)(${v.f} − ${v.G / 100})] = ${g(r.braking)} m.`,
    `Stopping sight distance: S = d<sub>1</sub> + d<sub>2</sub> = ${g(r.reaction)} + ${g(r.braking)} = ${f(r.ssd)} m.`,
    `On level ground the same vehicle would need ${f(r.reaction + braking(v, v.f))} m; uphill at ${v.G}%, ${f(r.reaction + braking(v, v.f + v.G / 100))} m.`,
  ],

  refs: ['Highway geometric design: stopping sight distance S = vt + v²/[2g(f ± G)]'],

  // Hand-solved: v = 22.222 m/s; reaction 55.556 m; braking 493.83/[2(9.81)(0.26)] = 96.807 m; S = 152.36 m.
  reference_instance: {
    vars: { V: 80, f: 0.3, G: 4 },
    answers: ['152'],
  },

  status: 'draft',
  bank_version: null,
};

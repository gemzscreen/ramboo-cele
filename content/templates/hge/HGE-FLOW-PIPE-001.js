// HGE-FLOW-PIPE-001 — friction loss in a pipeline, Darcy-Weisbach.
// Situation, no figure. Original scenario and wording (ROADMAP §3).
import { pipeDarcy } from '../../../js/models/pipeDarcy.js';
import { formatSig } from '../../../js/engine/format.js';

const f = (x) => formatSig(x, 3);
const g = (x) => formatSig(x, 5);

export default {
  id: 'HGE-FLOW-PIPE-001',
  subject: 'HGE',
  topic: 'Fluid Flow',
  topic_id: 'hge.fluid-flow',
  subtopic_id: 'hge.fluid-flow.pipe-friction',
  archetype: 'Single pipe, Darcy-Weisbach: mean velocity, friction head loss, power lost',
  format: 'situation',
  board_frequency: '7/7 sittings', // the topic's count in content/frequency.json
  difficulty: 1,

  vars: {
    D: { min: 100, max: 400, step: 50, unit: 'mm' },
    L: { min: 200, max: 1500, step: 100, unit: 'm' },
    Q: { min: 10, max: 120, step: 10, unit: 'L/s' },
    f: { min: 0.015, max: 0.03, step: 0.005, unit: '' },
  },
  constraints: [
    { rule: 'mean velocity between 0.6 and 3.5 m/s', test: (v) => { const V = v.Q / 1000 / ((Math.PI * (v.D / 1000) ** 2) / 4); return V >= 0.6 && V <= 3.5; } },
  ],

  stem: 'A straight steel main {L} m long and {D} mm in inside diameter carries {Q} L/s of water from a pumping '
    + 'station to a subdivision reservoir. The Darcy friction factor is {f}. Neglect minor losses and take the unit '
    + 'weight of water as 9.81 kN/m³.',

  figure: null,
  model: pipeDarcy,
  live: null,

  items: [
    {
      ask: 'Determine the mean velocity of flow in the pipe.',
      pick: 'V', unit: 'm/s', sig: 3,
      distractors: [
        { name: 'usedDiameterAsRadius', value: (v, r) => r.V / 4 },
        { name: 'forgotPiOverFour', value: (v, r) => (r.V * Math.PI) / 4 },
        { name: 'doubledTheFlowArea', value: (v, r) => r.V / 2 },
        { name: 'gaveVelocityHead', value: (v, r) => r.velocityHead },
        { name: 'usedRadiusAsDiameter', value: (v, r) => r.V * 4 },
      ],
    },
    {
      ask: 'Determine the head lost in friction over the length of the main.',
      pick: 'hf', unit: 'm', sig: 3,
      distractors: [
        { name: 'forgotTwoG', value: (v, r) => r.hf * 2 * 9.81 },
        { name: 'usedRadiusInLOverD', value: (v, r) => r.hf * 2 },
        { name: 'usedVelocityInsteadOfVelocitySquared', value: (v, r) => r.hf / r.V },
        { name: 'forgotToDivideByDiameter', value: (v, r) => (r.hf * v.D) / 1000 },
        { name: 'gaveHydraulicGradientPerHundredMetres', value: (v, r) => r.slope * 100 },
      ],
    },
    {
      ask: 'Determine the power dissipated in overcoming pipe friction.',
      pick: 'power', unit: 'kW', sig: 3,
      distractors: [
        { name: 'forgotUnitWeightOfWater', value: (v, r) => r.power / 9.81 },
        { name: 'convertedToHorsepowerWrongWay', value: (v, r) => r.power * 0.746 },
        { name: 'reportedHorsepowerAsKilowatts', value: (v, r) => r.power / 0.746 },
        { name: 'usedVelocityInPlaceOfDischarge', value: (v, r) => 9.81 * r.V * r.hf },
      ],
    },
  ],

  solution: (v, r) => [
    `Flow area: A = πD²/4 = π(${v.D / 1000})²/4 = ${g(r.area)} m². Discharge: Q = ${v.Q} L/s = ${v.Q / 1000} m³/s.`,
    `Continuity: V = Q/A = ${v.Q / 1000}/${g(r.area)} = ${f(r.V)} m/s.`,
    `Velocity head: V²/2g = (${g(r.V)})²/[2(9.81)] = ${g(r.velocityHead)} m.`,
    `Darcy–Weisbach: h<sub>f</sub> = f(L/D)(V²/2g) = (${v.f})(${v.L}/${v.D / 1000})(${g(r.velocityHead)}) = ${f(r.hf)} m.`,
    `Power lost: P = γQh<sub>f</sub> = (9.81)(${v.Q / 1000})(${g(r.hf)}) = ${f(r.power)} kW (kN/m³ × m³/s × m = kN·m/s).`,
  ],

  refs: ['Continuity: Q = AV', 'Darcy–Weisbach equation: hf = f (L/D) V²/(2g)', 'Fluid power: P = γ Q h'],

  // Hand-solved: A = pi(0.2^2)/4 = 0.0314159; V = 0.04/0.0314159 = 1.2732 m/s; V^2/2g = 0.082627 m;
  // hf = 0.02(2500)(0.082627) = 4.131 m; P = 9.81(0.04)(4.1313) = 1.621 kW.
  reference_instance: {
    vars: { D: 200, L: 500, Q: 40, f: 0.02 },
    answers: ['1.27', '4.13', '1.62'],
  },

  status: 'draft',
  bank_version: null,
};

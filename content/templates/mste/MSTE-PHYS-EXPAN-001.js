// MSTE-PHYS-EXPAN-001 — temperature at which a heated pipe closes its clearance.
// Standalone item, no figure. Original scenario and wording (ROADMAP §3).
import { thermalGap } from '../../../js/models/thermalGap.js';
import { formatSig } from '../../../js/engine/format.js';

const f = (x) => formatSig(x, 3);

export default {
  id: 'MSTE-PHYS-EXPAN-001',
  subject: 'MSTE',
  topic: 'Physics for Engineers',
  topic_id: 'mste.physics-for-engineers',
  subtopic_id: 'mste.physics-for-engineers.heat',
  archetype: 'Linear thermal expansion closing a clearance',
  format: 'single',
  board_frequency: '7/7 sittings', // the topic's count in content/frequency.json
  difficulty: 1,

  vars: {
    L: { min: 20, max: 60, step: 5, unit: 'm' },
    g: { min: 6, max: 20, step: 1, unit: 'mm' },
    T0: { min: 15, max: 30, step: 5, unit: '°C' },
    alpha: { min: 10, max: 24, step: 2, unit: '10⁻⁶/°C' },
  },
  constraints: [
    { rule: 'the temperature rise is between 15 and 70 °C', test: (v) => {
      const dT = v.g / 1000 / (v.alpha * 1e-6 * v.L);
      return dT >= 15 && dT <= 70;
    } },
  ],

  stem: 'A straight metal pipe {L} m long is laid on rollers at {T0} °C with a {g} mm clearance between its free end and a rigid concrete wall. '
    + 'The pipe’s material has a coefficient of linear expansion of {alpha} × 10⁻⁶ per °C, and the pipe is free to expand along its length '
    + 'toward the wall only.',

  figure: null,
  model: thermalGap,
  live: null,

  items: [
    {
      ask: 'At what pipe temperature does its end first touch the wall?',
      pick: 'Tfinal', unit: '°C', sig: 3,
      distractors: [
        { name: 'gaveOnlyTheTemperatureRise', value: (v, r) => r.dT },
        { name: 'readClearanceAsCentimetres', value: (v, r) => v.T0 + 10 * r.dT },
        { name: 'sharedClearanceBetweenTwoEnds', value: (v, r) => v.T0 + r.dT / 2 },
        { name: 'usedVolumetricCoefficient', value: (v, r) => v.T0 + r.dT / 3 },
        { name: 'tookCoefficientAsTenToTheMinusFive', value: (v, r) => v.T0 + r.dT / 10 },
      ],
    },
  ],

  solution: (v, r) => [
    `Expansion needed to close the gap: δ = ${v.g} mm = ${v.g / 1000} m.`,
    `Thermal expansion: δ = αLΔT, so ΔT = δ/(αL) = ${v.g / 1000}/[(${v.alpha} × 10⁻⁶)(${v.L})] = ${f(r.dT)} °C.`,
    `Temperature at contact: ${v.T0} + ${f(r.dT)} = ${f(r.Tfinal)} °C.`,
  ],

  refs: ['Physics: linear thermal expansion, ΔL = αLΔT'],

  // Hand-solved: ΔT = 0.009/(12e-6 × 30) = 0.009/0.00036 = 25 °C; T = 20 + 25 = 45 °C.
  reference_instance: {
    vars: { L: 30, g: 9, T0: 20, alpha: 12 },
    answers: ['45.0'],
  },

  status: 'draft',
  bank_version: null,
};

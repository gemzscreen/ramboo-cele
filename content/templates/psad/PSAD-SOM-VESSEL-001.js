// PSAD-SOM-VESSEL-001 — thin-walled cylindrical pressure vessel.
// Situation, no figure. Original scenario and wording (ROADMAP §3).
import { pressureVessel } from '../../../js/models/pressureVessel.js';
import { formatSig } from '../../../js/engine/format.js';

const f = (x) => formatSig(x, 3);

export default {
  id: 'PSAD-SOM-VESSEL-001',
  subject: 'PSAD',
  topic: 'Strength of Materials',
  topic_id: 'psad.strength-of-materials',
  subtopic_id: 'psad.strength-of-materials.pressure-vessels',
  archetype: 'Thin-walled cylinder under internal pressure: hoop stress, longitudinal stress, required wall thickness',
  format: 'situation',
  board_frequency: '7/7 sittings', // the topic's count in content/frequency.json
  difficulty: 1,

  vars: {
    D: { min: 600, max: 2000, step: 200, unit: 'mm' },
    t: { min: 8, max: 20, step: 2, unit: 'mm' },
    p: { min: 0.6, max: 2, step: 0.2, unit: 'MPa' },
    allow: { min: 80, max: 120, step: 20, unit: 'MPa' },
  },
  constraints: [
    { rule: 'thin wall: D/t >= 40', test: (v) => v.D / v.t >= 40 },
    { rule: 'hoop stress between 25 and 150 MPa', test: (v) => { const s = (v.p * v.D) / (2 * v.t); return s >= 25 && s <= 150; } },
    // The redesign must call for a clearly different wall, or the third item gives the first away.
    { rule: 'required thickness differs from the present one by at least 10%', test: (v) => Math.abs((v.p * v.D) / (2 * v.allow) - v.t) >= 0.1 * v.t },
  ],

  stem: 'A horizontal compressed-air receiver in a fabrication shop is a closed steel cylinder {D} mm in inside '
    + 'diameter with a wall {t} mm thick. Its working gauge pressure is {p} MPa. Treat it as a thin-walled vessel. '
    + 'A review of the design proposes limiting the tensile stress in the wall to {allow} MPa at the same pressure and diameter.',

  figure: null,
  model: pressureVessel,
  live: null,

  items: [
    {
      ask: 'Determine the circumferential (hoop) stress in the present wall.',
      pick: 'hoop', unit: 'MPa', sig: 3,
      distractors: [
        { name: 'gaveLongitudinalStress', value: (v, r) => r.longitudinal },
        { name: 'forgotTheTwo', value: (v, r) => 2 * r.hoop },
        { name: 'usedRadiusInLongitudinalFormula', value: (v, r) => r.hoop / 4 },
        { name: 'averagedHoopAndLongitudinal', value: (v, r) => 0.75 * r.hoop },
        { name: 'usedOutsideDiameter', value: (v) => (v.p * (v.D + 2 * v.t)) / (2 * v.t) },
      ],
    },
    {
      ask: 'Determine the longitudinal stress in the present wall.',
      pick: 'longitudinal', unit: 'MPa', sig: 3,
      distractors: [
        { name: 'gaveHoopStress', value: (v, r) => r.hoop },
        { name: 'usedRadiusForDiameter', value: (v, r) => r.longitudinal / 2 },
        { name: 'forgotTheFour', value: (v, r) => 4 * r.longitudinal },
        { name: 'addedHoopAndLongitudinal', value: (v, r) => 3 * r.longitudinal },
      ],
    },
    {
      ask: 'Determine the least wall thickness that meets the proposed stress limit.',
      pick: 'tRequired', unit: 'mm', sig: 3,
      distractors: [
        { name: 'designedForLongitudinalStress', value: (v, r) => r.tRequired / 2 },
        { name: 'forgotTheTwo', value: (v, r) => 2 * r.tRequired },
        { name: 'gavePresentThickness', value: (v) => v.t },
        { name: 'scaledByInverseStressRatio', value: (v, r) => (v.t * v.allow) / r.hoop },
        { name: 'usedRadiusTwice', value: (v, r) => r.tRequired / 4 },
      ],
    },
  ],

  solution: (v, r) => [
    `Hoop stress: cut the cylinder lengthwise. Pressure on the projected area D × 1 is resisted by two wall thicknesses: pD = 2σ<sub>h</sub>t, so σ<sub>h</sub> = pD/(2t) = (${v.p})(${v.D})/[2(${v.t})] = ${f(r.hoop)} MPa.`,
    `Longitudinal stress: cut across the cylinder. Pressure on the end, p·πD²/4, is resisted by the wall ring πDt: σ<sub>L</sub> = pD/(4t) = (${v.p})(${v.D})/[4(${v.t})] = ${f(r.longitudinal)} MPa, half the hoop stress.`,
    `The hoop stress is the larger, so it sets the thickness: t = pD/(2σ<sub>allow</sub>) = (${v.p})(${v.D})/[2(${v.allow})] = ${f(r.tRequired)} mm.`,
    r.tRequired > v.t
      ? `The present ${v.t} mm wall is thinner than this, so it would not meet the proposed limit.`
      : `The present ${v.t} mm wall is thicker than this, so it already meets the proposed limit.`,
  ],

  refs: ['Thin-walled pressure vessels: σh = pD/(2t), σL = pD/(4t)'],

  // Hand-solved: hoop = 1.2(1200)/(2*10) = 72; longitudinal = 36; t = 1.2(1200)/(2*100) = 7.2 mm.
  reference_instance: {
    vars: { D: 1200, t: 10, p: 1.2, allow: 100 },
    answers: ['72.0', '36.0', '7.20'],
  },

  status: 'draft',
  bank_version: null,
};

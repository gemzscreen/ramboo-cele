// MSTE-CM-PROD-001 — hourly production of a hydraulic excavator, bank measure.
// Standalone item, no figure. Original scenario and wording (ROADMAP §3).
import { excavatorProduction } from '../../../js/models/excavatorProduction.js';
import { formatSig } from '../../../js/engine/format.js';

const f = (x) => formatSig(x, 4);
const g = (x) => formatSig(x, 3);

export default {
  id: 'MSTE-CM-PROD-001',
  subject: 'MSTE',
  topic: 'Construction Management Principles and Methods',
  topic_id: 'mste.construction-management-principles-and-methods',
  subtopic_id: 'mste.construction-management-principles-and-methods.equipment-productivity',
  archetype: 'Excavator production: bucket size, fill factor, cycle time, job efficiency and swell',
  format: 'single',
  board_frequency: '7/7 sittings', // the topic's count in content/frequency.json
  difficulty: 1,

  vars: {
    q: { min: 0.8, max: 2.0, step: 0.1, unit: 'm³' },
    F: { min: 0.8, max: 1.0, step: 0.05, unit: '' },
    t: { min: 18, max: 30, step: 2, unit: 's' },
    m: { min: 40, max: 55, step: 5, unit: 'min/h' },
    s: { min: 10, max: 40, step: 5, unit: '%' },
  },
  constraints: [],

  stem: 'A hydraulic excavator with a {q} m³ heaped bucket is digging a drainage channel in clay. The bucket fill factor is {F}, '
    + 'one digging cycle takes {t} seconds, and because of waiting and repositioning the machine actually digs {m} minutes in each hour. '
    + 'The clay swells {s}% when excavated, so the loose volume in the bucket is (1 + {s}/100) times the in-place (bank) volume it came from.',

  figure: null,
  model: excavatorProduction,
  live: null,

  items: [
    {
      ask: 'Determine the excavator’s production in bank cubic metres per working hour.',
      pick: 'bank', unit: 'm³/h', sig: 3,
      distractors: [
        { name: 'leftVolumeInLooseMeasure', value: (v, r) => r.loose },
        { name: 'multipliedBySwellInsteadOfDividing', value: (v, r) => r.loose * (1 + v.s / 100) },
        { name: 'assumedFullSixtyMinuteHour', value: (v, r) => (v.q * v.F * 3600) / v.t / (1 + v.s / 100) },
        { name: 'ignoredBucketFillFactor', value: (v, r) => (v.q * r.cyclesPerHour) / (1 + v.s / 100) },
        { name: 'treatedFillFactorAsPercentage', value: (v, r) => (v.q * v.F * r.cyclesPerHour) / (1 + v.F) },
      ],
    },
  ],

  solution: (v, r) => [
    `Cycles per hour of digging: (3600/${v.t}) cycles per hour of running time × (${v.m}/60) of the hour spent digging = ${f(r.cyclesPerHour)} cycles.`,
    `Loose volume per cycle: ${v.q} × ${v.F} = ${f(r.loosePerCycle)} m³.`,
    `Loose production: ${f(r.loosePerCycle)} × ${f(r.cyclesPerHour)} = ${f(r.loose)} m³/h.`,
    `The question asks for bank (in-place) volume, so divide by the swell factor (1 + ${v.s}/100) = ${f(1 + v.s / 100)}: ${f(r.loose)}/${f(1 + v.s / 100)} = ${g(r.bank)} bank m³/h.`,
  ],

  refs: ['Construction equipment: production = capacity × fill factor × cycles per hour × job efficiency; bank volume = loose volume ÷ (1 + swell)'],

  // Hand-solved: 3600/24 = 150 cycles per hour, 50/60 of it digging = 125; 1.5(0.9)(125) = 168.75 loose; 168.75/1.25 = 135.
  reference_instance: {
    vars: { q: 1.5, F: 0.9, t: 24, m: 50, s: 25 },
    answers: ['135'],
  },

  status: 'draft',
  bank_version: null,
};

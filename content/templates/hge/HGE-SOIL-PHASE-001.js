// HGE-SOIL-PHASE-001 — phase relations from Gs, void ratio and water content.
// Situation, no figure. Original scenario and wording (ROADMAP §3).
import { soilPhase } from '../../../js/models/soilPhase.js';
import { formatSig } from '../../../js/engine/format.js';

const f = (x) => formatSig(x, 3);
const g = (x) => formatSig(x, 5);
const GW = 9.81;

export default {
  id: 'HGE-SOIL-PHASE-001',
  subject: 'HGE',
  topic: 'Soil Properties',
  topic_id: 'hge.soil-properties',
  subtopic_id: 'hge.soil-properties.phase-relations',
  archetype: 'Phase relations: degree of saturation, moist and dry unit weight from Gs, e and w',
  format: 'situation',
  board_frequency: '7/7 sittings', // the topic's count in content/frequency.json
  difficulty: 1,

  vars: {
    Gs: { min: 2.6, max: 2.75, step: 0.05, unit: '' },
    e: { min: 0.45, max: 0.95, step: 0.05, unit: '' },
    w: { min: 8, max: 24, step: 2, unit: '%' },
  },
  constraints: [
    { rule: 'degree of saturation between 30% and 95%', test: (v) => { const S = (v.w / 100) * v.Gs / v.e; return S >= 0.3 && S <= 0.95; } },
  ],

  stem: 'A sample of silty sand is taken from a borrow pit being assessed as fill for a road embankment. Laboratory '
    + 'tests give a void ratio of {e}, a water content of {w}% and a specific gravity of solids of {Gs}. '
    + 'Take the unit weight of water as 9.81 kN/m³.',

  figure: null,
  model: soilPhase,
  live: null,

  items: [
    {
      ask: 'Determine the degree of saturation of the soil.',
      pick: 'S', unit: '%', sig: 3,
      valid: (value) => value <= 100,
      distractors: [
        { name: 'forgotSpecificGravity', value: (v) => v.w / v.e },
        { name: 'invertedVoidRatioAndGs', value: (v) => (v.w * v.e) / v.Gs },
        { name: 'gavePorosity', value: (v, r) => r.n },
        { name: 'dividedByOnePlusE', value: (v) => (v.w * v.Gs) / (1 + v.e) },
        { name: 'gaveSaturationWaterContent', value: (v, r) => r.wSat },
      ],
    },
    {
      ask: 'Determine the moist (bulk) unit weight of the soil.',
      pick: 'gammaMoist', unit: 'kN/m³', sig: 3,
      distractors: [
        { name: 'gaveDryUnitWeight', value: (v, r) => r.gammaDry },
        { name: 'gaveSaturatedUnitWeight', value: (v, r) => r.gammaSat },
        { name: 'treatedWaterContentAsVolumeRatio', value: (v) => ((v.Gs + v.w / 100) * GW) / (1 + v.e) },
        { name: 'dividedDryByOneMinusW', value: (v, r) => r.gammaDry / (1 - v.w / 100) },
        { name: 'forgotOnePlusE', value: (v) => v.Gs * (1 + v.w / 100) * GW },
      ],
    },
    {
      ask: 'Determine the dry unit weight of the soil.',
      pick: 'gammaDry', unit: 'kN/m³', sig: 3,
      distractors: [
        { name: 'gaveMoistUnitWeight', value: (v, r) => r.gammaMoist },
        { name: 'subtractedWaterContentInsteadOfDividing', value: (v, r) => r.gammaMoist * (1 - v.w / 100) },
        { name: 'gaveSubmergedUnitWeight', value: (v, r) => r.gammaSub },
        { name: 'dividedByOnePlusWTwice', value: (v, r) => r.gammaDry / (1 + v.w / 100) },
        { name: 'gaveSaturatedUnitWeight', value: (v, r) => r.gammaSat },
      ],
    },
  ],

  solution: (v, r) => [
    `Work with a phase diagram having 1 m³ of solids: V<sub>s</sub> = 1, V<sub>v</sub> = e = ${v.e}, total V = 1 + e = ${g(1 + v.e)} m³.`,
    `Weights: W<sub>s</sub> = G<sub>s</sub>γ<sub>w</sub> = (${v.Gs})(9.81) = ${g(v.Gs * GW)} kN; W<sub>w</sub> = wW<sub>s</sub> = (${v.w / 100})(${g(v.Gs * GW)}) = ${g((v.w / 100) * v.Gs * GW)} kN.`,
    `Volume of water: V<sub>w</sub> = W<sub>w</sub>/γ<sub>w</sub> = wG<sub>s</sub> = ${g((v.w / 100) * v.Gs)} m³. Degree of saturation: S = V<sub>w</sub>/V<sub>v</sub> = wG<sub>s</sub>/e = ${g((v.w / 100) * v.Gs)}/${v.e} = ${f(r.S)}%.`,
    `Moist unit weight: γ = (W<sub>s</sub> + W<sub>w</sub>)/V = G<sub>s</sub>(1 + w)γ<sub>w</sub>/(1 + e) = (${v.Gs})(${g(1 + v.w / 100)})(9.81)/${g(1 + v.e)} = ${f(r.gammaMoist)} kN/m³.`,
    `Dry unit weight: γ<sub>d</sub> = W<sub>s</sub>/V = G<sub>s</sub>γ<sub>w</sub>/(1 + e) = (${v.Gs})(9.81)/${g(1 + v.e)} = ${f(r.gammaDry)} kN/m³ (also γ/(1 + w)).`,
  ],

  refs: ['Soil phase relations: Se = wGs; γ = Gs(1 + w)γw/(1 + e); γd = γ/(1 + w)'],

  // Hand-solved for Gs = 2.70, e = 0.60, w = 16%:
  // S = 0.16(2.70)/0.60 = 72.0%; gamma_d = 2.70(9.81)/1.60 = 16.554; gamma = 16.554(1.16) = 19.203.
  reference_instance: {
    vars: { Gs: 2.7, e: 0.6, w: 16 },
    answers: ['72.0', '19.2', '16.6'],
  },

  status: 'draft',
  bank_version: null,
};

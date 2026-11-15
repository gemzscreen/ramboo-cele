// HGE-SOIL-STRESS-001 — total, pore and effective stress in a two-layer profile.
// Situation, no figure. Original scenario and wording (ROADMAP §3).
import { soilEffectiveStress } from '../../../js/models/soilEffectiveStress.js';
import { formatSig } from '../../../js/engine/format.js';

const f = (x) => formatSig(x, 3);
const g = (x) => formatSig(x, 5);
const GW = 9.81;

export default {
  id: 'HGE-SOIL-STRESS-001',
  subject: 'HGE',
  topic: 'Stresses in Soil Mass',
  topic_id: 'hge.stresses-in-soil-mass',
  subtopic_id: 'hge.stresses-in-soil-mass.geostatic-stress',
  archetype: 'Sand over clay with the water table in the sand: total stress, pore water pressure and effective stress at a point in the clay',
  format: 'situation',
  board_frequency: '6/7 sittings', // the topic's count in content/frequency.json
  difficulty: 1,

  vars: {
    H1: { min: 4, max: 8, step: 1, unit: 'm' },
    dw: { min: 1, max: 3, step: 0.5, unit: 'm' },
    gamma1: { min: 16, max: 18, step: 0.5, unit: 'kN/m³' },
    gammaSat1: { min: 19, max: 20.5, step: 0.5, unit: 'kN/m³' },
    gammaSat2: { min: 17, max: 19, step: 0.5, unit: 'kN/m³' },
    z2: { min: 2, max: 6, step: 1, unit: 'm' },
  },
  constraints: [],

  stem: 'Borings for a proposed warehouse show {H1} m of sand over a thick clay layer. The water table is {dw} m '
    + 'below the ground surface. The sand weighs {gamma1} kN/m³ above the water table and {gammaSat1} kN/m³ (saturated) '
    + 'below it; the clay has a saturated unit weight of {gammaSat2} kN/m³. Consider a point {z2} m below the top of '
    + 'the clay, and take the unit weight of water as 9.81 kN/m³.',

  figure: null,
  model: soilEffectiveStress,
  live: null,

  items: [
    {
      ask: 'Determine the total vertical stress at the point.',
      pick: 'total', unit: 'kPa', sig: 3,
      distractors: [
        { name: 'gaveEffectiveStress', value: (v, r) => r.effective },
        { name: 'usedMoistWeightForAllTheSand', value: (v) => v.gamma1 * v.H1 + v.gammaSat2 * v.z2 },
        { name: 'usedSaturatedWeightForAllTheSand', value: (v) => v.gammaSat1 * v.H1 + v.gammaSat2 * v.z2 },
        { name: 'stoppedAtTopOfClay', value: (v) => v.gamma1 * v.dw + v.gammaSat1 * (v.H1 - v.dw) },
        { name: 'addedPorePressureAgain', value: (v, r) => r.total + r.u },
      ],
    },
    {
      ask: 'Determine the pore water pressure at the point.',
      pick: 'u', unit: 'kPa', sig: 3,
      distractors: [
        { name: 'measuredFromGroundSurface', value: (v, r) => GW * r.depth },
        { name: 'measuredFromTopOfClay', value: (v) => GW * v.z2 },
        { name: 'stoppedAtTopOfClay', value: (v) => GW * (v.H1 - v.dw) },
        { name: 'usedDepthToWaterTableInsteadOfBelowIt', value: (v) => GW * (v.dw + v.z2) },
      ],
    },
    {
      ask: 'Determine the effective vertical stress at the point.',
      pick: 'effective', unit: 'kPa', sig: 3,
      distractors: [
        { name: 'gaveTotalStress', value: (v, r) => r.total },
        { name: 'subtractedWaterOverFullDepth', value: (v, r) => r.total - GW * r.depth },
        { name: 'usedSaturatedWeightForAllTheSand', value: (v, r) => v.gammaSat1 * v.H1 + v.gammaSat2 * v.z2 - r.u },
        { name: 'subtractedWaterInClayOnly', value: (v, r) => r.total - GW * v.z2 },
        { name: 'gavePorePressure', value: (v, r) => r.u },
      ],
    },
  ],

  solution: (v, r) => [
    `Total stress is the weight of everything above the point, layer by layer: dry-side sand ${v.dw} m, saturated sand ${v.H1} − ${v.dw} = ${g(v.H1 - v.dw)} m, clay ${v.z2} m.`,
    `σ = (${v.gamma1})(${v.dw}) + (${v.gammaSat1})(${g(v.H1 - v.dw)}) + (${v.gammaSat2})(${v.z2}) = ${g(v.gamma1 * v.dw)} + ${g(v.gammaSat1 * (v.H1 - v.dw))} + ${g(v.gammaSat2 * v.z2)} = ${f(r.total)} kPa.`,
    `Pore water pressure is hydrostatic below the water table. Depth of the point below the water table = ${g(v.H1 - v.dw)} + ${v.z2} = ${g(r.headOfWater)} m, so u = (9.81)(${g(r.headOfWater)}) = ${f(r.u)} kPa.`,
    `Effective stress: σ′ = σ − u = ${g(r.total)} − ${g(r.u)} = ${f(r.effective)} kPa.`,
    `Check with buoyant unit weights below the water table: (${v.gamma1})(${v.dw}) + (${v.gammaSat1} − 9.81)(${g(v.H1 - v.dw)}) + (${v.gammaSat2} − 9.81)(${v.z2}) = ${f(r.effective)} kPa.`,
  ],

  refs: ['Terzaghi effective stress principle: σ′ = σ − u', 'Geostatic vertical stress: σ = Σγᵢhᵢ; hydrostatic pore pressure u = γw·hw'],

  // Hand-solved: total = 17(2) + 19.5(4) + 18(5) = 34 + 78 + 90 = 202; u = 9.81(4 + 5) = 88.29; effective = 113.71.
  reference_instance: {
    vars: { H1: 6, dw: 2, gamma1: 17, gammaSat1: 19.5, gammaSat2: 18, z2: 5 },
    answers: ['202', '88.3', '114'],
  },

  status: 'draft',
  bank_version: null,
};

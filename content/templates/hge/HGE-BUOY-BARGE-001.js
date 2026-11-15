// HGE-BUOY-BARGE-001 — box barge: draft, cargo capacity, draft in fresh water.
// Situation, no figure. Original scenario and wording (ROADMAP §3).
import { bargeBuoyancy } from '../../../js/models/bargeBuoyancy.js';
import { formatSig } from '../../../js/engine/format.js';

const f = (x) => formatSig(x, 3);
const g = (x) => formatSig(x, 5);
const SG = 1.03;
const GW = 9.81;
const model = (v) => bargeBuoyancy({ L: v.L, B: v.B, H: v.H, W: v.W, sg: SG, f: v.fb });

export default {
  id: 'HGE-BUOY-BARGE-001',
  subject: 'HGE',
  topic: 'Buoyancy and Flotation',
  topic_id: 'hge.buoyancy-and-flotation',
  subtopic_id: 'hge.buoyancy-and-flotation.buoyant-force',
  archetype: 'Rectangular barge: empty draft, cargo for a given freeboard, change of draft between sea and fresh water',
  format: 'situation',
  board_frequency: '7/7 sittings', // the topic's count in content/frequency.json
  difficulty: 1,

  vars: {
    L: { min: 20, max: 40, step: 5, unit: 'm' },
    B: { min: 6, max: 10, step: 1, unit: 'm' },
    H: { min: 2.5, max: 4, step: 0.5, unit: 'm' },
    W: { min: 800, max: 2000, step: 200, unit: 'kN' },
    fb: { min: 0.4, max: 0.8, step: 0.2, unit: 'm' },
  },
  constraints: [
    { rule: 'empty draft between 0.3 m and 40% of the loaded draft', test: (v) => { const d = v.W / (SG * GW * v.L * v.B); return d >= 0.3 && d <= 0.4 * (v.H - v.fb); } },
  ],

  stem: 'A flat-bottomed steel barge used to carry aggregates is shaped like a rectangular box, {L} m long, {B} m wide '
    + 'and {H} m deep, and weighs {W} kN empty. It floats upright in seawater of specific gravity 1.03. When loaded, at '
    + 'least {fb} m of freeboard must remain. Take the unit weight of fresh water as 9.81 kN/m³.',

  figure: null,
  model,
  live: null,

  items: [
    {
      ask: 'Determine the draft of the empty barge in seawater.',
      pick: 'draftEmpty', unit: 'm', sig: 3,
      distractors: [
        { name: 'usedFreshWater', value: (v, r) => r.draftEmpty * SG },
        { name: 'multipliedBySpecificGravityTwice', value: (v, r) => r.draftEmpty / SG },
        { name: 'gaveLoadedDraft', value: (v, r) => r.draftMax },
        { name: 'gaveFreeboardOfEmptyBarge', value: (v, r) => v.H - r.draftEmpty },
      ],
    },
    {
      ask: 'Determine the heaviest cargo the barge can carry in seawater.',
      pick: 'cargo', unit: 'kN', sig: 3,
      distractors: [
        { name: 'forgotToSubtractBargeWeight', value: (v, r) => r.displacement },
        { name: 'ignoredFreeboard', value: (v, r) => r.gamma * r.plan * v.H - v.W },
        { name: 'usedFreshWater', value: (v, r) => GW * r.plan * r.draftMax - v.W },
        { name: 'usedFreshWaterAndIgnoredFreeboard', value: (v, r) => GW * r.plan * v.H - v.W },
        { name: 'ignoredFreeboardAndBargeWeight', value: (v, r) => r.gamma * r.plan * v.H },
      ],
    },
    {
      ask: 'The fully loaded barge is towed up a river into fresh water. Determine its draft there.',
      pick: 'draftFresh', unit: 'm', sig: 3,
      distractors: [
        { name: 'assumedDraftUnchanged', value: (v, r) => r.draftMax },
        { name: 'dividedBySpecificGravity', value: (v, r) => r.draftMax / SG },
        { name: 'gaveHullDepth', value: (v) => v.H },
        { name: 'usedCargoOnly', value: (v, r) => r.cargo / (GW * r.plan) },
        { name: 'addedEmptyDraft', value: (v, r) => r.draftMax + r.draftEmpty },
      ],
    },
  ],

  solution: (v, r) => [
    `Unit weight of seawater: γ = 1.03(9.81) = ${g(r.gamma)} kN/m³. Water-plane area: A = (${v.L})(${v.B}) = ${r.plan} m².`,
    `A floating body displaces its own weight of liquid: W = γ·A·(draft). Empty draft = ${v.W}/[(${g(r.gamma)})(${r.plan})] = ${f(r.draftEmpty)} m.`,
    `Deepest draft allowed = depth − freeboard = ${v.H} − ${v.fb} = ${g(r.draftMax)} m. Displacement at that draft = (${g(r.gamma)})(${r.plan})(${g(r.draftMax)}) = ${g(r.displacement)} kN.`,
    `Cargo = displacement − weight of barge = ${g(r.displacement)} − ${v.W} = ${f(r.cargo)} kN.`,
    `In fresh water the same total weight must be supported by lighter water: draft = ${g(r.displacement)}/[(9.81)(${r.plan})] = ${f(r.draftFresh)} m, which is 1.03 times the seawater draft. `
      + (r.draftFresh > v.H ? 'That is more than the depth of the hull, so the barge would be swamped: cargo must come off before it enters the river.' : `The freeboard shrinks to ${f(v.H - r.draftFresh)} m.`),
  ],

  refs: ['Archimedes’ principle: buoyant force = weight of liquid displaced', 'Floating body: W = γ·V(displaced)'],

  // Hand-solved: gamma = 10.1043; A = 240; empty draft = 1200/2425.03 = 0.4948 m;
  // loaded draft 2.4 m: 2425.03(2.4) = 5820.08; cargo = 4620.08 kN; fresh: 5820.08/(9.81*240) = 2.472 m.
  reference_instance: {
    vars: { L: 30, B: 8, H: 3, W: 1200, fb: 0.6 },
    answers: ['0.495', '4620', '2.47'],
  },

  status: 'draft',
  bank_version: null,
};

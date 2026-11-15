// HGE-COMP-BORROW-001 — borrow volume and water for a compacted fill.
// Situation, no figure. Original scenario and wording (ROADMAP §3).
import { compactionBorrow } from '../../../js/models/compactionBorrow.js';
import { formatSig } from '../../../js/engine/format.js';

const f = (x) => formatSig(x, 3);
const g = (x) => formatSig(x, 5);

export default {
  id: 'HGE-COMP-BORROW-001',
  subject: 'HGE',
  topic: 'Compaction',
  topic_id: 'hge.compaction',
  subtopic_id: 'hge.compaction.field-compaction',
  archetype: 'Compacted fill from a borrow pit: dry soil needed, borrow volume, water to add',
  format: 'situation',
  board_frequency: '3/7 sittings', // the topic's count in content/frequency.json
  difficulty: 1,

  vars: {
    V: { min: 2000, max: 10000, step: 1000, unit: 'm³' },
    gdFill: { min: 17, max: 19, step: 0.5, unit: 'kN/m³' },
    gdBorrow: { min: 14.5, max: 16, step: 0.5, unit: 'kN/m³' },
    wBorrow: { min: 6, max: 10, step: 2, unit: '%' },
    wFill: { min: 12, max: 16, step: 2, unit: '%' },
  },
  constraints: [],

  stem: 'A road embankment needs {V} m³ of compacted fill placed at a dry unit weight of {gdFill} kN/m³ and a water '
    + 'content of {wFill}%. The soil will be dug from a borrow pit, where its dry unit weight is {gdBorrow} kN/m³ and '
    + 'its natural water content is {wBorrow}%. Ignore losses in hauling and evaporation.',

  figure: null,
  model: compactionBorrow,
  live: null,

  items: [
    {
      ask: 'Determine the weight of dry soil needed for the embankment.',
      pick: 'Ws', unit: 'kN', sig: 3,
      distractors: [
        { name: 'gaveMoistWeightOfFill', value: (v, r) => v.V * r.moistFillUnitWeight },
        { name: 'usedBorrowPitUnitWeight', value: (v) => v.V * v.gdBorrow },
        { name: 'dividedByOnePlusWaterContent', value: (v) => (v.V * v.gdFill) / (1 + v.wFill / 100) },
        { name: 'usedMoistBorrowUnitWeight', value: (v, r) => v.V * r.moistBorrowUnitWeight },
      ],
    },
    {
      ask: 'Determine the volume of soil that must be excavated from the borrow pit.',
      pick: 'Vborrow', unit: 'm³', sig: 3,
      distractors: [
        { name: 'invertedTheUnitWeightRatio', value: (v) => (v.V * v.gdBorrow) / v.gdFill },
        { name: 'assumedSameVolume', value: (v) => v.V },
        { name: 'usedMoistUnitWeightOfBorrow', value: (v, r) => r.Ws / r.moistBorrowUnitWeight },
        { name: 'usedMoistWeightOfFill', value: (v, r) => (v.V * r.moistFillUnitWeight) / v.gdBorrow },
        { name: 'usedMoistUnitWeightsForBoth', value: (v, r) => (v.V * r.moistFillUnitWeight) / r.moistBorrowUnitWeight },
      ],
    },
    {
      ask: 'Determine the weight of water that must be added to the soil before compaction.',
      pick: 'waterAdded', unit: 'kN', sig: 3,
      distractors: [
        { name: 'ignoredNaturalWaterContent', value: (v, r) => (r.Ws * v.wFill) / 100 },
        { name: 'gaveWaterAlreadyInTheSoil', value: (v, r) => (r.Ws * v.wBorrow) / 100 },
        { name: 'appliedDifferenceToMoistBorrowWeight', value: (v, r) => (r.Vborrow * r.moistBorrowUnitWeight * (v.wFill - v.wBorrow)) / 100 },
        { name: 'appliedDifferenceToFillVolume', value: (v) => (v.V * (v.wFill - v.wBorrow)) / 100 * 9.81 },
        { name: 'usedBorrowDryWeightOverFillVolume', value: (v) => (v.V * v.gdBorrow * (v.wFill - v.wBorrow)) / 100 },
      ],
    },
  ],

  solution: (v, r) => [
    `Dry unit weight is weight of solids per unit total volume, so the embankment needs W<sub>s</sub> = γ<sub>d</sub>V = (${v.gdFill})(${v.V}) = ${f(r.Ws)} kN of dry soil.`,
    `The same solids come out of the pit, where they are packed more loosely: V<sub>borrow</sub> = W<sub>s</sub>/γ<sub>d,borrow</sub> = ${g(r.Ws)}/${v.gdBorrow} = ${f(r.Vborrow)} m³. Water content does not enter, because dry unit weights already exclude the water.`,
    `Water content is weight of water over weight of solids. In the pit the soil holds ${v.wBorrow}% and the fill needs ${v.wFill}%, so the water to add is W<sub>s</sub>(w<sub>fill</sub> − w<sub>borrow</sub>) = (${g(r.Ws)})(${v.wFill / 100} − ${v.wBorrow / 100}) = ${f(r.waterAdded)} kN, about ${f(r.waterVolume)} m³.`,
    `Compaction shrinks the soil by ${f(r.shrinkage)}% of its pit volume.`,
  ],

  refs: ['Phase relations: γd = Ws/V;  w = Ww/Ws', 'Earthwork: weight of solids is conserved between borrow and fill'],

  // Hand-solved: Ws = 18(5000) = 90000 kN; V_borrow = 90000/15.5 = 5806.5 m^3; water = 90000(0.14 - 0.08) = 5400 kN.
  reference_instance: {
    vars: { V: 5000, gdFill: 18, gdBorrow: 15.5, wBorrow: 8, wFill: 14 },
    answers: ['90000', '5810', '5400'],
  },

  status: 'draft',
  bank_version: null,
};

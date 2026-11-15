// HGE-PERM-LAYER-001 — equivalent permeability of layered soil.
// Situation, no figure. Original scenario and wording (ROADMAP §3).
import { layeredPermeability } from '../../../js/models/layeredPermeability.js';
import { formatSig } from '../../../js/engine/format.js';

const f = (x) => formatSig(x, 3);
const g = (x) => formatSig(x, 5);
const layers = (v) => [{ H: v.H1, k: v.k1 }, { H: v.H2, k: v.k2 }, { H: v.H3, k: v.k3 }];
const model = (v) => layeredPermeability(layers(v));
const meanK = (v) => (v.k1 + v.k2 + v.k3) / 3;
const harmonicK = (v) => 3 / (1 / v.k1 + 1 / v.k2 + 1 / v.k3);

export default {
  id: 'HGE-PERM-LAYER-001',
  subject: 'HGE',
  topic: 'Fluid Flow through Soil Mass',
  topic_id: 'hge.fluid-flow-through-soil-mass',
  subtopic_id: 'hge.fluid-flow-through-soil-mass.permeability',
  archetype: 'Stratified soil: equivalent permeability parallel to and across the layers, and their ratio',
  format: 'situation',
  board_frequency: '6/7 sittings', // the topic's count in content/frequency.json
  difficulty: 2,

  vars: {
    H1: { min: 1, max: 4, step: 1, unit: 'm' }, k1: { min: 0.5, max: 2, step: 0.5, unit: 'm/day' },
    H2: { min: 1, max: 4, step: 1, unit: 'm' }, k2: { min: 4, max: 10, step: 2, unit: 'm/day' },
    H3: { min: 1, max: 3, step: 1, unit: 'm' }, k3: { min: 0.05, max: 0.2, step: 0.05, unit: 'm/day' },
  },
  constraints: [
    // Unequal thicknesses, so thickness-weighted and plain averages differ.
    { rule: 'layer thicknesses are not all equal', test: (v) => !(v.H1 === v.H2 && v.H2 === v.H3) },
  ],

  stem: 'A river terrace deposit under a proposed pump station consists of three horizontal layers. From the top: '
    + '{H1} m of silty sand with a coefficient of permeability of {k1} m/day; {H2} m of clean gravelly sand with '
    + '{k2} m/day; and {H3} m of sandy silt with {k3} m/day. Each layer is uniform and isotropic.',

  figure: null,
  model,
  live: null,

  items: [
    {
      ask: 'Determine the equivalent coefficient of permeability for flow parallel to the layers.',
      pick: 'kH', unit: 'm/day', sig: 3,
      distractors: [
        { name: 'averagedWithoutThickness', value: (v) => meanK(v) },
        { name: 'gaveValueForFlowAcrossLayers', value: (v, r) => r.kV },
        { name: 'forgotToDivideByTotalThickness', value: (v, r) => r.kH * r.total },
        { name: 'tookTheMostPermeableLayer', value: (v) => v.k2 },
        { name: 'usedHarmonicMeanWithoutThickness', value: (v) => harmonicK(v) },
      ],
    },
    {
      ask: 'Determine the equivalent coefficient of permeability for flow perpendicular to the layers.',
      pick: 'kV', unit: 'm/day', sig: 3,
      distractors: [
        { name: 'gaveValueForFlowAlongLayers', value: (v, r) => r.kH },
        { name: 'usedHarmonicMeanWithoutThickness', value: (v) => harmonicK(v) },
        { name: 'tookTheLeastPermeableLayer', value: (v) => v.k3 },
        { name: 'averagedWithoutThickness', value: (v) => meanK(v) },
        { name: 'invertedTheResult', value: (v, r) => 1 / r.kV },
      ],
    },
    {
      ask: 'Determine the ratio of the equivalent permeability parallel to the layers to that across them.',
      pick: 'ratio', unit: '', sig: 3,
      distractors: [
        { name: 'usedUnweightedMeans', value: (v) => meanK(v) / harmonicK(v) },
        { name: 'dividedExtremeLayerValues', value: (v) => v.k2 / v.k3 },
        { name: 'tookSquareRootOfRatio', value: (v, r) => Math.sqrt(r.ratio) },
        { name: 'subtractedInsteadOfDividing', value: (v, r) => r.kH - r.kV },
        { name: 'dividedMiddleLayerByTopLayer', value: (v) => v.k2 / v.k1 },
      ],
    },
  ],

  solution: (v, r) => [
    `Total thickness: H = ${v.H1} + ${v.H2} + ${v.H3} = ${r.total} m.`,
    `Flow parallel to the layers: every layer has the same hydraulic gradient and the discharges add, so k<sub>H</sub> = Σ(k<sub>i</sub>H<sub>i</sub>)/ΣH<sub>i</sub> = [(${v.k1})(${v.H1}) + (${v.k2})(${v.H2}) + (${v.k3})(${v.H3})]/${r.total} = ${f(r.kH)} m/day.`,
    `Flow across the layers: the same discharge passes through each layer and the head losses add, so k<sub>V</sub> = ΣH<sub>i</sub>/Σ(H<sub>i</sub>/k<sub>i</sub>) = ${r.total}/(${v.H1}/${v.k1} + ${v.H2}/${v.k2} + ${v.H3}/${v.k3}) = ${r.total}/${g(r.total / r.kV)} = ${f(r.kV)} m/day.`,
    `Ratio: k<sub>H</sub>/k<sub>V</sub> = ${g(r.kH)}/${g(r.kV)} = ${f(r.ratio)}. The gravelly sand controls flow along the layers; the sandy silt controls flow across them.`,
  ],

  refs: ['Stratified soils: kH = Σ(kᵢHᵢ)/ΣHᵢ;  kV = ΣHᵢ/Σ(Hᵢ/kᵢ)', 'Darcy’s law: v = ki'],

  // Hand-solved: kH = (2 + 18 + 0.1)/6 = 3.35; kV = 6/(2 + 0.5 + 10) = 0.480; ratio = 6.98.
  reference_instance: {
    vars: { H1: 2, k1: 1, H2: 3, k2: 6, H3: 1, k3: 0.1 },
    answers: ['3.35', '0.480', '6.98'],
  },

  status: 'draft',
  bank_version: null,
};

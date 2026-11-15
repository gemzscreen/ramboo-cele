// HGE-HYDRO-GATE-001 — hydrostatic force on a submerged vertical rectangular
// gate, hinged at the top with a stop at the bottom.
// Original scenario and wording (ROADMAP §3).
import { hydroGateVertical } from '../../../js/models/hydroGateVertical.js';
import { figHydroGateVertical } from '../../../js/figures/hydroGateVertical.js';
import { formatSig } from '../../../js/engine/format.js';

const GAMMA = 9.81; // kN/m^3, stated in the stem
const f = (x) => formatSig(x, 3);
const g = (x) => formatSig(x, 5); // intermediates to 5 figures, so the working shown reproduces the key

export default {
  id: 'HGE-HYDRO-GATE-001',
  subject: 'HGE',
  topic: 'Hydrostatics', // label of topic_id, kept in step by Stage 3
  topic_id: 'hge.hydrostatics',
  subtopic_id: 'hge.hydrostatics.plane-surface-forces',
  archetype: 'Hydrostatic force on a submerged vertical rectangular gate',
  format: 'situation',
  board_frequency: null, // filled from the taxonomy (D4)
  difficulty: 2,

  vars: {
    b: { min: 1, max: 4, step: 0.5, unit: 'm' },
    h: { min: 1.5, max: 4, step: 0.5, unit: 'm' },
    d: { min: 0.5, max: 5, step: 0.5, unit: 'm' },
  },
  constraints: [],

  stem: 'A rectangular steel gate closes an outlet in the vertical wall of an irrigation canal headworks. The gate is '
    + '{b} m wide and {h} m high, hinged along its top edge, and bears against a stop along its bottom edge. '
    + 'Water stands on one side only, with its surface {d} m above the top edge of the gate. '
    + 'Use a unit weight of water of 9.81 kN/m³ and neglect the weight of the gate.',

  figure: figHydroGateVertical,
  model: hydroGateVertical,
  live: { sliders: ['d', 'h', 'b'] },

  items: [
    {
      ask: 'Determine the total hydrostatic force on the gate.',
      pick: 'F', unit: 'kN', sig: 3,
      distractors: [
        { name: 'usedDepthToTopEdge', value: (v, r) => GAMMA * v.d * r.A },
        { name: 'usedDepthToBottomEdge', value: (v, r) => GAMMA * (v.d + v.h) * r.A },
        { name: 'ignoredWaterAboveGate', value: (v, r) => GAMMA * (v.h / 2) * r.A },
        { name: 'omittedUnitWeight', value: (v, r) => r.hbar * r.A },
        { name: 'forgotGateWidth', value: (v, r) => GAMMA * r.hbar * v.h },
      ],
    },
    {
      ask: 'Determine the depth of the centre of pressure below the water surface.',
      pick: 'ycp', unit: 'm', sig: 3,
      valid: (value, v) => value < v.d + v.h, // must lie on the gate
      distractors: [
        { name: 'gaveCentroidDepth', value: (v, r) => r.hbar },
        { name: 'assumedTriangularPressureOnGate', value: (v) => v.d + (2 * v.h) / 3 },
        { name: 'measuredFromTopOfGate', value: (v, r) => r.armFromHinge },
        { name: 'twoThirdsOfTotalDepth', value: (v) => (2 * (v.d + v.h)) / 3 },
        { name: 'subtractedEccentricity', value: (v, r) => r.hbar - r.e },
      ],
    },
    {
      ask: 'Determine the force exerted by the stop on the gate.',
      pick: 'Pstop', unit: 'kN', sig: 3,
      distractors: [
        { name: 'splitForceEqually', value: (v, r) => r.F / 2 },
        { name: 'gaveHingeReaction', value: (v, r) => r.Rhinge },
        { name: 'assumedTwoThirdsOfForce', value: (v, r) => (2 * r.F) / 3 },
        { name: 'gaveTotalForce', value: (v, r) => r.F },
        { name: 'tookMomentArmFromSurface', value: (v, r) => (r.F * r.ycp) / (v.d + v.h) },
      ],
    },
  ],

  solution: (v, r) => [
    `Depth of the gate's centroid below the surface: h̄ = ${v.d} + ${v.h}/2 = ${r.hbar} m. Gate area: A = (${v.b})(${v.h}) = ${r.A} m².`,
    `The resultant equals the pressure at the centroid times the area: F = γ·h̄·A = (9.81)(${r.hbar})(${r.A}) = ${f(r.F)} kN.`,
    `For a vertical rectangle the centre of pressure lies below the centroid by e = I<sub>g</sub>/(A·h̄) = h²/(12·h̄) `
      + `= (${v.h})²/[12(${r.hbar})] = ${g(r.e)} m, so its depth is y<sub>cp</sub> = ${r.hbar} + ${g(r.e)} = ${f(r.ycp)} m.`,
    `The force therefore acts ${g(r.ycp)} − ${v.d} = ${g(r.armFromHinge)} m below the hinge. Sum moments about the hinge: `
      + `P<sub>stop</sub>·${v.h} = F(${g(r.armFromHinge)}), so P<sub>stop</sub> = (${g(r.F)})(${g(r.armFromHinge)})/${v.h} = ${f(r.Pstop)} kN.`,
    `Check: the hinge carries F − P<sub>stop</sub> = ${f(r.Rhinge)} kN, less than the stop, as expected with pressure increasing downward.`,
  ],

  refs: ['Fluid statics: F = γ·h̄·A on a plane surface', 'Centre of pressure: y_cp = ȳ + I_g/(A·ȳ)'],

  // Hand-solved: hbar = 1.5 + 1.5 = 3.0; A = 6; F = 9.81(3)(6) = 176.58.
  // e = 9/36 = 0.25, y_cp = 3.25. P_stop = 176.58(1.75)/3 = 103.005.
  // Prism check: block 88.29 at 1.5 m + wedge 88.29 at 2.0 m -> 309.015/3 = 103.005.
  reference_instance: {
    vars: { b: 2, h: 3, d: 1.5 },
    answers: ['177', '3.25', '103'],
  },

  status: 'verified',
  bank_version: null,
};

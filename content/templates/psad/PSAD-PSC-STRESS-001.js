// PSAD-PSC-STRESS-001 — rectangular prestressed beam, midspan fibre stresses.
// Situation, no figure. Original scenario and wording (ROADMAP §3).
import { prestressRect } from '../../../js/models/prestressRect.js';
import { formatSig } from '../../../js/engine/format.js';

const f = (x) => formatSig(x, 3);
const g = (x) => formatSig(x, 5);

export default {
  id: 'PSAD-PSC-STRESS-001',
  subject: 'PSAD',
  topic: 'Prestressed Concrete Beams',
  topic_id: 'psad.prestressed-concrete-beams',
  subtopic_id: 'psad.prestressed-concrete-beams.service-stresses',
  archetype: 'Rectangular prestressed beam, straight eccentric tendon: fibre stresses from prestress and load, load for zero bottom stress',
  format: 'situation',
  board_frequency: '7/7 sittings', // the topic's count in content/frequency.json
  difficulty: 2,

  vars: {
    b: { min: 250, max: 400, step: 50, unit: 'mm' },
    h: { min: 500, max: 800, step: 100, unit: 'mm' },
    L: { min: 8, max: 14, step: 2, unit: 'm' },
    P: { min: 800, max: 1600, step: 200, unit: 'kN' },
    e: { min: 100, max: 200, step: 50, unit: 'mm' },
    w: { min: 20, max: 40, step: 5, unit: 'kN/m' },
  },
  constraints: [
    { rule: 'tendon at least 100 mm inside the bottom face', test: (v) => v.e <= v.h / 2 - 100 },
    { rule: 'bottom fibre compression from prestress between 8 and 28 MPa', test: (v) => { const r = prestressRect(v); return r.bottomPrestress >= 8 && r.bottomPrestress <= 28; } },
    { rule: 'top fibre under full load in compression, 2 to 25 MPa', test: (v) => { const r = prestressRect(v); return r.top >= 2 && r.top <= 25; } },
  ],

  stem: 'A precast floor beam with a rectangular section {b} mm wide and {h} mm deep is simply supported over a span '
    + 'of {L} m. It is prestressed by a straight tendon placed {e} mm below the centroid of the section, with an '
    + 'effective prestressing force of {P} kN after all losses. In service the beam carries a total uniform load of '
    + '{w} kN/m, self-weight included. Assume the section is uncracked and use gross section properties.',

  figure: null,
  model: prestressRect,
  live: null,

  items: [
    {
      ask: 'Determine the compressive stress at the bottom fibre due to the prestressing force alone.',
      pick: 'bottomPrestress', unit: 'MPa', sig: 3,
      distractors: [
        { name: 'ignoredEccentricity', value: (v, r) => r.axial },
        { name: 'gaveEccentricityTermOnly', value: (v, r) => r.ecc },
        { name: 'subtractedEccentricityTerm', value: (v, r) => Math.abs(r.axial - r.ecc) },
        { name: 'usedBh2Over12AsSectionModulus', value: (v, r) => r.axial + 2 * r.ecc },
        { name: 'usedBh2Over3AsSectionModulus', value: (v, r) => r.axial + r.ecc / 2 },
      ],
    },
    {
      ask: 'Determine the compressive stress at the top fibre at midspan under the prestress and the full service load.',
      pick: 'top', unit: 'MPa', sig: 3,
      distractors: [
        { name: 'gaveBendingStressOnly', value: (v, r) => r.bend },
        { name: 'ignoredEccentricity', value: (v, r) => r.axial + r.bend },
        { name: 'addedEccentricityTerm', value: (v, r) => r.axial + r.ecc + r.bend },
        { name: 'gaveBottomFibreMagnitude', value: (v, r) => Math.abs(r.bottom) },
        { name: 'ignoredAxialTerm', value: (v, r) => Math.abs(r.bend - r.ecc) },
      ],
    },
    {
      ask: 'Determine the total uniform load at which the bottom fibre at midspan is at zero stress.',
      pick: 'wZeroBottom', unit: 'kN/m', sig: 3,
      distractors: [
        { name: 'balancedTendonMomentOnly', value: (v, r) => r.wBalance },
        { name: 'ignoredEccentricity', value: (v, r) => (8 * r.axial * r.S) / 1e6 / v.L ** 2 },
        { name: 'usedFixedEndMoment', value: (v, r) => r.wZeroBottom * 1.5 },
        { name: 'usedWL2Over4', value: (v, r) => r.wZeroBottom / 2 },
        { name: 'usedCantileverMoment', value: (v, r) => r.wZeroBottom / 4 },
        { name: 'usedFixedEndsMidspanMoment', value: (v, r) => r.wZeroBottom * 3 },
        { name: 'usedTopFibrePrestress', value: (v, r) => (8 * Math.abs(r.axial - r.ecc) * r.S) / 1e6 / v.L ** 2 },
      ],
    },
  ],

  solution: (v, r) => [
    `Section properties: A = bh = (${v.b})(${v.h}) = ${r.A} mm²; S = bh²/6 = (${v.b})(${v.h})²/6 = ${g(r.S)} mm³.`,
    `Prestress gives a uniform compression P/A = ${v.P}×10³/${r.A} = ${g(r.axial)} MPa, plus bending from its eccentricity: Pe/S = (${v.P}×10³)(${v.e})/${g(r.S)} = ${g(r.ecc)} MPa. The tendon is below the centroid, so this adds compression at the bottom and takes it away at the top.`,
    `Bottom fibre, prestress alone: P/A + Pe/S = ${g(r.axial)} + ${g(r.ecc)} = ${f(r.bottomPrestress)} MPa compression.`,
    `Service load moment at midspan: M = wL²/8 = (${v.w})(${v.L})²/8 = ${g(r.M)} kN·m; M/S = ${g(r.M)}×10⁶/${g(r.S)} = ${g(r.bend)} MPa (compression on top, tension at the bottom).`,
    `Top fibre: P/A − Pe/S + M/S = ${g(r.axial)} − ${g(r.ecc)} + ${g(r.bend)} = ${f(r.top)} MPa compression.`,
    `Zero stress at the bottom when M/S = P/A + Pe/S: M = (${g(r.bottomPrestress)})(${g(r.S)})/10⁶ = ${g((r.bottomPrestress * r.S) / 1e6)} kN·m, so w = 8M/L² = 8(${g((r.bottomPrestress * r.S) / 1e6)})/(${v.L})² = ${f(r.wZeroBottom)} kN/m.`
      + (r.bottom < 0 ? ` The actual load of ${v.w} kN/m is above this, so the bottom fibre is in tension (${f(Math.abs(r.bottom))} MPa) in service.` : ` The actual load of ${v.w} kN/m is below this, so the bottom fibre stays in compression (${f(r.bottom)} MPa) in service.`),
  ],

  refs: ['Prestressed concrete: combined stress f = P/A ± Pe/S ± M/S on the uncracked section', 'NSCP 2015 Section 424.5 — serviceability classes and permissible stresses for prestressed members'],

  // Hand-solved: A = 180000; S = 18e6; P/A = 6.667; Pe/S = 10.0; bottom = 16.67;
  // M = 30(100)/8 = 375; M/S = 20.833; top = 6.667 - 10 + 20.833 = 17.5;
  // zero bottom: M = 16.667(18) = 300 kN·m; w = 8(300)/100 = 24.0.
  reference_instance: {
    vars: { b: 300, h: 600, L: 10, P: 1200, e: 150, w: 30 },
    answers: ['16.7', '17.5', '24.0'],
  },

  status: 'draft',
  bank_version: null,
};

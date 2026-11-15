// MSTE-DE-COOL-001 — Newton's law of cooling, time to reach a temperature.
// Standalone item, no figure. Original scenario and wording (ROADMAP §3).
import { newtonCooling } from '../../../js/models/newtonCooling.js';
import { formatSig } from '../../../js/engine/format.js';

const f = (x) => formatSig(x, 3);
const g = (x) => formatSig(x, 5);

export default {
  id: 'MSTE-DE-COOL-001',
  subject: 'MSTE',
  topic: 'Differential Equations',
  topic_id: 'mste.differential-equations',
  subtopic_id: 'mste.differential-equations.de-applications',
  archetype: 'Newton’s law of cooling: time to cool to a target temperature from two readings',
  format: 'single',
  board_frequency: '6/7 sittings', // the topic's count in content/frequency.json
  difficulty: 2,

  vars: {
    T0: { min: 80, max: 150, step: 10, unit: '°C' },
    Ts: { min: 25, max: 35, step: 5, unit: '°C' },
    T1: { min: 60, max: 120, step: 10, unit: '°C' },
    t1: { min: 5, max: 20, step: 5, unit: 'min' },
    Tt: { min: 40, max: 55, step: 5, unit: '°C' },
  },
  constraints: [
    { rule: 'T1 <= T0 - 10', test: (v) => v.T1 <= v.T0 - 10 },
    { rule: 'Tt <= T1 - 10', test: (v) => v.Tt <= v.T1 - 10 },
    { rule: 'Tt >= Ts + 10', test: (v) => v.Tt >= v.Ts + 10 },
  ],

  stem: 'A tray of soil samples is taken out of a laboratory drying oven at {T0}°C and left on a bench in a room where '
    + 'the air stays at {Ts}°C. After {t1} minutes the samples are at {T1}°C. They may be weighed once they have cooled '
    + 'to {Tt}°C. Assume the samples cool according to Newton’s law of cooling.',

  figure: null,
  model: newtonCooling,
  live: null,

  items: [
    {
      ask: 'Determine the total time, from leaving the oven, before the samples can be weighed.',
      pick: 'tTarget', unit: 'min', sig: 3,
      distractors: [
        { name: 'assumedLinearCooling', value: (v) => (v.t1 * (v.T0 - v.Tt)) / (v.T0 - v.T1) },
        { name: 'ignoredAirTemperature', value: (v) => (v.t1 * Math.log(v.T0 / v.Tt)) / Math.log(v.T0 / v.T1) },
        { name: 'gaveTimeAfterTheReadingOnly', value: (v, r) => r.afterT1 },
        { name: 'scaledByExcessTemperatureRatio', value: (v) => (v.t1 * (v.T1 - v.Ts)) / (v.Tt - v.Ts) },
        { name: 'scaledByInitialExcessRatio', value: (v) => (v.t1 * (v.T0 - v.Ts)) / (v.Tt - v.Ts) },
      ],
    },
  ],

  solution: (v, r) => [
    `Newton’s law: dT/dt = −k(T − T<sub>s</sub>). Separating variables and integrating gives T − T<sub>s</sub> = (T<sub>0</sub> − T<sub>s</sub>)e<sup>−kt</sup>. Work with the excess over the air temperature.`,
    `Initial excess: ${v.T0} − ${v.Ts} = ${v.T0 - v.Ts}°C. At t = ${v.t1} min the excess is ${v.T1} − ${v.Ts} = ${v.T1 - v.Ts}°C.`,
    `Find k: ${v.T1 - v.Ts} = ${v.T0 - v.Ts}e<sup>−${v.t1}k</sup>, so k = ln(${v.T0 - v.Ts}/${v.T1 - v.Ts})/${v.t1} = ${g(r.k)} per minute.`,
    `Target excess: ${v.Tt} − ${v.Ts} = ${v.Tt - v.Ts}°C. Then ${v.Tt - v.Ts} = ${v.T0 - v.Ts}e<sup>−kt</sup> gives t = ln(${v.T0 - v.Ts}/${v.Tt - v.Ts})/k = ${g(Math.log((v.T0 - v.Ts) / (v.Tt - v.Ts)))}/${g(r.k)} = ${f(r.tTarget)} min.`,
    `Cooling slows as the samples near the air temperature, so a straight-line estimate from the first reading is too short.`,
  ],

  refs: ['First-order linear differential equations: Newton’s law of cooling, T = Ts + (T0 − Ts)e^(−kt)'],

  // Hand-solved: k = ln(60/40)/10 = 0.0405465; t = ln(60/15)/k = 1.386294/0.0405465 = 34.19 min.
  reference_instance: {
    vars: { T0: 90, Ts: 30, T1: 70, t1: 10, Tt: 45 },
    answers: ['34.2'],
  },

  status: 'draft',
  bank_version: null,
};

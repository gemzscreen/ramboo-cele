// Stage 3 checks for js/models/excavatorProduction.js.
import { excavatorProduction } from '../../js/models/excavatorProduction.js';
const near = (x, y, tol = 1e-9) => Math.abs(x - y) <= tol * Math.max(1, Math.abs(x), Math.abs(y));
const rejects = (fn, cases, failures) => { for (const bad of cases) { let threw = false; try { fn(bad); } catch { threw = true; } if (!threw) failures.push(`accepted invalid input ${JSON.stringify(bad)}`); } };
const refCheck = (ref, want, failures, tol = 5e-4) => { for (const [k, val] of Object.entries(want)) if (Math.abs(ref[k] - val) > tol * Math.abs(val)) failures.push(`reference instance: ${k} = ${ref[k]}, hand value ${val}`); };

export function check(rng, runs) {
  const failures = [];
  const fail = (msg, v) => { if (failures.length < 10) failures.push(`${msg} for ${JSON.stringify(v)}`); };
  for (let i = 0; i < Math.min(runs, 400); i++) {
    const v = { q: 0.3 + rng() * 3, F: 0.6 + rng() * 0.5, t: 10 + rng() * 40, m: 30 + rng() * 30, s: rng() * 50 };
    const r = excavatorProduction(v);
    // Walk the hour second by second of working time: count whole and partial bucket loads.
    const workSeconds = v.m * 60; let elapsed = 0; let loaded = 0;
    while (elapsed + v.t <= workSeconds) { elapsed += v.t; loaded += v.q * v.F; }
    loaded += ((workSeconds - elapsed) / v.t) * v.q * v.F;
    if (!near(r.loose, loaded, 1e-9)) fail('loose volume differs from the cycle-by-cycle count', v);
    if (!near(r.bank * (1 + v.s / 100), r.loose, 1e-12)) fail('bank x (1 + swell) != loose', v);
    // Scaling: halving the cycle time doubles production; no swell leaves bank = loose.
    if (!near(excavatorProduction({ ...v, t: v.t / 2 }).bank, 2 * r.bank, 1e-9)) fail('halving the cycle time should double production', v);
    if (!near(excavatorProduction({ ...v, s: 0 }).bank, r.loose, 1e-12)) fail('zero swell should give bank = loose', v);
    if (!near(excavatorProduction({ ...v, m: 60 }).loose, v.q * v.F * 3600 / v.t, 1e-9)) fail('a full working hour should give q F 3600/t', v);
  }
  // Hand-solved: 3600/24 = 150 cycles per full hour; 50/60 of the hour worked = 125 cycles; 1.5(0.9)(125) = 168.75 loose; / 1.25 = 135.
  refCheck(excavatorProduction({ q: 1.5, F: 0.9, t: 24, m: 50, s: 25 }), { cyclesPerHour: 125, loose: 168.75, bank: 135 }, failures, 1e-9);
  rejects(excavatorProduction, [{ q: 0, F: 0.9, t: 24, m: 50, s: 25 }, { q: 1.5, F: 0.9, t: 0, m: 50, s: 25 }, { q: 1.5, F: 0.9, t: 24, m: 70, s: 25 }, { q: 1.5, F: 0.9, t: 24, m: 50, s: -5 }], failures);
  return failures;
}

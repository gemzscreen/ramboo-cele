// Stage 3 checks for js/models/superelevation.js.
import { superelevation } from '../../js/models/superelevation.js';
const near = (x, y, tol = 1e-9) => Math.abs(x - y) <= tol * Math.max(1, Math.abs(x), Math.abs(y));
const rejects = (fn, cases, failures) => { for (const bad of cases) { let threw = false; try { fn(bad); } catch { threw = true; } if (!threw) failures.push(`accepted invalid input ${JSON.stringify(bad)}`); } };
const refCheck = (ref, want, failures, tol = 5e-4) => { for (const [k, val] of Object.entries(want)) if (Math.abs(ref[k] - val) > tol * Math.abs(val)) failures.push(`reference instance: ${k} = ${ref[k]}, hand value ${val}`); };

export function check(rng, runs) {
  const failures = [];
  const fail = (msg, v) => { if (failures.length < 10) failures.push(`${msg} for ${JSON.stringify(v)}`); };
  for (let i = 0; i < Math.min(runs, 400); i++) {
    const v = { V: 30 + rng() * 100, e: rng() * 0.12, f: 0.05 + rng() * 0.2 };
    const r = superelevation(v);
    // Point-mass derivation in SI units: tan(bank) = e, v^2 / R = g (e + f) with v in m/s. The 127 constant is 3.6^2 g to three figures.
    const ms = v.V / 3.6; const exact = (ms * ms) / (9.81 * (v.e + v.f));
    if (Math.abs(r.R - exact) > 0.002 * exact) fail('R differs from the SI derivation by more than 0.2%', v);
    if (!near(r.R * 127 * (v.e + v.f), v.V * v.V, 1e-12)) fail('R x 127 x (e + f) != V^2', v);
    // Inverting the formula for the speed a given radius allows must return V.
    if (!near(Math.sqrt(127 * r.R * (v.e + v.f)), v.V, 1e-9)) fail('speed recovered from R does not match V', v);
    if (superelevation({ ...v, V: 2 * v.V }).R < 3.99 * r.R) fail('doubling the speed should quadruple the radius', v);
  }
  // Hand-solved: V = 80, e = 0.08, f = 0.12: R = 6400 / (127 x 0.20) = 6400 / 25.4 = 251.97 m.
  refCheck(superelevation({ V: 80, e: 0.08, f: 0.12 }), { R: 251.9685, eAndF: 0.2 }, failures, 1e-6);
  rejects(superelevation, [{ V: 0, e: 0.08, f: 0.12 }, { V: 80, e: -0.01, f: 0.12 }, { V: 80, e: 0.08, f: 0 }, { V: 80, e: NaN, f: 0.12 }], failures);
  return failures;
}

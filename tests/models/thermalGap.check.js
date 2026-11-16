// Stage 3 checks for js/models/thermalGap.js.
import { thermalGap } from '../../js/models/thermalGap.js';
const near = (x, y, tol = 1e-9) => Math.abs(x - y) <= tol * Math.max(1, Math.abs(x), Math.abs(y));
const rejects = (fn, cases, failures) => { for (const bad of cases) { let threw = false; try { fn(bad); } catch { threw = true; } if (!threw) failures.push(`accepted invalid input ${JSON.stringify(bad)}`); } };
const refCheck = (ref, want, failures, tol = 5e-4) => { for (const [k, val] of Object.entries(want)) if (Math.abs(ref[k] - val) > tol * Math.abs(val)) failures.push(`reference instance: ${k} = ${ref[k]}, hand value ${val}`); };

export function check(rng, runs) {
  const failures = [];
  const fail = (msg, v) => { if (failures.length < 10) failures.push(`${msg} for ${JSON.stringify(v)}`); };
  for (let i = 0; i < Math.min(runs, 400); i++) {
    const v = { L: 5 + rng() * 80, g: 1 + rng() * 30, T0: -5 + rng() * 40, alpha: 8 + rng() * 18 };
    const r = thermalGap(v);
    // Length at temperature T is L(1 + alpha (T - T0)); bisect for the temperature where growth equals the clearance.
    const growth = (T) => v.L * (1 + v.alpha * 1e-6 * (T - v.T0)) - v.L;
    let lo = v.T0; let hi = v.T0 + 1e5;
    for (let k = 0; k < 200; k++) { const mid = (lo + hi) / 2; if (growth(mid) < v.g / 1000) lo = mid; else hi = mid; }
    if (!near(r.Tfinal, lo, 1e-9)) fail('closing temperature differs from the bisection root', v);
    if (!near(growth(r.Tfinal) * 1000, v.g, 1e-9)) fail('expansion at the closing temperature should equal the gap', v);
    // A member twice as long closes the same gap at half the temperature rise.
    if (!near(thermalGap({ ...v, L: 2 * v.L }).dT, r.dT / 2, 1e-9)) fail('doubling the length should halve the temperature rise', v);
  }
  // Hand-solved: dT = 0.009 / (12e-6 x 30) = 0.009 / 0.00036 = 25 deg C; T = 20 + 25 = 45 deg C.
  refCheck(thermalGap({ L: 30, g: 9, T0: 20, alpha: 12 }), { dT: 25, Tfinal: 45 }, failures, 1e-9);
  rejects(thermalGap, [{ L: 0, g: 9, T0: 20, alpha: 12 }, { L: 30, g: -1, T0: 20, alpha: 12 }, { L: 30, g: 9, T0: 20, alpha: 0 }], failures);
  return failures;
}

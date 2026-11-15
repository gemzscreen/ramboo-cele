// Stage 3 checks for js/models/newtonCooling.js.
import { newtonCooling } from '../../js/models/newtonCooling.js';
const near = (x, y, tol = 1e-9) => Math.abs(x - y) <= tol * Math.max(1, Math.abs(x), Math.abs(y));
const rejects = (fn, cases, failures) => { for (const bad of cases) { let threw = false; try { fn(bad); } catch { threw = true; } if (!threw) failures.push(`accepted invalid input ${JSON.stringify(bad)}`); } };
const refCheck = (ref, want, failures, tol = 5e-4) => { for (const [k, val] of Object.entries(want)) if (Math.abs(ref[k] - val) > tol * Math.abs(val)) failures.push(`reference instance: ${k} = ${ref[k]}, hand value ${val}`); };

export function check(rng, runs) {
  const failures = [];
  const fail = (msg, v) => { if (failures.length < 10) failures.push(`${msg} for ${JSON.stringify(v)}`); };
  for (let i = 0; i < Math.min(runs, 200); i++) {
    const Ts = rng() * 40; const T0 = Ts + 20 + rng() * 300; const T1 = Ts + (T0 - Ts) * (0.2 + rng() * 0.75);
    const v = { T0, Ts, T1, t1: 0.5 + rng() * 60, Tt: Ts + (T0 - Ts) * (0.02 + rng() * 0.95) };
    const r = newtonCooling(v);
    if (!near(r.T(0), T0) || !near(r.T(v.t1), T1, 1e-9)) fail('curve misses the two given readings', v);
    if (!near(r.T(r.tTarget), v.Tt, 1e-9)) fail('curve does not reach the target at tTarget', v);
    // Integrate dT/dt = -k (T - Ts) numerically (RK4) up to tTarget.
    let T = T0; const steps = 2000; const dt = r.tTarget / steps; const f = (x) => -r.k * (x - Ts);
    for (let s = 0; s < steps; s++) { const k1 = f(T); const k2 = f(T + (dt * k1) / 2); const k3 = f(T + (dt * k2) / 2); const k4 = f(T + dt * k3); T += (dt * (k1 + 2 * k2 + 2 * k3 + k4)) / 6; }
    if (Math.abs(T - v.Tt) > 1e-6 * (T0 - Ts)) fail(`numerical integration ends at ${T}, not the target`, v);
    // Equal times give equal ratios of excess temperature.
    if (!near((r.T(2 * v.t1) - Ts) / (T1 - Ts), (T1 - Ts) / (T0 - Ts), 1e-9)) fail('excess temperature is not a geometric sequence', v);
    if (!near(r.T(r.halfLife) - Ts, (T0 - Ts) / 2, 1e-9)) fail('half-life', v);
    if ((v.Tt < T1) !== (r.tTarget > v.t1)) fail('a cooler target must take longer than t1', v);
  }
  // Hand-solved: T0 = 90, Ts = 30, T = 70 at 10 min, target 45.
  // k = ln(60/40)/10 = 0.0405465 per min; t = ln(60/15)/k = 1.386294/0.0405465 = 34.190 min.
  refCheck(newtonCooling({ T0: 90, Ts: 30, T1: 70, t1: 10, Tt: 45 }), { k: 0.0405465, tTarget: 34.190, afterT1: 24.190 }, failures, 2e-5);
  rejects(newtonCooling, [{ T0: 90, Ts: 30, T1: 95, t1: 10, Tt: 45 }, { T0: 90, Ts: 30, T1: 70, t1: 0, Tt: 45 }, { T0: 90, Ts: 30, T1: 70, t1: 10, Tt: 20 }, { T0: NaN, Ts: 30, T1: 70, t1: 10, Tt: 45 }], failures);
  return failures;
}

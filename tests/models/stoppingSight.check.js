// Stage 3 checks for js/models/stoppingSight.js.
import { stoppingSight } from '../../js/models/stoppingSight.js';
const near = (x, y, tol = 1e-9) => Math.abs(x - y) <= tol * Math.max(1, Math.abs(x), Math.abs(y));
const rejects = (fn, cases, failures) => { for (const bad of cases) { let threw = false; try { fn(bad); } catch { threw = true; } if (!threw) failures.push(`accepted invalid input ${JSON.stringify(bad)}`); } };
const refCheck = (ref, want, failures, tol = 5e-4) => { for (const [k, val] of Object.entries(want)) if (Math.abs(ref[k] - val) > tol * Math.abs(val)) failures.push(`reference instance: ${k} = ${ref[k]}, hand value ${val}`); };

export function check(rng, runs) {
  const failures = [];
  const fail = (msg, v) => { if (failures.length < 10) failures.push(`${msg} for ${JSON.stringify(v)}`); };
  for (let i = 0; i < Math.min(runs, 300); i++) {
    const v = { V: 20 + rng() * 120, t: rng() * 3, f: 0.2 + rng() * 0.5, G: -9 + rng() * 18 };
    const r = stoppingSight(v);
    const g = 9.81;
    // Work-energy on the slope: kinetic energy = (friction + weight component) x braking distance.
    // Per unit mass: v^2/2 = g (f cos(a) + sin(a)) d ~ g (f + G) d for small slopes (the design assumption).
    if (!near((r.v * r.v) / 2, g * (v.f + v.G / 100) * r.braking, 1e-9)) fail('braking distance fails the energy balance', v);
    // Step the motion in time with constant deceleration.
    let x = 0; let u = r.v; const dt = 1e-3; const a = r.decel;
    while (u > 0) { const du = Math.min(u, a * dt); x += (u - du / 2) * (du / a); u -= du; }
    if (Math.abs(x - r.braking) > 1e-6 * r.braking) fail(`time-stepped braking distance ${x} != ${r.braking}`, v);
    if (!near(r.reaction, (v.V / 3.6) * v.t)) fail('reaction distance', v);
    if (!near(r.ssd, r.reaction + r.braking)) fail('ssd != reaction + braking', v);
    // Downhill is longer than level, which is longer than uphill.
    if (v.f - Math.abs(v.G) / 100 > 0.05) { const dn = stoppingSight({ ...v, G: -Math.abs(v.G) - 0.5 }); const up = stoppingSight({ ...v, G: Math.abs(v.G) + 0.5 }); const lv = stoppingSight({ ...v, G: 0 }); if (!(dn.ssd > lv.ssd && lv.ssd > up.ssd)) fail('grade effect has the wrong sense', v); }
    // The km/h design form: V^2 / (254 (f + G)).
    if (Math.abs(r.braking - (v.V * v.V) / (254 * (v.f + v.G / 100))) > 0.002 * r.braking) fail('disagrees with the V^2/254(f + G) form', v);
  }
  // Hand-solved: V = 80 km/h = 22.222 m/s, t = 2.5 s, f = 0.30, 4% downgrade.
  // Reaction = 55.556 m; braking = 493.83/[2(9.81)(0.26)] = 493.83/5.1012 = 96.807 m; SSD = 152.36 m.
  refCheck(stoppingSight({ V: 80, t: 2.5, f: 0.3, G: -4 }), { v: 22.2222, reaction: 55.5556, braking: 96.807, ssd: 152.363 }, failures, 2e-5);
  rejects(stoppingSight, [{ V: 0, t: 2.5, f: 0.3 }, { V: 80, t: 2.5, f: 0.03, G: -4 }, { V: 80, t: -1, f: 0.3 }, { V: NaN, t: 2.5, f: 0.3 }], failures);
  return failures;
}

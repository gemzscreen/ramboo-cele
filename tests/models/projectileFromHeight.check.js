// Stage 3 checks for js/models/projectileFromHeight.js.
import { projectileFromHeight } from '../../js/models/projectileFromHeight.js';
const near = (x, y, tol = 1e-9) => Math.abs(x - y) <= tol * Math.max(1, Math.abs(x), Math.abs(y));
const rejects = (fn, cases, failures) => { for (const bad of cases) { let threw = false; try { fn(bad); } catch { threw = true; } if (!threw) failures.push(`accepted invalid input ${JSON.stringify(bad)}`); } };
const refCheck = (ref, want, failures, tol = 5e-4) => { for (const [k, val] of Object.entries(want)) if (Math.abs(ref[k] - val) > tol * Math.abs(val)) failures.push(`reference instance: ${k} = ${ref[k]}, hand value ${val}`); };

export function check(rng, runs) {
  const failures = [];
  const fail = (msg, v) => { if (failures.length < 10) failures.push(`${msg} for ${JSON.stringify(v)}`); };
  for (let i = 0; i < runs; i++) {
    const v = { v0: 1 + rng() * 80, theta: rng() * 85, h: rng() * 200 };
    const r = projectileFromHeight(v);
    const g = 9.81;
    if (Math.abs(r.y(r.tFlight)) > 1e-7 * Math.max(1, v.h, r.maxHeight)) fail('height is not zero at landing', v);
    if (!(r.tFlight > 0)) fail('flight time must be positive', v);
    if (!near(r.x(r.tFlight), r.range)) fail('range != x(tFlight)', v);
    // Energy: speed at landing from the velocity components must match v0^2 + 2gh.
    const vyEnd = r.vy - g * r.tFlight;
    if (!near(Math.hypot(r.vx, vyEnd), r.impactSpeed, 1e-9)) fail('impact speed disagrees with energy conservation', v);
    // Peak: reached when vertical velocity is zero.
    if (!near(r.y(r.vy / g), r.maxHeight, 1e-9)) fail('max height', v);
    // Time-stepped path never rises above maxHeight and stays above ground before landing.
    for (let k = 1; k < 50; k++) { const t = (k * r.tFlight) / 50; if (r.y(t) > r.maxHeight + 1e-9 || r.y(t) < -1e-9) { fail('path leaves its bounds', v); break; } }
  }
  // h = 0 reduces to the level-ground formulas.
  const flat = projectileFromHeight({ v0: 30, theta: 40, h: 0 });
  if (!near(flat.range, (900 * Math.sin((80 * Math.PI) / 180)) / 9.81) || !near(flat.tFlight, (60 * Math.sin((40 * Math.PI) / 180)) / 9.81)) failures.push('h = 0 does not reduce to v0^2 sin(2 theta)/g');
  // Hand-solved: v0 = 20 m/s, 30 deg, h = 15 m. vy = 10, vx = 17.3205;
  // t = [10 + sqrt(100 + 2(9.81)(15))]/9.81 = (10 + 19.857)/9.81 = 3.0435 s; range = 17.3205(3.0435) = 52.715 m.
  refCheck(projectileFromHeight({ v0: 20, theta: 30, h: 15 }), { vy: 10, vx: 17.3205, tFlight: 3.0435, range: 52.715 }, failures, 5e-5);
  rejects(projectileFromHeight, [{ v0: 0, theta: 30, h: 15 }, { v0: 20, theta: 90, h: 15 }, { v0: 20, theta: 30, h: -1 }, { v0: NaN, theta: 30, h: 15 }], failures);
  return failures;
}

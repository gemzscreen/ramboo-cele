// Stage 3 checks for js/models/mohrPlane.js.
import { mohrPlane } from '../../js/models/mohrPlane.js';
const near = (x, y, tol = 1e-9) => Math.abs(x - y) <= tol * Math.max(1, Math.abs(x), Math.abs(y));
const rejects = (fn, cases, failures) => { for (const bad of cases) { let threw = false; try { fn(bad); } catch { threw = true; } if (!threw) failures.push(`accepted invalid input ${JSON.stringify(bad)}`); } };
const refCheck = (ref, want, failures, tol = 5e-4) => { for (const [k, val] of Object.entries(want)) if (Math.abs(ref[k] - val) > tol * Math.abs(val)) failures.push(`reference instance: ${k} = ${ref[k]}, hand value ${val}`); };

import { rotateStress } from '../../js/models/mohrPlane.js';
export function check(rng, runs) {
  const failures = [];
  const fail = (msg, v) => { if (failures.length < 10) failures.push(`${msg} for ${JSON.stringify(v)}`); };
  for (let i = 0; i < runs; i++) {
    const v = { sx: -200 + rng() * 400, sy: -200 + rng() * 400, txy: -150 + rng() * 300 };
    const r = mohrPlane(v);
    // Stress invariants.
    if (!near(r.s1 + r.s2, v.sx + v.sy, 1e-9)) fail('s1 + s2 != sx + sy', v);
    if (!near(r.s1 * r.s2, v.sx * v.sy - v.txy ** 2, 1e-7)) fail('s1 s2 != sx sy - txy^2', v);
    // Turning the element to thetaP removes the shear and gives s1; 90 degrees on gives s2.
    const p = rotateStress(v, r.thetaP); const q = rotateStress(v, r.thetaP + 90);
    if (Math.abs(p.tau) > 1e-9 * (1 + r.R) || !near(p.sigma, r.s1, 1e-9) || !near(q.sigma, r.s2, 1e-9)) fail('rotating to thetaP does not give the principal stresses', v);
    // At 45 degrees from the principal direction the shear is tauMax and the normal stress is the average.
    const m = rotateStress(v, r.thetaP + 45);
    if (!near(Math.abs(m.tau), r.tauMax, 1e-9) || !near(m.sigma, r.avg, 1e-9)) fail('45 degrees from principal should give tauMax at the average stress', v);
    // No orientation has a larger normal stress than s1.
    let big = -Infinity; for (let a = 0; a < 180; a += 0.5) big = Math.max(big, rotateStress(v, a).sigma);
    if (big > r.s1 + 1e-9 * (1 + Math.abs(r.s1))) fail('a scanned plane exceeds s1', v);
    if (!(r.thetaP > -90 && r.thetaP <= 90)) fail('thetaP out of range', v);
  }
  // Hand-solved: sx = 80, sy = 20, txy = 40. avg = 50; R = sqrt(30^2 + 40^2) = 50;
  // s1 = 100, s2 = 0, tau_max = 50; tan(2 theta) = 80/60, theta = 26.565 deg.
  refCheck(mohrPlane({ sx: 80, sy: 20, txy: 40 }), { avg: 50, R: 50, s1: 100, tauMax: 50, thetaP: 26.565 }, failures, 1e-5);
  if (Math.abs(mohrPlane({ sx: 80, sy: 20, txy: 40 }).s2) > 1e-9) failures.push('reference instance: s2 should be 0');
  rejects(mohrPlane, [{ sx: NaN, sy: 20, txy: 40 }, { sx: 80, sy: Infinity, txy: 40 }], failures);
  return failures;
}

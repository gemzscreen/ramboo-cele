// Stage 3 checks for js/models/endAreaVolume.js.
import { endAreaVolume } from '../../js/models/endAreaVolume.js';
const near = (x, y, tol = 1e-9) => Math.abs(x - y) <= tol * Math.max(1, Math.abs(x), Math.abs(y));
const rejects = (fn, cases, failures) => { for (const bad of cases) { let threw = false; try { fn(bad); } catch { threw = true; } if (!threw) failures.push(`accepted invalid input ${JSON.stringify(bad)}`); } };
const refCheck = (ref, want, failures, tol = 5e-4) => { for (const [k, val] of Object.entries(want)) if (Math.abs(ref[k] - val) > tol * Math.abs(val)) failures.push(`reference instance: ${k} = ${ref[k]}, hand value ${val}`); };

export function check(rng, runs) {
  const failures = [];
  const fail = (msg, v) => { if (failures.length < 10) failures.push(`${msg} for ${JSON.stringify(v)}`); };
  for (let i = 0; i < Math.min(runs, 300); i++) {
    const v = { d: 5 + rng() * 30, A1: rng() * 40, A2: rng() * 40, A3: rng() * 40, A4: rng() * 40 };
    const r = endAreaVolume(v);
    // Integrate the piecewise-linear area curve over 3d by the midpoint rule.
    const A = [v.A1, v.A2, v.A3, v.A4]; const n = 30000; const h = (3 * v.d) / n; let integral = 0;
    for (let j = 0; j < n; j++) { const x = (j + 0.5) * h; const k = Math.min(2, Math.floor(x / v.d)); const u = (x - k * v.d) / v.d; integral += (A[k] * (1 - u) + A[k + 1] * u) * h; }
    if (!near(r.volume, integral, 1e-8)) fail('volume differs from integrating the linear area profile', v);
    const rev = endAreaVolume({ d: v.d, A1: v.A4, A2: v.A3, A3: v.A2, A4: v.A1 });
    if (!near(rev.volume, r.volume, 1e-12)) fail('volume should not depend on the direction of travel', v);
    const c = v.A1; if (!near(endAreaVolume({ d: v.d, A1: c, A2: c, A3: c, A4: c }).volume, 3 * v.d * c, 1e-12)) fail('constant section should give 3 d A', v);
  }
  // Hand-solved: d = 20; segments 20(12.5 + 18)/2 = 305, 20(18 + 22.5)/2 = 405, 20(22.5 + 15)/2 = 375; total 1085 m3.
  const ref = endAreaVolume({ d: 20, A1: 12.5, A2: 18, A3: 22.5, A4: 15 });
  refCheck(ref, { volume: 1085 }, failures, 1e-12);
  if (JSON.stringify(ref.seg) !== JSON.stringify([305, 405, 375])) failures.push(`reference instance: segments ${ref.seg}, hand values 305, 405, 375`);
  rejects(endAreaVolume, [{ d: 0, A1: 1, A2: 1, A3: 1, A4: 1 }, { d: 20, A1: -1, A2: 1, A3: 1, A4: 1 }, { d: 20, A1: NaN, A2: 1, A3: 1, A4: 1 }], failures);
  return failures;
}

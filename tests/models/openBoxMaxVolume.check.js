// Stage 3 checks for js/models/openBoxMaxVolume.js.
import { openBoxMaxVolume } from '../../js/models/openBoxMaxVolume.js';
const near = (x, y, tol = 1e-9) => Math.abs(x - y) <= tol * Math.max(1, Math.abs(x), Math.abs(y));
const rejects = (fn, cases, failures) => { for (const bad of cases) { let threw = false; try { fn(bad); } catch { threw = true; } if (!threw) failures.push(`accepted invalid input ${JSON.stringify(bad)}`); } };
const refCheck = (ref, want, failures, tol = 5e-4) => { for (const [k, val] of Object.entries(want)) if (Math.abs(ref[k] - val) > tol * Math.abs(val)) failures.push(`reference instance: ${k} = ${ref[k]}, hand value ${val}`); };

export function check(rng, runs) {
  const failures = [];
  const fail = (msg, v) => { if (failures.length < 10) failures.push(`${msg} for ${JSON.stringify(v)}`); };
  for (let i = 0; i < runs; i++) {
    const v = { a: 5 + rng() * 200, b: 5 + rng() * 200 };
    const r = openBoxMaxVolume(v);
    const short = Math.min(v.a, v.b);
    if (!(r.x > 0 && r.x < short / 2)) fail('cut is not a feasible size', v);
    // Brute force over the feasible range, without using the derivative.
    let best = 0; let bestX = 0; const n = 20000;
    for (let k = 1; k < n; k++) { const x = (k * short) / (2 * n); const vol = r.V(x); if (vol > best) { best = vol; bestX = x; } }
    if (best > r.Vmax * (1 + 1e-9) || r.Vmax - best > 1e-6 * r.Vmax) fail(`Vmax ${r.Vmax} is not the scanned maximum ${best}`, v);
    if (Math.abs(bestX - r.x) > short / n) fail('x is not where the scan peaks', v);
    // Stationary: derivative vanishes at both roots.
    const dV = (x) => 12 * x * x - 4 * (v.a + v.b) * x + v.a * v.b;
    if (Math.abs(dV(r.x)) > 1e-8 * v.a * v.b || Math.abs(dV(r.xOther)) > 1e-8 * v.a * v.b) fail('dV/dx != 0 at the roots', v);
    if (!(r.xOther >= short / 2 - 1e-9)) fail('other root should not be feasible', v);
    if (!near(r.Vmax, r.x * r.length * r.width)) fail('Vmax != x * length * width', v);
  }
  // Square sheet: x = a/6.
  if (!near(openBoxMaxVolume({ a: 30, b: 30 }).x, 5)) failures.push('square sheet should give x = a/6');
  // Hand-solved: 40 by 25. 12x^2 - 260x + 1000 = 0 -> x = [65 - sqrt(1600 - 1000 + 625)]/6 = (65 - 35)/6 = 5;
  // V = 5(30)(15) = 2250.
  refCheck(openBoxMaxVolume({ a: 40, b: 25 }), { x: 5, length: 30, width: 15, Vmax: 2250 }, failures, 1e-9);
  rejects(openBoxMaxVolume, [{ a: 0, b: 25 }, { a: 40, b: -2 }, { a: NaN, b: 25 }], failures);
  return failures;
}

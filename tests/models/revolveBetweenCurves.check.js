// Stage 3 checks for js/models/revolveBetweenCurves.js.
import { revolveBetweenCurves } from '../../js/models/revolveBetweenCurves.js';
const near = (x, y, tol = 1e-9) => Math.abs(x - y) <= tol * Math.max(1, Math.abs(x), Math.abs(y));
const rejects = (fn, cases, failures) => { for (const bad of cases) { let threw = false; try { fn(bad); } catch { threw = true; } if (!threw) failures.push(`accepted invalid input ${JSON.stringify(bad)}`); } };
const refCheck = (ref, want, failures, tol = 5e-4) => { for (const [k, val] of Object.entries(want)) if (Math.abs(ref[k] - val) > tol * Math.abs(val)) failures.push(`reference instance: ${k} = ${ref[k]}, hand value ${val}`); };

export function check(rng, runs) {
  const failures = [];
  const fail = (msg, v) => { if (failures.length < 10) failures.push(`${msg} for ${JSON.stringify(v)}`); };
  for (let i = 0; i < Math.min(runs, 200); i++) {
    const v = { a: 0.3 + rng() * 3, b: 0.5 + rng() * 5 };
    const r = revolveBetweenCurves(v);
    // Composite Simpson on the washer area pi (top^2 - bottom^2), with top = b x and bottom = a x^2.
    const n = 2000; const h = r.X / n; let s = 0;
    const w = (x) => Math.PI * ((v.b * x) ** 2 - (v.a * x * x) ** 2);
    for (let j = 0; j <= n; j++) s += (j === 0 || j === n ? 1 : j % 2 ? 4 : 2) * w(j * h);
    s *= h / 3;
    if (!near(r.volume, s, 1e-9)) fail('volume differs from numerical integration of the washers', v);
    if (Math.abs(v.a * r.X ** 2 - v.b * r.X) > 1e-9 * v.b * r.X) fail('the curves do not meet at x = b/a', v);
    if (!(r.volume < r.outerOnly && r.volume > 0)) fail('volume should be below the solid made by the line alone', v);
    if (!near(r.outerOnly - r.innerOnly, r.volume, 1e-9)) fail('outer solid minus inner solid should equal the volume', v);
  }
  // Hand-solved: a = 1, b = 2: meet at x = 2; V = pi[4x^3/3 - x^5/5] from 0 to 2 = pi(32/3 - 32/5) = 64 pi / 15 = 13.4041.
  refCheck(revolveBetweenCurves({ a: 1, b: 2 }), { X: 2, volume: 13.40413 }, failures, 1e-6);
  rejects(revolveBetweenCurves, [{ a: 0, b: 2 }, { a: 1, b: -2 }, { a: NaN, b: 2 }], failures);
  return failures;
}

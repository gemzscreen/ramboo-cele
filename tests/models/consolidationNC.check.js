// Stage 3 checks for js/models/consolidationNC.js.
import { consolidationNC } from '../../js/models/consolidationNC.js';
const near = (x, y, tol = 1e-9) => Math.abs(x - y) <= tol * Math.max(1, Math.abs(x), Math.abs(y));
const rejects = (fn, cases, failures) => { for (const bad of cases) { let threw = false; try { fn(bad); } catch { threw = true; } if (!threw) failures.push(`accepted invalid input ${JSON.stringify(bad)}`); } };
const refCheck = (ref, want, failures, tol = 5e-4) => { for (const [k, val] of Object.entries(want)) if (Math.abs(ref[k] - val) > tol * Math.abs(val)) failures.push(`reference instance: ${k} = ${ref[k]}, hand value ${val}`); };

export function check(rng, runs) {
  const failures = [];
  const fail = (msg, v) => { if (failures.length < 10) failures.push(`${msg} for ${JSON.stringify(v)}`); };
  for (let i = 0; i < runs; i++) {
    const v = { H: 0.5 + rng() * 12, e0: 0.6 + rng() * 1.6, Cc: 0.1 + rng() * 0.6, p0: 20 + rng() * 300, dp: 5 + rng() * 300 };
    let r; try { r = consolidationNC(v); } catch { continue; }
    // Phase diagram: the solids keep their height Hs = H/(1 + e0); the layer shrinks to Hs(1 + e1).
    const Hs = v.H / (1 + v.e0);
    if (!near(r.S / 1000, v.H - Hs * (1 + r.e1), 1e-9)) fail('settlement != change in layer height from the phase diagram', v);
    // The point (log p, e) stays on the straight virgin line of slope Cc.
    if (!near((v.e0 - r.e1) / (Math.log10(v.p0 + v.dp) - Math.log10(v.p0)), v.Cc, 1e-9)) fail('slope of e-log p line != Cc', v);
    // Loading in two stages gives the same total as loading at once.
    const s1 = consolidationNC({ ...v, dp: v.dp / 3 });
    const s2 = consolidationNC({ H: v.H, e0: v.e0, Cc: v.Cc, p0: v.p0 + v.dp / 3, dp: (2 * v.dp) / 3 });
    if (!near(s1.de + s2.de, r.de, 1e-9)) fail('two-stage loading does not add up', v);
    if (!(r.S > 0 && r.S < v.H * 1000)) fail('settlement out of range', v);
    if (!near(r.strain * v.H * 1000, r.S)) fail('S != strain x H', v);
  }
  // Hand-solved: H = 4 m, e0 = 1.10, Cc = 0.36, p0 = 80, dp = 60.
  // ratio = 1.75; log10 = 0.243038; de = 0.36(0.2430380) = 0.0874937; S = 4000(0.0874937)/2.10 = 166.655 mm; e1 = 1.01251.
  refCheck(consolidationNC({ H: 4, e0: 1.1, Cc: 0.36, p0: 80, dp: 60 }), { ratio: 1.75, de: 0.0874937, S: 166.655, e1: 1.01251 }, failures, 2e-5);
  rejects(consolidationNC, [{ H: 0, e0: 1.1, Cc: 0.36, p0: 80, dp: 60 }, { H: 4, e0: 1.1, Cc: 0.36, p0: 80, dp: -5 }, { H: 4, e0: 0.05, Cc: 0.9, p0: 10, dp: 900 }, { H: 4, e0: NaN, Cc: 0.36, p0: 80, dp: 60 }], failures);
  return failures;
}

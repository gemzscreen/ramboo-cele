// Stage 3 checks for js/models/peakHourFactor.js.
import { peakHourFactor } from '../../js/models/peakHourFactor.js';
const near = (x, y, tol = 1e-9) => Math.abs(x - y) <= tol * Math.max(1, Math.abs(x), Math.abs(y));
const rejects = (fn, cases, failures) => { for (const bad of cases) { let threw = false; try { fn(bad); } catch { threw = true; } if (!threw) failures.push(`accepted invalid input ${JSON.stringify(bad)}`); } };
const refCheck = (ref, want, failures, tol = 5e-4) => { for (const [k, val] of Object.entries(want)) if (Math.abs(ref[k] - val) > tol * Math.abs(val)) failures.push(`reference instance: ${k} = ${ref[k]}, hand value ${val}`); };

export function check(rng, runs) {
  const failures = [];
  const fail = (msg, v) => { if (failures.length < 10) failures.push(`${msg} for ${JSON.stringify(v)}`); };
  for (let i = 0; i < Math.min(runs, 400); i++) {
    const v = { v1: 50 + rng() * 300, v2: 50 + rng() * 300, v3: 50 + rng() * 300, v4: 50 + rng() * 300 };
    const r = peakHourFactor(v);
    // PHF is the mean 15-minute count over the highest one.
    const c = [v.v1, v.v2, v.v3, v.v4];
    if (!near(r.phf, (c.reduce((s, x) => s + x, 0) / 4) / Math.max(...c), 1e-12)) fail('PHF != mean count / highest count', v);
    if (!(r.phf > 0.25 - 1e-12 && r.phf <= 1 + 1e-12)) fail('PHF must lie in (0.25, 1]', v);
    if (!near(peakHourFactor({ v1: v.v4, v2: v.v3, v3: v.v2, v4: v.v1 }).phf, r.phf, 1e-12)) fail('PHF should not depend on the order of the intervals', v);
    if (!near(r.peakRate * r.phf, r.total, 1e-9)) fail('peak rate x PHF should equal the hourly volume', v);
    if (!near(peakHourFactor({ v1: v.v1, v2: v.v1, v3: v.v1, v4: v.v1 }).phf, 1, 1e-12)) fail('equal counts should give PHF = 1', v);
  }
  // Hand-solved: 210 + 250 + 300 + 240 = 1000 vehicles; highest 15-minute count 300; PHF = 1000 / (4 x 300) = 0.8333; peak rate 1200 veh/h.
  refCheck(peakHourFactor({ v1: 210, v2: 250, v3: 300, v4: 240 }), { total: 1000, max15: 300, phf: 0.833333, peakRate: 1200 }, failures, 1e-6);
  rejects(peakHourFactor, [{ v1: 0, v2: 250, v3: 300, v4: 240 }, { v1: 210, v2: -3, v3: 300, v4: 240 }, { v1: 210, v2: 250, v3: NaN, v4: 240 }], failures);
  return failures;
}

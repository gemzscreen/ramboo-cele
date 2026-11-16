// Stage 3 checks for js/models/breakEvenTwoOptions.js.
import { breakEvenTwoOptions } from '../../js/models/breakEvenTwoOptions.js';
const near = (x, y, tol = 1e-9) => Math.abs(x - y) <= tol * Math.max(1, Math.abs(x), Math.abs(y));
const rejects = (fn, cases, failures) => { for (const bad of cases) { let threw = false; try { fn(bad); } catch { threw = true; } if (!threw) failures.push(`accepted invalid input ${JSON.stringify(bad)}`); } };
const refCheck = (ref, want, failures, tol = 5e-4) => { for (const [k, val] of Object.entries(want)) if (Math.abs(ref[k] - val) > tol * Math.abs(val)) failures.push(`reference instance: ${k} = ${ref[k]}, hand value ${val}`); };

export function check(rng, runs) {
  const failures = [];
  const fail = (msg, v) => { if (failures.length < 10) failures.push(`${msg} for ${JSON.stringify(v)}`); };
  for (let i = 0; i < Math.min(runs, 400); i++) {
    const v = { F2: rng() * 50000, v1: rng() * 500 }; v.F1 = v.F2 + 1000 + rng() * 80000; v.v2 = v.v1 + 10 + rng() * 400;
    const r = breakEvenTwoOptions(v);
    // Bisection on cost1 - cost2, which is positive at zero output and negative at a very large output.
    let lo = 0; let hi = 1e9;
    for (let k = 0; k < 200; k++) { const mid = (lo + hi) / 2; if (r.cost1(mid) - r.cost2(mid) > 0) lo = mid; else hi = mid; }
    if (!near(r.Q, lo, 1e-9)) fail('Q differs from the bisection root', v);
    if (!near(r.cost1(r.Q), r.cost2(r.Q), 1e-9) || !near(r.costAtQ, r.cost2(r.Q), 1e-9)) fail('the two costs should be equal at Q', v);
    if (!(r.cost1(r.Q * 0.5) > r.cost2(r.Q * 0.5) && r.cost1(r.Q * 1.5) < r.cost2(r.Q * 1.5))) fail('option 1 should be dearer below Q and cheaper above it', v);
  }
  // Hand-solved: (90 000 - 30 000)/(650 - 500) = 400 m3; cost there 90 000 + 500(400) = 290 000 = 30 000 + 650(400).
  refCheck(breakEvenTwoOptions({ F1: 90000, v1: 500, F2: 30000, v2: 650 }), { Q: 400, costAtQ: 290000 }, failures, 1e-12);
  rejects(breakEvenTwoOptions, [{ F1: 30000, v1: 500, F2: 90000, v2: 650 }, { F1: 90000, v1: 650, F2: 30000, v2: 500 }, { F1: 90000, v1: 500, F2: 30000, v2: 500 }], failures);
  return failures;
}

// Stage 3 checks for js/models/crashCost.js.
import { crashCost } from '../../js/models/crashCost.js';
const near = (x, y, tol = 1e-9) => Math.abs(x - y) <= tol * Math.max(1, Math.abs(x), Math.abs(y));
const rejects = (fn, cases, failures) => { for (const bad of cases) { let threw = false; try { fn(bad); } catch { threw = true; } if (!threw) failures.push(`accepted invalid input ${JSON.stringify(bad)}`); } };
const refCheck = (ref, want, failures, tol = 5e-4) => { for (const [k, val] of Object.entries(want)) if (Math.abs(ref[k] - val) > tol * Math.abs(val)) failures.push(`reference instance: ${k} = ${ref[k]}, hand value ${val}`); };

export function check(rng, runs) {
  const failures = [];
  const fail = (msg, v) => { if (failures.length < 10) failures.push(`${msg} for ${JSON.stringify(v)}`); };
  for (let i = 0; i < Math.min(runs, 400); i++) {
    const int = (lo, hi) => lo + Math.floor(rng() * (hi - lo + 1));
    const v = { mA: int(1, 6), mB: int(1, 6), mC: int(1, 6), cA: int(1, 20), cB: int(1, 20), cC: int(1, 20) };
    v.d = int(1, v.mA + v.mB + v.mC);
    // Try every whole-day split of the d days between the three activities and keep the cheapest.
    let best = Infinity;
    for (let a = 0; a <= v.mA; a++) for (let b = 0; b <= v.mB; b++) { const c = v.d - a - b; if (c >= 0 && c <= v.mC) best = Math.min(best, a * v.cA + b * v.cB + c * v.cC); }
    const r = crashCost(v);
    if (!near(r.cost, best, 1e-12)) fail(`cost ${r.cost} differs from the exhaustive minimum ${best}`, v);
    if (r.taken.reduce((s, t) => s + t.days, 0) !== v.d) fail('days taken do not add up to d', v);
    if (r.dearestFirstCost < r.cost - 1e-9) fail('dearest-first cost should never beat the cheapest-first cost', v);
    if (r.cost > r.fullCrashCost + 1e-9) fail('cost exceeds crashing everything', v);
    if (crashCost({ ...v, d: v.mA + v.mB + v.mC }).cost !== r.fullCrashCost) fail('saving every available day should cost the full-crash amount', v);
  }
  // Hand-solved: A 3 d @ 4, B 4 d @ 6, C 2 d @ 9, save 5 days: A fully (12) + B two days (12) = 24; dearest first: C 2 d (18) + B 3 d (18) = 36; full crash 12 + 24 + 18 = 54.
  refCheck(crashCost({ mA: 3, cA: 4, mB: 4, cB: 6, mC: 2, cC: 9, d: 5 }), { cost: 24, dearestFirstCost: 36, fullCrashCost: 54 }, failures, 1e-12);
  rejects(crashCost, [{ mA: 3, cA: 4, mB: 4, cB: 6, mC: 2, cC: 9, d: 10 }, { mA: 0, cA: 4, mB: 4, cB: 6, mC: 2, cC: 9, d: 2 }, { mA: 3, cA: 4, mB: 4, cB: 6, mC: 2, cC: NaN, d: 2 }], failures);
  return failures;
}

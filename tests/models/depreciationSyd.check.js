// Stage 3 checks for js/models/depreciationSyd.js.
import { depreciationSyd } from '../../js/models/depreciationSyd.js';
const near = (x, y, tol = 1e-9) => Math.abs(x - y) <= tol * Math.max(1, Math.abs(x), Math.abs(y));
const rejects = (fn, cases, failures) => { for (const bad of cases) { let threw = false; try { fn(bad); } catch { threw = true; } if (!threw) failures.push(`accepted invalid input ${JSON.stringify(bad)}`); } };
const refCheck = (ref, want, failures, tol = 5e-4) => { for (const [k, val] of Object.entries(want)) if (Math.abs(ref[k] - val) > tol * Math.abs(val)) failures.push(`reference instance: ${k} = ${ref[k]}, hand value ${val}`); };

export function check(rng, runs) {
  const failures = [];
  const fail = (msg, v) => { if (failures.length < 10) failures.push(`${msg} for ${JSON.stringify(v)}`); };
  for (let i = 0; i < Math.min(runs, 400); i++) {
    const n = 1 + Math.floor(rng() * 25); const C = 100 + rng() * 1e6;
    const v = { C, S: rng() * 0.6 * C, n, k: Math.floor(rng() * (n + 1)) };
    const r = depreciationSyd(v);
    // Digits n, n-1, ..., 1 add to the sum; all charges together write off C - S.
    let digits = 0; let all = 0; for (let j = 1; j <= n; j++) { digits += j; all += r.charge(j); }
    if (digits !== r.sum) fail('sum of the digits', v);
    if (!near(all, C - v.S, 1e-9)) fail('charges over the whole life != C - S', v);
    if (!near(depreciationSyd({ ...v, k: n }).bookValue, v.S, 1e-9)) fail('book value at end of life != salvage', v);
    if (!near(depreciationSyd({ ...v, k: 0 }).bookValue, C)) fail('book value at age 0 != first cost', v);
    // Closed form: remaining digits (n-k)(n-k+1)/2 over the sum.
    const left = ((n - v.k) * (n - v.k + 1)) / 2;
    if (!near(r.bookValue, v.S + (left / r.sum) * (C - v.S), 1e-9)) fail('book value disagrees with the remaining-digits form', v);
    // Charges fall by a constant amount each year, and SYD is never behind straight line.
    if (n >= 3 && !near(r.charge(1) - r.charge(2), r.charge(2) - r.charge(3), 1e-9)) fail('charges should fall by a constant step', v);
    if (r.bookValue > r.straightLineBookValue + 1e-9 * C) fail('SYD book value should not exceed straight-line', v);
  }
  // Hand-solved: C = 1200, S = 150, n = 6, k = 3. Sum = 21; charges 6/21, 5/21, 4/21 of 1050 = 300 + 250 + 200 = 750;
  // book value = 1200 - 750 = 450 (straight line would give 1200 - 525 = 675).
  refCheck(depreciationSyd({ C: 1200, S: 150, n: 6, k: 3 }), { sum: 21, total: 750, bookValue: 450, chargeInYearK: 200, straightLineBookValue: 675 }, failures, 1e-9);
  rejects(depreciationSyd, [{ C: 0, S: 0, n: 6, k: 3 }, { C: 1200, S: 1500, n: 6, k: 3 }, { C: 1200, S: 150, n: 6, k: 7 }, { C: 1200, S: 150, n: 6.5, k: 3 }], failures);
  return failures;
}

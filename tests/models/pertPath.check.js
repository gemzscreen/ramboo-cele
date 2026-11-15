// Stage 3 checks for js/models/pertPath.js.
import { pertPath } from '../../js/models/pertPath.js';
const near = (x, y, tol = 1e-9) => Math.abs(x - y) <= tol * Math.max(1, Math.abs(x), Math.abs(y));
const rejects = (fn, cases, failures) => { for (const bad of cases) { let threw = false; try { fn(bad); } catch { threw = true; } if (!threw) failures.push(`accepted invalid input ${JSON.stringify(bad)}`); } };
const refCheck = (ref, want, failures, tol = 5e-4) => { for (const [k, val] of Object.entries(want)) if (Math.abs(ref[k] - val) > tol * Math.abs(val)) failures.push(`reference instance: ${k} = ${ref[k]}, hand value ${val}`); };

export function check(rng, runs) {
  const failures = [];
  const fail = (msg, v) => { if (failures.length < 10) failures.push(`${msg} for ${JSON.stringify(v)}`); };
  for (let i = 0; i < runs; i++) {
    const acts = Array.from({ length: 1 + Math.floor(rng() * 6) }, () => { const a = 1 + rng() * 20; const m = a + rng() * 20; return { a, m, b: m + rng() * 30 }; });
    const r = pertPath(acts);
    let T = 0; let varSum = 0;
    for (const [k, x] of acts.entries()) {
      const row = r.rows[k];
      if (!(row.te >= x.a - 1e-12 && row.te <= x.b + 1e-12)) fail('te lies outside [a, b]', x);
      // Weighted mean with weights 1:4:1, and the range covering six standard deviations.
      if (!near(6 * row.te, x.a + 4 * x.m + x.b)) fail('te is not the 1-4-1 weighted mean', x);
      if (!near(6 * Math.sqrt(row.variance), x.b - x.a)) fail('six sigma != b - a', x);
      // Skew: te is above m when the pessimistic tail is longer, below when shorter.
      if (Math.sign(row.te - x.m) !== Math.sign((x.b - x.m) - (x.m - x.a)) && Math.abs(row.te - x.m) > 1e-12) fail('te is on the wrong side of m', x);
      T += row.te; varSum += row.variance;
    }
    if (!near(r.T, T) || !near(r.variance, varSum) || !near(r.sd * r.sd, varSum)) fail('path totals do not add up', acts);
    // Order of activities on the path does not matter.
    if (!near(pertPath(acts.slice().reverse()).T, r.T)) fail('T depends on the order', acts);
  }
  const sym = pertPath([{ a: 4, m: 7, b: 10 }]);
  if (!near(sym.T, 7)) failures.push('symmetric estimates should give te = m');
  // Hand-solved: (6, 9, 15) -> 57/6 = 9.5; (10, 14, 24) -> 90/6 = 15; (5, 8, 11) -> 48/6 = 8. T = 32.5.
  // Variances: (9/6)^2 = 2.25; (14/6)^2 = 5.4444; (6/6)^2 = 1; sum 8.6944; sd = 2.9486.
  refCheck(pertPath([{ a: 6, m: 9, b: 15 }, { a: 10, m: 14, b: 24 }, { a: 5, m: 8, b: 11 }]), { T: 32.5, variance: 8.69444, sd: 2.94863, sumMostLikely: 31 }, failures, 1e-5);
  rejects(pertPath, [[], [{ a: 5, m: 4, b: 9 }], [{ a: 5, m: 6, b: NaN }], [{ a: 0, m: 6, b: 9 }]], failures);
  return failures;
}

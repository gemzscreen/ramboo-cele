// Stage 3 checks for js/models/binomialProb.js.
import { binomialProb } from '../../js/models/binomialProb.js';
const near = (x, y, tol = 1e-9) => Math.abs(x - y) <= tol * Math.max(1, Math.abs(x), Math.abs(y));
const rejects = (fn, cases, failures) => { for (const bad of cases) { let threw = false; try { fn(bad); } catch { threw = true; } if (!threw) failures.push(`accepted invalid input ${JSON.stringify(bad)}`); } };
const refCheck = (ref, want, failures, tol = 5e-4) => { for (const [k, val] of Object.entries(want)) if (Math.abs(ref[k] - val) > tol * Math.abs(val)) failures.push(`reference instance: ${k} = ${ref[k]}, hand value ${val}`); };

import { choose } from '../../js/models/binomialProb.js';
export function check(rng, runs) {
  const failures = [];
  const fail = (msg, v) => { if (failures.length < 10) failures.push(`${msg} for ${JSON.stringify(v)}`); };
  for (let i = 0; i < Math.min(runs, 300); i++) {
    const n = 1 + Math.floor(rng() * 20);
    const v = { n, k: Math.floor(rng() * (n + 1)), p: 0.02 + rng() * 0.96 };
    const r = binomialProb(v);
    // Build the distribution one trial at a time (no combinations formula).
    let dist = [1];
    for (let t = 0; t < n; t++) { const next = new Array(dist.length + 1).fill(0); dist.forEach((pr, j) => { next[j] += pr * (1 - v.p); next[j + 1] += pr * v.p; }); dist = next; }
    if (!near(r.exactly, dist[v.k], 1e-9)) fail('P(X = k) disagrees with trial-by-trial build-up', v);
    if (!near(r.atMost, dist.slice(0, v.k + 1).reduce((a, b) => a + b, 0), 1e-9)) fail('P(X <= k)', v);
    if (!near(r.atLeast, dist.slice(v.k).reduce((a, b) => a + b, 0), 1e-9)) fail('P(X >= k)', v);
    let total = 0; let mean = 0; for (let j = 0; j <= n; j++) { total += r.pmf(j); mean += j * r.pmf(j); }
    if (!near(total, 1, 1e-9)) fail('probabilities do not add to 1', v);
    if (!near(mean, r.mean, 1e-9)) fail('mean != np', v);
    if (!near(r.none, (1 - v.p) ** n)) fail('P(none)', v);
  }
  // Pascal's rule for the combination count.
  for (let n = 1; n <= 30; n++) for (let k = 1; k < n; k++) if (choose(n, k) !== choose(n - 1, k - 1) + choose(n - 1, k)) { failures.push(`choose(${n}, ${k}) breaks Pascal's rule`); n = 99; break; }
  // Hand-solved: n = 10, k = 2, p = 0.10. C = 45; 0.1^2 = 0.01; 0.9^8 = 0.430467; P = 45(0.01)(0.430467) = 0.19371.
  refCheck(binomialProb({ n: 10, k: 2, p: 0.1 }), { C: 45, exactly: 0.19371, none: 0.348678 }, failures, 1e-5);
  rejects(binomialProb, [{ n: 10, k: 11, p: 0.1 }, { n: 10, k: 2, p: 0 }, { n: 10, k: 2, p: 1 }, { n: 2.5, k: 1, p: 0.1 }, { n: 10, k: -1, p: 0.1 }], failures);
  return failures;
}

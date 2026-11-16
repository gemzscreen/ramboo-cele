// Stage 3 checks for js/models/normalProbability.js.
import { normalProbability } from '../../js/models/normalProbability.js';
const near = (x, y, tol = 1e-9) => Math.abs(x - y) <= tol * Math.max(1, Math.abs(x), Math.abs(y));
const rejects = (fn, cases, failures) => { for (const bad of cases) { let threw = false; try { fn(bad); } catch { threw = true; } if (!threw) failures.push(`accepted invalid input ${JSON.stringify(bad)}`); } };
const refCheck = (ref, want, failures, tol = 5e-4) => { for (const [k, val] of Object.entries(want)) if (Math.abs(ref[k] - val) > tol * Math.abs(val)) failures.push(`reference instance: ${k} = ${ref[k]}, hand value ${val}`); };

import { erf, phi } from '../../js/models/normalProbability.js';

export function check(rng, runs) {
  const failures = [];
  const fail = (msg, v) => { if (failures.length < 10) failures.push(`${msg} for ${JSON.stringify(v)}`); };
  // Table values (standard normal, area to the left).
  for (const [z, want] of [[0, 0.5], [1, 0.8413447], [1.5, 0.9331928], [1.64, 0.9494974], [1.96, 0.9750021], [2.33, 0.9900969], [-1.5, 0.0668072], [-2.5, 0.0062097]]) {
    if (Math.abs(phi(z) - want) > 2e-7) failures.push(`phi(${z}) = ${phi(z)}, table ${want}`);
  }
  if (Math.abs(erf(0.5) - 0.5204998778) > 1e-9) failures.push('erf(0.5) is wrong');
  for (let i = 0; i < Math.min(runs, 200); i++) {
    const z = -4 + rng() * 8;
    // Numerical integration of the density from -8 to z (Simpson, 4000 panels).
    const n = 4000; const lo = -8; const h = (z - lo) / n; let s = 0;
    const pdf = (t) => Math.exp((-t * t) / 2) / Math.sqrt(2 * Math.PI);
    for (let j = 0; j <= n; j++) s += (j === 0 || j === n ? 1 : j % 2 ? 4 : 2) * pdf(lo + j * h);
    s *= h / 3;
    if (Math.abs(phi(z) - s) > 1e-9) fail(`phi(${z}) differs from the integral of the density`, { z });
    if (Math.abs(phi(z) + phi(-z) - 1) > 1e-12) fail('phi(z) + phi(-z) != 1', { z });
  }
  for (let i = 0; i < Math.min(runs, 200); i++) {
    const v = { mu: 20 + rng() * 20, sigma: 1 + rng() * 5 }; v.x = v.mu - (0.3 + rng() * 2.4) * v.sigma;
    const r = normalProbability(v);
    if (Math.abs(r.z - r.zExact) > 0.005 + 1e-9) fail('rounded z strays more than 0.005 from the exact z', v);
    if (Math.abs(r.z * 100 - Math.round(r.z * 100)) > 1e-9) fail('z is not on a two-decimal grid', v);
    if (!(r.pctBelow > 0 && r.pctBelow < 50)) fail('a limit below the mean should leave under 50% below it', v);
    if (Math.abs(r.pctBelow + r.pctAbove - 100) > 1e-9) fail('tails should add to 100%', v);
  }
  // Hand-solved: mu = 30, sigma = 4, x = 24: z = -1.50; table area to the left of -1.50 is 0.0668, i.e. 6.68%.
  refCheck(normalProbability({ mu: 30, sigma: 4, x: 24 }), { z: -1.5, pctBelow: 6.68072 }, failures, 1e-5);
  rejects(normalProbability, [{ mu: 30, sigma: 0, x: 24 }, { mu: 30, sigma: -4, x: 24 }, { mu: 30, sigma: 1, x: 100 }, { mu: NaN, sigma: 4, x: 24 }], failures);
  return failures;
}

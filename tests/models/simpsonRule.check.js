// Stage 3 checks for js/models/simpsonRule.js.
import { simpsonRule } from '../../js/models/simpsonRule.js';
const near = (x, y, tol = 1e-9) => Math.abs(x - y) <= tol * Math.max(1, Math.abs(x), Math.abs(y));
const rejects = (fn, cases, failures) => { for (const bad of cases) { let threw = false; try { fn(bad); } catch { threw = true; } if (!threw) failures.push(`accepted invalid input ${JSON.stringify(bad)}`); } };
const refCheck = (ref, want, failures, tol = 5e-4) => { for (const [k, val] of Object.entries(want)) if (Math.abs(ref[k] - val) > tol * Math.abs(val)) failures.push(`reference instance: ${k} = ${ref[k]}, hand value ${val}`); };

export function check(rng, runs) {
  const failures = [];
  const fail = (msg, v) => { if (failures.length < 10) failures.push(`${msg} for ${JSON.stringify(v)}`); };
  for (let i = 0; i < Math.min(runs, 400); i++) {
    // A random cubic: Simpson's rule must integrate it exactly; the trapezoidal rule exactly only for straight lines.
    const c = [rng() * 10 - 5, rng() * 4 - 2, rng() * 2 - 1, rng() * 0.4 - 0.2];
    const strips = 2 * (1 + Math.floor(rng() * 5)); const h = 0.2 + rng() * 5; const x0 = rng() * 3;
    const p = (x) => c[0] + c[1] * x + c[2] * x * x + c[3] * x ** 3;
    const P = (x) => c[0] * x + (c[1] * x * x) / 2 + (c[2] * x ** 3) / 3 + (c[3] * x ** 4) / 4;
    const y = Array.from({ length: strips + 1 }, (_, k) => p(x0 + k * h));
    const v = { h, y };
    const r = simpsonRule(v);
    const exact = P(x0 + strips * h) - P(x0);
    if (Math.abs(r.simpson - exact) > 1e-8 * (1 + Math.abs(exact) + strips * h * 20)) fail(`Simpson ${r.simpson} is not exact for a cubic (${exact})`, { strips, h });
    const line = simpsonRule({ h, y: y.map((_, k) => 3 + 2 * k) });
    if (!near(line.simpson, line.trapezoid, 1e-9)) fail('both rules should agree on a straight line', { strips, h });
    // Trapezoidal rule as a plain sum of trapezoids.
    let t = 0; for (let k = 0; k < strips; k++) t += ((y[k] + y[k + 1]) / 2) * h;
    if (!near(r.trapezoid, t, 1e-9)) fail('trapezoid != sum of trapezoids', { strips, h });
    if (r.strips !== strips) fail('strip count', { strips });
  }
  // Hand-solved: h = 10; ordinates 4, 12, 8, 14, 6. Simpson = (10/3)[4 + 6 + 4(12 + 14) + 2(8)] = (10/3)(130) = 433.33;
  // trapezoidal = (10/2)[10 + 2(34)] = 390.
  refCheck(simpsonRule({ h: 10, y: [4, 12, 8, 14, 6] }), { simpson: 433.333, trapezoid: 390, odd: 26, even: 8, ends: 10 }, failures, 1e-5);
  rejects(simpsonRule, [{ h: 0, y: [1, 2, 3] }, { h: 1, y: [1, 2, 3, 4] }, { h: 1, y: [1, 2] }, { h: 1, y: [1, NaN, 3] }], failures);
  return failures;
}

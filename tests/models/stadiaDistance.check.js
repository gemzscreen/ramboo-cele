// Stage 3 checks for js/models/stadiaDistance.js.
import { stadiaDistance } from '../../js/models/stadiaDistance.js';
const near = (x, y, tol = 1e-9) => Math.abs(x - y) <= tol * Math.max(1, Math.abs(x), Math.abs(y));
const rejects = (fn, cases, failures) => { for (const bad of cases) { let threw = false; try { fn(bad); } catch { threw = true; } if (!threw) failures.push(`accepted invalid input ${JSON.stringify(bad)}`); } };
const refCheck = (ref, want, failures, tol = 5e-4) => { for (const [k, val] of Object.entries(want)) if (Math.abs(ref[k] - val) > tol * Math.abs(val)) failures.push(`reference instance: ${k} = ${ref[k]}, hand value ${val}`); };

export function check(rng, runs) {
  const failures = [];
  const fail = (msg, v) => { if (failures.length < 10) failures.push(`${msg} for ${JSON.stringify(v)}`); };
  for (let i = 0; i < Math.min(runs, 400); i++) {
    const v = { s: 0.3 + rng() * 2.5, theta: rng() * 30, K: 100, C: rng() * 0.5 };
    const r = stadiaDistance(v);
    // Geometry from first principles: hairs at +/- phi about the line of sight (tan phi = 1/(2K)) cut the vertical rod at horizontal distance H.
    // With no additive constant, the exact intercept is H [tan(theta + phi) - tan(theta - phi)]; the textbook formula is accurate to about 1e-4.
    const th = (v.theta * Math.PI) / 180; const phi = Math.atan(1 / (2 * v.K));
    const H0 = stadiaDistance({ ...v, C: 0 }).H;
    const sExact = H0 * (Math.tan(th + phi) - Math.tan(th - phi));
    if (Math.abs(sExact - v.s) > 3e-4 * v.s) fail('intercept rebuilt from the geometry differs from the reading', v);
    if (!near(r.H, r.S * Math.cos(th), 1e-10)) fail('H != S cos(theta)', v);
    if (!near(r.V, r.S * Math.sin(th), 1e-10)) fail('V != S sin(theta)', v);
    if (!near(r.H * r.H + r.V * r.V, r.S * r.S, 1e-9)) fail('H^2 + V^2 != S^2', v);
  }
  const level = stadiaDistance({ s: 1.2, theta: 0, K: 100, C: 0.3 });
  if (!near(level.H, 120.3, 1e-12) || level.V !== 0) failures.push('level sight should give K s + C and no vertical distance');
  // Hand-solved: s = 1.40, theta = 12 deg, K = 100, C = 0.30: cos 12 = 0.978148, cos^2 = 0.956773.
  // S = 140(0.978148) + 0.30 = 136.941 + 0.30 = 137.241; H = 140(0.956773) + 0.30(0.978148) = 133.948 + 0.2934 = 134.242.
  refCheck(stadiaDistance({ s: 1.4, theta: 12, K: 100, C: 0.3 }), { H: 134.2417, S: 137.2408 }, failures, 1e-5);
  rejects(stadiaDistance, [{ s: 0, theta: 12, K: 100, C: 0.3 }, { s: 1.4, theta: 95, K: 100, C: 0.3 }, { s: 1.4, theta: 12, K: 100, C: -1 }, { s: 1.4, theta: NaN, K: 100, C: 0.3 }], failures);
  return failures;
}

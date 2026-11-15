// Stage 3 checks for js/models/triaxialCohesionless.js.
import { triaxialCohesionless } from '../../js/models/triaxialCohesionless.js';
const near = (x, y, tol = 1e-9) => Math.abs(x - y) <= tol * Math.max(1, Math.abs(x), Math.abs(y));
const rejects = (fn, cases, failures) => { for (const bad of cases) { let threw = false; try { fn(bad); } catch { threw = true; } if (!threw) failures.push(`accepted invalid input ${JSON.stringify(bad)}`); } };
const refCheck = (ref, want, failures, tol = 5e-4) => { for (const [k, val] of Object.entries(want)) if (Math.abs(ref[k] - val) > tol * Math.abs(val)) failures.push(`reference instance: ${k} = ${ref[k]}, hand value ${val}`); };

export function check(rng, runs) {
  const failures = [];
  const fail = (msg, v) => { if (failures.length < 10) failures.push(`${msg} for ${JSON.stringify(v)}`); };
  const rad = (deg) => (deg * Math.PI) / 180;
  for (let i = 0; i < runs; i++) {
    const v = { sigma3: 10 + rng() * 500, deviator: 5 + rng() * 1500 };
    const r = triaxialCohesionless(v);
    // Mohr-Coulomb with c = 0: the failure-plane stresses lie on tau = sigma tan(phi).
    if (!near(r.tauF, r.sigmaF * Math.tan(rad(r.phi)), 1e-9)) fail('failure point is not on the strength envelope', v);
    // Principal stress ratio: sigma1/sigma3 = tan^2(45 + phi/2).
    if (!near(r.sigma1 / v.sigma3, Math.tan(rad(45 + r.phi / 2)) ** 2, 1e-9)) fail('sigma1/sigma3 != tan^2(45 + phi/2)', v);
    // Stress transformation on a plane at theta from the major principal plane.
    const t = rad(r.theta);
    if (!near(r.sigmaF, r.sigma1 * Math.cos(t) ** 2 + v.sigma3 * Math.sin(t) ** 2, 1e-9)) fail('sigmaF disagrees with the transformation equations', v);
    if (!near(r.tauF, (r.sigma1 - v.sigma3) * Math.sin(t) * Math.cos(t), 1e-9)) fail('tauF disagrees with the transformation equations', v);
    // No other plane has a higher tau/sigma ratio.
    let worst = 0; for (let a = 1; a < 90; a += 0.25) { const s = r.sigma1 * Math.cos(rad(a)) ** 2 + v.sigma3 * Math.sin(rad(a)) ** 2; const q = (r.sigma1 - v.sigma3) * Math.sin(rad(a)) * Math.cos(rad(a)); worst = Math.max(worst, q / s); }
    if (worst > Math.tan(rad(r.phi)) * (1 + 1e-9)) fail('another plane is more critical than the failure plane', v);
    if (!(r.tauF < r.tauMax && r.sigmaF < r.centre)) fail('failure plane should carry less than the maximum shear, at less than the mean stress', v);
    if (!(r.phi > 0 && r.phi < 90)) fail('phi out of range', v);
  }
  // Hand-solved: sigma3 = 100, deviator = 200 -> sigma1 = 300. sin(phi) = 100/200 = 0.5, phi = 30 deg;
  // theta = 60 deg; tau_f = 100 sin(120) = 86.603; sigma_f = 200 + 100 cos(120) = 150; check 150 tan(30) = 86.603.
  refCheck(triaxialCohesionless({ sigma3: 100, deviator: 200 }), { sigma1: 300, phi: 30, theta: 60, tauF: 86.603, sigmaF: 150, tauMax: 100 }, failures, 1e-5);
  rejects(triaxialCohesionless, [{ sigma3: 0, deviator: 200 }, { sigma3: 100, deviator: -5 }, { sigma3: NaN, deviator: 200 }], failures);
  return failures;
}

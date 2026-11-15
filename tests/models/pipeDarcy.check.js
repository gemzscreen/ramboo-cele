// Stage 3 checks for js/models/pipeDarcy.js.
import { pipeDarcy } from '../../js/models/pipeDarcy.js';
const near = (x, y, tol = 1e-9) => Math.abs(x - y) <= tol * Math.max(1, Math.abs(x), Math.abs(y));
const rejects = (fn, cases, failures) => { for (const bad of cases) { let threw = false; try { fn(bad); } catch { threw = true; } if (!threw) failures.push(`accepted invalid input ${JSON.stringify(bad)}`); } };
const refCheck = (ref, want, failures, tol = 5e-4) => { for (const [k, val] of Object.entries(want)) if (Math.abs(ref[k] - val) > tol * Math.abs(val)) failures.push(`reference instance: ${k} = ${ref[k]}, hand value ${val}`); };

export function check(rng, runs) {
  const failures = [];
  const fail = (msg, v) => { if (failures.length < 10) failures.push(`${msg} for ${JSON.stringify(v)}`); };
  for (let i = 0; i < runs; i++) {
    const v = { D: 25 + rng() * 1500, L: 5 + rng() * 5000, Q: 0.2 + rng() * 2000, f: 0.008 + rng() * 0.05 };
    const r = pipeDarcy(v);
    const g = 9.81; const Dm = v.D / 1000; const Q = v.Q / 1000;
    // Continuity.
    if (!near(r.V * r.area, Q)) fail('Q != A V', v);
    // Discharge form of the same law: hf = 8 f L Q^2 / (pi^2 g D^5).
    if (!near(r.hf, (8 * v.f * v.L * Q * Q) / (Math.PI ** 2 * g * Dm ** 5), 1e-9)) fail('hf disagrees with the discharge form', v);
    // Force balance on the water in the pipe: wall shear tau0 = f rho V^2/8 acting on pi D L equals gamma hf A.
    const tau0 = (v.f * 1000 * r.V * r.V) / 8; // Pa
    if (!near(tau0 * Math.PI * Dm * v.L, 9810 * r.hf * r.area, 1e-9)) fail('wall shear does not balance the pressure drop', v);
    if (!near(r.power, 9.81 * Q * r.hf)) fail('power != gamma Q hf', v);
    if (!near(pipeDarcy({ ...v, Q: 2 * v.Q }).hf, 4 * r.hf, 1e-9)) fail('hf should grow with Q^2', v);
    if (!near(pipeDarcy({ ...v, L: 3 * v.L }).hf, 3 * r.hf, 1e-9)) fail('hf should grow with L', v);
  }
  // Hand-solved: D = 200 mm, L = 500 m, Q = 40 L/s, f = 0.02.
  // A = pi(0.2^2)/4 = 0.0314159 m^2; V = 0.04/0.0314159 = 1.27324 m/s; V^2/2g = 1.62114/19.62 = 0.082627 m;
  // hf = 0.02(500/0.2)(0.082627) = 4.1313 m; power = 9.81(0.04)(4.1313) = 1.6211 kW.
  refCheck(pipeDarcy({ D: 200, L: 500, Q: 40, f: 0.02 }), { V: 1.27324, velocityHead: 0.082627, hf: 4.1313, power: 1.6211 }, failures, 1e-4);
  rejects(pipeDarcy, [{ D: 0, L: 500, Q: 40, f: 0.02 }, { D: 200, L: 500, Q: -4, f: 0.02 }, { D: 200, L: 500, Q: 40, f: NaN }], failures);
  return failures;
}

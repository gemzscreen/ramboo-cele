// Stage 3 checks for js/models/shaftTorsion.js.
import { shaftTorsion } from '../../js/models/shaftTorsion.js';
const near = (x, y, tol = 1e-9) => Math.abs(x - y) <= tol * Math.max(1, Math.abs(x), Math.abs(y));
const rejects = (fn, cases, failures) => { for (const bad of cases) { let threw = false; try { fn(bad); } catch { threw = true; } if (!threw) failures.push(`accepted invalid input ${JSON.stringify(bad)}`); } };
const refCheck = (ref, want, failures, tol = 5e-4) => { for (const [k, val] of Object.entries(want)) if (Math.abs(ref[k] - val) > tol * Math.abs(val)) failures.push(`reference instance: ${k} = ${ref[k]}, hand value ${val}`); };

export function check(rng, runs) {
  const failures = [];
  const fail = (msg, v) => { if (failures.length < 10) failures.push(`${msg} for ${JSON.stringify(v)}`); };
  for (let i = 0; i < runs; i++) {
    const v = { d: 20 + rng() * 200, L: 0.3 + rng() * 6, T: 0.1 + rng() * 60, G: 25 + rng() * 60, N: rng() * 1500 };
    const r = shaftTorsion(v);
    // tau = T r / J, the general torsion formula.
    if (!near(r.tau, (v.T * 1e6 * (v.d / 2)) / r.J, 1e-9)) fail('tau != T r / J', v);
    // Geometry of twist: surface shear strain = r*theta/L, and tau = G*gamma.
    if (!near(r.tau, (v.G * 1000 * (v.d / 2) * r.thetaRad) / (v.L * 1000), 1e-9)) fail('tau != G r theta / L', v);
    // Strain energy: T*theta/2 equals the integral of tau^2/(2G) over the volume = tau_max^2 * (pi d^2 L / 4) / (4G).
    const U1 = (v.T * 1e6 * r.thetaRad) / 2; const U2 = (r.tau ** 2 * ((Math.PI * v.d ** 2 * v.L * 1000) / 4)) / (4 * v.G * 1000);
    if (!near(U1, U2, 1e-9)) fail('work of the torque != stored strain energy', v);
    if (!near(r.power, v.T * r.omega)) fail('power != T*omega', v);
    if (!near(r.thetaDeg, (r.thetaRad * 180) / Math.PI)) fail('degree conversion', v);
    // Doubling the diameter cuts stress by 8 and twist by 16.
    const big = shaftTorsion({ ...v, d: 2 * v.d });
    if (!near(big.tau * 8, r.tau, 1e-9) || !near(big.thetaRad * 16, r.thetaRad, 1e-9)) fail('diameter scaling is wrong', v);
  }
  // Hand-solved: d = 80 mm, L = 2 m, T = 6 kN·m, G = 80 GPa, N = 300 rpm.
  // tau = 16(6e6)/(pi*80^3) = 96e6/1608495 = 59.68 MPa; J = pi(80^4)/32 = 4.0212e6 mm^4;
  // theta = 6e6(2000)/(4.0212e6*80000) = 0.037302 rad = 2.1373 deg; P = 2pi(300)(6)/60 = 188.50 kW.
  refCheck(shaftTorsion({ d: 80, L: 2, T: 6, G: 80, N: 300 }), { tau: 59.68, J: 4.0212e6, thetaRad: 0.037302, thetaDeg: 2.1373, power: 188.50 }, failures, 2e-4);
  rejects(shaftTorsion, [{ d: 0, L: 2, T: 6, G: 80 }, { d: 80, L: 2, T: -6, G: 80 }, { d: 80, L: 2, T: 6, G: NaN }, { d: 80, L: 2, T: 6, G: 80, N: -1 }], failures);
  return failures;
}

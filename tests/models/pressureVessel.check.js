// Stage 3 checks for js/models/pressureVessel.js.
import { pressureVessel } from '../../js/models/pressureVessel.js';
const near = (x, y, tol = 1e-9) => Math.abs(x - y) <= tol * Math.max(1, Math.abs(x), Math.abs(y));
const rejects = (fn, cases, failures) => { for (const bad of cases) { let threw = false; try { fn(bad); } catch { threw = true; } if (!threw) failures.push(`accepted invalid input ${JSON.stringify(bad)}`); } };
const refCheck = (ref, want, failures, tol = 5e-4) => { for (const [k, val] of Object.entries(want)) if (Math.abs(ref[k] - val) > tol * Math.abs(val)) failures.push(`reference instance: ${k} = ${ref[k]}, hand value ${val}`); };

export function check(rng, runs) {
  const failures = [];
  const fail = (msg, v) => { if (failures.length < 10) failures.push(`${msg} for ${JSON.stringify(v)}`); };
  for (let i = 0; i < runs; i++) {
    const v = { D: 100 + rng() * 4000, t: 2 + rng() * 40, p: 0.05 + rng() * 5, allow: 40 + rng() * 200 };
    const r = pressureVessel(v);
    // Cut the cylinder lengthwise (unit length): pressure on the projected area D x 1 is carried by two walls.
    if (!near(v.p * v.D * 1, 2 * r.hoop * v.t * 1, 1e-9)) fail('hoop: p D != 2 sigma t', v);
    // Cut it across: pressure on the end, pi D^2/4, is carried by the wall ring pi D t.
    if (!near((v.p * Math.PI * v.D ** 2) / 4, r.longitudinal * Math.PI * v.D * v.t, 1e-9)) fail('longitudinal: end force != sigma x ring area', v);
    if (!near(r.hoop, 2 * r.longitudinal)) fail('hoop should be twice longitudinal', v);
    // A wall of the required thickness is stressed exactly to the allowable.
    if (!near(pressureVessel({ ...v, t: r.tRequired }).hoop, v.allow, 1e-9)) fail('tRequired does not give the allowable hoop stress', v);
    if (!near(pressureVessel({ ...v, p: r.pMax }).hoop, v.allow, 1e-9)) fail('pMax does not give the allowable hoop stress', v);
    if (!near(r.tauMaxInPlane, r.hoop / 4)) fail('in-plane max shear should be hoop/4', v);
  }
  // Hand-solved: D = 1200 mm, t = 10 mm, p = 1.2 MPa, allowable 100 MPa.
  // hoop = 1.2(1200)/(2*10) = 72; longitudinal = 36; t required = 1.2(1200)/(2*100) = 7.2 mm.
  refCheck(pressureVessel({ D: 1200, t: 10, p: 1.2, allow: 100 }), { hoop: 72, longitudinal: 36, tRequired: 7.2, pMax: 5 / 3 }, failures, 1e-9);
  rejects(pressureVessel, [{ D: 0, t: 10, p: 1.2 }, { D: 1200, t: -1, p: 1.2 }, { D: 1200, t: 10, p: NaN }], failures);
  return failures;
}

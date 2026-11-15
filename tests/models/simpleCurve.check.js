// Stage 3 checks for js/models/simpleCurve.js: geometric identities that tie
// the elements together, independent of the formulas used in the solver.
import { simpleCurve } from '../../js/models/simpleCurve.js';

const near = (x, y, tol = 1e-9) => Math.abs(x - y) <= tol * Math.max(1, Math.abs(x), Math.abs(y));

export function check(rng, runs) {
  const failures = [];
  const fail = (msg, v) => { if (failures.length < 10) failures.push(`${msg} for ${JSON.stringify(v)}`); };

  for (let i = 0; i < runs; i++) {
    const v = { R: 20 + rng() * 2000, I: 1 + rng() * 150 };
    const r = simpleCurve(v);
    const { R } = v;

    // Right triangle O-PC-PI: legs R and T, hypotenuse R + E.
    if (!near(r.T * r.T + R * R, (R + r.E) ** 2, 1e-9)) fail('T^2 + R^2 != (R + E)^2', v);
    // Right triangle O-(chord midpoint)-PC: legs R - M and C/2, hypotenuse R.
    if (!near((R - r.M) ** 2 + (r.C / 2) ** 2, R * R, 1e-9)) fail('(R - M)^2 + (C/2)^2 != R^2', v);
    // Similar triangles: (R - M)/R = R/(R + E).
    if (!near((R - r.M) * (R + r.E), R * R, 1e-9)) fail('(R - M)(R + E) != R^2', v);
    // Arc length from the central angle.
    if (!near(r.Lc / R, (v.I * Math.PI) / 180)) fail('Lc/R != I in radians', v);
    // Orderings that always hold: chord < arc < two tangents; M < E.
    if (!(r.C < r.Lc && r.Lc < 2 * r.T)) fail('expected C < Lc < 2T', v);
    if (!(r.M < r.E)) fail('expected M < E', v);
    for (const [k, val] of Object.entries(r)) if (!Number.isFinite(val) || val <= 0) fail(`${k} is not a positive finite number`, v);
  }

  // Reference, solved by hand: R = 300 m, I = 40 deg, so I/2 = 20 deg.
  // cos 20 = 0.939693, tan 20 = 0.363970, sin 20 = 0.342020.
  // T = 109.19; E = 300(1/0.939693 - 1) = 19.25; M = 300(1 - 0.939693) = 18.09;
  // C = 600(0.342020) = 205.21; Lc = 300(40)(pi/180) = 209.44.
  const ref = simpleCurve({ R: 300, I: 40 });
  for (const [k, want] of Object.entries({ T: 109.19, E: 19.25, M: 18.09, C: 205.21, Lc: 209.44 })) {
    if (Math.abs(ref[k] - want) > 0.006) failures.push(`reference instance: ${k} = ${ref[k]}, hand value ${want}`);
  }

  for (const bad of [{ R: 0, I: 40 }, { R: 300, I: 0 }, { R: 300, I: 180 }, { R: 300, I: NaN }]) {
    let threw = false;
    try { simpleCurve(bad); } catch { threw = true; }
    if (!threw) failures.push(`accepted invalid input ${JSON.stringify(bad)}`);
  }
  return failures;
}

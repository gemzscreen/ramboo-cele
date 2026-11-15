// Stage 3 checks for js/models/beamSimpleUdlPoint.js.
import { beamSimpleUdlPoint } from '../../js/models/beamSimpleUdlPoint.js';
import { beamSimplePoint } from '../../js/models/beamSimplePoint.js';

const near = (x, y, tol = 1e-9) => Math.abs(x - y) <= tol * Math.max(1, Math.abs(x), Math.abs(y));

export function check(rng, runs) {
  const failures = [];
  const fail = (msg, v) => { if (failures.length < 10) failures.push(`${msg} for ${JSON.stringify(v)}`); };
  const cases = { beforeLoad: 0, atLoad: 0, afterLoad: 0 };

  for (let i = 0; i < runs; i++) {
    const L = 1 + rng() * 29;
    const w = 0.5 + rng() * 60;
    const P = rng() * 400;
    const a = L * (0.01 + rng() * 0.98);
    const v = { L, w, P, a };
    const r = beamSimpleUdlPoint(v);
    cases[r.zeroShearCase]++;

    // Equilibrium.
    if (!near(r.RA + r.RB, w * L + P)) fail('vertical forces do not balance', v);
    if (!near(r.RB * L, (w * L * L) / 2 + P * a)) fail('moments about A do not balance', v);

    // Superposition: uniform-load part + the already-verified point-load solver.
    const pt = beamSimplePoint({ L, P, a });
    for (const x of [0.13 * L, 0.5 * L, 0.87 * L, a / 2, (a + L) / 2]) {
      const udlM = (w * x * (L - x)) / 2;
      const udlV = w * (L / 2 - x);
      if (!near(r.M(x), udlM + pt.M(x), 1e-8)) { fail(`M(${x}) disagrees with superposition`, v); break; }
      if (!near(r.V(x), udlV + pt.V(x), 1e-8)) { fail(`V(${x}) disagrees with superposition`, v); break; }
    }
    if (!near(r.M(0), 0) || !near(r.M(L), 0, 1e-8)) fail('moment is not zero at the supports', v);

    // M_max really is the maximum, and sits where shear changes sign.
    let best = -Infinity;
    const n = 2000;
    for (let k = 0; k <= n; k++) best = Math.max(best, r.M((k * L) / n));
    if (best > r.Mmax * (1 + 1e-9) + 1e-9) fail(`a sampled moment ${best} exceeds M_max ${r.Mmax}`, v);
    if (r.Mmax - best > 1e-3 * Math.max(1, r.Mmax)) fail(`M_max ${r.Mmax} is above every sampled moment (${best})`, v);
    if (!(r.xV0 > 0 && r.xV0 < L)) fail('zero-shear point is outside the span', v);
    const eps = L * 1e-7;
    if (!(r.V(r.xV0 - eps) > -1e-6 && r.V(r.xV0 + eps) < 1e-6)) fail('shear does not change sign at xV0', v);
    if (!near(r.Mload, r.M(a)) || !near(r.Mmid, r.M(L / 2))) fail('Mload/Mmid do not match M(x)', v);
  }
  for (const [name, count] of Object.entries(cases)) {
    if (count === 0) failures.push(`random inputs never exercised the "${name}" zero-shear case`);
  }

  // No point load: reduces to wL/2, wL^2/8 at midspan.
  const u = beamSimpleUdlPoint({ L: 8, w: 10, P: 0, a: 3 });
  if (!near(u.RA, 40) || !near(u.Mmax, 80) || !near(u.xV0, 4)) failures.push('P = 0 does not reduce to the uniform-load formulas');

  // Reference, solved by hand: R_A = 40 + 30 = 70, R_B = 40 + 10 = 50; shear right of
  // the load is 70 - 20 - 40 = 10 > 0, so zero shear at (70 - 40)/10 = 3.00 m;
  // M_max = 70(3) - 10(3^2)/2 - 40(1) = 125; check from B: 50(5) - 10(5^2)/2 = 125.
  const ref = beamSimpleUdlPoint({ L: 8, w: 10, P: 40, a: 2 });
  for (const [k, want] of Object.entries({ RA: 70, RB: 50, xV0: 3, Mmax: 125 })) {
    if (!near(ref[k], want, 1e-9)) failures.push(`reference instance: ${k} = ${ref[k]}, hand value ${want}`);
  }
  if (ref.zeroShearCase !== 'afterLoad') failures.push('reference instance: wrong zero-shear case');

  for (const bad of [{ L: 8, w: 0, P: 40, a: 2 }, { L: 8, w: 10, P: 40, a: 8 }, { L: 8, w: 10, P: -5, a: 2 }, { L: -8, w: 10, P: 40, a: 2 }, { L: 8, w: NaN, P: 40, a: 2 }]) {
    let threw = false;
    try { beamSimpleUdlPoint(bad); } catch { threw = true; }
    if (!threw) failures.push(`accepted invalid input ${JSON.stringify(bad)}`);
  }
  return failures;
}

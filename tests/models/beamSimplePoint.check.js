// Stage 3 checks for js/models/beamSimplePoint.js: closed-form formulas and
// equilibrium over random inputs, plus the hand-checked reference (ROADMAP §4A).
import { beamSimplePoint } from '../../js/models/beamSimplePoint.js';

const near = (x, y, tol = 1e-9) => Math.abs(x - y) <= tol * Math.max(1, Math.abs(x), Math.abs(y));

export function check(rng, runs) {
  const failures = [];
  const fail = (msg, v) => { if (failures.length < 10) failures.push(`${msg} for ${JSON.stringify(v)}`); };

  for (let i = 0; i < runs; i++) {
    const L = 1 + rng() * 29;
    const P = rng() * 500;
    const a = L * (0.01 + rng() * 0.98);
    const v = { L, P, a };
    const r = beamSimplePoint(v);
    const b = L - a;

    // Closed-form hand formulas.
    if (!near(r.RA, (P * b) / L)) fail('R_A != Pb/L', v);
    if (!near(r.RB, (P * a) / L)) fail('R_B != Pa/L', v);
    if (!near(r.Mmax, (P * a * b) / L)) fail('M_max != Pab/L', v);
    if (!near(r.Vmax, (P * Math.max(a, b)) / L)) fail('V_max != P·max(a,b)/L', v);
    if (!near(r.Mmid, (P * Math.min(a, b)) / 2)) fail('M_mid != P·min(a,b)/2', v);

    // Equilibrium.
    if (!near(r.RA + r.RB, P)) fail('vertical forces do not balance', v);
    if (!near(r.RB * L, P * a)) fail('moments about A do not balance', v);

    // Diagram functions.
    if (!near(r.M(0), 0) || !near(r.M(L), 0)) fail('moment is not zero at the supports', v);
    if (!near(r.M(a), r.Mmax)) fail('M(a) != M_max', v);
    if (!near(r.V(a / 2), r.RA) || !near(r.V((a + L) / 2), -r.RB)) fail('V(x) is wrong on one side of the load', v);
    if (!near(r.V(a / 2) - r.V((a + L) / 2), P)) fail('shear jump at the load != P', v);

    // M is the integral of V, and nowhere exceeds M_max or goes negative.
    let integral = 0;
    const n = 400;
    for (let k = 0; k < n; k++) {
      const xm = ((k + 0.5) * L) / n;
      integral += (r.V(xm) * L) / n;
      const mx = r.M(((k + 1) * L) / n);
      if (mx > r.Mmax * (1 + 1e-9) + 1e-9 || mx < -1e-9) { fail('M(x) outside [0, M_max]', v); break; }
    }
    if (Math.abs(integral) > (P * L) / n + 1e-9) fail('integral of V over the span is not zero', v);

    for (const [k, val] of Object.entries(r)) {
      if (typeof val === 'number' && !Number.isFinite(val)) fail(`${k} is not finite`, v);
    }
  }

  // Reference instance, checked by hand.
  const ref = beamSimplePoint({ L: 6, P: 40, a: 2 });
  const expect = { RA: 26.7, RB: 13.3, Vmax: 26.7, Mmax: 53.3, Mmid: 40.0 };
  for (const [k, want] of Object.entries(expect)) {
    if (Math.abs(ref[k] - want) > 0.05) failures.push(`reference instance: ${k} = ${ref[k]}, hand value ${want}`);
  }

  // Invalid input must be rejected, not solved.
  for (const bad of [{ L: 6, P: 40, a: 0 }, { L: 6, P: 40, a: 6 }, { L: 6, P: 40, a: 7 }, { L: 0, P: 40, a: 1 }, { L: 6, P: -1, a: 2 }, { L: 6, P: NaN, a: 2 }]) {
    let threw = false;
    try { beamSimplePoint(bad); } catch { threw = true; }
    if (!threw) failures.push(`accepted invalid input ${JSON.stringify(bad)}`);
  }

  return failures;
}

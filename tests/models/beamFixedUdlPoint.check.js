// Stage 3 checks for js/models/beamFixedUdlPoint.js.
import { beamFixedUdlPoint } from '../../js/models/beamFixedUdlPoint.js';
const near = (x, y, tol = 1e-9) => Math.abs(x - y) <= tol * Math.max(1, Math.abs(x), Math.abs(y));
const rejects = (fn, cases, failures) => { for (const bad of cases) { let threw = false; try { fn(bad); } catch { threw = true; } if (!threw) failures.push(`accepted invalid input ${JSON.stringify(bad)}`); } };
const refCheck = (ref, want, failures, tol = 5e-4) => { for (const [k, val] of Object.entries(want)) if (Math.abs(ref[k] - val) > tol * Math.abs(val)) failures.push(`reference instance: ${k} = ${ref[k]}, hand value ${val}`); };

export function check(rng, runs) {
  const failures = [];
  const fail = (msg, v) => { if (failures.length < 10) failures.push(`${msg} for ${JSON.stringify(v)}`); };
  for (let i = 0; i < Math.min(runs, 400); i++) {
    const v = { L: 2 + rng() * 18, w: rng() * 60, P: rng() * 300 + 1 };
    const r = beamFixedUdlPoint(v);
    const { L } = v;
    if (!near(2 * r.R, v.w * L + v.P)) fail('vertical forces do not balance', v);
    // Compatibility, independent of the tabulated fixed-end moments: with both ends
    // clamped, the change in slope (integral of M) and the end deflection
    // (integral of M times distance) over the span must both be zero.
    const n = 4000; let s0 = 0; let s1 = 0;
    for (let k = 0; k < n; k++) { const x = ((k + 0.5) * L) / n; const m = r.M(x); s0 += m * (L / n); s1 += m * (L - x) * (L / n); }
    const scale = (v.w * L * L + v.P * L) * L;
    if (Math.abs(s0) > 1e-6 * scale) fail(`slope change between the ends is not zero (${s0})`, v);
    if (Math.abs(s1) > 1e-6 * scale * L) fail(`relative end deflection is not zero (${s1})`, v);
    if (!near(r.M(L), -r.Mend, 1e-9) || !near(r.M(0), -r.Mend)) fail('end moments are not equal', v);
    // Fixing the ends lowers the midspan moment of the simple beam by exactly the end moment.
    if (!near(r.Mmid, r.MsimpleMid - r.Mend, 1e-9)) fail('Mmid != simple-span moment - Mend', v);
    if (!(r.Mmid > 0 && r.Mmid <= r.Mend + 1e-9)) fail('expected 0 < Mmid <= Mend', v);
  }
  const udl = beamFixedUdlPoint({ L: 6, w: 10, P: 0 });
  if (!near(udl.Mend, 30) || !near(udl.Mmid, 15)) failures.push('P = 0 should give wL^2/12 and wL^2/24');
  const pt = beamFixedUdlPoint({ L: 6, w: 0, P: 40 });
  if (!near(pt.Mend, 30) || !near(pt.Mmid, 30)) failures.push('w = 0 should give PL/8 at the ends and at midspan');
  // Hand-solved: L = 8, w = 12, P = 40. R = 48 + 20 = 68; M_end = 12(64)/12 + 40(8)/8 = 64 + 40 = 104;
  // M_mid = 12(64)/24 + 40 = 72 (check: simple 96 + 80 = 176; 176 - 104 = 72).
  refCheck(beamFixedUdlPoint({ L: 8, w: 12, P: 40 }), { R: 68, Mend: 104, Mmid: 72, MsimpleMid: 176 }, failures, 1e-9);
  rejects(beamFixedUdlPoint, [{ L: 0, w: 12, P: 40 }, { L: 8, w: -1, P: 40 }, { L: 8, w: 0, P: 0 }, { L: 8, w: NaN, P: 40 }], failures);
  return failures;
}

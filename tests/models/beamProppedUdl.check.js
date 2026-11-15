// Stage 3 checks for js/models/beamProppedUdl.js.
import { beamProppedUdl } from '../../js/models/beamProppedUdl.js';
const near = (x, y, tol = 1e-9) => Math.abs(x - y) <= tol * Math.max(1, Math.abs(x), Math.abs(y));
const rejects = (fn, cases, failures) => { for (const bad of cases) { let threw = false; try { fn(bad); } catch { threw = true; } if (!threw) failures.push(`accepted invalid input ${JSON.stringify(bad)}`); } };
const refCheck = (ref, want, failures, tol = 5e-4) => { for (const [k, val] of Object.entries(want)) if (Math.abs(ref[k] - val) > tol * Math.abs(val)) failures.push(`reference instance: ${k} = ${ref[k]}, hand value ${val}`); };

export function check(rng, runs) {
  const failures = [];
  const fail = (msg, v) => { if (failures.length < 10) failures.push(`${msg} for ${JSON.stringify(v)}`); };
  for (let i = 0; i < runs; i++) {
    const v = { L: 1 + rng() * 19, w: 1 + rng() * 80 };
    const r = beamProppedUdl(v);
    const { L, w } = v;
    // Equilibrium of the whole beam.
    if (!near(r.RA + r.RB, w * L)) fail('vertical forces do not balance', v);
    if (!near(r.MA + r.RB * L, (w * L * L) / 2)) fail('moments about the wall do not balance', v);
    if (!near(r.M(L), 0, 1e-8)) fail('moment at the roller is not zero', v);
    if (!near(r.M(0), -r.MA)) fail('M(0) is not the fixed-end moment', v);
    // Compatibility, independent of the 3wL/8 formula: with zero slope and
    // deflection at the wall, EI*y(L) = integral of M(x)(L - x) dx must vanish.
    const n = 4000; let sum = 0;
    for (let k = 0; k <= n; k++) { const x = (k * L) / n; const wt = k === 0 || k === n ? 1 : k % 2 ? 4 : 2; sum += wt * r.M(x) * (L - x); }
    const defl = (sum * L) / n / 3;
    if (Math.abs(defl) > 1e-8 * w * L ** 4) fail(`deflection at the prop is not zero (EI*y = ${defl})`, v);
    // Peak sagging moment sits at zero shear and is the largest sampled value.
    if (!near(r.V(r.xV0), 0, 1e-8)) fail('shear is not zero at xV0', v);
    let best = -Infinity; for (let k = 0; k <= 2000; k++) best = Math.max(best, r.M((k * L) / 2000));
    if (best > r.Mpos * (1 + 1e-9) || r.Mpos - best > 1e-5 * r.Mpos) fail('Mpos is not the maximum sagging moment', v);
    if (!near(r.M(r.xInflection), 0, 1e-8)) fail('moment is not zero at the inflection point', v);
    if (!near(r.Mpos, (9 * w * L * L) / 128)) fail('Mpos != 9wL^2/128', v);
    if (!(r.MA > r.Mpos)) fail('fixed-end moment should exceed the sagging moment', v);
  }
  // Hand-solved: L = 8, w = 24. R_B = 3(24)(8)/8 = 72; R_A = 192 - 72 = 120;
  // M_A = 24(64)/8 = 192; zero shear at 120/24 = 5 m; M = -192 + 120(5) - 24(25)/2 = 108.
  refCheck(beamProppedUdl({ L: 8, w: 24 }), { RB: 72, RA: 120, MA: 192, xV0: 5, Mpos: 108, xInflection: 2 }, failures, 1e-9);
  rejects(beamProppedUdl, [{ L: 0, w: 10 }, { L: 8, w: 0 }, { L: 8, w: NaN }, { L: -1, w: 5 }], failures);
  return failures;
}

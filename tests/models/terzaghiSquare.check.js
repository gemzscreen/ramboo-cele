// Stage 3 checks for js/models/terzaghiSquare.js.
import { terzaghiSquare } from '../../js/models/terzaghiSquare.js';
const near = (x, y, tol = 1e-9) => Math.abs(x - y) <= tol * Math.max(1, Math.abs(x), Math.abs(y));
const rejects = (fn, cases, failures) => { for (const bad of cases) { let threw = false; try { fn(bad); } catch { threw = true; } if (!threw) failures.push(`accepted invalid input ${JSON.stringify(bad)}`); } };
const refCheck = (ref, want, failures, tol = 5e-4) => { for (const [k, val] of Object.entries(want)) if (Math.abs(ref[k] - val) > tol * Math.abs(val)) failures.push(`reference instance: ${k} = ${ref[k]}, hand value ${val}`); };

export function check(rng, runs) {
  const failures = [];
  const fail = (msg, v) => { if (failures.length < 10) failures.push(`${msg} for ${JSON.stringify(v)}`); };
  for (let i = 0; i < runs; i++) {
    const v = { c: rng() * 80, gamma: 14 + rng() * 8, Df: rng() * 3, B: 0.8 + rng() * 4, FS: 1.5 + rng() * 3, Nc: 6 + rng() * 60, Nq: 1 + rng() * 50, Ng: rng() * 50 };
    const r = terzaghiSquare(v);
    if (!near(r.qu, r.cohesionTerm + r.surchargeTerm + r.weightTerm)) fail('terms do not add up', v);
    // Shape factors: against the strip footing, cohesion term x1.3 and self-weight term x0.8, surcharge unchanged.
    const strip = { c: v.c * v.Nc, q: v.gamma * v.Df * v.Nq, w: 0.5 * v.gamma * v.B * v.Ng };
    if (!near(r.cohesionTerm, 1.3 * strip.c, 1e-9) || !near(r.surchargeTerm, strip.q, 1e-9) || !near(r.weightTerm, 0.8 * strip.w, 1e-9)) fail('shape factors against the strip footing are wrong', v);
    if (!near(r.quStrip, strip.c + strip.q + strip.w, 1e-9)) fail('strip formula', v);
    if (!near(r.qAllow * v.FS, r.qu) || !near(r.Pallow, r.qAllow * v.B * v.B)) fail('allowable values', v);
    if (!near(r.qNetAllow * v.FS + r.q, r.qu, 1e-9)) fail('net allowable', v);
    // Each ingredient raises capacity.
    if (!(terzaghiSquare({ ...v, Df: v.Df + 0.5 }).qu > r.qu) || !(terzaghiSquare({ ...v, c: v.c + 5 }).qu > r.qu)) fail('deeper or more cohesive soil should carry more', v);
  }
  // Hand-solved: c = 10 kPa, gamma = 18, Df = 1.5 m, B = 2 m, FS = 3; Nc = 37.2, Nq = 22.5, Ng = 19.7.
  // 1.3(10)(37.2) = 483.6; 18(1.5)(22.5) = 607.5; 0.4(18)(2)(19.7) = 283.68; qu = 1374.78 kPa;
  // q_all = 458.26 kPa; P = 458.26(4) = 1833.04 kN.
  refCheck(terzaghiSquare({ c: 10, gamma: 18, Df: 1.5, B: 2, FS: 3, Nc: 37.2, Nq: 22.5, Ng: 19.7 }), { cohesionTerm: 483.6, surchargeTerm: 607.5, weightTerm: 283.68, qu: 1374.78, qAllow: 458.26, Pallow: 1833.04 }, failures, 1e-6);
  rejects(terzaghiSquare, [{ c: -1, gamma: 18, Df: 1.5, B: 2, FS: 3, Nc: 37.2, Nq: 22.5, Ng: 19.7 }, { c: 10, gamma: 18, Df: 1.5, B: 0, FS: 3, Nc: 37.2, Nq: 22.5, Ng: 19.7 }, { c: 10, gamma: 18, Df: 1.5, B: 2, FS: 0.5, Nc: 37.2, Nq: 22.5, Ng: 19.7 }, { c: 10, gamma: NaN, Df: 1.5, B: 2, FS: 3, Nc: 37.2, Nq: 22.5, Ng: 19.7 }], failures);
  return failures;
}

// Stage 3 checks for js/models/websterCycle.js.
import { websterCycle } from '../../js/models/websterCycle.js';
const near = (x, y, tol = 1e-9) => Math.abs(x - y) <= tol * Math.max(1, Math.abs(x), Math.abs(y));
const rejects = (fn, cases, failures) => { for (const bad of cases) { let threw = false; try { fn(bad); } catch { threw = true; } if (!threw) failures.push(`accepted invalid input ${JSON.stringify(bad)}`); } };
const refCheck = (ref, want, failures, tol = 5e-4) => { for (const [k, val] of Object.entries(want)) if (Math.abs(ref[k] - val) > tol * Math.abs(val)) failures.push(`reference instance: ${k} = ${ref[k]}, hand value ${val}`); };

export function check(rng, runs) {
  const failures = [];
  const fail = (msg, v) => { if (failures.length < 10) failures.push(`${msg} for ${JSON.stringify(v)}`); };
  for (let i = 0; i < Math.min(runs, 400); i++) {
    const v = { l: 2 + rng() * 5, s: 1500 + rng() * 500 }; const Ytarget = 0.3 + rng() * 0.55;
    const shares = [rng() + 0.2, rng() + 0.2, rng() + 0.2]; const tot = shares[0] + shares[1] + shares[2];
    v.q1 = (Ytarget * v.s * shares[0]) / tot; v.q2 = (Ytarget * v.s * shares[1]) / tot; v.q3 = (Ytarget * v.s * shares[2]) / tot;
    const r = websterCycle(v);
    // Solve C (1 - Y) = 1.5 L + 5 by bisection.
    const L = 3 * v.l; const Y = (v.q1 + v.q2 + v.q3) / v.s;
    let lo = 0; let hi = 1e6;
    for (let k = 0; k < 200; k++) { const mid = (lo + hi) / 2; if (mid * (1 - Y) < 1.5 * L + 5) lo = mid; else hi = mid; }
    if (!near(r.C0, lo, 1e-9)) fail('C0 differs from the root of C(1 - Y) = 1.5 L + 5', v);
    // Split of the cycle: total green is C0 - L, and the greens in proportion to the flow ratios give one common degree of saturation X = Y C0 / (C0 - L) < 1.
    const X = (Y * r.C0) / (r.C0 - L);
    if (!(X < 1 && X > 0)) fail('degree of saturation should lie between 0 and 1', v);
    if (!near(r.C0 - L, Y * r.C0 + 0.5 * L + 5, 1e-9)) fail('green time identity C0 - L = Y C0 + 0.5 L + 5 fails', v);
    if (!near(r.Y, Y, 1e-12) || !near(r.L, L, 1e-12)) fail('Y or L is wrong', v);
    if (websterCycle({ ...v, l: v.l * 1.1 }).C0 <= r.C0) fail('more lost time should lengthen the cycle', v);
  }
  // Hand-solved: L = 3(4) = 12 s; y = 0.30, 0.25, 0.20; Y = 0.75; C0 = (1.5(12) + 5)/(1 - 0.75) = 23/0.25 = 92 s.
  refCheck(websterCycle({ l: 4, q1: 540, q2: 450, q3: 360, s: 1800 }), { L: 12, Y: 0.75, C0: 92 }, failures, 1e-9);
  rejects(websterCycle, [{ l: 4, q1: 900, q2: 900, q3: 900, s: 1800 }, { l: 0, q1: 540, q2: 450, q3: 360, s: 1800 }, { l: 4, q1: -1, q2: 450, q3: 360, s: 1800 }], failures);
  return failures;
}

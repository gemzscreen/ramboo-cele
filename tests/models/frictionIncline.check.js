// Stage 3 checks for js/models/frictionIncline.js.
import { frictionIncline } from '../../js/models/frictionIncline.js';
const near = (x, y, tol = 1e-9) => Math.abs(x - y) <= tol * Math.max(1, Math.abs(x), Math.abs(y));
const rejects = (fn, cases, failures) => { for (const bad of cases) { let threw = false; try { fn(bad); } catch { threw = true; } if (!threw) failures.push(`accepted invalid input ${JSON.stringify(bad)}`); } };
const refCheck = (ref, want, failures, tol = 5e-4) => { for (const [k, val] of Object.entries(want)) if (Math.abs(ref[k] - val) > tol * Math.abs(val)) failures.push(`reference instance: ${k} = ${ref[k]}, hand value ${val}`); };

export function check(rng, runs) {
  const failures = [];
  const fail = (msg, v) => { if (failures.length < 10) failures.push(`${msg} for ${JSON.stringify(v)}`); };
  let locking = 0;
  for (let i = 0; i < runs; i++) {
    const v = { W: 0.5 + rng() * 100, theta: 2 + rng() * 80, mu: 0.05 + rng() * 0.9 };
    const r = frictionIncline(v);
    const t = (v.theta * Math.PI) / 180;
    // Resolve in x-y (horizontal-vertical) instead of along the slope: with P up the slope,
    // N normal to it and limiting friction F, both force sums must vanish.
    for (const [P, F] of [[r.Pup, -r.Fmax], [r.Phold, r.Fmax]]) { // F positive = up the slope
      const fx = (P + F) * Math.cos(t) - r.N * Math.sin(t);
      const fy = (P + F) * Math.sin(t) + r.N * Math.cos(t) - v.W;
      if (Math.abs(fx) > 1e-9 * v.W || Math.abs(fy) > 1e-9 * v.W) fail('forces do not balance in x-y', v);
    }
    // Any P between the two limits needs less than limiting friction.
    const mid = (r.Pup + r.Phold) / 2;
    if (Math.abs(mid - r.pull) > 1e-9 * v.W) fail('mid-range force should need no friction', v);
    if (r.selfLocking) locking++;
    if (r.selfLocking !== (v.theta <= r.repose + 1e-12)) fail('self-locking must match theta <= angle of repose', v);
    if (!near(Math.tan((r.repose * Math.PI) / 180), v.mu, 1e-9)) fail('tan(repose) != mu', v);
    if (!(r.Pup > r.Phold)) fail('Pup must exceed Phold', v);
  }
  if (locking === 0) failures.push('random inputs never produced a self-locking block');
  // Hand-solved: W = 5 kN, 35 deg, mu = 0.30. sin = 0.573576, cos = 0.819152.
  // N = 4.0958; F = 1.2287; P_up = 2.8679 + 1.2287 = 4.0966; P_hold = 2.8679 - 1.2287 = 1.6392; repose = atan 0.30 = 16.699 deg.
  refCheck(frictionIncline({ W: 5, theta: 35, mu: 0.3 }), { N: 4.0958, Fmax: 1.2287, Pup: 4.0966, Phold: 1.6392, repose: 16.699 }, failures, 1e-4);
  rejects(frictionIncline, [{ W: 0, theta: 35, mu: 0.3 }, { W: 5, theta: 90, mu: 0.3 }, { W: 5, theta: 35, mu: 0 }, { W: 5, theta: NaN, mu: 0.3 }], failures);
  return failures;
}

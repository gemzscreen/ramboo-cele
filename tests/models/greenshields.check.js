// Stage 3 checks for js/models/greenshields.js.
import { greenshields } from '../../js/models/greenshields.js';
const near = (x, y, tol = 1e-9) => Math.abs(x - y) <= tol * Math.max(1, Math.abs(x), Math.abs(y));
const rejects = (fn, cases, failures) => { for (const bad of cases) { let threw = false; try { fn(bad); } catch { threw = true; } if (!threw) failures.push(`accepted invalid input ${JSON.stringify(bad)}`); } };
const refCheck = (ref, want, failures, tol = 5e-4) => { for (const [k, val] of Object.entries(want)) if (Math.abs(ref[k] - val) > tol * Math.abs(val)) failures.push(`reference instance: ${k} = ${ref[k]}, hand value ${val}`); };

export function check(rng, runs) {
  const failures = [];
  const fail = (msg, v) => { if (failures.length < 10) failures.push(`${msg} for ${JSON.stringify(v)}`); };
  for (let i = 0; i < Math.min(runs, 300); i++) {
    const v = { uf: 20 + rng() * 120, kj: 40 + rng() * 200 };
    const r = greenshields(v);
    // Scan every density; the largest flow must be qMax, at kj/2.
    let best = 0; let bestK = 0; const n = 20000;
    for (let j = 0; j <= n; j++) { const k = (j * v.kj) / n; const q = r.flow(k); if (q > best) { best = q; bestK = k; } }
    if (!near(best, r.qMax, 1e-7) || Math.abs(bestK - r.kCap) > v.kj / n) fail('qMax is not the scanned maximum at kj/2', v);
    if (!near(r.speed(0), v.uf) || Math.abs(r.speed(v.kj)) > 1e-9 || Math.abs(r.flow(v.kj)) > 1e-9 || r.flow(0) !== 0) fail('boundary conditions (free flow, jam) are wrong', v);
    if (!near(r.qMax, r.uCap * r.kCap)) fail('qMax != uCap * kCap', v);
    // Two densities equally far either side of kj/2 carry the same flow.
    const dk = rng() * r.kCap;
    if (!near(r.flow(r.kCap - dk), r.flow(r.kCap + dk), 1e-9)) fail('flow curve is not symmetric about kj/2', v);
  }
  // Hand-solved: uf = 80 km/h, kj = 120 veh/km: capacity at k = 60, u = 40: q = 2400 veh/h.
  refCheck(greenshields({ uf: 80, kj: 120 }), { kCap: 60, uCap: 40, qMax: 2400 }, failures, 1e-9);
  rejects(greenshields, [{ uf: 0, kj: 120 }, { uf: 80, kj: -1 }, { uf: NaN, kj: 120 }], failures);
  return failures;
}

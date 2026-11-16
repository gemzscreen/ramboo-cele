// Stage 3 checks for js/models/verticalCurveLowPoint.js.
import { verticalCurveLowPoint } from '../../js/models/verticalCurveLowPoint.js';
const near = (x, y, tol = 1e-9) => Math.abs(x - y) <= tol * Math.max(1, Math.abs(x), Math.abs(y));
const rejects = (fn, cases, failures) => { for (const bad of cases) { let threw = false; try { fn(bad); } catch { threw = true; } if (!threw) failures.push(`accepted invalid input ${JSON.stringify(bad)}`); } };
const refCheck = (ref, want, failures, tol = 5e-4) => { for (const [k, val] of Object.entries(want)) if (Math.abs(ref[k] - val) > tol * Math.abs(val)) failures.push(`reference instance: ${k} = ${ref[k]}, hand value ${val}`); };

export function check(rng, runs) {
  const failures = [];
  const fail = (msg, v) => { if (failures.length < 10) failures.push(`${msg} for ${JSON.stringify(v)}`); };
  for (let i = 0; i < Math.min(runs, 300); i++) {
    const sag = rng() < 0.5;
    const v = { g1: (sag ? -1 : 1) * (0.5 + rng() * 6), g2: (sag ? 1 : -1) * (0.5 + rng() * 6), L: 60 + rng() * 240, E: 10 + rng() * 90 };
    const r = verticalCurveLowPoint(v);
    // Scan the curve for its extreme elevation.
    let best = r.elevation(0); let bestX = 0; const n = 40000;
    for (let j = 1; j <= n; j++) { const x = (j * v.L) / n; const y = r.elevation(x); if (sag ? y < best : y > best) { best = y; bestX = x; } }
    if (Math.abs(bestX - r.x) > v.L / n * 1.01 || Math.abs(best - r.y) > 1e-5) fail('turning point differs from the scanned extreme', v);
    // Slope by finite difference vanishes at x, and the elevation at the end matches the average of the two grades.
    const dx = 1e-4; const slope = (r.elevation(r.x + dx) - r.elevation(r.x - dx)) / (2 * dx);
    if (Math.abs(slope) > 1e-7) fail('slope at the turning point is not zero', v);
    if (!near(r.pvt, v.E + (v.L * (v.g1 + v.g2)) / 200, 1e-10)) fail('PVT elevation != E + L (g1 + g2)/200', v);
    if (!(r.x > 0 && r.x < v.L)) fail('turning point lies outside the curve', v);
    if (!near(r.mid, v.E + (v.L * (3 * v.g1 + v.g2)) / 800, 1e-10)) fail('midpoint elevation != E + L (3 g1 + g2)/800', v);
  }
  // Hand-solved: g1 = -4%, g2 = +3%, L = 140 m, E = 52.00: x = 0.04(140)/0.07 = 80 m; y = 52 - 0.04(80) + 0.07(80^2)/(2 x 140) = 52 - 3.2 + 1.6 = 50.40 m.
  refCheck(verticalCurveLowPoint({ g1: -4, g2: 3, L: 140, E: 52 }), { x: 80, y: 50.4, tangentOnly: 48.8 }, failures, 1e-12);
  rejects(verticalCurveLowPoint, [{ g1: 4, g2: 3, L: 140, E: 52 }, { g1: -4, g2: 3, L: 0, E: 52 }, { g1: -4, g2: NaN, L: 140, E: 52 }], failures);
  return failures;
}

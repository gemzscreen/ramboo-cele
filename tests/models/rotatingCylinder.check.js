// Stage 3 checks for js/models/rotatingCylinder.js.
import { rotatingCylinder } from '../../js/models/rotatingCylinder.js';
const near = (x, y, tol = 1e-9) => Math.abs(x - y) <= tol * Math.max(1, Math.abs(x), Math.abs(y));
const rejects = (fn, cases, failures) => { for (const bad of cases) { let threw = false; try { fn(bad); } catch { threw = true; } if (!threw) failures.push(`accepted invalid input ${JSON.stringify(bad)}`); } };
const refCheck = (ref, want, failures, tol = 5e-4) => { for (const [k, val] of Object.entries(want)) if (Math.abs(ref[k] - val) > tol * Math.abs(val)) failures.push(`reference instance: ${k} = ${ref[k]}, hand value ${val}`); };

export function check(rng, runs) {
  const failures = [];
  const fail = (msg, v) => { if (failures.length < 10) failures.push(`${msg} for ${JSON.stringify(v)}`); };
  for (let i = 0; i < Math.min(runs, 400); i++) {
    const D = 0.2 + rng() * 3; const H = 0.5 + rng() * 4;
    const v = { D, H, d: H * (0.3 + rng() * 0.65), N: 5 + rng() * 200 };
    const r = rotatingCylinder(v);
    const g = 9.81;
    if (!r.spills && !r.vertexExposed) {
      // Volume of liquid under the paraboloid equals the volume at rest (integrate rings).
      const n = 4000; let vol = 0;
      for (let k = 0; k < n; k++) { const x = ((k + 0.5) * r.r) / n; vol += r.surface(x) * 2 * Math.PI * x * (r.r / n); }
      if (Math.abs(vol - Math.PI * r.r ** 2 * v.d) > 1e-6 * Math.PI * r.r ** 2 * v.d) fail('volume is not conserved', v);
      if (!near(r.surface(r.r), r.depthAtWall, 1e-9) || !near(r.surface(0), r.depthAtAxis, 1e-9)) fail('surface end points', v);
    }
    // Pressure head at the wall: radial equilibrium of a particle on the surface, dz/dx = w^2 x / g.
    const x = r.r * 0.7; const slope = (r.surface(x + 1e-6) - r.surface(x - 1e-6)) / 2e-6;
    if (Math.abs(slope - (r.omega ** 2 * x) / g) > 1e-5 * (1 + slope)) fail('surface slope != w^2 x / g', v);
    // At the spill speed the liquid just reaches the rim.
    const edge = rotatingCylinder({ ...v, N: r.Nspill });
    if (!near(edge.depthAtWall, H, 1e-9)) fail('at Nspill the wall depth should equal H', v);
    if (r.spills !== (v.N > r.Nspill * (1 + 1e-12))) fail('spill flag disagrees with Nspill', v);
    // Rim speed: h = v^2/2g with v = w r.
    if (!near(r.h, (r.omega * r.r) ** 2 / (2 * g))) fail('h != (rim speed)^2 / 2g', v);
  }
  // Hand-solved: D = 1.2 m, H = 2.0 m, d = 1.5 m, N = 60 rpm. w = 6.28319 rad/s; r = 0.6;
  // h = 39.4784(0.36)/19.62 = 0.72437 m; axis depth = 1.5 - 0.36218 = 1.13782 m;
  // spill when h = 2(0.5) = 1.0 m: w = sqrt(19.62)/0.6 = 7.38241 rad/s = 70.497 rpm.
  refCheck(rotatingCylinder({ D: 1.2, H: 2, d: 1.5, N: 60 }), { omega: 6.28319, h: 0.72437, depthAtAxis: 1.13782, omegaSpill: 7.38241, Nspill: 70.497 }, failures, 2e-5);
  rejects(rotatingCylinder, [{ D: 0, H: 2, d: 1.5, N: 60 }, { D: 1.2, H: 2, d: 2.5, N: 60 }, { D: 1.2, H: 2, d: 1.5, N: 0 }, { D: 1.2, H: NaN, d: 1.5, N: 60 }], failures);
  return failures;
}

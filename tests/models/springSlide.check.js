// Stage 3 checks for js/models/springSlide.js.
import { springSlide } from '../../js/models/springSlide.js';
const near = (x, y, tol = 1e-9) => Math.abs(x - y) <= tol * Math.max(1, Math.abs(x), Math.abs(y));
const rejects = (fn, cases, failures) => { for (const bad of cases) { let threw = false; try { fn(bad); } catch { threw = true; } if (!threw) failures.push(`accepted invalid input ${JSON.stringify(bad)}`); } };
const refCheck = (ref, want, failures, tol = 5e-4) => { for (const [k, val] of Object.entries(want)) if (Math.abs(ref[k] - val) > tol * Math.abs(val)) failures.push(`reference instance: ${k} = ${ref[k]}, hand value ${val}`); };

export function check(rng, runs) {
  const failures = [];
  const fail = (msg, v) => { if (failures.length < 10) failures.push(`${msg} for ${JSON.stringify(v)}`); };
  const g = 9.81;
  for (let i = 0; i < Math.min(runs, 300); i++) {
    const v = { m: 1 + rng() * 9, theta: 20 + rng() * 40, mu: rng() * 0.25, d: rng() * 3, k: 200 + rng() * 1500 };
    const th = (v.theta * Math.PI) / 180;
    const r = springSlide(v);
    // Energy balance written out from the pieces: height lost, friction work, spring energy.
    const slide = v.d + r.x;
    const lost = v.m * g * slide * Math.sin(th);
    const friction = v.mu * v.m * g * Math.cos(th) * slide;
    const spring = 0.5 * v.k * r.x * r.x;
    if (!near(lost - friction, spring, 1e-9)) fail('energy does not balance at the maximum compression', v);
    // Bisection on the energy residual.
    let lo = 0; let hi = 10;
    for (let k = 0; k < 200; k++) { const mid = (lo + hi) / 2; const res = v.m * g * (Math.sin(th) - v.mu * Math.cos(th)) * (v.d + mid) - 0.5 * v.k * mid * mid; if (res > 0) lo = mid; else hi = mid; }
    if (!near(r.x, lo, 1e-9)) fail('compression differs from the bisection root', v);
    if (r.x < r.equilibriumCompression - 1e-12) fail('the maximum compression cannot be smaller than the equilibrium compression', v);
  }
  // Time-stepping run (velocity Verlet with kinetic friction) for a few cases: the block must stop at the same compression.
  for (let i = 0; i < 6; i++) {
    const v = { m: 2 + rng() * 6, theta: 25 + rng() * 15, mu: 0.1 + rng() * 0.15, d: 1 + rng() * 2, k: 400 + rng() * 800 };
    const th = (v.theta * Math.PI) / 180; const dt = 2e-5;
    let pos = 0; let vel = 0; let maxX = 0; // pos is distance down the slope from release; the spring starts at pos = d
    const force = (p, u) => v.m * g * Math.sin(th) - (u > 0 ? v.mu * v.m * g * Math.cos(th) : 0) - (p > v.d ? v.k * (p - v.d) : 0);
    for (let step = 0; step < 400000; step++) {
      const acc = force(pos, vel) / v.m;
      pos += vel * dt + 0.5 * acc * dt * dt;
      const velNew = vel + acc * dt;
      vel = velNew;
      if (pos - v.d > maxX) maxX = pos - v.d;
      if (vel < 0) break;
    }
    const r = springSlide(v);
    if (Math.abs(maxX - r.x) > 2e-3 * r.x) fail(`time-stepping gives ${maxX.toFixed(5)} m, closed form ${r.x.toFixed(5)} m`, v);
  }
  // Hand-solved: m = 4, theta = 30, mu = 0.2, d = 2, k = 800, g = 9.81. a = 39.24(0.5 - 0.2 x 0.866025) = 12.8230 N.
  // x = [12.8230 + sqrt(12.8230^2 + 2(800)(12.8230)(2))]/800 = (12.8230 + 202.9770)/800 = 0.26975 m. Equilibrium compression a/k = 0.016029.
  refCheck(springSlide({ m: 4, theta: 30, mu: 0.2, d: 2, k: 800 }), { a: 12.8230, x: 0.269750, xMm: 269.750, equilibriumCompression: 0.0160288 }, failures, 1e-4);
  rejects(springSlide, [{ m: 0, theta: 30, mu: 0.2, d: 2, k: 800 }, { m: 4, theta: 30, mu: 0.9, d: 2, k: 800 }, { m: 4, theta: 95, mu: 0.2, d: 2, k: 800 }, { m: 4, theta: 30, mu: 0.2, d: 2, k: 0 }], failures);
  return failures;
}

// Stage 3 checks for js/models/footingShear.js.
import { footingShear } from '../../js/models/footingShear.js';
const near = (x, y, tol = 1e-9) => Math.abs(x - y) <= tol * Math.max(1, Math.abs(x), Math.abs(y));
const rejects = (fn, cases, failures) => { for (const bad of cases) { let threw = false; try { fn(bad); } catch { threw = true; } if (!threw) failures.push(`accepted invalid input ${JSON.stringify(bad)}`); } };
const refCheck = (ref, want, failures, tol = 5e-4) => { for (const [k, val] of Object.entries(want)) if (Math.abs(ref[k] - val) > tol * Math.abs(val)) failures.push(`reference instance: ${k} = ${ref[k]}, hand value ${val}`); };

export function check(rng, runs) {
  const failures = [];
  const fail = (msg, v) => { if (failures.length < 10) failures.push(`${msg} for ${JSON.stringify(v)}`); };
  for (let i = 0; i < runs; i++) {
    const B = 1.5 + rng() * 4; const c = 250 + rng() * 500; const d = 200 + rng() * 500;
    const v = { B, c, d, PD: 200 + rng() * 2000, PL: rng() * 1500 };
    let r; try { r = footingShear(v); } catch { continue; }
    const cm = c / 1000; const dm = d / 1000;
    if (!near(r.Pu, Math.max(1.2 * v.PD + 1.6 * v.PL, 1.4 * v.PD))) fail('Pu is not the governing combination', v);
    // The upward pressure on the whole base equals the factored column load.
    if (!near(r.qu * B * B, r.Pu)) fail('qu B^2 != Pu', v);
    // Punching: column load less the pressure acting inside the critical perimeter.
    if (!near(r.Vu2, r.Pu - r.qu * (cm + dm) ** 2, 1e-9)) fail('Vu2 != Pu - qu(c + d)^2', v);
    // One-way shear by summing pressure over the strip outside the critical section (Monte-Carlo-free grid sum).
    const n = 400; let sum = 0; const x0 = cm / 2 + dm;
    for (let k = 0; k < n; k++) { const x = x0 + ((k + 0.5) * (B / 2 - x0)) / n; sum += r.qu * B * ((B / 2 - x0) / n) * (x > 0 ? 1 : 0); }
    if (!near(sum, r.Vu1, 1e-9)) fail('Vu1 disagrees with the strip sum', v);
    // Moment at the face by the same strip sum.
    let m = 0; for (let k = 0; k < n; k++) { const s = ((k + 0.5) * r.arm) / n; m += r.qu * B * (r.arm / n) * s; }
    if (!near(m, r.Mu, 1e-6)) fail('Mu disagrees with the strip sum', v);
    if (!(r.Vu2 > r.Vu1 && r.Vu2 < r.Pu)) fail('expected Vu1 < Vu2 < Pu', v);
    if (!near(r.b0, 4 * (cm + dm))) fail('b0', v);
  }
  // 1.4D governs when live load is small.
  if (!near(footingShear({ B: 3, c: 500, d: 450, PD: 1000, PL: 50 }).Pu, 1400)) failures.push('1.4D should govern for PD = 1000, PL = 50');
  // Hand-solved: B = 3 m, column 500 mm, d = 450 mm, PD = 900, PL = 600.
  // Pu = 1.2(900) + 1.6(600) = 2040 kN; qu = 2040/9 = 226.67 kPa;
  // Vu1 = 226.67(3)[(3 - 0.5)/2 - 0.45] = 680(0.80) = 544.0 kN;
  // Vu2 = 226.67[9 - (0.95)^2] = 226.67(8.0975) = 1835.4 kN; Mu = 226.67(3)(1.25^2)/2 = 531.25 kN·m.
  refCheck(footingShear({ B: 3, c: 500, d: 450, PD: 900, PL: 600 }), { Pu: 2040, qu: 226.667, Vu1: 544.0, Vu2: 1835.43, Mu: 531.25 }, failures, 1e-5);
  rejects(footingShear, [{ B: 0, c: 500, d: 450, PD: 900, PL: 600 }, { B: 1, c: 500, d: 450, PD: 900, PL: 600 }, { B: 3, c: 500, d: 450, PD: NaN, PL: 600 }, { B: 3, c: 3500, d: 450, PD: 900, PL: 600 }], failures);
  return failures;
}

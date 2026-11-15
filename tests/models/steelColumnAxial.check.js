// Stage 3 checks for js/models/steelColumnAxial.js.
import { steelColumnAxial } from '../../js/models/steelColumnAxial.js';
const near = (x, y, tol = 1e-9) => Math.abs(x - y) <= tol * Math.max(1, Math.abs(x), Math.abs(y));
const rejects = (fn, cases, failures) => { for (const bad of cases) { let threw = false; try { fn(bad); } catch { threw = true; } if (!threw) failures.push(`accepted invalid input ${JSON.stringify(bad)}`); } };
const refCheck = (ref, want, failures, tol = 5e-4) => { for (const [k, val] of Object.entries(want)) if (Math.abs(ref[k] - val) > tol * Math.abs(val)) failures.push(`reference instance: ${k} = ${ref[k]}, hand value ${val}`); };

export function check(rng, runs) {
  const failures = [];
  const fail = (msg, v) => { if (failures.length < 10) failures.push(`${msg} for ${JSON.stringify(v)}`); };
  let nIn = 0; let nEl = 0;
  for (let i = 0; i < runs; i++) {
    const v = { A: 2000 + rng() * 30000, rx: 60 + rng() * 200, ry: 20 + rng() * 100, Lx: 2 + rng() * 14, Ly: 1 + rng() * 14, Kx: 0.5 + rng() * 1.6, Ky: 0.5 + rng() * 1.6, Fy: 230 + rng() * 240 };
    const r = steelColumnAxial(v);
    if (r.inelastic) nIn++; else nEl++;
    if (!near(r.sl, Math.max((v.Kx * v.Lx * 1000) / v.rx, (v.Ky * v.Ly * 1000) / v.ry))) fail('governing slenderness is not the larger ratio', v);
    // Euler load two ways: pi^2 E I / (KL)^2 with I = A r^2.
    const rg = r.governs === 'x' ? v.rx : v.ry; const KL = (r.governs === 'x' ? v.Kx * v.Lx : v.Ky * v.Ly) * 1000;
    if (!near(r.Fe * v.A, (Math.PI ** 2 * 200000 * v.A * rg * rg) / KL ** 2, 1e-9)) fail('Fe*A is not the Euler load', v);
    if (!(r.Fcr > 0 && r.Fcr < v.Fy)) fail('Fcr must lie between 0 and Fy', v);
    if (!(r.Fcr <= 0.877 * r.Fe + 1e-9 || r.inelastic)) fail('elastic branch must be 0.877Fe', v);
    if (r.inelastic !== (v.Fy / r.Fe <= 2.25 + 1e-3)) { if (Math.abs(v.Fy / r.Fe - 2.25) > 0.01) fail('branch does not match the Fy/Fe <= 2.25 form of the limit', v); }
    if (!near(r.phiPn, (0.9 * r.Fcr * v.A) / 1000) || !near(r.Pallow * 1.67, r.Pn)) fail('phiPn or Pallow inconsistent with Pn', v);
    // Longer column of the same section is never stronger.
    const longer = steelColumnAxial({ ...v, Lx: v.Lx * 1.1, Ly: v.Ly * 1.1 });
    if (!(longer.Fcr < r.Fcr)) fail('Fcr did not fall when the column got longer', v);
  }
  if (nIn === 0 || nEl === 0) failures.push('random inputs did not exercise both the inelastic and elastic branches');
  // The two branches meet at the limiting slenderness (within the rounding of 4.71 and 0.877).
  const E = 200000; const Fy = 345; const lim = 4.71 * Math.sqrt(E / Fy);
  const below = steelColumnAxial({ A: 1e4, rx: 100, ry: 100, Lx: (lim * 0.9999) / 10, Ly: 1, Fy });
  const above = steelColumnAxial({ A: 1e4, rx: 100, ry: 100, Lx: (lim * 1.0001) / 10, Ly: 1, Fy });
  if (!below.inelastic || above.inelastic || Math.abs(below.Fcr - above.Fcr) > 0.002 * below.Fcr) failures.push('branches do not meet at 4.71*sqrt(E/Fy)');
  // Hand-solved: A = 12000, rx = 150, ry = 60, Lx = 8 m, Ly = 4 m, K = 1, Fy = 248.
  // KL/r: x = 8000/150 = 53.33, y = 4000/60 = 66.67 (governs) < 4.71*sqrt(200000/248) = 133.76.
  // Fe = pi^2(200000)/66.667^2 = 444.13; Fy/Fe = 0.55839; 0.658^0.55839 = 0.79158;
  // Fcr = 196.31 MPa; Pn = 196.31(12000)/1000 = 2355.7 kN; 0.9Pn = 2120.2 kN.
  const ref = steelColumnAxial({ A: 12000, rx: 150, ry: 60, Lx: 8, Ly: 4, Fy: 248 });
  refCheck(ref, { slx: 53.333, sly: 66.667, limit: 133.76, Fe: 444.13, Fcr: 196.31, Pn: 2355.7, phiPn: 2120.2 }, failures, 2e-4);
  if (ref.governs !== 'y' || !ref.inelastic) failures.push('reference instance: wrong governing axis or branch');
  rejects(steelColumnAxial, [{ A: 0, rx: 150, ry: 60, Lx: 8, Ly: 4, Fy: 248 }, { A: 12000, rx: 150, ry: 60, Lx: 8, Ly: 4, Fy: NaN }, { A: 12000, rx: -1, ry: 60, Lx: 8, Ly: 4, Fy: 248 }], failures);
  return failures;
}

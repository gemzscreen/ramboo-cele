// Stage 3 checks for js/models/rcBeamSingly.js.
import { rcBeamSingly } from '../../js/models/rcBeamSingly.js';
const near = (x, y, tol = 1e-9) => Math.abs(x - y) <= tol * Math.max(1, Math.abs(x), Math.abs(y));
const rejects = (fn, cases, failures) => { for (const bad of cases) { let threw = false; try { fn(bad); } catch { threw = true; } if (!threw) failures.push(`accepted invalid input ${JSON.stringify(bad)}`); } };
const refCheck = (ref, want, failures, tol = 5e-4) => { for (const [k, val] of Object.entries(want)) if (Math.abs(ref[k] - val) > tol * Math.abs(val)) failures.push(`reference instance: ${k} = ${ref[k]}, hand value ${val}`); };

import { beta1 } from '../../js/models/rcBeamSingly.js';
export function check(rng, runs) {
  const failures = [];
  const fail = (msg, v) => { if (failures.length < 10) failures.push(`${msg} for ${JSON.stringify(v)}`); };
  const zones = { tension: 0, transition: 0, compression: 0 };
  for (let i = 0; i < runs; i++) {
    const b = 200 + rng() * 400; const d = 300 + rng() * 600; const fc = 17 + rng() * 40; const fy = 230 + rng() * 300;
    const v = { b, d, fc, fy, As: (0.002 + rng() * 0.03) * b * d };
    let r; try { r = rcBeamSingly(v); } catch { continue; }
    // Force equilibrium: 0.85 f'c a b = As fy.
    if (!near(0.85 * fc * r.a * b, v.As * fy, 1e-9)) fail('C != T', v);
    // Moment of the compression block about the steel.
    if (!near(r.Mn * 1e6, 0.85 * fc * r.a * b * (d - r.a / 2), 1e-9)) fail('Mn != C * lever arm', v);
    // Same strength in the steel-ratio form: Mn = rho fy b d^2 [1 - rho fy / (1.7 f'c)].
    if (!near(r.Mn * 1e6, r.rho * fy * b * d * d * (1 - (r.rho * fy) / (1.7 * fc)), 1e-9)) fail('Mn disagrees with the rho form', v);
    // Strain diagram: similar triangles through the neutral axis.
    if (!near(r.epsT / (d - r.c), 0.003 / r.c, 1e-9)) fail('strain diagram is not linear', v);
    if (!near(r.c * r.b1, r.a)) fail('a != beta1 c', v);
    if (!(r.phi >= 0.65 && r.phi <= 0.9)) fail('phi out of range', v);
    if (r.epsT >= 0.005) { zones.tension++; if (r.phi !== 0.9) fail('tension-controlled section must use 0.90', v); }
    else if (r.epsT <= r.epsY) { zones.compression++; if (r.phi !== 0.65 || r.yields) fail('compression-controlled section must use 0.65', v); }
    else zones.transition++;
    if (!near(r.phiMn, r.phi * r.Mn)) fail('phiMn != phi*Mn', v);
  }
  for (const [k, n] of Object.entries(zones)) if (n === 0) failures.push(`random inputs never produced a ${k} section`);
  // beta1 at the code's anchor points.
  for (const [fc, want] of [[21, 0.85], [28, 0.85], [35, 0.80], [42, 0.75], [56, 0.65], [70, 0.65]]) if (!near(beta1(fc), want, 1e-12)) failures.push(`beta1(${fc}) = ${beta1(fc)}, expected ${want}`);
  // Hand-solved: b = 300, d = 500, 4-20 mm bars (As = 4*314.159 = 1256.64), f'c = 28, fy = 415.
  // a = 1256.64(415)/(0.85*28*300) = 521505/7140 = 73.04 mm; c = 73.04/0.85 = 85.93 mm;
  // eps_t = 0.003(500 - 85.93)/85.93 = 0.014456 (> 0.005, phi = 0.90);
  // Mn = 521505(500 - 36.52)/1e6 = 241.71 kN·m; phi Mn = 217.54 kN·m.
  const ref = rcBeamSingly({ b: 300, d: 500, As: 4 * Math.PI * 100, fc: 28, fy: 415 });
  refCheck(ref, { a: 73.04, c: 85.93, epsT: 0.014456, Mn: 241.71, phiMn: 217.54 }, failures, 2e-4);
  if (ref.phi !== 0.9) failures.push('reference instance: phi should be 0.90');
  rejects(rcBeamSingly, [{ b: 0, d: 500, As: 1200, fc: 28, fy: 415 }, { b: 300, d: 500, As: 1200, fc: NaN, fy: 415 }, { b: 300, d: 500, As: 40000, fc: 21, fy: 415 }], failures);
  return failures;
}

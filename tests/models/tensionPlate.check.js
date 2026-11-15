// Stage 3 checks for js/models/tensionPlate.js.
import { tensionPlate } from '../../js/models/tensionPlate.js';
const near = (x, y, tol = 1e-9) => Math.abs(x - y) <= tol * Math.max(1, Math.abs(x), Math.abs(y));
const rejects = (fn, cases, failures) => { for (const bad of cases) { let threw = false; try { fn(bad); } catch { threw = true; } if (!threw) failures.push(`accepted invalid input ${JSON.stringify(bad)}`); } };
const refCheck = (ref, want, failures, tol = 5e-4) => { for (const [k, val] of Object.entries(want)) if (Math.abs(ref[k] - val) > tol * Math.abs(val)) failures.push(`reference instance: ${k} = ${ref[k]}, hand value ${val}`); };

export function check(rng, runs) {
  const failures = [];
  const fail = (msg, v) => { if (failures.length < 10) failures.push(`${msg} for ${JSON.stringify(v)}`); };
  const seen = { yielding: 0, rupture: 0 };
  for (let i = 0; i < runs; i++) {
    const n = 1 + Math.floor(rng() * 4); const dh = 14 + rng() * 20;
    const Fy = 230 + rng() * 150;
    const v = { w: n * dh + 30 + rng() * 300, t: 6 + rng() * 30, n, dh, Fy, Fu: Fy + 20 + rng() * 200 };
    const r = tensionPlate(v);
    seen[r.governs]++;
    // Net area as the plate with the hole strips removed, one by one.
    let area = v.w * v.t; for (let k = 0; k < n; k++) area -= dh * v.t;
    if (!near(r.An, area, 1e-9)) fail('net area != gross less the holes', v);
    if (!near(r.phiYield, (0.9 * Fy * v.w * v.t) / 1000) || !near(r.phiRupture, (0.75 * v.Fu * area) / 1000, 1e-9)) fail('limit states', v);
    if (!near(r.design, Math.min(r.phiYield, r.phiRupture))) fail('design strength is not the smaller limit state', v);
    // LRFD and ASD are calibrated to each other: phi * Omega = 1.5 for both limit states.
    if (Math.abs(r.phiYield / r.allowYield - 1.5) > 0.005 || !near(r.phiRupture / r.allowRupture, 1.5, 1e-9)) fail('phi x Omega should be 1.5', v);
    if (!(r.An < r.Ag)) fail('net area must be below gross area', v);
    // Rupture governs exactly when An/Ag < 0.9Fy/(0.75Fu).
    if ((r.governs === 'rupture') !== (r.An / r.Ag < (0.9 * Fy) / (0.75 * v.Fu))) fail('governing limit state is inconsistent', v);
  }
  if (!seen.yielding || !seen.rupture) failures.push('random inputs did not exercise both limit states');
  // Hand-solved: 200 x 12 plate, two 24 mm holes, Fy = 248, Fu = 400.
  // Ag = 2400; An = (200 - 48)(12) = 1824; 0.9(248)(2400)/1000 = 535.68 kN; 0.75(400)(1824)/1000 = 547.2 kN; yielding governs.
  const ref = tensionPlate({ w: 200, t: 12, n: 2, dh: 24, Fy: 248, Fu: 400 });
  refCheck(ref, { Ag: 2400, An: 1824, phiYield: 535.68, phiRupture: 547.2, design: 535.68 }, failures, 1e-9);
  if (ref.governs !== 'yielding') failures.push('reference instance: yielding should govern');
  rejects(tensionPlate, [{ w: 40, t: 12, n: 2, dh: 24, Fy: 248, Fu: 400 }, { w: 200, t: 12, n: 1.5, dh: 24, Fy: 248, Fu: 400 }, { w: 200, t: 12, n: 2, dh: 24, Fy: 400, Fu: 248 }, { w: 200, t: NaN, n: 2, dh: 24, Fy: 248, Fu: 400 }], failures);
  return failures;
}

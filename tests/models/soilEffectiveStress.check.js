// Stage 3 checks for js/models/soilEffectiveStress.js.
import { soilEffectiveStress } from '../../js/models/soilEffectiveStress.js';
const near = (x, y, tol = 1e-9) => Math.abs(x - y) <= tol * Math.max(1, Math.abs(x), Math.abs(y));
const rejects = (fn, cases, failures) => { for (const bad of cases) { let threw = false; try { fn(bad); } catch { threw = true; } if (!threw) failures.push(`accepted invalid input ${JSON.stringify(bad)}`); } };
const refCheck = (ref, want, failures, tol = 5e-4) => { for (const [k, val] of Object.entries(want)) if (Math.abs(ref[k] - val) > tol * Math.abs(val)) failures.push(`reference instance: ${k} = ${ref[k]}, hand value ${val}`); };

export function check(rng, runs) {
  const failures = [];
  const fail = (msg, v) => { if (failures.length < 10) failures.push(`${msg} for ${JSON.stringify(v)}`); };
  const gw = 9.81;
  for (let i = 0; i < runs; i++) {
    const H1 = 1 + rng() * 15;
    const v = { H1, dw: rng() * H1, gamma1: 14 + rng() * 5, gammaSat1: 17 + rng() * 5, gammaSat2: 15 + rng() * 7, z2: rng() * 20 };
    const r = soilEffectiveStress(v);
    // Effective stress built directly from buoyant unit weights below the water table.
    const direct = v.gamma1 * v.dw + (v.gammaSat1 - gw) * (H1 - v.dw) + (v.gammaSat2 - gw) * v.z2;
    if (!near(r.effective, direct, 1e-9)) fail('effective stress disagrees with the buoyant-weight build-up', v);
    // Total stress by summing thin slices of soil down to the point.
    const n = 4000; const depth = H1 + v.z2; let total = 0;
    for (let k = 0; k < n; k++) { const z = ((k + 0.5) * depth) / n; total += (z < v.dw ? v.gamma1 : z < H1 ? v.gammaSat1 : v.gammaSat2) * (depth / n); }
    if (Math.abs(total - r.total) > 1e-3 * r.total) fail(`sliced total stress ${total} != ${r.total}`, v);
    if (!near(r.u, gw * (depth - v.dw))) fail('pore pressure is not hydrostatic below the water table', v);
    if (!(r.effective > 0 && r.effective <= r.total)) fail('effective stress must be positive and not above total', v);
    // Lowering the water table raises effective stress when the soil above it is no lighter than buoyant.
    if (v.dw + 0.5 <= H1 && soilEffectiveStress({ ...v, dw: v.dw + 0.5 }).effective <= r.effective) fail('lowering the water table should raise effective stress', v);
  }
  // Hand-solved: 6 m sand, water table at 2 m, gamma = 17, gamma_sat = 19.5; clay gamma_sat = 18; point 4 m into the clay.
  // total = 17(2) + 19.5(4) + 18(4) = 34 + 78 + 72 = 184; u = 9.81(4 + 4) = 78.48; effective = 105.52.
  refCheck(soilEffectiveStress({ H1: 6, dw: 2, gamma1: 17, gammaSat1: 19.5, gammaSat2: 18, z2: 4 }), { total: 184, u: 78.48, effective: 105.52 }, failures, 1e-9);
  rejects(soilEffectiveStress, [{ H1: 6, dw: 7, gamma1: 17, gammaSat1: 19.5, gammaSat2: 18, z2: 4 }, { H1: 6, dw: 2, gamma1: 17, gammaSat1: 9, gammaSat2: 18, z2: 4 }, { H1: 6, dw: 2, gamma1: 17, gammaSat1: 19.5, gammaSat2: 18, z2: -1 }, { H1: NaN, dw: 2, gamma1: 17, gammaSat1: 19.5, gammaSat2: 18, z2: 4 }], failures);
  return failures;
}

// Stage 3 checks for js/models/conePileRate.js.
import { conePileRate } from '../../js/models/conePileRate.js';
const near = (x, y, tol = 1e-9) => Math.abs(x - y) <= tol * Math.max(1, Math.abs(x), Math.abs(y));
const rejects = (fn, cases, failures) => { for (const bad of cases) { let threw = false; try { fn(bad); } catch { threw = true; } if (!threw) failures.push(`accepted invalid input ${JSON.stringify(bad)}`); } };
const refCheck = (ref, want, failures, tol = 5e-4) => { for (const [k, val] of Object.entries(want)) if (Math.abs(ref[k] - val) > tol * Math.abs(val)) failures.push(`reference instance: ${k} = ${ref[k]}, hand value ${val}`); };

export function check(rng, runs) {
  const failures = [];
  const fail = (msg, v) => { if (failures.length < 10) failures.push(`${msg} for ${JSON.stringify(v)}`); };
  for (let i = 0; i < Math.min(runs, 300); i++) {
    const v = { q: 1 + rng() * 40, k: 0.5 + rng() * 2.5, h: 0.5 + rng() * 6 };
    const r = conePileRate(v);
    // Height as a function of volume, h(V) = (3V / (pi k^2))^(1/3); central difference in V, times the inflow rate.
    const hOf = (V) => Math.cbrt((3 * V) / (Math.PI * v.k * v.k));
    const V0 = (Math.PI * v.k * v.k * v.h ** 3) / 3; const dV = V0 * 1e-6;
    const numeric = ((hOf(V0 + dV) - hOf(V0 - dV)) / (2 * dV)) * v.q;
    if (!near(r.rate, numeric, 1e-6)) fail('rate differs from the numerical derivative of h(V) times the inflow', v);
    if (!near(r.volume, V0, 1e-12)) fail('cone volume mismatch', v);
    // Same pile as a stack of thin discs: the surface area at the top equals the base area, so the rate is inflow over the top area.
    if (!near(r.rate, v.q / (Math.PI * r.radius ** 2), 1e-12)) fail('rate != inflow / surface area', v);
    if (!near(conePileRate({ ...v, h: 2 * v.h }).rate, r.rate / 4, 1e-9)) fail('doubling the height should quarter the rate', v);
  }
  // Hand-solved: V = pi (1.5)^2 h^3 / 3, dV/dt = pi (2.25) h^2 dh/dt; at h = 2: 28.2743 dh/dt = 12, so dh/dt = 0.424413 m/min.
  refCheck(conePileRate({ q: 12, k: 1.5, h: 2 }), { rate: 0.424413, radius: 3, baseArea: 28.27433 }, failures, 1e-5);
  rejects(conePileRate, [{ q: 0, k: 1.5, h: 2 }, { q: 12, k: -1, h: 2 }, { q: 12, k: 1.5, h: 0 }], failures);
  return failures;
}

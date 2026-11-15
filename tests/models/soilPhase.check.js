// Stage 3 checks for js/models/soilPhase.js.
import { soilPhase } from '../../js/models/soilPhase.js';
const near = (x, y, tol = 1e-9) => Math.abs(x - y) <= tol * Math.max(1, Math.abs(x), Math.abs(y));
const rejects = (fn, cases, failures) => { for (const bad of cases) { let threw = false; try { fn(bad); } catch { threw = true; } if (!threw) failures.push(`accepted invalid input ${JSON.stringify(bad)}`); } };
const refCheck = (ref, want, failures, tol = 5e-4) => { for (const [k, val] of Object.entries(want)) if (Math.abs(ref[k] - val) > tol * Math.abs(val)) failures.push(`reference instance: ${k} = ${ref[k]}, hand value ${val}`); };

export function check(rng, runs) {
  const failures = [];
  const fail = (msg, v) => { if (failures.length < 10) failures.push(`${msg} for ${JSON.stringify(v)}`); };
  const gw = 9.81;
  for (let i = 0; i < runs; i++) {
    const Gs = 2.4 + rng() * 0.5; const e = 0.3 + rng() * 1.2;
    const v = { Gs, e, w: rng() * (e / Gs) * 100 };
    const r = soilPhase(v);
    // Build the phase diagram from scratch with Vs = 1 m^3.
    const Ws = Gs * gw; const Ww = (v.w / 100) * Ws; const Vw = Ww / gw; const Vv = e; const Vt = 1 + e;
    if (!near(r.S, (Vw / Vv) * 100, 1e-9)) fail('S != Vw/Vv', v);
    if (!near(r.gammaMoist, (Ws + Ww) / Vt, 1e-9)) fail('moist unit weight != W/V', v);
    if (!near(r.gammaDry, Ws / Vt, 1e-9)) fail('dry unit weight != Ws/V', v);
    if (!near(r.gammaSat, (Ws + Vv * gw) / Vt, 1e-9)) fail('saturated unit weight', v);
    if (!near(r.n, (Vv / Vt) * 100, 1e-9)) fail('porosity != Vv/V', v);
    if (!near(r.gammaSub, r.gammaSat - gw, 1e-9)) fail('submerged != saturated - water', v);
    if (!near(r.gammaDry * (1 + v.w / 100), r.gammaMoist, 1e-9)) fail('gamma != gamma_d (1 + w)', v);
    if (!(r.gammaDry <= r.gammaMoist + 1e-12 && r.gammaMoist <= r.gammaSat + 1e-9)) fail('expected dry <= moist <= saturated', v);
    if (!(r.S >= 0 && r.S <= 100 + 1e-7)) fail('S out of range', v);
  }
  // At the saturation water content, moist = saturated and S = 100.
  const full = soilPhase({ Gs: 2.65, e: 0.8, w: (0.8 / 2.65) * 100 });
  if (!near(full.S, 100, 1e-9) || !near(full.gammaMoist, full.gammaSat, 1e-9)) failures.push('w = e/Gs should give S = 100% and moist = saturated');
  // Hand-solved: Gs = 2.70, e = 0.60, w = 15%. S = 0.15(2.70)/0.60 = 67.5%;
  // gamma_d = 2.70(9.81)/1.60 = 16.554; gamma = 16.554(1.15) = 19.037; gamma_sat = 3.30(9.81)/1.60 = 20.233; n = 37.5%.
  refCheck(soilPhase({ Gs: 2.7, e: 0.6, w: 15 }), { S: 67.5, gammaDry: 16.554, gammaMoist: 19.037, gammaSat: 20.233, n: 37.5 }, failures, 5e-5);
  rejects(soilPhase, [{ Gs: 0, e: 0.6, w: 15 }, { Gs: 2.7, e: 0.6, w: 40 }, { Gs: 2.7, e: NaN, w: 15 }, { Gs: 2.7, e: 0.6, w: -1 }], failures);
  return failures;
}

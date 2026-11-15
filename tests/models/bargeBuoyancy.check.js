// Stage 3 checks for js/models/bargeBuoyancy.js.
import { bargeBuoyancy } from '../../js/models/bargeBuoyancy.js';
const near = (x, y, tol = 1e-9) => Math.abs(x - y) <= tol * Math.max(1, Math.abs(x), Math.abs(y));
const rejects = (fn, cases, failures) => { for (const bad of cases) { let threw = false; try { fn(bad); } catch { threw = true; } if (!threw) failures.push(`accepted invalid input ${JSON.stringify(bad)}`); } };
const refCheck = (ref, want, failures, tol = 5e-4) => { for (const [k, val] of Object.entries(want)) if (Math.abs(ref[k] - val) > tol * Math.abs(val)) failures.push(`reference instance: ${k} = ${ref[k]}, hand value ${val}`); };

export function check(rng, runs) {
  const failures = [];
  const fail = (msg, v) => { if (failures.length < 10) failures.push(`${msg} for ${JSON.stringify(v)}`); };
  for (let i = 0; i < runs; i++) {
    const L = 5 + rng() * 80; const B = 2 + rng() * 20; const H = 1 + rng() * 6; const sg = 0.95 + rng() * 0.15;
    const f = rng() * H * 0.5;
    const v = { L, B, H, sg, f, W: rng() * 0.9 * sg * 9.81 * L * B * (H - f) + 1 };
    const r = bargeBuoyancy(v);
    // Archimedes: weight of water displaced equals the weight afloat, empty and loaded.
    if (!near(sg * 9.81 * L * B * r.draftEmpty, v.W, 1e-9)) fail('empty: displaced weight != barge weight', v);
    if (!near(sg * 9.81 * L * B * r.draftMax, v.W + r.cargo, 1e-9)) fail('loaded: displaced weight != barge + cargo', v);
    if (!near(9.81 * L * B * r.draftFresh, v.W + r.cargo, 1e-9)) fail('fresh water: displaced weight != barge + cargo', v);
    // Pressure on the flat bottom carries the whole weight.
    if (!near(sg * 9.81 * r.draftMax * r.plan, r.displacement, 1e-9)) fail('bottom pressure x area != displacement', v);
    if (!near(r.draftMax + v.f, H)) fail('draft + freeboard != hull depth', v);
    if (!near(r.draftFresh / r.draftMax, sg, 1e-9)) fail('drafts should be in inverse ratio to the specific gravities', v);
    if (!(r.cargo >= -1e-9 && r.draftEmpty <= r.draftMax + 1e-12)) fail('cargo must not be negative', v);
  }
  // Hand-solved: 30 x 8 x 3 m, W = 1200 kN, seawater sg 1.03, freeboard 0.6 m.
  // gamma = 10.1043; plan = 240; empty draft = 1200/(10.1043*240) = 1200/2425.03 = 0.49484 m;
  // loaded draft 2.4 m: displacement = 2425.03(2.4) = 5820.08; cargo = 4620.08 kN; fresh-water draft = 5820.08/(9.81*240) = 2.472 m.
  refCheck(bargeBuoyancy({ L: 30, B: 8, H: 3, W: 1200, sg: 1.03, f: 0.6 }), { gamma: 10.1043, draftEmpty: 0.49484, cargo: 4620.08, draftFresh: 2.472 }, failures, 1e-5);
  rejects(bargeBuoyancy, [{ L: 0, B: 8, H: 3, W: 1200 }, { L: 30, B: 8, H: 3, W: 1200, f: 3 }, { L: 30, B: 8, H: 3, W: 9000 }, { L: 30, B: 8, H: 3, W: NaN }], failures);
  return failures;
}

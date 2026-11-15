// Stage 3 checks for js/models/compactionBorrow.js.
import { compactionBorrow } from '../../js/models/compactionBorrow.js';
const near = (x, y, tol = 1e-9) => Math.abs(x - y) <= tol * Math.max(1, Math.abs(x), Math.abs(y));
const rejects = (fn, cases, failures) => { for (const bad of cases) { let threw = false; try { fn(bad); } catch { threw = true; } if (!threw) failures.push(`accepted invalid input ${JSON.stringify(bad)}`); } };
const refCheck = (ref, want, failures, tol = 5e-4) => { for (const [k, val] of Object.entries(want)) if (Math.abs(ref[k] - val) > tol * Math.abs(val)) failures.push(`reference instance: ${k} = ${ref[k]}, hand value ${val}`); };

export function check(rng, runs) {
  const failures = [];
  const fail = (msg, v) => { if (failures.length < 10) failures.push(`${msg} for ${JSON.stringify(v)}`); };
  for (let i = 0; i < runs; i++) {
    const v = { V: 100 + rng() * 50000, gdFill: 15 + rng() * 6, gdBorrow: 12 + rng() * 6, wBorrow: rng() * 20, wFill: rng() * 25 };
    const r = compactionBorrow(v);
    // Solids are neither created nor lost between pit and fill.
    if (!near(r.Vborrow * v.gdBorrow, v.V * v.gdFill, 1e-9)) fail('dry weight in the pit != dry weight in the fill', v);
    // Total weights: moist borrow + water added = moist fill.
    if (!near(r.Vborrow * r.moistBorrowUnitWeight + r.waterAdded, v.V * r.moistFillUnitWeight, 1e-9)) fail('moist weights do not balance', v);
    if (!near(r.waterVolume * 9.81, r.waterAdded)) fail('water volume', v);
    if ((r.waterAdded > 0) !== (v.wFill > v.wBorrow)) fail('sign of water added', v);
    if ((r.Vborrow > v.V) !== (v.gdFill > v.gdBorrow)) fail('denser fill should need a larger pit volume', v);
    if (!near(v.V, r.Vborrow * (1 - r.shrinkage / 100), 1e-9)) fail('shrinkage percentage', v);
  }
  // Hand-solved: V = 5000 m^3, fill at 18.0 kN/m^3 dry, pit at 15.5 kN/m^3 dry and w = 8%, compact at 14%.
  // Ws = 18(5000) = 90000 kN; V_borrow = 90000/15.5 = 5806.45 m^3; water = 90000(0.14 - 0.08) = 5400 kN = 550.46 m^3.
  refCheck(compactionBorrow({ V: 5000, gdFill: 18, gdBorrow: 15.5, wBorrow: 8, wFill: 14 }), { Ws: 90000, Vborrow: 5806.45, waterAdded: 5400, waterVolume: 550.459 }, failures, 1e-5);
  rejects(compactionBorrow, [{ V: 0, gdFill: 18, gdBorrow: 15.5, wBorrow: 8, wFill: 14 }, { V: 5000, gdFill: 18, gdBorrow: 0, wBorrow: 8, wFill: 14 }, { V: 5000, gdFill: 18, gdBorrow: 15.5, wBorrow: -1, wFill: 14 }, { V: 5000, gdFill: NaN, gdBorrow: 15.5, wBorrow: 8, wFill: 14 }], failures);
  return failures;
}

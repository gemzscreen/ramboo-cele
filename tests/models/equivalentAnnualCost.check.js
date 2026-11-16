// Stage 3 checks for js/models/equivalentAnnualCost.js.
import { equivalentAnnualCost } from '../../js/models/equivalentAnnualCost.js';
const near = (x, y, tol = 1e-9) => Math.abs(x - y) <= tol * Math.max(1, Math.abs(x), Math.abs(y));
const rejects = (fn, cases, failures) => { for (const bad of cases) { let threw = false; try { fn(bad); } catch { threw = true; } if (!threw) failures.push(`accepted invalid input ${JSON.stringify(bad)}`); } };
const refCheck = (ref, want, failures, tol = 5e-4) => { for (const [k, val] of Object.entries(want)) if (Math.abs(ref[k] - val) > tol * Math.abs(val)) failures.push(`reference instance: ${k} = ${ref[k]}, hand value ${val}`); };

export function check(rng, runs) {
  const failures = [];
  const fail = (msg, v) => { if (failures.length < 10) failures.push(`${msg} for ${JSON.stringify(v)}`); };
  for (let i = 0; i < Math.min(runs, 400); i++) {
    const n = 1 + Math.floor(rng() * 20); const P = 100 + rng() * 2000;
    const v = { P, S: rng() * 0.4 * P, OM: rng() * 200, n, i: 1 + rng() * 20 };
    const r = equivalentAnnualCost(v);
    // Independent route: present worth of every cash flow year by year, then spread it over n years by finding the level payment that has that present worth.
    const q = 1 + v.i / 100;
    let pw = v.P - v.S / q ** n; for (let t = 1; t <= n; t++) pw += v.OM / q ** t;
    let annuityFactor = 0; for (let t = 1; t <= n; t++) annuityFactor += 1 / q ** t;
    if (!near(r.euac, pw / annuityFactor, 1e-9)) fail('EUAC differs from present worth spread over the life', v);
    // Future-worth route.
    let fw = v.P * q ** n - v.S; for (let t = 1; t <= n; t++) fw += v.OM * q ** (n - t);
    let fvFactor = 0; for (let t = 1; t <= n; t++) fvFactor += q ** (n - t);
    if (!near(r.euac, fw / fvFactor, 1e-9)) fail('EUAC differs from future worth spread over the life', v);
    if (!near(r.crf, 1 / annuityFactor, 1e-9)) fail('capital recovery factor != 1 / annuity factor', v);
    if (equivalentAnnualCost({ ...v, S: 0 }).euac < r.euac - 1e-9) fail('removing salvage should not lower EUAC', v);
  }
  // Hand-solved: P = 800, S = 100, OM = 60, n = 6, i = 10%. 1.1^6 = 1.771561; A/P = 0.1771561/0.771561 = 0.229607.
  // EUAC = 700(0.229607) + 100(0.10) + 60 = 160.725 + 10 + 60 = 230.725.
  refCheck(equivalentAnnualCost({ P: 800, S: 100, OM: 60, n: 6, i: 10 }), { crf: 0.229607, capital: 160.725, euac: 230.725 }, failures, 1e-5);
  rejects(equivalentAnnualCost, [{ P: 800, S: 900, OM: 60, n: 6, i: 10 }, { P: 800, S: 100, OM: 60, n: 6.5, i: 10 }, { P: 800, S: 100, OM: 60, n: 6, i: 0 }, { P: 0, S: 0, OM: 60, n: 6, i: 10 }], failures);
  return failures;
}

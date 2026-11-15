// Stage 3 checks for js/models/rcColumnTied.js.
import { rcColumnTied } from '../../js/models/rcColumnTied.js';
const near = (x, y, tol = 1e-9) => Math.abs(x - y) <= tol * Math.max(1, Math.abs(x), Math.abs(y));
const rejects = (fn, cases, failures) => { for (const bad of cases) { let threw = false; try { fn(bad); } catch { threw = true; } if (!threw) failures.push(`accepted invalid input ${JSON.stringify(bad)}`); } };
const refCheck = (ref, want, failures, tol = 5e-4) => { for (const [k, val] of Object.entries(want)) if (Math.abs(ref[k] - val) > tol * Math.abs(val)) failures.push(`reference instance: ${k} = ${ref[k]}, hand value ${val}`); };

export function check(rng, runs) {
  const failures = [];
  const fail = (msg, v) => { if (failures.length < 10) failures.push(`${msg} for ${JSON.stringify(v)}`); };
  for (let i = 0; i < runs; i++) {
    const b = 250 + rng() * 600; const h = 250 + rng() * 600;
    const v = { b, h, Ast: (0.005 + rng() * 0.09) * b * h, fc: 17 + rng() * 40, fy: 230 + rng() * 300 };
    const r = rcColumnTied(v);
    // Same strength written as plain concrete plus the extra the bars give over the concrete they replace.
    if (!near(r.Po * 1000, 0.85 * v.fc * b * h + v.Ast * (v.fy - 0.85 * v.fc), 1e-9)) fail('Po disagrees with the displaced-concrete form', v);
    if (!near(r.concrete + r.steel, r.Po)) fail('Po != concrete + steel', v);
    if (!near(r.phiPn, 0.52 * r.Po)) fail('phiPn != 0.65(0.80)Po', v);
    if (!(r.phiPn < r.PnMax && r.PnMax < r.Po)) fail('expected phiPn < PnMax < Po', v);
    if (!near(r.rho, (v.Ast / (b * h)) * 100)) fail('steel ratio', v);
    if (r.withinSteelLimits !== (r.rho >= 1 - 1e-12 && r.rho <= 8 + 1e-12)) fail('1% to 8% steel limit flag is wrong', v);
    // More steel always helps (fy > 0.85 f'c).
    if (!(rcColumnTied({ ...v, Ast: v.Ast * 1.05 }).Po > r.Po)) fail('adding steel should raise Po', v);
  }
  // Hand-solved: 400 x 400, 8-25 mm bars (Ast = 8*490.874 = 3926.99), f'c = 28, fy = 415.
  // Ag = 160000; rho = 2.4544%; concrete = 0.85(28)(156073.01)/1000 = 3714.54; steel = 415(3926.99)/1000 = 1629.70;
  // Po = 5344.24; 0.80Po = 4275.39; phi Pn = 0.65(4275.39) = 2779.00.
  refCheck(rcColumnTied({ b: 400, h: 400, Ast: 8 * Math.PI * 156.25, fc: 28, fy: 415 }), { rho: 2.4544, concrete: 3714.54, steel: 1629.70, Po: 5344.24, PnMax: 4275.39, phiPn: 2779.00 }, failures, 2e-5);
  rejects(rcColumnTied, [{ b: 0, h: 400, Ast: 3900, fc: 28, fy: 415 }, { b: 400, h: 400, Ast: 170000, fc: 28, fy: 415 }, { b: 400, h: 400, Ast: 3900, fc: NaN, fy: 415 }], failures);
  return failures;
}

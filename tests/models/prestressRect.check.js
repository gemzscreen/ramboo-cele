// Stage 3 checks for js/models/prestressRect.js.
import { prestressRect } from '../../js/models/prestressRect.js';
const near = (x, y, tol = 1e-9) => Math.abs(x - y) <= tol * Math.max(1, Math.abs(x), Math.abs(y));
const rejects = (fn, cases, failures) => { for (const bad of cases) { let threw = false; try { fn(bad); } catch { threw = true; } if (!threw) failures.push(`accepted invalid input ${JSON.stringify(bad)}`); } };
const refCheck = (ref, want, failures, tol = 5e-4) => { for (const [k, val] of Object.entries(want)) if (Math.abs(ref[k] - val) > tol * Math.abs(val)) failures.push(`reference instance: ${k} = ${ref[k]}, hand value ${val}`); };

export function check(rng, runs) {
  const failures = [];
  const fail = (msg, v) => { if (failures.length < 10) failures.push(`${msg} for ${JSON.stringify(v)}`); };
  for (let i = 0; i < runs; i++) {
    const b = 150 + rng() * 500; const h = 300 + rng() * 1200;
    const v = { b, h, L: 4 + rng() * 26, P: 100 + rng() * 4000, e: rng() * (h / 2) * 0.95, w: rng() * 80 };
    const r = prestressRect(v);
    // Integrate the linear stress block over the depth: it must return the
    // axial force P and the net moment M - P e about the centroid.
    const n = 2000; let force = 0; let moment = 0;
    for (let k = 0; k < n; k++) {
      const y = -h / 2 + ((k + 0.5) * h) / n;               // from the centroid, positive upward
      const sigma = (r.top + r.bottom) / 2 + ((r.top - r.bottom) * y) / h; // compression positive
      force += sigma * b * (h / n);
      moment += sigma * b * (h / n) * y;                     // compression on top = sagging
    }
    if (!near(force / 1000, v.P, 1e-6)) fail(`stress resultant ${force / 1000} kN != P`, v);
    if (!near(moment / 1e6, r.M - (v.P * v.e) / 1000, 1e-5)) fail('stress couple != M - P e', v);
    // The same stresses through I and y.
    const I = (b * h ** 3) / 12; const net = r.M * 1e6 - v.P * 1000 * v.e;
    if (!near(r.top, (v.P * 1000) / (b * h) + (net * (h / 2)) / I, 1e-9)) fail('top stress disagrees with P/A + My/I', v);
    if (!near(r.bottom, (v.P * 1000) / (b * h) - (net * (h / 2)) / I, 1e-9)) fail('bottom stress disagrees with P/A - My/I', v);
    // At w = wZeroBottom the bottom fibre is at zero.
    if (Math.abs(prestressRect({ ...v, w: r.wZeroBottom }).bottom) > 1e-9 * (1 + r.bottomPrestress)) fail('bottom stress is not zero at wZeroBottom', v);
    // At w = wBalance the section is in uniform compression P/A.
    const bal = prestressRect({ ...v, w: r.wBalance });
    if (!near(bal.top, r.axial, 1e-9) || !near(bal.bottom, r.axial, 1e-9)) fail('balanced load should leave uniform P/A', v);
    // Kern: no tension on top from prestress alone exactly when e <= h/6.
    if ((r.topPrestress >= -1e-12) !== (v.e <= h / 6 + 1e-9)) fail('kern limit h/6 violated', v);
  }
  // Hand-solved: 300 x 600, L = 10 m, P = 1200 kN, e = 150 mm, w = 30 kN/m.
  // A = 180000; S = 300(600^2)/6 = 18e6; P/A = 6.6667; Pe/S = 1200e3(150)/18e6 = 10.0;
  // bottom from prestress = 16.667 MPa; M = 30(100)/8 = 375 kN·m; M/S = 20.833;
  // top = 6.667 - 10 + 20.833 = 17.5; bottom = 16.667 - 20.833 = -4.167 (tension);
  // w for zero bottom stress: M = 16.667(18e6) = 300 kN·m, w = 8(300)/100 = 24 kN/m.
  refCheck(prestressRect({ b: 300, h: 600, L: 10, P: 1200, e: 150, w: 30 }), { axial: 6.66667, ecc: 10, bottomPrestress: 16.6667, M: 375, bend: 20.8333, top: 17.5, bottom: -4.16667, wZeroBottom: 24, wBalance: 14.4 }, failures, 1e-5);
  rejects(prestressRect, [{ b: 0, h: 600, L: 10, P: 1200, e: 150, w: 30 }, { b: 300, h: 600, L: 10, P: 1200, e: 300, w: 30 }, { b: 300, h: 600, L: 10, P: NaN, e: 150, w: 30 }, { b: 300, h: 600, L: 10, P: 1200, e: -10, w: 30 }], failures);
  return failures;
}

// Stage 3 checks for js/models/hydroGateVertical.js. The solver uses the
// centroid formulas (F = gamma*hbar*A, e = I_g/(A*hbar)); these checks use
// direct integration of the pressure and the pressure-prism split instead.
import { hydroGateVertical } from '../../js/models/hydroGateVertical.js';

const near = (x, y, tol = 1e-9) => Math.abs(x - y) <= tol * Math.max(1, Math.abs(x), Math.abs(y));

export function check(rng, runs) {
  const failures = [];
  const fail = (msg, v) => { if (failures.length < 10) failures.push(`${msg} for ${JSON.stringify(v)}`); };

  for (let i = 0; i < runs; i++) {
    const v = { b: 0.3 + rng() * 8, h: 0.3 + rng() * 8, d: rng() < 0.05 ? 0 : rng() * 20, gamma: 7 + rng() * 6 };
    const r = hydroGateVertical(v);
    const { b, h, d, gamma } = v;
    const y1 = d;
    const y2 = d + h;

    // Closed-form integrals of p = gamma*y over the gate.
    const F = (gamma * b * (y2 * y2 - y1 * y1)) / 2;
    const momentAboutSurface = (gamma * b * (y2 ** 3 - y1 ** 3)) / 3;
    if (!near(r.F, F)) fail('F != integral of pressure', v);
    if (!near(r.ycp, momentAboutSurface / F)) fail('y_cp != (first moment of pressure)/F', v);

    // Pressure prism: uniform block gamma*d plus a triangle gamma*h.
    const block = gamma * d * b * h;          // acts at h/2 below the hinge
    const wedge = (gamma * h * b * h) / 2;    // acts at 2h/3 below the hinge
    if (!near(block + wedge, r.F)) fail('prism parts do not add up to F', v);
    if (!near(r.Pstop * h, block * (h / 2) + wedge * ((2 * h) / 3))) fail('stop force fails the prism moment check', v);

    // Equilibrium of the gate and physical bounds.
    if (!near(r.Pstop + r.Rhinge, r.F)) fail('hinge + stop != F', v);
    if (!(r.ycp > r.hbar && r.ycp <= d + (2 * h) / 3 + 1e-9 && r.ycp < y2)) fail('centre of pressure is outside (centroid, d + 2h/3]', v);
    if (!(r.Pstop >= r.F / 2 && r.Pstop <= (2 * r.F) / 3 + 1e-9)) fail('stop force is outside [F/2, 2F/3]', v);
    if (!near((r.pTop + r.pBottom) / 2 * r.A, r.F)) fail('F != average pressure x area', v);

    // Numerical integration, independent of every formula above.
    let Fn = 0;
    let Mn = 0;
    const n = 2000;
    for (let k = 0; k < n; k++) {
      const y = y1 + ((k + 0.5) * h) / n;
      const dF = gamma * y * b * (h / n);
      Fn += dF;
      Mn += dF * (y - d);
    }
    if (!near(Fn, r.F, 1e-6)) fail('numerical F disagrees', v);
    if (!near(Mn / h, r.Pstop, 1e-6)) fail('numerical stop force disagrees', v);
  }

  // Water surface at the top edge: triangle only, F at 2h/3, stop takes 2F/3.
  const t = hydroGateVertical({ b: 1, h: 3, d: 0 });
  if (!near(t.ycp, 2) || !near(t.Pstop, (2 * t.F) / 3)) failures.push('d = 0 does not reduce to the triangular-prism case');

  // Reference, solved by hand with gamma = 9.81: b = 2, h = 3, d = 1.5.
  // hbar = 3.0; A = 6; F = 9.81(3)(6) = 176.58. e = 3^2/(12*3) = 0.25; y_cp = 3.25.
  // Stop: 176.58(3.25 - 1.5)/3 = 103.005. Prism check: block 88.29 at 1.5 m and
  // wedge 88.29 at 2.0 m below the hinge -> (132.435 + 176.58)/3 = 103.005.
  const ref = hydroGateVertical({ b: 2, h: 3, d: 1.5 });
  for (const [k, want] of Object.entries({ F: 176.58, ycp: 3.25, Pstop: 103.005, Rhinge: 73.575 })) {
    if (!near(ref[k], want, 1e-9)) failures.push(`reference instance: ${k} = ${ref[k]}, hand value ${want}`);
  }

  for (const bad of [{ b: 0, h: 3, d: 1 }, { b: 2, h: -1, d: 1 }, { b: 2, h: 3, d: -0.5 }, { b: 2, h: 3, d: 1, gamma: 0 }, { b: NaN, h: 3, d: 1 }]) {
    let threw = false;
    try { hydroGateVertical(bad); } catch { threw = true; }
    if (!threw) failures.push(`accepted invalid input ${JSON.stringify(bad)}`);
  }
  return failures;
}

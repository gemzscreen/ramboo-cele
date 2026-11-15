// Axially loaded steel column, flexural buckling, no slender elements.
// NSCP 2015 Section 505.3 (same provisions as AISC 360-10 Section E3).
//   A        gross area, mm^2
//   rx, ry   radii of gyration, mm
//   Lx, Ly   unbraced lengths for buckling about x and y, m
//   Kx, Ky   effective length factors
//   Fy       yield stress, MPa;  E modulus, MPa
// Pure function. Stresses in MPa, forces in kN.

export function steelColumnAxial({ A, rx, ry, Lx, Ly, Kx = 1, Ky = 1, Fy, E = 200000 }) {
  if (![A, rx, ry, Lx, Ly, Kx, Ky, Fy, E].every(Number.isFinite)) throw new RangeError('all inputs must be finite numbers');
  if (![A, rx, ry, Lx, Ly, Kx, Ky, Fy, E].every((x) => x > 0)) throw new RangeError('all inputs must be positive');

  const slx = (Kx * Lx * 1000) / rx;
  const sly = (Ky * Ly * 1000) / ry;
  const sl = Math.max(slx, sly);
  const governs = slx >= sly ? 'x' : 'y';
  const limit = 4.71 * Math.sqrt(E / Fy);
  const Fe = (Math.PI ** 2 * E) / sl ** 2;           // elastic (Euler) buckling stress
  const inelastic = sl <= limit;
  const Fcr = inelastic ? 0.658 ** (Fy / Fe) * Fy : 0.877 * Fe;
  const Pn = (Fcr * A) / 1000;
  return {
    slx, sly, sl, governs, limit, Fe, inelastic, Fcr,
    Pn,
    phiPn: 0.9 * Pn,          // LRFD design strength
    Pallow: Pn / 1.67,        // ASD allowable strength
    Py: (Fy * A) / 1000,      // squash load
  };
}

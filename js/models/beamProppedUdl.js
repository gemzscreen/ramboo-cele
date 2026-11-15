// Propped cantilever: fixed at A, roller (prop) at B, uniform load over the
// whole span. Statically indeterminate to the first degree.
//
//  A |=====================| B      fixed at A (x = 0), roller at B (x = L)
//      w per unit length, full span
//
// Pure function. Shear positive when the left part pushes up, sagging moment
// positive; MA is reported as the magnitude of the (hogging) fixed-end moment.
// Derivation: release the prop; the free-end deflection wL^4/(8EI) must be
// cancelled by R_B L^3/(3EI), so R_B = 3wL/8.

export function beamProppedUdl({ L, w }) {
  if (![L, w].every(Number.isFinite)) throw new RangeError('L and w must be finite numbers');
  if (!(L > 0)) throw new RangeError('L must be positive');
  if (!(w > 0)) throw new RangeError('w must be positive');

  const RB = (3 * w * L) / 8;
  const RA = w * L - RB;                     // 5wL/8
  const MA = (w * L * L) / 2 - RB * L;       // wL^2/8, hogging at the wall
  const V = (x) => RA - w * x;
  const M = (x) => -MA + RA * x - (w * x * x) / 2;
  const xV0 = RA / w;                        // 5L/8 from the wall
  return {
    L, w,
    W: w * L,
    RA, RB, MA,
    xV0,
    xV0fromB: L - xV0,                       // 3L/8 from the prop
    Mpos: M(xV0),                            // 9wL^2/128
    xInflection: L / 4,                      // M = 0, measured from the wall
    V, M,
  };
}

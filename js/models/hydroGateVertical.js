// Hydrostatic force on a vertical rectangular gate, water on one side.
//
//   ----------- water surface
//        | d   depth of water above the gate's top edge
//   o----      hinge along the top edge
//   |    | h   gate height (width b into the page)
//   |____      stop along the bottom edge, on the dry side
//
// Pure function. Depths are measured down from the water surface.
// gamma is the unit weight of the liquid (kN/m^3 with metres -> forces in kN).

export function hydroGateVertical({ b, h, d, gamma = 9.81 }) {
  if (![b, h, d, gamma].every(Number.isFinite)) throw new RangeError('b, h, d and gamma must be finite numbers');
  if (!(b > 0 && h > 0)) throw new RangeError('gate width and height must be positive');
  if (!(d >= 0)) throw new RangeError('the gate must not rise above the water surface (d >= 0)');
  if (!(gamma > 0)) throw new RangeError('gamma must be positive');

  const A = b * h;
  const hbar = d + h / 2;            // depth of the gate's centroid
  const F = gamma * hbar * A;        // resultant = pressure at centroid x area
  const e = (h * h) / (12 * hbar);   // I_g/(A*hbar), with I_g = b*h^3/12
  const ycp = hbar + e;              // depth of the centre of pressure
  const armFromHinge = ycp - d;      // F acts this far below the hinge
  const Pstop = (F * armFromHinge) / h; // moments about the hinge
  return {
    b, h, d, gamma,
    A, hbar, F, e, ycp, armFromHinge,
    Pstop,
    Rhinge: F - Pstop,
    pTop: gamma * d,
    pBottom: gamma * (d + h),
  };
}

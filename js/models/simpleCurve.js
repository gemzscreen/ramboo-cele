// Simple (circular) horizontal curve.
//   R  radius
//   I  intersection (deflection) angle of the tangents, in degrees
// Pure function; lengths come out in the unit of R.

export function simpleCurve({ R, I }) {
  if (![R, I].every(Number.isFinite)) throw new RangeError('R and I must be finite numbers');
  if (!(R > 0)) throw new RangeError('R must be positive');
  if (!(I > 0 && I < 180)) throw new RangeError('I must be between 0 and 180 degrees');

  const half = (I * Math.PI) / 360; // I/2 in radians
  return {
    R, I,
    T: R * Math.tan(half),              // tangent distance, PC to PI
    Lc: (R * I * Math.PI) / 180,        // length of curve (arc definition)
    C: 2 * R * Math.sin(half),          // long chord, PC to PT
    E: R * (1 / Math.cos(half) - 1),    // external distance, PI to curve midpoint
    M: R * (1 - Math.cos(half)),        // middle ordinate, chord midpoint to curve midpoint
  };
}

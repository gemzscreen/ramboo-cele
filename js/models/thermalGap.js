// Temperature at which a thermally expanding member closes a clearance.
//   L  length, m;  g  clearance, mm;  T0  starting temperature, deg C;  alpha  coefficient, 1e-6 per deg C
// Pure function. Only the member expands; the wall does not move.

export function thermalGap({ L, g, T0, alpha }) {
  if (![L, g, T0, alpha].every(Number.isFinite)) throw new RangeError('all inputs must be finite numbers');
  if (!(L > 0 && g > 0 && alpha > 0)) throw new RangeError('L, g and alpha must be positive');
  const dT = g / 1000 / ((alpha * 1e-6) * L);
  return { dT, Tfinal: T0 + dT };
}

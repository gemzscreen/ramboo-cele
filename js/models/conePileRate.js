// Related rates for a conical stockpile whose base radius is k times its height.
//   q  inflow, m3 per minute;  k  radius/height;  h  height at the instant, m
// Pure function. V = pi k^2 h^3 / 3, so dh/dt = q / (pi k^2 h^2).

export function conePileRate({ q, k, h }) {
  if (![q, k, h].every(Number.isFinite)) throw new RangeError('all inputs must be finite numbers');
  if (!(q > 0 && k > 0 && h > 0)) throw new RangeError('inputs must be positive');
  const baseArea = Math.PI * (k * h) ** 2;
  return { rate: q / baseArea, volume: (Math.PI * k * k * h ** 3) / 3, baseArea, radius: k * h };
}

// Stadia distances for an inclined sight on a vertical rod.
//   s  rod intercept, m;  theta  vertical angle, deg;  K  multiplying constant;  C  additive constant, m
// Pure function. Slope S = K s cos(theta) + C; horizontal H = K s cos^2(theta) + C cos(theta); vertical V = (K s / 2) sin(2 theta) + C sin(theta).

export function stadiaDistance({ s, theta, K, C }) {
  if (![s, theta, K, C].every(Number.isFinite)) throw new RangeError('all inputs must be finite numbers');
  if (!(s > 0 && K > 0 && C >= 0 && theta >= 0 && theta < 90)) throw new RangeError('inputs out of range');
  const th = (theta * Math.PI) / 180;
  return {
    S: K * s * Math.cos(th) + C,
    H: K * s * Math.cos(th) ** 2 + C * Math.cos(th),
    V: (K * s * Math.sin(2 * th)) / 2 + C * Math.sin(th),
  };
}

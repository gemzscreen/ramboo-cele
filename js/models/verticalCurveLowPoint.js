// Equal-tangent parabolic vertical curve: turning point.
//   g1, g2  entering and leaving grades, percent (signed; opposite signs);  L  curve length, m;  E  PVC elevation, m
// Pure function. y(x) = E + g1 x + (g2 - g1) x^2 / (2 L) with grades as decimals, x from the PVC.

export function verticalCurveLowPoint({ g1, g2, L, E }) {
  if (![g1, g2, L, E].every(Number.isFinite)) throw new RangeError('all inputs must be finite numbers');
  if (!(L > 0)) throw new RangeError('L must be positive');
  if (!(g1 * g2 < 0)) throw new RangeError('grades must have opposite signs for a turning point');
  const a = g1 / 100; const b = g2 / 100;
  const elevation = (x) => E + a * x + ((b - a) * x * x) / (2 * L);
  const x = (-a * L) / (b - a);
  return { x, y: elevation(x), elevation, pvt: elevation(L), mid: elevation(L / 2), tangentOnly: E + a * x };
}

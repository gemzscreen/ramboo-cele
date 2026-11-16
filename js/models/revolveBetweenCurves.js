// Volume of the solid formed by revolving, about the x-axis, the region between y = a x^2 and y = b x (a, b > 0).
// The curves meet at x = b/a; the line is above the parabola in between.
// Pure function. Washer method: V = pi * integral of (b^2 x^2 - a^2 x^4) dx.

export function revolveBetweenCurves({ a, b }) {
  if (![a, b].every(Number.isFinite)) throw new RangeError('a and b must be finite numbers');
  if (!(a > 0 && b > 0)) throw new RangeError('a and b must be positive');
  const X = b / a;
  return {
    X,
    volume: (2 * Math.PI * b ** 5) / (15 * a ** 3),
    outerOnly: (Math.PI * b * b * X ** 3) / 3,
    innerOnly: (Math.PI * a * a * X ** 5) / 5,
  };
}

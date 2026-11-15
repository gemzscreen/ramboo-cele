// Open-top box folded from a rectangular sheet a by b after cutting equal
// squares of side x from the four corners. Finds the x that gives the
// largest volume V(x) = x(a - 2x)(b - 2x).
// dV/dx = 12x^2 - 4(a + b)x + ab = 0; the smaller root is the maximum.
// Pure function; lengths in the unit of a and b.

export function openBoxMaxVolume({ a, b }) {
  if (![a, b].every(Number.isFinite)) throw new RangeError('a and b must be finite numbers');
  if (!(a > 0 && b > 0)) throw new RangeError('a and b must be positive');

  const root = Math.sqrt(a * a - a * b + b * b);
  const x = (a + b - root) / 6;
  const xOther = (a + b + root) / 6; // the other stationary point; not a feasible box
  const V = (s) => s * (a - 2 * s) * (b - 2 * s);
  return {
    x, xOther,
    length: a - 2 * x,
    width: b - 2 * x,
    Vmax: V(x),
    V,
  };
}

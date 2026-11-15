// Area under equally spaced ordinates by Simpson's 1/3 rule and by the
// trapezoidal rule.
//   h  spacing;  y  ordinates (an odd number of them, at least 3)
// Pure function.

export function simpsonRule({ h, y }) {
  if (!Number.isFinite(h) || !(h > 0)) throw new RangeError('h must be a positive number');
  if (!Array.isArray(y) || y.length < 3 || y.length % 2 === 0) throw new RangeError('Simpson\'s 1/3 rule needs an odd number of ordinates (an even number of strips)');
  if (!y.every(Number.isFinite)) throw new RangeError('ordinates must be finite numbers');
  const last = y.length - 1;
  let odd = 0; let even = 0; let inner = 0;
  for (let i = 1; i < last; i++) { if (i % 2) odd += y[i]; else even += y[i]; inner += y[i]; }
  const ends = y[0] + y[last];
  return {
    ends, odd, even,
    simpson: (h / 3) * (ends + 4 * odd + 2 * even),
    trapezoid: (h / 2) * (ends + 2 * inner),
    strips: last,
  };
}

// Lower-tail normal probability with z rounded to two decimals (table convention).
//   mu  mean;  sigma  standard deviation;  x  limit
// Pure function. Percent.

// Error function by its Maclaurin series (|x| <= 6 is ample here).
export function erf(x) {
  const ax = Math.abs(x);
  let term = ax; let sum = ax;
  for (let n = 1; n < 200; n++) {
    term *= (-ax * ax) / n;
    const add = term / (2 * n + 1);
    sum += add;
    if (Math.abs(add) < 1e-18 * Math.abs(sum)) break;
  }
  const v = (2 / Math.sqrt(Math.PI)) * sum;
  return x < 0 ? -v : v;
}
export const phi = (z) => 0.5 * (1 + erf(z / Math.SQRT2));

export function normalProbability({ mu, sigma, x }) {
  if (![mu, sigma, x].every(Number.isFinite)) throw new RangeError('all inputs must be finite numbers');
  if (!(sigma > 0)) throw new RangeError('sigma must be positive');
  const zExact = (x - mu) / sigma;
  if (Math.abs(zExact) > 5) throw new RangeError('|z| must be at most 5');
  const z = Math.round(zExact * 100 + 1e-9 * Math.sign(zExact)) / 100;
  const p = phi(z);
  return { zExact, z, p, pctBelow: 100 * p, pctAbove: 100 * (1 - p) };
}

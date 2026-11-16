// Break-even output between two cost options.
//   F1, v1  fixed cost per period and variable cost per unit of option 1 (higher fixed cost)
//   F2, v2  the same for option 2 (lower fixed cost, higher variable cost)
// Pure function.

export function breakEvenTwoOptions({ F1, v1, F2, v2 }) {
  if (![F1, v1, F2, v2].every(Number.isFinite)) throw new RangeError('all inputs must be finite numbers');
  if (!(F1 > F2 && F2 >= 0 && v2 > v1 && v1 >= 0)) throw new RangeError('need F1 > F2 >= 0 and v2 > v1 >= 0');
  const Q = (F1 - F2) / (v2 - v1);
  return { Q, costAtQ: F1 + v1 * Q, cost1: (q) => F1 + v1 * q, cost2: (q) => F2 + v2 * q };
}

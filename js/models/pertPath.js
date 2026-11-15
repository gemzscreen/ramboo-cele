// PERT: expected duration and spread of a chain of activities.
// Each activity is { a, m, b } = optimistic, most likely, pessimistic time.
//   te = (a + 4m + b)/6,  variance = ((b - a)/6)^2
// Pure function.

export function pertPath(activities) {
  if (!Array.isArray(activities) || activities.length === 0) throw new RangeError('give at least one activity');
  const rows = activities.map(({ a, m, b }) => {
    if (![a, m, b].every(Number.isFinite)) throw new RangeError('a, m and b must be finite numbers');
    if (!(a > 0 && a <= m && m <= b)) throw new RangeError('each activity needs 0 < a <= m <= b');
    return { a, m, b, te: (a + 4 * m + b) / 6, variance: ((b - a) / 6) ** 2 };
  });
  const variance = rows.reduce((s, r) => s + r.variance, 0);
  return {
    rows,
    T: rows.reduce((s, r) => s + r.te, 0),
    variance,
    sd: Math.sqrt(variance),
    sumMostLikely: rows.reduce((s, r) => s + r.m, 0),
  };
}

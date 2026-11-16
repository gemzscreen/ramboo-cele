// Peak-hour factor from four consecutive 15-minute counts.
//   v1..v4  vehicles counted in each interval
// Pure function. PHF = hourly volume / (4 x highest 15-minute count).

export function peakHourFactor({ v1, v2, v3, v4 }) {
  const c = [v1, v2, v3, v4];
  if (!c.every(Number.isFinite)) throw new RangeError('all inputs must be finite numbers');
  if (!c.every((x) => x > 0)) throw new RangeError('counts must be positive');
  const total = c[0] + c[1] + c[2] + c[3];
  const sorted = [...c].sort((x, y) => y - x);
  return { total, max15: sorted[0], second: sorted[1], min15: sorted[3], phf: total / (4 * sorted[0]), peakRate: 4 * sorted[0] };
}

// Primary consolidation settlement of a normally consolidated clay layer.
//   H    layer thickness, m        e0  initial void ratio
//   Cc   compression index         p0  initial effective vertical stress at mid-layer, kPa
//   dp   stress increase at mid-layer, kPa
// Pure function. Settlement in mm.

export function consolidationNC({ H, e0, Cc, p0, dp }) {
  if (![H, e0, Cc, p0, dp].every(Number.isFinite)) throw new RangeError('all inputs must be finite numbers');
  if (![H, e0, Cc, p0, dp].every((x) => x > 0)) throw new RangeError('all inputs must be positive');
  const ratio = (p0 + dp) / p0;
  const de = Cc * Math.log10(ratio);
  if (!(de < e0)) throw new RangeError('void ratio would fall to zero or below');
  return {
    ratio, de,
    e1: e0 - de,
    strain: de / (1 + e0),
    S: (H * 1000 * de) / (1 + e0),
  };
}

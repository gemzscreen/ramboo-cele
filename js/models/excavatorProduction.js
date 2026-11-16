// Hydraulic excavator production.
//   q  heaped bucket capacity, m3;  F  bucket fill factor;  t  cycle time, s
//   m  working minutes per hour;  s  swell of the dug material, percent (loose = bank x (1 + s/100))
// Pure function. Volumes in m3 per hour.

export function excavatorProduction({ q, F, t, m, s }) {
  if (![q, F, t, m, s].every(Number.isFinite)) throw new RangeError('all inputs must be finite numbers');
  if (!(q > 0 && F > 0 && F <= 1.2 && t > 0 && m > 0 && m <= 60 && s >= 0)) throw new RangeError('inputs out of range');
  const cyclesPerHour = (3600 / t) * (m / 60);
  const loosePerCycle = q * F;
  const loose = loosePerCycle * cyclesPerHour;
  return { cyclesPerHour, loosePerCycle, loose, bank: loose / (1 + s / 100) };
}

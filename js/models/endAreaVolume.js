// Earthwork volume by the average end area method for four equally spaced sections.
//   d  spacing between sections, m;  A1..A4  cross-section areas, m2
// Pure function. Volume in m3.

export function endAreaVolume({ d, A1, A2, A3, A4 }) {
  if (![d, A1, A2, A3, A4].every(Number.isFinite)) throw new RangeError('all inputs must be finite numbers');
  if (!(d > 0 && A1 >= 0 && A2 >= 0 && A3 >= 0 && A4 >= 0)) throw new RangeError('d must be positive and areas non-negative');
  const seg = [(d * (A1 + A2)) / 2, (d * (A2 + A3)) / 2, (d * (A3 + A4)) / 2];
  return { seg, volume: seg[0] + seg[1] + seg[2], meanArea: (A1 + A2 + A3 + A4) / 4 };
}

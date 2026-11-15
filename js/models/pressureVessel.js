// Thin-walled cylindrical pressure vessel with closed ends.
//   D  inside diameter, mm;  t  wall thickness, mm;  p  gauge pressure, MPa
//   allow  allowable tensile stress, MPa (optional; for the required thickness)
// Pure function. Stresses in MPa.

export function pressureVessel({ D, t, p, allow = NaN }) {
  if (![D, t, p].every(Number.isFinite)) throw new RangeError('D, t and p must be finite numbers');
  if (!(D > 0 && t > 0 && p > 0)) throw new RangeError('D, t and p must be positive');
  const hoop = (p * D) / (2 * t);
  const longitudinal = (p * D) / (4 * t);
  return {
    hoop, longitudinal,
    ratio: D / t,
    tauMaxInPlane: (hoop - longitudinal) / 2,
    tRequired: Number.isFinite(allow) && allow > 0 ? (p * D) / (2 * allow) : NaN,
    pMax: Number.isFinite(allow) && allow > 0 ? (2 * allow * t) / D : NaN,
  };
}

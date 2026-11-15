// Flat steel plate in tension with one transverse line of bolt holes.
// NSCP 2015 Section 504.2 (same as AISC 360-10 D2): the design strength is the
// smaller of yielding on the gross section and rupture on the net section.
//   w, t  plate width and thickness, mm
//   n     holes across the width;  dh  hole diameter used for net area, mm
//   Fy, Fu  yield and tensile strength, MPa;  U shear lag factor (1 for a plate
//   connected across its whole width)
// Pure function. Areas in mm^2, forces in kN.

export function tensionPlate({ w, t, n, dh, Fy, Fu, U = 1 }) {
  if (![w, t, n, dh, Fy, Fu, U].every(Number.isFinite)) throw new RangeError('all inputs must be finite numbers');
  if (!(w > 0 && t > 0 && dh > 0 && Fy > 0 && Fu >= Fy && U > 0 && U <= 1)) throw new RangeError('dimensions and strengths must be positive, Fu >= Fy, 0 < U <= 1');
  if (!(Number.isInteger(n) && n >= 1)) throw new RangeError('n must be a whole number of holes');
  if (!(n * dh < w)) throw new RangeError('holes are wider than the plate');

  const Ag = w * t;
  const An = (w - n * dh) * t;
  const Ae = U * An;
  const yieldNominal = (Fy * Ag) / 1000;
  const ruptureNominal = (Fu * Ae) / 1000;
  const phiYield = 0.9 * yieldNominal;
  const phiRupture = 0.75 * ruptureNominal;
  return {
    Ag, An, Ae, yieldNominal, ruptureNominal, phiYield, phiRupture,
    design: Math.min(phiYield, phiRupture),
    governs: phiYield <= phiRupture ? 'yielding' : 'rupture',
    allowYield: yieldNominal / 1.67,   // ASD
    allowRupture: ruptureNominal / 2,
  };
}

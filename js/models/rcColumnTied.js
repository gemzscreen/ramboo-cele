// Short tied reinforced-concrete column under concentric axial load.
// NSCP 2015: Po = 0.85 f'c (Ag - Ast) + fy Ast (Section 422.4.2.2); maximum
// nominal strength 0.80 Po for tied columns (Table 422.4.2.1); phi = 0.65
// for compression-controlled sections with ties (Table 421.2.2).
//   b, h  section, mm;  Ast  total longitudinal steel area, mm^2
//   fc, fy  MPa
// Pure function. Forces in kN.

export function rcColumnTied({ b, h, Ast, fc, fy }) {
  if (![b, h, Ast, fc, fy].every(Number.isFinite)) throw new RangeError('all inputs must be finite numbers');
  if (![b, h, Ast, fc, fy].every((x) => x > 0)) throw new RangeError('all inputs must be positive');
  const Ag = b * h;
  if (!(Ast < Ag)) throw new RangeError('steel area must be less than the gross area');
  const concrete = (0.85 * fc * (Ag - Ast)) / 1000;
  const steel = (fy * Ast) / 1000;
  const Po = concrete + steel;
  return {
    Ag, rho: (Ast / Ag) * 100,     // percent
    concrete, steel, Po,
    PnMax: 0.8 * Po,
    phiPn: 0.65 * 0.8 * Po,
    withinSteelLimits: Ast >= 0.01 * Ag && Ast <= 0.08 * Ag,
  };
}

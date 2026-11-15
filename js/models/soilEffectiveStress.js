// Vertical stresses at a point in a two-layer soil profile with the water
// table inside the upper layer.
//   H1       thickness of the upper layer, m
//   dw       depth of the water table below the ground surface, m (0 <= dw <= H1)
//   gamma1   unit weight of the upper soil above the water table, kN/m^3
//   gammaSat1, gammaSat2  saturated unit weights of the upper and lower soils
//   z2       depth of the point below the top of the lower layer, m
// Pure function. Stresses in kPa.

export function soilEffectiveStress({ H1, dw, gamma1, gammaSat1, gammaSat2, z2, gammaW = 9.81 }) {
  if (![H1, dw, gamma1, gammaSat1, gammaSat2, z2, gammaW].every(Number.isFinite)) throw new RangeError('all inputs must be finite numbers');
  if (!(H1 > 0 && gamma1 > 0 && gammaSat1 > gammaW && gammaSat2 > gammaW && gammaW > 0)) throw new RangeError('thickness and unit weights must be positive, saturated weights above that of water');
  if (!(dw >= 0 && dw <= H1)) throw new RangeError('the water table must lie within the upper layer');
  if (!(z2 >= 0)) throw new RangeError('z2 must not be negative');

  const total = gamma1 * dw + gammaSat1 * (H1 - dw) + gammaSat2 * z2;
  const u = gammaW * (H1 - dw + z2);
  return { total, u, effective: total - u, depth: H1 + z2, headOfWater: H1 - dw + z2 };
}

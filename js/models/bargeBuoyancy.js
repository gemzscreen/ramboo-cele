// Box-shaped (rectangular) barge floating upright.
//   L, B, H  length, beam and depth of the hull, m
//   W        weight of the empty barge, kN
//   sg       specific gravity of the water it floats in
//   f        least freeboard allowed when loaded, m
// Pure function. Drafts in m, forces in kN.

export function bargeBuoyancy({ L, B, H, W, sg = 1, f = 0, gammaW = 9.81 }) {
  if (![L, B, H, W, sg, f, gammaW].every(Number.isFinite)) throw new RangeError('all inputs must be finite numbers');
  if (!(L > 0 && B > 0 && H > 0 && W > 0 && sg > 0 && gammaW > 0)) throw new RangeError('dimensions, weight and specific gravity must be positive');
  if (!(f >= 0 && f < H)) throw new RangeError('freeboard must be from 0 up to the hull depth');

  const gamma = sg * gammaW;
  const plan = L * B;
  const draftEmpty = W / (gamma * plan);
  if (!(draftEmpty <= H - f)) throw new RangeError('the empty barge already sits deeper than the allowed draft');
  const draftMax = H - f;
  const cargo = gamma * plan * draftMax - W;
  return {
    gamma, plan, draftEmpty, draftMax, cargo,
    displacement: W + cargo,
    // Draft of the fully loaded barge after moving into fresh water (sg = 1).
    draftFresh: (W + cargo) / (gammaW * plan),
  };
}

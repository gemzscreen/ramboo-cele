// Soil phase relations from specific gravity of solids, void ratio and
// water content.
//   Gs  specific gravity of solids;  e  void ratio;  w  water content, percent
//   gammaW  unit weight of water, kN/m^3
// Pure function. Unit weights in kN/m^3, S and n in percent.

export function soilPhase({ Gs, e, w, gammaW = 9.81 }) {
  if (![Gs, e, w, gammaW].every(Number.isFinite)) throw new RangeError('all inputs must be finite numbers');
  if (!(Gs > 0 && e > 0 && gammaW > 0)) throw new RangeError('Gs, e and gammaW must be positive');
  if (!(w >= 0)) throw new RangeError('w must not be negative');

  const wd = w / 100;
  const S = (wd * Gs) / e;                 // as a ratio
  if (S > 1 + 1e-9) throw new RangeError('water content exceeds what the voids can hold (S > 100%)');
  return {
    S: S * 100,
    n: (e / (1 + e)) * 100,
    gammaDry: (Gs * gammaW) / (1 + e),
    gammaMoist: (Gs * (1 + wd) * gammaW) / (1 + e),
    gammaSat: ((Gs + e) * gammaW) / (1 + e),
    gammaSub: ((Gs - 1) * gammaW) / (1 + e),
    wSat: (e / Gs) * 100,                  // water content at full saturation, percent
  };
}

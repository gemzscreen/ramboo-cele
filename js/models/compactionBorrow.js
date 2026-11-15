// Earthwork for a compacted fill taken from a borrow pit.
//   V         volume of compacted fill, m^3
//   gdFill    dry unit weight required in the fill, kN/m^3
//   gdBorrow  dry unit weight of the soil in the borrow pit, kN/m^3
//   wBorrow   natural water content in the pit, percent
//   wFill     water content wanted at compaction, percent
// Pure function. Weights in kN, volumes in m^3.

export function compactionBorrow({ V, gdFill, gdBorrow, wBorrow, wFill, gammaW = 9.81 }) {
  if (![V, gdFill, gdBorrow, wBorrow, wFill, gammaW].every(Number.isFinite)) throw new RangeError('all inputs must be finite numbers');
  if (!(V > 0 && gdFill > 0 && gdBorrow > 0 && gammaW > 0)) throw new RangeError('volume and unit weights must be positive');
  if (!(wBorrow >= 0 && wFill >= 0)) throw new RangeError('water contents must not be negative');
  const Ws = gdFill * V;                       // dry soil needed
  const Vborrow = Ws / gdBorrow;               // solids are conserved
  const waterAdded = (Ws * (wFill - wBorrow)) / 100;
  return {
    Ws, Vborrow, waterAdded,
    waterVolume: waterAdded / gammaW,
    shrinkage: (1 - gdBorrow / gdFill) * 100,  // percent volume lost from pit to fill
    moistBorrowUnitWeight: gdBorrow * (1 + wBorrow / 100),
    moistFillUnitWeight: gdFill * (1 + wFill / 100),
  };
}

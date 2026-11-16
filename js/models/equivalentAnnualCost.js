// Equivalent uniform annual cost (EUAC) of owning and running an asset.
//   P first cost;  S salvage value at the end of life;  OM operating cost paid at the end of each year
//   n life, years;  i interest rate, percent per year, compounded annually
// Pure function. Money in the unit of P.

export function equivalentAnnualCost({ P, S, OM, n, i }) {
  if (![P, S, OM, n, i].every(Number.isFinite)) throw new RangeError('all inputs must be finite numbers');
  if (!(P > 0 && S >= 0 && S < P && OM >= 0 && Number.isInteger(n) && n >= 1 && i > 0)) throw new RangeError('inputs out of range');
  const r = i / 100;
  const growth = (1 + r) ** n;
  const crf = (r * growth) / (growth - 1);              // capital recovery factor (A/P, i, n)
  const capital = (P - S) * crf;                          // capital recovery of the amount not recovered by salvage
  const salvageInterest = S * r;                          // interest on the money tied up in the salvage value
  return { crf, capital, salvageInterest, euac: capital + salvageInterest + OM };
}

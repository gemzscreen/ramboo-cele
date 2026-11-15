// Sum-of-the-years'-digits depreciation.
//   C  first cost;  S  salvage value;  n  life in years;  k  age in years
// Pure function. Money in the unit of C.

export function depreciationSyd({ C, S, n, k }) {
  if (![C, S, n, k].every(Number.isFinite)) throw new RangeError('all inputs must be finite numbers');
  if (!(C > 0 && S >= 0 && S < C)) throw new RangeError('need C > S >= 0');
  if (!(Number.isInteger(n) && Number.isInteger(k) && n >= 1 && k >= 0 && k <= n)) throw new RangeError('n and k must be whole years with 0 <= k <= n');
  const sum = (n * (n + 1)) / 2;
  const base = C - S;
  const charge = (j) => ((n - j + 1) / sum) * base;      // depreciation in year j
  let total = 0;
  for (let j = 1; j <= k; j++) total += charge(j);
  return {
    sum, base, total,
    bookValue: C - total,
    chargeInYearK: k >= 1 ? charge(k) : 0,
    straightLineBookValue: C - (k * base) / n,
    charge,
  };
}

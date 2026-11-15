// Binomial distribution: n independent trials, probability p of "success" each.
// Pure function.

export function choose(n, k) {
  if (k < 0 || k > n) return 0;
  let c = 1;
  for (let i = 1; i <= Math.min(k, n - k); i++) c = (c * (n - i + 1)) / i;
  return Math.round(c);
}

export function binomialProb({ n, k, p }) {
  if (![n, k, p].every(Number.isFinite)) throw new RangeError('n, k and p must be finite numbers');
  if (!(Number.isInteger(n) && Number.isInteger(k) && n > 0 && k >= 0 && k <= n)) throw new RangeError('n and k must be whole numbers with 0 <= k <= n');
  if (!(p > 0 && p < 1)) throw new RangeError('p must be strictly between 0 and 1');
  const pmf = (j) => choose(n, j) * p ** j * (1 - p) ** (n - j);
  let atMost = 0;
  for (let j = 0; j <= k; j++) atMost += pmf(j);
  return {
    C: choose(n, k),
    exactly: pmf(k),
    atMost,
    atLeast: 1 - atMost + pmf(k),
    none: pmf(0),
    mean: n * p,
    pmf,
  };
}

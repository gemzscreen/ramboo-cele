// Loan repaid by equal end-of-period payments (ordinary annuity).
//   P   amount borrowed
//   r   nominal annual interest rate, percent, compounded m times a year
//   n   term in years;  m  payments (and compounding periods) per year
// Pure function.

export function loanAmortization({ P, r, n, m = 12 }) {
  if (![P, r, n, m].every(Number.isFinite)) throw new RangeError('all inputs must be finite numbers');
  if (!(P > 0 && r > 0 && n > 0 && m > 0)) throw new RangeError('all inputs must be positive');

  const i = r / 100 / m;       // rate per period
  const N = n * m;             // number of payments
  const A = (P * i) / (1 - (1 + i) ** -N);
  return {
    i, N, A,
    totalPaid: A * N,
    totalInterest: A * N - P,
  };
}

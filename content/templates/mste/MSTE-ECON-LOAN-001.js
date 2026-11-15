// MSTE-ECON-LOAN-001 — equal monthly payments on a loan (ordinary annuity).
// Standalone item, no figure. Original scenario and wording (ROADMAP §3).
import { loanAmortization } from '../../../js/models/loanAmortization.js';
import { formatSig } from '../../../js/engine/format.js';

const f = (x, sig = 4) => formatSig(x, sig);
const peso = (x) => Math.round(x).toLocaleString('en-US');
const loan = (v) => loanAmortization({ P: v.P * 1e6, r: v.r, n: v.n, m: 12 });

export default {
  id: 'MSTE-ECON-LOAN-001',
  subject: 'MSTE',
  topic: 'Economics',
  topic_id: 'mste.economics',
  subtopic_id: 'mste.economics.annuities-gradients',
  archetype: 'Loan amortization: equal end-of-month payment from principal, nominal rate and term',
  format: 'single',
  board_frequency: '7/7 sittings', // the topic's count in content/frequency.json
  difficulty: 1,

  vars: {
    P: { min: 0.5, max: 3, step: 0.1, unit: 'million pesos' },
    r: { min: 6, max: 12, step: 0.5, unit: '%/yr' },
    n: { min: 3, max: 10, step: 1, unit: 'yr' },
  },
  constraints: [],

  stem: 'A small contractor borrows ₱{P} million from a bank to buy a second-hand backhoe loader. The loan carries '
    + 'interest at {r}% per year compounded monthly and is to be repaid in equal payments at the end of every month '
    + 'for {n} years.',

  figure: null,
  model: loan,
  live: null,

  items: [
    {
      ask: 'Determine the monthly payment.',
      pick: 'A', unit: '₱', sig: 4,
      distractors: [
        { name: 'usedSimpleInterest', value: (v, r) => (v.P * 1e6 * (1 + (v.r / 100) * v.n)) / r.N },
        { name: 'usedSinkingFundFactor', value: (v, r) => (v.P * 1e6 * r.i) / ((1 + r.i) ** r.N - 1) },
        { name: 'dividedAnnualPaymentByTwelve', value: (v) => { const R = v.r / 100; return (v.P * 1e6 * R) / (1 - (1 + R) ** -v.n) / 12; } },
        { name: 'dividedPrincipalOnly', value: (v, r) => (v.P * 1e6) / r.N },
        { name: 'addedFirstMonthInterestToEqualPrincipal', value: (v, r) => (v.P * 1e6) / r.N + v.P * 1e6 * r.i },
        { name: 'usedYearsAsNumberOfPayments', value: (v, r) => (v.P * 1e6 * r.i) / (1 - (1 + r.i) ** -v.n) },
      ],
    },
  ],

  solution: (v, r) => [
    `The payments are equal and fall at the end of each period, so the loan is the present worth of an ordinary annuity: P = A[1 − (1 + i)<sup>−N</sup>]/i.`,
    `Rate per month: i = ${v.r}%/12 = ${formatSig(r.i, 5)}. Number of payments: N = 12(${v.n}) = ${r.N}.`,
    `(1 + i)<sup>−N</sup> = (${formatSig(1 + r.i, 7)})<sup>−${r.N}</sup> = ${formatSig((1 + r.i) ** -r.N, 6)}.`,
    `A = P·i/[1 − (1 + i)<sup>−N</sup>] = (${peso(v.P * 1e6)})(${formatSig(r.i, 5)})/(1 − ${formatSig((1 + r.i) ** -r.N, 6)}) = ₱${f(r.A)} per month.`,
    `Over the term the borrower pays ${r.N} × A = ₱${peso(r.totalPaid)} (using the unrounded payment), of which ₱${peso(r.totalPaid)} − ₱${peso(v.P * 1e6)} = ₱${peso(r.totalInterest)} is interest.`,
  ],

  refs: ['Engineering economy: ordinary annuity, capital recovery factor (A/P, i, N)'],

  // Hand-solved: i = 0.0075, N = 60, (1.0075)^-60 = 0.638700;
  // A = 1,200,000(0.0075)/(1 - 0.638700) = 9000/0.361300 = 24,910.
  reference_instance: {
    vars: { P: 1.2, r: 9, n: 5 },
    answers: ['24910'],
  },

  status: 'draft',
  bank_version: null,
};

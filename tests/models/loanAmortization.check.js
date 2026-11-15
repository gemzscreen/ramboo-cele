// Stage 3 checks for js/models/loanAmortization.js.
import { loanAmortization } from '../../js/models/loanAmortization.js';
const near = (x, y, tol = 1e-9) => Math.abs(x - y) <= tol * Math.max(1, Math.abs(x), Math.abs(y));
const rejects = (fn, cases, failures) => { for (const bad of cases) { let threw = false; try { fn(bad); } catch { threw = true; } if (!threw) failures.push(`accepted invalid input ${JSON.stringify(bad)}`); } };
const refCheck = (ref, want, failures, tol = 5e-4) => { for (const [k, val] of Object.entries(want)) if (Math.abs(ref[k] - val) > tol * Math.abs(val)) failures.push(`reference instance: ${k} = ${ref[k]}, hand value ${val}`); };

export function check(rng, runs) {
  const failures = [];
  const fail = (msg, v) => { if (failures.length < 10) failures.push(`${msg} for ${JSON.stringify(v)}`); };
  for (let i = 0; i < Math.min(runs, 300); i++) {
    const v = { P: 1e4 + rng() * 5e6, r: 1 + rng() * 23, n: 1 + Math.floor(rng() * 25), m: [1, 2, 4, 12][Math.floor(rng() * 4)] };
    const r = loanAmortization(v);
    // Run the loan period by period: add interest, take off the payment. It must end at zero.
    let balance = v.P;
    for (let k = 0; k < r.N; k++) balance = balance * (1 + r.i) - r.A;
    if (Math.abs(balance) > 1e-6 * v.P) fail(`balance after the last payment is ${balance}, not 0`, v);
    // Present worth of the payments equals the loan.
    let pw = 0; for (let k = 1; k <= r.N; k++) pw += r.A / (1 + r.i) ** k;
    if (!near(pw, v.P, 1e-9)) fail('present worth of payments != loan', v);
    if (!(r.A > v.P * r.i)) fail('payment does not even cover the first interest', v);
    if (!(r.A * r.N > v.P)) fail('total paid must exceed the loan', v);
    if (!near(r.totalInterest, r.A * r.N - v.P)) fail('total interest', v);
  }
  // Hand-solved: P = 1,200,000, 9% compounded monthly, 5 years. i = 0.0075, N = 60;
  // (1.0075)^60 = 1.565681; A = 1,200,000(0.0075)/(1 - 1/1.565681) = 9000/0.361300 = 24,910.0.
  refCheck(loanAmortization({ P: 1200000, r: 9, n: 5 }), { i: 0.0075, N: 60, A: 24910.0 }, failures, 5e-5);
  rejects(loanAmortization, [{ P: 0, r: 9, n: 5 }, { P: 1e6, r: 0, n: 5 }, { P: 1e6, r: 9, n: NaN }], failures);
  return failures;
}

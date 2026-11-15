// Beam fixed at both ends: uniform load over the whole span plus a
// concentrated load at midspan. Symmetric, so each end carries half the load.
//   L span, w uniform load per unit length, P midspan point load
// Pure function. Sagging moment positive; Mend is the magnitude of the
// (hogging) fixed-end moment.

export function beamFixedUdlPoint({ L, w, P }) {
  if (![L, w, P].every(Number.isFinite)) throw new RangeError('L, w and P must be finite numbers');
  if (!(L > 0)) throw new RangeError('L must be positive');
  if (!(w >= 0 && P >= 0 && w + P > 0)) throw new RangeError('w and P must not be negative, and not both zero');

  const R = (w * L) / 2 + P / 2;
  const Mend = (w * L * L) / 12 + (P * L) / 8;
  const M = (x) => -Mend + R * x - (w * x * x) / 2 - (x > L / 2 ? P * (x - L / 2) : 0);
  return {
    R, Mend,
    Mmid: M(L / 2),                                     // wL^2/24 + PL/8
    MsimpleMid: (w * L * L) / 8 + (P * L) / 4,          // same loads on a simply supported span
    W: w * L,
    M,
  };
}

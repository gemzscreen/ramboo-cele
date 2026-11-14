// Simply supported beam, single concentrated load.
//
//        P
//        |
//  A ----v-------------- B      pin at A, roller at B
//  |<-a->|<------b----->|
//  |<--------L--------->|
//
// Pure function of its inputs. Returns intermediate values and V(x), M(x) so
// the same solver drives exam items, Live Figures and calculators.
//
// Sign convention: upward reactions positive; shear positive when the left
// part pushes up; sagging moment positive.
// Units are whatever the caller uses consistently (kN and m -> kN·m).

export function beamSimplePoint({ L, P, a }) {
  if (![L, P, a].every(Number.isFinite)) throw new RangeError('L, P and a must be finite numbers');
  if (!(L > 0)) throw new RangeError('L must be positive');
  if (!(P >= 0)) throw new RangeError('P must not be negative');
  if (!(a > 0 && a < L)) throw new RangeError('the load must sit strictly between the supports (0 < a < L)');

  const b = L - a;
  const RA = (P * b) / L; // moments about B
  const RB = (P * a) / L; // moments about A
  const Mmax = RA * a;    // under the load, where shear changes sign

  // Shear just to the left of the load is +RA, just to the right is -RB.
  // At x = a exactly, V reports the left-hand value.
  const V = (x) => (x <= a ? RA : -RB);
  const M = (x) => (x <= a ? RA * x : RB * (L - x));

  return {
    L, P, a, b,
    RA, RB,
    Vleft: RA,
    Vright: -RB,
    Vmax: Math.max(RA, RB),
    Mmax,
    xMmax: a,
    Mmid: M(L / 2),
    V, M,
    shearPoints: [[0, RA], [a, RA], [a, -RB], [L, -RB]],
    momentPoints: [[0, 0], [a, Mmax], [L, 0]],
  };
}

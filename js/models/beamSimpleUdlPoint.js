// Simply supported beam: uniform load over the whole span plus one
// concentrated load.
//
//    w (per unit length, full span)      P at distance a from A
//  A ===================v============== B     pin at A, roller at B
//
// Pure function. Sign convention as in beamSimplePoint.js: shear positive when
// the left part pushes up, sagging moment positive.

export function beamSimpleUdlPoint({ L, w, P, a }) {
  if (![L, w, P, a].every(Number.isFinite)) throw new RangeError('L, w, P and a must be finite numbers');
  if (!(L > 0)) throw new RangeError('L must be positive');
  if (!(w > 0)) throw new RangeError('w must be positive');
  if (!(P >= 0)) throw new RangeError('P must not be negative');
  if (!(a > 0 && a < L)) throw new RangeError('the load must sit strictly between the supports (0 < a < L)');

  const b = L - a;
  const RA = (w * L) / 2 + (P * b) / L; // moments about B
  const RB = (w * L) / 2 + (P * a) / L; // moments about A

  // At x = a exactly, V reports the value just left of the point load.
  const V = (x) => RA - w * x - (x > a ? P : 0);
  const M = (x) => RA * x - (w * x * x) / 2 - (x > a ? P * (x - a) : 0);

  // Maximum moment is where shear passes through zero. Shear falls steadily at
  // rate w and drops by P at the load, so there are three cases.
  const VleftOfLoad = RA - w * a;
  const VrightOfLoad = VleftOfLoad - P;
  let xV0;
  let zeroShearCase;
  if (VleftOfLoad <= 0) {
    xV0 = RA / w;                 // crosses zero before reaching the load
    zeroShearCase = 'beforeLoad';
  } else if (VrightOfLoad <= 0) {
    xV0 = a;                      // jumps through zero at the load
    zeroShearCase = 'atLoad';
  } else {
    xV0 = (RA - P) / w;           // crosses zero beyond the load
    zeroShearCase = 'afterLoad';
  }

  return {
    L, w, P, a, b,
    RA, RB,
    W: w * L,
    VleftOfLoad, VrightOfLoad,
    Vmax: Math.max(RA, RB),
    xV0, zeroShearCase,
    Mmax: M(xV0),
    Mload: M(a),
    Mmid: M(L / 2),
    V, M,
  };
}

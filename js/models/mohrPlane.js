// Plane stress: principal stresses, maximum in-plane shear stress and the
// principal direction.
//   sx, sy  normal stresses (tension positive);  txy  shear stress
// Pure function. thetaP is the angle, in degrees, from the x-axis to the
// direction of the larger principal stress, counter-clockwise positive
// (for txy positive in the usual convention).

export function mohrPlane({ sx, sy, txy }) {
  if (![sx, sy, txy].every(Number.isFinite)) throw new RangeError('sx, sy and txy must be finite numbers');
  const avg = (sx + sy) / 2;
  const half = (sx - sy) / 2;
  const R = Math.hypot(half, txy);
  return {
    avg, R,
    s1: avg + R,
    s2: avg - R,
    tauMax: R,
    thetaP: (Math.atan2(2 * txy, sx - sy) * 180) / Math.PI / 2,
  };
}

// Stresses on a plane whose normal is at `deg` from the x-axis.
export function rotateStress({ sx, sy, txy }, deg) {
  const a = (deg * Math.PI) / 180;
  const c = Math.cos(a); const s = Math.sin(a);
  return {
    sigma: sx * c * c + sy * s * s + 2 * txy * s * c,
    tau: -(sx - sy) * s * c + txy * (c * c - s * s),
  };
}

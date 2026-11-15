// Solid circular shaft in pure torsion, linear elastic.
//   d  diameter, mm        L  length, m
//   T  torque, kN·m        G  shear modulus, GPa
//   N  rotational speed, rev/min (optional; needed only for power)
// Pure function.

export function shaftTorsion({ d, L, T, G, N = 0 }) {
  if (![d, L, T, G, N].every(Number.isFinite)) throw new RangeError('all inputs must be finite numbers');
  if (!(d > 0 && L > 0 && T > 0 && G > 0)) throw new RangeError('d, L, T and G must be positive');
  if (!(N >= 0)) throw new RangeError('N must not be negative');

  const Tnmm = T * 1e6;                         // N·mm
  const J = (Math.PI * d ** 4) / 32;            // mm^4
  const tau = (16 * Tnmm) / (Math.PI * d ** 3); // MPa, at the surface
  const thetaRad = (Tnmm * L * 1000) / (J * G * 1000);
  return {
    J, tau,
    thetaRad,
    thetaDeg: (thetaRad * 180) / Math.PI,
    omega: (2 * Math.PI * N) / 60,              // rad/s
    power: (2 * Math.PI * N * T) / 60,          // kW (kN·m x rad/s)
  };
}

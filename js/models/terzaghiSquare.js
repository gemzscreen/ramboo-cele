// Terzaghi ultimate bearing capacity of a square footing, general shear:
//   qu = 1.3 c Nc + q Nq + 0.4 gamma B Ngamma,   q = gamma Df
// The bearing capacity factors are inputs (they depend on the friction angle
// and are read from a table).
//   c  cohesion, kPa;  gamma  unit weight, kN/m^3;  Df  depth of footing base, m
//   B  footing side, m;  FS  factor of safety
// Pure function. Pressures in kPa, load in kN.

export function terzaghiSquare({ c, gamma, Df, B, FS, Nc, Nq, Ng }) {
  if (![c, gamma, Df, B, FS, Nc, Nq, Ng].every(Number.isFinite)) throw new RangeError('all inputs must be finite numbers');
  if (!(c >= 0 && Df >= 0)) throw new RangeError('c and Df must not be negative');
  if (!(gamma > 0 && B > 0 && FS >= 1 && Nc > 0 && Nq > 0 && Ng >= 0)) throw new RangeError('gamma, B and the factors must be positive; FS at least 1');
  const q = gamma * Df;
  const cohesionTerm = 1.3 * c * Nc;
  const surchargeTerm = q * Nq;
  const weightTerm = 0.4 * gamma * B * Ng;
  const qu = cohesionTerm + surchargeTerm + weightTerm;
  return {
    q, cohesionTerm, surchargeTerm, weightTerm, qu,
    quStrip: c * Nc + q * Nq + 0.5 * gamma * B * Ng,
    qAllow: qu / FS,
    qNetAllow: (qu - q) / FS,
    Pallow: (qu / FS) * B * B,
  };
}

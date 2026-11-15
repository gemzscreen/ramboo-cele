// Rectangular prestressed concrete beam, simply supported, straight tendon at
// eccentricity e below the centroid, uniform load over the span. Elastic
// (uncracked) fibre stresses at midspan.
//   b, h  section, mm      L  span, m
//   P     effective prestress force, kN     e  eccentricity, mm (below centroid)
//   w     uniform load including self-weight, kN/m
// Pure function. Stresses in MPa, COMPRESSION POSITIVE.

export function prestressRect({ b, h, L, P, e, w }) {
  if (![b, h, L, P, e, w].every(Number.isFinite)) throw new RangeError('all inputs must be finite numbers');
  if (!(b > 0 && h > 0 && L > 0 && P > 0 && w >= 0)) throw new RangeError('b, h, L and P must be positive; w must not be negative');
  if (!(e >= 0 && e < h / 2)) throw new RangeError('tendon must lie inside the section, at or below the centroid');

  const A = b * h;
  const S = (b * h * h) / 6;
  const axial = (P * 1000) / A;            // P/A
  const ecc = (P * 1000 * e) / S;          // Pe/S
  const M = (w * L * L) / 8;               // kN·m
  const bend = (M * 1e6) / S;              // M/S
  return {
    A, S, axial, ecc, M, bend,
    topPrestress: axial - ecc,             // negative means tension
    bottomPrestress: axial + ecc,
    top: axial - ecc + bend,
    bottom: axial + ecc - bend,
    // Load that brings the bottom fibre at midspan to zero stress.
    wZeroBottom: (8 * (axial + ecc) * S) / 1e6 / (L * L),
    // Load whose moment equals P*e (the "balanced" load for this tendon at midspan).
    wBalance: (8 * P * e) / 1000 / (L * L),
  };
}

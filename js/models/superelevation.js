// Minimum radius of a horizontal curve from e + f = V^2 / (127 R).
//   V  design speed, km/h;  e  superelevation, m/m;  f  side-friction factor
// Pure function. Radius in m.

export function superelevation({ V, e, f }) {
  if (![V, e, f].every(Number.isFinite)) throw new RangeError('all inputs must be finite numbers');
  if (!(V > 0 && e >= 0 && f > 0)) throw new RangeError('V and f must be positive, e not negative');
  return { eAndF: e + f, R: (V * V) / (127 * (e + f)) };
}

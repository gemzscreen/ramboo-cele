// Greenshields traffic stream model: speed falls linearly with density.
//   u = uf (1 - k/kj),   q = u k
//   uf  free-flow speed, km/h;  kj  jam density, veh/km
// Pure function. Flow in veh/h.

export function greenshields({ uf, kj }) {
  if (![uf, kj].every(Number.isFinite)) throw new RangeError('uf and kj must be finite numbers');
  if (!(uf > 0 && kj > 0)) throw new RangeError('uf and kj must be positive');
  const speed = (k) => uf * (1 - k / kj);
  const flow = (k) => speed(k) * k;
  return {
    kCap: kj / 2,           // density at capacity
    uCap: uf / 2,           // speed at capacity
    qMax: (uf * kj) / 4,    // capacity
    speed, flow,
  };
}

// Equivalent coefficient of permeability of horizontally layered soil.
//   layers: [{ H, k }]  thickness and permeability of each layer
// Flow parallel to the layers: kH = sum(k H)/sum(H).
// Flow across the layers:      kV = sum(H)/sum(H/k).
// Pure function; k comes out in the unit given.

export function layeredPermeability(layers) {
  if (!Array.isArray(layers) || layers.length === 0) throw new RangeError('give at least one layer');
  for (const { H, k } of layers) {
    if (![H, k].every(Number.isFinite) || !(H > 0 && k > 0)) throw new RangeError('each layer needs positive H and k');
  }
  const total = layers.reduce((s, l) => s + l.H, 0);
  const kH = layers.reduce((s, l) => s + l.k * l.H, 0) / total;
  const kV = total / layers.reduce((s, l) => s + l.H / l.k, 0);
  return { total, kH, kV, ratio: kH / kV };
}

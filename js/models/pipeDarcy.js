// Friction loss in a circular pipe flowing full, Darcy-Weisbach.
//   D  inside diameter, mm     L  length, m
//   Q  discharge, L/s          f  Darcy friction factor
//   gamma  unit weight of the liquid, kN/m^3;  g  m/s^2
// Pure function. Velocity in m/s, head in m, power in kW.

export function pipeDarcy({ D, L, Q, f, gamma = 9.81, g = 9.81 }) {
  if (![D, L, Q, f, gamma, g].every(Number.isFinite)) throw new RangeError('all inputs must be finite numbers');
  if (![D, L, Q, f, gamma, g].every((x) => x > 0)) throw new RangeError('all inputs must be positive');

  const Dm = D / 1000;
  const Qm3 = Q / 1000;
  const area = (Math.PI * Dm * Dm) / 4;
  const V = Qm3 / area;
  const velocityHead = (V * V) / (2 * g);
  const hf = f * (L / Dm) * velocityHead;
  return {
    area, V, velocityHead, hf,
    slope: hf / L,                 // hydraulic gradient
    power: gamma * Qm3 * hf,       // rate of energy loss, kW
  };
}

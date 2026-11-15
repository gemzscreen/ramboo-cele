// Stopping sight distance on a grade: distance covered during the
// perception-reaction time plus the braking distance.
//   V  speed, km/h      t  perception-reaction time, s
//   f  coefficient of friction between tyres and pavement
//   G  grade, percent: positive uphill, negative downhill
// Pure function. Distances in m.

export function stoppingSight({ V, t, f, G = 0, g = 9.81 }) {
  if (![V, t, f, G, g].every(Number.isFinite)) throw new RangeError('all inputs must be finite numbers');
  if (!(V > 0 && t >= 0 && f > 0 && g > 0)) throw new RangeError('V, f and g must be positive; t must not be negative');
  const net = f + G / 100;
  if (!(net > 0)) throw new RangeError('the vehicle cannot stop on this grade (f + G <= 0)');
  const v = V / 3.6;                         // m/s
  const reaction = v * t;
  const braking = (v * v) / (2 * g * net);
  return { v, net, reaction, braking, ssd: reaction + braking, decel: g * net };
}

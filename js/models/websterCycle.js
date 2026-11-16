// Webster's optimum cycle length for a three-phase signal.
//   l  lost time per phase, s;  q1, q2, q3  critical lane volumes, veh/h;  s  saturation flow per lane, veh/h
// Pure function. C0 = (1.5 L + 5) / (1 - Y), L = total lost time, Y = sum of critical flow ratios.

export function websterCycle({ l, q1, q2, q3, s }) {
  if (![l, q1, q2, q3, s].every(Number.isFinite)) throw new RangeError('all inputs must be finite numbers');
  if (!(l > 0 && q1 > 0 && q2 > 0 && q3 > 0 && s > 0)) throw new RangeError('inputs must be positive');
  const ratios = [q1 / s, q2 / s, q3 / s];
  const Y = ratios[0] + ratios[1] + ratios[2];
  if (!(Y < 1)) throw new RangeError('the junction is over capacity (Y >= 1)');
  const L = 3 * l;
  return { ratios, Y, L, C0: (1.5 * L + 5) / (1 - Y) };
}

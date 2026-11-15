// Newton's law of cooling: dT/dt = -k (T - Ts).
//   T0  initial temperature;  Ts  surrounding temperature
//   T1  temperature observed at time t1;  Tt  target temperature
// Returns the rate constant and the time (from the start) to reach Tt.
// Pure function; time comes out in the unit of t1.

export function newtonCooling({ T0, Ts, T1, t1, Tt }) {
  if (![T0, Ts, T1, t1, Tt].every(Number.isFinite)) throw new RangeError('all inputs must be finite numbers');
  if (!(t1 > 0)) throw new RangeError('t1 must be positive');
  if (!(T0 > T1 && T1 > Ts)) throw new RangeError('need T0 > T1 > Ts (a cooling body)');
  if (!(Tt > Ts && Tt < T0)) throw new RangeError('target must lie between Ts and T0');
  const k = Math.log((T0 - Ts) / (T1 - Ts)) / t1;
  const T = (t) => Ts + (T0 - Ts) * Math.exp(-k * t);
  const tTarget = Math.log((T0 - Ts) / (Tt - Ts)) / k;
  return { k, tTarget, afterT1: tTarget - t1, halfLife: Math.LN2 / k, T };
}

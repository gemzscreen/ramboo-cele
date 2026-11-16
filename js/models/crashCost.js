// Cheapest way to shorten a chain of critical activities in series.
//   mA, mB, mC  most days each activity can be shortened;  cA, cB, cC  extra direct cost per day saved
//   d  days to be saved
// Pure function. Cost is linear per day up to the limit, so the cheapest activity is used first.

export function crashCost({ mA, mB, mC, cA, cB, cC, d }) {
  const all = [mA, mB, mC, cA, cB, cC, d];
  if (!all.every(Number.isFinite)) throw new RangeError('all inputs must be finite numbers');
  if (!(mA > 0 && mB > 0 && mC > 0 && cA > 0 && cB > 0 && cC > 0 && d > 0)) throw new RangeError('inputs must be positive');
  if (d > mA + mB + mC) throw new RangeError('cannot save more days than the activities allow');
  const acts = [{ name: 'A', m: mA, c: cA }, { name: 'B', m: mB, c: cB }, { name: 'C', m: mC, c: cC }];
  const plan = (order) => {
    let left = d; let cost = 0; const taken = [];
    for (const a of order) { const days = Math.min(left, a.m); if (days > 0) { taken.push({ name: a.name, days, cost: days * a.c }); cost += days * a.c; left -= days; } }
    return { cost, taken };
  };
  const cheapest = plan([...acts].sort((x, y) => x.c - y.c));
  const dearest = plan([...acts].sort((x, y) => y.c - x.c));
  return {
    cost: cheapest.cost, taken: cheapest.taken, dearestFirstCost: dearest.cost,
    fullCrashCost: mA * cA + mB * cB + mC * cC,
    sortedSlopes: acts.map((a) => a.c).sort((x, y) => x - y),
  };
}

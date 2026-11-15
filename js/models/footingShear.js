// Square isolated footing under a concentric square column: factored soil
// pressure and the factored shears at the two critical sections.
// NSCP 2015: load combination 1.2D + 1.6L (Section 203.3.1); one-way shear at
// d from the column face (422.5), two-way shear at d/2 (422.6.4).
//   B   footing side, m          c  column side, mm
//   d   effective depth, mm      PD, PL  service dead and live column loads, kN
// Pure function. Pressures in kPa, forces in kN, moment in kN·m.

export function footingShear({ B, c, d, PD, PL }) {
  if (![B, c, d, PD, PL].every(Number.isFinite)) throw new RangeError('all inputs must be finite numbers');
  if (!(B > 0 && c > 0 && d > 0 && PD > 0 && PL >= 0)) throw new RangeError('B, c, d and PD must be positive; PL must not be negative');
  const cm = c / 1000;
  const dm = d / 1000;
  if (!(cm < B)) throw new RangeError('column must be smaller than the footing');
  const arm = (B - cm) / 2;                  // projection beyond the column face
  if (!(arm - dm > 0)) throw new RangeError('one-way critical section falls outside the footing');

  const Pu = Math.max(1.2 * PD + 1.6 * PL, 1.4 * PD);
  const qu = Pu / (B * B);
  const b0 = 4 * (cm + dm);                  // punching perimeter, m
  return {
    Pu, qu, arm, b0,
    qService: (PD + PL) / (B * B),
    Vu1: qu * B * (arm - dm),                // one-way (wide-beam) shear
    Vu2: qu * (B * B - (cm + dm) ** 2),      // two-way (punching) shear
    Mu: (qu * B * arm * arm) / 2,            // moment at the column face
  };
}

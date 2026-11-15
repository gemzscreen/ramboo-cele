// Block on a rough incline, held or moved by a force P parallel to the slope.
//   W      weight of the block
//   theta  slope angle, degrees
//   mu     coefficient of static friction
// Pure function. Forces in the unit of W.
// Along the slope (up positive): P - W sin(theta) -/+ F = 0, with F <= mu N
// and N = W cos(theta).

export function frictionIncline({ W, theta, mu }) {
  if (![W, theta, mu].every(Number.isFinite)) throw new RangeError('W, theta and mu must be finite numbers');
  if (!(W > 0)) throw new RangeError('W must be positive');
  if (!(theta > 0 && theta < 90)) throw new RangeError('theta must be between 0 and 90 degrees');
  if (!(mu > 0)) throw new RangeError('mu must be positive');

  const t = (theta * Math.PI) / 180;
  const N = W * Math.cos(t);
  const pull = W * Math.sin(t);        // weight component down the slope
  const Fmax = mu * N;                 // limiting friction
  return {
    N, pull, Fmax,
    Pup: pull + Fmax,                  // motion impends up the slope
    Phold: pull - Fmax,                // least force that stops it sliding down (<= 0 means it stays by itself)
    selfLocking: pull <= Fmax,
    repose: (Math.atan(mu) * 180) / Math.PI, // steepest slope on which it stays unaided, degrees
  };
}

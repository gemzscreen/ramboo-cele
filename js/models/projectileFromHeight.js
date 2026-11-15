// Projectile launched from a point h above level ground, at speed v0 and
// angle theta above the horizontal. No air resistance.
//   v0 in m/s, theta in degrees, h in m, g in m/s^2
// Pure function.

export function projectileFromHeight({ v0, theta, h, g = 9.81 }) {
  if (![v0, theta, h, g].every(Number.isFinite)) throw new RangeError('all inputs must be finite numbers');
  if (!(v0 > 0 && g > 0)) throw new RangeError('v0 and g must be positive');
  if (!(theta >= 0 && theta < 90)) throw new RangeError('theta must be from 0 up to (not including) 90 degrees');
  if (!(h >= 0)) throw new RangeError('h must not be negative');

  const rad = (theta * Math.PI) / 180;
  const vx = v0 * Math.cos(rad);
  const vy = v0 * Math.sin(rad);
  const tFlight = (vy + Math.sqrt(vy * vy + 2 * g * h)) / g; // positive root of h + vy t - g t^2/2 = 0
  return {
    vx, vy,
    tFlight,
    range: vx * tFlight,                       // horizontal distance to landing
    riseAboveLaunch: (vy * vy) / (2 * g),
    maxHeight: h + (vy * vy) / (2 * g),        // above the ground
    impactSpeed: Math.sqrt(v0 * v0 + 2 * g * h),
    x: (t) => vx * t,
    y: (t) => h + vy * t - (g * t * t) / 2,    // height above the ground
  };
}

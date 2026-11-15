// Open vertical cylinder partly filled with liquid, rotating about its axis
// at constant speed (forced vortex). The free surface is a paraboloid whose
// height between the axis and the wall is h = w^2 r^2 / (2g); with no spill
// it rises h/2 at the wall and drops h/2 at the axis.
//   D  inside diameter, m;  H  height of the cylinder, m
//   d  depth of liquid at rest, m;  N  speed, rev/min
// Pure function.

export function rotatingCylinder({ D, H, d, N, g = 9.81 }) {
  if (![D, H, d, N, g].every(Number.isFinite)) throw new RangeError('all inputs must be finite numbers');
  if (!(D > 0 && H > 0 && N > 0 && g > 0)) throw new RangeError('D, H, N and g must be positive');
  if (!(d > 0 && d <= H)) throw new RangeError('liquid depth must be between 0 and H');
  const r = D / 2;
  const omega = (2 * Math.PI * N) / 60;
  const h = (omega * omega * r * r) / (2 * g);
  // Fastest speed before liquid reaches the rim: h/2 = H - d.
  const hSpill = 2 * (H - d);
  const omegaSpill = Math.sqrt(2 * g * hSpill) / r;
  return {
    r, omega, h,
    depthAtAxis: d - h / 2,
    depthAtWall: d + h / 2,
    spills: d + h / 2 > H + 1e-12,
    vertexExposed: d - h / 2 < 0,
    omegaSpill,
    Nspill: (omegaSpill * 60) / (2 * Math.PI),
    surface: (x) => d - h / 2 + (omega * omega * x * x) / (2 * g), // height of the free surface at radius x (valid with no spill)
  };
}

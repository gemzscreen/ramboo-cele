// Block released from rest on a rough incline, sliding to a spring and compressing it.
//   m  mass, kg;  theta  slope angle, deg;  mu  kinetic friction coefficient;  d  slide to the spring's free end, m;  k  stiffness, N/m
// Pure function (g = 9.81 m/s2). Work-energy: a(d + x) = k x^2 / 2, a = m g (sin - mu cos).

export const G = 9.81;

// Positive root of (half k) x^2 - a x - a d = 0.
export function compressionFor(a, k, d, half = 0.5) {
  return (a + Math.sqrt(a * a + 4 * half * k * a * d)) / (2 * half * k);
}

export function springSlide({ m, theta, mu, d, k }) {
  if (![m, theta, mu, d, k].every(Number.isFinite)) throw new RangeError('all inputs must be finite numbers');
  if (!(m > 0 && theta > 0 && theta < 90 && mu >= 0 && d >= 0 && k > 0)) throw new RangeError('inputs out of range');
  const th = (theta * Math.PI) / 180;
  const a = m * G * (Math.sin(th) - mu * Math.cos(th)); // net force down the slope
  if (!(a > 0)) throw new RangeError('block would not slide');
  const x = compressionFor(a, k, d);
  return { a, x, xMm: x * 1000, speedAtSpring: Math.sqrt((2 * a * d) / m), equilibriumCompression: a / k };
}

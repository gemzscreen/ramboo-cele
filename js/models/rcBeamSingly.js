// Singly reinforced rectangular concrete beam, nominal and design flexural
// strength by the rectangular stress block. NSCP 2015: Sections 422.2.2
// (stress block, beta1), 421.2 (strength reduction factor).
//   b, d   width and effective depth, mm
//   As     tension steel area, mm^2
//   fc     specified concrete strength f'c, MPa;  fy  steel yield, MPa
// Pure function. Moments in kN·m. Assumes the tension steel yields and
// reports `yields` so a caller can reject sections where it does not.

const ES = 200000; // MPa
const ECU = 0.003;

export function beta1(fc) {
  if (fc <= 28) return 0.85;
  return Math.max(0.65, 0.85 - (0.05 * (fc - 28)) / 7);
}

export function rcBeamSingly({ b, d, As, fc, fy }) {
  if (![b, d, As, fc, fy].every(Number.isFinite)) throw new RangeError('all inputs must be finite numbers');
  if (![b, d, As, fc, fy].every((x) => x > 0)) throw new RangeError('all inputs must be positive');

  const b1 = beta1(fc);
  const a = (As * fy) / (0.85 * fc * b);   // depth of the stress block
  const c = a / b1;                        // neutral axis depth
  if (!(c < d)) throw new RangeError('neutral axis falls below the steel; section is not under-reinforced');
  const epsT = (ECU * (d - c)) / c;        // net tensile strain
  const epsY = fy / ES;
  const yields = epsT >= epsY;
  let phi;
  if (epsT >= 0.005) phi = 0.9;                       // tension-controlled
  else if (epsT <= epsY) phi = 0.65;                  // compression-controlled (ties)
  else phi = 0.65 + (0.25 * (epsT - epsY)) / (0.005 - epsY);
  const Mn = (As * fy * (d - a / 2)) / 1e6;
  return {
    b1, a, c, epsT, epsY, yields,
    tensionControlled: epsT >= 0.005,
    phi, Mn,
    phiMn: phi * Mn,
    rho: As / (b * d),
    T: (As * fy) / 1000,                   // steel force, kN
  };
}

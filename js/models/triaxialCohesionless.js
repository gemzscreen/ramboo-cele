// Drained triaxial compression test on a cohesionless soil (c = 0).
//   sigma3    cell (confining) pressure, kPa
//   deviator  deviator stress at failure, kPa
// Pure function. Angles in degrees, stresses in kPa.

export function triaxialCohesionless({ sigma3, deviator }) {
  if (![sigma3, deviator].every(Number.isFinite)) throw new RangeError('sigma3 and deviator must be finite numbers');
  if (!(sigma3 > 0 && deviator > 0)) throw new RangeError('sigma3 and deviator must be positive');

  const sigma1 = sigma3 + deviator;
  const centre = (sigma1 + sigma3) / 2;
  const radius = (sigma1 - sigma3) / 2;
  const phiRad = Math.asin(radius / centre);
  const phi = (phiRad * 180) / Math.PI;
  const theta = 45 + phi / 2;                        // failure plane, from the major principal plane
  const twoTheta = (2 * theta * Math.PI) / 180;
  return {
    sigma1, centre, radius, phi, theta,
    tauMax: radius,
    sigmaF: centre + radius * Math.cos(twoTheta),    // normal stress on the failure plane
    tauF: radius * Math.sin(twoTheta),               // shear stress on the failure plane
  };
}

// Number formatting shared by items, figures and the UI.

// Splits |x| into `sig` kept digits (as an integer) and the power of ten of the
// last kept digit, rounding half up in decimal. Working from a 12-digit decimal
// string removes binary floating-point noise first, so 90.249999999999 (really
// 90.25) rounds the way a person rounds 90.25.
function decimalRound(x, sig) {
  const [mantissa, exp] = Math.abs(x).toExponential(11).split('e');
  const digits = mantissa.replace('.', '');
  let kept = Number(digits.slice(0, sig));
  if (digits[sig] >= '5') kept += 1;
  let lastPlace = Number(exp) - (sig - 1);
  if (kept === 10 ** sig) { kept /= 10; lastPlace += 1; }
  return { kept, lastPlace };
}

// `sig` significant figures in plain decimal notation, with a true minus sign.
// formatSig(26.666, 3) -> "26.7"; formatSig(40, 3) -> "40.0"; formatSig(1234, 3) -> "1230"
export function formatSig(x, sig = 3) {
  if (!Number.isFinite(x)) throw new RangeError(`cannot format ${x}`);
  if (x === 0) return (0).toFixed(sig - 1);
  const { kept, lastPlace } = decimalRound(x, sig);
  const text = lastPlace >= 0
    ? String(kept * 10 ** lastPlace)
    : (kept / 10 ** -lastPlace).toFixed(-lastPlace);
  return (x < 0 ? '−' : '') + text;
}

// True when x sits so close to a rounding boundary at `sig` figures (the next
// digit is a 5 followed by nothing much) that the last kept digit depends on
// how the solver rounded along the way. The generator rejects such answers.
export function nearRoundingBoundary(x, sig = 3, margin = 0.02) {
  if (x === 0) return false;
  const mag = Math.floor(Math.log10(Math.abs(x)));
  const scaled = Math.abs(x) / 10 ** (mag - sig + 1);
  return Math.abs(scaled - Math.floor(scaled) - 0.5) < margin;
}

export function formatFixed(x, decimals) {
  return x.toFixed(decimals).replace('-', '−');
}

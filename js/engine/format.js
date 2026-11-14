// Number formatting shared by items, figures and the UI.

// `sig` significant figures in plain decimal notation, with a true minus sign.
// formatSig(26.666, 3) -> "26.7"; formatSig(40, 3) -> "40.0"; formatSig(1234, 3) -> "1230"
export function formatSig(x, sig = 3) {
  if (!Number.isFinite(x)) throw new RangeError(`cannot format ${x}`);
  if (x === 0) return (0).toFixed(sig - 1);
  const rounded = Number(x.toPrecision(sig));
  const magnitude = Math.floor(Math.log10(Math.abs(rounded)));
  const decimals = Math.max(0, sig - 1 - magnitude);
  return rounded.toFixed(decimals).replace('-', '−');
}

export function formatFixed(x, decimals) {
  return x.toFixed(decimals).replace('-', '−');
}

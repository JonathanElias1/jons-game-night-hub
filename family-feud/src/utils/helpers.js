export const cls = (...xs) => xs.filter(Boolean).join(" ");

export function defaultMultiplierByIndex(idx) {
  if (idx >= 3) return 3;
  if (idx >= 2) return 2;
  return 1;
}

export function labelForMult(m) {
  return m === 1 ? "Single" : m === 2 ? "Double" : "Triple";
}
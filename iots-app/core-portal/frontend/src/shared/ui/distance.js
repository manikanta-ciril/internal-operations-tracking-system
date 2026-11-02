export function formatDistance(metres) {
  if (!Number.isFinite(metres)) return "Unavailable";
  return metres > 500
    ? `${(metres / 1000).toLocaleString("en-IN", { maximumFractionDigits: 2, minimumFractionDigits: 2 })} KM`
    : `${Math.round(metres)} m`;
}

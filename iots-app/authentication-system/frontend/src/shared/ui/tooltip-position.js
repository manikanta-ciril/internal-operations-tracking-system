// Viewport coordinates are shared by hover and keyboard-focus hints.
export function tooltipPosition(anchor, popup, viewport, gap = 6, margin = 8) {
  const left = Math.max(
    margin,
    Math.min(
      anchor.left + anchor.width / 2 - popup.width / 2,
      viewport.width - popup.width - margin,
    ),
  );
  const fitsAbove = anchor.top - popup.height - gap >= margin;
  const fitsBelow =
    anchor.bottom + gap + popup.height <= viewport.height - margin;
  const placement =
    fitsAbove || (!fitsBelow && anchor.top > viewport.height - anchor.bottom)
      ? "top"
      : "bottom";
  const desiredTop =
    placement === "top" ? anchor.top - popup.height - gap : anchor.bottom + gap;
  const top = Math.max(
    margin,
    Math.min(desiredTop, viewport.height - popup.height - margin),
  );
  const arrow = Math.max(
    12,
    Math.min(anchor.left + anchor.width / 2 - left, popup.width - 12),
  );
  return { left, top, placement, arrow };
}

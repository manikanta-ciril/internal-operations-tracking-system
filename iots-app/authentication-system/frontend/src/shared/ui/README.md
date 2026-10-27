# Local interface components

These app-owned components follow HeroUI's composition and interaction patterns without importing or installing `@heroui/*`. They retain the IOTS palette and scoped CSS. They are independently implemented, not drop-in copies of the complete HeroUI library.

- `Popover.jsx`: native top-layer popover, controlled trigger, viewport positioning, outside/Escape dismissal, optional hover opening and interactive content.
- `Tooltip.jsx`: custom React trigger, hover/focus hints and Escape dismissal.
- `Chip.jsx`: status label with optional leading SVG icon.
- `Calendar.jsx`: Monday-first calendar, month navigation, roving keyboard focus, arrow/Home/End/Page keys and selected-day state. Saturday remains a working day.
- `distance.js`: metres through 500m; kilometres above 500m.
- `ui.css`: shared styles scoped to the authenticated workspace.

Reference reviewed: HeroUI v3 source at https://github.com/heroui-inc/heroui/tree/v3/packages/react/src/components (popover, tooltip, chip and calendar). HeroUI uses React Aria internally; the local components implement only this application's required API and do not claim the full library's feature coverage.

The tooltip now uses a manual native popover to escape scrolling/calendar containers and clamp hints to viewport edges. It supports hover, focus, Escape and click dismissal. The Profile attendance overview has a data-derived contribution calendar in `features/employee-attendance/components/AttendanceHeatmap.jsx`; its dates and summaries come from `calendar-model.js`. User-supplied `../heroUI.txt` was also reviewed for Calendar, Tooltip, Skeleton, Spinner and ProgressBar patterns.


Tooltip ownership: `Tooltip.jsx` handles interaction; `tooltip-position.js` calculates placement; `tooltip.css` owns the surface and motion. Do not override its fixed positioning from a feature stylesheet. The popup stays 6px from its actual trigger, flips at viewport edges, and uses a 160ms pop-out with a reduced-motion alternative. Only one shared hint is active at a time.

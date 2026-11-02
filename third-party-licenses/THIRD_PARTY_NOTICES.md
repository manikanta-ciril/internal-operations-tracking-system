# Third-party design references and adaptations

## HeroUI tooltip

The app-owned tooltip in
`iots-app/core-portal/frontend/src/shared/ui/Tooltip.jsx` and
`tooltip.css` was reviewed against the installed HeroUI 3.2.6 tooltip and styles.
The placement-specific fade/scale/translation entry pattern is adapted into plain
CSS, with CIRIL's own geometry, native popover lifecycle, palette and timings.
The upstream React Aria wrapper is not imported or vendored into the application.

Reference: https://heroui.com/en/docs/react/components/tooltip

The license text distributed with the installed packages is retained at
`third-party-licenses/HeroUI-LICENSE.txt`.

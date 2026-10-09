---
trigger: model_decision
description: Enforces OpenDesign craft standards, Web Interface Guidelines, and design token consistency when creating or refactoring frontend UI code in React.
---

# UI Design & Craft Standards (IOTS)

When designing, building, or modifying frontend interfaces in `iots-app/frontend`:

## 1. Layout & Hierarchy
- Maintain a strict visual hierarchy: clear display/title sizes, muted secondary text, consistent spacing scale (4px/8px grid).
- Never allow unstyled components or unpadded card containers.
- Include proper empty states and loading skeletons for all data views.

## 2. Color & Contrast
- Never hardcode raw hex colors in component styles; rely on semantic tokens (`text-primary`, `bg-surface`, `border-muted`, etc.).
- Maintain minimum WCAG AA contrast (4.5:1 for body text, 3:1 for large text).
- Match the theme palette defined in the architectural blueprint (`#19344A` navy primary, `#C66B17` orange accent, `#2D7B5C` green success, `#B35C65` red alert).

## 3. Form & State Feedback
- Provide instant visual feedback for asynchronous operations (submitting tasks, reviewing deliverables, logging in).
- Keep form validation errors proximate to the invalid input.
- Distinguish non-blocking activity entries from formal task status changes.

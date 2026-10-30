# Super Admin workspace

Mode: **Operate**.

The intended task is platform oversight, not employee punch tracking. Preserve CIRIL's existing colour palette and typography. Use simple action labels, short explanations and visible consequences. Keep the previous `superadmin.html` and current authentication routes untouched.

The eight screens are Home, User Management, Global Task Oversight, Location & Attendance, Global Announcements, Reports & Intelligence, Security & Audit Viewer and System Settings. The six Admin-family branches are not levels in an employee reporting hierarchy. Layer 3 reporting is a screen; no Layer 4 is invented.

All stateful operations use `api.ts`. Every mutation records reason, before/after, employee identity and active role. Real backend enforcement remains future integration work, explicitly distinguished from browser-local mock behaviour.

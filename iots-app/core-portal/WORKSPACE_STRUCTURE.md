# Authenticated employee workspace

Run the complete application from `iots-app` with `npm run dev`. The existing MySQL, API and Vite startup remains unchanged. The additive `employee_workspace` table is created by the existing schema/seed startup. Existing account passwords and punch evidence are preserved.

## File map

```text
core-portal/
  backend/
    database/                           # Schema and seed data
    src/auth/                           # Credentials, sessions, workday and WFH rules
    src/workspace/                      # Account settings, avatar, password and notifications
    src/calendar/                       # Authenticated holiday API, provider adapter and MySQL cache
    src/checkout/                       # Office punch-out location and photo flow
    tests/                              # Isolated API and browser integration checks
  frontend/src/
    app/App.jsx                         # Authentication gate and application lifecycle
    assets/                             # Logo and self-hosted fonts
    features/
      auth/                             # Login, permissions, location and photo capture
      workspace/dashboards/             # Role wrappers and shared dashboard welcome header
      employee-workspace/               # Workspace data provider, page routes and header
        components/                     # Dashboard sections, profile menu, clock, notifications
        styles/                         # Workspace layout, profile and menu styling
      employee-profile/                 # Identity, edit dialogs and profile tabs
      employee-attendance/
        components/AttendancePanel.jsx  # In-place overview/detail toggle with preserved graph range
        components/AttendanceHeatmap.jsx # Contribution calendar and day content
        components/HolidayDetails.jsx   # Shared date popups, holiday content and attribution
        useHolidays.js                  # Year-based fetch lifecycle and client request sharing
        holidays.css                    # Holiday markers, date details and calendar selectors
        calendar-model.js               # Record indexing, dates, weeks and month groups
        model.js                        # IST formatting and attendance state rules
        attendance-activity.css         # Calendar and overview layout only
        AttendancePage.jsx              # Detailed calendar and punch evidence
      employee-services/                # Activity, notifications, help and service views
    shared/
      ui/
        Tooltip.jsx                     # Hover/focus lifecycle, dismissal and pop-out hints
        tooltip-position.js             # Viewport placement, edge clamping and arrow offset
        tooltip.css                     # Tooltip surface, fixed positioning and motion
        Popover.jsx                     # Interactive overlay, used by profile/notifications
        Calendar.jsx                    # Reusable month calendar
        calendar-range.js               # Shared 2025 minimum and valid calendar-date bounds
        Chip.jsx                        # Compact status label
        ui.css                          # Shared control styles and dashboard composition
      feedback/                         # Loading indicators, operation tracking, page transitions
      workspace/                        # Buttons, dialogs, fields, tabs, links and UI primitives
      theme/                            # Persistent light/dark mode
```

## Authentication and data

`App` verifies `/api/auth/me` before rendering the workspace. Dashboard selection and identity come from that response, never from prototype sample data or the URL. Role changes continue through the server's assigned-role check. Routes use `/dashboard/<active-role>/profile`, `/attendance`, `/activity`, etc.; browser history and direct links are supported. Deployments must retain SPA fallback for these paths.

All workspace endpoints require an active, verified on-site session backed by office photo evidence. Off-site sessions are rejected. Every query uses the authenticated employee ID. Editable profile fields cannot change employee identity, email, role assignments, or punch records. Avatars are compressed to 256px WebP and stored separately from sign-in/out evidence. Settings and avatar storage are account-scoped in MySQL.

Profile details, availability and notification preferences persist. Availability is self-reported; location remains derived from the verified session. Attendance shows actual recorded evidence for the last 180 days. Missing evidence is not automatically marked absent. Working days are Monday through Saturday. Sessions, attendance and availability remain separate.

Tasks, requests and performance metrics are not implemented services yet. Account/security notifications are implemented; task and request notification delivery remains future work. Their views show empty states instead of fabricated live records. Add service modules and API adapters when those subsystems are implemented. Notification preferences are stored but do not enable delivery by themselves.

Log out opens the existing location and photo punch-out flow. After punch-out, the account cannot sign in again that IST calendar day, regardless of location. The original login and checkout components, role dashboard components, npm entry points and standalone `employee-workspace.html` prototype remain in place. Workspace CSS is scoped to prevent styling login or checkout.

## Validation

From `iots-app`: `npm run build`, `npm run lint`, `npm run test:unit`, `npm run test:auth`. The authentication suite uses a separate test database and evidence directory; run the development stack first for MySQL and Vite. Workspace checks cover anonymous/pending session rejection, account isolation, profile field allowlists, avatar ownership, persistent data, profile routes, theme switching, mobile width and punch-out entry.

## Account controls and work modes (26 October 2026)

### Office-only access and same-day punch-out lock

Sign-in requires a verified on-site location within the configured 75m office radius. Off-site and unknown locations cannot open the dashboard, including through direct location confirmation requests or restored sessions from the previous WFH policy. A rejected location check deletes the pending session so retrying does not falsely report an already logged-in device.

After any completed office punch-out, the account cannot sign in again until the next IST calendar day, regardless of location. The server checks this after valid credentials, before creating a pending session or accepting a takeover, and again before photo activation. Existing sessions are checked before protected API access. Rejected legacy off-site sessions are revoked and any historical open remote interval is closed. Historical WFH records remain stored, but new WFH sign-in is disabled.

Office hours are Monday?Friday 09:30?18:00 and Saturday 09:30?16:00, in IST. The header displays server-synchronized current time and hours/minutes remaining until closing. Before opening, the remaining duration is capped at the full workday; after closing it is zero. Sunday is the weekly off. These standard hours do not themselves force logout; successful punch-out closes access for the rest of that day. The redundant employee-name span has been removed from the header.

### Session takeover and passwords

After correct credentials, an existing live session (including an unfinished sign-in within its five-minute window) produces a five-minute, one-use challenge. It lists browser/OS labels derived from the user-agent; these are approximate, not hardware identity. Cancel preserves existing sessions. Explicit takeover ends the reviewed sessions, closes any WFH time interval, creates a pending login, and still requires location validation. A takeover is not an office punch-out. Account-row locks serialize takeover, session transitions and password updates; changed sessions invalidate stale takeover challenges.

Security & sessions includes current/new/confirm password inputs. The server verifies the current password, rate-limits failures, hashes the replacement with salted scrypt, invalidates other sessions and outstanding challenges, and creates an account notification. Password updates preserve the current session. Password recovery remains administrator-assisted.

### UI ownership

`frontend/src/shared/ui/` contains local Calendar, Popover, Tooltip, Chip and distance formatting components inspired by the reviewed HeroUI source; there is no HeroUI runtime dependency. The header stays at the top and the existing welcome card remains centered. Profile menu: Profile, Dashboard, Help, appearance toggle, logout. Attendance is in Profile/Overview. Tasks, Requests and Activity entry sections are on the dashboard. Notifications use a separate bell with unread count, hover/click preview and a full page. The current notification service stores real password/takeover security events; task/request notification producers remain future work.

Backend modules: `auth/session-choice.js`, `auth/workday.js`, `auth/remote-work.js`, `workspace/account-routes.js`. Additive tables: `session_devices`, `signin_challenges`, `employee_notifications`, `remote_work_sessions`. The existing dev command creates these from `database/schema.sql`; migration does not delete manual data.

Tests: `backend/tests/test-account-controls.cjs` checks policy, takeover races/replay, password validation, office the location-independent same-day lock, next-day eligibility and legacy off-site session rejection. `workspace-controls-browser.cjs` checks the rendered controls, themes, keyboard calendar, notifications, password UI, office-hours countdown and off-site login rejection. All run via `npm run test:auth` against the isolated test database.


### Full-width role dashboard layout

All 11 role dashboards use `dashboards/DashboardWelcome.jsx` for a compact greeting and role header. `WelcomeCard` composes this header with the shared inline work sections when rendered within the authenticated workspace. The home work surface fills the browser content width: Tasks occupies the primary left region, with Requests and Activity & Performance in the right column. Sections stack in reading order on smaller screens. Profile and service pages keep their existing content widths. The layout does not add task/request backend services; those remain explicit empty states until enabled.

### Loading feedback and attendance activity calendar

`frontend/src/shared/feedback/` owns request progress, spinners, loading previews and page transitions. User-triggered mutations are tracked by the auth/workspace API clients; background clock and notification polling remain quiet. Concurrent operations are counted independently and clear on success or error. Shared buttons expose `loading`, disable duplicate submissions and announce `aria-busy`. Profile/photo dialogs retain pending state until saving finishes.

Navigation uses the browser View Transition API where available, preserves mounted profile tab state, and handles rapid repeated navigation plus Back/Forward. Unsupported browsers use a short content animation; reduced-motion users receive static pending indicators without spatial transitions. Navigation does not impose artificial request delays.

The Profile/Overview attendance panel now uses `employee-attendance/calendar-model.js` and `components/AttendanceHeatmap.jsx`. It builds Monday-first weeks, month labels and 90/180-day periods from actual office evidence. Native top-layer tooltips show dates and punch details on hover/focus; arrow keys move between dates and Enter opens the selected day. Saturday is a working day and missing evidence remains unclassified. WFH session time remains separate. The detailed monthly calendar opens on the attendance route, keeping the default overview compact.

Reference: `../heroUI.txt` from the repository root, plus the already documented HeroUI interaction patterns. Components remain local to the frontend and retain the application palette. `loading-feedback.cjs`, `attendance-calendar.cjs` and `ui-models.test.cjs` cover pending/error states, history navigation, date boundaries, keyboard interaction, themes and mobile width. The browser tests run in `npm run test:auth`; model checks run in `npm run test:unit`.


### Component ownership and hover behavior

Shared UI components own their interaction logic and component styles. Attendance styling owns calendar cells and layout; it must not redefine generic tooltip positioning. Tooltip coordinates are calculated from the actual trigger in viewport space, stay 6px from the cell when space permits, and flip/clamp at viewport edges. A single active hint prevents overlapping date popups. The 160ms pop-out animation is disabled for reduced motion.

When extending a feature, place its data rules in the feature model, its view in the feature components, and reusable interaction primitives under `shared`. Production routes import from `frontend/src`; standalone HTML prototypes outside that tree are reference artifacts. Build and lint checks validate source integrity, while the component browser tests validate navigation, overlay geometry and responsive behavior.

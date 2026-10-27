Calendar and holidays
====================

The authenticated endpoint is `GET /api/auth/workspace/calendar/holidays?year=2027`.
It returns normalized Indian holiday/festival annotations, including nationwide and
Telangana entries when the provider supplies state metadata. It accepts years from
2025 through the next calendar year in IST. The UI enforces the same range through
month/year selection, keyboard navigation and direct-date validation.

Configuration
-------------

Set `CALENDARIFIC_API_KEY` in `backend/.env`, or the server's environment. Never use
a VITE-prefixed variable: that would publish the key in browser JavaScript. The
backend `.env` is ignored by Git; `.env.example` contains an empty placeholder.
Restart the dev command after changing an inherited environment variable.

`src/calendar/holidays.js` manages validation, normalization and a seven-day MySQL
cache (`calendar_holiday_cache`). The schema is included in `database/schema.sql`
and initialized lazily for existing installations. Concurrent requests for a year
share one provider call. Failures back off for an hour and use previously saved
data when available. Provider URLs and errors are never forwarded to the browser.
The UI loads holiday annotations independently of punch evidence, so a provider
failure does not prevent viewing attendance. Calendarific attribution is visible.

Attendance policy
-----------------

Imported festivals, restricted holidays and bank holidays are informational. They
do not change CIRIL's Monday–Saturday schedule, login rules or working-hour targets.
Company approval of non-working holidays is a separate policy feature. Second and
fourth Saturdays remain working days under the existing company configuration.
Holiday data never fabricates attendance or marks an employee absent.

The activity heatmap adds holiday markers and accessible date popups. The detailed
month view provides month/year selectors, date popups and a full selected-day list.
View details replaces the heatmap inside the same attendance panel; Back to
overview restores the retained graph range. Both views remain route-addressable,
support browser history, and animate only the attendance content when switched.
Attendance evidence retains its existing 180-day query window; calendar coverage
from 2025 does not imply older evidence is available.

Tests: `node backend/tests/test-holidays.cjs`; frontend model tests and
`node frontend/tests/holiday-calendar.cjs` (requires the dev frontend on port 5174).

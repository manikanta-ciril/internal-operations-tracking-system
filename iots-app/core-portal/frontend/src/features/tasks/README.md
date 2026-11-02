# Employee work blocks

`TaskWorkspacePage` composes the task queue, full task page and daily report using
the authenticated employee from `useEmployeeWorkspace()`. `TaskList`, `TaskCard`,
`TaskPage`, `TaskActivity`, `TaskJourney` and `TaskWorkingNote` remain ordinary
React components. The full task page preserves the designed layout; no iframe or
second React root is mounted in the application.

The creative role supplies the graphic-design catalogue, seeded example briefs,
file categories and revision vault. Other employee roles start with an empty
personal queue and can use the shared report builder. Chairman, Admin and Super
Admin have no personal task/report routes. Their future organisation oversight
views must use independently authorised aggregate data.

`storage/index.js` selects `LocalStorageTaskAdapter` by default. The key
`ciril-iots-tasks-v1` contains an account-indexed envelope. Old account-specific
keys from the HTML integration are read without deletion; saving writes the new
envelope. State revision checks reject stale writes. Web Locks serialise writes
where available; browsers without Web Locks retain the revision check but cannot
guarantee atomic writes across simultaneous tabs.

The adapter contract exposes `load`, `save`, `getTasks`, `updateTaskStatus`,
`addVersion`, `addActivityLog` and `saveDailyReport`. `ApiTaskAdapter` forwards the
same contract to a supplied transport and fails explicitly when unconfigured.
After implementing the backend transport, change the factory in `storage/index.js`
to select it. No endpoints or server persistence are invented by this migration.

Browser work, uploaded evidence and recorded submissions remain local to this
browser. Real attendance, account preferences, session clocks, notifications and
profile/security controls continue through the existing shared services.

`../daily-report/reportEngine.js` owns report compilation. `ReportPage` and
`ReportReview` own the interactive builder and table review. `exportTools.js`
provides PDF, XLSX, CSV and IndexedDB evidence; PDF/Excel libraries load on demand.

`EmployeeWorkLayout` owns sidebar navigation and mounts the existing header once.
Attendance links open the existing `ProfilePage` overview and attendance calendar.
Preferences and logout remain in the existing profile menu. Sidebar labels gain
tooltips only in the collapsed state.

`shared/work-ui` contains local shadcn component definitions. HeroUI's dropdown
and scroll-shadow controls are wrapped in local components. The existing app's
Tailwind 3 pipeline remains active. A separate Tailwind 4 CLI compiles only work
feature styles, prefixes selectors to `body.ciril-employee-work`, and renames
layers to avoid leaking resets into login or other system surfaces. Edit
`creative-associate/workspace/styles/source.css`; run `npm run styles:work`.
The build runs that command automatically.

## Organisation

`backend/src/workspace/organisation.js` defines roles and reporting relationships.
The seed preserves account IDs/passwords and assigns Harshitha Coordinator and
Executive. GM and Senior Manager are the operational controller roles. Employees
retain Chairman reporting/escalation; Chairman oversight does not grant automatic
access to private browser-local report records.

## Verification

- `npm run build` and `npm run lint` in the frontend.
- `node tests/task-storage.test.mjs` for storage boundaries.
- `node tests/native-workspace.cjs` with Vite on localhost:5196 for native rendering,
  persistent notes, attendance navigation, role exclusions and three export formats.
- `node backend/tests/test-organisation.cjs` from the core-portal directory
  for the role/reporting contract.

Browser tests use explicit fixtures and mocked shared API responses. They do not
replace the live authentication regression suite or prove server-side creative
workflow enforcement.

# Graphic Designer workspace preview

Open `../graphic-designer.html` directly in a browser. This is an isolated React preview with shadcn/ui components, CIRIL warm neutrals and gold accents, and example records saved on this device. It does not change the authentication application.

## Build and checks

From this folder:

```powershell
npm.cmd ci
npm.cmd run build
npm.cmd test
node browser.test.cjs
```

The browser check uses the existing authentication frontend's Playwright installation and Microsoft Edge. The generated HTML loads adjacent assets from `graphic-designer/dist/` and runs without a CDN. Keep that folder beside the HTML when copying the preview. Dependencies and lockfile are isolated here.

## Structure

- `WorkspaceApp.jsx`: routing, saved state, notifications and theme.
- `api.js`: preview persistence adapter, sample records and report-scope helper. Replace this adapter with authenticated endpoints for live integration.
- `components/WorkspaceShell.jsx`: navigation, header and notifications page.
- `components/TaskList.jsx`: searchable work, reviews and history, with grid and list layouts.
- `components/TaskPage.jsx`: task brief checklist, updates, review/revision trail, deliverable versions and activity.
- `components/ReportPage.jsx`: report draft, remarks, queued snapshots and CSV export.
- `components/AccountPage.jsx`: preferences, notification permission, profile and workflow help.
- `components/WorkspaceUI.jsx`: shared domain controls.
- `components/ui/`: shadcn registry components backed by Radix primitives.
- `model.js`: task transitions, daily-report derivation and reminder schedule.
- `workflow.js`: role identity, execution stage, reporting condition and activity validation.
- `presentation.js`: shared report labels and IST formatting.
- `style.css`: light/dark tokens and responsive layout.

## Workflow

Designer submissions and revisions follow configured creative-review and reporting-manager stages. Chairman reviews selected work. Returned feedback, prior submissions, original deadlines and handover records remain visible. The owner can check off brief requirements; checklist completion does not change task progress or approve a deliverable. The designer can request an extension, but cannot grant it, reassign work, approve a deliverable or clear a manager-owned blocker. Overdue is shown alongside the execution stage. Progress reaching 100% does not close a task.

Employee identity is supplied through state. Example reviewer assignments illustrate the current company workflow; production routing must use configured relationships and server permissions.

Daily reports retain the eight workbook columns: Date, Day, Tasks to be done, Task Completed, Tasks in Progress, Tasks pending, Any new tasks assigned or taken up during the day, Remarks. Awaiting-review work is not completed. Report recipients are the employee and configured report-recipient roles. Work-review access alone does not include daily reports.

Office defaults: weekdays end 18:00 IST, Saturday 16:00, Sunday unscheduled. Reminders appear 30 minutes earlier with a ten-minute snooze and optional browser permission. These are preview schedule defaults, not attendance controls. Report snapshots can queue at shift end while the page is open. Task effort, login activity and attendance are separate concepts.

## Honest preview limits

No emails, server push, real uploads or manager notifications are sent. Task files and report proofs are stored as local IndexedDB blobs. Local history is readable and retained by the UI, but browser storage is not an immutable audit store. Browser permissions and report visibility are UI demonstrations; server-side authorisation, authenticated actor attribution, storage, scheduling and tamper-resistant audit persistence are required before live use. Corrupt saved data is preserved and shown as an error; failed writes keep the user's form draft.

The authentication system's source and dependency manifest are unchanged by this redesign.

## Role-driven integration

`role-policy.js` defines the Graphic Designer capability set, ordered review stages and report audience. `RoleContext` supplies this policy to reusable components. No employee name is used to decide a transition or report permission. The default preview identity is illustrative.

`WorkspaceApp` accepts an `api` prop with asynchronous `load()` and `save(nextState)` methods. The current preview uses a local-storage adapter. For live integration, supply an authenticated adapter and replace local whole-state writes with server-validated commands. The server must resolve actor identity, active role, ownership, review mandates and recipient scope itself.

Required loaded state includes `employee`, `workspace`, `tasks`, `remarks`, `extraWork`, `deliveries`, `dismissedReminders`, `settings` and `readNotifications`. Task review uses `status: 'In review'` plus a stable `reviewStageId`, independent of the reviewer's name. Legacy `With ...` records are normalised on load while their original status remains recorded.

Report access accepts an explicit `report.read` grant listing authorised employee IDs. A manager designation or work-review mandate alone does not grant report access. This helper demonstrates the UI contract; the endpoint must enforce the same scope.

New source: `components/TaskCard.jsx` is the shared grid/list task entry. `PRODUCT.md`, `DESIGN.md` and `SURFACE.md` capture the product, tokens and role-workspace behaviour. The dependency manifest remains isolated from authentication.

## Additional visual concept

The separately supplied `designer-workspace.jsx` has its own preview at `../designer-workspace.html`. The source component is kept as supplied; `designer-preview-main.jsx` mounts it with toast support, a preview notice and the CIRIL theme tokens in `designer-preview.css`.

Rebuild this alternative after editing its JSX:

```powershell
npm.cmd run build:designer-workspace
```

This command writes only `designer-workspace.html`. The existing `graphic-designer.html` remains the separate role-driven dashboard preview. This alternative uses its own example data, resets on refresh, and sends no real reports.

## Full-page navigation

`graphic-designer.html` uses distinct hash routes for tasks (`#work/DES-104`, `#reviews/DES-101`), notifications (`#notifications`), profile (`#profile`), preferences (`#preferences`) and help (`#help`). These replace all contextual side drawers. The app shell stays in place while the main page changes with a 220 ms transition; reduced-motion settings disable the movement. Back actions and browser history work, headings receive focus, and list filters, search, sorting and layout choices survive task navigation. The report summary also opens as a page instead of occupying a side column.

`PageHeading.jsx` supplies consistent page headings and Back actions. `NotificationsPage.jsx` provides the full notification list. Mobile navigation expands inline rather than opening a drawer. The separately supplied `designer-workspace.jsx` visual concept is independent of this change.

## Manual daily reporting and dashboard filters

The work dashboard uses IST greetings, a one-time waving-hand animation, informational summary cards, and task filters for assignment date, deadline, creative vertical, scope category, and stage. Reduced-motion settings disable decorative movement.

Daily reporting is employee-curated in three steps: task selection, per-task descriptions/status/remarks/evidence, and final review. Report sections do not change task workflow states. Only selected tasks enter reports. Saved dates and earlier report snapshots remain accessible from 2025 onward. Proof blobs use IndexedDB; report metadata uses the preview API's local storage. Exports generate PDF, XLSX, and CSV documents with evidence filenames. Uploaded proof binaries are downloaded separately.

Automatic report dispatch is removed. Explicit submissions create a preview delivery for General Manager / Senior Manager / Executive only. Chairman and creative-review roles are not report recipients. Actual server delivery, cloud file storage, and integration with the authenticated application's attendance calendar remain outside this standalone preview.

### Section-by-section report flow

The report now walks through Tasks to be done, Tasks completed, Tasks in progress, Tasks pending, and New tasks, then remarks/other work and final review. The first step lists available tasks and selects work included in the report. Selected tasks already completed start in Completed; other selected tasks start in In progress. Employees may confirm report-only completion or move selected work between In progress and Pending without changing task approval status. New assignments are suggested by the selected report date and enter the report only when selected. Each section has an explicit empty state, and text/proofs are optional. All five sections, including empty summaries, appear in preview and exports. Existing saved entries retain their data and evidence references.

### Spreadsheet report review and exports

Review uses the workbook's columns (Tasks to be done, Task Completed, Tasks in Progress, Tasks pending, Any new tasks assigned or taken up during the day, Remarks), preceded by Task ID, Date and Day, followed by Evidence. One task creates one row; its description enters the appropriate status column. New-task text can coexist on that row. Other work has a separate row; daily remarks and empty-section summaries follow the table. Identity comes from employee records; unknown identity fields are labelled rather than invented.

Excel embeds the CIRIL logo at the upper right, wraps cells, freezes headers, and uses A4 landscape print settings. PDF uses A4 landscape with repeated table headers, employee identity, logo, and row continuation for long text. CSV uses identical task columns with identity metadata; as a text format it records the logo filename instead of embedding artwork. Sidebar branding uses the authenticated application's configured /img/icon.png favicon.

### Branding and export spacing refinement

The supplied Waving Hand.webp is copied into assets/waving-hand.webp and embedded at 38px (32px on mobile), replacing the emoji. Reduced-motion mode hides the animated asset. Expanded navigation displays the CIRIL wordmark; collapsed navigation displays the authenticated application's compact icon. The task list restores a grid/list toggle while preserving filters.

PDF and Excel exports share warm beige header fills and charcoal text. Table text is vertically centred with horizontal breathing room; descriptive cells remain left aligned. Titles and employee metadata use centred header blocks. Excel merges A1:H4 by row and reserves I1:J4 for the centred logo. The PDF retains repeated identity/logo/table headers and row continuation on A4 landscape.

### Employee greeting and task workspace refinement (30 October)

The reusable employee-greetings.jsx component supplies 50 distinct supportive messages, employee identity and an IST-aware greeting. It types only the heading, keeps a complete screen-reader label, and respects reduced motion. The initial message is selected per employee/day; it rotates randomly every five minutes without consecutive repeats. The timer is cleared when the greeting unmounts. Employee work now defaults to grid; explicit list/grid choices are retained during navigation.

Task overview puts status chips at the upper right, highlights the current deadline, centres logged effort and removes duplicate progress text. The wider right rail groups work progress/status above a bounded, keyboard-scrollable Updates & attention panel. Details shows description, supplied inputs/references, expected outputs and checklist. Files & revisions owns reviewer status, multi-file submission, downloaded local attachments, preserved versions and review history. Activity is a newest-first connected timeline; completion records show approval actor and date. Missing approval data is stated, never invented. File blobs are stored in the existing IndexedDB preview store, with a 25 MB per-file limit. Secure production upload and reviewer delivery remain backend integration work.

Focused check: node task-layout.test.cjs covers message count/uniqueness, grid default, fact/alert layout, multi-file persistence, timeline order and narrow layouts.

### Focused task tabs from the supplied reference

Details retains real inputs/outputs and now has a quick working-note form. Files & revisions offers four optional media filters (Vector & source, Artwork & social, Print & deck, Video & motion), local draft saving, submission and per-version review labels. Working drafts are separate from submitted versions and do not advance review or task progress. Earlier versions are labelled Earlier submission unless their own review decision is recorded; no approval is invented. Requests owns extension and blocker forms. Activity uses a connected newest-first path with stage badges derived from each recorded event; append order breaks equal-timestamp ties. Completion nodes include approval identity and timestamp.

Implementation reuses existing form controls, upload storage and role-scoped mutations. The supplied demo names, sample deliverables and mandatory Chairman route were not copied; configured review stages remain authoritative. Files stay on the local preview device.

## Reading and changing the code

Start with `preview.html` for the HTML document, `main.jsx` for the React entry, and
`WorkspaceApp.jsx` for routing and state. Edit components in `components/` and theme/layout
rules in `style.css`. The HTML is a mount point; React creates the visible dashboard.

`build-preview.cjs` builds both preview variants. It writes readable JavaScript, CSS,
source maps, images and fonts into `dist/`. Required third-party notices are retained in
`*.js.LEGAL.txt` beside each generated script. Vendor code is generated output; maintain
our source components instead. Do not manually edit `dist/` or the generated HTML.

```powershell
npm.cmd run format
npm.cmd run format:check
npm.cmd run build
node task-layout.test.cjs
node effort.test.cjs
node workflow.test.cjs
```

The HTML templates use paths relative to the generated files in `previews/`. Open
`../graphic-designer.html`, not the template inside this folder. Both previews still
open directly from disk. Browser storage and proof persistence keep their existing keys.

The alternative concept currently cannot be rebuilt: its imported
`designer-workspace.jsx` is absent from this checkout. Restore that supplied source before
running `build:designer-workspace`. The main creative workspace does not depend on it.

`test.cjs` and `role-policy.test.cjs` contain older automatic report-delivery expectations
that currently fail. This code-formatting change does not alter report-delivery policy.
The focused task, effort, workflow and report-builder checks above cover the current UI.

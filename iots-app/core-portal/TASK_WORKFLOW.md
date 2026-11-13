# Shared task and work lifecycle

The portal now uses authenticated shared work records. The temporary prototype remains separate. Its demo identities and SQLite database are not used by the portal.

## Where to use it

- GM/SM accounts: Work management > Assign work, Team work, Review queue, Work requests and Team reports.
- Employees: existing My tasks / briefs, Details, Files & revisions, Activity, Requests and Daily work report screens.
- Chairman: operational work/report oversight, with no routine assignment or approval controls.
- Lead Manager, Executive, Designer, BDE and IT: own work and retained contributions. Their titles alone grant no employee management powers.

Assigned roles combine for task permissions. A GM/SM account retains management links while viewing another assigned role. Existing account, attendance, timers, location checks, profile, notifications and messaging remain in the native portal shell. The existing role context selector remains available for other role dashboards; task access does not require changing it.

## Work cycle

1. A manager saves an editable draft with brief, owner, independent reviewer, deadline, category, deliverables and acceptance requirements. Reference files can be attached before assignment.
2. Assignment validates the brief and creates an employee notification. Drafts stay private to their creator until assigned.
3. The employee starts work, checks requirements, saves notes, reports progress and logs effort. Progress never approves work or changes workflow state by itself.
4. An employee can report a blocker or ask for more time. Managers record the decision. A resolved blocker requires an explicit employee resume action. Original deadlines remain recorded.
5. Evidence uploads are private server files. The employee can save a working draft or submit a fixed version. Earlier submitted versions retain their files, authors and timestamps.
6. The named independent reviewer opens review, returns specific corrections or confirms acceptance and approves. Self-review is rejected on the server, including multi-role accounts. Required publication evidence gates final approval where configured.
7. Transfers retain the ID, original due date, assignment trail and previous contributions. Earlier owners keep read-only access. Reviewer changes and cancellation require a reason.
8. Employees save and submit daily reports. The server captures linked task facts and evidence. Submitted reports are read-only. GM/SM receive employee reports; Chairman receives management reports and has permitted report oversight. PDF/Excel downloads use the existing exporter.

Overdue is separate from task state. Cancellation is not completion. Neither uploads, a report entry nor 100% reported progress can close a task.

## Existing browser records

Shared work is the default. **Open browser archive** opens the existing browser-local workspace without importing or deleting it. Archive updates retain the old browser behaviour and are labelled separately. Returning to shared work uses the server. No sample tasks are seeded into shared work.

## Implementation

Frontend: `src/features/tasks/task-api.js`, `storage/ServerTaskAdapter.js`, the existing employee task screens and `tasks/management/`. Daily reports reuse their existing layout, evidence component and export tools. No duplicate prototype shell is mounted.

Backend: `src/tasks/`, mounted below existing active-session and attendance-photo guards. MySQL is authoritative. Commands re-read assigned roles, lock records, check expected revisions and record idempotency receipts. Task history, updates and in-app notifications commit together. A stale decision receives 409; it is never silently applied. Employee input forms remain present while a conflicted record is refreshed.

Storage: five additive `work_*` tables. Tasks use JSON payloads with indexed owner, reviewer, state and deadline columns; events and command receipts are separate records. Evidence uses generated private storage keys, metadata, SHA-256, upload limits and authorised forced downloads. Submitted report evidence is not made public. There is no new cloud dependency.

## Setup and deployment

From `backend/`, run `npm run migrate:tasks` with the existing database environment. This creates only task tables. It does not seed tasks or change employees, passwords, attendance or roles. The development workspace migration also includes these tables.

From `frontend/`, run `npm run build`. Restart the existing API service after a deployment; the local development API uses Node watch mode. Use the existing portal URL and ports, not the prototype server.

For the GoDaddy VPS, set `IOTS_TASK_ROOT` to a private persistent directory outside the web root. Back up MySQL and that directory together. Configure HTTPS, process supervision, upload/proxy limits, available disk space and off-server backups in the existing deployment. Verify a restore before production rollout.

## Verification

Verified locally on 13 November 2026. The build, upload type check, MySQL integration test, backend unit tests, five frontend model/storage/chat tests and full isolated auth regression suite passed. Lint exits successfully with one existing warning in `ChatWidget.jsx`; this integration adds none. Vite retains the existing large export-bundle warning.

Playwright exercised actual portal screens with separate GM, SM, Designer, Lead and Chairman accounts: draft/reference upload/assignment, employee updates and effort, evidence, correction/resubmission/approval, download, report submission/manager Excel export, blocker/resume, extension decision and publication-proof approval gate. Stage dates and revision history were checked. Screenshots were inspected at desktop and mobile sizes; dark employee/manager views passed overflow checks at 1024, 768 and 390 pixels. Generated screenshots remain under ignored `frontend/test-results/`.

- Backend: `npm run test:tasks` (disposable MySQL integration test); `npm run test:unit`; `npm run test:auth` (isolated authentication/attendance/profile/permissions regressions).
- Frontend: `npm run build`, `npm run typecheck:upload`, existing task/model tests and `npm run lint`.
- Browser: start `node tests/task-browser-fixture.cjs` from backend; it prints a temporary credentials-file path for its isolated database. Run `node tests/task-lifecycle.ui.mjs <credentials-file>` from frontend. It tests actual portal screens without changing live attendance or employee work.

## Remaining deployment work

Email delivery, malware scanning, automated retention, a tested VPS backup/restore and measured load testing are not configured by this integration. There is no automatic reminder worker or external CRM synchronisation. The current indexed task payload design and bounded report list should gain pagination and further relational normalization when required by actual volume. Appraisal scoring is not inferred from attendance or added by this task system.

The source planning documents are `dashboards-designed/task-workflow-design/01-system-design.md` through `05-decisions-and-review-findings.md`. Their future hosting and automation proposals are not claims of deployed capabilities.

## Task overview usability and evidence repair ? 13 November 2026

- Fixed the evidence-serving failure: Express rejected absolute paths below the hidden .local directory. Files now resolve by their generated ID under a configured private root; task/report ownership checks and the dotfile guard remain active. Authorized owner, GM, SM and Chairman access is tested; unrelated employees remain denied.
- Reusable evidence rows provide separate Preview and Download buttons with loading and inline errors. Images, PDF, text, audio and video have authenticated previews; source, SVG/HTML and Office formats download for opening locally. No private files go to an external document viewer. Text previews are capped at 256 KB and downloads preserve the complete file. Browser PDF support varies.
- Save work update and other work actions use visible button treatments. The manager Next step panel names the next responsible person, explains the state and keeps decision forms beside their controls. Less frequent transfer/reviewer/cancellation controls sit under Manage assignment.
- Activity path presents the newest action separately from the scrollable older stack. Optional filters affect older records only. Assignment edits retain actor, timestamp, and allowlisted before/after changes; employees can inspect the history once work is assigned.
- Chairman is excluded from owner/reassignment selection and rejected server-side even when combined with an employee role. Chairman retains read-only oversight.
- Assigned roles contribute a union of existing capabilities to one sidebar. Common links appear once; there is no workspace switcher. Identity refresh on focus/visibility and every 30 seconds while visible updates granted or removed roles. Server authorization is checked on every command. This does not invent unimplemented executive business modules.
- Completed work accepts one immutable 1?5-star rating and explanation from its named independent GM/SM reviewer. Rating, reviewer, version and date are visible to the employee and oversight roles, included in activity and summarized in the queue. Rating is an input for future appraisal aggregation, not an inferred overall performance score.

Additional regression coverage: hidden-directory downloads and preview permissions; invalid/unauthorized ratings; Chairman owner rejection; browser text/image preview, accepted file download, reviewer rating and employee visibility, latest-event exclusion, assignment history, dark/mobile widths; live role grant/removal without re-authentication. The obsolete workspace-switcher loading test now verifies its absence and preserves notification/logout coverage.

Role-refresh browser regression: node tests/task-role-refresh.ui.mjs <credentials-file> from frontend, using only the disposable browser fixture database. Existing live employee data is not changed by these tests.

Design guidance reviewed: https://github.com/piyushrajyadav/awesome-ai-dev-prompts ? dashboard UI builder and internal tool builder prompts. Applied clear navigation, progressive disclosure and explicit actions while retaining CIRIL's actual fonts, tokens and shell.

## Assignment input files

The assignment form now uses the same shared FileUpload component as chat: multiple files, drag-and-drop, remove-before-save and 30 MB per file. Supported reference formats follow the task endpoint allowlist. Save draft and Save & assign both upload selected inputs to the saved draft before assignment. A failed upload prevents assignment; already-saved files remain on the draft with an actionable recovery message. Employees receive the authenticated reference previews/downloads through their task details.

Verified: frontend build, upload type check and lint (existing chat warning only); task-assignment-files.ui.mjs covers multi-file selection/removal, upload-before-assignment, employee preview/download, partial failure retaining a draft and mobile width. The full task-lifecycle.ui.mjs regression also passed after the change. All browser tests used the disposable fixture, leaving live operational data untouched.

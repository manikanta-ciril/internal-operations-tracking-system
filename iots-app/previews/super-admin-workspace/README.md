# CIRIL Super Admin workspace — second preview

Open [`../../superadmin-workspace.html`](../../superadmin-workspace.html) directly in Edge or Chrome. The earlier [`../../superadmin.html`](../../superadmin.html) company-setup preview remains separate. No server is needed for this file, and it makes no external requests.

The preview includes all eight main screens, profile/task/issue drawers, Ctrl/Cmd+K search, role switching, account authorisation, manager referrals, tasks, attendance corrections, announcements, report queues, actual CSV/XLSX/PDF exports, policy controls, light/dark modes and explicit loading/empty/error/restricted states.

All employees, records, alerts, comparisons and queued deliveries are **example data**. Changes persist only in this browser under `ciril-governance-preview-v1`. No live account, attendance, CRM, holiday-provider request, email or employee notification is changed. Do not enter real credentials or confidential information into this prototype.

## Source map

| File                 | Purpose                                                                                                 |
| -------------------- | ------------------------------------------------------------------------------------------------------- |
| `types.ts`           | Typed records, capabilities, availability and lifecycle contracts                                       |
| `seed.ts`            | Illustrative employees, multi-role cases, tasks, flags, source metadata and history                     |
| `api.ts`             | Single mock API: role checks, reads, mutations, recipient notifications, policy, audit and export scope |
| `export.ts`          | Browser-native CSV, genuine OOXML `.xlsx` and paginated PDF generation                                  |
| `ui.tsx`             | Typed adapters for existing CIRIL/HeroUI controls, forms, states, charts and export menus               |
| `actions.ts`         | Shared create/edit/composer definitions                                                                 |
| `home.tsx`           | Greeting, pulse, account queue, attendance mix, team work, attention, trends and feed                   |
| `people.tsx`         | Accounts, workspace-family directory, departments, role/capability matrix                               |
| `operations.tsx`     | Task table/board/transfers, attendance/source corrections, announcements                                |
| `governance.tsx`     | Six report pillars, security/audit/investigations and settings                                          |
| `drawers.tsx`        | 360 employee profile, monthly calendar, task/issue details, notifications, search and exports           |
| `main.tsx`           | Shell, hash routes, active role, action/dialog state and preview-state control                          |
| `workspace.css`      | CIRIL token aliases, layout, responsiveness, motion and dark mode                                       |
| `build.cjs`          | Self-contained HTML build, embedded assets and dependency notices                                       |
| `checks.cjs`         | Mock API and export-policy checks, independent of real data                                             |
| `browser-checks.cjs` | End-to-end preview checks and screenshots                                                               |
| `OBSERVATIONS.md`    | Product/authority analysis and mapping of the 27 systems                                                |

The UI reuses the existing shared Icon, Avatar, Dialog, Popover, Tooltip and ThemeToggle. Button, Chip and ProgressBar use the actual installed HeroUI React library through typed UI adapters. No new application runtime dependency was added. `heroUI.txt` was reviewed alongside the installed component code. The standalone bundle preserves dependency licence comments; existing repository third-party notices still apply.

## Build and check

From the repository root, with the existing root HeroUI dependencies and authentication frontend dependencies installed:

```powershell
npm.cmd install --prefix .local/preview-build --no-save --package-lock=false esbuild typescript
node iots-app/previews/super-admin-workspace/build.cjs
node .local/preview-build/node_modules/typescript/bin/tsc -p iots-app/previews/super-admin-workspace/tsconfig.json
node iots-app/previews/super-admin-workspace/checks.cjs
node iots-app/previews/super-admin-workspace/browser-checks.cjs
```

The browser check uses the frontend's existing Playwright installation and Edge. Temporary build/test artifacts go under ignored `.local/governance-review`. Edit modular source and rebuild; do not hand-edit the bundled HTML.

## Replace with Express later

Replace `api.ts` implementations with authenticated requests, retaining their typed inputs/results. Server equivalents should include employee CRUD/access-change requests, task reads/oversight changes, source-preserving attendance corrections, announcements, reports, audit reads, session termination, policy updates and scoped exports.

The backend must derive identity and active role from the authenticated session, never from the client-supplied mock actor. Enforce the same grants, account authorisation boundaries, data scope, business mandates, validation, append-only audit and export policy server-side. Add idempotency/concurrency protection and real delivery workers. Browser-local example notifications, password-reset queues and schedule records are not delivery implementations.

## Validation and limits

Strict TypeScript checking and mock API checks cover role restrictions, mandatory reasons, authorisation, source-preserving corrections, referral recipients, stable task IDs, filtered exports, XLSX, recipient scope and policy rejection.

Browser checks cover all eight screens and four preview states, employee creation/editing, profile sections, authorisation, task reassignment/creation, attendance corrections, rich announcement content, command search, audit diffs, CSV/XLSX/PDF downloads, report generation, persistence, dark mode, mobile navigation and 320/390/768/1440 px layouts. No external HTTP requests or browser exceptions were observed in the passing run.

PDFs are image-backed pages; XLSX is uncompressed OOXML; CSV defuses spreadsheet formula prefixes. File metadata and read receipts are example records, not uploaded work files or real read telemetry. Mock audit history is append-only through the UI but cannot provide server-grade immutability. The current authentication application and the original company-setup preview are not reconfigured by this build.

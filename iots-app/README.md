# IOTS application

The live application lives in `core-portal/` (formerly `authentication-system/`).
Its `frontend/src/components/` and `frontend/src/lib/` own shared UI code.
Design references stay in `previews/`; verification artifacts stay in the
repository-level `reports/` directory. Duplicate root UI scaffolding is preserved
in `previews/archived-ui-scaffold/` and is not imported by the application.

With the development server running, `npm run test:dashboards` checks all role
dashboards at desktop and mobile sizes, then checks tasks, reports and attendance.

Run the complete application from this directory:

```cmd
npm run dev
```

Open **http://localhost:5174**. Keep the terminal open; Ctrl+C stops the stack.
The command starts portable MySQL on `127.0.0.1:3307`, creates missing database
records while preserving passwords, starts the API on `127.0.0.1:3001`, and
starts Vite on port `5174`. Run only one stack at a time.
PowerShell users can use `npm.cmd` if execution policy blocks `npm.ps1`.

## Setup on another computer

Use Node.js 22.12 or newer. Run `npm run setup` to install the frontend and backend
with their independent lockfiles. The Windows portable MySQL installation must
also exist under the repository's `.local` directory; follow
[authentication setup](core-portal/backend/AUTH_SETUP.md).
Dependency installation and MySQL installation are explicit setup steps.
Dependencies, local database files and saved photos are excluded from Git.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | MySQL, authentication API and Vite together |
| `npm run setup` | Install both packages using npm ci |
| `npm run build` | Build both frontend HTML entries |
| `npm run lint` | Check frontend source |
| `npm run test:unit` | Identity, location, evidence, security and theme tests |
| `npm run test:auth` | Isolated API and browser regressions; keep dev running in another terminal |

The regression suite uses `iots_auth_fix_test` and its own uploads, preserving
manual-test records in `iots_auth_temp`. Browser tests require Playwright Chromium;
if missing, run `npx playwright install chromium` in the frontend package.

Read [FILE_STRUCTURE.md](FILE_STRUCTURE.md) for the full source tree, review order
and how to add subsystems. The current authentication subsystem owns sign-in,
location checks, camera evidence, sessions, role landing pages and punch-out.

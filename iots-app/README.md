# IOTS application

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
[authentication setup](authentication-system/backend/AUTH_SETUP.md).
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

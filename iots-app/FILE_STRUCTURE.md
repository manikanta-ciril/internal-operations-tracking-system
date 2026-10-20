# IOTS application file structure

## Organization and ownership

The application is organized by business subsystem. `authentication-system`
contains today's implemented access and evidence workflow. Each future subsystem
can have its own frontend and backend without adding unrelated logic to login.
The root package is the development entry point and command dispatcher.

## Reviewer starting points

| File or folder (relative to iots-app) | Responsibility |
| --- | --- |
| `package.json` | Public developer commands; private application package |
| `scripts/dev.cjs` | MySQL initialization, non-destructive seeding, API/Vite startup and shutdown |
| `scripts/setup.cjs` | Install each subsystem package from its lockfile |
| `authentication-system/backend/src/server.js` | Bind the API listener; the only runtime entry point |
| `authentication-system/backend/src/app.js` | Compose Express, request parsing, routes and error responses |
| `authentication-system/backend/src/auth/routes.js` | Credential, location, confirmation, photo, session and role endpoints; mounts checkout |
| `authentication-system/backend/src/auth/session-state.js` | Transaction locks and session/check/capture preconditions |
| `authentication-system/backend/src/auth/login-limiter.js` | Independent account/client budgets and trusted proxy identity |
| `authentication-system/backend/src/auth/login-identity.js` | Username and company email normalization |
| `authentication-system/backend/src/auth/passwords.js` | Salted password hashes and bounded asynchronous verification |
| `authentication-system/backend/src/auth/proxy-secret.js` | Development proxy trust secret; explicit production configuration |
| `authentication-system/backend/src/checkout/routes.js` | Punch-out location, confirmation, capture and session termination |
| `authentication-system/backend/src/location/` | Server distance/accuracy assessment and office coordinate configuration |
| `authentication-system/backend/src/evidence/photos.js` | Validate captures, compose stamps, store private employee evidence |
| `authentication-system/backend/src/evidence/encode.js` | Shared WebP compression for punch-in and punch-out |
| `authentication-system/backend/src/database/connection.js` | MySQL pool and backend environment loading |
| `authentication-system/backend/src/config/paths.js` | Stable repository, package and local-storage paths |
| `authentication-system/backend/database/` | MySQL schema and idempotent seed script |
| `authentication-system/backend/tests/` | Unit, API and isolated regression harnesses |
| `authentication-system/frontend/src/main.jsx` | React bootstrap and global stylesheet |
| `authentication-system/frontend/src/app/App.jsx` | Session restoration, role workspace composition and checkout |
| `authentication-system/frontend/src/features/auth/LoginPage.jsx` | Login interaction and animation sequence |
| `authentication-system/frontend/src/features/auth/api.js` | Browser authentication API client |
| `authentication-system/frontend/src/features/auth/` | Location gates, decisions, progress and camera evidence UI |
| `authentication-system/frontend/src/features/auth/checkout/` | Logout/punch-out state and UI |
| `authentication-system/frontend/src/features/workspace/dashboards/` | Role-specific landing components, shared welcome card and styling |
| `authentication-system/frontend/src/features/creative-associate/` | Standalone dashboard prototype; not a separate authenticated backend |
| `authentication-system/frontend/src/shared/components/` | Reusable buttons, icons, title/background effects and dialogs |
| `authentication-system/frontend/src/shared/theme/` | Shared light/dark store, toggle styles and store tests |
| `authentication-system/frontend/src/shared/utils/` | Existing browser utility helpers retained during the move |
| `authentication-system/frontend/src/styles/` | Global Tailwind/custom styles; legacy-app.css is retained starter CSS |
| `authentication-system/frontend/src/assets/` | Imported image assets, including the evidence logo |
| `authentication-system/frontend/public/` | Static files served without bundler imports |
| `authentication-system/frontend/tests/` | Playwright authentication regression scenarios |
| `authentication-system/frontend/vite.config.js` | Two HTML entries, port and API proxy; Node-only backend secret import |

Review the entry points first, then the server transaction/state guards, then the
matching browser flow and regression tests. Backend routes retain their existing
`/api/auth/*` URLs. Source moves do not change database table names or the image
storage layout. The application uses React/Express JavaScript, not generated code.

## Complete maintained file tree

Installed dependencies, build output and machine-specific `.env` files are omitted.
Each JSX component in `dashboards` owns the role named by its filename; shared
rendering lives in `WelcomeCard.jsx`. CSS stays next to its owning feature or UI.

```text
iots-app/
|-- authentication-system/
|   |-- backend/
|   |   |-- database/
|   |   |   |-- schema.sql
|   |   |   `-- seed.js
|   |   |-- src/
|   |   |   |-- auth/
|   |   |   |   |-- login-identity.js
|   |   |   |   |-- login-limiter.js
|   |   |   |   |-- passwords.js
|   |   |   |   |-- proxy-secret.js
|   |   |   |   |-- routes.js
|   |   |   |   `-- session-state.js
|   |   |   |-- checkout/
|   |   |   |   `-- routes.js
|   |   |   |-- config/
|   |   |   |   `-- paths.js
|   |   |   |-- database/
|   |   |   |   `-- connection.js
|   |   |   |-- evidence/
|   |   |   |   |-- encode.js
|   |   |   |   `-- photos.js
|   |   |   |-- location/
|   |   |   |   |-- assess.js
|   |   |   |   `-- office-location.json
|   |   |   |-- app.js
|   |   |   `-- server.js
|   |   |-- tests/
|   |   |   |-- run-isolated.cjs
|   |   |   |-- test-auth.js
|   |   |   |-- test-checkout.js
|   |   |   |-- test-encode.js
|   |   |   |-- test-identity.js
|   |   |   |-- test-location.js
|   |   |   |-- test-photos.js
|   |   |   |-- test-security.js
|   |   |   `-- test-transitions.cjs
|   |   |-- .env.example
|   |   |-- .gitignore
|   |   |-- AUTH_SETUP.md
|   |   |-- package-lock.json
|   |   `-- package.json
|   |-- frontend/
|   |   |-- legacy/
|   |   |   |-- new_login_react.html
|   |   |   `-- new_login_react_documentation.md
|   |   |-- public/
|   |   |   |-- img/
|   |   |   |   |-- icon.png
|   |   |   |   `-- logo.png
|   |   |   |-- favicon.svg
|   |   |   `-- icons.svg
|   |   |-- src/
|   |   |   |-- app/
|   |   |   |   `-- App.jsx
|   |   |   |-- assets/
|   |   |   |   |-- hero.png
|   |   |   |   |-- logo.png
|   |   |   |   |-- react.svg
|   |   |   |   `-- vite.svg
|   |   |   |-- features/
|   |   |   |   |-- auth/
|   |   |   |   |   |-- checkout/
|   |   |   |   |   |   |-- checkout.css
|   |   |   |   |   |   `-- CheckoutFlow.jsx
|   |   |   |   |   |-- api.js
|   |   |   |   |   |-- auth-motion.css
|   |   |   |   |   |-- AuthProgress.jsx
|   |   |   |   |   |-- LocationDecision.jsx
|   |   |   |   |   |-- LocationPermissionGate.jsx
|   |   |   |   |   |-- LoginPage.jsx
|   |   |   |   |   `-- PhotoEvidence.jsx
|   |   |   |   |-- creative-associate/
|   |   |   |   |   |-- dashboard.css
|   |   |   |   |   |-- Dashboard.jsx
|   |   |   |   |   |-- disclosures.css
|   |   |   |   |   |-- main.jsx
|   |   |   |   |   |-- personal.css
|   |   |   |   |   |-- PersonalViews.jsx
|   |   |   |   |   |-- sidebar.css
|   |   |   |   |   |-- tabs.css
|   |   |   |   |   |-- theme.css
|   |   |   |   |   `-- workCatalogue.js
|   |   |   |   `-- workspace/
|   |   |   |       `-- dashboards/
|   |   |   |           |-- Admin.jsx
|   |   |   |           |-- BusinessDevelopmentExecutive.jsx
|   |   |   |           |-- Chairman.jsx
|   |   |   |           |-- CreativeCommunicationAssociate.jsx
|   |   |   |           |-- CreativeCommunicationExecutive.jsx
|   |   |   |           |-- dashboard.css
|   |   |   |           |-- Executive.jsx
|   |   |   |           |-- GeneralManager.jsx
|   |   |   |           |-- index.js
|   |   |   |           |-- ITSystemAnalyst.jsx
|   |   |   |           |-- LeadManager.jsx
|   |   |   |           |-- SeniorManager.jsx
|   |   |   |           |-- SuperAdmin.jsx
|   |   |   |           `-- WelcomeCard.jsx
|   |   |   |-- shared/
|   |   |   |   |-- components/
|   |   |   |   |   |-- modals/
|   |   |   |   |   |   |-- EmptyCredsModal.jsx
|   |   |   |   |   |   |-- HelpModal.jsx
|   |   |   |   |   |   |-- ModalDialog.jsx
|   |   |   |   |   |   `-- PermissionDeniedModal.jsx
|   |   |   |   |   |-- AnimatedButton.jsx
|   |   |   |   |   |-- Icons.jsx
|   |   |   |   |   |-- LoginFormSection.jsx
|   |   |   |   |   |-- MinimalTypingTitle.jsx
|   |   |   |   |   |-- SimplexNoiseBackground.jsx
|   |   |   |   |   |-- TestingDock.jsx
|   |   |   |   |   |-- ThemeToggle.jsx
|   |   |   |   |   `-- UnlockingLock.jsx
|   |   |   |   |-- theme/
|   |   |   |   |   |-- theme-toggle.css
|   |   |   |   |   |-- useTheme.js
|   |   |   |   |   `-- useTheme.test.cjs
|   |   |   |   `-- utils/
|   |   |   |       |-- cookieUtils.js
|   |   |   |       `-- geoUtils.js
|   |   |   |-- styles/
|   |   |   |   |-- index.css
|   |   |   |   `-- legacy-app.css
|   |   |   `-- main.jsx
|   |   |-- tests/
|   |   |   `-- auth-regressions.cjs
|   |   |-- .gitignore
|   |   |-- .oxlintrc.json
|   |   |-- creative-associate.html
|   |   |-- index.html
|   |   |-- package-lock.json
|   |   |-- package.json
|   |   |-- postcss.config.js
|   |   |-- README.md
|   |   |-- tailwind.config.js
|   |   `-- vite.config.js
|   `-- README.md
|-- scripts/
|   |-- dev.cjs
|   `-- setup.cjs
|-- FILE_STRUCTURE.md
|-- package-lock.json
|-- package.json
`-- README.md
```

## Persistent data (outside iots-app)

```text
<repository>/.local/
|-- mysql-8.4.11-winx64/       Portable Windows MySQL server
|-- mysql-data/               Existing database files
|-- iots-proxy.key            Shared local proxy trust secret
|-- uploads/
|   |-- check-in-photos/      Employee folders containing punch-in evidence
|   `-- check-out-photos/     Employee folders containing punch-out evidence
`-- auth-fix-test-uploads/    Temporary isolated-suite storage; removed after tests
```

Do not move or delete these directories to reorganize source code. New source
paths are resolved centrally through backend `src/config/paths.js`. Database
metadata continues to reference the existing relative evidence filenames.

## Adding the next subsystem

1. Add `<business-name>-system/frontend` and/or `backend` next to
   `authentication-system`. Only create packages needed by the implemented work.
2. Give each package a unique name, a README, its own lockfile and tests.
3. Add its install/start/build checks to root scripts when it becomes runnable;
   the current orchestrator launches authentication only because that is the
   currently implemented subsystem.
4. Consume authenticated server identity through a deliberate server interface.
   Do not copy credentials/session security into each subsystem or treat a
   client-selected role as authorization.
5. Keep business UI in its owning subsystem. Extract cross-system libraries only
   when actual shared use exists. The current shared folder belongs to the
   authentication frontend, not a speculative global design framework.
6. Update this tree and review map with the change. The current workspace role
   landing pages remain here until a real attendance/tasks/analytics subsystem
   replaces them. The creative-associate prototype remains clearly labeled.

## Migration map

| Previous path | Current path |
| --- | --- |
| `iots-app/backend/` | `iots-app/authentication-system/backend/` |
| `iots-app/frontend/` | `iots-app/authentication-system/frontend/` |
| `backend/dev.js` | `iots-app/scripts/dev.cjs` |
| `backend/index.js` | Backend `src/server.js`, `src/app.js` and `src/auth/routes.js` |
| Backend root schema and seed | Backend `database/` |
| Backend runtime helpers | Backend `src/auth`, `location`, `evidence`, `database` |
| Backend test files beside source | Backend `tests/` |
| Frontend `src/App.jsx` | Frontend `src/features/auth/LoginPage.jsx` |
| Frontend `src/auth/AuthApp.jsx` | Frontend `src/app/App.jsx` |
| Frontend `src/auth/` | Frontend `src/features/auth/` |
| Frontend `src/dashboards/` | Frontend `src/features/workspace/dashboards/` |
| Frontend `src/creativeAssociate/` | Frontend `src/features/creative-associate/` |
| Frontend components/theme/utils | Frontend `src/shared/` |

Original audit reports and session transcripts retain their historical paths.
Use this guide for current paths. `legacy/`, `input/`, `reports/` and session
transcripts at repository level are reference material, not application runtime.

Login background: `frontend/src/shared/components/SimplexNoiseBackground.jsx`
(within authentication-system) renders the restored moving-sheet effect. It
respects reduced motion and pauses while hidden. Login geometry and responsive
title sizing live in `frontend/src/features/auth/login-layout.css`.

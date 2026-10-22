# Temporary IOTS authentication

From `iots-app`, run:

```powershell
npm.cmd run dev
```

Open **http://localhost:5174**. This starts the isolated MySQL instance on
127.0.0.1:3307, the Express API on 127.0.0.1:3001, and Vite on port 5174.
Keep the terminal open. Ctrl+C stops the stack. Run only one copy at a time.
`npm.cmd` avoids PowerShell's npm.ps1 execution-policy restriction.

## Test credentials

Every account initially uses **`Iots@123`**. These are local development accounts.

| Username | Employee | Assigned roles |
|---|---|---|
| vijay | Vijay Sarathi | Chairman |
| ipsheeta | Ipsheeta Barua | General Manager, Senior Manager, Executive |
| manasa | Manasa B. | Lead Manager / Operations Manager |
| bhavani | Bhavani Maddela | Business Development Executive |
| harshitha | Harshitha Goud | Creative Communication Executive |
| deepthi | Sai Deepthi | Creative Communication Associate |
| kanna | Kanna Praneeth Thogati | IT System Analyst |
| manikanta | Deva Manikanta Sala | IT System Analyst |
| superadmin | Super Admin (test account) | Super Admin |
| admin | Admin (test account) | Admin |

Ipsheeta signs into General Manager first and can switch to her other two
workspaces. The two IT analysts have individual accounts and share the IT role
component. Admin and Super Admin are placeholders because no names were supplied.

## Files and storage

- `database/schema.sql`: importable MySQL database definition, not a flat-file database.
- `database/seed.js`: creates the employee and role records; rerunning preserves passwords.
- `../frontend/src/features/workspace/dashboards/`: one editable JSX component per role, sharing
  `WelcomeCard.jsx` and `dashboard.css`, based on the supplied sample image.
- `.local/mysql-data/` at the repository root: actual MySQL database files.
  These and the portable server are ignored by Git. Do not edit database files manually.

Passwords use salted scrypt hashes. A random session token is sent in an HttpOnly,
SameSite=Strict cookie; MySQL stores its SHA-256 hash and eight-hour expiry.
The API checks assigned roles on session reads and role switches. Logout deletes
the session. Browser refresh restores the session from the API.
This local implementation uses a session token, without a separate JWT.

Location permission and a successful position reading are required before the
login form appears. There is no skip button. A fresh position is checked again
after credentials pass. There is no continuous location tracking.
Existing browser permission is checked automatically on page load and after
logout: if already granted, a fresh position opens the form without an Allow
button. Permission changes in site settings are observed. A GPS failure with
permission granted offers Retry location check rather than requesting permission
again; revoked or denied permission keeps the form locked.

## Office location check

`src/location/office-location.json` holds the office centre supplied by the user:
latitude **17.4303611**, longitude **78.4566389**, radius **75 metres**.
The backend calculates Haversine distance from the reported coordinates alone:
within or exactly 75 metres is on-site; beyond 75 metres is off-site. Browser
accuracy is not required, stored in new location assessments or used to classify
attendance. Missing, invalid or stale coordinates are rejected and must be
retried. Denied location permission keeps the login form locked. Off-site
readings still require an explicit location exception decision. Historical
photo stamps and metadata retain their original assessment.


The login first creates a pending session. `/api/auth/me` and role switching
reject it until location checks and photo evidence are complete. On-site proceeds to the camera;
off-site and unknown require an explicit Continue or Cancel decision. Continue
preserves the classification on the session; Cancel deletes the pending session.
The decision stays inside the authentication progress panel, matching the legacy
flow. While paused, the account remains verified, the location step shows a
warning, loading indicators stop, and workspace preparation is not displayed.
No timer advances the paused flow; only an explicit decision resumes or cancels it.
Pending decisions expire after five minutes. Login checks and location decisions
are stored in `login_events`; location details are in `session_locations`.
The welcome page shows the session's actual location classification.

## Required camera photo

After location passes or an exception is accepted, the session moves to
`awaiting_photo`. Camera permission is required; there is no file-picker or skip
path. The employee sees a mirrored live preview with a face-position guide,
captures a frame, then chooses Retake or Use photo & continue. This collects
photo evidence; it does not detect or recognise faces. No audio/video is saved.
The camera stream stops after capture, cancellation and component removal.

The browser submits a JPEG to `/api/auth/photo` with the capture timestamp.
Uploads are limited to 2 MB and two minutes of age. The server decodes and
re-encodes the JPEG, strips metadata, rejects invalid or undersized images,
limits pixel dimensions, and generates the filename itself.

Files are private, outside Vite/public, at:

```text
.local/uploads/check-in-photos/<employee-name>--<employee-id>/<random-id>-2026-10-19_01-15-06_IST.webp
```

Employee folders use the authenticated database name, sanitised for filenames;
the ID prevents collisions between people sharing a name. MySQL `photo_evidence`
stores the photo ID, employee ID, session reference hash, relative path,
SHA-256, file size, capture time, and upload time. New photos are compressed WebP files
with a protected header and footer outside the camera image, preserving the face area.
The header centres ?Punch-in photo evidence? and puts the CIRIL logo on a light
backplate at the top right. The footer contains only name, company email,
username, latitude, longitude, capture date with weekday, time in IST and status. GPS accuracy and
server/location reading times are kept in metadata rather than printed.
`photo_evidence_details` stores the same immutable location/time snapshot,
including ISO timestamps, reported GPS accuracy and the `Asia/Kolkata` timezone.
Accuracy is retained for geofence calculations and auditing but is not printed
on the photo or its stamp summary. The filename includes
the capture date and time in IST. Older photos retain their existing filenames.
The final file is written
before activation; the database transaction records evidence and activates
the session together. A failed transaction removes its new file.

Photos are excluded from Git. They are not public URLs. The authenticated
`/api/auth/photos/:id` endpoint currently permits only the employee who owns
the photo. Manager access needs an explicit future scope policy. Logout revokes
the session, but does not delete historical evidence. Retention is not yet automated.
Pending or pre-photo sessions cannot read dashboards or switch roles. Previous
sessions without evidence must sign in again.

Incorrect credentials display a check and rejection animation, then transition
back to the form with the password cleared. They never proceed to the location
check or workspace. Reduced-motion mode skips the presentation delays.

## Portable MySQL installation

On this PC the portable server is already installed in
`.local/mysql-8.4.11-winx64/`. On another PC, install frontend/backend packages with
`npm.cmd ci` in each directory and download the official MySQL 8.4.11 Windows ZIP
from https://dev.mysql.com/downloads/mysql/8.4.html, then extract it under `.local`.
The startup script initializes the dedicated database automatically on first run.
It never uses or changes the existing Windows MySQL service.

The startup script uses fixed **local-only** database credentials:
`iots_dev` / `IotsLocalDb!2026`, database `iots_auth_temp`, port `3307`.
The isolated MySQL administrator password is `IotsLocalRoot!2026`.
These are development settings, not deployment credentials.

## Verification

Run these in-memory checks from backend:
`node test-location.js`, `node test-identity.js`, `node tests/test-photos.js`,
`node tests/test-encode.js`, and `node auth/test-security.js`.

With the documented portable MySQL instance and frontend dev server running,
run `npm.cmd run test:auth` from backend. The runner starts a separate API on an
available loopback port, seeds `iots_auth_fix_test`, and stores its synthetic
images only in `.local/auth-fix-test-uploads/`. It removes its records/files and
stops its API in a finally block. It never uses `iots_auth_temp` for test writes.
The runner uses the documented local-only database credentials; alternative
local admin credentials can be supplied through `IOTS_TEST_ADMIN_USER` and
`IOTS_TEST_ADMIN_PASSWORD`. Browser checks use the installed Microsoft Edge on
Windows; other platforms need Playwright Chromium installed.

Direct invocation of the mutating auth/checkout scripts now requires an isolated
test URL and `_test` database configuration. Prefer the runner, which owns its
API process and ensures the intended database/upload directory are used together.
The tests cover all accounts and roles, cookie/session boundaries, location and
capture chronology, stale check IDs, concurrent transitions, checkout replay,
private photo access, photo decoding, login throttling, permission revocation,
expiration recovery, lost upload responses, modal keyboard handling, bundled
styling and reduced-motion behavior.

This is the temporary authentication foundation. Password recovery, full audit
events, account administration, retention, and production deployment controls
remain later work.

## Company email sign-in

Employees can use their existing username or `<username>@ciril.in`; both resolve
to the same account and password. Other email domains are rejected. These are
login aliases, not newly provisioned mailboxes or verified recovery addresses.

## Login rendering

The original animated shader background, film grain, typing title and theme
transitions are retained. The original login placement, form styling and recovery dialog are restored.

## Checkout on Log out

The dashboard's Log out button opens checkout: fresh location (same 50 m office
boundary), explicit off-site/unknown confirmation, and a new camera photo with
retake/confirm. Cancelling returns to the active workspace. Location denial or
camera denial prevents completion; it does not invent a checkout record.

Checkout files use a separate private root:
`.local/uploads/check-out-photos/<employee-name>--<employee-id>/<random-id>-<capture-date-time>_IST.webp`.
The shared stamp renderer prints **Punch-out photo evidence**, the employee
identity, coordinates/status, capture weekday/date/time and the CIRIL logo.
Sign-in files stay under `check-in-photos`.

`checkout_checks` holds the short-lived location decision for the current session
(five-minute validity). `checkout_evidence` persists the WebP path, SHA-256, size,
client capture timestamp, server checkout timestamp, immutable location metadata
and the linked sign-in photo ID. Saving the checkout record and deleting the
session happen in one database transaction; a failed transaction removes the new
file. Session locking and unique constraints prevent duplicate checkout records.
The completed records survive session deletion. Times of capture and successful
server checkout are stored separately.

Backend routes/tests are in `backend/checkout/`. The UI is in
`frontend/src/auth/checkout/`, reusing the existing permission, location decision
and photo capture components. New schema tables are created idempotently by
`database/seed.js` at dev startup. Existing employee accounts/passwords are preserved.

Endpoints (active authenticated session required):
- POST `checkout/location` with `{ position }`
- POST `checkout/confirm` with `{ proceed: true|false }`
- POST `checkout/cancel`
- POST `checkout/photo` with camera JPEG and `X-Captured-At`
- GET `checkout/photos/:id` (owner only, after signing in again)

A direct POST to `logout` returns 409 requiring checkout, rather than silently
skipping evidence. Closing the browser, session expiry or starting another login
is not recorded as a completed checkout. No background attendance is inferred.

The isolated `npm.cmd run test:auth` runner includes `checkout/test-checkout.js`;
do not point it at the manual-test database.

## Shared appearance preference

Login, role dashboards, checkout and the Creative Associate preview share the
same light/dark toggle. `authentication-system/frontend/src/shared/theme/useTheme.js` owns the `iots-theme`
localStorage preference and document theme; open tabs synchronise via storage
events. With browser storage blocked, toggling still works in the current page.
Theme styling lives beside each feature; `src/shared/theme/theme-toggle.css` styles the
shared toggle. Test the store with `node authentication-system/frontend/src/shared/theme/useTheme.test.cjs`
from `iots-app`. This preference does not alter saved evidence images.

## Evidence compression

`src/evidence/encode.js` is the shared punch-in/punch-out WebP encoder. The camera
portion is limited to 960 x 960 pixels, preserving its aspect ratio. The header
and readable 24px stamp text are added after resizing. WebP quality starts at 82;
only files over the soft 180 KiB target are retried at 76. Quality never drops
below 76, and detail-heavy images may exceed the target rather than be blurred
just to reach a byte cap. Source EXIF is removed; location/time audit metadata
remains in MySQL. New filenames use `.webp`, matching the real image content.

The file size and SHA-256 are calculated from the compressed file. The private
photo routes serve the correct WebP content type. Both evidence types share this
encoder, while retaining their separate employee folders and linked DB records.

Storage depends on the scene: at an illustrative 100 KB per photo, 600 photos
use about 60 MB/month and 7,200 use about 720 MB/year (excluding DB/backups).
The target is not a guaranteed maximum. Test with real office cameras before
setting a production storage budget. Run `node tests/test-encode.js` and
`node tests/test-photos.js` from backend to validate the encoder and stamped outputs.

## Authentication audit corrections (20 October 2026)

See `reports/authentication-audit-2026-10-20/resolution.md` at the repository
root for the mapping to AUTH-01 through AUTH-12. The original PDF remains the
historical pre-fix report.

- Credential verification uses asynchronous scrypt, with four concurrent jobs
  and a bounded queue. Startup-only seed hashing remains synchronous.
- Login budgets are independent per canonical account (10 attempts/minute),
  plus a client-wide abuse budget (100 attempts/minute). Success clears only
  that account's budget. Account aliases share the same canonical budget.
- The local Vite proxy overwrites its client-address headers and signs their
  provenance using a shared secret. The API accepts them only over loopback
  with the matching secret; it does not blindly trust X-Forwarded-For.
  Development creates `.local/iots-proxy.key` (ignored by Git). For deployment,
  set `IOTS_PROXY_SECRET` on the trusted ingress and API; production will not
  silently create a development secret.
- Session transitions lock and re-read the current session/state inside the
  transaction. Location checks return `checkId` and server `captureAfter`.
  Confirm calls must echo `checkId`; photo calls send `X-Location-Check`.
  Capture time must be within two minutes of now and must not predate location
  acceptance by more than the explicit one-second precision allowance.
- Client attempt generations invalidate late responses and animation callbacks
  after permission loss or cancellation. Camera operations have equivalent
  guards. Expired sign-in capture returns to credentials; stale checkout
  location returns to a fresh check. Ambiguous punch-in upload responses are
  reconciled with the authenticated session and matching location check.
- Modal dialogs provide native modal semantics, focus containment, Escape and
  opener focus restoration. The login uses the moving-sheet shader; reduced
  motion keeps it static and hidden pages pause rendering.
- Tailwind 3 styling and the existing brand tokens compile locally through
  PostCSS. The login layout no longer depends on the Tailwind runtime CDN.

These fixes do not introduce facial recognition, trusted GPS attestation,
attendance recovery after an eight-hour session expiry, emergency logout,
retention policy or production HTTPS configuration. Those remain separate
product/deployment decisions documented in the audit.

## Source organization

Runtime entry: `src/server.js`; Express composition: `src/app.js`; sign-in and
session routes: `src/auth/routes.js`; checkout: `src/checkout/routes.js`.
All backend tests live in `tests/`. Startup orchestration: `../../scripts/dev.cjs`.
See [the complete file guide](../../FILE_STRUCTURE.md).

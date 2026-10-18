# Temporary IOTS authentication

From `iots-app/frontend`, run:

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

- `schema.sql`: importable MySQL database definition, not a flat-file database.
- `seed.js`: creates the employee and role records; rerunning preserves passwords.
- `../frontend/src/dashboards/`: one editable JSX component per role, sharing
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

`office-location.json` holds the office centre supplied by the user:
latitude **17.4327379**, longitude **78.4560819**, radius **20 metres**.
The backend calculates distance using the Haversine formula and includes the
browser's reported accuracy: the entire accuracy circle must fit inside the
office boundary for an on-site result. A position entirely outside is off-site;
an overlapping accuracy circle is unknown. Missing, invalid or stale positions
are rejected and must be retried. Denied location permission keeps the login
form locked. A genuine off-site or imprecise reading still allows an explicit
location exception decision.

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
.local/uploads/check-in-photos/<employee-name>--<employee-id>/<random-id>-2026-10-19_01-15-06_IST.png
```

Employee folders use the authenticated database name, sanitised for filenames;
the ID prevents collisions between people sharing a name. MySQL `photo_evidence`
stores the photo ID, employee ID, session reference hash, relative path,
SHA-256, file size, capture time, and upload time. New photos are real PNG files
with a footer appended below the camera image, preserving the face area. The
footer contains employee name, full capture date and weekday, time in IST
(UTC+05:30), seven-decimal GPS coordinates, reported accuracy, session location
classification, distance/radius, location reading time, and server-received time.
`photo_evidence_details` stores the same immutable location/time snapshot,
including ISO timestamps and the `Asia/Kolkata` timezone. The filename includes
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

Use `node test-location.js` for geofence boundary and accuracy checks. With the
dev stack running, use `node test-auth.js` from the backend directory.
`node test-photos.js` validates the image decoding and sanitising rules.
The test checks every account, role switching, session restoration, invalid logins,
unassigned-role rejection, cookie flags, logout revocation, login throttling,
pending-session restrictions, explicit location acceptance, mandatory photo
upload, private photo access, malformed JPEG rejection, replay and cancellation.
It creates synthetic image fixtures in the temporary database for testing.
It finishes by exercising the rate limiter: wait one minute before signing in.

This is the temporary authentication foundation. Password recovery, full audit
events, account administration, retention, and production deployment controls
remain later work.

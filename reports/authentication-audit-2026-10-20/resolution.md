# Authentication audit resolution

Implemented on 20 October 2026. The original PDF, findings and source manifest
describe the **pre-fix** working tree and are intentionally preserved.

| Finding | Resolution | Regression evidence |
|---|---|---|
| AUTH-01 | Independent canonical-account budgets; separate client abuse budget; success does not reset unrelated accounts. The proxy replaces address headers and authenticates their provenance. | `backend/auth/test-security.js`; isolated API checks block one account while another still signs in. |
| AUTH-02 | All sign-in location, confirmation, cancellation and photo transitions lock/re-read the current session within a transaction. Checkout uses the same locking order. Confirm/photo operations bind to the current location check ID. | `backend/tests/test-transitions.cjs`: concurrent location/photo submissions, stale check rejection, active-session cancellation rejection and cancellation boundaries. |
| AUTH-03 | Checkout attempt generations invalidate pending responses when location is revoked. Capture requires a validated non-null location. Permission callbacks also reject outdated location/camera operations. | Browser test delays checkout confirmation, revokes permission, releases the response and asserts capture remains unavailable without a render exception. |
| AUTH-04 | The success transition rechecks the attempt/permission after each delay and before entering the workspace; revocation cancels motion and restores the permission gate. | Browser test revokes permission during “Preparing your workspace” and asserts no dashboard opens. |
| AUTH-05 | Punch-in supplies an expiration callback that clears identity/photo state and password, then returns to credentials. | Browser test returns 401 from photo submission and asserts the camera view unmounts and password is cleared. |
| AUTH-06 | Ambiguous punch-in upload responses reconcile through `/auth/me`, checking employee identity and the location check ID before continuing. Retries cannot create another photo for the active session. | Browser test commits a real isolated upload, drops its response, and verifies convergence to the workspace. |
| AUTH-07 | Both evidence types require the current check ID, a server validation timestamp and a fresh capture. A one-second precision allowance is explicit. | Isolated tests reject a capture 30 seconds before validation; in-memory checks cover the ordering rule. |
| AUTH-08 | Verification uses asynchronous `crypto.scrypt`, four active jobs and a bounded queue; constant-time comparison remains. Missing accounts use a dummy hash. | A timer executes while 12 verifications are pending; valid, invalid and missing-account checks pass. |
| AUTH-09 | Pinned Tailwind 3, PostCSS and Autoprefixer compile the existing tokens/utilities locally. Removed the runtime CDN/config script. | Production build passes; browser blocks the old CDN host and verifies styled login geometry without page errors. |
| AUTH-10 | Shared native dialog provides accessible naming, initial focus, Tab containment, Escape and opener focus restoration. Existing visual treatments remain. | Keyboard checks for recovery and empty-credential dialogs pass. |
| AUTH-11 | Shader respects reduced motion, redraws static frames for theme/resize and pauses while hidden. Normal animation is retained. | Browser draw counters verify static reduced-motion rendering, theme redraw, normal movement and hidden-page pause. |
| AUTH-12 | Punch-in/out render fixtures now use the identical employee/image/details and vary only kind. Semantic title assertions also verify exact labels. | `backend/test-photos.js` checks title values and distinct rendered output with an otherwise identical fixture. |

## Verification completed

- `npm.cmd run lint --prefix iots-app/frontend`: passed without warnings.
- `npm.cmd run build --prefix iots-app/frontend`: passed.
- In-memory identity, location, photo, compression, password/limiter and theme
  tests: passed.
- `npm.cmd run test:auth --prefix iots-app/backend`: passed. This includes the
  existing ten-account/eleven-role API coverage, checkout integration tests,
  concurrent transition checks and the browser regressions above.
- Checkout location expiry also returns to a fresh reading and can complete
  punch-out after retry.

The runner uses only `iots_auth_fix_test` and
`.local/auth-fix-test-uploads/`, cleans its fixtures and stops its API. The
manual-test database retained its ten accounts and its existing one punch-in
and one punch-out record; the two existing image files remain in place.

## Deliberately unchanged decisions

The documented eight-hour attendance/session lifecycle, emergency logout
policy, retention, facial verification/GPS attestation and production hosting
controls require separate product/deployment decisions. This work fixes the
twelve numbered findings rather than silently changing those policies.

Physical office GPS, real-camera quality and low-end i3 performance were not
retested. Browser media and permission edge cases use controlled test devices
and permission events. No commits or pushes were made by this fix pass.

Tailwind integration follows the official
[Tailwind 3 Vite/PostCSS guidance](https://v3.tailwindcss.com/docs/guides/vite).

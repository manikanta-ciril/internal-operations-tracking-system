from pathlib import Path
import base64
import hashlib
import html
import json
import subprocess

ROOT = Path(__file__).resolve().parents[2]
OUT = Path(__file__).resolve().parent
H = html.escape

findings = [
    dict(id='AUTH-01', title='One employee can trigger a shared login lockout', severity='High', area='Availability / credentials', proof='Source-confirmed',
         summary='The rate limiter groups every browser behind the Vite proxy into the same IP bucket. Ten failures from one employee can temporarily reject correct credentials for everyone using that proxy.',
         cause='The key is req.ip. Vite forwards /api to loopback, and Express has no deliberate trusted-client identity design. A successful login deletes this shared counter, also resetting the budget for unrelated accounts.',
         trigger=['Use two browsers through the documented Vite entry point.', 'Accumulate ten failures in browser A; attempt valid credentials in browser B before the minute ends.'],
         impact='Cross-account denial of sign-in. Before the limit is reached, successful credentials from one account can reset the shared guessing budget. Once blocked, success cannot clear it because the limit is checked first.',
         fix='Use independent per-account and trusted-client counters, plus an aggregate abuse limit. Configure only the actual trusted ingress; do not blindly trust arbitrary X-Forwarded-For headers. Success must not reset unrelated counters.',
         verify='Use an isolated two-client test. A failure budget for one account must not block another account; a successful login must not erase a different account’s failures.',
         missing='The routing/key path is confirmed. A live two-browser lockout was deliberately not induced against the current database.',
         refs=[('iots-app/backend/index.js',31,39),('iots-app/backend/index.js',56,56),('iots-app/frontend/vite.config.js',19,20)],
         excerpt=('iots-app/backend/index.js',31,36)),
    dict(id='AUTH-02', title='Sign-in transitions use stale state snapshots', severity='High', area='Session / evidence integrity', proof='Source-confirmed',
         summary='Location, confirmation and cancellation check an earlier session snapshot, then write by token without requiring the expected current stage. Concurrent requests can overwrite a later transition.',
         cause='Middleware loads req.session before the handler awaits database work. The subsequent UPDATE or DELETE does not compare the stored stage. Photo activation has a conditional transition; the preceding operations do not share that protection.',
         trigger=['Admit two location requests while the session is pending, then delay one write.', 'Advance the other request through photo activation; release the delayed location write. A similar interleaving applies to an already-admitted cancellation.'],
         impact='A session can be downgraded after activation or terminated by stale cancellation. The location shown later can diverge from the saved photo snapshot. A unique existing photo can make recovery impossible in that session.',
         fix='Use a transaction with a locked session/state row, or compare-and-swap predicates with affected-row checks. Version each location attempt and bind confirmation to that version. Include cancellation in the same state-transition protocol.',
         verify='Coordinate request barriers against an isolated DB or fake pool. After activation, an old location/confirm/cancel request must fail without changing stage, evidence or session existence.',
         missing='The missing predicates are confirmed. The race frequency and exact HTTP result require a controlled interleaving test; no live race was induced.',
         refs=[('iots-app/backend/index.js',62,64),('iots-app/backend/index.js',68,94),('iots-app/backend/index.js',109,114)],
         excerpt=('iots-app/backend/index.js',68,74)),
    dict(id='AUTH-03', title='A late checkout response can override location revocation', severity='Medium', area='Checkout / permissions', proof='Source-confirmed',
         summary='Revoking location clears checkout state, but a delayed confirmation can still enter the photo phase. Capturing then renders a summary that dereferences a null location.',
         cause='The revocation callback sets location to null and phase to location. confirm() later sets phase to photo unconditionally. The live ref only detects unmounting; it does not distinguish old attempts from current permission state.',
         trigger=['Reach an off-site checkout decision and select Continue checkout.', 'Revoke location while the confirmation response is delayed, then release a successful response and capture a photo.'],
         impact='The camera phase can reopen after revocation, followed by a render exception at location.latitude or location.status. A late location-check response can also reopen capture, even where it restores a non-null location.',
         fix='Invalidate the attempt generation on revocation and cancellation. Ignore stale responses after every await and require a current permission plus a validated non-null location before entering photo capture. Abort requests where practical.',
         verify='In an isolated UI harness, delay confirmation, revoke permission, then resolve it. The location gate must remain mounted; capture and upload must stay unavailable.',
         missing='The response ordering and null dereference are source-confirmed. A permission-race browser reproduction was not performed on the live app.',
         refs=[('iots-app/frontend/src/auth/checkout/CheckoutFlow.jsx',18,33),('iots-app/frontend/src/auth/checkout/CheckoutFlow.jsx',46,50),('iots-app/frontend/src/auth/PhotoEvidence.jsx',94,94)],
         excerpt=('iots-app/frontend/src/auth/checkout/CheckoutFlow.jsx',46,50)),
    dict(id='AUTH-04', title='Success animation can outlive revoked location permission', severity='Medium', area='Sign-in / asynchronous UI', proof='Source-confirmed',
         summary='The final sign-in transition checks location permission once, then continues through asynchronous delays and animation. Revocation during that interval does not stop the final dashboard callback.',
         cause='openWorkspace() checks locationAccess at entry, but only checks mounted before calling onAuthenticated. The revocation handler clears the gate without invalidating the in-flight success continuation.',
         trigger=['Complete punch-in photo submission successfully.', 'Revoke location during the two 650 ms delays or final 320 ms animation.'],
         impact='The UI can enter the workspace after the user revoked a required permission. Important: /auth/cancel rejects an already-active session with 409, so this sequence does not by itself prove an invalid session or server authorization bypass.',
         fix='Tie animation continuations to the same attempt generation as network requests. Invalidate and cancel them on permission loss, then recheck permission immediately before onAuthenticated. Define how to handle evidence already committed.',
         verify='Resolve photo success in a UI harness, revoke permission during the success delay, and assert that onAuthenticated is not called. Cover normal and reduced-motion timing.',
         missing='The asynchronous continuation is confirmed in source. The narrow timing window has not been exercised against real browser permission controls.',
         refs=[('iots-app/frontend/src/App.jsx',46,50),('iots-app/frontend/src/App.jsx',89,99),('iots-app/backend/index.js',91,95)],
         excerpt=('iots-app/frontend/src/App.jsx',89,94)),
    dict(id='AUTH-05', title='Expired punch-in capture stays on an unusable photo screen', severity='Medium', area='Sign-in / expiration recovery', proof='Source-confirmed',
         summary='Pending sign-in sessions expire after five minutes. The shared photo component can handle a 401 through a callback, but the sign-in caller does not provide that callback.',
         cause='PhotoEvidence has onSessionEnded handling for checkout. The sign-in instance passes onSaved and onCancel only, so a session-expired response becomes a text error without leaving photo capture.',
         trigger=['Verify credentials and location, then spend more than five minutes on the camera stage.', 'Capture and submit; retake and submit again.'],
         impact='Repeated uploads continue to fail because retaking a photo does not renew authentication. Cancel or page reload can recover, but the photo screen does not guide the user back to credentials.',
         fix='Provide an explicit sign-in expiration callback. Clear sensitive/photo/attempt state, return to credentials with an expiration explanation and restore useful keyboard focus. Do not silently renew an expired session.',
         verify='Return 401 from the sign-in photo endpoint in an isolated UI test. Assert that the photo view unmounts, the camera stops and the credentials screen explains that sign-in expired.',
         missing='No five-minute live waiting test was run. The server expiry condition and missing callback are confirmed directly in source.',
         refs=[('iots-app/backend/index.js',62,63),('iots-app/frontend/src/App.jsx',163,163),('iots-app/frontend/src/auth/PhotoEvidence.jsx',74,79)],
         excerpt=('iots-app/frontend/src/auth/PhotoEvidence.jsx',74,80)),
    dict(id='AUTH-06', title='A lost successful upload response leaves punch-in stranded', severity='Medium', area='Sign-in / network recovery', proof='Source-confirmed',
         summary='If the server commits a punch-in but its success response is lost, the client treats the upload as failed and remains at photo capture. Retrying conflicts with the server’s already-active session.',
         cause='The server activates and records evidence before responding. The client only handles the immediate fetch result; it neither reconciles with /auth/me after an ambiguous failure nor sends an idempotent capture identifier.',
         trigger=['Allow a punch-in upload to commit, then drop its response before the client receives the success body.', 'Try Use photo again, Retake, or Cancel sign-in without reloading.'],
         impact='The photo retry receives 409 because the session is active; cancellation also receives 409. The user can be stuck in the login interface while already authenticated. Reload is a workaround.',
         fix='Reconcile ambiguous upload outcomes through the authenticated session/evidence state. Alternatively use a capture idempotency key so an accepted retry returns the original result. Distinguish “not accepted” from “accepted but response unknown.”',
         verify='In a separate harness, commit the upload and drop only its response. A retry or reconciliation must converge on the existing workspace without a second evidence record.',
         missing='This is a source-confirmed recovery gap with a specific network-failure condition. No live response was interrupted and no evidence was created for this audit.',
         refs=[('iots-app/backend/index.js',109,124),('iots-app/backend/index.js',91,95),('iots-app/frontend/src/auth/PhotoEvidence.jsx',70,80)],
         excerpt=('iots-app/frontend/src/auth/PhotoEvidence.jsx',74,80)),
    dict(id='AUTH-07', title='Punch-in accepts a claimed capture before validation', severity='Medium', area='Evidence / chronological integrity', proof='Source-confirmed',
         summary='Punch-in validates only that X-Captured-At is within two minutes of now. It does not require the claimed capture time to follow credentials and location validation.',
         cause='The photo route checks recency but does not compare capture time with a server-side validated-stage timestamp. Checkout already performs an ordering check against checked_at; sign-in does not.',
         trigger=['Complete credentials and location checks in an isolated test.', 'Submit a valid JPEG with a claimed capture timestamp 30 seconds before those checks, but still within the two-minute freshness window.'],
         impact='The system can accept an evidence record whose own timestamp contradicts the required sequence. This finding concerns chronological validation, not proof that browser-supplied timestamps establish camera provenance.',
         fix='Persist a server-side location/capture challenge time and enforce capture ordering consistently. Keep server receipt time distinct from claimed client capture time, and account deliberately for limited client clock skew.',
         verify='Reject a timestamp before the validated stage while accepting an in-window timestamp after it. Apply equivalent rules to punch-in and punch-out.',
         missing='The missing comparison is confirmed in source; the proposed stale-capture request was not submitted to the live database.',
         refs=[('iots-app/backend/index.js',97,105),('iots-app/backend/checkout/routes.js',46,53)],
         excerpt=('iots-app/backend/index.js',98,105)),
    dict(id='AUTH-08', title='Password verification blocks the whole API event loop', severity='Medium', area='Performance / credentials', proof='Runtime observed',
         summary='Password verification calls synchronous scrypt inside the login handler. While it runs, the same Node process cannot service other event-loop work.',
         cause='passwords.js uses scryptSync for verify(), and the asynchronous Express handler calls verify directly. Declaring the route async does not make that synchronous computation non-blocking.',
         trigger=['Schedule a zero-delay timer in an isolated Node process using the existing password module.', 'Generate one in-memory hash and perform 20 verifies consecutively; inspect elapsed time and timer state.'],
         impact='The measured batch took 843 ms, and the zero-delay timer had not fired at the end. Concurrent credential bursts can delay session reads, location and checkout operations. This was a local measurement, not an i3 benchmark.',
         fix='Use asynchronous crypto.scrypt with bounded work concurrency and retain the constant-time comparison. Combine this with correctly scoped abuse limits so the worker pool is not overwhelmed.',
         verify='Run a concurrent authentication/read benchmark on an isolated service. Session and checkout latency should remain responsive while verification is queued.',
         missing='The event-loop stall was reproduced without DB access. End-to-end load and physical low-end hardware measurements remain outstanding.',
         refs=[('iots-app/backend/passwords.js',1,11),('iots-app/backend/index.js',35,36)],
         excerpt=('iots-app/backend/passwords.js',6,11)),
    dict(id='AUTH-09', title='A blocked styling CDN breaks the login layout', severity='Medium', area='Availability / frontend delivery', proof='Runtime observed',
         summary='The authentication entry point depends on a blocking external Tailwind runtime. When that URL is blocked, the page raises an error and utility styling is unavailable.',
         cause='index.html downloads cdn.tailwindcss.com and immediately assigns tailwind.config. Tailwind is not compiled into the local build, so serving the project locally does not remove this external dependency.',
         trigger=['Block https://cdn.tailwindcss.com in a fresh browser context.', 'Load the normal local login page and allow the non-mutating initial location reading.'],
         impact='The browser reported “tailwind is not defined.” At the same 1440 px viewport, the username input width changed from 382 px to 177 px. Utility-based layout, responsive and dark variants lose their expected styling.',
         fix='Compile a pinned Tailwind version and existing brand tokens into bundled CSS. Preserve the current palette, layout and requested animations; eliminate the runtime CDN/config dependency.',
         verify='With external CDN access blocked, load the built page and assert no page errors and equivalent login/gate geometry in both themes and mobile/desktop sizes.',
         missing='The blocked-CDN failure was reproduced in Edge. A production deployment and office network configuration were not audited.',
         refs=[('iots-app/frontend/index.html',12,17),('iots-app/frontend/package.json',1,25)],
         excerpt=('iots-app/frontend/index.html',13,17)),
    dict(id='AUTH-10', title='Visual modal overlays do not behave as keyboard dialogs', severity='Medium', area='Accessibility / account recovery', proof='Runtime observed',
         summary='Recovery and empty-credential overlays are generic divs without modal semantics or protected focus. The recovery overlay was verified to leave keyboard access on obscured controls.',
         cause='The overlays lack a dialog primitive, accessible modal/title relationship, initial focus placement, focus containment and Escape handling. Empty-credential close code restores focus, but that does not provide modal behavior while open.',
         trigger=['Open Recovery Process from the login page.', 'Press Tab repeatedly and then Escape; inspect the focus target and accessible dialog role.'],
         impact='Observed: zero dialog roles; focus remained on Recovery Process after opening. Tab reached the obscured Login button, then later the theme button and username field. Escape left Access Recovery visible.',
         fix='Use native dialog.showModal() or an accessible dialog primitive with labelled title/description, deliberate initial focus, Escape handling and opener focus restoration. Keep the existing visual identity.',
         verify='Test Tab and Shift+Tab containment, Escape, close-button focus return and screen-reader announcement for both overlays. No credentials need to be submitted.',
         missing='Recovery keyboard behavior was reproduced. Empty-credentials semantics are source-confirmed; a full screen-reader run is still needed.',
         refs=[('iots-app/frontend/src/components/modals/HelpModal.jsx',8,35),('iots-app/frontend/src/components/modals/EmptyCredsModal.jsx',8,42)],
         excerpt=('iots-app/frontend/src/components/modals/HelpModal.jsx',8,14)),
    dict(id='AUTH-11', title='Reduced motion does not stop the moving shader', severity='Medium', area='Accessibility / low-end rendering', proof='Source-confirmed',
         summary='The restored WebGL background continuously advances time and requests frames even when the user enables reduced motion. The CSS preference rule cannot stop that JavaScript loop.',
         cause='The shader render function has no matchMedia check or visibility gate. Existing reduced-motion CSS disables selected CSS effects, but it does not control the canvas animation.',
         trigger=['Enable the operating system or browser reduced-motion preference.', 'Open the login page; the render loop still updates u_time and schedules requestAnimationFrame unconditionally.'],
         impact='Users who requested reduced motion still receive moving background material and continuous GPU work. The actual hardware cost was not measured in this audit.',
         fix='Keep the requested normal animation. For reduced-motion users, render a static frame and respond only to resize/theme changes. Pause animation while hidden; add an optional measured low-power strategy without changing the normal design.',
         verify='In an isolated rendering test, enable reduced motion and assert that shader time stops advancing after the initial frame. Repeat theme/resize and hidden-tab checks.',
         missing='The unconditional loop is confirmed in source. No frame instrumentation, GPU trace or physical low-end hardware test was added or run.',
         refs=[('iots-app/frontend/src/components/SimplexNoiseBackground.jsx',170,179),('iots-app/frontend/src/index.css',102,111)],
         excerpt=('iots-app/frontend/src/components/SimplexNoiseBackground.jsx',174,179)),
    dict(id='AUTH-12', title='The title test can pass without different punch titles', severity='Low', area='Test coverage / evidence labels', proof='Source-confirmed',
         summary='The punch-out test compares its image buffer against a punch-in buffer made with a different employee name. The comparison does not isolate the title-kind behavior.',
         cause='assert.notDeepEqual is applied to images whose employee fields already differ. A regression that renders the same title for both kinds can still produce different buffers and pass.',
         trigger=['Imagine removing the checkout-kind branch from the title renderer.', 'The two fixtures still contain different names, so the buffer inequality can remain true.'],
         impact='The suite can report success while missing a regression in the user-requested Punch-in/Punch-out labels. This is a confirmed test weakness, not evidence that current image titles are wrong.',
         fix='Use the identical source image, employee and details for both fixtures, varying only kind. Add a semantic title assertion in the stamp builder and a rendered review/golden that checks both titles.',
         verify='Deliberately replace the checkout title with the punch-in title in an isolated test fixture; the regression test must fail. Do not modify the live renderer to prove this audit finding.',
         missing='The confounded fixture is visible in source. No mutation test or source edit was performed.',
         refs=[('iots-app/backend/test-photos.js',20,30),('iots-app/backend/photos.js',42,42)],
         excerpt=('iots-app/backend/test-photos.js',26,30)),
]

def text(value):
    return H(value)

def source_code(finding):
    file, start, end = finding['excerpt']
    lines = (ROOT / file).read_text(encoding='utf-8').splitlines()
    selected = lines[start - 1:end]
    # Long JSX/SQL lines are represented by their relevant boundary, not tiny type.
    selected = [line if len(line) <= 84 else line[:81] + '...' for line in selected]
    return '\n'.join(f'{start + i:>3}  {line}' for i, line in enumerate(selected))

def refs(finding):
    return ''.join(f'<div>{text(file)}:{start}' + (f'–{end}' if end != start else '') + '</div>' for file, start, end in finding['refs'])

logo = base64.b64encode((ROOT / 'iots-app/frontend/src/assets/logo.png').read_bytes()).decode()
def page(title, body, cls=''):
    return f'''<section class="page {cls}"><header class="running"><span>CIRIL · Internal operations</span><span>Authentication review · Draft</span></header><h1>{title}</h1>{body}</section>'''

css = '''
@page{size:A4;margin:15mm 16mm 18mm}*{box-sizing:border-box}html{background:#ebe9e2}body{margin:0;color:#202830;font-family:"Segoe UI",Arial,sans-serif;font-size:14px;line-height:1.5;-webkit-print-color-adjust:exact;print-color-adjust:exact}.page{width:178mm;height:262mm;margin:0 auto 18px;padding:0;background:#fff;break-after:page;position:relative}.page:last-child{break-after:auto}.running{display:flex;justify-content:space-between;align-items:center;height:12mm;border-bottom:1px solid #d8d4ca;color:#555b5c;font-size:12px;letter-spacing:.015em;margin-bottom:7mm}h1{font-size:30px;font-weight:600;line-height:1.16;letter-spacing:-.025em;margin:0 0 6mm;max-width:31ch}h2{font-size:18px;line-height:1.3;letter-spacing:-.015em;margin:7mm 0 3mm;font-weight:600}h3{font-size:13px;line-height:1.35;margin:0 0 2mm;font-weight:700}p{margin:0 0 3.5mm}a{color:#674a24;text-underline-offset:3px}strong{font-weight:650}.lede{font-size:17px;line-height:1.5;max-width:68ch}.muted{color:#555b5c}.small{font-size:12px;line-height:1.5}.cols{display:grid;grid-template-columns:1fr 1fr;gap:7mm}.cols>div{min-width:0}ul,ol{padding-left:5mm;margin:0 0 4mm}li{padding-left:1mm;margin:0 0 2mm}table{width:100%;border-collapse:collapse;font-size:12px;line-height:1.4}th{text-align:left;font-weight:650;color:#555b5c;padding:3mm 2mm;border-bottom:1px solid #aca492}td{padding:3mm 2mm;border-bottom:1px solid #dfdcd4;vertical-align:top}td:first-child,th:first-child{padding-left:0}.status{display:inline-block;font-size:12px;line-height:1.2;padding:4px 7px;border-radius:4px;border:1px solid #c2beb3;background:#f4f2eb;color:#414947;white-space:nowrap}.status.high{color:#87362d;border-color:#bd7468;background:#fbefeb}.status.medium{color:#72501f;border-color:#bf9a64;background:#faf3e8}.status.low{color:#35565f;border-color:#8da8af;background:#f0f5f5}.meta{display:flex;gap:9px;align-items:center;flex-wrap:wrap;font-size:12px;color:#555b5c;margin-bottom:5mm}.finding h1{font-size:27px;margin-bottom:4mm;max-width:35ch}.finding .lede{font-size:15px}.finding h2{font-size:15px;margin-top:5mm}.finding p,.finding li{font-size:13px;line-height:1.5}.finding .cols p{margin:0;font-size:12.8px;line-height:1.45}.finding .cols h2{margin-top:4mm}.evidence{margin-top:5mm;border-top:1px solid #c7c0b0;padding-top:3mm}.evidence h3{margin-bottom:2mm}.refs{font-family:Consolas,monospace;font-size:9.5px;line-height:1.55;overflow-wrap:anywhere;color:#555b5c;margin-bottom:2mm}pre{font-family:Consolas,monospace;font-size:12px;line-height:1.4;white-space:pre-wrap;overflow-wrap:anywhere;margin:0;padding:3mm;background:#f3f2ee;color:#263238;border-radius:4px}.proof-note{font-size:12px!important;color:#555b5c;border-top:1px solid #dfdcd4;padding-top:3mm;margin-top:4mm}.cover .running{margin-bottom:20mm}.brand-image{width:58mm;height:20mm;object-fit:contain;object-position:left;display:block;margin-bottom:12mm}.cover h1{font-size:47px;line-height:1.06;max-width:12ch;letter-spacing:-.03em;margin-bottom:8mm}.cover .subtitle{font-size:23px;line-height:1.35;max-width:25ch;margin-bottom:10mm}.cover-rule{height:2px;width:40mm;background:#98723e;margin:9mm 0}.cover-info{margin-top:15mm;border-top:1px solid #c7c0b0;padding-top:5mm}.cover-bottom{position:absolute;bottom:9mm;left:0;right:0;font-size:12px;color:#555b5c}.decision{padding:5mm 0;border-top:1px solid #c7c0b0}.decision strong{display:block;font-size:16px;margin-bottom:2mm}.flow{display:grid;grid-template-columns:1fr 8mm 1fr 8mm 1fr;align-items:center;gap:1mm;margin:5mm 0}.flow>div{border:1px solid #c7c0b0;border-radius:5px;padding:4mm 3mm;font-size:12px;min-height:25mm}.flow .arrow{border:0;min-height:0;padding:0;text-align:center;font-size:20px;color:#98723e}.flow small{display:block;margin-top:2mm;color:#555b5c}.note{border-top:1px solid #98723e;padding-top:4mm;margin-top:6mm}.capture{display:block;width:100%;height:70mm;object-fit:contain;object-position:center;border:1px solid #dedbd3;background:#f3f2ee}.caption{font-size:12px;color:#555b5c;margin:2mm 0 6mm}.register td{padding-top:2.6mm;padding-bottom:2.6mm}.register .title-cell{width:61%}.inventory td{font-size:12px;overflow-wrap:anywhere;padding:2.3mm 1mm}.toc-row{display:flex;justify-content:space-between;border-bottom:1px solid #dfdcd4;padding:3mm 0}.cover-summary{font-size:15px;line-height:1.6;max-width:65ch}.timeline-row{display:grid;grid-template-columns:28mm 1fr;gap:5mm;padding:5mm 0;border-top:1px solid #c7c0b0}.timeline-row strong{font-size:15px}.timeline-row p{margin-bottom:2mm}.footer-note{font-size:12px;color:#555b5c;margin-top:6mm}@media screen{body{padding:22px}.page{padding:0 0;box-shadow:0 4px 18px #20283015}header.running{padding-left:0} }@media print{html,body{background:#fff}.page{margin:0;box-shadow:none}a{text-decoration:none}}
'''

pages = []
pages.append(page('Authentication<br>review', f'''
<img class="brand-image" src="data:image/png;base64,{logo}" alt="CIRIL">
<p class="subtitle">Bugs, causes and a practical resolution plan.</p>
<div class="cover-rule"></div>
<p class="cover-summary">A diagnosis-first review of the authentication built so far: credentials, location permissions, punch-in evidence, sessions, role workspaces, punch-out and shared themes.</p>
<div class="cover-info"><p><strong>20 October 2026</strong> · Current working tree</p><p>12 findings: <strong>2 high</strong>, <strong>9 medium</strong>, <strong>1 low</strong>.</p><p class="muted">Three findings have runtime observations. Nine are confirmed code-path or test-contract findings whose failure scenarios still need focused reproduction.</p></div>
<div class="cover-bottom"><strong>Read-only audit · No application fixes applied</strong><br>Prepared using four Bug Hunt Swarm investigation roles and Impeccable’s Read-mode design principles. This draft is not a certification of production security.</div>
''', 'cover'))

pages.append(page('What to address first', '''
<p class="lede">The leading integrity risk is stale authentication state. The leading shared-availability risk is the proxy-wide login counter.</p>
<div class="decision"><strong>Make state changes atomic — AUTH-02</strong><p>Backend stage checks and updates are separated by awaits. Old requests can overwrite new state. Define one authoritative transition protocol before adding more authentication steps.</p></div>
<div class="decision"><strong>Isolate login failure budgets — AUTH-01</strong><p>The proxy collapses browser identities into a shared IP bucket. One employee’s mistakes should not temporarily lock out the whole office.</p></div>
<div class="decision"><strong>Make asynchronous UI recoverable — AUTH-03 to AUTH-06</strong><p>Permission changes, expiration and lost responses must invalidate or reconcile the current attempt. Animation should reflect validated state, never determine it.</p></div>
<h2>What was observed directly</h2><ul><li>Twenty password verifications blocked a zero-delay timer for a measured <strong>843 ms</strong>.</li><li>Blocking the Tailwind CDN produced <strong>“tailwind is not defined”</strong> and changed login input geometry.</li><li>Recovery allowed Tab to reach obscured login controls; Escape did not close it.</li></ul>
<h2>What is already sound in the reviewed paths</h2><p>Parameterized SQL, hashed session tokens, HttpOnly/SameSite cookies, role checks, owner-scoped photo delivery, image decoding and checkout duplicate protection are present. WebP extension/encoder contracts are consistent. These observations are not a claim that every edge case is secure.</p>
<p class="footer-note">Severity expresses likely impact in this application. “Source-confirmed” identifies an inspectable defect; it does not mean the scenario was reproduced against the live database.</p>
'''))

pages.append(page('The flow under review', '''
<p class="lede">The authentication boundary and the attendance evidence boundary overlap. Keeping their state explicit is the common fix across several findings.</p>
<h2>Punch-in</h2><div class="flow"><div>Location permission<small>Fresh browser reading opens credentials</small></div><span class="arrow">→</span><div>Credentials verified<small>Pending session, five-minute window</small></div><span class="arrow">→</span><div>Location assessed<small>50 m radius; exception decision if needed</small></div></div>
<div class="flow"><div>Camera capture<small>Required JPEG submission</small></div><span class="arrow">→</span><div>Evidence committed<small>WebP + MySQL metadata</small></div><span class="arrow">→</span><div>Active workspace<small>Assigned role; eight-hour cookie lifetime</small></div></div>
<h2>Punch-out</h2><div class="flow"><div>Log out selected<small>Active session retained during capture</small></div><span class="arrow">→</span><div>Fresh location + photo<small>Off-site/unknown needs confirmation</small></div><span class="arrow">→</span><div>Commit and revoke<small>Linked checkout record; delete session</small></div></div>
<h2>Trust and persistence</h2><div class="cols"><div><h3>Browser-supplied facts</h3><p>Coordinates, GPS accuracy, claimed capture time and image bytes originate in the client. Permission UI is a workflow control; it is not proof of physical presence.</p></div><div><h3>Server-enforced facts</h3><p>Credentials, assigned role, stage eligibility, ownership, receipt time, file encoding and record linkage can be enforced independently by the server.</p></div></div>
<div class="note"><p><strong>Required invariant:</strong> only the current valid attempt may advance a stage. Permission loss, expiry, cancellation and a changed session must invalidate old continuations.</p></div>
'''))

rows = ''.join(f'<tr><td><a href="#{f["id"]}">{f["id"]}</a></td><td class="title-cell">{text(f["title"])}</td><td><span class="status {f["severity"].lower()}">{f["severity"]}</span></td><td>{"Observed" if f["proof"] == "Runtime observed" else "Source"}</td></tr>' for f in findings)
pages.append(page('Finding register', f'''<p>Use the IDs to connect each finding to its cause, proof limit, recommendation and acceptance check on the following pages.</p><table class="register"><thead><tr><th>ID</th><th>Finding</th><th>Severity</th><th>Evidence</th></tr></thead><tbody>{rows}</tbody></table><div class="note small"><strong>High:</strong> shared availability or session/evidence integrity. <strong>Medium:</strong> a concrete blocked flow, recovery, accessibility or verification issue. <strong>Low:</strong> a regression-test blind spot. Documented product limits are listed separately and are excluded from these totals.</div>'''))

for f in findings:
    trigger = ''.join('<li>' + text(step) + '</li>' for step in f['trigger'])
    body = f'''<div id="{f['id']}" class="meta"><span class="status {f['severity'].lower()}">{f['severity']}</span><strong>{f['id']}</strong><span>{text(f['area'])}</span><span>· {f['proof']}</span></div>
<p class="lede">{text(f['summary'])}</p>
<h2>Trigger and expected boundary</h2><ol>{trigger}</ol>
<div class="cols"><div><h2>What causes it</h2><p>{text(f['cause'])}</p><h2>Why it matters</h2><p>{text(f['impact'])}</p></div><div><h2>Recommended resolution</h2><p>{text(f['fix'])}</p><h2>Acceptance check</h2><p>{text(f['verify'])}</p></div></div>
<div class="evidence"><h3>Source evidence</h3><div class="refs">{refs(f)}</div><pre>{text(source_code(f))}</pre></div>
<p class="proof-note"><strong>Evidence assessment (high code-path confidence).</strong> {text(f['missing'])} Excerpts shorten long lines with “...”; the referenced source is authoritative.</p>'''
    pages.append(page(text(f['title']), body, 'finding'))

pages.append(page('Browser evidence', '''
<h2>AUTH-09 · Tailwind CDN blocked</h2><img class="capture" src="assets/tailwind-blocked.png" alt="Login rendering after blocking the Tailwind CDN"><p class="caption">Edge, 1440 × 1000. Observed page error: “tailwind is not defined”. Username input width: 177 px, versus 382 px with the CDN available. The browser did not submit credentials.</p>
<h2>AUTH-10 · Recovery keyboard boundary</h2><img class="capture" src="assets/recovery-keyboard.png" alt="Recovery overlay remained open after Escape"><p class="caption">Escape left Access Recovery visible. Tab sequence included Login behind the overlay, Understood!, body, Light and the username input. No element had the dialog role.</p>
<p class="small muted">Full-resolution captures and the structured observation log are included in the report folder. These are UI screenshots, not employee evidence photos.</p>
'''))

pages.append(page('Documented limits and product decisions', '''
<p class="lede">These limits are real, but they are not counted as newly discovered authentication defects.</p>
<h2>Attendance lifetime is tied to authentication lifetime</h2><p>The eight-hour session expires before checkout can proceed. Starting another login can also replace the old session without punch-out. AUTH_SETUP.md explicitly documents both cases. If a shift can exceed eight hours, separate an open attendance shift from the authentication session and support authenticated recovery of that shift. Flag missing punch-outs; never invent physical evidence.</p>
<h2>Logout requires location and camera</h2><p>This is the requested current workflow. It can prevent normal session revocation when hardware or permissions are unavailable. Decide whether an emergency “end session without punch-out” action is needed, recording the exception rather than fabricating attendance.</p>
<h2>Evidence is not facial verification or trusted GPS</h2><p>A decoded JPEG can be uploaded by a custom client, and claimed coordinates/time can be changed. The current implementation collects evidence. Requiring a face, proving camera provenance, detecting spoofed location or introducing biometrics would be additional requirements, not simple fixes for the reported bugs.</p>
<h2>Development and storage boundaries</h2><ul><li>Development cookies and origin rules are configured for local HTTP. HTTPS/proxy/secrets policy needs a deployment-specific review before production.</li><li>The Creative Associate entry point contains sample data and is not an authenticated employee-data dashboard. Guard it before connecting real records or exclude it from deployment.</li><li>WebP uses a soft byte target with a quality floor. Larger detailed images are expected; retention, backups and quotas remain operational decisions.</li><li>The backend currently reads the logo from the frontend source tree. Package that asset explicitly for a backend-only deployment.</li></ul>
'''))

pages.append(page('Validation and remaining proof', '''
<p>All executed tests below were read-only with respect to authentication records and evidence storage.</p>
<table><thead><tr><th>Check</th><th>Result</th><th>What it establishes</th></tr></thead><tbody>
<tr><td>test-identity.js</td><td>Pass</td><td>Username/email alias rules and foreign-domain rejection.</td></tr><tr><td>test-location.js</td><td>Pass</td><td>Distance boundaries, uncertainty and invalid/stale coordinate handling.</td></tr><tr><td>test-photos.js</td><td>Pass</td><td>Decode rules, WebP dimensions and date formatting. Title-specific coverage remains weak: AUTH-12.</td></tr><tr><td>evidence/test-encode.js</td><td>Pass</td><td>Compression paths, dimensions, soft target and metadata removal.</td></tr><tr><td>theme/useTheme.test.cjs</td><td>Pass</td><td>Persistence, cross-tab handling and blocked-storage fallback.</td></tr><tr><td>In-memory scrypt proof</td><td>Observed</td><td>20 verifies; 843 ms elapsed; zero-delay timer had not executed.</td></tr><tr><td>Blocked-CDN browser load</td><td>Defect observed</td><td>ReferenceError plus changed login geometry.</td></tr><tr><td>Recovery keyboard traversal</td><td>Defect observed</td><td>Focus escapes overlay; no dialog role; Escape does not close.</td></tr></tbody></table>
<h2>Intentionally not executed</h2><p>test-auth.js and checkout/test-checkout.js create persistent synthetic evidence. They were not run in this audit. No credentials were submitted; no API POST was issued by the audit browser. Database access was SELECT-only.</p>
<h2>Next proof matrix</h2><p>Use a disposable database and fixture directory for: two-client lockouts; controlled sign-in request races; permission revocation during delayed responses; expired photo sessions; lost successful upload responses; capture-time ordering; and an unchanged-fixture punch-title mutation test.</p>
'''))

pages.append(page('Resolution sequence', '''
<p class="lede">Prove each fix with its failure case before broadening the change. Keep the requested colors, normal animations and evidence fields intact.</p>
<div class="timeline-row"><strong>Prove now</strong><div><p><strong>AUTH-01, AUTH-02, AUTH-03</strong></p><p>Build a disposable test harness for independent login counters, server transition interleavings and late responses after permission loss. These isolate the highest-impact shared mechanisms.</p></div></div>
<div class="timeline-row"><strong>Fix next</strong><div><p><strong>AUTH-01 to AUTH-07</strong></p><p>Implement atomic server state changes, attempt invalidation in the client, deliberate expiration callbacks and upload-result reconciliation. Add capture ordering after the validated stage.</p></div></div>
<div class="timeline-row"><strong>Harden delivery</strong><div><p><strong>AUTH-08 to AUTH-11</strong></p><p>Move password derivation off the event loop, bundle styling locally, replace visual overlays with accessible dialogs and honor reduced motion in the canvas loop.</p></div></div>
<div class="timeline-row"><strong>Lock coverage</strong><div><p><strong>AUTH-12 + the full proof matrix</strong></p><p>Use identical image fixtures for title comparison. Keep all mutating auth integration tests isolated from manual-test data and clean their fixtures deterministically.</p></div></div>
<h2>Product decisions to settle separately</h2><p>Define open-shift recovery after expiry/new login, emergency session revocation, evidence retention and production deployment controls. These decisions should not be smuggled into a small authentication bug fix.</p>
<div class="note"><strong>Release gate:</strong> high-priority integrity/availability cases pass in isolation, recovery cases converge correctly, modal keyboard tests pass, and production configuration receives its own review.</div>
'''))

source_files = sorted({file for finding in findings for file, _, _ in finding['refs']} | {
    'iots-app/backend/AUTH_SETUP.md', 'iots-app/backend/schema.sql', 'iots-app/backend/photos.js',
    'iots-app/backend/evidence/encode.js', 'iots-app/frontend/src/auth/AuthApp.jsx',
    'iots-app/frontend/src/auth/LocationPermissionGate.jsx', 'iots-app/frontend/src/theme/useTheme.js',
})
manifest = [{'path': file, 'sha256': hashlib.sha256((ROOT / file).read_bytes()).hexdigest()} for file in source_files]
commit = subprocess.check_output(['git', '-c', f'safe.directory={ROOT.as_posix()}', 'rev-parse', 'HEAD'], cwd=ROOT, text=True).strip()
pages.append(page('Scope, confidence and handover', f'''
<h2>Snapshot</h2><p>Review date: <strong>20 October 2026</strong> (Asia/Kolkata). Baseline commit: <code>{commit[:12]}</code>. The reviewed implementation also contains uncommitted and untracked changes; this is a working-tree review, not a commit-only review. Exact file hashes are supplied in source-manifest.json.</p>
<h2>Four investigation roles</h2><p>Reproduction/scope, code-path seams, regression/contracts and proof/observability independently examined the implementation. Their findings were merged, duplicate issues removed and unsupported claims narrowed. In particular, the active-session cancellation guard was accounted for in AUTH-04.</p>
<h2>Confidence and exclusions</h2><p>Code-path findings identify a specific missing invariant or contract, with an acceptance test. Only AUTH-08, AUTH-09 and AUTH-10 have new runtime observations in this review. No race, forged evidence upload or five-minute session expiry was induced against the live database.</p><p>No real camera, live employee photo, facial verification, office GPS accuracy, physical i3 machine, production host, backup recovery or penetration test was assessed. No fixes were applied. Passing existing tests does not exclude the newly identified edge cases.</p>
<h2>Files included</h2><table class="inventory"><tbody><tr><td>authentication-audit.pdf</td><td>Designed PDF draft.</td></tr><tr><td>authentication-audit.html</td><td>Printable, editable report with internal finding links.</td></tr><tr><td>findings.json</td><td>Structured findings and recommendations.</td></tr><tr><td>browser-evidence.json + assets/</td><td>Read-only runtime observations and UI captures.</td></tr><tr><td>source-manifest.json</td><td>Reviewed source paths and SHA-256 snapshot hashes.</td></tr><tr><td>build_report.py</td><td>Source for regenerating the report HTML/content.</td></tr></tbody></table>
<p class="footer-note">This report intentionally excludes development passwords, cookie values and employee evidence images. The existing evidence data was preserved.</p>
'''))

document = f'<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>CIRIL Authentication Review — 20 October 2026</title><style>{css}</style></head><body>' + ''.join(pages) + '</body></html>'
(OUT / 'authentication-audit.html').write_text(document, encoding='utf-8')
(OUT / 'findings.json').write_text(json.dumps(findings, indent=2, ensure_ascii=False), encoding='utf-8')
(OUT / 'source-manifest.json').write_text(json.dumps({'baselineCommit': commit, 'workingTreeReview': True, 'files': manifest}, indent=2), encoding='utf-8')
print(json.dumps({'pages': len(pages), 'findings': len(findings), 'baselineCommit': commit}))

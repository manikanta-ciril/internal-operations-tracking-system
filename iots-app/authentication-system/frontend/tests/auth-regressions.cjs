const assert = require('node:assert/strict');
const { chromium } = require('playwright');
if (!process.env.IOTS_TEST_BASE_URL || process.env.DB_NAME !== 'iots_auth_fix_test') throw new Error('Use backend npm run test:auth.');
const origin = process.env.IOTS_TEST_UI_URL || 'http://localhost:5174';
const deferred = () => { let resolve; const promise = new Promise(done => { resolve = done; }); return { promise, resolve }; };

(async () => {
  const browser = await chromium.launch({ ...(process.platform === 'win32' ? { channel: 'msedge' } : {}), headless: true,
    args: ['--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream'] });
  const contexts = [];
  async function setup(normalMotion = false) {
    const context = await browser.newContext({ viewport: { width: 1440, height: 800 }, reducedMotion: normalMotion ? 'no-preference' : 'reduce',
      permissions: ['geolocation', 'camera'], geolocation: { latitude: 17.430361111, longitude: 78.456638889, accuracy: 1 } });
    contexts.push(context);
    await context.addInitScript(() => {
      const query = navigator.permissions.query.bind(navigator.permissions);
      const geo = new EventTarget(); geo.state = 'granted';
      navigator.permissions.query = request => request.name === 'geolocation' ? Promise.resolve(geo) : query(request);
      let hidden = false;
      Object.defineProperty(document, 'hidden', { configurable: true, get: () => hidden });
      window.__authTest = { draws: 0, revoke() { geo.state = 'denied'; geo.dispatchEvent(new Event('change')); }, hide(value) { hidden = value; document.dispatchEvent(new Event('visibilitychange')); } };
      const draw = WebGLRenderingContext.prototype.drawArrays;
      WebGLRenderingContext.prototype.drawArrays = function (...args) { window.__authTest.draws++; return draw.apply(this, args); };


    });
    const state = { pageErrors: [] };
    await context.route('**/*', async route => {
      const request = route.request(); const url = new URL(request.url());
      if (url.host === 'cdn.tailwindcss.com') return route.abort();
      if (!url.pathname.startsWith('/api/auth/')) return route.continue();
      if (url.pathname.endsWith('/photo') && state.expirePhoto) return route.fulfill({ status: 401, json: { message: 'Your session has ended. Please sign in.' } });
      if (url.pathname.endsWith('/checkout/photo') && state.expireLocation) return route.fulfill({ status: 409, json: { message: 'Obtain a new punch-out location reading.' } });
      const response = await route.fetch({ url: process.env.IOTS_TEST_BASE_URL + url.pathname.slice('/api/auth/'.length) });
      if (url.pathname.endsWith('/checkout/confirm') && state.holdConfirm) { state.confirmSeen.resolve(); await state.releaseConfirm.promise; }
      if (url.pathname.endsWith('/auth/photo') && state.dropAcknowledgement && response.ok()) { state.dropAcknowledgement = false; return route.abort(); }
      return route.fulfill({ response });
    });
    const page = await context.newPage();
    page.on('pageerror', error => state.pageErrors.push(error.message));
    await page.goto(origin);
    await page.getByRole('button', { name: 'Sign in', exact: true }).waitFor();
    return { page, context, state };
  }
  async function credentials(page) {
    await page.getByLabel('Username or email', { exact: true }).fill('vijay@ciril.in');
    await page.getByLabel('Password', { exact: true }).fill('Iots@123');
    await page.getByRole('button', { name: 'Sign in', exact: true }).click();
    await page.getByRole('button', { name: 'Allow camera', exact: true }).waitFor({ timeout: 15000 });
  }
  async function capture(page) {
    await page.getByRole('button', { name: 'Allow camera', exact: true }).click();
    await page.getByRole('button', { name: 'Take photo', exact: true }).click();
  }
  async function signIn(page) {
    await credentials(page); await capture(page);
    await page.getByRole('button', { name: 'Use photo & continue', exact: true }).click();
    await page.getByRole('button', { name: 'Log out', exact: true }).waitFor({ timeout: 15000 });
  }
  try {
    const base = await setup();
    assert.ok(await base.page.locator('#input-username').evaluate(element => element.getBoundingClientRect().width) > 350, 'Bundled styles must survive blocked CDN access.');
    await base.page.getByRole('button', { name: 'Forgot password?', exact: true }).click();
    assert.equal(await base.page.getByRole('dialog', { name: 'Forgot your password?' }).count(), 1);
    for (let n = 0; n < 5; n++) { await base.page.keyboard.press('Tab'); assert.equal(await base.page.evaluate(() => document.activeElement.closest('dialog') !== null), true); }
    await base.page.keyboard.press('Escape');
    assert.equal(await base.page.getByRole('dialog').count(), 0);
    assert.equal(await base.page.getByRole('button', { name: 'Forgot password?', exact: true }).evaluate(element => element === document.activeElement), true);
    await base.page.getByRole('button', { name: 'Sign in', exact: true }).click();
    await base.page.getByRole('dialog', { name: 'Credentials Required' }).waitFor();
    const emptyDialog = base.page.getByRole('dialog', { name: 'Credentials Required' });
    assert.equal(await emptyDialog.evaluate(element => element.scrollWidth <= element.clientWidth), true, 'Empty-credentials dialog must not overflow horizontally.');
    await base.page.getByRole('button', { name: 'Understood', exact: true }).click();
    assert.equal(await base.page.getByRole('dialog').count(), 0);
    await base.page.getByRole('button', { name: 'Sign in', exact: true }).click();
    await emptyDialog.waitFor();
    await base.page.keyboard.press('Escape');
    assert.equal(await base.page.getByRole('dialog').count(), 0);
    await base.page.waitForTimeout(150);
    const initial = await base.page.evaluate(() => window.__authTest.draws); assert.ok(initial > 0);
    await base.page.waitForTimeout(200); assert.equal(await base.page.evaluate(() => window.__authTest.draws), initial, 'Reduced motion must stop the shader loop.');
    await base.page.getByRole('button', { name: 'Switch to dark mode' }).click();
    assert.ok(await base.page.evaluate(() => window.__authTest.draws) > initial, 'Static shader must redraw for theme changes.');
    await base.page.emulateMedia({ reducedMotion: 'no-preference' }); await base.page.waitForTimeout(150);
    const moving = await base.page.evaluate(() => window.__authTest.draws);
    await base.page.waitForTimeout(150); assert.ok(await base.page.evaluate(() => window.__authTest.draws) > moving, 'Normal animation must be retained.');
    await base.page.evaluate(() => window.__authTest.hide(true)); const stopped = await base.page.evaluate(() => window.__authTest.draws);
    await base.page.waitForTimeout(150); assert.equal(await base.page.evaluate(() => window.__authTest.draws), stopped);
    assert.deepEqual(base.state.pageErrors, []);
    await base.context.close();
    console.log('PASS: AUTH-09/10/11 bundled styling, modal focus/Escape, reduced/normal motion and hidden rendering.');

    const onsite = await setup();
    const punchInResponse = onsite.page.waitForResponse(response => new URL(response.url()).pathname === '/api/auth/location');
    await credentials(onsite.page);
    const punchInLocation = await (await punchInResponse).json();
    assert.equal(punchInLocation.location.status, 'onsite');
    assert.equal(punchInLocation.requiresPhoto, true);
    assert.equal(punchInLocation.requiresConfirmation, undefined);
    assert.equal(punchInLocation.location.distanceMeters, 0);
    assert.equal(punchInLocation.location.radiusMeters, 75);
    assert.equal('accuracyMeters' in punchInLocation.location, false);
    await onsite.page.screenshot({ path: require('node:path').resolve(__dirname, '../../../../.local/onsite-punch-in.png'), fullPage: true });
    await capture(onsite.page);
    await onsite.page.getByRole('button', { name: 'Use photo & continue', exact: true }).click();
    await onsite.page.getByRole('button', { name: 'Log out', exact: true }).waitFor();
    // A second position about 25 metres north remains comfortably inside the radius.
    await onsite.context.setGeolocation({ latitude: 17.4305859415, longitude: 78.4566388889, accuracy: 1 });
    const punchOutResponse = onsite.page.waitForResponse(response => new URL(response.url()).pathname === '/api/auth/checkout/location');
    await onsite.page.getByRole('button', { name: 'Log out', exact: true }).click();
    await onsite.page.getByRole('heading', { name: 'Punch out', exact: true }).waitFor();
    await onsite.page.getByRole('button', { name: 'Allow camera', exact: true }).waitFor();
    const punchOutLocation = await (await punchOutResponse).json();
    assert.equal(punchOutLocation.location.status, 'onsite');
    assert.equal('accuracyMeters' in punchOutLocation.location, false);
    assert.ok(punchOutLocation.location.distanceMeters >= 24 && punchOutLocation.location.distanceMeters <= 26);
    assert.equal(punchOutLocation.requiresPhoto, true);
    assert.equal(await onsite.page.getByRole('button', { name: 'Continue punch-out', exact: true }).count(), 0);
    await capture(onsite.page);
    await onsite.page.getByRole('button', { name: 'Save punch-out & log out', exact: true }).waitFor();
    assert.doesNotMatch(await onsite.page.locator('body').innerText(), /check[ -]?out|check[ -]?in/i);
    await onsite.page.screenshot({ path: require('node:path').resolve(__dirname, '../../../../.local/onsite-punch-out.png'), fullPage: true });
    await onsite.page.getByRole('button', { name: 'Save punch-out & log out', exact: true }).click();
    await onsite.page.getByRole('button', { name: 'Sign in', exact: true }).waitFor();
    assert.deepEqual(onsite.state.pageErrors, []);
    await onsite.context.close();
    console.log('PASS: office-centre punch-in and 25m punch-out skip exception confirmation, require photos, and show attendance terminology.');

    const expiry = await setup(); await credentials(expiry.page); await capture(expiry.page);
    expiry.state.expirePhoto = true;
    await expiry.page.getByRole('button', { name: 'Use photo & continue', exact: true }).click();
    await expiry.page.getByRole('button', { name: 'Sign in', exact: true }).waitFor();
    assert.equal(await expiry.page.locator('video').count(), 0);
    assert.equal(await expiry.page.getByLabel('Password', { exact: true }).inputValue(), '');
    assert.deepEqual(expiry.state.pageErrors, []); await expiry.context.close();
    console.log('PASS: AUTH-05 expired punch-in leaves capture and clears the password.');

    const lost = await setup(); await credentials(lost.page); await capture(lost.page); lost.state.dropAcknowledgement = true;
    await lost.page.getByRole('button', { name: 'Use photo & continue', exact: true }).click();
    await lost.page.getByRole('button', { name: 'Log out', exact: true }).waitFor({ timeout: 15000 });
    assert.deepEqual(lost.state.pageErrors, []);
    console.log('PASS: AUTH-06 lost successful photo response reconciles to the workspace.');
    await lost.context.setGeolocation({ latitude: 17.431361111, longitude: 78.456638889, accuracy: 1 });
    await lost.page.getByRole('button', { name: 'Log out', exact: true }).click();
    await lost.page.getByRole('button', { name: 'Continue punch-out', exact: true }).waitFor();
    lost.state.holdConfirm = true; lost.state.confirmSeen = deferred(); lost.state.releaseConfirm = deferred();
    await lost.page.getByRole('button', { name: 'Continue punch-out', exact: true }).click();
    await lost.state.confirmSeen.promise; await lost.page.evaluate(() => window.__authTest.revoke()); lost.state.releaseConfirm.resolve();
    await lost.page.getByRole('heading', { name: 'Allow location to continue.' }).waitFor();
    await lost.page.waitForTimeout(250);
    assert.equal(await lost.page.locator('video').count(), 0);
    assert.deepEqual(lost.state.pageErrors, []); await lost.context.close();
    console.log('PASS: AUTH-03 delayed checkout confirmation cannot reopen capture after revocation.');

    const checkoutExpiry = await setup(); await signIn(checkoutExpiry.page);
    await checkoutExpiry.page.getByRole('button', { name: 'Log out', exact: true }).click();
    await capture(checkoutExpiry.page); checkoutExpiry.state.expireLocation = true;
    await checkoutExpiry.page.getByRole('button', { name: 'Save punch-out & log out', exact: true }).click();
    await checkoutExpiry.page.getByRole('button', { name: 'Retry location check', exact: true }).waitFor();
    assert.equal(await checkoutExpiry.page.locator('video').count(), 0);
    checkoutExpiry.state.expireLocation = false;
    await checkoutExpiry.page.getByRole('button', { name: 'Retry location check', exact: true }).click();
    await capture(checkoutExpiry.page);
    await checkoutExpiry.page.getByRole('button', { name: 'Save punch-out & log out', exact: true }).click();
    await checkoutExpiry.page.getByRole('button', { name: 'Sign in', exact: true }).waitFor();
    assert.deepEqual(checkoutExpiry.state.pageErrors, []); await checkoutExpiry.context.close();
    console.log('PASS: expired checkout location returns to a fresh check and can complete punch-out.');

    const transition = await setup(true); await credentials(transition.page); await capture(transition.page);
    await transition.page.getByRole('button', { name: 'Use photo & continue', exact: true }).click();
    await transition.page.getByRole('heading', { name: 'Preparing your workspace', exact: true }).waitFor();
    await transition.page.evaluate(() => window.__authTest.revoke());
    await transition.page.waitForTimeout(1800);
    assert.equal(await transition.page.getByRole('button', { name: 'Log out', exact: true }).count(), 0);
    await transition.page.getByRole('heading', { name: 'Allow location to continue.' }).waitFor();
    assert.deepEqual(transition.state.pageErrors, []); await transition.context.close();
    console.log('PASS: AUTH-04 permission revocation invalidates the success animation.');
  } finally {
    for (const context of contexts) await context.close().catch(() => {});
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });

const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const { chromium } = require('playwright');
const origin = process.env.IOTS_TEST_UI_URL || 'http://localhost:5174';

async function setup(browser, { width = 1440, dark = false, granted = false, unsupportedQuery = false } = {}) {
  const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
  await context.addInitScript(({ dark, granted, unsupportedQuery }) => {
    localStorage.setItem('iots-theme', dark ? 'dark' : 'light');
    const states = Object.fromEntries(['geolocation', 'camera', 'notifications'].map(name => [name, granted ? 'granted' : 'prompt']));
    const statuses = new Map();
    const counts = { geolocation: 0, camera: 0, notifications: 0, stopped: 0 };
    const update = (name, value) => { states[name] = value; for (const status of statuses.get(name) || []) status.dispatchEvent(new Event('change')); };
    Object.defineProperty(navigator, 'permissions', { configurable: true, value: { query: async ({ name }) => {
      if (unsupportedQuery && name === 'camera') throw Error('Permission query unsupported');
      const status = new EventTarget();
      Object.defineProperty(status, 'state', { get: () => states[name] });
      statuses.set(name, [...statuses.get(name) || [], status]);
      return status;
    } } });
    Object.defineProperty(navigator, 'geolocation', { configurable: true, value: { getCurrentPosition(resolve, reject) {
      counts.geolocation++;
      if (states.geolocation === 'denied') return reject({ code: 1, message: 'Denied' });
      update('geolocation', 'granted');
      resolve({ coords: { latitude: 17.430361111, longitude: 78.456638889 }, timestamp: Date.now() });
    } } });
    Object.defineProperty(navigator, 'mediaDevices', { configurable: true, value: { async getUserMedia(options) {
      if (options.audio !== false) throw Error('Microphone must not be requested');
      counts.camera++;
      if (states.camera === 'denied') throw new DOMException('Denied', 'NotAllowedError');
      update('camera', 'granted');
      return { getTracks: () => [{ stop() { counts.stopped++; } }] };
    } } });
    Object.defineProperty(window, 'Notification', { configurable: true, value: class {
      static get permission() { return states.notifications === 'prompt' ? 'default' : states.notifications; }
      static async requestPermission() { counts.notifications++; if (states.notifications !== 'denied') update('notifications', 'granted'); return states.notifications; }
    } });
    window.__permissions = { states, counts, update };
  }, { dark, granted, unsupportedQuery });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  let logins = 0;
  await page.route('**/api/auth/**', route => {
    if (new URL(route.request().url()).pathname.endsWith('/login')) logins++;
    return route.fulfill({ status: 401, json: { message: 'Test: signed out' } });
  });
  await page.goto(origin);
  return { context, page, errors, logins: () => logins };
}
async function main() {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const output = path.resolve(__dirname, '../../../../reports/permission-preflight');
  await fs.mkdir(output, { recursive: true });
  try {
    for (const options of [{ width: 1440 }, { width: 390, dark: true, unsupportedQuery: true }]) {
      const { context, page, errors } = await setup(browser, options);
      const dialog = page.getByRole('dialog', { name: 'Ready this browser for work' });
      await dialog.waitFor();
      await page.getByText('Action needed', { exact: true }).first().waitFor();
      assert.equal(await page.locator('#input-username').count(), 0, 'No credentials before consent');
      assert.equal(await dialog.getByRole('button', { name: 'Continue to sign-in' }).isDisabled(), true);
      assert.deepEqual(await page.evaluate(() => window.__permissions.counts), { geolocation: 0, camera: 0, notifications: 0, stopped: 0 }, 'Never request permission on mount');
      await page.screenshot({ path: path.join(output, `permissions-${options.width}.png`), fullPage: true });
      assert.ok(await dialog.evaluate(element => element.scrollWidth <= element.clientWidth), 'Dialog fits viewport');
      await page.keyboard.press('Escape');
      await dialog.waitFor({ state: 'hidden' });
      assert.equal(await page.locator('#input-username').count(), 0);
      await page.getByRole('button', { name: 'Review permissions' }).click();
      for (const title of ['Location', 'Camera', 'Desktop notifications']) {
        await dialog.getByRole('listitem').filter({ has: page.getByRole('heading', { name: title, exact: true }) }).getByRole('button', { name: 'Allow', exact: true }).click();
      }
      await page.getByRole('button', { name: 'Sign in', exact: true }).waitFor();
      const counts = await page.evaluate(() => window.__permissions.counts);
      assert.equal(counts.camera, 1); assert.equal(counts.stopped, 1); assert.equal(counts.notifications, 1);
      assert.deepEqual(errors, []);
      await context.close();
    }
    const saved = await setup(browser, { granted: true });
    await saved.page.getByRole('button', { name: 'Sign in', exact: true }).waitFor();
    assert.equal((await saved.page.evaluate(() => window.__permissions.counts)).camera, 0, 'Saved camera grant does not start camera');
    await saved.page.evaluate(() => window.__permissions.update('notifications', 'denied'));
    await saved.page.getByLabel('Username or email', { exact: true }).fill('test');
    await saved.page.getByLabel('Password', { exact: true }).fill('not-a-real-password');
    await saved.page.getByRole('button', { name: 'Sign in', exact: true }).click();
    await saved.page.getByRole('dialog', { name: 'Ready this browser for work' }).waitFor();
    await saved.page.getByText('Blocked', { exact: true }).waitFor();
    assert.equal(saved.logins(), 0, 'Revocation blocks credential submission');
    await saved.page.evaluate(() => window.__permissions.update('notifications', 'granted'));
    await saved.page.getByRole('button', { name: 'Sign in', exact: true }).waitFor();
    assert.deepEqual(saved.errors, []);
    await saved.context.close();
    console.log('PASS: permission gate, explicit requests, stopped camera, stored grants, query fallback, revocation, recovery, Escape, desktop/mobile and dark theme.');
  } finally { await browser.close(); }
}
main().catch(error => { console.error(error); process.exitCode = 1; });

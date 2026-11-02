const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const fs = require('node:fs/promises');
const path = require('node:path');

const origin = process.env.IOTS_TEST_UI_URL || 'http://localhost:5174';
const roles = ['chairman', 'general-manager', 'senior-manager', 'executive', 'lead-manager', 'coordinator', 'business-development-executive', 'creative-communication-executive', 'creative-communication-associate', 'it-system-analyst', 'super-admin', 'admin'];
async function main() {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const results = [];
  try {
    for (const width of [1440, 390]) {
      for (const role of roles) {
        const page = await browser.newPage({ viewport: { width, height: 1000 }, reducedMotion: 'reduce' });
        const errors = [];
        page.on('pageerror', error => errors.push(error.message));
        const fixture = await (await page.request.get(`${origin}/tests/fixtures/native-workspace.html`)).text();
        await page.route('**/dashboard/**', route => route.request().isNavigationRequest() ? route.fulfill({ contentType: 'text/html', body: fixture }) : route.continue());
        await page.route('**/api/**', route => {
          const endpoint = new URL(route.request().url()).pathname;
          const snapshot = { settings: { profile: {}, availability: { status: 'Available' }, preferences: {} }, activity: [], punches: [], sessions: [], policy: { workingDays: [1, 2, 3, 4, 5, 6], statuses: ['Available'] } };
          return route.fulfill({ json: endpoint.endsWith('/messaging') ? { employees: [], conversations: [], permissions: {} } : endpoint.endsWith('/notifications') ? { notifications: [], unread: 0 } : endpoint.endsWith('/time') ? { serverTime: new Date().toISOString(), mode: 'offsite', elapsedSeconds: 0 } : endpoint.includes('/holidays') ? { holidays: [], source: 'test', year: new Date().getFullYear() } : snapshot });
        });
        for (const route of ['/', '/profile', '/attendance', '/notifications']) {
          await page.goto(`${origin}/dashboard/${role}${route}?role=${role}`);
          await page.locator('.workspace-header').waitFor();
          await page.waitForTimeout(250);
          assert.equal(await page.locator('.workspace-header').count(), 1, `${role}: one header`);
          assert.equal(await page.locator('iframe').count(), 0, `${role}: native layout`);
          assert.ok(await page.locator('body').innerText(), `${role}: content`);
          assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${role} ${route}: no horizontal overflow at ${width}`);
          assert.deepEqual(errors, [], `${role} ${route}: browser errors`);
        }
        results.push({ role, width, routes: 4, passed: true });
        await page.close();
      }
    }
    const output = path.resolve(__dirname, '../../../../reports/portal-verification');
    await fs.mkdir(output, { recursive: true });
    await fs.writeFile(path.join(output, 'dashboards.json'), JSON.stringify({ testedAt: new Date().toISOString(), mode: 'mocked workspace services', results }, null, 2));
    console.log(`PASS: ${results.length} role/viewport combinations; 96 route renders without browser errors or horizontal overflow.`);
  } finally { await browser.close(); }
}
main().catch(error => { console.error(error); process.exitCode = 1; });

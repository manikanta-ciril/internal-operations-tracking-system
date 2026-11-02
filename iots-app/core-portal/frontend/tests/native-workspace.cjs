const assert = require('node:assert/strict');
const path = require('node:path');
const { chromium } = require('playwright');
const origin = process.env.IOTS_TEST_UI_URL || 'http://localhost:5174';

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  try {
    for (const width of [1440, 390]) {
      const page = await browser.newPage({ viewport: { width, height: 1000 }, reducedMotion: 'reduce', acceptDownloads: true });
      const failures = [];
      page.on('pageerror', error => failures.push(error.message));
      page.on('download', download => console.log('Download event:', download.suggestedFilename()));
      await page.route('**/dashboard/**', async route => route.request().isNavigationRequest() ? route.fulfill({ contentType: 'text/html', body: await (await page.request.get(`${origin}/tests/fixtures/native-workspace.html`)).text() }) : route.continue());
      await page.route('**/api/**', route => {
        const endpoint = new URL(route.request().url()).pathname;
        if (endpoint.endsWith('/messaging')) return route.fulfill({ json: { employees: [], conversations: [], permissions: {} } });
        const snapshot = { settings: { profile: { preferred: '', phone: '', personal: '' }, availability: { status: 'Available', message: '', returnAt: '' }, preferences: {} }, activity: [], punches: [], sessions: [], policy: { workingDays: [1, 2, 3, 4, 5, 6], statuses: ['Available', 'Busy'] } };
        return route.fulfill({ json: endpoint.endsWith('/notifications') ? { notifications: [], unread: 0 } : endpoint.endsWith('/time') ? { serverTime: new Date().toISOString(), mode: 'offsite', elapsedSeconds: 0 } : endpoint.includes('/holidays') ? { holidays: [], source: 'test', year: new Date().getFullYear() } : snapshot });
      });
      await page.goto(`${origin}/tests/fixtures/native-workspace.html`);
      await page.getByRole('button', { name: /Member welcome stationery/ }).first().waitFor();
      assert.equal(await page.locator('iframe').count(), 0);
      assert.equal(await page.locator('.workspace-header').count(), 1);
      assert.equal(await page.locator('.workspace-brand').count(), 0);
      assert.equal(await page.locator('.workspace-footer').count(), 0);
      await page.getByRole('button', { name: /Member welcome stationery/ }).first().click();
      await page.getByText('Task overview', { exact: true }).waitFor();
      await page.getByLabel('What did you do?', { exact: true }).fill('Integration note');
      await page.getByRole('button', { name: 'Save work update', exact: true }).click();
      await page.getByText('Integration note', { exact: true }).first().waitFor();
      await page.reload();
      await page.getByText('Integration note', { exact: true }).first().waitFor();
      if (width < 900) await page.getByRole('button', { name: 'Toggle navigation', exact: true }).click();
      await page.getByRole('link', { name: 'Attendance', exact: true }).click();
      await page.locator('.attendance-overview-panel').waitFor();
      assert.equal(await page.locator('.role-container').evaluate(el => Math.round(el.getBoundingClientRect().width)), width, 'Attendance uses the full page width');
      await page.reload();
      await page.locator('.attendance-overview-panel').waitFor();
      assert.equal(await page.locator('.role-container').evaluate(el => Math.round(el.getBoundingClientRect().width)), width, 'Reload retains full width');
      if (width < 900) await page.getByRole('button', { name: 'Toggle navigation', exact: true }).click();
      await page.getByRole('link', { name: 'Daily work report', exact: true }).click();
      await page.getByRole('heading', { name: 'Build your daily report' }).waitFor();
      if (width === 1440) {
        await page.locator('.report-task-options label').filter({ hasText: 'Member welcome stationery' }).locator('input').check();
        await page.getByRole('button', { name: 'Continue', exact: true }).click();
        await page.getByRole('button', { name: 'Completion summary', exact: true }).click();
        await page.getByRole('menuitemradio', { name: 'Work is in progress; no completions today.', exact: true }).click();
        await page.getByRole('button', { name: 'Continue', exact: true }).click();
        await page.getByLabel(/Work description for/).fill('Prepared the stationery layout.');
        for (let step = 0; step < 4; step++) await page.getByRole('button', { name: 'Continue', exact: true }).click();
        await page.getByRole('button', { name: 'Save draft', exact: true }).click();
        await page.getByText('Draft saved on this device.', { exact: true }).waitFor();
        for (const format of ['XLSX', 'PDF', 'CSV']) {
          console.log('Checking export:', format);
          await page.getByRole('button', { name: 'Export report', exact: true }).click();
          const [download] = await Promise.all([page.waitForEvent('download', { timeout: 15000 }).catch(async error => { await page.screenshot({path: path.join(require('node:os').tmpdir(),'export-failed.png'),fullPage:true}); console.error('Export errors:', await page.getByRole('alert').allTextContents(), failures); throw error; }), page.getByRole('menuitem', { name: format === 'XLSX' ? 'Excel (.xlsx)' : format, exact: true }).click()]);
          const chunks = [];
          for await (const chunk of await download.createReadStream()) chunks.push(chunk);
          const exported = Buffer.concat(chunks);
          if (format === 'CSV') assert.ok(exported.toString().includes('Member welcome stationery'));
          if (format === 'PDF') assert.equal(exported.subarray(0, 4).toString(), '%PDF');
          if (format === 'XLSX') {
            const workbook = new (require('exceljs').Workbook)();
            await workbook.xlsx.load(exported);
            assert.equal(workbook.worksheets[0].name, 'Daily report');
          }
        }
      }
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false);
      await page.screenshot({ path: path.join(require('node:os').tmpdir(), `native-workspace-${width}.png`), fullPage: true });
      await page.goto(`${origin}/dashboard/creative-communication-associate/profile`);
      await page.locator('.identity-banner').waitFor();
      assert.equal(await page.locator('.role-container').evaluate(el => Math.round(el.getBoundingClientRect().width)), width, 'Profile uses full page width');
      await page.reload();
      await page.locator('.identity-banner').waitFor();
      assert.equal(await page.locator('.role-container').evaluate(el => Math.round(el.getBoundingClientRect().width)), width);
      await page.screenshot({ path: path.join(require('node:os').tmpdir(), `native-profile-${width}.png`), fullPage: true });
      assert.deepEqual(failures, []);
      await page.getByRole('combobox', { name: /Switch workspace/ }).selectOption('chairman');
      assert.equal(await page.getByRole('link', { name: 'Daily work report', exact: true }).count(), 0);
      await page.close();
    }
    console.log('PASS: native work, persisted notes, live attendance UI, shared reports, role exclusion and desktop/mobile layout.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });







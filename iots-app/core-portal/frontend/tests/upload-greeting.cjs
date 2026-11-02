const assert = require('node:assert/strict');
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  try {
    const page = await browser.newPage();
    await page.goto('http://localhost:5196/tests/fixtures/upload-greeting.html');
    await page.locator('.greeting-hand[data-ready="true"]').waitFor({ timeout: 15000 });
    assert.match(await page.locator('.employee-greeting').innerText(), /Deepthi/);
    assert.ok((await page.locator('.employee-greeting-message').innerText()).length > 10);
    await page.locator('input[type=file]').setInputFiles({ name: 'proof.pdf', mimeType: 'application/pdf', buffer: Buffer.from('evidence') });
    await page.getByRole('button', { name: 'Remove proof.pdf', exact: true }).click();
    assert.equal(await page.locator('.file-upload-list li').count(), 0);
    await page.locator('input[type=file]').setInputFiles({ name: 'proof.pdf', mimeType: 'application/pdf', buffer: Buffer.from('evidence') });
    assert.equal(await page.locator('.file-upload-list li').count(), 1);
    await page.locator('input[type=file]').setInputFiles({ name: 'invalid.exe', mimeType: 'application/octet-stream', buffer: Buffer.from('invalid') });
    await page.getByRole('alert').filter({ hasText: 'choose an allowed file' }).waitFor();
    assert.equal(await page.locator('.file-upload-list li').count(), 1);
    await page.locator('input[type=file]').setInputFiles({ name: 'large.pdf', mimeType: 'application/pdf', buffer: Buffer.alloc(26 * 1024 * 1024) });
    await page.getByRole('alert').filter({ hasText: 'large.pdf' }).waitFor();
    const dropped = await page.evaluateHandle(() => { const data = new DataTransfer(); data.items.add(new File(['image'], 'design.png', { type: 'image/png' })); return data; });
    await page.locator('.file-upload-zone').dispatchEvent('drop', { dataTransfer: dropped });
    assert.equal(await page.locator('.file-upload-list li').count(), 2);
    console.log('PASS: Strict Mode greeting, delayed hand, file selection, removal, reselection, type/size validation and drag/drop.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });

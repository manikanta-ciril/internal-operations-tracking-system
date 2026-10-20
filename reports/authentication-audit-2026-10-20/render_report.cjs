const { chromium } = require('../../iots-app/authentication-system/frontend/node_modules/playwright');
const path = require('node:path');
const fs = require('node:fs/promises');

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  try {
    const page = await browser.newPage();
    await page.goto('file:///' + path.join(__dirname, 'authentication-audit.html').replaceAll('\\', '/'));
    await page.emulateMedia({ media: 'print' });
    await page.evaluate(() => document.fonts.ready);
    const layout = await page.locator('.page').evaluateAll(pages => pages.map((page, index) => ({
      page: index + 1,
      title: page.querySelector('h1').innerText,
      height: page.getBoundingClientRect().height,
      scrollHeight: page.scrollHeight,
    })));
    const overflow = layout.filter(page => page.scrollHeight > page.height + 2);
    if (overflow.length) throw new Error('Print overflow: ' + JSON.stringify(overflow));
    await page.pdf({
      path: path.join(__dirname, 'authentication-audit.pdf'),
      format: 'A4', printBackground: true, preferCSSPageSize: true,
      displayHeaderFooter: true, headerTemplate: '<span></span>',
      footerTemplate: '<div style="width:100%;margin:0 16mm;font:9px Segoe UI;color:#555b5c;display:flex;justify-content:space-between"><span>CIRIL | Authentication review | 20 Oct 2026</span><span><span class="pageNumber"></span> / <span class="totalPages"></span></span></div>',
      tagged: true, outline: true,
    });
    await fs.writeFile(path.join(__dirname, 'layout-check.json'), JSON.stringify(layout, null, 2));
    console.log('Rendered ' + layout.length + ' pages; no print overflow.');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });

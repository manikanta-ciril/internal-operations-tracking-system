const assert = require("node:assert/strict");
const { chromium } = require("playwright");
const path = require("node:path");
const { pathToFileURL } = require("node:url");
(async () => {
  const { dateKey, addDays } = await import(
    pathToFileURL(
      path.resolve(__dirname, "../src/features/employee-attendance/model.js"),
    )
  );
  const today = dateKey(),
    punches = [];
  for (let n = 0; n < 180; n += 5) {
    const day = addDays(today, -n);
    if (new Date(`${day}T12:00:00Z`).getUTCDay() === 0) continue;
    punches.push({
      id: `fixture-${n}`,
      punchIn: `${day}T09:30:00+05:30`,
      punchOut: n === 0 ? null : `${day}T18:00:00+05:30`,
      punchOutId: n === 0 ? null : `out-${n}`,
    });
  }
  const browser = await chromium.launch({ channel: "msedge", headless: true });
  try {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 1000 },
      reducedMotion: "reduce",
    });
    const page = await context.newPage(),
      errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    const user = {
      id: 1,
      name: "Kanna Praneeth Thogati",
      username: "kanna",
      email: "kanna@ciril.in",
      activeRole: "it-system-analyst",
      roles: [{ code: "it-system-analyst", label: "IT System Analyst" }],
      location: { status: "onsite", distanceMeters: 0 },
    };
    const data = {
      settings: {
        profile: { preferred: "" },
        availability: { status: "Available" },
        preferences: {},
      },
      avatarVersion: null,
      punches,
      sessions: [],
      activity: [],
      policy: { workingDays: [1, 2, 3, 4, 5, 6], statuses: ["Available"] },
    };
    await context.route("**/api/auth/**", async (route) => {
      const p = new URL(route.request().url()).pathname;
      return route.fulfill({
        json: p.endsWith("/me")
          ? { user }
          : p.endsWith("/notifications")
            ? { notifications: [], unread: 0 }
            : p.endsWith("/time")
              ? {
                  serverTime: new Date().toISOString(),
                  date: today,
                  elapsedSeconds: 0,
                  targetSeconds: 30600,
                }
              : data,
      });
    });
    await page.goto(
      "http://localhost:5174/dashboard/it-system-analyst/profile",
    );
    const calendar = page.getByRole("grid", {
      name: "Office attendance activity calendar",
    });
    await calendar.waitFor();
    assert.equal(
      await calendar.locator("a[data-attendance-date]").count(),
      180,
    );
    assert.equal(
      await page
        .getByRole("grid", { name: "Attendance calendar", exact: true })
        .count(),
      0,
    );
    assert.equal(
      await calendar.locator("a.recorded,a.open").count(),
      punches.length,
    );
    assert.ok(await calendar.locator("a.off").count());
    const expectedDays = new Set(punches.map((p) => dateKey(p.punchIn))).size;
    assert.match(
      await page.locator(".attendance-activity-summary").innerText(),
      new RegExp(`^${expectedDays} days`),
    );
    await page.screenshot({
      path: path.resolve(
        __dirname,
        "../../../../.local/attendance-overview-light.png",
      ),
      fullPage: true,
    });
    await page.getByRole("button", { name: "3 months", exact: true }).click();
    assert.equal(await calendar.locator("a[data-attendance-date]").count(), 90);
    await page.getByRole("button", { name: "6 months", exact: true }).click();
    assert.equal(
      await calendar.locator("a[data-attendance-date]").count(),
      180,
    );
    // A tooltip must stay next to its date in viewport coordinates even after scrolling.
    async function assertAnchored(day, hint) {
      const cell = await day.boundingBox(),
        popup = await hint.boundingBox();
      const gap = Math.min(
        Math.abs(cell.y - popup.y - popup.height),
        Math.abs(popup.y - cell.y - cell.height),
      );
      assert.ok(
        gap >= 4 && gap <= 8,
        `Date popup gap must stay near 6px; received ${gap}px`,
      );
      const viewport = page.viewportSize();
      assert.ok(popup.x >= 0 && popup.x + popup.width <= viewport.width);
      assert.ok(popup.y >= 0 && popup.y + popup.height <= viewport.height);
      assert.equal(
        await hint.evaluate((el) => getComputedStyle(el).position),
        "fixed",
      );
    }
    await page.emulateMedia({ reducedMotion: "no-preference" });
    const desktopDay = calendar.locator("a.recorded").last();
    await desktopDay.hover();
    const desktopHint = page.getByRole("tooltip");
    await desktopHint.waitFor();
    assert.equal(
      await desktopHint.evaluate((el) => getComputedStyle(el).animationName),
      "tooltip-pop-out",
    );
    await assertAnchored(desktopDay, desktopHint);
    await page.screenshot({
      path: path.resolve(
        __dirname,
        "../../../../.local/attendance-hover-desktop.png",
      ),
    });
    await page.mouse.move(0, 0);
    await desktopHint.waitFor({ state: "hidden" });
    await page.evaluate(() => document.documentElement.classList.add("dark"));
    await page.setViewportSize({ width: 375, height: 812 });
    const day = calendar.locator("a.recorded").last();
    await day.hover();
    const tooltip = page.getByRole("tooltip");
    await tooltip.waitFor();
    const box = await tooltip.boundingBox();
    assert.ok(box.x >= 0 && box.x + box.width <= 375);
    await assertAnchored(day, tooltip);
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.evaluate(() => window.scrollBy(0, 24));
    await page.waitForFunction(() => {
      const trigger = document.querySelector(
        ".attendance-activity-grid a[aria-describedby]",
      );
      if (!trigger) return false;
      const popup = document.getElementById(
        trigger.getAttribute("aria-describedby"),
      );
      const a = trigger.getBoundingClientRect(),
        b = popup.getBoundingClientRect();
      return (
        Math.min(Math.abs(a.top - b.bottom), Math.abs(b.top - a.bottom)) < 9
      );
    });
    await assertAnchored(day, tooltip);

    await page.screenshot({
      path: path.resolve(
        __dirname,
        "../../../../.local/attendance-hover-mobile-dark.png",
      ),
      fullPage: false,
    });
    await page.emulateMedia({ reducedMotion: "reduce" });
    assert.equal(
      await tooltip.evaluate((el) => getComputedStyle(el).animationName),
      "none",
    );
    await page.keyboard.press("Escape");
    await tooltip.waitFor({ state: "hidden" });
    assert.ok(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    );
    await day.focus();
    const before = await day.getAttribute("data-attendance-date");
    await page.keyboard.press("ArrowLeft");
    const focused = calendar.locator("a:focus");
    const selected = await focused.getAttribute("data-attendance-date");
    assert.equal(selected, addDays(before, -7));
    await page.keyboard.press("Enter");
    await page.waitForURL(`**/attendance/${selected}`);
    await page
      .getByRole("grid", { name: "Attendance calendar", exact: true })
      .waitFor();
    assert.ok(await page.locator("#attendance-details").isVisible());
    assert.equal(
      await calendar.count(),
      0,
      "Overview graph is hidden while details occupy its panel",
    );
    const panel = page.locator(".attendance-overview-panel");
    assert.equal(
      await panel.locator("section.panel").count(),
      0,
      "No nested or duplicated attendance panels",
    );
    await page
      .getByRole("link", { name: "Back to overview", exact: true })
      .click();
    await calendar.waitFor();
    assert.equal(
      await page
        .getByRole("grid", { name: "Attendance calendar", exact: true })
        .count(),
      0,
    );
    await page.getByRole("button", { name: "3 months", exact: true }).click();
    const toggle = page.getByRole("link", {
      name: "View details",
      exact: true,
    });
    await toggle.scrollIntoViewIfNeeded();
    const beforeSwap = await panel.locator(".section-heading").boundingBox();
    await toggle.click();
    await page
      .getByRole("grid", { name: "Attendance calendar", exact: true })
      .waitFor();
    const afterSwap = await panel.locator(".section-heading").boundingBox();
    assert.ok(
      Math.abs(beforeSwap.y - afterSwap.y) < 4,
      "Swapping details does not jump down the page",
    );
    await page
      .getByRole("link", { name: "Back to overview", exact: true })
      .click();
    await calendar.waitFor();
    assert.equal(
      await calendar.locator("a[data-attendance-date]").count(),
      90,
      "Overview range survives the swap",
    );
    await page.goBack();
    await page
      .getByRole("grid", { name: "Attendance calendar", exact: true })
      .waitFor();
    await page.goForward();
    await calendar.waitFor();
    assert.deepEqual(errors, []);
    console.log(
      "PASS: live record counts, 90/180-day selection, weekly-off states, native hover/focus tooltip placement, keyboard day selection, detail navigation and mobile width.",
    );
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

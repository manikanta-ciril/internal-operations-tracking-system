const assert = require("node:assert/strict");
const { chromium } = require("playwright");
const path = require("path");
(async () => {
  const browser = await chromium.launch({ channel: "msedge", headless: true });
  try {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 1000 },
      reducedMotion: "reduce",
    });
    const page = await context.newPage();
    const errors = [],
      years = [];
    page.on("pageerror", (e) => errors.push(e.message));
    let fail = false;
    await context.route("**/api/auth/**", (route) => {
      const url = new URL(route.request().url()),
        p = url.pathname;
      let json;
      if (p.endsWith("/me"))
        json = {
          user: {
            id: 1,
            name: "Kanna Praneeth Thogati",
            username: "kanna",
            email: "kanna@ciril.in",
            activeRole: "it-system-analyst",
            roles: [{ code: "it-system-analyst", label: "IT System Analyst" }],
            location: { status: "onsite", distanceMeters: 0 },
          },
        };
      else if (p.endsWith("/calendar/holidays")) {
        const year = url.searchParams.get("year");
        years.push(year);
        assert.ok(Number(year) >= 2025);
        if (fail)
          return route.fulfill({
            status: 503,
            json: { message: "Holiday details unavailable" },
          });
        json = {
          events: [
            {
              date: year + "-01-26",
              name: "Republic Day",
              category: "National holiday",
              region: "India",
              description:
                "Republic Day marks the adoption of the Constitution of India.",
            },
            {
              date: year + "-10-02",
              name: "Gandhi Jayanti",
              category: "National holiday",
              region: "India",
            },
          ],
          stale: false,
        };
      } else if (p.endsWith("/notifications"))
        json = { notifications: [], unread: 0 };
      else if (p.endsWith("/time"))
        json = {
          serverTime: new Date().toISOString(),
          date: "2026-10-27",
          timezone: "Asia/Kolkata",
          opening: "09:30",
          closing: "18:00",
        };
      else
        json = {
          settings: {
            profile: {},
            availability: { status: "Available" },
            preferences: {},
          },
          avatarVersion: null,
          punches: [],
          sessions: [],
          activity: [],
          policy: { workingDays: [1, 2, 3, 4, 5, 6], statuses: ["Available"] },
        };
      return route.fulfill({ json });
    });
    await page.goto(
      "http://localhost:5174/dashboard/it-system-analyst/attendance/2024-12-31",
    );
    const calendar = page.getByRole("grid", {
      name: "Attendance calendar",
      exact: true,
    });
    await calendar.waitFor();
    assert.equal(
      await page.getByLabel("Calendar year", { exact: true }).inputValue(),
      "2025",
    );
    assert.ok(
      await page
        .getByRole("button", { name: "Previous month", exact: true })
        .isDisabled(),
    );
    assert.equal(
      await page
        .getByLabel("Calendar year", { exact: true })
        .locator("option")
        .first()
        .getAttribute("value"),
      "2025",
    );
    const first = calendar.locator('[data-date="2025-01-01"]');
    await first.focus();
    await page.keyboard.press("ArrowLeft");
    assert.equal(
      await page.locator(":focus").getAttribute("data-date"),
      "2025-01-01",
    );
    await page.keyboard.press("PageUp");
    assert.equal(
      await page.locator(":focus").getAttribute("data-date"),
      "2025-01-01",
    );
    await page
      .getByLabel("Calendar year", { exact: true })
      .selectOption("2027");
    const holiday = calendar.locator('[data-date="2027-01-26"]');
    await holiday.getByText("Republic Day").waitFor();
    await holiday.hover();
    const tooltip = page.getByRole("tooltip");
    await tooltip.getByText("Republic Day", { exact: true }).waitFor();
    const a = await holiday.boundingBox(),
      b = await tooltip.boundingBox();
    assert.ok(
      Math.min(
        Math.abs(a.y - b.y - b.height),
        Math.abs(b.y - a.y - a.height),
      ) <= 8,
    );
    await page.screenshot({
      path: path.resolve(
        __dirname,
        "../../../../.local/holiday-tooltip-refined.png",
      ),
    });
    await page.keyboard.press("Escape");
    await holiday.click();
    await page
      .locator(".selected-holidays")
      .getByRole("heading", { name: "Republic Day" })
      .waitFor();
    for (const width of [1440, 768, 390, 320]) {
      await page.setViewportSize({ width, height: 1000 });
      await calendar.scrollIntoViewIfNeeded();
      assert.ok(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        "overflow " + width,
      );
      const regular = calendar.locator('[data-date="2027-01-25"]');
      const holidayBox = await holiday.boundingBox(),
        regularBox = await regular.boundingBox();
      assert.equal(
        holidayBox.height,
        regularBox.height,
        "Holiday and ordinary dates have equal height",
      );
      assert.equal(
        holidayBox.y,
        regularBox.y,
        "Date buttons share a row baseline",
      );
      const holidayNumber = await holiday.locator("strong").boundingBox(),
        regularNumber = await regular.locator("strong").boundingBox();
      assert.equal(
        holidayNumber.y,
        regularNumber.y,
        "Date numbers align with and without holiday labels",
      );
      if (width === 1440 || width === 390)
        await page.screenshot({
          path: path.resolve(
            __dirname,
            "../../../../.local/holidays-" + width + ".png",
          ),
        });
    }
    await page.evaluate(() => document.documentElement.classList.add("dark"));
    await page.screenshot({
      path: path.resolve(__dirname, "../../../../.local/holidays-dark.png"),
    });
    await page.goto(
      "http://localhost:5174/dashboard/it-system-analyst/profile",
    );
    await page
      .getByLabel("Calendar legend")
      .getByText("Holiday / festival", { exact: true })
      .waitFor();
    const marked = page.locator('[data-attendance-date="2026-10-02"]');
    await marked.waitFor();
    assert.ok((await marked.getAttribute("class")).includes("has-events"));
    assert.equal(
      await marked.evaluate((el) => getComputedStyle(el, "::after").height),
      "2px",
    );
    await marked.hover();
    await page
      .getByRole("tooltip")
      .getByText("Gandhi Jayanti", { exact: true })
      .waitFor();
    await page.screenshot({
      path: path.resolve(
        __dirname,
        "../../../../.local/holiday-graph-refined.png",
      ),
    });
    await page.emulateMedia({reducedMotion:'no-preference'});
    await page.setViewportSize({width:1440,height:1000});
    await page.evaluate(() => {
      window.attendanceTransitions=[];
      const start=document.startViewTransition.bind(document);
      document.startViewTransition=callback=>{
        if(document.documentElement.dataset.viewTransitionScope==='attendance') window.attendanceTransitions.push({
          page:getComputedStyle(document.querySelector('.workspace-page-content')).viewTransitionName,
          panel:getComputedStyle(document.querySelector('.attendance-panel-content')).viewTransitionName,
        });
        return start(callback);
      };
    });
    await page.getByRole('link',{name:'View details',exact:true}).click();
    await page.getByRole('link',{name:'Back to overview',exact:true}).waitFor();
    await page.waitForFunction(()=>!document.documentElement.dataset.viewTransitionScope);
    assert.deepEqual(await page.evaluate(()=>window.attendanceTransitions),[{page:'none',panel:'attendance-content'}]);
    await page.locator('.attendance-overview-panel').screenshot({path:path.resolve(__dirname,'../../../../.local/attendance-inline-details.png')});
    await page.evaluate(()=>{
      document.startViewTransition=undefined;
      window.fallbackTargets=[];
      const animate=Element.prototype.animate;
      Element.prototype.animate=function(...args){window.fallbackTargets.push(this.className);return animate.apply(this,args);};
    });
    await page.getByRole('link',{name:'Back to overview',exact:true}).click();
    await page.getByRole('grid',{name:'Office attendance activity calendar'}).waitFor();
    await page.waitForFunction(()=>window.fallbackTargets.includes('attendance-panel-content'));
    assert.ok(!(await page.evaluate(()=>window.fallbackTargets)).includes('workspace-page-content'));
    fail = true;
    await page.goto(
      "http://localhost:5174/dashboard/it-system-analyst/attendance/2026-02-01",
    );
    await page
      .getByRole("region", { name: "Attendance day details" })
      .getByText("Some holiday details could not load.")
      .first()
      .waitFor();
    assert.ok(
      await page
        .getByRole("grid", { name: "Attendance calendar", exact: true })
        .isVisible(),
    );
    assert.ok(!years.includes("2024"));
    assert.deepEqual(errors, []);
    console.log(
      "PASS: 2025 navigation/keyboard/URL boundaries, 2027 events, adjacent hover details, selected-day content, mobile/dark layout and independent provider failure.",
    );
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});

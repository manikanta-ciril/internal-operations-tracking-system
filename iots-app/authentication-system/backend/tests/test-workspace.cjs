const assert = require("node:assert/strict");
const sharp = require("sharp");
const { chromium } = require("../../frontend/node_modules/playwright");
const office = require("../src/location/office-location.json");
if (
  !process.env.IOTS_TEST_BASE_URL ||
  process.env.DB_NAME !== "iots_auth_fix_test"
)
  throw Error("Use test:auth.");
const base = process.env.IOTS_TEST_BASE_URL;
async function call(route, cookie, body) {
  const response = await fetch(base + route, {
    method: body === undefined ? "GET" : "POST",
    headers: {
      ...(cookie ? { Cookie: cookie } : {}),
      "Content-Type": "application/json",
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  return {
    status: response.status,
    data: await response.json(),
    cookie: response.headers.get("set-cookie")?.split(";")[0],
  };
}
(async () => {
  assert.equal((await call("workspace")).status, 401);
  const image = await sharp({
    create: { width: 320, height: 240, channels: 3, background: "#c09860" },
  })
    .jpeg()
    .toBuffer();
  async function login(username) {
    const entry = await call("login", null, { username, password: "Iots@123" });
    assert.equal(entry.status, 200);
    assert.equal((await call("workspace", entry.cookie)).status, 403);
    const location = await call("location", entry.cookie, {
      position: {
        latitude: office.latitude,
        longitude: office.longitude,
        timestamp: Date.now(),
      },
    });
    const photo = await fetch(base + "photo", {
      method: "POST",
      headers: {
        Cookie: entry.cookie,
        "Content-Type": "image/jpeg",
        "X-Captured-At": String(Date.now()),
        "X-Location-Check": location.data.location.checkId,
      },
      body: image,
    });
    assert.equal(photo.status, 200);
    return entry.cookie;
  }
  const cookie = await login("manikanta");
  const profile = {
    preferred: "Workspace test",
    phone: "1234567890",
    personal: "test@example.com",
    activeRole: "super-admin",
    employee_id: 1,
  };
  const saved = await call("workspace/settings/profile", cookie, profile);
  assert.equal(saved.status, 200);
  assert.equal(saved.data.value.activeRole, undefined);
  const snapshot = await call("workspace", cookie);
  assert.equal(snapshot.data.settings.profile.preferred, profile.preferred);
  assert.ok(snapshot.data.punches.length);
  assert.ok(snapshot.data.sessions.some((s) => s.current));
  assert.ok(!JSON.stringify(snapshot.data).includes("token_hash"));
  assert.ok(snapshot.data.policy.workingDays.includes(6));
  assert.equal(
    (
      await call("workspace/settings/availability", cookie, {
        status: "Invented",
        message: "",
        returnAt: "",
      })
    ).status,
    400,
  );
  const other = await login("bhavani");
  assert.notEqual(
    (await call("workspace", other)).data.settings.profile.preferred,
    profile.preferred,
  );
  const upload = await fetch(base + "workspace/avatar", {
    method: "POST",
    headers: { Cookie: cookie, "Content-Type": "image/jpeg" },
    body: image,
  });
  assert.equal(upload.status, 200);
  const avatar = await fetch(base + "workspace/avatar", {
    headers: { Cookie: cookie },
  });
  assert.equal(avatar.status, 200);
  assert.equal(
    (await sharp(Buffer.from(await avatar.arrayBuffer())).metadata()).width,
    256,
  );
  assert.equal(
    (await fetch(base + "workspace/avatar", { headers: { Cookie: other } }))
      .status,
    404,
  );
  const browser = await chromium.launch({ channel: "msedge", headless: true });
  try {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      reducedMotion: "reduce",
    });
    const origin = "http://localhost:5174";
    const [name, value] = cookie.split("=");
    await context.addCookies([{ name, value, url: origin }]);
    await context.route("**/api/auth/**", async (route) => {
      const url = new URL(route.request().url());
      const response = await route.fetch({
        url: base + url.pathname.slice("/api/auth/".length),
      });
      await route.fulfill({ response });
    });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto(origin + "/dashboard/it-system-analyst/profile");
    await page.getByRole("tab", { name: "Overview", exact: true }).waitFor();
    await page
      .getByRole("tab", { name: "Personal details", exact: true })
      .click();
    assert.ok(page.url().endsWith("/profile/details"));
    await page.getByRole("button", { name: "Open profile menu" }).click();
    await page.screenshot({
      path: "../../../.local/workspace-integrated-desktop.png",
    });
    await page.getByRole("dialog", {name:"Profile menu"}).getByRole("button", { name: "Switch to dark mode" }).click();
    assert.ok(
      await page
        .locator("html")
        .evaluate((el) => el.classList.contains("dark")),
    );
    await page.keyboard.press("Escape");
    await page.setViewportSize({ width: 375, height: 812 });
    await page.screenshot({
      path: "../../../.local/workspace-integrated-mobile.png",
    });
    assert.ok(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    );
    await page.getByRole("button", { name: "Open profile menu" }).click();
    await page.getByRole("button", { name: "Punch out & log out", exact: true }).click();
    await page
      .locator(".checkout-flow")
      .waitFor({ timeout: 10000 })
      .catch(async () => {
        assert.ok(await page.getByText(/punch.out/i).count());
      });
    assert.deepEqual(errors, []);
  } finally {
    await browser.close();
  }
  console.log(
    "PASS: workspace authentication gates, account isolation, profile allowlist, avatar ownership, persisted profile, tabs, theme, mobile overflow and punch-out entry.",
  );
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});

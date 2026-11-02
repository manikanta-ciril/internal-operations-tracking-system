const assert = require("node:assert/strict");
const { randomUUID } = require("node:crypto");
const fs = require("node:fs/promises");
const path = require("node:path");
const net = require("node:net");
const { spawn } = require("node:child_process");
const mysql = require("mysql2/promise");
const sharp = require("sharp");
const { io } = require("../../frontend/node_modules/socket.io-client");
const { chromium } = require("../../frontend/node_modules/playwright");
const {
  canCreateGroup,
  messageInput,
  attachmentName,
} = require("../src/messaging/policy");
const backend = path.resolve(__dirname, "..");
const frontend = path.resolve(backend, "../frontend");
const root = path.resolve(backend, "../../..");
const database = `iots_chat_test_${Date.now()}`;
const storage = path.join(root, ".local", database);
const reports = path.join(root, "reports", "messaging-verification");
let admin, pool, server, sockets, vite, browser;
const clients = [];

async function port() {
  const listener = net.createServer();
  await new Promise((resolve) => listener.listen(0, "127.0.0.1", resolve));
  const result = listener.address().port;
  await new Promise((resolve) => listener.close(resolve));
  return result;
}
async function runSeed() {
  await new Promise((resolve, reject) => {
    const child = spawn(process.execPath, ["database/seed.js"], {
      cwd: backend,
      env: process.env,
      windowsHide: true,
      stdio: ["ignore", "pipe", "pipe"],
    });
    let output = "";
    child.stdout.on("data", (value) => {
      output += value;
    });
    child.stderr.on("data", (value) => {
      output += value;
    });
    child.once("error", reject);
    child.once("exit", (code) =>
      code ? reject(new Error(output)) : resolve(),
    );
  });
}
async function main() {
  assert.ok(
    process.env.IOTS_TEST_ADMIN_PASSWORD,
    "Set IOTS_TEST_ADMIN_PASSWORD for the disposable test database.",
  );
  for (const role of [
    "chairman",
    "general-manager",
    "senior-manager",
    "executive",
    "super-admin",
  ])
    assert.equal(canCreateGroup(role), true);
  for (const role of [
    "lead-manager",
    "coordinator",
    "admin",
    "it-system-analyst",
    "creative-communication-associate",
  ])
    assert.equal(canCreateGroup(role), false);
  assert.throws(() => attachmentName("../secret.txt"));
  assert.throws(() => attachmentName("script.html"));
  assert.throws(() => messageInput({ body: "" }));
  admin = await mysql.createConnection({
    host: "127.0.0.1",
    port: 3307,
    user: process.env.IOTS_TEST_ADMIN_USER || "root",
    password: process.env.IOTS_TEST_ADMIN_PASSWORD,
  });
  const frontendPort = await port();
  const origin = `http://127.0.0.1:${frontendPort}`;
  Object.assign(process.env, {
    DB_HOST: "127.0.0.1",
    DB_PORT: "3307",
    DB_USER: process.env.IOTS_TEST_ADMIN_USER || "root",
    DB_PASSWORD: process.env.IOTS_TEST_ADMIN_PASSWORD,
    DB_NAME: database,
    IOTS_EVIDENCE_ROOT: path.join(storage, "photos"),
    IOTS_CHAT_ROOT: path.join(storage, "files"),
    IOTS_ALLOWED_ORIGINS: origin,
  });
  await runSeed();
  const app = require("../src/app");
  pool = require("../src/database/connection");
  server = require("node:http").createServer(app);
  sockets = require("../src/messaging/socket")(server, app, pool);
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const api = `http://127.0.0.1:${server.address().port}`;
  async function call(route, cookie, body, method) {
    const response = await fetch(`${api}/api/auth/${route}`, {
      method: method || (body === undefined ? "GET" : "POST"),
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
  const image = await sharp({
    create: { width: 320, height: 240, channels: 3, background: "#c09860" },
  })
    .jpeg()
    .toBuffer();
  async function login(username) {
    const entry = await call("login", null, { username, password: "Iots@123" });
    assert.equal(entry.status, 200);
    assert.equal(
      (await call("messaging", entry.cookie)).status,
      403,
      "Pending sessions cannot read messages",
    );
    const office = require("../src/location/office-location.json");
    const location = await call("location", entry.cookie, {
      position: {
        latitude: office.latitude,
        longitude: office.longitude,
        timestamp: Date.now(),
      },
    });
    const response = await fetch(`${api}/api/auth/photo`, {
      method: "POST",
      headers: {
        Cookie: entry.cookie,
        "Content-Type": "image/jpeg",
        "X-Captured-At": String(Date.now()),
        "X-Location-Check": location.data.location.checkId,
      },
      body: image,
    });
    assert.equal(response.status, 200, await response.text());
    return {
      cookie: entry.cookie,
      user: (await call("me", entry.cookie)).data.user,
    };
  }
  assert.equal((await call("messaging")).status, 401);
  const deepthi = await login("deepthi"),
    bhavani = await login("bhavani"),
    manager = await login("ipsheeta"),
    lead = await login("manasa"),
    chairman = await login("vijay");
  assert.equal(deepthi.user.gender, "female");
  assert.equal(chairman.user.gender, "male");
  const groups = await call("messaging/conversations", manager.cookie, {
    kind: "group",
    title: "Creative review",
    members: [deepthi.user.id, bhavani.user.id],
  });
  assert.equal(groups.status, 201);
  for (const person of [deepthi, bhavani, lead])
    assert.equal(
      (
        await call("messaging/conversations", person.cookie, {
          kind: "group",
          title: "Denied group",
          members: [manager.user.id],
        })
      ).status,
      403,
    );
  assert.equal(
    (
      await call("messaging/conversations", manager.cookie, {
        kind: "channel",
        title: "Deferred",
        members: [deepthi.user.id],
      })
    ).status,
    403,
  );
  const direct = await call("messaging/conversations", deepthi.cookie, {
    kind: "direct",
    members: [bhavani.user.id],
  });
  assert.equal(direct.status, 201);
  assert.equal(
    (
      await call("messaging/conversations", bhavani.cookie, {
        kind: "direct",
        members: [deepthi.user.id],
      })
    ).data.id,
    direct.data.id,
  );
  const conversationId = direct.data.id;
  const duplicateDirects = await Promise.all(
    Array.from({ length: 4 }, () =>
      call("messaging/conversations", deepthi.cookie, {
        kind: "direct",
        members: [bhavani.user.id],
      }),
    ),
  );
  assert.ok(
    duplicateDirects.every((result) => result.data.id === conversationId),
  );
  assert.equal(
    (
      await call(
        `messaging/conversations/${conversationId}/messages`,
        chairman.cookie,
      )
    ).status,
    403,
    "Chairman cannot read a private conversation",
  );
  function connect(person) {
    const client = io(api, {
      path: "/api/messaging/socket.io",
      autoConnect: false,
      reconnection: false,
      extraHeaders: { Cookie: person.cookie, Origin: origin },
    });
    clients.push(client);
    return new Promise((resolve, reject) => {
      client.once("connect", () => resolve(client));
      client.once("connect_error", reject);
      client.connect();
    });
  }
  async function deniedConnection(headers) {
    const client = io(api, {
      path: "/api/messaging/socket.io",
      autoConnect: false,
      reconnection: false,
      timeout: 3000,
      extraHeaders: headers,
    });
    clients.push(client);
    await new Promise((resolve, reject) => {
      client.once("connect", () =>
        reject(new Error("An unauthorized socket connected.")),
      );
      client.once("connect_error", resolve);
      client.connect();
    });
    client.disconnect();
  }
  await deniedConnection({ Origin: origin });
  await deniedConnection({
    Origin: "https://untrusted.invalid",
    Cookie: deepthi.cookie,
  });
  const [a, b, outsider] = await Promise.all([
    connect(deepthi),
    connect(bhavani),
    connect(chairman),
  ]);
  const send = (client, body, attachments = [], clientId = randomUUID()) =>
    client.timeout(10000).emitWithAck("message:send", {
      conversationId,
      clientId,
      body,
      attachments,
    });
  const attempts = await Promise.all(
    Array.from({ length: 20 }, (_, index) =>
      send(index % 2 ? a : b, `Concurrent message ${index}`),
    ),
  );
  assert.ok(attempts.every((result) => result.id && !result.error));
  assert.equal(new Set(attempts.map((result) => result.id)).size, 20);
  const clientId = randomUUID();
  const first = await send(a, "Retry-safe message", [], clientId);
  assert.equal(
    (await send(a, "Retry-safe message", [], clientId)).id,
    first.id,
  );
  assert.ok((await send(outsider, "Forbidden message")).error);
  const content = Buffer.from("%PDF-1.4\nShared attachment evidence");
  const upload = await fetch(
    `${api}/api/auth/messaging/conversations/${conversationId}/attachments`,
    {
      method: "POST",
      headers: {
        Cookie: deepthi.cookie,
        "Content-Type": "application/octet-stream",
        "X-File-Name": "review-proof.pdf",
      },
      body: content,
    },
  );
  assert.equal(upload.status, 201);
  const file = await upload.json();
  const fileUrl = `${api}/api/auth/messaging/attachments/${file.id}`;
  assert.equal(
    (await fetch(fileUrl, { headers: { Cookie: bhavani.cookie } })).status,
    403,
  );
  assert.ok(
    (await send(b, "Cannot reuse another uploader’s pending file.", [file.id]))
      .error,
  );
  assert.ok((await send(a, "Please review the PDF.", [file.id])).id);
  assert.deepEqual(
    Buffer.from(
      await (
        await fetch(fileUrl, { headers: { Cookie: bhavani.cookie } })
      ).arrayBuffer(),
    ),
    content,
  );
  assert.equal(
    (await fetch(fileUrl, { headers: { Cookie: chairman.cookie } })).status,
    403,
  );
  assert.equal(
    (
      await call(
        `messaging/attachments/${file.id}`,
        deepthi.cookie,
        undefined,
        "DELETE",
      )
    ).status,
    403,
  );
  let messages = (
    await call(
      `messaging/conversations/${conversationId}/messages`,
      bhavani.cookie,
    )
  ).data.messages;
  assert.equal(messages.length, 22);
  await Promise.all(
    Array.from({ length: 31 }, (_, index) =>
      send(b, `History page message ${index}`),
    ),
  );
  messages = (
    await call(
      `messaging/conversations/${conversationId}/messages`,
      bhavani.cookie,
    )
  ).data.messages;
  assert.equal(messages.length, 50);
  const earlier = (
    await call(
      `messaging/conversations/${conversationId}/messages?before=${messages[0].id}`,
      bhavani.cookie,
    )
  ).data.messages;
  assert.equal(earlier.length, 3);
  assert.equal(
    (
      await call(
        `messaging/conversations/${conversationId}/read`,
        bhavani.cookie,
        { lastId: messages.at(-1).id },
      )
    ).status,
    200,
  );
  assert.equal(
    (await call("messaging", bhavani.cookie)).data.conversations.find(
      (item) => item.id === conversationId,
    ).unread,
    0,
  );
  console.log(
    "PASS: real sign-ins in disposable DB, gender, permissions, concurrent Socket.IO delivery, idempotent retries, unread tracking and private attachments.",
  );

  const rich = require("./messaging-rich-checks.cjs");
  const richPng = await rich.verifyServer({
    a,
    b,
    connect,
    call,
    people: { deepthi, bhavani, chairman },
    conversationId,
    api,
  });
  const accessChecks = require("./chat-access-checks.cjs");
  await accessChecks.serverSizes({
    api,
    cookie: deepthi.cookie,
    conversationId,
  });
  vite = spawn(
    process.execPath,
    [
      path.join(frontend, "node_modules/vite/bin/vite.js"),
      "--host",
      "127.0.0.1",
      "--port",
      String(frontendPort),
      "--strictPort",
    ],
    {
      cwd: frontend,
      env: { ...process.env, IOTS_API_TARGET: api },
      windowsHide: true,
      stdio: ["ignore", "pipe", "pipe"],
    },
  );
  await new Promise((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error("Test frontend did not start.")),
      20000,
    );
    vite.stdout.on("data", (data) => {
      if (data.toString().includes("Local:")) {
        clearTimeout(timer);
        resolve();
      }
    });
    vite.stderr.on("data", (data) => process.stderr.write(data));
    vite.once("exit", (code) => {
      clearTimeout(timer);
      reject(new Error(`Test frontend exited: ${code}`));
    });
  });
  browser = await chromium.launch({ channel: "msedge", headless: true });
  const privateFile = path.join(storage, "files", file.id).replace(/\\/g, "/");
  assert.notEqual(
    (await fetch(`${origin}/@fs/${privateFile}`)).status,
    200,
    "Vite cannot serve private chat storage",
  );
  await accessChecks.permissionGate({ browser, origin, person: deepthi });
  const errors = [];
  async function pageFor(person, width = 1440) {
    const context = await browser.newContext({
      viewport: { width, height: 1000 },
      reducedMotion: "reduce",
    });
    await context.grantPermissions(["notifications"], { origin });
    await context.addInitScript(() => {
      const NativeNotification = window.Notification;
      window.__chatNotices = [];
      window.Notification = new Proxy(NativeNotification, {
        get: (target, property) => Reflect.get(target, property, target),
        construct(target, argumentsList) {
          const notice = Reflect.construct(target, argumentsList);
          window.__chatNotices.push({
            title: argumentsList[0],
            body: argumentsList[1]?.body,
            notice,
          });
          notice.close();
          return notice;
        },
      });
    });
    await context.addCookies([
      {
        name: "iots_session",
        value: person.cookie.split("=")[1],
        domain: "127.0.0.1",
        path: "/api",
        httpOnly: true,
        sameSite: "Strict",
      },
    ]);
    const page = await context.newPage();
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(origin);
    await page
      .getByRole("heading", { level: 1 })
      .filter({ hasText: person.user.name })
      .waitFor();
    await page.locator(".messaging-launcher").click();
    await page
      .locator(".messaging-heading p")
      .filter({ hasText: "Connected" })
      .waitFor({ timeout: 20000 });
    return page;
  }
  const pageA = await pageFor(deepthi),
    pageB = await pageFor(bhavani);
  assert.match(
    await pageA.locator(".summary-creative-artist").getAttribute("src"),
    /creative-artist-female/,
  );
  assert.equal(await pageB.locator(".summary-creative-artist").count(), 0);
  await pageA
    .locator(".messaging-conversation")
    .filter({ hasText: bhavani.user.name })
    .click();
  await pageB
    .locator(".messaging-conversation")
    .filter({ hasText: deepthi.user.name })
    .click();
  await accessChecks.composer({ pageA, pageB, openTool: rich.openTool });
  await pageA
    .getByRole("textbox", { name: "Message", exact: true })
    .fill("Browser-to-browser live message");
  await pageA
    .getByRole("button", { name: "Send message", exact: true })
    .click();
  await pageB
    .locator(".messaging-bubble > p")
    .filter({ hasText: /^Browser-to-browser live message$/ })
    .waitFor();
  await pageB.context().setOffline(true);
  await pageA
    .getByRole("textbox", { name: "Message", exact: true })
    .fill("Recovered after reconnect");
  await pageA
    .getByRole("button", { name: "Send message", exact: true })
    .click();
  await pageA.getByText("Recovered after reconnect", { exact: true }).waitFor();
  await pageB.context().setOffline(false);
  await pageB
    .getByText("Recovered after reconnect", { exact: true })
    .waitFor({ timeout: 20000 });
  await rich.openTool(pageA, "Document");
  await pageA.locator(".messaging-upload input[type=file]").setInputFiles({
    name: "browser-proof.pdf",
    mimeType: "application/pdf",
    buffer: content,
  });
  await pageA
    .getByRole("button", { name: "Remove browser-proof.pdf", exact: true })
    .waitFor();
  await pageA
    .getByRole("button", { name: "Send message", exact: true })
    .click();
  const attachment = pageB
    .locator(".messaging-file")
    .filter({ hasText: "browser-proof.pdf" });
  await attachment.waitFor();
  const [download] = await Promise.all([
    pageB.waitForEvent("download"),
    attachment.click(),
  ]);
  const chunks = [];
  for await (const chunk of await download.createReadStream())
    chunks.push(chunk);
  assert.deepEqual(Buffer.concat(chunks), content);
  await pageB.waitForFunction(() => {
    const pane = document.querySelector(".messaging-history");
    return pane && getComputedStyle(pane).maskImage !== "none";
  });
  await fs.mkdir(reports, { recursive: true });
  await rich.verifyBrowser({ pageA, pageB, png: richPng, reports });
  await pageB.reload();
  await pageB.locator(".messaging-launcher").click();
  await pageB
    .locator(".messaging-conversation")
    .filter({ hasText: deepthi.user.name })
    .click();
  await pageB
    .locator(".messaging-bubble > p")
    .filter({ hasText: /^Browser-to-browser live message$/ })
    .waitFor();
  await pageA
    .getByRole("button", { name: "Back to conversations", exact: true })
    .click();
  await pageA
    .getByRole("button", { name: "New conversation", exact: true })
    .click();
  await pageA
    .getByRole("menuitem", { name: "New direct message", exact: true })
    .waitFor();
  assert.equal(
    await pageA
      .getByRole("menuitem", { name: "New group", exact: true })
      .count(),
    0,
  );
  await pageA.keyboard.press("Escape");
  const managerPage = await pageFor(manager);
  await managerPage
    .getByRole("button", { name: "New conversation", exact: true })
    .click();
  await managerPage
    .getByRole("menuitem", { name: "New group", exact: true })
    .click();
  await managerPage
    .getByLabel("Group name", { exact: true })
    .fill("Leadership review");
  await managerPage
    .locator(".messaging-directory label")
    .filter({ hasText: deepthi.user.name })
    .locator("input")
    .check();
  await managerPage
    .getByRole("button", { name: "Create group", exact: true })
    .click();
  await managerPage
    .locator("#messaging-title")
    .filter({ hasText: "Leadership review" })
    .waitFor();
  await fs.mkdir(reports, { recursive: true });
  await pageB.screenshot({
    path: path.join(reports, "desktop-messages.png"),
    fullPage: true,
  });
  const mobile = await pageFor(deepthi, 390);
  await mobile
    .locator(".messaging-conversation")
    .filter({ hasText: bhavani.user.name })
    .click();
  assert.equal(
    await mobile.evaluate(
      () => document.documentElement.scrollWidth > innerWidth + 1,
    ),
    false,
  );
  await mobile.screenshot({
    path: path.join(reports, "mobile-messages.png"),
    fullPage: true,
  });
  await mobile.evaluate(() => document.documentElement.classList.add("dark"));
  await mobile.screenshot({
    path: path.join(reports, "mobile-dark-messages.png"),
    fullPage: true,
  });
  assert.equal(
    await mobile
      .locator("[aria-label*=voice i],[aria-label*=record i]")
      .count(),
    0,
  );
  assert.deepEqual(errors, []);
  await pageB.context().close();
  await mobile
    .locator(".messaging-heading .messaging-presence")
    .filter({ hasText: "Offline" })
    .waitFor({ timeout: 10000 });
  await mobile
    .locator(".messaging-heading .messaging-presence")
    .filter({ hasText: "Last seen" })
    .waitFor();
  await mobile.screenshot({
    path: path.join(reports, "mobile-last-seen.png"),
    fullPage: false,
  });
  const male = await login("kanna");
  await pool.execute(
    "INSERT INTO employee_roles (employee_id,role_code) VALUES (?,?)",
    [male.user.id, "creative-communication-associate"],
  );
  assert.equal(
    (
      await call("role", male.cookie, {
        role: "creative-communication-associate",
      })
    ).status,
    200,
  );
  const malePage = await pageFor(male);
  assert.match(
    await malePage.locator(".summary-creative-artist").getAttribute("src"),
    /creative-artist-male/,
  );
  const chairPage = await pageFor(chairman);
  for (const person of [
    lead,
    await login("harshitha"),
    await login("manikanta"),
    await login("superadmin"),
    await login("admin"),
  ]) {
    const greetingPage = await pageFor(person);
    await greetingPage.context().close();
  }
  console.log(
    "PASS: named greetings across operational, coordinator, IT, Chairman and administrative accounts.",
  );
  await chairPage
    .getByRole("button", { name: "New conversation", exact: true })
    .click();
  await chairPage
    .getByRole("menuitem", { name: "New group", exact: true })
    .waitFor();
  console.log(
    "PASS: separate browser accounts, live messages, shared file downloads, persisted history, manager group creation, desktop/mobile and dark theme.",
  );
  await pool.execute("DELETE FROM sessions WHERE token_hash=?", [
    require("node:crypto")
      .createHash("sha256")
      .update(deepthi.cookie.split("=")[1])
      .digest("hex"),
  ]);
  assert.ok((await send(a, "Session was revoked")).error);
  assert.equal((await call("messaging", deepthi.cookie)).status, 401);
  console.log("PASS: revoked sessions cannot send or fetch messages.");
}
main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (browser) await browser.close();
    for (const client of clients) client.disconnect();
    if (vite) vite.kill();
    if (sockets) await new Promise((resolve) => sockets.close(resolve));
    else if (server) await new Promise((resolve) => server.close(resolve));
    if (pool) await pool.end();
    if (admin) {
      assert.match(database, /^iots_chat_test_\d+$/);
      await admin.query(`DROP DATABASE IF EXISTS \`${database}\``);
      await admin.end();
    }
    const expected = path.join(root, ".local", database);
    assert.equal(path.resolve(storage), expected);
    await fs.rm(expected, { recursive: true, force: true });
  });

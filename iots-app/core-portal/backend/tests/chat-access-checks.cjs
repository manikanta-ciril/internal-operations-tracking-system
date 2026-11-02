const assert = require("node:assert/strict");
async function permissionGate({ browser, origin, person }) {
  const context = await browser.newContext({ reducedMotion: "reduce" });
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
  const sockets = [];
  page.on("websocket", (socket) => {
    if (socket.url().includes("/api/messaging/socket.io")) sockets.push(socket);
  });
  await page.goto(origin);
  await page
    .getByRole("button", { name: "Open team messages", exact: true })
    .click();
  await page
    .getByRole("heading", {
      name: "Desktop notifications required",
      exact: true,
    })
    .waitFor();
  assert.equal(sockets.length, 0);
  assert.equal(await page.locator(".messaging-composer").count(), 0);
  await context.grantPermissions(["notifications"], { origin });
  await page
    .locator(".messaging-heading")
    .filter({ hasText: "Connected" })
    .waitFor();
  await context.clearPermissions();
  await page.evaluate(() => window.dispatchEvent(new Event("focus")));
  await page
    .getByRole("heading", {
      name: "Desktop notifications required",
      exact: true,
    })
    .waitFor();
  assert.equal(await page.locator(".messaging-composer").count(), 0);
  await context.close();
  console.log(
    "PASS: chat stays disconnected before notification consent and locks again on permission revocation.",
  );
}
async function serverSizes({ api, cookie, conversationId }) {
  const url = `${api}/api/auth/messaging/conversations/${conversationId}/attachments`;
  const headers = {
    Cookie: cookie,
    "Content-Type": "application/octet-stream",
    "X-File-Name": "boundary.pdf",
    "X-Attachment-Kind": "documents",
  };
  const accepted = await fetch(url, {
    method: "POST",
    headers,
    body: Buffer.alloc(30 * 1024 * 1024, 65),
  });
  assert.equal(accepted.status, 201);
  const attachment = await accepted.json();
  assert.equal(attachment.size, 30 * 1024 * 1024);
  await fetch(`${api}/api/auth/messaging/attachments/${attachment.id}`, {
    method: "DELETE",
    headers: { Cookie: cookie },
  });
  const rejected = await fetch(url, {
    method: "POST",
    headers,
    body: Buffer.alloc(30 * 1024 * 1024 + 1, 65),
  });
  assert.equal(rejected.status, 413);
  assert.match((await rejected.json()).message, /30 MB/);
  const wrongKind = await fetch(url, {
    method: "POST",
    headers: { ...headers, "X-File-Name": "image.png" },
    body: Buffer.from("image in document slot"),
  });
  assert.equal(wrongKind.status, 400);
  console.log(
    "PASS: server accepts exactly 30 MB and rejects larger files and wrong attachment categories.",
  );
}
async function composer({ pageA, pageB, openTool }) {
  const input = pageA.getByRole("textbox", { name: "Message", exact: true });
  await input.fill("Enter focus check");
  await input.press("Enter");
  await pageB.getByText("Enter focus check", { exact: true }).waitFor();
  await pageA.waitForFunction(() => {
    const editor = document.querySelector(".messaging-composer textarea");
    return editor === document.activeElement && !editor.readOnly;
  });
  await pageA
    .getByRole("button", { name: "Add to message", exact: true })
    .click();
  assert.equal(
    await pageA.getByRole("menuitem", { name: "Camera", exact: true }).count(),
    0,
  );
  await pageA.keyboard.press("Escape");
  const images = await pageA
    .getByLabel("Choose message images", { exact: true })
    .getAttribute("accept");
  assert.ok(images.includes(".png") && !images.includes(".pdf"));
  await openTool(pageA, "Document");
  const files = pageA.locator(".messaging-upload input[type=file]");
  const documents = await files.getAttribute("accept");
  assert.ok(
    documents.includes(".pdf") &&
      !documents.includes(".png") &&
      !documents.includes(".zip"),
  );
  await files.evaluate((input) => {
    const transfer = new DataTransfer();
    transfer.items.add(
      new File([new Uint8Array(30 * 1024 * 1024 + 1)], "oversized.pdf", {
        type: "application/pdf",
      }),
    );
    input.files = transfer.files;
    input.dispatchEvent(new Event("change", { bubbles: true }));
  });
  await pageA
    .locator(".messaging-window [role=alert]")
    .filter({ hasText: /oversized.pdf.*30 MB/ })
    .waitFor();
  await openTool(pageA, "Document");
  await pageA
    .getByRole("button", { name: "Retry messaging connection", exact: true })
    .click();
  await pageA
    .getByRole("button", { name: "Close messages", exact: true })
    .click();
  await pageB
    .getByRole("textbox", { name: "Message", exact: true })
    .fill("Desktop notice check");
  await pageB
    .getByRole("textbox", { name: "Message", exact: true })
    .press("Enter");
  await pageA.waitForFunction(() =>
    window.__chatNotices.some(
      (notice) => notice.body === "Desktop notice check",
    ),
  );
  await pageA.evaluate(() =>
    window.__chatNotices
      .find((notice) => notice.body === "Desktop notice check")
      .notice.onclick(),
  );
  await pageA
    .locator(".messaging-heading")
    .filter({ hasText: "Bhavani" })
    .waitFor();
  console.log(
    "PASS: Enter retains message focus, Camera is absent, file filters are separate and oversized errors stay inside chat.",
  );
  console.log(
    "PASS: browser desktop notification creation and click-to-open conversation.",
  );
}
module.exports = { permissionGate, serverSizes, composer };

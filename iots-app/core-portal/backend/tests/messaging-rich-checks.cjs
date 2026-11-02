const assert = require("node:assert/strict");
const { randomUUID } = require("node:crypto");
const sharp = require("sharp");
const path = require("node:path");

async function verifyServer({
  a,
  b,
  connect,
  call,
  people,
  conversationId,
  api,
}) {
  const { deepthi, bhavani, chairman } = people;
  const send = (content) =>
    a
      .timeout(10000)
      .emitWithAck("message:send", {
        conversationId,
        clientId: randomUUID(),
        body: "",
        content,
      });
  const poll = await send({
    type: "poll",
    question: "Server poll",
    options: ["A", "B"],
    multiple: false,
  });
  assert.ok(poll.id, poll.error);
  const action = (id, endpoint, person, body) =>
    call(`messaging/messages/${id}/${endpoint}`, person.cookie, body);
  assert.equal(
    (await action(poll.id, "vote", bhavani, { options: [0] })).status,
    200,
  );
  assert.equal(
    (await action(poll.id, "vote", chairman, { options: [1] })).status,
    403,
  );
  assert.equal(
    (await action(poll.id, "vote", deepthi, { options: [0, 1] })).status,
    400,
  );
  const history = (person) =>
    call(`messaging/conversations/${conversationId}/messages`, person.cookie);
  let messages = (await history(bhavani)).data.messages;
  assert.equal(
    messages.find((message) => message.id === poll.id).content.totalVoters,
    1,
  );
  assert.equal(
    messages.find((message) => message.id === poll.id).content.results[0].mine,
    true,
  );
  const checklist = await send({
    type: "checklist",
    title: "Server checklist",
    items: ["First", "Second"],
  });
  assert.ok(checklist.id, checklist.error);
  await Promise.all([
    action(checklist.id, "checkItem", deepthi, { index: 0, checked: true }),
    action(checklist.id, "checkItem", bhavani, { index: 1, checked: true }),
  ]);
  messages = (await history(deepthi)).data.messages;
  assert.equal(
    messages
      .find((message) => message.id === checklist.id)
      .content.checks.filter((entry) => entry.checked).length,
    2,
  );
  assert.equal(
    (
      await action(checklist.id, "checkItem", chairman, {
        index: 0,
        checked: false,
      })
    ).status,
    403,
  );
  assert.equal(
    (
      await action(checklist.id, "checkItem", deepthi, {
        index: -1,
        checked: true,
      })
    ).status,
    400,
  );
  const reply = await a
    .timeout(10000)
    .emitWithAck("message:send", {
      conversationId,
      clientId: randomUUID(),
      body: "Quoted reply",
      replyTo: poll.id,
    });
  assert.ok(reply.id, reply.error);
  messages = (await history(bhavani)).data.messages;
  assert.equal(
    messages.find((message) => message.id === reply.id).replyBody,
    "Server poll",
  );
  assert.ok(
    (
      await a
        .timeout(10000)
        .emitWithAck("message:send", {
          conversationId,
          clientId: randomUUID(),
          body: "Invalid reply",
          replyTo: 9999999,
        })
    ).error,
  );
  assert.equal(
    (
      await fetch(`${api}/api/auth/messaging/messages/${poll.id}`, {
        method: "DELETE",
        headers: { Cookie: deepthi.cookie },
      })
    ).status,
    404,
  );
  const png = await sharp({
    create: { width: 300, height: 180, channels: 3, background: "#805D2C" },
  })
    .png()
    .toBuffer();
  const upload = await fetch(
    `${api}/api/auth/messaging/conversations/${conversationId}/attachments`,
    {
      method: "POST",
      headers: {
        Cookie: deepthi.cookie,
        "Content-Type": "application/octet-stream",
        "X-File-Name": "server-image.png",
      },
      body: png,
    },
  );
  const image = await upload.json();
  assert.equal(upload.status, 201);
  assert.equal(image.mediaType, "image/png");
  const sentImage = await a
    .timeout(10000)
    .emitWithAck("message:send", {
      conversationId,
      clientId: randomUUID(),
      body: "",
      attachments: [image.id],
    });
  assert.ok(sentImage.id, sentImage.error);
  const preview = await fetch(
    `${api}/api/auth/messaging/attachments/${image.id}?preview=1`,
    { headers: { Cookie: bhavani.cookie } },
  );
  assert.equal(preview.headers.get("content-type"), "image/png");
  assert.deepEqual(Buffer.from(await preview.arrayBuffer()), png);
  const corrupt = await fetch(
    `${api}/api/auth/messaging/conversations/${conversationId}/attachments`,
    {
      method: "POST",
      headers: {
        Cookie: deepthi.cookie,
        "Content-Type": "application/octet-stream",
        "X-File-Name": "corrupt.png",
      },
      body: Buffer.from("not an image"),
    },
  );
  assert.equal(corrupt.status, 400);
  const extra = await connect(bhavani);
  b.disconnect();
  assert.equal(
    (await call("messaging", deepthi.cookie)).data.employees.find(
      (employee) => employee.id === bhavani.user.id,
    ).online,
    true,
  );
  extra.disconnect();
  for (let attempt = 0; attempt < 20; attempt++) {
    const peer = (await call("messaging", deepthi.cookie)).data.employees.find(
      (employee) => employee.id === bhavani.user.id,
    );
    if (!peer.online && peer.lastSeen) break;
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  const offline = (await call("messaging", deepthi.cookie)).data.employees.find(
    (employee) => employee.id === bhavani.user.id,
  );
  assert.equal(offline.online, false);
  assert.ok(offline.lastSeen);
  console.log(
    "PASS: polls, concurrent checklist updates, reply integrity, image validation/previews and multi-tab online/last-seen.",
  );
  return png;
}

async function openTool(page, name) {
  await page
    .getByRole("button", { name: "Add to message", exact: true })
    .click();
  await page.getByRole("menuitem", { name, exact: true }).click();
}
async function verifyBrowser({ pageA, pageB, png, reports }) {
  await pageB
    .locator(".messaging-message")
    .filter({
      has: pageB.getByText("Browser-to-browser live message", { exact: true }),
    })
    .getByRole("button", { name: /Reply to/ })
    .click();
  await pageB.locator(".messaging-reply-preview").waitFor();
  await pageB
    .getByRole("textbox", { name: "Message", exact: true })
    .fill("Reply from Bhavani");
  await pageB
    .getByRole("button", { name: "Send message", exact: true })
    .click();
  await pageA.getByText("Reply from Bhavani", { exact: true }).waitFor();
  await pageA
    .locator(".messaging-message")
    .filter({ has: pageA.getByText("Reply from Bhavani", { exact: true }) })
    .getByRole("button", { name: "View original message", exact: true })
    .click();
  await openTool(pageA, "Poll");
  const pollDialog = pageA.getByRole("dialog", {
    name: "Create poll",
    exact: true,
  });
  await pollDialog
    .getByLabel("Question", { exact: true })
    .fill("Which creative direction?");
  await pollDialog.getByLabel("Option 1", { exact: true }).fill("Warm bronze");
  await pollDialog.getByLabel("Option 2", { exact: true }).fill("Cool slate");
  await pollDialog
    .getByRole("button", { name: "Send poll", exact: true })
    .click();
  const pollB = pageB.getByRole("region", {
    name: "Which creative direction?",
    exact: true,
  });
  // A named section has the region role; votes are persisted before they are shown as saved.
  await pollB.getByRole("button", { name: /Warm bronze/ }).click();
  await pageA.getByText("1 person voted", { exact: true }).waitFor();
  await pageB.screenshot({
    path: path.join(reports, "chat-poll.png"),
    fullPage: false,
  });
  await openTool(pageA, "Checklist");
  const checklistDialog = pageA.getByRole("dialog", {
    name: "Create checklist",
    exact: true,
  });
  await checklistDialog
    .getByLabel("Checklist title", { exact: true })
    .fill("Ready to publish");
  await checklistDialog
    .getByLabel("Item 1", { exact: true })
    .fill("Proofread copy");
  await checklistDialog
    .getByLabel("Item 2", { exact: true })
    .fill("Export final design");
  await checklistDialog
    .getByRole("button", { name: "Send checklist", exact: true })
    .click();
  await pageB.getByRole("checkbox", { name: /^Proofread copy/ }).check();
  await pageA.getByText("1 of 2 complete", { exact: true }).waitFor();
  await pageB.screenshot({
    path: path.join(reports, "chat-checklist.png"),
    fullPage: false,
  });
  const [chooser] = await Promise.all([
    pageA.waitForEvent("filechooser"),
    openTool(pageA, "Images"),
  ]);
  await chooser.setFiles({
    name: "manual-image.png",
    mimeType: "image/png",
    buffer: png,
  });
  await pageA
    .getByRole("button", { name: "Remove manual-image.png", exact: true })
    .waitFor();
  await pageA
    .getByRole("button", { name: "Send message", exact: true })
    .click();
  await pageB
    .getByRole("button", { name: "View image manual-image.png", exact: true })
    .waitFor();
  await pageA
    .getByRole("textbox", { name: "Message", exact: true })
    .evaluate((textarea, encoded) => {
      const bytes = Uint8Array.from(atob(encoded), (character) =>
        character.charCodeAt(0),
      );
      const clipboard = new DataTransfer();
      clipboard.items.add(
        new File([bytes], "clipboard-image.png", { type: "image/png" }),
      );
      textarea.dispatchEvent(
        new ClipboardEvent("paste", {
          clipboardData: clipboard,
          bubbles: true,
          cancelable: true,
        }),
      );
    }, png.toString("base64"));
  await pageA
    .getByRole("button", { name: "Remove clipboard-image.png", exact: true })
    .waitFor();
  await pageA
    .getByRole("button", { name: "Send message", exact: true })
    .click();
  const image = pageB.getByRole("button", {
    name: "View image clipboard-image.png",
    exact: true,
  });
  await image.waitFor();
  await image.click();
  await pageB
    .getByRole("dialog", { name: "clipboard-image.png", exact: true })
    .waitFor();
  await pageB
    .getByRole("button", { name: "Close dialog", exact: true })
    .click();
  assert.equal(
    await pageA.getByRole("button", { name: /^(Edit|Delete) message/ }).count(),
    0,
  );
  const profileCenter = await pageA
    .locator(".profile-trigger")
    .evaluate((button) => {
      const icon = button.querySelector("svg").getBoundingClientRect(),
        control = button.getBoundingClientRect();
      return Math.abs(
        icon.y + icon.height / 2 - control.y - control.height / 2,
      );
    });
  assert.ok(
    profileCenter <= 1,
    `Profile icon center differs by ${profileCenter}px`,
  );
  assert.equal(
    await pageB
      .locator(".design-summary")
      .evaluate((grid) => getComputedStyle(grid).paddingTop),
    "0px",
  );
  await pageA
    .getByRole("button", { name: "Open profile menu", exact: true })
    .click();
  const dashboard = pageA
    .getByRole("dialog", { name: "Profile menu", exact: true })
    .getByRole("link", { name: "Dashboard", exact: true });
  assert.match(await dashboard.getAttribute("href"), /\/tasks$/);
  await dashboard.click();
  assert.match(new URL(pageA.url()).pathname, /\/tasks$/);
  await pageA
    .getByRole("button", { name: /Member welcome stationery/ })
    .first()
    .waitFor();
  await pageB.screenshot({
    path: path.join(reports, "rich-chat-desktop.png"),
    fullPage: false,
  });
  console.log(
    "PASS: browser poll votes, shared checklist, replies, manual/clipboard images, image viewer, profile alignment and canonical task navigation.",
  );
}
module.exports = { verifyServer, verifyBrowser, openTool };

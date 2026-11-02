const assert = require("node:assert/strict");
const { randomUUID } = require("node:crypto");
const {
  canCreateGroup,
  identifier,
  messageInput,
  attachmentName,
} = require("../src/messaging/policy");
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
  "business-development-executive",
  "creative-communication-associate",
  "it-system-analyst",
  "__proto__",
])
  assert.equal(canCreateGroup(role), false);
assert.throws(() => identifier("../../private"));
assert.throws(() => identifier(null));
assert.throws(() => messageInput(null), error => error.status === 400);
assert.throws(() => messageInput([]), error => error.status === 400);
for (const file of [
  "../secret.txt",
  "folder%2Fsecret.txt",
  "script.html",
  "image.svg",
  "voice.mp3",
  "%ZZ.pdf",
  "line%0Abreak.pdf",
])
  assert.throws(() => attachmentName(file));
assert.equal(attachmentName("Brand%20Kit.pdf"), "Brand Kit.pdf");
assert.throws(() => attachmentName('photo.png', 'documents'));
assert.throws(() => attachmentName('brief.pdf', 'images'));
assert.equal(attachmentName('notes.doc', 'documents'), 'notes.doc');
assert.throws(() => attachmentName('bundle.zip'));
const input = {
  conversationId: randomUUID(),
  clientId: randomUUID(),
  body: "  Review the brief.  ",
  attachments: [],
};
assert.equal(messageInput(input).body, "Review the brief.");
assert.throws(() => messageInput({ ...input, body: " " }));
assert.throws(() => messageInput({ ...input, body: "x".repeat(4001) }));
assert.throws(() =>
  messageInput({
    ...input,
    attachments: Array.from({ length: 11 }, () => randomUUID()),
  }),
);
assert.throws(() => messageInput({ ...input, attachments: [123] }));
const file = randomUUID();
assert.deepEqual(
  messageInput({ ...input, body: "", attachments: [file, file] }).attachments,
  [file],
);
console.log(
  "PASS: messaging role policy, IDs, text limits, attachment limits and safe download names.",
);

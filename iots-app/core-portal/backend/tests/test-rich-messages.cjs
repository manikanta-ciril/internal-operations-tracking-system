const assert = require("node:assert/strict");
const { randomUUID } = require("node:crypto");
const { messageInput } = require("../src/messaging/policy");
const envelope = {
  conversationId: randomUUID(),
  clientId: randomUUID(),
  body: "",
  attachments: [],
};
const poll = {
  type: "poll",
  question: "Review time?",
  options: ["Morning", "Afternoon"],
  multiple: false,
};
const checklist = {
  type: "checklist",
  title: "Release checks",
  items: ["Proofread"],
};
// Boundaries: polls 2–12 options; checklists 1–12 items; empty, duplicate, oversized and unknown content fail.
assert.deepEqual(messageInput({ ...envelope, content: poll }).content, poll);
assert.deepEqual(
  messageInput({ ...envelope, content: checklist }).content,
  checklist,
);
for (const options of [
  [],
  ["Only one"],
  Array.from({ length: 13 }, (_, index) => String(index)),
  ["Same", " same "],
]) {
  assert.throws(() =>
    messageInput({ ...envelope, content: { ...poll, options } }),
  );
}
assert.throws(() =>
  messageInput({ ...envelope, content: { ...poll, multiple: "yes" } }),
);
assert.throws(() =>
  messageInput({ ...envelope, content: { ...checklist, items: [] } }),
);
assert.throws(() =>
  messageInput({ ...envelope, content: { type: "__proto__" } }),
);
assert.throws(() =>
  messageInput({
    ...envelope,
    content: { ...poll, question: "x".repeat(121) },
  }),
);
assert.equal(
  messageInput({ ...envelope, body: "Reply", replyTo: 42 }).replyTo,
  42,
);
for (const replyTo of [0, -1, 1.5, "42", Number.MAX_SAFE_INTEGER + 1])
  assert.throws(() => messageInput({ ...envelope, body: "Reply", replyTo }));
console.log(
  "PASS: rich message definitions, immutable content boundaries and reply IDs.",
);

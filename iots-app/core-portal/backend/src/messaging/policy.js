const creators = new Set([
  "chairman",
  "general-manager",
  "senior-manager",
  "executive",
  "super-admin",
]);
const { messageContent, messageNumber } = require("./content");
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const extensions = new Set([
  "pdf",
  "png",
  "jpg",
  "jpeg",
  "webp",
  "gif",
  "txt",
  "csv",
  "doc",
  "xls",
  "ppt",
  "odt",
  "ods",
  "odp",
  "rtf",
  "md",
  "docx",
  "xlsx",
  "pptx",
]);
const fail = (status, message) => Object.assign(new Error(message), { status });
const canCreateGroup = (role) => creators.has(role);
function identifier(value) {
  if (typeof value !== "string" || !uuid.test(value))
    throw fail(400, "Invalid conversation or attachment ID.");
  return value;
}
function messageInput(input = {}) {
  if (!input || typeof input !== "object" || Array.isArray(input))
    throw fail(400, "Enter a valid message.");
  const conversationId = identifier(input.conversationId);
  const clientId = identifier(input.clientId);
  if (typeof input.body !== "string" || input.body.length > 4000)
    throw fail(400, "Messages must contain at most 4,000 characters.");
  const attachments = input.attachments ?? [];
  if (!Array.isArray(attachments) || attachments.length > 10)
    throw fail(400, "Attach at most 10 files.");
  const ids = [...new Set(attachments.map(identifier))];
  const content = messageContent(input.content);
  const replyTo = input.replyTo == null ? null : messageNumber(input.replyTo);
  if (!input.body.trim() && !ids.length && !content)
    throw fail(400, "Write a message or attach a file.");
  return {
    conversationId,
    clientId,
    body: input.body.trim(),
    attachments: ids,
    content,
    replyTo,
  };
}
function attachmentName(value, kind) {
  let name;
  try {
    name = decodeURIComponent(value || "");
  } catch {
    throw fail(400, "Invalid file name.");
  }
  if (
    !name ||
    name.length > 200 ||
    /[\x00-\x1f\x7f/\\]/.test(name) ||
    !extensions.has(name.split(".").pop().toLowerCase())
  )
    throw fail(400, "Choose a supported image or document.");
  const image = /\.(png|jpe?g|webp|gif)$/i.test(name);
  if (
    kind &&
    (!["images", "documents"].includes(kind) || (kind === "images") !== image)
  )
    throw fail(
      400,
      kind === "images" ? "Choose an image file." : "Choose a document file.",
    );
  return name;
}
module.exports = {
  canCreateGroup,
  identifier,
  messageInput,
  attachmentName,
  fail,
};

const invalid = (message) => Object.assign(new Error(message), { status: 400 });
function text(label, content, maximum) {
  if (
    typeof content !== "string" ||
    !content.trim() ||
    content.trim().length > maximum
  )
    throw invalid(`${label} must contain 1–${maximum} characters.`);
  return content.trim();
}
function options(labels, minimum) {
  if (!Array.isArray(labels) || labels.length < minimum || labels.length > 12)
    throw invalid(`Choose ${minimum}–12 entries.`);
  const entries = labels.map((label) => text("Each entry", label, 80));
  if (
    new Set(entries.map((label) => label.toLowerCase())).size !== entries.length
  )
    throw invalid("Entries must be distinct.");
  return entries;
}
const definitions = {
  poll: (content) => {
    if (content.multiple !== undefined && typeof content.multiple !== "boolean")
      throw invalid("Choose a valid poll selection mode.");
    return {
      type: "poll",
      question: text("Question", content.question, 120),
      options: options(content.options, 2),
      multiple: content.multiple ?? false,
    };
  },
  checklist: (content) => ({
    type: "checklist",
    title: text("Checklist title", content.title, 120),
    items: options(content.items, 1),
  }),
};
function messageContent(content) {
  if (content == null) return null;
  if (
    typeof content !== "object" ||
    Array.isArray(content) ||
    !Object.hasOwn(definitions, content.type)
  )
    throw invalid("Choose a poll or checklist.");
  return definitions[content.type](content);
}
function messageNumber(messageId) {
  if (!Number.isSafeInteger(messageId) || messageId < 1)
    throw invalid("Choose a valid message.");
  return messageId;
}
module.exports = { messageContent, messageNumber };

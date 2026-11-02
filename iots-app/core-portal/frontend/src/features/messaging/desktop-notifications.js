export function desktopMessage(message, employeeId, conversationId) {
  if (Notification.permission !== "granted" || message.senderId === employeeId)
    return null;
  const notification = new Notification(message.senderName, {
    body:
      message.body ||
      message.content?.question ||
      message.content?.title ||
      message.attachments[0]?.name ||
      "New message",
    icon: "/img/icon.png",
    tag: `iots-chat-${employeeId}-${message.id}`,
  });
  notification.onclick = () => {
    window.focus();
    window.dispatchEvent(
      new CustomEvent("iots:open-messaging", { detail: { conversationId } }),
    );
    notification.close();
  };
  return notification;
}

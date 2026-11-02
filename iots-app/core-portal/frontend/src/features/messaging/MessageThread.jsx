import { useState } from "react";
import { MessagesSquare } from "lucide-react";
import ScrollShadow from "./MessagingScrollShadow";
import Message from "./MessageCard";
export default function MessageThread({
  chat,
  activeId,
  employeeId,
  historyRef,
  onReply,
  onLocate,
}) {
  const [olderAvailable, setOlderAvailable] = useState(true);
  async function earlier() {
    const count = await chat.loadHistory(activeId, String(chat.messages[0].id));
    if (count < 50) setOlderAvailable(false);
  }
  return (
    <ScrollShadow
      ref={historyRef}
      className="messaging-history"
      size={24}
      role="log"
      aria-label="Conversation messages"
      aria-live="polite"
      aria-busy={chat.loading}
    >
      {chat.loading && <p className="messaging-empty">Loading messages…</p>}
      {chat.messages.length >= 50 && olderAvailable && (
        <button
          className="messaging-load"
          disabled={chat.busy}
          onClick={earlier}
        >
          Load earlier messages
        </button>
      )}
      {!chat.loading && !chat.messages.length && (
        <div className="messaging-empty">
          <MessagesSquare size={30} />
          <h3>No messages yet</h3>
          <p>Send the first message. Only conversation members can read it.</p>
        </div>
      )}
      {chat.messages.map((message) => (
        <Message
          key={message.id}
          message={message}
          mine={message.senderId === employeeId}
          onError={chat.setError}
          onInteract={chat.interact}
          onReply={onReply}
          onLocate={onLocate}
        />
      ))}
    </ScrollShadow>
  );
}

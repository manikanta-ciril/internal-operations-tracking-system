import {
  ArrowLeft,
  ChevronUp,
  Maximize2,
  MessagesSquare,
  Minimize2,
  Minus,
  X,
} from "lucide-react";
import { ConversationAvatar, PresenceLine } from "./Presence";
export default function WidgetHeader({
  chat,
  conversation,
  controls,
  headingRef,
  onBack,
}) {
  const peer = chat.employees.find(
    (employee) => employee.id === conversation?.peerId,
  );
  return (
    <header className="messaging-header">
      {controls.backAvailable && (
        <button
          className="messaging-icon"
          disabled={chat.busy}
          aria-label="Back to conversations"
          onClick={onBack}
        >
          <ArrowLeft size={18} />
        </button>
      )}
      {conversation ? (
        <ConversationAvatar
          conversation={conversation}
          employees={chat.employees}
        />
      ) : (
        <span className="messaging-brand">
          <MessagesSquare size={22} />
        </span>
      )}
      <div className="messaging-heading">
        <h2 id="messaging-title" ref={headingRef} tabIndex={-1}>
          {conversation?.title || "Team messages"}
        </h2>
        {peer ? (
          <PresenceLine
            employee={peer}
            connected={chat.connection === "Connected"}
          />
        ) : (
          <p>
            <span
              className="messaging-connection"
              data-connected={chat.connection === "Connected"}
            />
            {chat.connection === "Connected"
              ? "Connected to messaging"
              : chat.connection}
            {conversation ? ` · ${conversation.memberCount} members` : ""}
          </p>
        )}
      </div>
      <button
        className="messaging-icon"
        aria-label={
          controls.minimized ? "Restore messages" : "Minimize messages"
        }
        onClick={controls.toggleMinimized}
      >
        {controls.minimized ? <ChevronUp size={17} /> : <Minus size={17} />}
      </button>
      <button
        className="messaging-icon messaging-expand"
        aria-label={
          controls.wide ? "Shrink message window" : "Expand message window"
        }
        onClick={controls.toggleWide}
      >
        {controls.wide ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
      </button>
      <button
        className="messaging-icon"
        aria-label="Close messages"
        onClick={controls.close}
      >
        <X size={18} />
      </button>
    </header>
  );
}

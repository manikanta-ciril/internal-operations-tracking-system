import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/dropdown";
import {
  MessageSquarePlus,
  MessagesSquare,
  Plus,
  Search,
  Users,
} from "lucide-react";
import ScrollShadow from "./MessagingScrollShadow";
import { ConversationAvatar } from "./Presence";
function ConversationRow({ conversation, employees, onSelect }) {
  return (
    <button
      className="messaging-conversation"
      onClick={() => onSelect(conversation.id)}
    >
      <ConversationAvatar conversation={conversation} employees={employees} />
      <span className="messaging-conversation-copy">
        <span>
          <strong>{conversation.title}</strong>
          <time>
            {new Date(conversation.updatedAt).toLocaleTimeString("en-IN", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </time>
        </span>
        <span>
          <small>
            {conversation.preview ||
              (conversation.kind === "direct"
                ? "Start a conversation"
                : `${conversation.memberCount} members`)}
          </small>
          {conversation.unread > 0 && (
            <b className="messaging-unread">{conversation.unread}</b>
          )}
        </span>
      </span>
    </button>
  );
}
function NewConversation({ allowed, onCreate, disabled }) {
  return (
    <Dropdown
      shouldBlockScroll={false}
      shouldCloseOnBlur
      shouldCloseOnScroll
      disableAnimation
      portalContainer={document.querySelector(".employee-workspace")}
      placement="bottom-end"
      classNames={{ content: "messaging-action-menu messaging-theme" }}
    >
      <DropdownTrigger>
        <button
          disabled={disabled}
          className="messaging-new"
          aria-label="New conversation"
        >
          <Plus size={19} />
        </button>
      </DropdownTrigger>
      <DropdownMenu
        aria-label="New conversation options"
        onAction={(kind) => {
          // Let the menu restore focus before the dialog takes it.
          requestAnimationFrame(() => onCreate(kind));
        }}
      >
        <DropdownItem
          key="direct"
          startContent={<MessageSquarePlus size={17} />}
        >
          New direct message
        </DropdownItem>
        {allowed && (
          <DropdownItem key="group" startContent={<Users size={17} />}>
            New group
          </DropdownItem>
        )}
      </DropdownMenu>
    </Dropdown>
  );
}
export default function ConversationList({
  chat,
  query,
  onQuery,
  filter,
  onFilter,
  onSelect,
  onCreate,
}) {
  const conversations = chat.conversations.filter(
    (conversation) =>
      (filter === "all" || conversation.kind === filter) &&
      conversation.title?.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <>
      <div className="messaging-list-tools">
        <label className="messaging-search">
          <Search size={17} />
          <input
            value={query}
            onChange={(event) => onQuery(event.target.value)}
            aria-label="Search conversations"
            placeholder="Search conversations"
          />
        </label>
        <NewConversation
          allowed={chat.permissions.createGroup}
          disabled={!chat.employees.length}
          onCreate={onCreate}
        />
      </div>
      <div className="messaging-filters" aria-label="Conversation filters">
        {[
          ["all", "All"],
          ["direct", "Direct"],
          ["group", "Groups"],
          ["channel", "Channels"],
        ].map(([kind, label]) => (
          <button
            key={kind}
            aria-pressed={filter === kind}
            onClick={() => onFilter(kind)}
          >
            {label}
          </button>
        ))}
      </div>
      <ScrollShadow className="messaging-conversations" size={24}>
        {conversations.map((conversation) => (
          <ConversationRow
            key={conversation.id}
            conversation={conversation}
            employees={chat.employees}
            onSelect={onSelect}
          />
        ))}
        {!conversations.length && (
          <div className="messaging-empty">
            <MessagesSquare size={32} />
            <h3>
              {filter === "channel"
                ? "No team channels yet"
                : query
                  ? "No matching conversations"
                  : "A conversation starts here"}
            </h3>
            <p>
              {filter === "channel"
                ? "Channel creation will be enabled for management later."
                : "Use the + menu to message a colleague."}
            </p>
          </div>
        )}
      </ScrollShadow>
      <footer className="messaging-list-footer">
        CIRIL · Internal conversations
      </footer>
    </>
  );
}

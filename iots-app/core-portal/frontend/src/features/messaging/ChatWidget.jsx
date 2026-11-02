import { useEffect, useRef, useState } from "react";
import { MessagesSquare, RotateCw, X } from "lucide-react";
import { useEmployeeWorkspace } from "../employee-workspace/context";
import ConversationDialog from "./ConversationDialog";
import ConversationList from "./ConversationList";
import MessageComposer from "./MessageComposer";
import MessageThread from "./MessageThread";
import WidgetHeader from "./WidgetHeader";
import useMessaging from "./useMessaging";
import NotificationAccess from "./NotificationAccess";
import ChatDropOverlay from "./ChatDropOverlay";
import { isDragDropEnabled, validateDroppedFiles } from "./attachment-rules";
import "./messaging.css";

function ConnectedChatWidget({ initialOpen }) {
  const { user } = useEmployeeWorkspace();
  const [open, setOpen] = useState(initialOpen);
  const [activeId, setActiveId] = useState(null);
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [create, setCreate] = useState(null);
  const [wide, setWide] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [reply, setReply] = useState(null);
  const [drafts, setDrafts] = useState({});
  const [dragActive, setDragActive] = useState(false);
  const [dragEnabled, setDragEnabled] = useState(() => isDragDropEnabled());
  const dragDepth = useRef(0);
  const launcher = useRef(null);
  const heading = useRef(null);
  const history = useRef(null);
  const composer = useRef(null);
  const chat = useMessaging({
    employeeId: user.id,
    activeRole: user.activeRole,
    activeId,
    open: open && !minimized,
  });
  const conversation = chat.conversations.find(
    (entry) => entry.id === activeId,
  );
  const draft = drafts[activeId] || "";
  const unread = chat.conversations.reduce(
    (total, entry) => total + Number(entry.unread),
    0,
  );
  const lastMessage = chat.messages.at(-1)?.id;
  useEffect(() => {
    if (open) heading.current?.focus();
  }, [open]);
  useEffect(() => {
    const reveal = (event) => {
      setActiveId(event.detail.conversationId);
      setReply(null);
      setOpen(true);
      setMinimized(false);
    };
    window.addEventListener("iots:open-messaging", reveal);
    return () => window.removeEventListener("iots:open-messaging", reveal);
  }, []);
  useEffect(() => {
    if (history.current)
      history.current.scrollTop = history.current.scrollHeight;
  }, [lastMessage, open]);

  useEffect(() => {
    function handleToggle(event) {
      setDragEnabled(event.detail?.enabled ?? isDragDropEnabled());
    }
    window.addEventListener("iots:drag-drop-toggle", handleToggle);
    return () =>
      window.removeEventListener("iots:drag-drop-toggle", handleToggle);
  }, []);

  function dismissDrag(restoreFocus = false) {
    dragDepth.current = 0;
    setDragActive(false);
    if (restoreFocus) {
      composer.current?.focus();
    }
  }

  useEffect(() => {
    dragDepth.current = 0;
    setDragActive((active) => (active ? false : active));
  }, [activeId]);

  useEffect(() => {
    if (!dragActive) return;
    function handleWindowDragEnd() {
      dismissDrag();
    }
    window.addEventListener("dragend", handleWindowDragEnd);
    return () => window.removeEventListener("dragend", handleWindowDragEnd);
  }, [dragActive]);

  function close() {
    dismissDrag();
    setOpen(false);
    launcher.current?.focus();
  }
  function select(id) {
    dismissDrag();
    setActiveId(id);
    setReply(null);
  }

  function handleChatDragEnter(event) {
    if (!dragEnabled) return;
    const types = Array.from(event.dataTransfer?.types || []);
    if (!types.includes("Files")) return;
    event.preventDefault();
    dragDepth.current += 1;
    if (dragDepth.current === 1) {
      setDragActive(true);
    }
  }

  function handleChatDragOver(event) {
    if (!dragEnabled) return;
    const types = Array.from(event.dataTransfer?.types || []);
    if (!types.includes("Files")) return;
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = "copy";
    }
  }

  function handleChatDragLeave(event) {
    if (!dragEnabled) return;
    const types = Array.from(event.dataTransfer?.types || []);
    if (!types.includes("Files")) return;
    event.preventDefault();
    dragDepth.current = Math.max(0, dragDepth.current - 1);
    if (dragDepth.current === 0) {
      setDragActive(false);
    }
  }

  async function handleChatDrop(event) {
    event.preventDefault();
    event.stopPropagation();
    dismissDrag();
    if (!dragEnabled) return;
    const files = Array.from(event.dataTransfer?.files || []);
    if (!files.length || chat.busy) return;
    try {
      const { images, documents } = validateDroppedFiles(
        files,
        chat.files.length,
      );
      if (images.length) await chat.upload(images, "images");
      if (documents.length) await chat.upload(documents, "documents");
    } catch (failure) {
      chat.setError(failure.message);
    }
  }
  function updateDraft(text) {
    setDrafts((previous) => ({ ...previous, [activeId]: text }));
  }
  async function send() {
    await chat.send(draft, { replyTo: reply?.id });
    setReply(null);
    updateDraft("");
  }
  async function sendContent(content) {
    await chat.send("", { content, replyTo: reply?.id });
    setReply(null);
  }
  function retry() {
    chat.setError("");
    chat.reconnect();
    chat.refresh();
    if (activeId) chat.loadHistory(activeId);
  }
  function highlightOriginal(messageId) {
    const original = history.current?.querySelector(
      `[data-message-id="${messageId}"]`,
    );
    if (!original) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    original.scrollIntoView({
      behavior: reduced ? "auto" : "smooth",
      block: "center",
    });
    if (!reduced)
      original.animate(
        [
          {
            backgroundColor:
              getComputedStyle(original).getPropertyValue("--chat-gold-soft"),
          },
          { backgroundColor: "transparent" },
        ],
        { duration: 1200 },
      );
  }
  async function locateReply(messageId) {
    try {
      await chat.revealMessage(messageId);
      requestAnimationFrame(() => highlightOriginal(messageId));
    } catch (failure) {
      chat.setError(failure.message);
    }
  }
  const controls = {
    wide,
    minimized,
    backAvailable: Boolean(activeId),
    close,
    toggleMinimized: () => setMinimized((previous) => !previous),
    toggleWide: () => {
      setWide((previous) => !previous);
      setMinimized(false);
    },
  };
  return (
    <div className="messaging-root messaging-theme">
      <button
        ref={launcher}
        className="messaging-launcher"
        aria-label={
          open
            ? "Hide team messages"
            : `Open team messages${unread ? `, ${unread} unread` : ""}`
        }
        aria-expanded={open}
        aria-controls="iots-team-messages"
        onClick={() => {
          if (open) close();
          else {
            setOpen(true);
            setMinimized(false);
          }
        }}
      >
        {open ? <X size={23} /> : <MessagesSquare size={25} />}
        {unread > 0 && (
          <span className="messaging-badge">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </button>
      {open && (
        <section
          id="iots-team-messages"
          className="messaging-window"
          data-wide={wide}
          data-minimized={minimized}
          role="dialog"
          aria-modal="false"
          aria-labelledby="messaging-title"
          onKeyDown={(event) => {
            if (
              event.key === "Escape" &&
              !create &&
              !dragActive &&
              event.currentTarget.contains(event.target)
            ) {
              event.stopPropagation();
              close();
            }
          }}
        >
          <WidgetHeader
            chat={chat}
            conversation={conversation}
            controls={controls}
            headingRef={heading}
            onBack={() => select(null)}
          />
          {!minimized && (
            <>
              {chat.error && (
                <div className="messaging-error" role="alert">
                  <span>{chat.error}</span>
                  <button
                    className="messaging-icon"
                    aria-label="Retry messaging connection"
                    onClick={retry}
                  >
                    <RotateCw size={16} />
                  </button>
                </div>
              )}
              {!activeId ? (
                <ConversationList
                  chat={chat}
                  query={query}
                  onQuery={setQuery}
                  filter={filter}
                  onFilter={setFilter}
                  onSelect={select}
                  onCreate={setCreate}
                />
              ) : (
                <div
                  className="messaging-active-chat"
                  onDragEnter={handleChatDragEnter}
                  onDragOver={handleChatDragOver}
                  onDragLeave={handleChatDragLeave}
                  onDrop={handleChatDrop}
                >
                  <MessageThread
                    key={activeId}
                    chat={chat}
                    activeId={activeId}
                    employeeId={user.id}
                    historyRef={history}
                    onReply={(message) => {
                      setReply(message);
                      composer.current?.focus();
                    }}
                    onLocate={locateReply}
                  />
                  <MessageComposer
                    key={`composer:${activeId}`}
                    chat={chat}
                    draft={draft}
                    onDraft={updateDraft}
                    reply={reply}
                    onCancelReply={() => setReply(null)}
                    onSend={send}
                    onContent={sendContent}
                    composerRef={composer}
                  />
                  {dragActive && (
                    <ChatDropOverlay
                      chat={chat}
                      onClose={dismissDrag}
                      onDrop={handleChatDrop}
                    />
                  )}
                </div>
              )}
            </>
          )}
        </section>
      )}
      {create && (
        <ConversationDialog
          kind={create}
          employees={chat.employees}
          employeeId={user.id}
          onClose={() => setCreate(null)}
          onCreate={async (...args) => {
            const id = await chat.createConversation(...args);
            select(id);
            setOpen(true);
          }}
        />
      )}
    </div>
  );
}
export default function ChatWidget() {
  return (
    <NotificationAccess>
      {(initialOpen) => <ConnectedChatWidget initialOpen={initialOpen} />}
    </NotificationAccess>
  );
}

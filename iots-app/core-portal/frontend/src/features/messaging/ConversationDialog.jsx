import { useState } from "react";
import { Dialog } from "radix-ui";
import ScrollShadow from "./MessagingScrollShadow";
import { ContactAvatar, PresenceLine } from "./Presence";
import { Search, X, Users, MessageSquare } from "lucide-react";

export default function ConversationDialog({
  kind,
  employees,
  employeeId,
  onCreate,
  onClose,
}) {
  const [query, setQuery] = useState("");
  const [title, setTitle] = useState("");
  const [members, setMembers] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const group = kind === "group";
  async function create(event) {
    event.preventDefault();
    setBusy(true);
    try {
      await onCreate(kind, members, title);
      onClose();
    } catch (failure) {
      setError(failure.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Dialog.Root
      open
      onOpenChange={(value) => {
        if (!value && !busy) onClose();
      }}
    >
      <Dialog.Portal container={document.querySelector(".employee-workspace")}>
        <Dialog.Overlay className="messaging-dialog-overlay" />
        <Dialog.Content
          className="messaging-dialog messaging-theme"
          onEscapeKeyDown={(event) => {
            if (busy) event.preventDefault();
          }}
          onPointerDownOutside={(event) => {
            if (busy) event.preventDefault();
          }}
        >
          <header>
            <span className="messaging-avatar">
              {group ? <Users size={21} /> : <MessageSquare size={21} />}
            </span>
            <div>
              <Dialog.Title>
                {group ? "New group" : "New direct message"}
              </Dialog.Title>
              <Dialog.Description>
                {group
                  ? "Choose the people who belong in this conversation."
                  : "Start a private conversation with a colleague."}
              </Dialog.Description>
            </div>
            <Dialog.Close
              className="messaging-icon"
              disabled={busy}
              aria-label="Close new conversation"
            >
              <X size={18} />
            </Dialog.Close>
          </header>
          <form onSubmit={create}>
            {group && (
              <label>
                Group name
                <input
                  autoComplete="off"
                  required
                  maxLength={100}
                  value={title}
                  disabled={busy}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="e.g. Creative review"
                />
              </label>
            )}
            <label className="messaging-search">
              <Search size={17} />
              <input
                aria-label="Find an employee"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Find a colleague"
              />
            </label>
            <ScrollShadow
              size={18}
              className="messaging-directory"
              role="group"
              aria-label="Conversation members"
            >
              {employees
                .filter(
                  (employee) =>
                    employee.id !== employeeId &&
                    `${employee.name} ${employee.username}`
                      .toLowerCase()
                      .includes(query.toLowerCase()),
                )
                .map((employee) => (
                  <label key={employee.id}>
                    <input
                      type={group ? "checkbox" : "radio"}
                      name="chat-member"
                      disabled={busy}
                      checked={members.includes(employee.id)}
                      onChange={() =>
                        setMembers((previous) =>
                          group
                            ? previous.includes(employee.id)
                              ? previous.filter((id) => id !== employee.id)
                              : [...previous, employee.id]
                            : [employee.id],
                        )
                      }
                    />
                    <ContactAvatar employee={employee} />
                    <span>
                      <strong>{employee.name}</strong>
                      <small>@{employee.username}</small>
                      <PresenceLine employee={employee} connected />
                    </span>
                  </label>
                ))}
            </ScrollShadow>
            {error && (
              <p className="messaging-error" role="alert">
                {error}
              </p>
            )}
            <footer>
              <span>{members.length} selected</span>
              <button
                className="messaging-primary"
                disabled={busy || !members.length || (group && !title.trim())}
              >
                {busy
                  ? "Creating…"
                  : group
                    ? "Create group"
                    : "Open conversation"}
              </button>
            </footer>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

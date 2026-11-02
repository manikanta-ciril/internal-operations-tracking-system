import { useEffect, useState } from "react";
import { BellRing, MessagesSquare, X } from "lucide-react";
function permission() {
  return typeof Notification === "undefined"
    ? "unsupported"
    : Notification.permission;
}
export default function NotificationAccess({ children }) {
  const [access, setAccess] = useState(permission);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    let status,
      disposed = false;
    const sync = () => setAccess(permission());
    window.addEventListener("focus", sync);
    document.addEventListener("visibilitychange", sync);
    navigator.permissions
      ?.query({ name: "notifications" })
      .then((next) => {
        if (!disposed) {
          status = next;
          status.addEventListener("change", sync);
        }
      })
      .catch((failure) => {
        // Focus synchronization remains available in browsers without notification permission queries.
        if (!["TypeError", "NotSupportedError"].includes(failure.name))
          setError(
            "Could not monitor notification permission. Recheck it before chatting.",
          );
      });
    return () => {
      disposed = true;
      window.removeEventListener("focus", sync);
      document.removeEventListener("visibilitychange", sync);
      status?.removeEventListener("change", sync);
    };
  }, []);
  async function allow() {
    setError("");
    try {
      setAccess(
        permission() === "denied"
          ? permission()
          : await Notification.requestPermission(),
      );
    } catch {
      setError(
        "Notification permission could not be requested. Check browser site settings.",
      );
    }
  }
  if (access === "granted") return children(open);
  return (
    <div className="messaging-root messaging-theme">
      <button
        className="messaging-launcher"
        aria-label="Open team messages"
        aria-expanded={open}
        onClick={() => setOpen((previous) => !previous)}
      >
        <MessagesSquare size={25} />
      </button>
      {open && (
        <section
          className="messaging-window messaging-permission-window"
          role="dialog"
          aria-modal="false"
          aria-labelledby="messaging-permission-title"
        >
          <header className="messaging-header">
            <h2 id="messaging-permission-title">
              Desktop notifications required
            </h2>
            <button
              className="messaging-icon"
              aria-label="Close messages"
              onClick={() => setOpen(false)}
            >
              <X size={18} />
            </button>
          </header>
          <div className="messaging-permission-content">
            <BellRing size={32} />
            <p>Allow desktop notifications to access team messages.</p>
            <p>
              {access === "denied"
                ? "Notifications are blocked. Set this site’s notification permission to Allow in browser site settings, then check again."
                : access === "unsupported"
                  ? "This browser cannot enable desktop notifications here. Use a supported browser on HTTPS or localhost."
                  : "Messages stay locked until you grant permission."}
            </p>
            {error && <p role="alert">{error}</p>}
            <button
              className="messaging-primary"
              disabled={access === "unsupported"}
              onClick={allow}
            >
              {access === "denied"
                ? "Check permission"
                : "Enable desktop notifications"}
            </button>
          </div>
        </section>
      )}
    </div>
  );
}

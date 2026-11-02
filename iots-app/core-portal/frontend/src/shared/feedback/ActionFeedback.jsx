import { useSyncExternalStore } from "react";
import { getSnapshot, subscribe } from "./operations";
import "./feedback.css";
export default function ActionFeedback() {
  const { count, label } = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getSnapshot,
  );
  return (
    <>
      <div
        className={`action-progress ${count ? "is-pending" : ""}`}
        aria-hidden="true"
      >
        <span />
      </div>
      <span className="feedback-live" role="status" aria-live="polite">
        {count ? `${label}…` : ""}
      </span>
    </>
  );
}

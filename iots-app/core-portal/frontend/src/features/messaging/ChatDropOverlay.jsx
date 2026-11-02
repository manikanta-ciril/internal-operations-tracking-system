import { useEffect, useRef } from "react";
import { UploadCloud, X } from "lucide-react";
import {
  dragDropAttachmentRules,
  setDragDropEnabled,
} from "./attachment-rules";

export default function ChatDropOverlay({
  chat,
  onClose,
  onDrop,
  title = "Drop files to share in conversation",
}) {
  const closeBtnRef = useRef(null);

  useEffect(() => {
    closeBtnRef.current?.focus();
    function handleKeyDown(event) {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        onClose(true);
      }
    }
    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [onClose]);

  function handleDismiss(event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    onClose(true);
  }

  function handlePreventDrop(event) {
    event.preventDefault();
    event.stopPropagation();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = "none";
    }
  }

  function handleDisableFeature(event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    setDragDropEnabled(false);
    onClose(true);
  }

  return (
    <div
      className="messaging-drop-overlay"
      role="region"
      aria-label="Drag and drop file sharing"
      tabIndex={-1}
      onDragOver={(event) => {
        event.preventDefault();
        event.stopPropagation();
        if (event.dataTransfer) {
          event.dataTransfer.dropEffect = "copy";
        }
      }}
      onDrop={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onDrop(event);
      }}
    >
      <div
        className="messaging-drop-card"
        onDragOver={(event) => {
          event.preventDefault();
          event.stopPropagation();
          if (event.dataTransfer) {
            event.dataTransfer.dropEffect = "copy";
          }
        }}
        onDrop={(event) => {
          event.preventDefault();
          event.stopPropagation();
          onDrop(event);
        }}
      >
        <button
          ref={closeBtnRef}
          type="button"
          className="messaging-drop-close"
          aria-label="Close file sharing"
          title="Close file sharing (Escape)"
          onClick={handleDismiss}
          onDragOver={handlePreventDrop}
          onDrop={handleDismiss}
        >
          <X size={18} />
        </button>

        <UploadCloud
          size={42}
          className="messaging-drop-icon"
          aria-hidden="true"
        />
        <strong className="messaging-drop-title">
          {chat?.busy ? "Saving files…" : title}
        </strong>

        <div className="messaging-drop-rules">
          <p className="messaging-drop-types">
            Images (PNG, JPG, WebP, GIF) · Documents (PDF, Word, Excel, PPT, TXT, CSV, MD)
          </p>
          <p className="messaging-drop-limits">
            Up to 30 MB per file · Max {dragDropAttachmentRules.maxFilesPerMessage} attachments per message
          </p>
        </div>

        <div className="messaging-drop-actions">
          <button
            type="button"
            className="messaging-drop-cancel"
            aria-label="Cancel drag and drop"
            onClick={handleDismiss}
            onDragOver={handlePreventDrop}
            onDrop={handleDismiss}
          >
            Cancel
          </button>
          <button
            type="button"
            className="messaging-drop-disable"
            aria-label="Close drag-and-drop feature for file sharing"
            title="Turn off drag-and-drop file sharing"
            onClick={handleDisableFeature}
            onDragOver={handlePreventDrop}
            onDrop={handleDisableFeature}
          >
            Turn off drag & drop
          </button>
        </div>
        <span className="messaging-drop-hint">Press Escape or click close to cancel</span>
      </div>
    </div>
  );
}

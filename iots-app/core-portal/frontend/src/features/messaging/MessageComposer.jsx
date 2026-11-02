import { useEffect, useRef, useState } from "react";
import { Reply, Send, X } from "lucide-react";
import FileUpload from "../../components/ui/file-upload";
import ComposerActions from "./ComposerActions";
import EmojiPicker from "./EmojiPicker";
import RichMessageDialog from "./RichMessageDialog";
import MessageImage from "./MessageImage";
import {
  documentAccept,
  imageAccept,
  isDragDropEnabled,
  maxAttachmentBytes,
  setDragDropEnabled,
  validateChatFiles,
} from "./attachment-rules";
function ReplyPreview({ message, onCancel }) {
  return (
    <div className="messaging-reply-preview">
      <Reply size={16} />
      <span>
        <strong>Replying to {message.senderName}</strong>
        <span>
          {message.body ||
            message.content?.question ||
            message.content?.title ||
            message.attachments[0]?.name ||
            "Attachment"}
        </span>
      </span>
      <button
        type="button"
        className="messaging-icon"
        aria-label="Cancel reply"
        onClick={onCancel}
      >
        <X size={15} />
      </button>
    </div>
  );
}
function Attachments({ chat, onClose }) {
  const [dragEnabled, setDragEnabled] = useState(() => isDragDropEnabled());
  useEffect(() => {
    function handleToggle(event) {
      setDragEnabled(event.detail?.enabled ?? isDragDropEnabled());
    }
    window.addEventListener("iots:drag-drop-toggle", handleToggle);
    return () =>
      window.removeEventListener("iots:drag-drop-toggle", handleToggle);
  }, []);

  return (
    <div className="messaging-upload">
      <div className="messaging-upload-header">
        <span className="messaging-upload-title">Attachments</span>
        <div className="messaging-upload-header-actions">
          {!dragEnabled && (
            <button
              type="button"
              className="messaging-upload-toggle"
              onClick={() => setDragDropEnabled(true)}
              title="Re-enable drag-and-drop file sharing"
            >
              Enable drag & drop
            </button>
          )}
          {onClose && (
            <button
              type="button"
              className="messaging-icon"
              aria-label="Close file sharing"
              title="Close file sharing"
              onClick={onClose}
            >
              <X size={15} />
            </button>
          )}
        </div>
      </div>
      <div className="messaging-pending-images">
        {chat.files
          .filter((file) => file.mediaType?.startsWith("image/"))
          .map((file) => (
            <MessageImage key={file.id} file={file} onError={chat.setError} />
          ))}
      </div>
      <FileUpload
        label="Attach message files"
        files={chat.files}
        accept={documentAccept}
        maxBytes={maxAttachmentBytes}
        disabled={chat.busy}
        onFiles={(files) => chat.upload(files, "documents")}
        onRemove={chat.removeFile}
        onError={chat.setError}
      />
    </div>
  );
}
export default function MessageComposer({
  chat,
  draft,
  onDraft,
  reply,
  onCancelReply,
  onSend,
  onContent,
  composerRef,
}) {
  const [uploads, setUploads] = useState(false);
  const [richKind, setRichKind] = useState(null);
  const pictureInput = useRef(null);
  async function attachImages(images) {
    if (!images.length || chat.busy) return;
    setUploads(true);
    try {
      validateChatFiles(images, "images");
      await chat.upload(images, "images");
    } catch (failure) {
      chat.setError(failure.message);
    }
  }
  function pasteImages(event) {
    const images = Array.from(event.clipboardData.items)
      .filter(
        (entry) => entry.kind === "file" && entry.type.startsWith("image/"),
      )
      .map((entry) => entry.getAsFile())
      .filter(Boolean);
    if (images.length) {
      event.preventDefault();
      void attachImages(images);
    }
  }
  function chooseTool(tool) {
    if (tool === "files") return setUploads((previous) => !previous);
    if (tool === "poll" || tool === "checklist") return setRichKind(tool);
    pictureInput.current.click();
  }
  async function submit(event) {
    event.preventDefault();
    const submitter = event.nativeEvent.submitter;
    try {
      await onSend();
      setUploads(false);
    } catch (failure) {
      chat.setError(failure.message);
    } finally {
      requestAnimationFrame(() => {
        const input = composerRef.current;
        if (
          input &&
          [input, submitter, document.body].includes(document.activeElement)
        )
          input.focus({ preventScroll: true });
      });
    }
  }
  async function sendContent(content) {
    await onContent(content);
    setUploads(false);
  }
  async function handleCloseAttachments() {
    setUploads(false);
    if (chat.files?.length > 0) {
      for (let i = chat.files.length - 1; i >= 0; i--) {
        try {
          await chat.removeFile(i);
        } catch {
          // ignore error if file was already removed
        }
      }
    }
  }
  return (
    <>
      {(uploads || chat.files.length > 0) && (
        <Attachments chat={chat} onClose={handleCloseAttachments} />
      )}
      {reply && <ReplyPreview message={reply} onCancel={onCancelReply} />}
      <input
        ref={pictureInput}
        type="file"
        hidden
        multiple
        accept={imageAccept}
        aria-label="Choose message images"
        onChange={(event) => {
          const images = Array.from(event.target.files);
          event.target.value = "";
          void attachImages(images);
        }}
      />
      <form className="messaging-composer" onSubmit={submit}>
        <ComposerActions disabled={chat.busy} onAction={chooseTool} />
        <textarea
          ref={composerRef}
          onPaste={pasteImages}
          aria-label="Message"
          placeholder="Write a message or paste an image…"
          maxLength={4000}
          rows={2}
          readOnly={chat.busy}
          value={draft}
          onChange={(event) => onDraft(event.target.value)}
          onKeyDown={(event) => {
            if (
              event.key === "Enter" &&
              !event.shiftKey &&
              !event.nativeEvent.isComposing
            ) {
              event.preventDefault();
              if (!chat.busy && (draft.trim() || chat.files.length))
                event.currentTarget.form.requestSubmit();
            }
          }}
        />
        <EmojiPicker
          disabled={chat.busy}
          onSelect={(emoji) => {
            onDraft(draft + emoji);
            composerRef.current?.focus();
          }}
        />
        <button
          className="messaging-send"
          aria-label="Send message"
          disabled={
            chat.busy ||
            chat.connection !== "Connected" ||
            (!draft.trim() && !chat.files.length)
          }
        >
          <Send size={19} />
        </button>
      </form>
      <div className="messaging-composer-note" role="status">
        {chat.busy ? "Saving…" : "Enter to send · Shift + Enter for a new line"}
      </div>
      {richKind && (
        <RichMessageDialog
          kind={richKind}
          onClose={() => setRichKind(null)}
          onSend={sendContent}
        />
      )}
    </>
  );
}

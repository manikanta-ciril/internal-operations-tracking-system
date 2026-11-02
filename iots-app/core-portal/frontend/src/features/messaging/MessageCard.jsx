import { Check, Download, FileText, Reply } from "lucide-react";
import { downloadAttachment } from "./api";
import MessageContent from "./MessageContent";
import MessageImage from "./MessageImage";
function Attachment({ file, onError }) {
  return (
    <div>
      {(file.mediaType?.startsWith("image/") ||
        /\.(png|jpe?g|webp|gif)$/i.test(file.name)) && (
        <MessageImage file={file} onError={onError} />
      )}
      <button
        className="messaging-file"
        onClick={() =>
          downloadAttachment(file).catch((failure) => onError(failure.message))
        }
      >
        <FileText size={20} />
        <span>
          <strong>{file.name}</strong>
          <small>
            {file.size < 1024
              ? `${file.size} B`
              : `${(file.size / 1024).toFixed(1)} KB`}
          </small>
        </span>
        <Download size={15} />
      </button>
    </div>
  );
}
export default function MessageCard({
  message,
  mine,
  onError,
  onReply,
  onLocate,
  onInteract,
}) {
  return (
    <article
      className="messaging-message"
      data-mine={mine}
      data-message-id={message.id}
    >
      <div className="messaging-message-meta">
        <strong>{mine ? "You" : message.senderName}</strong>
        <time dateTime={message.createdAt}>
          {new Date(message.createdAt).toLocaleString("en-IN", {
            day: "numeric",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </time>
      </div>
      <div
        className={`messaging-bubble${message.content ? " messaging-rich-bubble" : ""}`}
      >
        {message.replyTo && (
          <button
            className="messaging-quote"
            aria-label="View original message"
            onClick={() => onLocate(message.replyTo)}
          >
            <Reply size={13} />
            <span>
              <strong>{message.replySenderName}</strong>
              <span>{message.replyBody}</span>
            </span>
          </button>
        )}
        {message.body && <p>{message.body}</p>}
        {message.content && (
          <MessageContent
            message={message}
            onInteract={onInteract}
            onError={onError}
          />
        )}
        {message.attachments.map((file) => (
          <Attachment key={file.id} file={file} onError={onError} />
        ))}
      </div>
      <div className="messaging-message-footer">
        {mine && (
          <small className="messaging-saved">
            <Check size={11} />
            Saved
          </small>
        )}
        <button
          className="messaging-reply-action"
          aria-label={`Reply to ${message.senderName}'s message`}
          onClick={() => onReply(message)}
        >
          <Reply size={13} />
          Reply
        </button>
      </div>
    </article>
  );
}

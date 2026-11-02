import { useState } from "react";
import { Download } from "lucide-react";
import MessagingDialog from "./MessagingDialog";
import { downloadAttachment } from "./api";
export default function MessageImage({ file, onError }) {
  const [open, setOpen] = useState(false);
  const [failed, setFailed] = useState(false);
  const src = `/api/auth/messaging/attachments/${file.id}?preview=1`;
  if (failed)
    return (
      <small className="messaging-preview-error">
        Preview unavailable. Use the file download below.
      </small>
    );
  return (
    <>
      <button
        className="messaging-image-button"
        aria-label={`View image ${file.name}`}
        onClick={() => setOpen(true)}
      >
        <img
          src={src}
          alt={file.name}
          loading="lazy"
          onError={() => setFailed(true)}
        />
      </button>
      {open && (
        <MessagingDialog
          title={file.name}
          description="Image shared with this conversation."
          onClose={() => setOpen(false)}
        >
          <img className="messaging-image-full" src={src} alt={file.name} />
          <button
            className="messaging-primary"
            onClick={() =>
              downloadAttachment(file).catch((failure) =>
                onError(failure.message),
              )
            }
          >
            <Download size={16} />
            Download image
          </button>
        </MessagingDialog>
      )}
    </>
  );
}

import { Dialog } from "radix-ui";
import { X } from "lucide-react";
export default function MessagingDialog({
  title,
  description,
  busy,
  onClose,
  children,
}) {
  return (
    <Dialog.Root
      open
      onOpenChange={(open) => {
        if (!open && !busy) onClose();
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
            <div>
              <Dialog.Title>{title}</Dialog.Title>
              <Dialog.Description>{description}</Dialog.Description>
            </div>
            <Dialog.Close
              className="messaging-icon"
              disabled={busy}
              aria-label="Close dialog"
            >
              <X size={18} />
            </Dialog.Close>
          </header>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

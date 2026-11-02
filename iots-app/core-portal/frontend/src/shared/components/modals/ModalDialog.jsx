import { useEffect, useRef } from 'react';

export default function ModalDialog({ open, onClose, labelledBy, children, className = '' }) {
  const dialog = useRef(null);
  useEffect(() => {
    if (!open) return;
    const element = dialog.current;
    const opener = document.activeElement;
    element.showModal();
    return () => { element.close(); if (opener?.isConnected) opener.focus(); };
  }, [open]);
  function containTab(event) {
    if (event.key !== 'Tab') return;
    const items = [...dialog.current.querySelectorAll('button:not(:disabled),input:not(:disabled),select:not(:disabled),textarea:not(:disabled),a[href],[tabindex]:not([tabindex="-1"])')].filter(item => item.getClientRects().length);
    const first = items[0]; const last = items.at(-1);
    if (!first) { event.preventDefault(); dialog.current.focus(); return; }
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }
  return <dialog ref={dialog} tabIndex={-1} aria-labelledby={labelledBy} onKeyDown={containTab} onCancel={event => { event.preventDefault(); onClose(); }} className={`auth-modal ${className}`}>{children}</dialog>;
}

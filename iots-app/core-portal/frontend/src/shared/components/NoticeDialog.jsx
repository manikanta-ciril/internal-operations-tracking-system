import { useEffect, useRef } from "react";
import "./notice-dialog.css";
export default function NoticeDialog({ title, children, onClose, actions, dismissible = true }) {
 const ref = useRef(null);
 useEffect(() => { const element=ref.current; element.showModal(); return () => element.close(); }, []);
 return <dialog ref={ref} className="notice-dialog" aria-labelledby="notice-dialog-title" onCancel={event=>{event.preventDefault();if(dismissible)onClose?.();}}>
 <h2 id="notice-dialog-title">{title}</h2><div className="notice-dialog-copy">{children}</div><footer>{actions || <button type="button" autoFocus onClick={onClose}>Got it</button>}</footer>
 </dialog>;
}

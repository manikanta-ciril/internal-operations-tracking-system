import { cloneElement, useId, useRef, useState, useEffect } from "react";
// Local implementation informed by HeroUI's trigger/content composition.
// Native popovers supply top-layer rendering, light dismissal and Escape handling.
export default function Popover({
  trigger,
  children,
  label,
  hover = false,
  className = "",
}) {
  const id = useId(),
    anchor = useRef(null),
    panel = useRef(null),
    timer = useRef(null),
    keyboard = useRef(false);
  const [open, setOpen] = useState(false);
  useEffect(() => () => clearTimeout(timer.current), []);
  function position() {
    if (!panel.current || !anchor.current) return;
    const rect = anchor.current.getBoundingClientRect();
    const box = panel.current;
    const width = box.offsetWidth,
      height = box.offsetHeight;
    box.style.left = `${Math.max(12, Math.min(rect.right - width, innerWidth - width - 12))}px`;
    box.style.top = `${Math.max(12, Math.min(rect.bottom + 10, innerHeight - height - 12))}px`;
  }
  function show(focus = false) {
    clearTimeout(timer.current);
    keyboard.current = focus;
    panel.current?.showPopover();
    position();
  }
  function close() {
    clearTimeout(timer.current);
    panel.current?.hidePopover();
  }
  function leave() {
    if (hover)
      timer.current = setTimeout(() => {
        if (!panel.current?.contains(document.activeElement)) close();
      }, 220);
  }
  useEffect(() => {
    if (!open) return;
    window.addEventListener("resize", position);
    window.addEventListener("scroll", position, true);
    return () => {
      window.removeEventListener("resize", position);
      window.removeEventListener("scroll", position, true);
    };
  }, [open]);
  return (
    <span
      className="ui-popover-root"
      onMouseEnter={() => hover && show()}
      onMouseLeave={leave}
    >
      {cloneElement(trigger, {
        ref: anchor,
        "aria-expanded": open,
        "aria-controls": id,
        "aria-haspopup": "dialog",
        onClick: () => (open ? close() : show(true)),
        onKeyDown: (event) => {
          if (event.key === "ArrowDown") {
            event.preventDefault();
            show(true);
          }
        },
      })}
      <div
        ref={panel}
        id={id}
        popover="auto"
        role="dialog"
        aria-label={label}
        className={`ui-popover ${className}`}
        onMouseEnter={() => clearTimeout(timer.current)}
        onMouseLeave={leave}
        onToggle={(event) => {
          const visible = event.newState === "open";
          setOpen(visible);
          if (visible) {
            position();
            if (keyboard.current)
              panel.current.querySelector("a,button,input,select")?.focus();
          }
        }}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            close();
            anchor.current?.focus();
          }
        }}
      >
        {/* The callback receives an event handler, never reads a ref while rendering. */}
        {/* eslint-disable-next-line react/refs */}
        {typeof children === "function" ? children(close) : children}
      </div>
    </span>
  );
}

import {
  cloneElement,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { tooltipPosition } from "./tooltip-position";
import "./tooltip.css";

let dismissActiveHint = null;
let pointerPosition = null;
let dismissedPointer = null;
const samePoint = (a, b) => a && b && a.x === b.x && a.y === b.y;

// App-owned native overlay. HeroUI's trigger/content and motion patterns are
// adapted without its React Aria runtime; see THIRD_PARTY_NOTICES.md.
export default function Tooltip({
  children,
  content,
  delay = 120,
  closeDelay = 100,
}) {
  const id = useId(),
    root = useRef(null),
    panel = useRef(null),
    closeTimer = useRef(null),
    openTimer = useRef(null);
  const [open, setOpen] = useState(false);
  const close = useCallback(() => {
    clearTimeout(closeTimer.current);
    clearTimeout(openTimer.current);
    setOpen(false);
  }, []);
  function show(event) {
    if (event.type === "focus") dismissedPointer = null;
    else {
      pointerPosition = { x: event.clientX, y: event.clientY };
      // Hiding a top-layer hint can reveal another date under a stationary cursor.
      // Escape remains dismissed until the user actually moves or focuses again.
      if (samePoint(dismissedPointer, pointerPosition)) return;
      dismissedPointer = null;
    }
    if (dismissActiveHint && dismissActiveHint !== close) dismissActiveHint();
    dismissActiveHint = close;
    clearTimeout(closeTimer.current);
    clearTimeout(openTimer.current);
    if (event.type === "focus") setOpen(true);
    else openTimer.current = setTimeout(() => setOpen(true), delay);
  }
  function move(event) {
    pointerPosition = { x: event.clientX, y: event.clientY };
    if (dismissedPointer && !samePoint(dismissedPointer, pointerPosition))
      show(event);
  }
  function leave(event) {
    pointerPosition = { x: event.clientX, y: event.clientY };
    clearTimeout(openTimer.current);
    if (root.current?.contains(document.activeElement)) return;
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(close, closeDelay);
  }
  useEffect(
    () => () => {
      clearTimeout(openTimer.current);
      clearTimeout(closeTimer.current);
      if (dismissActiveHint === close) dismissActiveHint = null;
    },
    [close],
  );

  useLayoutEffect(() => {
    if (!open) return;
    const tooltip = panel.current;
    const trigger = root.current.firstElementChild;
    function position() {
      const anchor = trigger.getBoundingClientRect();
      if (
        anchor.bottom <= 0 ||
        anchor.top >= innerHeight ||
        anchor.right <= 0 ||
        anchor.left >= innerWidth
      ) {
        close();
        return;
      }
      // Layout dimensions stay stable while the popup scales in.
      const next = tooltipPosition(
        anchor,
        { width: tooltip.offsetWidth, height: tooltip.offsetHeight },
        { width: innerWidth, height: innerHeight },
      );
      tooltip.style.left = `${next.left}px`;
      tooltip.style.top = `${next.top}px`;
      tooltip.style.setProperty("--tooltip-arrow-left", `${next.arrow}px`);
      tooltip.dataset.placement = next.placement;
    }
    tooltip.showPopover();
    position();
    const resize = new ResizeObserver(position);
    resize.observe(tooltip);
    resize.observe(trigger);
    const escape = (event) => {
      if (event.key === "Escape") {
        dismissedPointer = pointerPosition;
        close();
      }
    };
    document.addEventListener("keydown", escape);
    window.addEventListener("resize", position);
    window.addEventListener("scroll", position, true);
    return () => {
      clearTimeout(closeTimer.current);
      resize.disconnect();
      if (dismissActiveHint === close) dismissActiveHint = null;
      if (tooltip.matches(":popover-open")) tooltip.hidePopover();
      document.removeEventListener("keydown", escape);
      window.removeEventListener("resize", position);
      window.removeEventListener("scroll", position, true);
    };
  }, [open, close]);

  return (
    <span
      className="ui-tooltip-root"
      ref={root}
      onMouseEnter={show}
      onMouseLeave={leave}
      onMouseMove={move}
      onFocus={show}
      onBlur={() => close()}
    >
      {/* Event callbacks use timer refs only when invoked, not while cloning the trigger. */}
      {/* eslint-disable-next-line react/refs */}
      {cloneElement(children, {
        "aria-describedby":
          [children.props["aria-describedby"], open ? id : null]
            .filter(Boolean)
            .join(" ") || undefined,
        onClick: (event) => {
          close();
          children.props.onClick?.(event);
        },
      })}
      <span
        ref={panel}
        id={id}
        popover="manual"
        role="tooltip"
        className="ui-tooltip ui-tooltip-native"
      >
        <span className="ui-tooltip-content">{content}</span>
      </span>
    </span>
  );
}

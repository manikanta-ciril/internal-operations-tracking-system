import { useCallback, useEffect, useRef } from "react";
import { ScrollShadow } from "@heroui/scroll-shadow";

export default function MessagingScrollShadow({ ref, children, ...props }) {
  const element = useRef(null);
  const attach = useCallback(
    (node) => {
      element.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    },
    [ref],
  );
  useEffect(() => {
    // HeroUI recalculates its shadow flags on scroll, including after content updates.
    const frame = requestAnimationFrame(() =>
      element.current?.dispatchEvent(new Event("scroll")),
    );
    return () => cancelAnimationFrame(frame);
  }, [children]);
  useEffect(() => {
    const observer = new ResizeObserver(() =>
      element.current?.dispatchEvent(new Event("scroll")),
    );
    if (element.current) observer.observe(element.current);
    return () => observer.disconnect();
  }, []);
  return (
    <ScrollShadow ref={attach} {...props}>
      {children}
    </ScrollShadow>
  );
}

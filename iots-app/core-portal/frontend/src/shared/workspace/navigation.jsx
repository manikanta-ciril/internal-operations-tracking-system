import { changeView } from "../feedback/change-view";
import { useSyncExternalStore } from "react";

import { Navigation, useWorkspaceNavigation } from "./navigation-context";
const eventName = "iots:workspace-navigation";
function transitionScope(from, to) {
  const match = (value) =>
    value.match(
      /^\/dashboard\/([^/]+)\/(profile|attendance(?:\/\d{4}-\d{2}-\d{2})?)$/,
    );
  const a = match(from),
    b = match(to);
  return a &&
    b &&
    a[1] === b[1] &&
    (a[2].startsWith("attendance") || b[2].startsWith("attendance"))
    ? "attendance"
    : undefined;
}
const subscribe = (listener) => {
  let previous = window.location.pathname;
  const handle = (event) => {
    const current = window.location.pathname;
    const scope = transitionScope(previous, current);
    previous = current;
    if (event.detail?.transitioning) listener();
    else changeView(listener, { scope });
  };
  window.addEventListener("popstate", handle);
  window.addEventListener(eventName, handle);
  return () => {
    window.removeEventListener("popstate", handle);
    window.removeEventListener(eventName, handle);
  };
};

export function WorkspaceNavigation({ role, children, home = "/" }) {
  const pathname = useSyncExternalStore(
    subscribe,
    () => window.location.pathname,
  );
  const base = `/dashboard/${encodeURIComponent(role)}`;
  const path = pathname.startsWith(`${base}/`)
    ? pathname.slice(base.length)
    : "/";
  const href = (to) => {
    const destination = to === "/" ? home : to;
    return base + (destination === "/" ? "" : destination);
  };
  function navigate(to) {
    if (window.location.pathname === href(to)) return;
    // Record intent immediately so rapid clicks and Back/Forward cannot lose a destination
    // while the browser is still capturing the previous view.
    const scope = transitionScope(window.location.pathname, href(to));
    window.history.pushState(null, "", href(to));
    changeView(
      () => {
        window.dispatchEvent(
          new CustomEvent(eventName, { detail: { transitioning: true } }),
        );
      },
      { scope },
    );
  }
  return (
    <Navigation.Provider value={{ path, href, navigate }}>
      {children}
    </Navigation.Provider>
  );
}
export function WorkspaceLink({ to, children, onClick, ...props }) {
  const { href, navigate } = useWorkspaceNavigation();
  return (
    <a
      {...props}
      href={href(to)}
      onClick={(event) => {
        onClick?.(event);
        if (
          event.defaultPrevented ||
          event.button !== 0 ||
          event.metaKey ||
          event.ctrlKey ||
          event.altKey ||
          event.shiftKey
        )
          return;
        event.preventDefault();
        navigate(to);
      }}
    >
      {children}
    </a>
  );
}

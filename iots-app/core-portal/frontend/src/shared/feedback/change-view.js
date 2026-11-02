import { flushSync } from "react-dom";
import { beginOperation } from "./operations";
let activeTransition;
export function changeView(commit, { scope } = {}) {
  activeTransition?.skipTransition();
  if (
    !document.startViewTransition ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    commit();
    return;
  }
  const finish = beginOperation("Opening page");
  try {
    if (scope) document.documentElement.dataset.viewTransitionScope = scope;
    else delete document.documentElement.dataset.viewTransitionScope;
    const transition = document.startViewTransition(() => flushSync(commit));
    activeTransition = transition;
    // Skipping an in-flight capture rejects ready even when finished resolves.
    transition.ready.catch(() => {});
    // Update failure and interruption must always clear pending feedback.
    transition.finished
      .catch(() => {})
      .finally(() => {
        if (activeTransition === transition) {
          activeTransition = null;
          delete document.documentElement.dataset.viewTransitionScope;
        }
        finish();
      });
  } catch {
    delete document.documentElement.dataset.viewTransitionScope;
    finish();
    commit();
  }
}

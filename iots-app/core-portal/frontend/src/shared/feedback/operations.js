// Only deliberate requests and view transitions enter this store; background polling stays quiet.
const listeners = new Set();
const pending = new Map();
let snapshot = { count: 0, label: "" };
function publish() {
  snapshot = { count: pending.size, label: [...pending.values()].at(-1) || "" };
  for (const listener of listeners) listener();
}
export const subscribe = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};
export const getSnapshot = () => snapshot;
export function beginOperation(label) {
  const id = Symbol();
  pending.set(id, label);
  publish();
  let done = false;
  return () => {
    if (done) return;
    done = true;
    pending.delete(id);
    publish();
  };
}
export async function trackOperation(label, action) {
  const finish = beginOperation(label);
  try {
    return await action();
  } finally {
    finish();
  }
}
export function requestLabel(path) {
  if (path.includes("/settings/")) return "Saving your changes";
  if (path.endsWith("/avatar")) return "Uploading your profile photo";
  if (path.endsWith("/password")) return "Updating your password";
  if (path.includes("/notifications/read")) return "Updating notifications";
  if (path.endsWith("/role")) return "Switching workspace";
  if (path.endsWith("/logout")) return "Signing out";
  if (path.endsWith("/login") || path.endsWith("/session-choice"))
    return "Checking sign-in";
  if (path.includes("location")) return "Checking your location";
  if (path.includes("cancel")) return "Returning to your workspace";
  return "Updating your session";
}

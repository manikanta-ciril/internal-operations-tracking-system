import { isInReview } from "../creative-associate/workspace/role-policy.js";
export function taskGroup(t) {
  return ["Completed", "Cancelled"].includes(t.status)
    ? "history"
    : isInReview(t)
      ? "reviews"
      : "work";
}

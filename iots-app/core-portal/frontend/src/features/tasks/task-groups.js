import { isInReview } from "../creative-associate/workspace/role-policy.js";
export function taskGroup(t) {
  return t.status === "Completed"
    ? "history"
    : isInReview(t)
      ? "reviews"
      : "work";
}

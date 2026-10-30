/** Role policy contains workflow capabilities; employee assignments come from the API. */
export const designerRole = {
  id: "graphic-designer",
  label: "Creative Communication Associate",
  workspaceLabel: "Design workspace",
  capabilities: [
    "task.read.own",
    "task.update.own",
    "task.submit.own",
    "task.effort.own",
    "issue.raise.own",
    "deadline.request.own",
    "report.read.own",
  ],
  reviewStages: [
    {
      id: "creative-review",
      label: "Creative reviewer",
      mandate: "creative-review",
      optional: false,
    },
    {
      id: "management-review",
      label: "Reporting manager",
      mandate: "management-review",
      optional: false,
    },
    {
      id: "chairman-review",
      label: "Chairman",
      mandate: "chairman-review",
      optional: true,
    },
  ],
  reportAudience: ["General Manager / Senior Manager / Executive"],
};
export function rolePolicy(state) {
  return state?.workspace || designerRole;
}
export function firstReviewer(state) {
  return rolePolicy(state).reviewStages.find((s) => !s.optional);
}
export function reviewLabel(task, policy = designerRole) {
  return (
    policy.reviewStages.find((s) => s.id === task.reviewStageId)?.label ||
    policy.reviewStages[0].label
  );
}
export function isInReview(task) {
  return task.status === "In review" || task.status.startsWith("With ");
}
export function hasCapability(policy, capability) {
  return policy.capabilities.includes(capability);
}
export function reportAudienceLabel(policy = designerRole) {
  return "General Manager / Senior Manager / Executive";
}

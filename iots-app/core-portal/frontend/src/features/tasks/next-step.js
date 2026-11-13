export function nextWorkStep(task, person) {
  if (task.status === "Draft")
    return {
      actor: person(task.createdBy),
      instruction:
        "Finish the brief, confirm the owner and reviewer, then assign the work.",
    };
  if (task.status === "Completed")
    return {
      actor: task.rating ? "Work closed" : person(task.reviewerId),
      instruction: task.rating
        ? "The result and rating are saved. Files and activity remain available."
        : "The work is accepted. Add a rating from one to five stars with a short explanation.",
    };
  if (task.status === "Cancelled")
    return {
      actor: "Task cancelled",
      instruction:
        "No further work is expected. The reason and earlier activity remain on record.",
    };
  if (task.blocker?.open)
    return {
      actor: person(task.reviewerId),
      instruction:
        "Review the missing input and record a resolution so the employee can resume.",
    };
  if (task.status === "Blocked")
    return {
      actor: person(task.ownerId),
      instruction:
        "The blocker is resolved. Resume work from the task details.",
    };
  if (task.deadlineRequest?.status === "Pending")
    return {
      actor: "General Manager / Senior Manager",
      instruction:
        "Approve or decline the requested deadline. The current deadline remains in force until decided.",
    };
  if (task.status === "In review")
    return {
      actor: person(task.reviewerId),
      instruction:
        task.publicationRequired && !task.publicationProof
          ? "Publication proof is missing. The employee can attach it while review continues."
          : "Check the submitted evidence against the brief. Approve the result or request specific changes.",
    };
  if (task.status === "Changes requested")
    return {
      actor: person(task.ownerId),
      instruction:
        "Read the review feedback, update the work and submit a new version.",
    };
  return {
    actor: person(task.ownerId),
    instruction:
      task.status === "Assigned"
        ? "Read the brief and start the task."
        : "Continue the work, record progress and submit evidence when ready.",
  };
}

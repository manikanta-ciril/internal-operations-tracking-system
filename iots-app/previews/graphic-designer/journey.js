const phaseByStatus = {
  Assigned: 0,
  "In progress": 1,
  Blocked: 1,
  "Issue resolved": 1,
  "In review": 2,
  "Waiting for review": 2,
  "Under review": 2,
  "Changes requested": 2,
  Completed: 3,
};
export function journeyPhase(status) {
  return status?.startsWith("With ") ? 2 : phaseByStatus[status];
}

export function journeyDates(task) {
  // Missing, repeated and equal-time transitions retain evidence order; unknown dates stay unknown.
  const transitions = (task.events || [])
    .map((event, order) => ({
      ...event,
      order,
      phase: journeyPhase(event.after?.status || event.action),
    }))
    .filter((event) => event.phase !== undefined && Number.isFinite(Date.parse(event.at)))
    .sort(
      (first, second) =>
        Date.parse(first.at) - Date.parse(second.at) || first.order - second.order,
    );
  if (
    !transitions.some((event) => event.phase === 0) &&
    task.createdAt &&
    Number.isFinite(Date.parse(task.createdAt)) &&
    (!transitions.length || Date.parse(task.createdAt) <= Date.parse(transitions[0].at))
  )
    transitions.unshift({ phase: 0, at: task.createdAt });
  const dates = Array.from({ length: 4 }, () => ({ visits: 0 }));
  let previousPhase;
  for (const transition of transitions) {
    if (transition.phase === previousPhase) continue;
    if (previousPhase !== undefined) dates[previousPhase].stopped = transition.at;
    dates[transition.phase] = {
      started: transition.at,
      visits: dates[transition.phase].visits + 1,
    };
    previousPhase = transition.phase;
  }
  return dates;
}

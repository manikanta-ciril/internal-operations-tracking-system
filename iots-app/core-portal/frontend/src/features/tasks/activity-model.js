export function orderedActivity(events = []) {
  return events
    .map((event, order) => ({ ...event, order }))
    .sort(
      (first, second) =>
        (Date.parse(second.at) || 0) - (Date.parse(first.at) || 0) ||
        second.order - first.order,
    );
}
export function activityHistory(events, actor, type) {
  return orderedActivity(events)
    .slice(1)
    .filter(
      (event) =>
        (actor === "All people" || event.by === actor) &&
        (type === "All activity" ||
          (type === "Decisions") ===
            /request|deadline|reassign|approv|complet|resolved|rated|brief updated/i.test(
              event.action,
            )),
    );
}

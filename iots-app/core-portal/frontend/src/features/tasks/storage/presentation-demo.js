import { examples } from '../../creative-associate/workspace/api.js';

export const presentationDemoVersion = 'deepthi-presentation-2026-11-02';

export function isPresentationEmployee(employee) {
  return employee.activeRole === 'creative-communication-associate' &&
    (employee.username === 'deepthi' || /sai\s*deepthi/i.test(employee.name));
}

export function presentationSnapshot(employee, now = new Date()) {
  const snapshot = examples(employee);
  snapshot.presentationDemoVersion = presentationDemoVersion;
  snapshot.tasks.forEach((task, index) => {
    task.brief = `Presentation sample. ${task.brief}`;
    // The daily report reads dated events rather than the current status field.
    task.events.push({
      at: now.toISOString(),
      by: task.status === 'Completed' ? 'Reporting manager (sample)' : employee.name,
      action: task.status,
      detail: 'Presentation sample stage; not a real employee assessment.',
      after: { status: task.status, progress: task.progress || 0 },
      source: 'Presentation demo',
    });
    if (task.status === 'In progress') {
      task.notes.push({ at: now.toISOString(), text: 'Sample update: first layout prepared; remaining content is being checked.' });
      task.effortMinutes = 45;
    }
    if (index === 2) task.createdAt = now.toISOString();
  });
  return snapshot;
}

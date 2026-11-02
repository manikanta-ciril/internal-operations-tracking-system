/**
 * TaskStorageAdapter: load/save an employee workspace, getTasks(),
 * updateTaskStatus(taskId, status), addVersion(taskId, version),
 * addActivityLog(taskId, activity), and saveDailyReport(report).
 * Commands resolve only after persistence; failures must reject without resetting records.
 */
export const taskStorageKey = "ciril-iots-tasks-v1";

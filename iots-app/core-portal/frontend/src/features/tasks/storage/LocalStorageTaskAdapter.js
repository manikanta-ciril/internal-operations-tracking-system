import { prepare, examples } from "../../creative-associate/workspace/api.js";
import { initialState, startTask, submitTask } from "../model.js";
import { recordActivity } from "../workflow.js";
import { taskStorageKey } from "./TaskStorageAdapter.js";
import { isPresentationEmployee, presentationSnapshot, presentationDemoVersion } from './presentation-demo.js';

export class LocalStorageTaskAdapter {
  constructor(employee, storage) {
    if (!employee?.id || !employee.name)
      throw new Error("An authenticated employee is required.");
    this.employee = employee;
    this.storage = storage || {
      getItem: key => globalThis.localStorage.getItem(key),
      setItem: (key, contents) => globalThis.localStorage.setItem(key, contents),
    };
  }
  accounts() {
    const saved = this.storage.getItem(taskStorageKey);
    if (!saved) return { version: 1, accounts: {} };
    const records = JSON.parse(saved);
    if (
      records.version !== 1 ||
      !records.accounts ||
      typeof records.accounts !== "object" ||
      Array.isArray(records.accounts)
    )
      throw new Error(
        "Task storage is invalid. Existing records have been preserved.",
      );
    return records;
  }
  async load() {
    const legacy = this.storage.getItem(
      `${taskStorageKey}:${this.employee.id}`,
    );
    const saved =
      this.accounts().accounts[this.employee.id] ||
      (legacy ? JSON.parse(legacy) : null);
    let snapshot;
    if (saved) snapshot = prepare(structuredClone(saved));
    else if (this.employee.activeRole === "creative-communication-associate")
      snapshot = examples(this.employee);
    else {
      snapshot = prepare(initialState(new Date(), this.employee));
      snapshot.tasks = [];
    }
    if (String(snapshot.employee.id) !== String(this.employee.id))
      throw new Error("Stored work belongs to another employee.");
    snapshot.employee = this.employee;
    snapshot.tasks.forEach((task) => {
      if (String(task.ownerId) === String(this.employee.id))
        task.ownerId = this.employee.id;
    });
    snapshot.storageRevision ??= 0;
    if (isPresentationEmployee(this.employee) && snapshot.presentationDemoVersion !== presentationDemoVersion) {
      const backupKey = `${taskStorageKey}:presentation-backup:${this.employee.id}:${Date.now()}`;
      this.storage.setItem(backupKey, JSON.stringify(snapshot));
      const demo = presentationSnapshot(this.employee);
      demo.storageRevision = snapshot.storageRevision;
      return this.save(demo);
    }
    return snapshot;
  }
  async save(snapshot) {
    if (String(snapshot.employee.id) !== String(this.employee.id))
      throw new Error("Cannot save another employee’s work.");
    prepare(structuredClone(snapshot));
    const persist = () => {
      const records = this.accounts();
      if (
        (records.accounts[this.employee.id]?.storageRevision || 0) !==
        snapshot.storageRevision
      )
        throw new Error("Work changed in another tab. Reload before saving.");
      const next = {
        ...snapshot,
        storageRevision: snapshot.storageRevision + 1,
      };
      records.accounts[this.employee.id] = next;
      this.storage.setItem(taskStorageKey, JSON.stringify(records));
      return next;
    };
    return globalThis.navigator?.locks
      ? navigator.locks.request(taskStorageKey, persist)
      : persist();
  }
  async getTasks() {
    return (await this.load()).tasks;
  }
  async change(taskId, command) {
    const snapshot = await this.load();
    const task = snapshot.tasks.find((task) => task.id === taskId);
    if (!task || String(task.ownerId) !== String(this.employee.id))
      throw new Error("Task is unavailable for this employee.");
    command(snapshot);
    return this.save(snapshot);
  }
  updateTaskStatus(taskId, status) {
    if (status !== "In progress")
      return Promise.reject(
        new Error("Review and approval require an authorised reviewer."),
      );
    return this.change(taskId, (snapshot) => startTask(snapshot, taskId));
  }
  addVersion(taskId, version) {
    return this.change(taskId, (snapshot) =>
      submitTask(snapshot, taskId, version.file, version.note),
    );
  }
  addActivityLog(taskId, activity) {
    return this.change(taskId, (snapshot) =>
      recordActivity(snapshot, taskId, activity.kind, activity.values),
    );
  }
  async saveDailyReport(report) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(report.date || ""))
      throw new Error("A report date is required.");
    const snapshot = await this.load();
    snapshot.manualReports[report.date] = structuredClone(report);
    return this.save(snapshot);
  }
}

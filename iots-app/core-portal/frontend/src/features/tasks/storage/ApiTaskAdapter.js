export class ApiTaskAdapter {
  constructor(transport) {
    this.transport = transport;
  }
  request(method, ...args) {
    if (typeof this.transport?.[method] !== "function")
      return Promise.reject(
        new Error(`Task API method ${method} is not configured.`),
      );
    return this.transport[method](...args);
  }
  load() {
    return this.request("load");
  }
  save(snapshot) {
    return this.request("save", snapshot);
  }
  getTasks() {
    return this.request("getTasks");
  }
  updateTaskStatus(taskId, status) {
    return this.request("updateTaskStatus", taskId, status);
  }
  addVersion(taskId, version) {
    return this.request("addVersion", taskId, version);
  }
  addActivityLog(taskId, activity) {
    return this.request("addActivityLog", taskId, activity);
  }
  saveDailyReport(report) {
    return this.request("saveDailyReport", report);
  }
}

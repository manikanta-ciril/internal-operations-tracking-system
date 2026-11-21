import { LocalStorageTaskAdapter } from "./LocalStorageTaskAdapter.js";
import { ServerTaskAdapter } from "./ServerTaskAdapter.js";
export const createTaskStorage = (employee, browserOnly = false) =>
  browserOnly
    ? new LocalStorageTaskAdapter(employee)
    : new ServerTaskAdapter(employee);

import { LocalStorageTaskAdapter } from "./LocalStorageTaskAdapter.js";
export const createTaskStorage = (employee) =>
  new LocalStorageTaskAdapter(employee);

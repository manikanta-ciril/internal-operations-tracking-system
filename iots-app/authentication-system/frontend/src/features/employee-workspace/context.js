import { createContext, useContext } from "react";
export const Workspace = createContext(null);
export function useEmployeeWorkspace() {
  return useContext(Workspace);
}

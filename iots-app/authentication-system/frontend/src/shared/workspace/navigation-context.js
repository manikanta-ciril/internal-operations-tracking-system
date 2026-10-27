import { createContext, useContext } from "react";
export const Navigation = createContext(null);
export function useWorkspaceNavigation() { return useContext(Navigation); }

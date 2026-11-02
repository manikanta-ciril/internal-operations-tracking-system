import { createContext, useContext } from "react";
import { designerRole } from "./role-policy.js";
export const RoleContext = createContext(designerRole);
export const useRolePolicy = () => useContext(RoleContext);

import { createContext, useContext } from "react";
import { designerRole } from "./role-policy";
export const RoleContext = createContext(designerRole);
export const useRolePolicy = () => useContext(RoleContext);

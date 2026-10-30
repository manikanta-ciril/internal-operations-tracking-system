import { Tooltip, TooltipTrigger, TooltipContent } from "./ui/tooltip";

export default function SidebarTooltip({ label, collapsed, children }) {
  if (!collapsed) return children;
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side="right" sideOffset={12}>
        {label}
      </TooltipContent>
    </Tooltip>
  );
}

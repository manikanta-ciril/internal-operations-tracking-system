import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/dropdown";
import {
  Plus,
  ImagePlus,
  FilePlus2,
  ChartNoAxesColumnIncreasing,
  ListChecks,
} from "lucide-react";
const actions = [
  ["images", "Images", ImagePlus],
  ["files", "Document", FilePlus2],
  ["poll", "Poll", ChartNoAxesColumnIncreasing],
  ["checklist", "Checklist", ListChecks],
];
export default function ComposerActions({ disabled, onAction }) {
  return (
    <Dropdown
      disableAnimation
      placement="top-start"
      portalContainer={document.querySelector(".employee-workspace")}
      classNames={{ content: "messaging-action-menu messaging-theme" }}
    >
      <DropdownTrigger>
        <button
          type="button"
          className="messaging-icon"
          disabled={disabled}
          aria-label="Add to message"
        >
          <Plus size={21} />
        </button>
      </DropdownTrigger>
      <DropdownMenu
        aria-label="Message tools"
        onAction={(key) => requestAnimationFrame(() => onAction(key))}
      >
        {actions.map(([key, label, Icon]) => (
          <DropdownItem key={key} startContent={<Icon size={18} />}>
            {label}
          </DropdownItem>
        ))}
      </DropdownMenu>
    </Dropdown>
  );
}

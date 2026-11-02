import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/dropdown";
import { Smile } from "lucide-react";
const choices = [
  ["👍", "Thumbs up"],
  ["✨", "Sparkles"],
  ["🎉", "Celebrate"],
  ["🙏", "Thanks"],
  ["✅", "Done"],
  ["👀", "Reviewing"],
];
export default function EmojiPicker({ disabled, onSelect }) {
  return (
    <Dropdown
      disableAnimation
      placement="top-end"
      portalContainer={document.querySelector(".employee-workspace")}
      classNames={{ content: "messaging-action-menu messaging-theme" }}
    >
      <DropdownTrigger>
        <button
          type="button"
          className="messaging-icon"
          disabled={disabled}
          aria-label="Add emoji"
        >
          <Smile size={19} />
        </button>
      </DropdownTrigger>
      <DropdownMenu aria-label="Emoji" onAction={onSelect}>
        {choices.map(([emoji, label]) => (
          <DropdownItem key={emoji} startContent={<span>{emoji}</span>}>
            {label}
          </DropdownItem>
        ))}
      </DropdownMenu>
    </Dropdown>
  );
}

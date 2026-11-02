import { Button as HeroButton } from "@heroui/button";
import { useRolePolicy } from "./RoleContext.jsx";
import { reportAudienceLabel } from "./role-policy.js";
import {
  Circle,
  CircleCheck,
  CircleDashed,
  Clock3,
  MessageSquare,
  LockKeyhole,
  AlertCircle,
  LoaderCircle,
} from "lucide-react";
import { Badge } from "../../../shared/work-ui/badge.jsx";
import { Button } from "../../../shared/work-ui/button.jsx";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "../../../shared/work-ui/empty.jsx";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu as HeroMenu,
  DropdownItem,
} from "@heroui/dropdown";
import { ChevronDown } from "lucide-react";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "../../../shared/work-ui/tooltip.jsx";
import { stageOf } from "../../tasks/workflow.js";

export function StatusBadge({ task }) {
  const stage =
    task.status === "Blocked" && task.blocker?.open === false
      ? "Issue resolved"
      : stageOf(task);
  const Icon =
    stage === "Completed" || stage === "Issue resolved"
      ? CircleCheck
      : stage === "Changes requested"
        ? MessageSquare
        : stage === "Blocked"
          ? AlertCircle
          : stage === "Assigned"
            ? CircleDashed
            : stage === "In progress"
              ? Circle
              : Clock3;
  return (
    <Badge variant="outline" data-stage={stage} className="stage-badge">
      <Icon data-icon="inline-start" />
      {stage}
    </Badge>
  );
}
export function Choice({
  value,
  onChange,
  options,
  label,
  id,
  disabled = false,
}) {
  const items = options.map((option) =>
    typeof option === "string" ? { value: option, label: option } : option,
  );
  return (
    <Dropdown
      shouldCloseOnScroll={false}
      shouldCloseOnBlur={false}
      disableAnimation
      placement="bottom-start"
      classNames={{ content: "hero-choice-menu" }}
    >
      <DropdownTrigger>
        <HeroButton
          type="button"
          id={id}
          variant="bordered"
          className="hero-choice-trigger"
          isDisabled={disabled}
          aria-label={label}
        >
          <span>
            {items.find((item) => item.value === value)?.label || label}
          </span>
          <ChevronDown size={14} />
        </HeroButton>
      </DropdownTrigger>
      <HeroMenu
        aria-label={label}
        selectionMode="single"
        disallowEmptySelection
        selectedKeys={value ? [value] : []}
        onAction={(key) => onChange(String(key))}
      >
        {items.map((item) => (
          <DropdownItem
            key={item.value}
            textValue={item.label}
            className="hero-choice-item"
          >
            {item.label}
          </DropdownItem>
        ))}
      </HeroMenu>
    </Dropdown>
  );
}

export function Blank({
  title = "Nothing here yet",
  text,
  icon: Icon = CircleCheck,
  action,
  onAction,
}) {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Icon />
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{text}</EmptyDescription>
      </EmptyHeader>
      {action && (
        <EmptyContent>
          <Button variant="outline" onClick={onAction}>
            {action}
          </Button>
        </EmptyContent>
      )}
    </Empty>
  );
}
export function IconButton({ label, icon: Icon, onClick, ...props }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          aria-label={label}
          onClick={onClick}
          {...props}
        >
          <Icon />
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}
export function SaveButton({ busy, children, ...props }) {
  return (
    <Button type="submit" disabled={busy} {...props}>
      {busy && (
        <LoaderCircle className="animate-spin" data-icon="inline-start" />
      )}
      {busy ? "Saving…" : children}
    </Button>
  );
}
export function PrivateReportNote() {
  const policy = useRolePolicy();
  return (
    <p className="privacy-note">
      <LockKeyhole size={14} />
      <span>
        Your daily report is shared with {reportAudienceLabel(policy)}. Work
        reviewers receive task details only.
      </span>
    </p>
  );
}

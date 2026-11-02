import { Badge } from "@heroui/badge";
import { Hash, Users } from "lucide-react";
import Avatar from "../../shared/workspace/Avatar";

export function PresenceLine({ employee, connected }) {
  if (!connected)
    return <span className="messaging-presence">Status unavailable</span>;
  if (employee.online)
    return (
      <span className="messaging-presence" data-online="true">
        Online
      </span>
    );
  return (
    <span className="messaging-presence">
      Offline
      {employee.lastSeen && (
        <span>
          Last seen{" "}
          {new Date(employee.lastSeen).toLocaleString("en-IN", {
            timeZone: "Asia/Kolkata",
            day: "numeric",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      )}
    </span>
  );
}
export function ContactAvatar({ employee }) {
  const src = employee.avatarVersion
    ? `/api/auth/messaging/employees/${employee.id}/avatar?v=${encodeURIComponent(employee.avatarVersion)}`
    : undefined;
  return (
    <Badge
      isDot
      content=""
      color={employee.online ? "success" : "default"}
      classNames={{
        base: "messaging-presence-avatar",
        badge: `messaging-presence-dot${employee.online ? " online" : ""}`,
      }}
      aria-label={employee.online ? "Online" : "Offline"}
    >
      <Avatar name={employee.name} src={src} />
    </Badge>
  );
}
export function ConversationAvatar({ conversation, employees }) {
  const employee = employees.find(
    (person) => person.id === conversation.peerId,
  );
  if (conversation.kind === "direct" && employee)
    return <ContactAvatar employee={employee} />;
  return (
    <span className="messaging-avatar" aria-hidden="true">
      {conversation.kind === "channel" ? (
        <Hash size={18} />
      ) : (
        <Users size={18} />
      )}
    </span>
  );
}

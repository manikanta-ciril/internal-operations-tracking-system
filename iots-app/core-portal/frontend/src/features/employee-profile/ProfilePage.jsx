import { useState } from "react";
import { useEmployeeWorkspace } from "../employee-workspace/context";
import { useWorkspaceNavigation } from "../../shared/workspace/navigation-context";
import Avatar from "../../shared/workspace/Avatar";
import PageHeader from "../../shared/workspace/PageHeader";
import Button from "../../shared/workspace/Button";
import Tabs from "../../shared/workspace/Tabs";
import { EditProfileDialog, AvatarDialog } from "./ProfileDialogs";
import Overview from "./tabs/Overview";
import PersonalDetails from "./tabs/PersonalDetails";
import Security from "./tabs/Security";
import Preferences from "./tabs/Preferences";

const sections = [
  { id: "overview", label: "Overview", View: Overview },
  { id: "details", label: "Personal details", View: PersonalDetails },
  { id: "security", label: "Security & sessions", View: Security },
  { id: "preferences", label: "Preferences", View: Preferences },
];
export default function ProfilePage() {
  const { user, data, avatar } = useEmployeeWorkspace();
  const { path, navigate } = useWorkspaceNavigation();
  const [dialog, setDialog] = useState(null);
  return (
    <>
      <PageHeader
        title="Profile"
        action={
          <Button secondary onClick={() => setDialog("edit")}>
            Edit profile
          </Button>
        }
      />
      <section className="identity-banner">
        <Avatar large name={user.name} src={avatar} />
        <div className="identity-text">
          <h2>{user.name}</h2>
          <p>{user.roles.map((role) => role.label).join(", ")}</p>
          <div className="inline-meta">
            <span>{user.username}</span>
            <span>{user.email}</span>
          </div>
        </div>
        <div className="identity-state">
          <span className="badge">{data.settings.availability.status}</span>
          <button className="text-link" onClick={() => setDialog("avatar")}>
            Change avatar
          </button>
        </div>
      </section>
      <Tabs
        label="Profile sections"
        items={sections}
        selected={
          path.startsWith("/attendance")
            ? "overview"
            : path.split("/")[2] || "overview"
        }
        onSelect={(id) =>
          navigate(id === "overview" ? "/profile" : `/profile/${id}`)
        }
      />
      {dialog === "edit" && (
        <EditProfileDialog onClose={() => setDialog(null)} />
      )}
      {dialog === "avatar" && <AvatarDialog onClose={() => setDialog(null)} />}
    </>
  );
}

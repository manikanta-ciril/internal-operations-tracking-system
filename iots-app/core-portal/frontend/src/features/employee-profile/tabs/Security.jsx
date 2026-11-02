import PasswordForm from "./PasswordForm";
import { useEmployeeWorkspace } from "../../employee-workspace/context";
import Panel from "../../../shared/workspace/Panel";
import Button from "../../../shared/workspace/Button";
import { TIMEZONE } from "../../employee-attendance/model";

export default function Security() {
  const { data, onLogout, busy } = useEmployeeWorkspace();
  return (
    <div className="two-columns">
      <Panel title="Password & account protection">
        <PasswordForm />
        <Button secondary loading={busy} onClick={onLogout}>
          Punch out & sign out
        </Button>
      </Panel>
      <Panel title="Active sessions">
        {data.sessions.map((session, index) => (
          <div className="session-row" key={`${session.startedAt}-${index}`}>
            <strong>
              {session.device || "Previously signed-in device"}
              {session.current ? " (this session)" : ""}
            </strong>
            <span>{session.role}</span>
            <small>
              Started{" "}
              {new Date(session.startedAt).toLocaleString("en-IN", {
                timeZone: TIMEZONE,
              })}{" "}
              IST
            </small>
          </div>
        ))}
        <p className="quiet">
          Device labels are estimated from browser information.
        </p>
      </Panel>
    </div>
  );
}

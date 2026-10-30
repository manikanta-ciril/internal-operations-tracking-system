import brandLogo from "../../../authentication-system/frontend/src/assets/logo.png";
import brandIcon from "../../../authentication-system/frontend/public/img/icon.png";
import { useRolePolicy } from "../RoleContext";
import { reportAudienceLabel } from "../role-policy";
import { useState } from "react";
import { Bell, UserRound, ShieldCheck, Info } from "lucide-react";
import PageHeading from "./PageHeading";
import { Button } from "./ui/button";
import { Alert, AlertTitle, AlertDescription } from "./ui/alert";
import { Separator } from "./ui/separator";
import { PrivateReportNote } from "./WorkspaceUI";
export default function AccountPage({ kind, employee, onBack, onDemoReminder }) {
  const policy = useRolePolicy();
  const supported = typeof Notification !== "undefined" && window.isSecureContext;
  const [permission, setPermission] = useState(
      supported ? Notification.permission : "unsupported",
    ),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  async function enable() {
    setBusy(true);
    setError("");
    try {
      setPermission(await Notification.requestPermission());
    } catch (e) {
      setError(
        "Your browser could not enable notifications. In-app reminders remain available.",
      );
    } finally {
      setBusy(false);
    }
  }
  const titles = {
    settings: "Preferences",
    profile: "Your profile",
    help: "Help & brand kit",
  };
  return (
    <section className="utility-page">
      <PageHeading
        title={titles[kind]}
        description={
          kind === "help"
            ? "A short guide to the designer workflow."
            : `${policy.label} workspace.`
        }
        onBack={onBack}
      />
      <div className="account-page-content">
        {kind === "settings" ? (
          <>
            <Bell size={25} />
            <h3>Reminders that meet you where you work</h3>
            <p>
              Get a reminder thirty minutes before your shift ends, with one click back to
              your report.
            </p>
            <Alert>
              <Info />
              <AlertTitle>In-app reminders are always available</AlertTitle>
              <AlertDescription>
                {permission === "granted"
                  ? "Desktop notifications are enabled on this device."
                  : permission === "denied"
                    ? "Notifications are blocked. You can change this in your browser’s site settings."
                    : permission === "unsupported"
                      ? "Desktop notifications need a supported browser on a secure site."
                      : "Enable desktop notifications when you are ready."}
              </AlertDescription>
            </Alert>
            {permission === "default" && (
              <Button onClick={enable} disabled={busy}>
                {busy ? "Waiting for permission…" : "Enable desktop reminders"}
              </Button>
            )}
            {error && (
              <p role="alert" className="error-copy">
                {error}
              </p>
            )}
            <Button
              variant="outline"
              onClick={() => {
                onDemoReminder();
              }}
            >
              Preview report reminder
            </Button>
            <p className="preview-footnote">
              Preview notifications run while this page is open. Background push delivery
              needs server integration.
            </p>
            <Separator />
            <PrivateReportNote />
          </>
        ) : kind === "profile" ? (
          <>
            <div className="profile-symbol">
              <UserRound size={32} />
            </div>
            <h3>{employee.name}</h3>
            <p>{employee.role}</p>
            <dl className="profile-details">
              <dt>Employee identity</dt>
              <dd>{employee.id}</dd>
              <dt>First work review</dt>
              <dd>{policy.reviewStages[0].label}</dd>
              <dt>Operational manager</dt>
              <dd>{policy.reviewStages[1]?.label || "Not configured"}</dd>
              <dt>Daily-report recipients</dt>
              <dd>{reportAudienceLabel(policy)}</dd>
            </dl>
            <PrivateReportNote />
            <p className="preview-footnote">
              Personal details, attendance and account security belong to the existing
              authenticated profile. This standalone preview does not edit your live
              account.
            </p>
          </>
        ) : (
          <>
            <h3>Brand kit & creative scope</h3>
            <p>
              Use the supplied CIRIL assets. Follow the approved brief for typography,
              dimensions and colour specifications.
            </p>
            <div className="form-actions">
              <Button variant="outline" asChild>
                <a href={brandLogo} download="CIRIL-logo.png">
                  Download CIRIL logo
                </a>
              </Button>
              <Button variant="outline" asChild>
                <a href={brandIcon} download="CIRIL-icon.png">
                  Download CIRIL icon
                </a>
              </Button>
              <Button variant="ghost" asChild>
                <a href="#scope">View creative scope</a>
              </Button>
              <Button variant="ghost" asChild>
                <a href="#assets">Files & proofs</a>
              </Button>
            </div>
            <p className="muted-copy">
              Formal brand guidelines will appear here when an approved document is
              supplied.
            </p>
            <Separator />
            <h3>Start with your next task</h3>
            <ol className="help-steps">
              <li>
                <strong>Read the brief</strong>
                <p>Check the deliverables, due date and review expectations.</p>
              </li>
              <li>
                <strong>Keep work visible</strong>
                <p>Record progress and effort. Raise a blocker when you need input.</p>
              </li>
              <li>
                <strong>Submit for review</strong>
                <p>
                  Include your deliverable and a short explanation. Work follows the
                  review stages configured for your role.
                </p>
              </li>
              <li>
                <strong>Respond to feedback</strong>
                <p>
                  Keep the same task and add a new version. Revisions go through the first
                  reviewer again.
                </p>
              </li>
              <li>
                <strong>Review your daily report</strong>
                <p>
                  Your task activity prepares the draft. Add remarks for your authorised
                  report recipients.
                </p>
              </li>
            </ol>
            <Alert>
              <ShieldCheck />
              <AlertTitle>Manager decisions stay with managers</AlertTitle>
              <AlertDescription>
                Approval, reassignment, deadline changes and escalation are recorded by
                authorised reviewers. You can request more time and explain the reason.
              </AlertDescription>
            </Alert>
            <PrivateReportNote />
          </>
        )}
      </div>
    </section>
  );
}

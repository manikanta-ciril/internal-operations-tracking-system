import PageHeader from "../../shared/workspace/PageHeader";
import Panel from "../../shared/workspace/Panel";
export default function HelpPage() {
  return (
    <>
      <PageHeader title="Help" />
      <Panel title="Account support">
        <p>
          Contact your department administrator or IT service desk for password
          recovery, attendance corrections and access changes.
        </p>
        <details>
          <summary>How do I sign out?</summary>
          <p>
            Choose Log out and complete the punch-out location and photo steps.
            Once you punch out, sign-in is locked until the next IST day.
          </p>
        </details>
        <details>
          <summary>Does availability change my attendance?</summary>
          <p>
            No. Availability, punch records and task effort are separate. A
            verified office location is required to sign in. Off-site sign-in is
            disabled.
          </p>
        </details>
        <details>
          <summary>What are the working hours?</summary>
          <p>
            Office hours are 9:30 AM to 6:00 PM Monday to Friday and 9:30 AM to
            4:00 PM Saturday, in IST. The header shows the time remaining until
            closing. Sunday is the weekly off.
          </p>
        </details>
        <details>
          <summary>Can I change my role?</summary>
          <p>
            Use Switch workspace to choose another assigned role. New access
            requires administrator approval.
          </p>
        </details>
      </Panel>
    </>
  );
}

import Spinner from "../../shared/feedback/Spinner";
export default function SessionChoice({ devices, busy, onChoose }) {
  return (
    <section className="session-choice" aria-labelledby="session-choice-title">
      <h2 id="session-choice-title">Already signed in</h2>
      <p>Your account has a session on:</p>
      <ul>
        {devices.map((device, index) => (
          <li key={index}>
            <strong>{device.device}</strong>
            <span>
              {new Date(device.startedAt).toLocaleString("en-IN", {
                timeZone: "Asia/Kolkata",
              })}{" "}
              IST
            </span>
          </li>
        ))}
      </ul>
      <p>
        Continue here to end those sessions. Location and photo checks are still
        required. This does not record a punch-out.
      </p>
      <div className="session-choice-actions">
        <button disabled={busy} onClick={() => onChoose(false)}>
          Cancel sign-in
        </button>
        <button disabled={busy} aria-busy={busy || undefined} onClick={() => onChoose(true)}>{busy && <Spinner/>}
          {busy ? "Please wait…" : "Log in here & log out there"}
        </button>
      </div>
    </section>
  );
}

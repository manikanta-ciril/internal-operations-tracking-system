import Dialog from '../../../shared/workspace/Dialog';
import Icon from '../../../shared/workspace/Icon';
import Spinner from '../../../shared/feedback/Spinner';
import './logout-choice.css';

export default function LogoutChoice({ busy, error, onClose, onLogoutOnly, onPunchOut }) {
  return <div className="employee-workspace logout-choice-scope"><Dialog title="Ready to log out?" onClose={onClose} busy={busy}>
    <p className="logout-choice-intro">Choose whether to keep your attendance open or finish it for today.</p>
    <div className="logout-choices">
      <button className="logout-choice" disabled={busy} onClick={onLogoutOnly}>
        <span className="logout-choice-icon"><Icon name="lock"/></span>
        <span><strong>Log out only</strong><small>Your punch-in stays open. Sign in again today without another punch-in photo.</small></span>
        {busy ? <Spinner/> : <Icon name="arrow" size={16}/>}
      </button>
      <button className="logout-choice" disabled={busy} onClick={onPunchOut}>
        <span className="logout-choice-icon"><Icon name="calendar"/></span>
        <span><strong>Punch out and log out</strong><small>Record your location and photo to close attendance. An office punch-out ends access for today.</small></span>
        <Icon name="arrow" size={16}/>
      </button>
    </div>
    {error && <p className="logout-choice-error" role="alert">{error}</p>}
    <div className="logout-choice-footer"><span>No punch-out is recorded until you confirm.</span><button className="button secondary" disabled={busy} onClick={onClose}>Stay signed in</button></div>
  </Dialog></div>;
}

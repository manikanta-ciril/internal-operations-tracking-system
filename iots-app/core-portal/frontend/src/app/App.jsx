import DraftStorageConsent from "../features/messaging/DraftStorageConsent";
import ActionFeedback from "../shared/feedback/ActionFeedback";
import { changeView } from "../shared/feedback/change-view";
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { animate, createScope, createTimeline, stagger } from 'animejs';
import logo from '../assets/logo.png';
import ThemeToggle from '../shared/components/ThemeToggle';
import Login from '../features/auth/LoginPage.jsx';
import CheckoutFlow from '../features/auth/checkout/CheckoutFlow';
import LogoutChoice from '../features/auth/checkout/LogoutChoice';
import { authApi } from '../features/auth/api';
import EmployeeWorkspace from '../features/employee-workspace/EmployeeWorkspace';
import '../features/workspace/dashboards/dashboard.css';

function Application() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [checkout, setCheckout] = useState(false);
  const [logoutChoice, setLogoutChoice] = useState(false);
  const workspace = useRef(null);
  useLayoutEffect(() => {
    if (!user || !workspace.current) return;
    const focusHeading = () => workspace.current?.querySelector('h1')?.focus({ preventScroll: true });
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { focusHeading(); return; }
    const scope = createScope({ root: workspace }).add(() => {
      createTimeline({ defaults: { ease: 'out(4)' }, onComplete: focusHeading })
        .add('.workspace-header', { opacity: [0, 1], y: [-8, 0], duration: 450 })
        .add('.role-card', { opacity: [0, 1], y: [28, 0], scale: [.98, 1], duration: 650 }, 80)
        .add('[data-reveal]', { opacity: [0, 1], y: [14, 0], duration: 520, delay: stagger(85) }, 200)
        .add('.workspace-footer', { opacity: [0, 1], y: [8, 0], duration: 450 }, 550);
    });
    return () => scope.revert();
  }, [user]);
  useEffect(() => {
    authApi('me').then(data => setUser(data.user)).catch(e => { if (e.status !== 401) setError(e.message); }).finally(() => setLoading(false));
  }, []);
  useEffect(() => {
    if (loading) return;
    const base = user ? `/dashboard/${user.activeRole}` : '/';
    if (!user || !(window.location.pathname === base || window.location.pathname.startsWith(`${base}/`))) {
      window.history.replaceState(null, '', base);
      window.dispatchEvent(new Event('iots:workspace-navigation'));
    }
  }, [user, loading]);
  async function changeRole(role) {
    setBusy(true); setError('');
    try { const next = (await authApi('role', { role })).user; changeView(() => setUser(next)); }
    catch (e) { setError(e.message); if (e.status === 401) setUser(null); }
    finally { setBusy(false); }
  }
  function requestLogout() {
    setError('');
    setLogoutChoice(true);
  }
  async function logoutOnly() {
    setBusy(true); setError('');
    try {
      await authApi('logout', { withoutPunchOut: true });
      setLogoutChoice(false);
      await finishCheckout();
    } catch (e) {
      if (e.status === 401) { setLogoutChoice(false); setUser(null); }
      else setError(e.message);
    } finally { setBusy(false); }
  }
  async function finishCheckout() {
    setBusy(true); setError('');
    try {
      if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) await animate(workspace.current, { opacity: [1, 0], y: [0, 8], duration: 180, ease: 'out(3)' });
      setUser(null); setCheckout(false);
    }
    catch (e) { if (e.status === 401) setUser(null); else setError(e.message); }
    finally { setBusy(false); }
  }
  if (loading) return <main className="auth-message"><span className="session-loader" aria-hidden="true"/><p role="status">Checking your session…</p></main>;
  if (!user) return <><DraftStorageConsent><Login onAuthenticated={next => { setError(''); setLogoutChoice(false); setUser(next); }}/></DraftStorageConsent>{error && <p className="auth-server-error" role="alert">{error}</p>}</>;
  return <div ref={workspace}>{!checkout ? <EmployeeWorkspace key={user.id} user={user} busy={busy} error={error} onChangeRole={changeRole} onLogout={requestLogout} onSessionEnded={message => { setError(message || 'Your session has ended. Please sign in again.'); setCheckout(false); setUser(null); }}/>: <main className="role-page"><div className="role-container">
    <header className="workspace-header"><div className="workspace-brand"><img src={logo} alt="CIRIL"/><span>Internal operations</span></div><div className="workspace-actions"><span className="workspace-session"><span/>Session active</span><ThemeToggle inline/></div></header>
    <CheckoutFlow user={user} onComplete={finishCheckout} onCancel={() => { changeView(() => setCheckout(false)); requestAnimationFrame(() => workspace.current?.querySelector('.role-logout')?.focus()); }} onSessionEnded={() => { setCheckout(false); setUser(null); }}/>
    {error && <p role="alert" className="role-error">{error}</p>}
  </div></main>}{logoutChoice && <LogoutChoice busy={busy} error={error} onClose={() => { if (!busy) { setLogoutChoice(false); setError(''); } }} onLogoutOnly={logoutOnly} onPunchOut={() => { setLogoutChoice(false); changeView(() => setCheckout(true)); }}/>}</div>;
}

export default function App() { return <><ActionFeedback/><Application/></>; }

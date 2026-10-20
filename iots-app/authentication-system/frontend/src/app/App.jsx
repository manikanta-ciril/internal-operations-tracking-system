import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { animate, createScope, createTimeline, stagger } from 'animejs';
import logo from '../assets/logo.png';
import ThemeToggle from '../shared/components/ThemeToggle';
import Login from '../features/auth/LoginPage.jsx';
import CheckoutFlow from '../features/auth/checkout/CheckoutFlow';
import { authApi } from '../features/auth/api';
import { dashboardComponents } from '../features/workspace/dashboards';
import '../features/workspace/dashboards/dashboard.css';

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [checkout, setCheckout] = useState(false);
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
    authApi('me').then(data => setUser(data.user)).catch(e => { if (![401, 403].includes(e.status)) setError(e.message); }).finally(() => setLoading(false));
  }, []);
  useEffect(() => {
    window.history.replaceState(null, '', user ? `/dashboard/${user.activeRole}` : '/');
  }, [user]);
  async function changeRole(role) {
    setBusy(true); setError('');
    try { setUser((await authApi('role', { role })).user); }
    catch (e) { setError(e.message); if (e.status === 401) setUser(null); }
    finally { setBusy(false); }
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
  if (!user) return <><Login onAuthenticated={setUser}/>{error && <p className="auth-server-error" role="alert">{error}</p>}</>;
  const Dashboard = dashboardComponents[user.activeRole];
  return <main className="role-page" ref={workspace}><div className="role-container">
    <header className="workspace-header"><div className="workspace-brand"><img src={logo} alt="CIRIL"/><span>Internal operations</span></div><div className="workspace-actions"><span className="workspace-session"><span/>Session active</span><ThemeToggle inline/></div></header>
    {checkout ? <CheckoutFlow user={user} onComplete={finishCheckout} onCancel={() => { setCheckout(false); requestAnimationFrame(() => workspace.current?.querySelector('.role-logout')?.focus()); }} onSessionEnded={() => { setCheckout(false); setUser(null); }}/>: <>
    {user.roles.length > 1 && <label className="role-switch">Switch workspace<select value={user.activeRole} disabled={busy} onChange={e => changeRole(e.target.value)}>{user.roles.map(role => <option key={role.code} value={role.code}>{role.label}</option>)}</select></label>}
    {Dashboard ? <Dashboard key={user.activeRole} user={user}/> : <p role="alert">This workspace is unavailable.</p>}
    {error && <p role="alert" className="role-error">{error}</p>}
    <footer className="workspace-footer"><span>One team. A shared purpose.</span><button className="role-logout" disabled={busy} onClick={() => { setError(''); setCheckout(true); }}>{busy ? 'Please wait…' : 'Log out'}<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 5H5v14h4m5-14 7 7-7 7m-5-7h12"/></svg></button></footer>
    </>}
  </div></main>;
}

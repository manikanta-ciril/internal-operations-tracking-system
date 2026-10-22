import { useCallback, useEffect, useRef, useState } from 'react';
import { animate } from 'animejs';
import logoImg from '../../assets/logo.png';
import SimplexNoiseBackground from '../../shared/components/SimplexNoiseBackground';
import ThemeToggle from '../../shared/components/ThemeToggle';
import { useTheme } from '../../shared/theme/useTheme';
import MinimalTypingTitle from '../../shared/components/MinimalTypingTitle';
import LoginFormSection from '../../shared/components/LoginFormSection';
import EmptyCredsModal from '../../shared/components/modals/EmptyCredsModal';
import HelpModal from '../../shared/components/modals/HelpModal';
import { authApi } from './api';
import './login-layout.css';
import LocationPermissionGate from './LocationPermissionGate';
import PhotoEvidence from './PhotoEvidence';

export default function LoginPage({ onAuthenticated }) {
  const loginRoot = useRef(null);
  const pane = useRef(null);
  const running = useRef(false);
  const mounted = useRef(true);
  const motion = useRef(null);
  const [empId, setEmpId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [helpModalOpen, setHelpModalOpen] = useState(false);
  const [emptyCredsModalOpen, setEmptyCredsModalOpen] = useState(false);
  const [isDarkMode] = useTheme();
  const [phase, setPhase] = useState('idle');
  const [processStep, setProcessStep] = useState(1);
  const [errorMessage, setErrorMessage] = useState('');
  const [location, setLocation] = useState(null);
  const [position, setPosition] = useState(null);
  const [decisionBusy, setDecisionBusy] = useState(false);
  const [decisionError, setDecisionError] = useState('');
  const [locationAllowed, setLocationAllowed] = useState(false);
  const [employeeName, setEmployeeName] = useState('');
  const [employeeIdentity, setEmployeeIdentity] = useState({});
  const locationAccess = useRef(false);
  const attempt = useRef(0);
  const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const current = version => mounted.current && locationAccess.current && attempt.current === version;
  function resetMotion() {
    motion.current?.cancel();
    for (const element of [pane.current, loginRoot.current]) {
      element?.style.removeProperty('opacity'); element?.style.removeProperty('transform');
    }
  }
  const revokeLocation = useCallback(() => {
    attempt.current++; locationAccess.current = false; running.current = false;
    motion.current?.cancel();
    for (const element of [pane.current, loginRoot.current]) {
      element?.style.removeProperty('opacity'); element?.style.removeProperty('transform');
    }
    setLocationAllowed(false); setPosition(null); setLocation(null); setPhase('idle'); setPassword('');
    authApi('cancel', {}).catch(() => {});
  }, []);
  useEffect(() => {
    mounted.current = true;
    const invalidate = () => { attempt.current++; };
    return () => { mounted.current = false; invalidate(); motion.current?.cancel(); };
  }, []);
  useEffect(() => {
    let permission; let live = true;
    const revoked = () => { if (permission.state !== 'granted' && locationAccess.current) revokeLocation(); };
    navigator.permissions?.query({ name: 'geolocation' }).then(status => {
      if (!live) return;
      permission = status; status.addEventListener('change', revoked);
    }).catch(() => {});
    return () => { live = false; permission?.removeEventListener('change', revoked); };
  }, [revokeLocation]);
  const allowLocation = useCallback(fix => {
    locationAccess.current = true; setPosition(fix); setLocationAllowed(true);
  }, []);
  async function pause(ms, version) {
    await new Promise(resolve => setTimeout(resolve, reduced() ? 0 : ms));
    return current(version);
  }
  async function changePane(next, version) {
    if (!current(version)) return;
    if (!reduced()) {
      motion.current = animate(pane.current, { opacity: [1, 0], y: [0, -8], duration: 180, ease: 'out(3)' });
      await motion.current;
    }
    if (!current(version)) return;
    setPhase(next);
    await new Promise(resolve => requestAnimationFrame(resolve));
    if (!reduced() && current(version)) {
      motion.current = animate(pane.current, { opacity: [0, 1], y: [8, 0], duration: 260, ease: 'out(4)' });
      await motion.current;
    }
  }
  function capturePosition(version) {
    if (!navigator.geolocation) return Promise.reject(new Error('Location access is required.'));
    return new Promise((resolve, reject) => navigator.geolocation.getCurrentPosition(fix => {
      const captured = { latitude: fix.coords.latitude, longitude: fix.coords.longitude, timestamp: fix.timestamp };
      if (current(version)) setPosition(captured);
      resolve(captured);
    }, failure => {
      if (failure.code === 1 && current(version)) revokeLocation();
      reject(new Error('A fresh location reading is required. Allow location and try signing in again.'));
    }, { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }));
  }
  async function openWorkspace(user) {
    const version = attempt.current;
    if (!current(version)) return;
    setProcessStep(4); setPhase('processing');
    if (!await pause(650, version)) return;
    setProcessStep(5); setPhase('success');
    if (!await pause(650, version)) return;
    if (!reduced()) {
      motion.current = animate(loginRoot.current, { opacity: [1, 0], y: [0, -14], scale: [1, .99], duration: 320, ease: 'inOut(3)' });
      await motion.current;
    }
    if (current(version)) onAuthenticated(user);
  }
  function restartSignIn(message = 'Your session has ended. Please sign in again.') {
    attempt.current++; running.current = false; resetMotion();
    setEmployeeName(''); setEmployeeIdentity({}); setLocation(null); setPassword('');
    setDecisionBusy(false); setDecisionError(''); setErrorMessage(message); setPhase('error');
    requestAnimationFrame(() => document.getElementById('input-password')?.focus());
  }
  async function returnToForm(message, version) {
    if (!current(version)) return;
    setErrorMessage(message); setPassword('');
    await changePane('error', version);
    if (current(version)) document.getElementById('input-password')?.focus();
  }
  async function handleLogin(event) {
    event.preventDefault();
    if (!locationAccess.current || running.current) return;
    if (!empId.trim() || !password) { setEmptyCredsModalOpen(true); return; }
    const version = ++attempt.current;
    running.current = true;
    setErrorMessage(''); setLocation(null); setPosition(null); setDecisionError('');
    setProcessStep(1); setPhase('processing');
    try {
      const [result] = await Promise.allSettled([authApi('login', { username: empId.trim(), password }), pause(1100, version)]);
      if (!current(version)) return;
      if (result.status === 'rejected') throw result.reason;
      setPassword(''); setProcessStep(2);
      const captured = await capturePosition(version);
      if (!current(version)) return;
      const [checked] = await Promise.all([authApi('location', { position: captured }), pause(700, version)]);
      if (!current(version)) return;
      setLocation(checked.location);
      if (checked.requiresConfirmation) setPhase('location');
      else { setEmployeeName(checked.employeeName); setEmployeeIdentity(checked); setProcessStep(3); await changePane('photo', version); }
    } catch (error) {
      if (!current(version)) return;
      setErrorMessage(error.message); setPhase('failed');
      if (await pause(1100, version)) await returnToForm(error.message, version);
    } finally { if (attempt.current === version) running.current = false; }
  }
  async function decideLocation(proceed) {
    if (running.current || !locationAccess.current) return;
    const version = attempt.current;
    running.current = true; setDecisionBusy(true); setDecisionError('');
    try {
      const result = await authApi('location/confirm', { proceed, checkId: location?.checkId });
      if (!current(version)) return;
      if (proceed) { setLocation(result.location); setEmployeeName(result.employeeName); setEmployeeIdentity(result); setProcessStep(3); await changePane('photo', version); }
      else await returnToForm(result.message, version);
    } catch (error) {
      if (!current(version)) return;
      if ([401, 409].includes(error.status)) restartSignIn(error.message);
      else setDecisionError(error.message);
    } finally { if (attempt.current === version) { running.current = false; setDecisionBusy(false); } }
  }
  async function cancelPhoto() {
    const version = attempt.current;
    try { await authApi('cancel', {}); await returnToForm('Sign-in cancelled. No photo was saved.', version); }
    catch (error) { if (!current(version)) return; if (error.status === 401) restartSignIn(error.message); else setDecisionError(error.message); }
  }
  return <div ref={loginRoot} className={`login-page ${isDarkMode ? 'dark' : ''}`}>
    <div className="login-sheet" aria-hidden="true"><SimplexNoiseBackground isDarkMode={isDarkMode}/><div className="vignette-glow"/><div className="film-grain"/></div>
    <div className="login-location-info" role="status" aria-live="polite">
      <span className="login-location-dot" aria-hidden="true"/>
      <div><strong>{!locationAllowed ? 'Location needed' : location ? location.status === 'onsite' ? 'At the office' : location.status === 'offsite' ? 'Outside the office' : 'Location uncertain' : 'Location ready'}</strong>
      <p>{position ? `${position.latitude.toFixed(6)}, ${position.longitude.toFixed(6)}` : 'Allow location to sign in'}</p></div>
    </div>
    <ThemeToggle/>
    <main className="login-main">
      <div className="login-brand">
        <div className="login-logo"><img src={logoImg} alt="CIRIL" width="1787" height="640"/></div>
        <MinimalTypingTitle/>

      </div>
      <div ref={pane} className="login-pane">
        {!locationAllowed ? <LocationPermissionGate onGranted={allowLocation}/> : phase === 'photo' ? <div className="photo-shell"><PhotoEvidence employeeUsername={employeeIdentity.employeeUsername} employeeEmail={employeeIdentity.employeeEmail} employeeName={employeeName} location={location} onSaved={openWorkspace} onCancel={cancelPhoto} onSessionEnded={restartSignIn} onLocationExpired={restartSignIn}/>{decisionError && <p className="capture-error" role="alert">{decisionError}</p>}</div> : <LoginFormSection phase={phase} processStep={processStep} errorMessage={errorMessage} empId={empId} setEmpId={setEmpId} password={password} setPassword={setPassword} showPassword={showPassword} setShowPassword={setShowPassword} handleLogin={handleLogin} onOpenRecovery={() => setHelpModalOpen(true)} location={location} onContinue={() => decideLocation(true)} onCancel={() => decideLocation(false)} decisionBusy={decisionBusy} decisionError={decisionError}/>}
      </div>
    </main>
    <footer className="login-footer"><p className="text-[10px] text-brand-darkslate dark:text-brand-silver">Authorized personnel only - Location exceptions are recorded</p></footer>
    <EmptyCredsModal isOpen={emptyCredsModalOpen} onClose={() => { setEmptyCredsModalOpen(false); document.getElementById(empId ? 'input-password' : 'input-username')?.focus(); }}/>
    <HelpModal isOpen={helpModalOpen} onClose={() => setHelpModalOpen(false)}/>
  </div>;
}

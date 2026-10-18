import { useCallback, useEffect, useRef, useState } from 'react';
import { animate } from 'animejs';
import logoImg from './assets/logo.png';
import SimplexNoiseBackground from './components/SimplexNoiseBackground';
import ThemeToggle from './components/ThemeToggle';
import MinimalTypingTitle from './components/MinimalTypingTitle';
import LoginFormSection from './components/LoginFormSection';
import EmptyCredsModal from './components/modals/EmptyCredsModal';
import HelpModal from './components/modals/HelpModal';
import { authApi } from './auth/api';
import LocationPermissionGate from './auth/LocationPermissionGate';
import PhotoEvidence from './auth/PhotoEvidence';

export default function App({ onAuthenticated }) {
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
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [phase, setPhase] = useState('idle');
  const [processStep, setProcessStep] = useState(1);
  const [errorMessage, setErrorMessage] = useState('');
  const [location, setLocation] = useState(null);
  const [position, setPosition] = useState(null);
  const [decisionBusy, setDecisionBusy] = useState(false);
  const [decisionError, setDecisionError] = useState('');
  const [locationAllowed, setLocationAllowed] = useState(false);
  const [employeeName, setEmployeeName] = useState('');
  const locationAccess = useRef(false);
  const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; motion.current?.cancel(); };
  }, []);
  useEffect(() => {
    let permission;
    let live = true;
    const revoked = () => {
      if (permission.state === 'granted' || !locationAccess.current) return;
      locationAccess.current = false;
      setLocationAllowed(false); setPosition(null); setPhase('idle');
      authApi('cancel', {}).catch(() => {});
    };
    navigator.permissions?.query({ name: 'geolocation' }).then(status => {
      if (!live) return;
      permission = status; status.addEventListener('change', revoked);
    }).catch(() => {});
    return () => { live = false; permission?.removeEventListener('change', revoked); };
  }, []);
  const allowLocation = useCallback((fix) => {
    locationAccess.current = true; setPosition(fix); setLocationAllowed(true);
  }, []);
  async function pause(ms) {
    await new Promise(resolve => setTimeout(resolve, reduced() ? 0 : ms));
    if (!mounted.current) throw new Error('Login view closed.');
  }
  async function changePane(next) {
    if (!reduced()) {
      motion.current = animate(pane.current, { opacity: [1, 0], y: [0, -8], duration: 180, ease: 'out(3)' });
      await motion.current;
    }
    if (!mounted.current) return;
    setPhase(next);
    await new Promise(resolve => requestAnimationFrame(resolve));
    if (!reduced() && mounted.current) {
      motion.current = animate(pane.current, { opacity: [0, 1], y: [8, 0], duration: 260, ease: 'out(4)' });
      await motion.current;
    }
  }
  function capturePosition() {
    if (!navigator.geolocation) return Promise.reject(new Error('Location access is required.'));
    return new Promise((resolve, reject) => navigator.geolocation.getCurrentPosition(fix => {
      const captured = { latitude: fix.coords.latitude, longitude: fix.coords.longitude, accuracy: fix.coords.accuracy, timestamp: fix.timestamp };
      if (mounted.current) setPosition(captured);
      resolve(captured);
    }, failure => {
      if (failure.code === 1) { locationAccess.current = false; setLocationAllowed(false); }
      reject(new Error('A fresh location reading is required. Allow location and try signing in again.'));
    }, { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }));
  }
  async function openWorkspace(user) {
    if (!locationAccess.current) throw new Error('Location permission is required to continue.');
    setProcessStep(4); setPhase('processing');
    await pause(650);
    setProcessStep(5); setPhase('success');
    await pause(650);
    if (!reduced()) {
      motion.current = animate(loginRoot.current, { opacity: [1, 0], y: [0, -14], scale: [1, .99], duration: 320, ease: 'inOut(3)' });
      await motion.current;
    }
    if (mounted.current) onAuthenticated(user);
  }
  async function returnToForm(message) {
    setErrorMessage(message); setPassword('');
    await changePane('error');
    document.getElementById('input-password')?.focus();
  }
  async function handleLogin(event) {
    event.preventDefault();
    if (!locationAccess.current) return;
    if (running.current) return;
    if (!empId.trim() || !password) { setEmptyCredsModalOpen(true); return; }
    running.current = true;
    setErrorMessage(''); setLocation(null); setPosition(null); setDecisionError('');
    setProcessStep(1); setPhase('processing');
    try {
      // Wait for the animation even when the server rejects credentials immediately.
      const [result] = await Promise.allSettled([authApi('login', { username: empId.trim(), password }), pause(1100)]);
      if (!mounted.current) return;
      if (result.status === 'rejected') throw result.reason;
      if (!locationAccess.current) return;
      setPassword(''); setProcessStep(2);
      const captured = await capturePosition();
      if (!mounted.current) return;
      const [checked] = await Promise.all([authApi('location', { position: captured }), pause(700)]);
      setLocation(checked.location);
      if (checked.requiresConfirmation) setPhase('location');
      else { setEmployeeName(checked.employeeName); setProcessStep(3); await changePane('photo'); }
    } catch (error) {
      if (!mounted.current) return;
      setErrorMessage(error.message); setPhase('failed');
      await pause(1100);
      await returnToForm(error.message);
    } finally { running.current = false; }
  }
  async function decideLocation(proceed) {
    if (running.current) return;
    running.current = true; setDecisionBusy(true); setDecisionError('');
    try {
      const result = await authApi('location/confirm', { proceed });
      if (proceed) { setEmployeeName(result.employeeName); setProcessStep(3); await changePane('photo'); }
      else await returnToForm(result.message);
    } catch (error) {
      if (error.status === 401) await returnToForm(error.message);
      else setDecisionError(error.message);
    } finally { running.current = false; if (mounted.current) setDecisionBusy(false); }
  }
  async function cancelPhoto() {
    try { await authApi('cancel', {}); await returnToForm('Sign-in cancelled. No photo was saved.'); }
    catch (error) { if (error.status === 401) await returnToForm(error.message); else { setDecisionError(error.message); } }
  }
  return <div ref={loginRoot} className={`min-h-screen lg:min-h-screen w-full relative overflow-x-hidden py-8 lg:py-0 flex flex-col justify-center ${isDarkMode ? 'dark' : ''}`}>
    <SimplexNoiseBackground isDarkMode={isDarkMode}/>
    <div className="vignette-glow"/><div className="film-grain"/>
    <div className="absolute inset-0 bg-grid-animated animate-pan-grid z-[3] opacity-35 pointer-events-none"/>
    <ThemeToggle isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode}/>
    <main className="relative z-10 w-full max-w-[1440px] mx-auto min-h-screen flex flex-col lg:flex-row items-center justify-center lg:justify-between px-4 sm:px-8 lg:px-20 gap-8 lg:gap-12 py-16">
      <div className="w-full lg:w-5/12 flex flex-col items-center lg:items-start text-center lg:text-left">
        <div className="mb-6 backdrop-blur-xl bg-brand-smoke/25 dark:bg-brand-black/35 border border-brand-silver/30 dark:border-brand-darkslate/40 rounded-2xl px-4 py-2 shadow-sm"><img src={logoImg} alt="CIRIL" className="h-12 sm:h-16 w-auto object-contain"/></div>
        <MinimalTypingTitle/>
        <div className="hidden md:block p-4 bg-brand-smoke/80 dark:bg-brand-black/50 backdrop-blur-md border-l-4 border-brand-gold rounded-r-xl max-w-lg mb-6 text-left"><p className="text-brand-dark dark:text-brand-silver text-sm leading-relaxed">One place for your work, your team, and the day ahead.</p></div>
        <div className="login-location-info"><span className="login-location-dot"/><div><strong>{!locationAllowed ? 'Location access required' : location ? location.status === 'onsite' ? 'Within the office radius' : location.status === 'offsite' ? 'Outside the office radius' : 'Location not confirmed' : 'Location permission granted'}</strong><p>{position ? `${position.latitude.toFixed(6)}, ${position.longitude.toFixed(6)} - Accuracy +/-${Math.round(position.accuracy)} m` : 'Allow location access to unlock sign-in. Your camera is requested after validation.'}</p></div></div>
      </div>
      <div ref={pane} className="w-full max-w-md">
        {!locationAllowed ? <LocationPermissionGate onGranted={allowLocation}/> : phase === 'photo' ? <div className="photo-shell"><PhotoEvidence employeeName={employeeName} location={location} onSaved={openWorkspace} onCancel={cancelPhoto}/>{decisionError && <p className="capture-error" role="alert">{decisionError}</p>}</div> : <LoginFormSection phase={phase} processStep={processStep} errorMessage={errorMessage} empId={empId} setEmpId={setEmpId} password={password} setPassword={setPassword} showPassword={showPassword} setShowPassword={setShowPassword} handleLogin={handleLogin} onOpenRecovery={() => setHelpModalOpen(true)} location={location} onContinue={() => decideLocation(true)} onCancel={() => decideLocation(false)} decisionBusy={decisionBusy} decisionError={decisionError}/>}
      </div>
    </main>
    <footer className="absolute bottom-4 w-full text-center z-10"><p className="text-[10px] text-brand-darkslate dark:text-brand-silver">Authorized personnel only - Location exceptions are recorded</p></footer>
    <EmptyCredsModal isOpen={emptyCredsModalOpen} onClose={() => { setEmptyCredsModalOpen(false); document.getElementById(empId ? 'input-password' : 'input-username')?.focus(); }}/>
    <HelpModal isOpen={helpModalOpen} onClose={() => setHelpModalOpen(false)}/>
  </div>;
}

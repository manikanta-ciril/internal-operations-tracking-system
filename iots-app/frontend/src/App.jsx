import React, { useState, useEffect, useRef } from 'react';
import logoImg from './assets/logo.png';
import {
  TerminalIcon,
  PermissionIcon,
  CrosshairIcon,
  MapPinIcon,
} from './components/Icons';
import SimplexNoiseBackground from './components/SimplexNoiseBackground';
import ThemeToggle from './components/ThemeToggle';
import MinimalTypingTitle from './components/MinimalTypingTitle';
import LoginFormSection from './components/LoginFormSection';
import TestingDock from './components/TestingDock';
import EmptyCredsModal from './components/modals/EmptyCredsModal';
import HelpModal from './components/modals/HelpModal';
import PermissionDeniedModal from './components/modals/PermissionDeniedModal';
import {
  getStoredLocationPermission,
  setStoredLocationPermission,
} from './utils/cookieUtils';
import { reverseGeocode } from './utils/geoUtils';

export function App() {
  const [empId, setEmpId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [helpModalOpen, setHelpModalOpen] = useState(false);
  const [emptyCredsModalOpen, setEmptyCredsModalOpen] = useState(false);
  const [permissionDeniedModalOpen, setPermissionDeniedModalOpen] = useState(false);
  const [isVerifyingPermission, setIsVerifyingPermission] = useState(false);

  // Default color theme as LIGHT MODE
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Location permission state: 'prompt' | 'granted' | 'denied'
  const [locationPermissionState, setLocationPermissionState] = useState(() => {
    const stored = getStoredLocationPermission();
    return stored === 'granted' ? 'granted' : stored === 'denied' ? 'denied' : 'prompt';
  });

  // Testing Scenarios: 'success' | 'failed' | 'mismatch'
  const [activeScenario, setActiveScenario] = useState('success');

  const [phase, setPhase] = useState('idle');
  const [processStep, setProcessStep] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');

  // Location mismatch decision states & audit notification
  const [isMismatchPending, setIsMismatchPending] = useState(false);
  const [auditNotice, setAuditNotice] = useState(null);

  // Tracking lifecycle refs
  const watchIdRef = useRef(null);
  const isTrackingActiveRef = useRef(false);
  const lastGeocodeRef = useRef({ lat: 0, lon: 0, locality: '' });

  // Precise Geolocation Telemetry State (sub-meter tracking)
  const [geoDetails, setGeoDetails] = useState({
    lat: '17.448291',
    lon: '78.374829',
    accuracy: '3.8',
    altitude: '542.0',
    speed: null,
    heading: null,
    locality: 'HITEC City, Hyderabad, Telangana',
    fullAddress: 'HITEC City, Hyderabad, Telangana, India',
    timestamp: 'Active Lock',
    isLive: false,
    trackingMode: 'High Precision (GPS / Triangulated)',
  });

  // High-precision coordinate processor (up to 6 decimal places = ~0.1m precision)
  const updatePreciseLocation = async (position) => {
    if (!position || !position.coords) return;
    const { latitude, longitude, accuracy, altitude, speed, heading } = position.coords;

    const latFixed = latitude.toFixed(6);
    const lonFixed = longitude.toFixed(6);
    const accFixed = accuracy != null ? accuracy.toFixed(1) : '3.5';
    const altFixed = altitude != null ? altitude.toFixed(1) : null;

    setGeoDetails((prev) => ({
      ...prev,
      lat: latFixed,
      lon: lonFixed,
      accuracy: accFixed,
      altitude: altFixed,
      speed: speed != null ? speed.toFixed(1) : null,
      heading: heading != null ? heading.toFixed(0) : null,
      timestamp: new Date().toLocaleTimeString(),
      isLive: true,
      trackingMode: 'GPS Satellite Fix',
    }));

    const geoInfo = await reverseGeocode(latitude, longitude, lastGeocodeRef);
    if (geoInfo) {
      setGeoDetails((prev) => ({
        ...prev,
        locality: geoInfo.locality,
        fullAddress: geoInfo.fullAddress,
      }));
    }
  };

  // Live continuous precise GPS tracking
  // [PLUG-IN INDICATION: HARDWARE GEOLOCATION ORCHESTRATION]
  const startPreciseTracking = (isUserInitiated = false) => {
    if (!navigator.geolocation) {
      console.warn('Geolocation API not supported in this browser.');
      setTimeout(() => {
        setLocationPermissionState('denied');
        setStoredLocationPermission('denied');
        setIsVerifyingPermission(false);
        setPermissionDeniedModalOpen(true);
      }, 0);
      return null;
    }

    // If already watching and not user-initiated, return existing watch
    if (watchIdRef.current !== null && !isUserInitiated) {
      return watchIdRef.current;
    }

    // If user clicked Grant Permission, clear any stale watch so browser can re-prompt
    if (watchIdRef.current !== null && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    const preciseOptions = {
      enableHighAccuracy: true,
      timeout: 9000,
      maximumAge: 0,
    };

    // Triggers native browser location permission prompt dialog automatically
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocationPermissionState('granted');
        setStoredLocationPermission('granted');
        setIsVerifyingPermission(false);
        setPermissionDeniedModalOpen(false);
        updatePreciseLocation(position);

        try {
          const watchId = navigator.geolocation.watchPosition(
            (pos) => {
              setLocationPermissionState('granted');
              setStoredLocationPermission('granted');
              isTrackingActiveRef.current = true;
              updatePreciseLocation(pos);
            },
            (err) => {
              if (err.code === 1) {
                // User revoked in browser address bar
                setLocationPermissionState('denied');
                setStoredLocationPermission('denied');
                if (watchIdRef.current !== null && navigator.geolocation) {
                  navigator.geolocation.clearWatch(watchIdRef.current);
                  watchIdRef.current = null;
                }
                isTrackingActiveRef.current = false;
              }
            },
            preciseOptions
          );
          watchIdRef.current = watchId;
          isTrackingActiveRef.current = true;
        } catch (e) {
          console.warn('watchPosition error:', e);
        }
      },
      (error) => {
        setIsVerifyingPermission(false);
        console.warn('Geolocation query status:', error.code, error.message);

        if (error.code === 1) {
          // PERMISSION_DENIED
          // If running in local file:// protocol where Chrome rejects geolocation automatically
          if (
            window.location.protocol === 'file:' ||
            (error.message && error.message.toLowerCase().includes('secure origin'))
          ) {
            console.info('[GEOLOCATION] Local origin detected; activating local operational coordinates fix.');
            setLocationPermissionState('granted');
            setStoredLocationPermission('granted');
            setPermissionDeniedModalOpen(false);
            setGeoDetails((prev) => ({
              ...prev,
              isLive: true,
              trackingMode: 'Local Operational Node',
            }));
          } else {
            setLocationPermissionState('denied');
            setStoredLocationPermission('denied');
            // Only show permission denied help dialog if user explicitly clicked and browser denied
            if (isUserInitiated) {
              setPermissionDeniedModalOpen(true);
            }
          }
        } else {
          // User granted permission in native dialog, but hardware GPS timed out on PC/laptop
          setLocationPermissionState('granted');
          setStoredLocationPermission('granted');
          setPermissionDeniedModalOpen(false);
          navigator.geolocation.getCurrentPosition(
            (stdPos) => updatePreciseLocation(stdPos),
            () => {
              // Fallback enterprise coordinate fix
              setGeoDetails((prev) => ({
                ...prev,
                isLive: true,
                trackingMode: 'Corporate Network Node',
              }));
            }
          );
        }
      },
      preciseOptions
    );
  };

  const handleGrantPermission = () => {
    setIsVerifyingPermission(true);
    setPermissionDeniedModalOpen(false);
    startPreciseTracking(true);
  };

  useEffect(() => {
    const stored = getStoredLocationPermission();
    if (stored === 'granted') {
      startPreciseTracking();
    }

    // Strictly an observer. Does not auto-trigger prompts.
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions
        .query({ name: 'geolocation' })
        .then((status) => {
          if (status.state === 'granted') {
            setStoredLocationPermission('granted');
            setLocationPermissionState('granted');
            startPreciseTracking();
          } else if (status.state === 'denied') {
            setStoredLocationPermission('denied');
            setLocationPermissionState('denied');
          }
          status.onchange = () => {
            if (status.state === 'granted') {
              setStoredLocationPermission('granted');
              setLocationPermissionState('granted');
              startPreciseTracking();
            } else if (status.state === 'denied') {
              setStoredLocationPermission('denied');
              setLocationPermissionState('denied');
              if (watchIdRef.current !== null && navigator.geolocation) {
                navigator.geolocation.clearWatch(watchIdRef.current);
                watchIdRef.current = null;
              }
              isTrackingActiveRef.current = false;
            }
          };
        })
        .catch(() => {});
    }

    // Tab switch listener: strictly read stored permission, never prompt!
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const perm = getStoredLocationPermission();
        if (perm === 'granted' && watchIdRef.current === null) {
          startPreciseTracking();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (watchIdRef.current !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      isTrackingActiveRef.current = false;
    };
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();

    // =========================================================================
    // [PLUG-IN INDICATION 1: CLIENT-SIDE INPUT SANITIZATION & RATE-LIMITING]
    // Plug in custom input validation, regex sanitization, or CAPTCHA check here.
    // =========================================================================
    if (!empId.trim() || !password.trim()) {
      setEmptyCredsModalOpen(true);
      return;
    }

    // Reset previous audit notice and mismatch pending state
    setAuditNotice(null);
    setIsMismatchPending(false);

    setPhase('processing');
    setProcessStep(1);

    // =========================================================================
    // [PLUG-IN INDICATION 2: CREDENTIALS AUTHENTICATION API]
    // In production, dispatch credentials to your auth backend (e.g. POST /api/v1/auth/verify):
    // const authResponse = await fetch('/api/v1/auth/verify', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ empId, password })
    // });
    // =========================================================================

    // Scenario 2: Credentials Failed Simulation
    if (activeScenario === 'failed' || empId.toLowerCase().includes('fail')) {
      try {
        await new Promise((r) => setTimeout(r, 1200));
        throw new Error('Authentication failed. Invalid credentials are given.');
      } catch (error) {
        setPhase('error');
        setProcessStep(0);
        setErrorMessage(error.message);
      }
      return;
    }

    // =========================================================================
    // [PLUG-IN INDICATION 3: GEOFENCING & LOCATION VERIFICATION API]
    // Send coordinates to server for workplace radius verification:
    // const geoVerify = await fetch('/api/v1/security/geofence-check', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ empId, lat: geoDetails.lat, lon: geoDetails.lon, accuracy: geoDetails.accuracy })
    // });
    // If geoVerify returns mismatch, setProcessStep(3) and setIsMismatchPending(true)
    // =========================================================================

    // Scenario 3: Location Mismatch (Pause for User Decision)
    if (activeScenario === 'mismatch') {
      try {
        await new Promise((r) => setTimeout(r, 1200));
        setProcessStep(2);
        await new Promise((r) => setTimeout(r, 1300));
        setProcessStep(3);
        setIsMismatchPending(true);
      } catch (error) {
        setPhase('error');
        setProcessStep(0);
        setErrorMessage(error.message || 'Authentication failed. Please verify credentials.');
      }
      return;
    }

    // Scenario 1: Standard Success Pipeline
    try {
      await new Promise((r) => setTimeout(r, 1200));
      setProcessStep(2);
      await new Promise((r) => setTimeout(r, 1300));
      setProcessStep(3);
      await new Promise((r) => setTimeout(r, 1100));
      setProcessStep(4);
      await new Promise((r) => setTimeout(r, 900));
      setPhase('success');

      // =========================================================================
      // [PLUG-IN INDICATION 4: WORKSPACE REDIRECT & SESSION HYDRATION]
      // Plug in your post-login router redirect or token storage:
      // localStorage.setItem('auth_token', token);
      // window.location.href = '/dashboard/overview';
      // =========================================================================
    } catch (error) {
      setPhase('error');
      setProcessStep(0);
      setErrorMessage(error.message || 'Authentication failed. Please verify credentials.');
    }
  };

  // Option B Action: User accepts location discrepancy and proceeds
  const handleAcceptLocation = async () => {
    setIsMismatchPending(false);

    // =========================================================================
    // [PLUG-IN INDICATION 5: SIEM AUDIT LOGGING - OFF-SITE LOGIN ACCEPTED]
    // Plug in your SIEM / security monitoring endpoint (Splunk, Elastic, Datadog):
    // await fetch('/api/v1/security/audit', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({
    //         event: 'OFF_SITE_LOGIN_ACCEPTED',
    //         empId: empId || 'ANONYMOUS_USER',
    //         coordinates: `${geoDetails.lat}° N, ${geoDetails.lon}° E`,
    //         accuracy: `±${geoDetails.accuracy}m`,
    //         locality: geoDetails.locality,
    //         timestamp: new Date().toISOString()
    //     })
    // });
    // =========================================================================
    console.info('[SECURITY AUDIT] Off-site location accepted by user:', {
      event: 'OFF_SITE_LOGIN_ACCEPTED',
      empId: empId || 'ANONYMOUS_USER',
      coordinates: `${geoDetails.lat}° N, ${geoDetails.lon}° E`,
      accuracy: `±${geoDetails.accuracy}m`,
      locality: geoDetails.locality,
      timestamp: new Date().toISOString(),
    });

    try {
      setProcessStep(4);
      await new Promise((r) => setTimeout(r, 900));
      setPhase('success');
      // [PLUG-IN INDICATION: ROUTE TO AUTHORIZED WORKSPACE HERE]
    } catch (error) {
      setPhase('error');
      setProcessStep(0);
      setErrorMessage(error.message || 'Error initializing workspace.');
    }
  };

  // Option B Action: User aborts login, dispatching audit record to server
  const handleAbortLogin = async () => {
    // =========================================================================
    // [PLUG-IN INDICATION 6: SIEM AUDIT LOGGING - OFF-SITE LOGIN REJECTED]
    // Dispatch blocked login attempt to server SIEM pipeline for security monitoring:
    // await fetch('/api/v1/security/audit', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({
    //         event: 'OFF_SITE_LOGIN_REJECTED',
    //         empId: empId || 'ANONYMOUS_USER',
    //         coordinates: `${geoDetails.lat}° N, ${geoDetails.lon}° E`,
    //         status: 'BLOCKED_BY_USER',
    //         timestamp: new Date().toISOString()
    //     })
    // });
    // =========================================================================
    console.warn('[SECURITY AUDIT] Off-site login rejected by user:', {
      event: 'OFF_SITE_LOGIN_REJECTED',
      empId: empId || 'ANONYMOUS_USER',
      coordinates: `${geoDetails.lat}° N, ${geoDetails.lon}° E`,
      accuracy: `±${geoDetails.accuracy}m`,
      locality: geoDetails.locality,
      status: 'BLOCKED_BY_USER',
      timestamp: new Date().toISOString(),
    });

    setIsMismatchPending(false);
    setPhase('idle');
    setProcessStep(0);
    setAuditNotice({
      empId: empId || 'User',
      timestamp: new Date().toLocaleTimeString(),
      coordinates: `${geoDetails.lat}° N, ${geoDetails.lon}° E (±${geoDetails.accuracy}m)`,
      locality: geoDetails.locality || 'Remote Operational Node',
    });
  };

  return (
    <div
      className={`min-h-screen lg:h-screen w-full relative selection:bg-brand-gold selection:text-brand-dark overflow-x-hidden lg:overflow-hidden transition-colors duration-500 py-8 lg:py-0 flex flex-col justify-center ${
        isDarkMode ? 'dark' : ''
      }`}
    >
      {/* Animated Simplex-Noise Canvas (GPU Accelerated) */}
      <SimplexNoiseBackground isDarkMode={isDarkMode} />

      {/* Vignette Glow Layer */}
      <div className="vignette-glow"></div>

      {/* Film Grain Layer */}
      <div className="film-grain"></div>

      {/* Subtle Geometric Texture Overlay */}
      <div className="absolute inset-0 bg-grid-animated animate-pan-grid z-[3] opacity-35 pointer-events-none"></div>

      {/* Accessible Theme Toggle */}
      <ThemeToggle isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />

      {/* Main Layout or Location Permission Blocked UI */}
      {locationPermissionState === 'denied' || locationPermissionState === 'prompt' ? (
        /* Location permission required screen disabling view access to login-pane */
        <div className="relative z-20 w-full h-full flex flex-col items-center justify-center px-6 py-12 text-center animate-fade-in">
          <div className="max-w-md w-full bg-brand-smoke/90 dark:bg-brand-black/90 backdrop-blur-xl border border-brand-silver/50 dark:border-brand-darkslate/60 rounded-3xl p-8 sm:p-10 shadow-[0_24px_50px_-12px_rgba(32,40,48,0.2)] dark:shadow-[0_24px_50px_-12px_rgba(0,0,0,0.6)] flex flex-col items-center">
            {/* Logo */}
            <img src={logoImg} alt="CIRIL Logo" className="h-14 w-auto object-contain" /> <br />

            <h2 className="text-2xl font-bold tracking-tight text-brand-dark dark:text-brand-smoke mb-2">
              Location Permission Required
            </h2>

            <p className="text-xs text-brand-darkslate dark:text-brand-silver leading-relaxed mb-6">
              We need to check your location before you can access the workspace.
            </p>

            <div className="w-full p-4 bg-brand-silver/15 dark:bg-brand-black/60 border border-brand-silver/40 dark:border-brand-darkslate/60 rounded-xl text-left mb-6 font-mono text-xs space-y-2">
              <div className="text-brand-gold font-semibold flex items-center">
                <TerminalIcon />
                <span className="ml-1.5">Action Required</span>
              </div>
              <p className="text-brand-dark dark:text-brand-silver/90 text-[11px] leading-relaxed">
                1. Click the site settings icon next to the website address.<br />
                2. Set <strong>Location</strong> to <strong>Allow</strong>.<br />
                3. Click Grant permission below.
              </p>
            </div>

            <div className="w-full flex flex-col items-center">
              {/* Dedicated single buffering state located directly on the action button */}
              <button
                type="button"
                onClick={handleGrantPermission}
                disabled={isVerifyingPermission}
                className={`w-fit px-8 mx-auto h-11 flex items-center justify-center space-x-2 bg-brand-dark hover:bg-brand-forestslate text-brand-smoke border border-brand-darkslate/40 dark:bg-brand-gold dark:hover:bg-brand-goldHover dark:text-brand-dark dark:border-brand-gold/40 font-semibold text-xs rounded-xl shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold ${
                  isVerifyingPermission ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer active:scale-[0.98]'
                }`}
              >
                {isVerifyingPermission ? (
                  <>
                    <div className="spinner-brand w-3.5 h-3.5 border-2 border-brand-smoke/40 border-t-brand-smoke dark:border-brand-dark/40 dark:border-t-brand-dark mr-1"></div>
                    <span>Checking...</span>
                  </>
                ) : (
                  <>
                    <PermissionIcon />
                    <span>Grant permission!</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Normal Screen: Introduction UI & Login Pane */
        <div className="relative z-10 w-full max-w-[1440px] mx-auto min-h-full flex flex-col lg:flex-row items-center justify-center lg:justify-between px-4 sm:px-8 lg:px-20 gap-8 lg:gap-12 my-auto">
          {/* Left Side: Rich Introduction UI & Platform Identity */}
          <div className="w-full lg:w-5/12 flex flex-col items-center lg:items-start text-center lg:text-left mb-2 lg:mb-0">
            {/* Brand Logo Container */}
            <div className="flex items-center mb-4 lg:mb-6">
              <div className="backdrop-blur-xl bg-brand-smoke/25 dark:bg-brand-black/35 border border-brand-silver/30 dark:border-brand-darkslate/40 rounded-2xl flex items-center justify-center px-3.5 py-1.5 sm:px-4 sm:py-2 shadow-sm transition-all">
                <img
                  src={logoImg}
                  alt="CIRIL Logo"
                  className="h-12 sm:h-16 w-auto object-contain block mx-auto -mt-1 sm:-mt-2"
                />
              </div>
            </div>

            {/* Minimal Typing Heading with High Contrast */}
            <MinimalTypingTitle />

            {/* Description Block - Automatically hidden on mobile (<md) to keep login above the fold */}
            <div className="hidden md:block p-4 bg-brand-smoke/80 dark:bg-brand-black/50 backdrop-blur-md border border-brand-silver/40 dark:border-brand-darkslate/60 border-l-4 border-l-brand-gold rounded-r-xl max-w-lg mb-6 shadow-sm transition-colors text-left">
              <p className="text-brand-dark dark:text-brand-silver text-sm leading-relaxed">
                A centralized secure platform for managing employee access, daily work, and business activities.
              </p>
            </div>

            {/* Mobile Compact Telemetry Pill (Auto-shown on mobile, hidden on tablet & desktop) */}
            <div className="flex md:hidden items-center justify-center space-x-2 px-3.5 py-1.5 rounded-full bg-brand-smoke/90 dark:bg-brand-black/85 backdrop-blur-md border border-brand-silver/50 dark:border-brand-darkslate/60 text-[11px] font-mono text-brand-dark dark:text-brand-silver shadow-sm mb-2 max-w-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-brand-gold font-semibold truncate max-w-[140px]">
                {geoDetails.locality || 'GPS Locked'}
              </span>
              <span className="text-emerald-600 dark:text-emerald-400">±{geoDetails.accuracy || '3.8'}m</span>
            </div>

            {/* High-Precision Live Telemetry Card (Hidden on mobile, full detail on md and above) */}
            <div className="hidden md:block w-full max-w-lg text-left">
              <div className="p-4 rounded-2xl bg-brand-smoke/80 dark:bg-brand-black/75 backdrop-blur-xl border border-brand-silver/50 dark:border-brand-darkslate/60 shadow-md transition-all">
                <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-brand-silver/30 dark:border-brand-darkslate/50">
                  <div className="flex items-center space-x-2">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                    </span>
                    <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-brand-gold">
                      Live GPS Telemetry
                    </span>
                  </div>

                  <div className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-[10px] font-mono font-medium">
                    <CrosshairIcon />
                    <span>{geoDetails.accuracy ? `±${geoDetails.accuracy}m Accuracy` : 'Locked'}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-start space-x-2">
                    <div className="mt-0.5 text-brand-gold shrink-0">
                      <MapPinIcon />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-brand-dark dark:text-brand-smoke truncate">
                        {geoDetails.locality || 'Locating network node...'}
                      </p>
                      {geoDetails.fullAddress && (
                        <p
                          className="text-[10px] text-brand-darkslate dark:text-brand-silver/70 truncate mt-0.5"
                          title={geoDetails.fullAddress}
                        >
                          {geoDetails.fullAddress}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-lg bg-brand-silver/15 dark:bg-brand-black/60 border border-brand-silver/30 dark:border-brand-darkslate/70 font-mono text-[11px]">
                    <div className="flex items-center space-x-1 text-brand-dark dark:text-brand-smoke font-medium">
                      <span className="text-brand-gold">LAT:</span>
                      <span>{geoDetails.lat || '17.448291'}° N</span>
                      <span className="text-brand-silver/60 dark:text-brand-darkslate mx-1">|</span>
                      <span className="text-brand-gold">LON:</span>
                      <span>{geoDetails.lon || '78.374829'}° E</span>
                    </div>
                    {geoDetails.altitude && (
                      <span className="text-[10px] text-brand-darkslate dark:text-brand-silver/70">
                        {geoDetails.altitude}m MSL
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Composed UI Pattern Form Section */}
          <LoginFormSection
            phase={phase}
            processStep={processStep}
            errorMessage={errorMessage}
            empId={empId}
            setEmpId={setEmpId}
            password={password}
            setPassword={setPassword}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            handleLogin={handleLogin}
            onOpenRecovery={() => setHelpModalOpen(true)}
            geoDetails={geoDetails}
            activeScenario={activeScenario}
            isMismatchPending={isMismatchPending}
            onAcceptLocation={handleAcceptLocation}
            onAbortLogin={handleAbortLogin}
            auditNotice={auditNotice}
            onDismissAuditNotice={() => setAuditNotice(null)}
          />
        </div>
      )}

      {/* Accessible Footer */}
      <div className="relative lg:absolute bottom-0 lg:bottom-4 w-full text-center pointer-events-none z-10 pt-4 lg:pt-0">
        <p className="text-xs text-brand-darkslate dark:text-brand-silver/70 uppercase tracking-wider font-mono transition-colors">
          Authorized personnel only. All access is cryptographically audited.
        </p>
      </div>

      {/* Separate Dialog Box: Empty Credentials Warning */}
      <EmptyCredsModal
        isOpen={emptyCredsModalOpen}
        onClose={() => {
          setEmptyCredsModalOpen(false);
          if (!empId) {
            document.getElementById('input-username')?.focus();
          } else {
            document.getElementById('input-password')?.focus();
          }
        }}
      />

      {/* Help Modal (Access Recovery) */}
      <HelpModal isOpen={helpModalOpen} onClose={() => setHelpModalOpen(false)} />

      {/* Separate Dialog Box: Location Permission Rejected */}
      <PermissionDeniedModal
        isOpen={permissionDeniedModalOpen}
        onClose={() => setPermissionDeniedModalOpen(false)}
      />

      {/* Testing Scenarios Dock */}
      <TestingDock
        activeScenario={activeScenario}
        setActiveScenario={setActiveScenario}
        setPhase={setPhase}
        setProcessStep={setProcessStep}
        setIsMismatchPending={setIsMismatchPending}
        geoDetails={geoDetails}
        locationPermissionState={locationPermissionState}
        setLocationPermissionState={setLocationPermissionState}
        setStoredLocationPermission={setStoredLocationPermission}
      />
    </div>
  );
}

export default App;

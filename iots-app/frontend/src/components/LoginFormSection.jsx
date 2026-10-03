import React from 'react';
import {
  TerminalIcon,
  OctagonXIcon,
  AlertCircleIcon,
  CheckCircleIcon,
  CrosshairIcon,
  ShieldCheckIcon,
  ShieldIcon,
  EyeIcon,
  EyeOffIcon,
} from './Icons';
import AnimatedButton from './AnimatedButton';

export const LoginFormSection = ({
  phase,
  processStep,
  errorMessage,
  empId,
  setEmpId,
  password,
  setPassword,
  showPassword,
  setShowPassword,
  handleLogin,
  onOpenRecovery,
  geoDetails,
  activeScenario,
  isMismatchPending,
  onAcceptLocation,
  onAbortLogin,
  auditNotice,
  onDismissAuditNotice,
}) => {
  return (
    <div className="w-full max-w-md animate-slide-up">
      <div className="bg-brand-smoke/90 dark:bg-brand-black/90 backdrop-blur-xl rounded-2xl shadow-[0_24px_50px_-12px_rgba(32,40,48,0.12)] dark:shadow-[0_24px_50px_-12px_rgba(0,0,0,0.5)] border border-brand-silver/50 dark:border-brand-darkslate/60 p-5 sm:p-7 md:p-8 relative overflow-hidden transition-all duration-300">
        {phase === 'idle' || phase === 'error' ? (
          <div>
            <div className="mb-7">
              <div className="inline-flex items-center space-x-2 px-3 py-1 bg-brand-gold/10 border border-brand-gold/30 rounded-full text-xs font-medium text-brand-gold mb-4 transition-colors">
                <TerminalIcon />
                <span>Secure Login Portal</span>
              </div>
              <h2 className="text-2xl font-semibold text-brand-dark dark:text-brand-smoke transition-colors">
                System Access
              </h2>
              <p className="text-xs text-brand-darkslate dark:text-brand-silver mt-1 transition-colors">
                Login with your organizational identity.
              </p>
            </div>

            {auditNotice && (
              <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-700 dark:text-rose-300 transition-all animate-fade-in relative">
                <div className="flex items-start space-x-3">
                  <div className="mt-0.5 shrink-0 text-rose-500">
                    <OctagonXIcon />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-rose-800 dark:text-rose-200">
                        Security Check Recorded
                      </span>
                    </div>
                    <p className="text-[11px] text-brand-dark dark:text-brand-silver leading-relaxed">
                      User <span className="font-semibold font-mono text-rose-700 dark:text-rose-300">{auditNotice.empId}</span> rejected off-site login attempt. Your access check was recorded at {auditNotice.timestamp}.
                    </p>
                    <div className="mt-1.5 text-[10px] font-mono text-brand-darkslate dark:text-brand-silver/70">
                      Coordinates: {auditNotice.coordinates} · {auditNotice.locality || 'Remote Location'}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={onDismissAuditNotice}
                    className="text-brand-gray hover:text-rose-500 p-1 -mt-1 -mr-1 transition-colors cursor-pointer"
                    title="Dismiss notice"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}

            {phase === 'error' && (
              <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/30 rounded-lg text-xs text-rose-700 dark:text-rose-300 flex items-start space-x-3 transition-colors">
                <div className="mt-0.5 shrink-0 text-rose-500">
                  <AlertCircleIcon />
                </div>
                <div>
                  <span className="font-semibold block mb-0.5">Issue while logging in.</span>
                  {errorMessage}
                </div>
              </div>
            )}

            <form onSubmit={handleLogin} noValidate className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-brand-darkslate dark:text-brand-silver block transition-colors">
                  Username or E-mail
                </label>
                <input
                  id="input-username"
                  type="text"
                  value={empId}
                  onChange={(e) => setEmpId(e.target.value)}
                  className="w-full h-11 px-4 bg-brand-silver/15 dark:bg-brand-black/60 border border-brand-silver/60 dark:border-brand-darkslate/80 rounded-lg text-sm text-brand-dark dark:text-brand-smoke placeholder-brand-gray/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:border-brand-gold transition-all font-mono"
                  placeholder="Username or account@ciril.in"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-brand-darkslate dark:text-brand-silver block transition-colors">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="input-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-11 pl-4 pr-11 bg-brand-silver/15 dark:bg-brand-black/60 border border-brand-silver/60 dark:border-brand-darkslate/80 rounded-lg text-sm text-brand-dark dark:text-brand-smoke placeholder-brand-gray/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:border-brand-gold transition-all font-mono tracking-widest"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="w-10 h-10 flex items-center justify-center absolute right-1 top-1/2 -translate-y-1/2 text-brand-gray dark:text-brand-silver/70 hover:text-brand-gold transition-colors rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold"
                  >
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={onOpenRecovery}
                  className="text-xs text-brand-darkslate hover:text-brand-gold dark:text-brand-silver/80 dark:hover:text-brand-gold font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-gold rounded py-1 cursor-pointer"
                >
                  Recovery Process
                </button>
                <AnimatedButton type="submit">Login</AnimatedButton>
              </div>
            </form>
          </div>
        ) : null}

        {(phase === 'processing' || phase === 'success') && (
          <div className="space-y-6 relative transition-colors">
            <div className="absolute top-0 left-0 w-full h-1 bg-brand-darkslate/60 rounded-full overflow-hidden">
              <div className="h-full bg-brand-gold w-1/3 animate-shimmer-bar"></div>
            </div>

            <div className="border-b border-brand-silver/40 dark:border-brand-darkslate/60 pb-4 pt-2 transition-colors">
              <h3 className="text-sm font-semibold text-brand-dark dark:text-brand-smoke flex items-center transition-colors">
                <span className="text-brand-gold mr-2">
                  <TerminalIcon />
                </span>
                <span className="tracking-wide">Secure Login</span>
              </h3>
              {phase === 'processing' && (
                <div className="mt-2 text-xs font-mono text-brand-darkslate dark:text-brand-silver/80 flex justify-between">
                  <span></span>
                  <span className="text-brand-gold animate-pulse">Active</span>
                </div>
              )}
            </div>

            <div className="space-y-5">
              {/* Step 1: Verifying Account */}
              <div className="flex items-start space-x-3.5">
                <div className="mt-0.5 shrink-0">
                  {processStep === 1 ? (
                    <div className="spinner-brand"></div>
                  ) : (
                    <span className="text-emerald-500 bg-emerald-950/60 p-1 rounded-full block">
                      <CheckCircleIcon />
                    </span>
                  )}
                </div>
                <div className="flex-1">
                  <p
                    className={`text-sm font-medium transition-colors ${
                      processStep >= 1 ? 'text-brand-dark dark:text-brand-smoke' : 'text-brand-gray'
                    }`}
                  >
                    Verifying Your Account
                  </p>
                  {processStep === 1 && (
                    <div className="h-1 w-full bg-brand-darkslate/60 rounded-full mt-2 overflow-hidden">
                      <div className="h-full bg-brand-gold animate-shimmer-bar"></div>
                    </div>
                  )}
                  {processStep > 1 && (
                    <p className="text-xs font-mono text-brand-darkslate dark:text-brand-silver/70 mt-0.5">
                      ID_{empId || 'REQ'} Your account has been verified successfully.
                    </p>
                  )}
                </div>
              </div>

              {/* Step 2: Confirming Access / Geofence Check */}
              {processStep >= 2 && (
                <div className="flex items-start space-x-3.5">
                  <div className="mt-0.5 shrink-0">
                    {processStep === 2 ? (
                      <div className="spinner-brand"></div>
                    ) : activeScenario === 'mismatch' ? (
                      <span className="text-amber-500 bg-amber-950/60 p-1 rounded-full block">
                        <AlertCircleIcon />
                      </span>
                    ) : (
                      <span className="text-emerald-500 bg-emerald-950/60 p-1 rounded-full block">
                        <CheckCircleIcon />
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <p
                      className={`text-sm font-medium transition-colors ${
                        processStep >= 2 ? 'text-brand-dark dark:text-brand-smoke' : 'text-brand-gray'
                      }`}
                    >
                      Confirming Your Access
                    </p>
                    {processStep === 2 && (
                      <div className="h-1 w-full bg-brand-darkslate/60 rounded-full mt-2 overflow-hidden">
                        <div className="h-full bg-brand-gold animate-shimmer-bar"></div>
                      </div>
                    )}
                    {processStep >= 3 &&
                      (activeScenario === 'mismatch' ? (
                        isMismatchPending ? (
                          <div className="space-y-2.5 mt-2 font-mono text-xs animate-fade-in">
                            <div className="flex items-center space-x-1.5 text-amber-600 dark:text-amber-400 font-semibold">
                              <AlertCircleIcon />
                              <span>GPS Location Mismatch Detected</span>
                            </div>

                            <p className="text-[11px] font-sans text-brand-darkslate dark:text-brand-silver/90 leading-relaxed">
                              Your current GPS coordinates do not match the registered authorized workplace location.
                            </p>

                            <div className="p-2.5 bg-amber-500/10 border border-amber-500/25 rounded-xl text-[11px] text-amber-800 dark:text-amber-300 space-y-1">
                              <div className="flex items-center space-x-1.5 font-semibold">
                                <CrosshairIcon />
                                <span>
                                  DETECTED: {geoDetails?.lat || '17.448291'}° N, {geoDetails?.lon || '78.374829'}° E (±{geoDetails?.accuracy || '4.8'}m)
                                </span>
                              </div>
                              <div className="text-[10px] text-amber-700/90 dark:text-amber-400/90 pl-4">
                                AREA: {geoDetails?.locality || 'Remote Operational Node'}
                              </div>
                            </div>

                            {/* Option B Action Buttons */}
                            <div className="pt-2 flex flex-col sm:flex-row items-center gap-2 font-sans">
                              <button
                                type="button"
                                onClick={onAcceptLocation}
                                className="w-full sm:w-1/2 h-9 flex items-center justify-center space-x-1.5 px-3 rounded-lg bg-brand-dark hover:bg-brand-forestslate text-brand-smoke border border-brand-darkslate/40 dark:bg-brand-gold dark:hover:bg-brand-goldHover dark:text-brand-dark dark:border-brand-gold/40 text-xs font-semibold shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold cursor-pointer active:scale-[0.98]"
                              >
                                <ShieldCheckIcon />
                                <span>Continue</span>
                              </button>

                              <button
                                type="button"
                                onClick={onAbortLogin}
                                className="w-full sm:w-1/2 h-9 flex items-center justify-center space-x-1.5 px-3 rounded-lg border border-rose-500/40 text-rose-600 dark:text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 text-xs font-semibold shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 cursor-pointer active:scale-[0.98]"
                              >
                                <OctagonXIcon />
                                <span>Cancel Login</span>
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-1.5 mt-1 font-mono text-xs animate-fade-in">
                            <p className="text-amber-600 dark:text-amber-400 font-medium">
                              Your location is outside the expected area. This has been recorded for security.
                            </p>

                            <div className="p-2.5 bg-amber-500/10 border border-amber-500/25 rounded-md text-[11px] text-amber-800 dark:text-amber-300 space-y-1">
                              <div className="flex items-center space-x-1.5 font-semibold">
                                <CrosshairIcon />
                                <span>
                                  LOCATION RECORDED: {geoDetails?.lat || '17.448291'}° N, {geoDetails?.lon || '78.374829'}° E (±{geoDetails?.accuracy || '4.8'}m)
                                </span>
                              </div>
                              <div className="text-[10px] text-amber-700/90 dark:text-amber-400/90 pl-4">
                                AREA: {geoDetails?.locality || 'Remote Operational Node'}
                              </div>
                            </div>
                          </div>
                        )
                      ) : (
                        <div className="space-y-1 mt-1 font-mono text-xs">
                          <p className="text-brand-darkslate dark:text-brand-silver/75 font-medium">
                            Your location matches allowed locations.
                          </p>
                          <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-md text-[11px] text-emerald-700 dark:text-emerald-400 flex items-center space-x-1.5">
                            <CrosshairIcon />
                            <span>
                              GPS Locked: {geoDetails?.lat || '17.448291'}° N, {geoDetails?.lon || '78.374829'}° E (±{geoDetails?.accuracy || '4.8'}m)
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Step 3: Preparing Workspace */}
              {processStep >= 4 && (
                <div className="flex items-start space-x-3.5">
                  <div className="mt-0.5 shrink-0">
                    {phase !== 'success' ? (
                      <div className="spinner-brand"></div>
                    ) : (
                      <span className="text-emerald-500 bg-emerald-950/60 p-1 rounded-full block">
                        <CheckCircleIcon />
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <p
                      className={`text-sm font-medium transition-colors ${
                        processStep >= 4 ? 'text-brand-dark dark:text-brand-smoke' : 'text-brand-gray'
                      }`}
                    >
                      Preparing Your Workspace
                    </p>
                    {phase !== 'success' && (
                      <div className="h-1 w-full bg-brand-darkslate/60 rounded-full mt-2 overflow-hidden">
                        <div className="h-full bg-brand-gold animate-shimmer-bar"></div>
                      </div>
                    )}
                    {phase === 'success' && (
                      <p className="text-xs font-mono text-brand-darkslate dark:text-brand-silver/70 mt-0.5">
                        {activeScenario === 'mismatch'
                          ? 'Location verified & recorded. Workspace is ready to open.'
                          : 'Your access to workspace is ready to open.'}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {phase === 'success' && (
              <div className="mt-6 p-4 bg-emerald-500/10 dark:bg-emerald-950/50 border border-emerald-500/30 dark:border-emerald-800/60 rounded-lg text-center transition-colors">
                <p className="text-xs font-medium text-emerald-700 dark:text-emerald-300 flex items-center justify-center space-x-2">
                  <ShieldIcon />
                  <span>Login successful. Opening your workspace...</span>
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginFormSection;

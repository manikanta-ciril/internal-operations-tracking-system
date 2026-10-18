import React from 'react';
import { TerminalIcon, OctagonXIcon, AlertCircleIcon, EyeIcon, EyeOffIcon } from './Icons';
import AnimatedButton from './AnimatedButton';
import AuthProgress from '../auth/AuthProgress';

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
  auditNotice,
  onDismissAuditNotice,
  location,
  onContinue,
  onCancel,
  decisionBusy,
  decisionError,
}) => {
  return (
    <div className="w-full max-w-md animate-slide-up">
      <div className="bg-brand-smoke/90 dark:bg-brand-black/90 backdrop-blur-xl rounded-2xl shadow-[0_24px_50px_-12px_rgba(32,40,48,0.12)] dark:shadow-[0_24px_50px_-12px_rgba(0,0,0,0.5)] border border-brand-silver/50 dark:border-brand-darkslate/60 p-5 sm:p-7 md:p-8 relative overflow-hidden transition-all duration-300">
        {phase === 'idle' || phase === 'error' ? (
          <div className="auth-form-enter">
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
                <label htmlFor="input-username" className="text-xs font-semibold uppercase tracking-wider text-brand-darkslate dark:text-brand-silver block transition-colors">
                  Username
                </label>
                <input
                  id="input-username"
                  autoComplete="username"
                  type="text"
                  value={empId}
                  onChange={(e) => setEmpId(e.target.value)}
                  className="w-full h-11 px-4 bg-brand-silver/15 dark:bg-brand-black/60 border border-brand-silver/60 dark:border-brand-darkslate/80 rounded-lg text-sm text-brand-dark dark:text-brand-smoke placeholder-brand-gray/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:border-brand-gold transition-all font-mono"
                  placeholder="Your test username"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="input-password" className="text-xs font-semibold uppercase tracking-wider text-brand-darkslate dark:text-brand-silver block transition-colors">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="input-password"
                    autoComplete="current-password"
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

        {['processing', 'success', 'failed', 'location'].includes(phase) && <AuthProgress step={processStep} complete={phase === 'success'} failed={phase === 'failed'} message={errorMessage} paused={phase === 'location'} location={location} onContinue={onContinue} onCancel={onCancel} decisionBusy={decisionBusy} decisionError={decisionError}/>}
      </div>
    </div>
  );
};

export default LoginFormSection;

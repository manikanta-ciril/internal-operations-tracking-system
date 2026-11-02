import React from 'react';
import { OctagonXIcon, AlertCircleIcon, EyeIcon, EyeOffIcon } from './Icons';
import AnimatedButton from './AnimatedButton';
import AuthProgress from '../../features/auth/AuthProgress';

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
    <div className="w-full animate-slide-up">
      <div className="bg-brand-smoke/90 dark:bg-brand-black/90 backdrop-blur-xl rounded-2xl shadow-[0_24px_50px_-12px_rgba(32,40,48,0.12)] dark:shadow-[0_24px_50px_-12px_rgba(0,0,0,0.5)] border border-brand-silver/50 dark:border-brand-darkslate/60 px-6 py-10 sm:px-9 sm:py-14 md:px-10 md:py-16 relative overflow-hidden transition-all duration-300">
        {phase === 'idle' || phase === 'error' ? (
          <div className="auth-form-enter">
            <div className="mb-9 text-center">
              <h2 className="text-3xl sm:text-[32px] font-semibold tracking-tight text-brand-dark dark:text-brand-smoke transition-colors">
                Welcome back
              </h2>
              <p className="text-sm text-brand-darkslate dark:text-brand-silver mt-2 transition-colors">
                Sign in to your CIRIL account.
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
                      User <span className="font-semibold font-sans text-rose-700 dark:text-rose-300">{auditNotice.empId}</span> rejected off-site login attempt. Your access check was recorded at {auditNotice.timestamp}.
                    </p>
                    <div className="mt-1.5 text-[10px] font-sans text-brand-darkslate dark:text-brand-silver/70">
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
                  <span className="font-semibold block mb-0.5">Couldn't sign in.</span>
                  {errorMessage}
                </div>
              </div>
            )}

            <form onSubmit={handleLogin} noValidate className="space-y-6">
              <div className="space-y-1.5">
                <label htmlFor="input-username" className="text-xs font-semibold uppercase tracking-wider text-brand-darkslate dark:text-brand-silver block transition-colors">
                  Username or email
                </label>
                <input
                  id="input-username"
                  autoComplete="username"
                  autoCapitalize="none"
                  spellCheck={false}
                  maxLength={254}
                  type="text"
                  value={empId}
                  onChange={(e) => setEmpId(e.target.value)}
                  className="w-full h-12 px-4 bg-brand-silver/15 dark:bg-brand-black/60 border border-brand-silver/60 dark:border-brand-darkslate/80 rounded-lg text-base text-brand-dark dark:text-brand-smoke placeholder-brand-darkslate/55 dark:placeholder-brand-silver/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:border-brand-gold transition-all font-sans"
                  placeholder="your username or email"
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
                    className="w-full h-12 pl-4 pr-11 bg-brand-silver/15 dark:bg-brand-black/60 border border-brand-silver/60 dark:border-brand-darkslate/80 rounded-lg text-base text-brand-dark dark:text-brand-smoke placeholder-brand-darkslate/55 dark:placeholder-brand-silver/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:border-brand-gold transition-all font-sans"
                    placeholder="your password"
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
                  Forgot password?
                </button>
                <AnimatedButton type="submit">Sign in</AnimatedButton>
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

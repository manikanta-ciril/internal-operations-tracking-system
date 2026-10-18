import { useLayoutEffect, useRef } from 'react';
import { createScope, createTimeline, stagger } from 'animejs';
import './auth-motion.css';
import LocationDecision from './LocationDecision';

const stages = [
  ['Verifying your account', 'Checking your username and password.'],
  ['Checking your location', 'Comparing your position with the office radius.'],
  ['Saving your photo', 'Your confirmed photo is stored as sign-in evidence.'],
  ['Preparing your workspace', 'Getting your personal welcome page ready.'],
];

export default function AuthProgress({ step, complete, failed = false, message = '', paused = false, location, onContinue, onCancel, decisionBusy, decisionError }) {
  const root = useRef(null);
  useLayoutEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const scope = createScope({ root }).add(() => {
      createTimeline({ defaults: { ease: 'out(4)', duration: 480 } })
        .add('.auth-emblem', { opacity: [0, 1], scale: [.85, 1] })
        .add('.auth-progress-heading, .auth-stage', { opacity: [0, 1], y: [12, 0], delay: stagger(90) }, 100);
    });
    return () => scope.revert();
  }, []);
  return <div ref={root} className={`auth-progress ${complete ? 'is-complete' : ''} ${failed ? 'is-failed' : ''} ${paused ? 'is-paused' : ''}`} aria-busy={!complete && !failed && !paused}>
    <div className="auth-emblem" aria-hidden="true">
      <svg className="auth-orbit" viewBox="0 0 100 100"><circle className="auth-orbit-track" cx="50" cy="50" r="45"/><circle className="auth-orbit-arc" cx="50" cy="50" r="45"/></svg>
      <svg className="auth-lock" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">{failed ? <path d="m10 10 12 12m0-12L10 22"/> : <><path className="auth-shackle" d="M10 14V10a6 6 0 0 1 12 0v4"/><rect x="6" y="14" width="20" height="15" rx="4"/><path d="M16 20v4"/></>}</svg>
    </div>
    <div className="auth-progress-heading"><span className="auth-progress-caption">CIRIL · System access</span><h2>{paused ? 'Sign-in paused.' : failed ? 'Let’s try that again.' : complete ? 'You’re all set.' : 'Signing you in.'}</h2><p>{paused ? 'Your account is verified. A location decision is required.' : failed ? message : complete ? 'Opening your workspace…' : 'A moment while we get things ready.'}</p></div>
    <div className="auth-stages">
      {stages.map(([title, detail], index) => {
        const number = index + 1;
        if (number > step && !complete) return null;
        const done = step > number || complete;
        const current = step === number && !complete;
        return <div key={title} className={`auth-stage ${done ? 'is-done' : ''} ${current ? 'is-current' : ''}`}>
          <span className="auth-stage-mark" aria-hidden="true">{paused && current ? '!' : done ? <svg viewBox="0 0 20 20" fill="none"><path d="m5 10 3 3 7-7"/></svg> : <span>{number}</span>}</span>
          <div><h3>{title}</h3><p>{paused && current ? 'Location does not confirm on-site presence. Waiting for your decision.' : done ? ['Account verified.', 'Location check completed.', 'Photo evidence saved.', 'Your workspace is ready.'][index] : detail}</p></div>
          {current && !failed && !paused && <span className="auth-stage-spinner" aria-hidden="true"/>}
        </div>;
      })}
    </div>
    {paused && <LocationDecision inline location={location} onContinue={onContinue} onCancel={onCancel} busy={decisionBusy} error={decisionError}/>}
    <div className="auth-progress-track" aria-hidden="true"><span style={{ width: `${complete ? 100 : (step - 1) * 25 + 10}%` }}/></div>
    <p className="auth-progress-status" role="status" aria-live="polite">{paused ? 'Paused — workspace access has not been granted.' : failed ? 'Returning to the login form…' : complete ? 'Login successful. Opening your workspace.' : stages[Math.min(step - 1, 3)][0]}</p>
  </div>;
}

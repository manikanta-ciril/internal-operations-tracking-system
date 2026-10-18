export default function WelcomeCard({ user, role }) {
  const initials = user.name.split(' ').slice(0, 2).map(part => part[0]).join('');
  return <section className="role-card" aria-labelledby="dashboard-title">
    <div className="welcome-accent" aria-hidden="true"/>
    <div className="welcome-identity" data-reveal><span className="welcome-avatar" aria-hidden="true">{initials}</span><span className="welcome-status"><span/>{user.location?.status === 'offsite' ? 'Off-site session' : user.location?.status === 'onsite' ? 'On-site session' : 'Location unknown'}</span></div>
    <p className="welcome-kicker" data-reveal>Your personal workspace</p>
    <h1 id="dashboard-title" tabIndex={-1} data-reveal>Welcome back,<br/><span>{user.name}.</span></h1>
    <p className="role-description" data-reveal>Good to have you here. This is your space for the work ahead.</p>
    <div className="welcome-account" data-reveal><div><span className="welcome-label">Current role</span><p className="role-name">{role}</p></div><span className="welcome-account-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 3 4 6v6c0 5 8 9 8 9s8-4 8-9V6l-8-3Z"/><path d="m8.5 12 2.5 2.5 4.5-5"/></svg></span></div>
  </section>;
}

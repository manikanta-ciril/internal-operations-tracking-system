import WelcomeCard from './WelcomeCard';

export default function LeadManager({ user, children }) {
  return <WelcomeCard user={user} role="Lead Manager / Operations Manager">{children}</WelcomeCard>;
}

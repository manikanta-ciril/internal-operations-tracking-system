import WelcomeCard from './WelcomeCard';

export default function ITSystemAnalyst({ user, children }) {
  return <WelcomeCard user={user} role="IT System Analyst">{children}</WelcomeCard>;
}

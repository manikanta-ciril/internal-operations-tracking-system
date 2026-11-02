import WelcomeCard from './WelcomeCard';

export default function SeniorManager({ user, children }) {
  return <WelcomeCard user={user} role="Senior Manager">{children}</WelcomeCard>;
}

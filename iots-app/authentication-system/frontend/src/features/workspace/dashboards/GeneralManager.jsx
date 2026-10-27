import WelcomeCard from './WelcomeCard';

export default function GeneralManager({ user, children }) {
  return <WelcomeCard user={user} role="General Manager">{children}</WelcomeCard>;
}

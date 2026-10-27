import WelcomeCard from './WelcomeCard';

export default function Admin({ user, children }) {
  return <WelcomeCard user={user} role="Admin">{children}</WelcomeCard>;
}

import WelcomeCard from './WelcomeCard';
export default function Coordinator({ user, children }) {
  return <WelcomeCard user={user} role="Coordinator">{children}</WelcomeCard>;
}

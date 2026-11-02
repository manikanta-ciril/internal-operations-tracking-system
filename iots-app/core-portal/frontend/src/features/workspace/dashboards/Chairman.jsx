import WelcomeCard from './WelcomeCard';

export default function Chairman({ user, children }) {
  return <WelcomeCard user={user} role="Chairman">{children}</WelcomeCard>;
}

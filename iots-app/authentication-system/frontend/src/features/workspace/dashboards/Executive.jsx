import WelcomeCard from './WelcomeCard';

export default function Executive({ user, children }) {
  return <WelcomeCard user={user} role="Executive">{children}</WelcomeCard>;
}

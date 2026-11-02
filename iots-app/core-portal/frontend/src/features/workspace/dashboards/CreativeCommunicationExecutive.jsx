import WelcomeCard from './WelcomeCard';

export default function CreativeCommunicationExecutive({ user, children }) {
  return <WelcomeCard user={user} role="Creative Communication Executive">{children}</WelcomeCard>;
}

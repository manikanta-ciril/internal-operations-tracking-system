import WelcomeCard from './WelcomeCard';

export default function CreativeCommunicationAssociate({ user, children }) {
  return <WelcomeCard user={user} role="Creative Communication Associate">{children}</WelcomeCard>;
}

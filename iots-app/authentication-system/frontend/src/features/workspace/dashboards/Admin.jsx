import WelcomeCard from './WelcomeCard';

export default function Admin({ user }) {
  return <WelcomeCard user={user} role="Admin"/>;
}

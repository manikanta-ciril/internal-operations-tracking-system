import WelcomeCard from './WelcomeCard';

export default function SuperAdmin({ user }) {
  return <WelcomeCard user={user} role="Super Admin"/>;
}

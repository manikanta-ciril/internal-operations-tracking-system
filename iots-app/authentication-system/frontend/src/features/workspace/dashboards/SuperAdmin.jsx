import WelcomeCard from './WelcomeCard';

export default function SuperAdmin({ user, children }) {
  return <WelcomeCard user={user} role="Super Admin">{children}</WelcomeCard>;
}

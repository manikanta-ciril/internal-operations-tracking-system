import WelcomeCard from './WelcomeCard';

export default function BusinessDevelopmentExecutive({ user, children }) {
  return <WelcomeCard user={user} role="Business Development Executive">{children}</WelcomeCard>;
}

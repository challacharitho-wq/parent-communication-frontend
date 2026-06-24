import { createFileRoute, redirect } from '@tanstack/react-router';
import { LoginForm } from '@/features/authentication/components/login-form';
import { hydrateSessionUser } from '@/features/authentication/utils/auth-session';

export const Route = createFileRoute('/login')({
  beforeLoad: async () => {
    const user = await hydrateSessionUser();
    if (user) {
      if (user.twoFactorEnabled) throw redirect({ to: '/2fa-verify' });
      if (user.mustChangePassword) throw redirect({ to: '/change-password' });
      throw redirect({ to: '/dashboard' });
    }
  },
  component: LoginPage,
});

function LoginPage() {
  return <LoginForm />;
}


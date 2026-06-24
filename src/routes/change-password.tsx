import { createFileRoute, redirect } from '@tanstack/react-router';
import { ChangePassword } from '@/features/authentication/components/change-password';
import { hydrateSessionUser } from '@/features/authentication/utils/auth-session';

export const Route = createFileRoute('/change-password')({
  beforeLoad: async () => {
    const user = await hydrateSessionUser();
    if (!user) throw redirect({ to: '/login' });
    if (!user.mustChangePassword) throw redirect({ to: '/dashboard' });
  },
  component: ChangePasswordPage,
});

function ChangePasswordPage() {
  return <ChangePassword />;
}


import { createFileRoute, redirect } from '@tanstack/react-router';
import { TwoFactorVerify } from '@/features/authentication/components/two-factor-verify';
import { hydrateSessionUser } from '@/features/authentication/utils/auth-session';

export const Route = createFileRoute('/2fa-verify')({
  beforeLoad: async () => {
    const user = await hydrateSessionUser();
    if (!user) throw redirect({ to: '/login' });
    if (!user.twoFactorEnabled) throw redirect({ to: '/dashboard' });
  },
  component: TwoFactorPage,
});

function TwoFactorPage() {
  return <TwoFactorVerify />;
}


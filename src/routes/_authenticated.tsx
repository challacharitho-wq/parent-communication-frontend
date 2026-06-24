import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { hydrateSessionUser } from '@/features/authentication/utils/auth-session';

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async () => {
    const user = await hydrateSessionUser();
    if (!user) {
      throw redirect({ to: '/login' });
    }
  },
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Outlet />
    </div>
  );
}


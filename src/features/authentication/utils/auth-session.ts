import { authService } from '../services/auth-service';
import { useAuthStore } from '../store/auth-store';
import type { User } from '../types/auth-types';

export async function hydrateSessionUser(): Promise<User | null> {
  const existingUser = useAuthStore.getState().user;
  if (existingUser) {
    return existingUser;
  }

  try {
    const session = await authService.getSession();
    if (session?.user) {
      useAuthStore.getState().setUser(session.user);
      return session.user;
    }
  } catch {
    // Ignore session lookup failures and fall through to unauthenticated handling.
  }

  return null;
}


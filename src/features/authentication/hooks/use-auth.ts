import { useQuery, useMutation } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { authService } from '@/features/authentication/services/auth-service';
import { useAuthStore } from '@/features/authentication/store/auth-store';
import axios from 'axios';

export function useAuth() {
  const { setUser, clearUser } = useAuthStore();
  const navigate = useNavigate();

  const sessionQuery = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      try {
        const data = await authService.getSession();
        if (data?.user) {
          setUser(data.user);
        }
        return data;
      } catch {
        clearUser();
        return null;
      }
    },
    staleTime: Infinity,
  });

  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      setUser(data.user);

      if (data.user.twoFactorEnabled) {
        navigate({ to: '/2fa-verify' });
        return;
      }

      if (data.user.mustChangePassword) {
        navigate({ to: '/change-password' });
        return;
      }

      navigate({ to: '/dashboard' });
    },
    onError: (error) => {
      console.error('Login error:', error);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: authService.logout,
    onSuccess: () => {
      clearUser();
      navigate({ to: '/login' });
    },
  });

  // Extract a readable error message
  let errorMessage: string | null = null;
  if (loginMutation.error) {
    if (axios.isAxiosError(loginMutation.error)) {
      errorMessage = loginMutation.error.response?.data?.error || loginMutation.error.message;
    } else {
      errorMessage = (loginMutation.error as Error).message || 'An unexpected error occurred';
    }
  }

  return {
    user: sessionQuery.data?.user,
    isLoading: sessionQuery.isLoading,
    login: loginMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    loginError: errorMessage,
    logout: logoutMutation.mutate,
  };
}

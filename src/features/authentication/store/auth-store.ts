import { create } from 'zustand';
import type { User } from '@/features/authentication/types/auth-types';

interface AuthState {
  user: User | null;
  setUser: (user: User) => void;
  clearUser: () => void;
}

// Read initial user from localStorage to persist sessions across reloads in iframe environments
const getInitialUser = (): User | null => {
  try {
    const stored = localStorage.getItem('academic-clarity-user');
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

export const useAuthStore = create<AuthState>((set) => ({
  user: getInitialUser(),
  setUser: (user) => {
    try {
      localStorage.setItem('academic-clarity-user', JSON.stringify(user));
    } catch (e) {
      console.error('Failed to save user to localStorage:', e);
    }
    set({ user });
  },
  clearUser: () => {
    try {
      localStorage.removeItem('academic-clarity-user');
    } catch (e) {
      console.error('Failed to remove user from localStorage:', e);
    }
    set({ user: null });
  },
}));

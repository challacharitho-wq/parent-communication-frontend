import { api } from '@/services/api';
import type { 
  SessionResponse, 
} from '@/features/authentication/types/auth-types';
import type {
  LoginInput, 
  ChangeTempPasswordInput,
  TwoFactorVerifyInput
} from '@/features/authentication/schemas/auth-schemas';

export const authService = {
  async login(input: LoginInput): Promise<SessionResponse> {
    const response = await api.post('/api/auth/sign-in/email', input);
    return response.data as SessionResponse;
  },

  async logout(): Promise<{ success: boolean }> {
    const response = await api.post('/api/auth/sign-out');
    return response.data;
  },

  async getSession(): Promise<SessionResponse | null> {
    const response = await api.get('/api/auth/get-session');
    return response.data as SessionResponse | null;
  },

  async changeTempPassword(input: ChangeTempPasswordInput): Promise<any> {
    const response = await api.post('/api/auth/change-temp-password', input);
    return response.data;
  },

  async verify2FA(input: TwoFactorVerifyInput): Promise<{ success: boolean }> {
    const response = await api.post('/api/auth/two-factor/verify', input);
    return response.data;
  },

  async googleLogin(): Promise<any> {
    const response = await api.post('/api/auth/sign-in/social', {
      provider: 'google'
    });
    return response.data;
  },
};

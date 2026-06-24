import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from '@tanstack/react-router';
import { ArrowRight, GraduationCap, MessageCircleCode, Shield, Sparkles, User } from 'lucide-react';
import { useAuth } from '@/features/authentication/hooks/use-auth';
import { loginSchema } from '@/features/authentication/schemas/auth-schemas';
import type { LoginInput } from '@/features/authentication/schemas/auth-schemas';
import { useAuthStore } from '@/features/authentication/store/auth-store';
import { authService } from '../services/auth-service';
import { Role } from '../types/auth-types';

const roleOptions = [
  {
    id: Role.PARENT,
    label: 'Parent',
    description: 'View attendance, marks, homework, and messages.',
    icon: User,
    email: 'parent@school.com',
    password: 'Password123',
  },
  {
    id: Role.TEACHER,
    label: 'Teacher',
    description: 'Manage class updates and parent communication.',
    icon: GraduationCap,
    email: 'teacher@school.com',
    password: 'Password123',
  },
  {
    id: Role.ADMIN,
    label: 'Admin',
    description: 'Handle school-level access and oversight.',
    icon: Shield,
    email: 'admin@parentportal.com',
    password: 'Admin@123456',
  },
] as const;

export function LoginForm() {
  const { login, isLoggingIn, loginError } = useAuth();
  const navigate = useNavigate();
  const [googleLoading, setGoogleLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<(typeof roleOptions)[number]['id']>(Role.PARENT);
  const activeRole = roleOptions.find((role) => role.id === selectedRole) ?? roleOptions[0];
  const ActiveRoleIcon = activeRole.icon;

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: activeRole.email,
      password: activeRole.password,
    },
  });

  useEffect(() => {
    form.reset({
      email: activeRole.email,
      password: activeRole.password,
    });
  }, [activeRole.email, activeRole.password, form]);

  const handleSubmit = form.handleSubmit((data) => {
    login(data);
  });

  const handleGoogleLogin = async () => {
    try {
      setGoogleLoading(true);
      const data = await authService.googleLogin();
      if (data.user) {
        useAuthStore.getState().setUser(data.user);
      }
      if (data.url) {
        navigate({ to: data.url });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-background">
        <div className="bg-glow bg-glow-1"></div>
        <div className="bg-glow bg-glow-2"></div>
      </div>

      <div className="login-container">
        <div className="login-header">
          <div className="login-logo">
            <div className="logo-icon-wrapper">
              <MessageCircleCode size={28} />
            </div>
            <div>
              <h2>Academic Clarity</h2>
              <p>Parent Communication Agentic Portal</p>
            </div>
          </div>
          <div className="ai-tag">
            <Sparkles size={12} className="ai-glow-icon" />
            <span>AI-Powered Insights</span>
          </div>
        </div>

        <div className="login-card">
          <div className="login-card-content">
            <div className="role-tabs" style={{ marginBottom: '1rem' }}>
              {roleOptions.map((role) => {
                const RoleIcon = role.icon;
                const isActive = selectedRole === role.id;

                return (
                  <button
                    key={role.id}
                    type="button"
                    className={`role-tab ${isActive ? 'active' : ''}`}
                    onClick={() => setSelectedRole(role.id)}
                  >
                    <RoleIcon size={16} />
                    <span>{role.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="login-form-header">
              <div className="flex justify-between align-center mb-2">
                <h3>Sign In as {activeRole.label}</h3>
                <div className="flex align-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                  <ActiveRoleIcon size={16} />
                  <span>{activeRole.description}</span>
                </div>
              </div>
              <p>Access your {activeRole.label.toLowerCase()} account</p>
            </div>

            {loginError && (
              <div className="p-3 mb-4 text-sm text-red-500 bg-red-500/10 rounded-lg border border-red-500/20" role="alert">
                {loginError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="login-form">
              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  className="form-input"
                  {...form.register('email')}
                  placeholder="name@school.edu"
                />
                {form.formState.errors.email && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.email.message}</p>
                )}
              </div>

              <div className="form-group">
                <div className="justify-between flex">
                  <label>Password</label>
                  <a href="#" className="forgot-password-link">Forgot password?</a>
                </div>
                <input
                  type="password"
                  className="form-input"
                  {...form.register('password')}
                  placeholder="••••••••"
                />
                {form.formState.errors.password && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.password.message}</p>
                )}
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-block login-btn"
                disabled={isLoggingIn}
              >
                {isLoggingIn ? (
                  <span className="spinner">Connecting...</span>
                ) : (
                  <>
                    <span>Enter Portal</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            <div className="login-divider">
              <span>or continue with</span>
            </div>

            <div className="login-options-container" style={{ marginBottom: 0 }}>
              <button
                type="button"
                className="login-option-btn"
                onClick={handleGoogleLogin}
                disabled={googleLoading}
              >
                {googleLoading ? (
                  <span className="spinner">Connecting...</span>
                ) : (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    <span>Continue with Google</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="login-footer">
          <p>(c) 2026 Academic Clarity Parent Communication Portal. Powered by Agentic AI.</p>
        </div>
      </div>
    </div>
  );
}

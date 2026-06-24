import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { changeTempPasswordSchema } from '@/features/authentication/schemas/auth-schemas';
import type { ChangeTempPasswordInput } from '@/features/authentication/schemas/auth-schemas';
import { ArrowRight, MessageCircleCode } from 'lucide-react';
import { authService } from '../services/auth-service';
import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';

export function ChangePassword() {
  const [isChanging, setIsChanging] = useState(false);
  const navigate = useNavigate();
  const form = useForm<ChangeTempPasswordInput>({
    resolver: zodResolver(changeTempPasswordSchema),
    defaultValues: { newPassword: '', currentPassword: '' },
  });

  const handleSubmit = form.handleSubmit(async (data) => {
    try {
      setIsChanging(true);
      const res = await authService.changeTempPassword(data);
      if (res.success || res.data?.success) {
        navigate({ to: '/dashboard' });
      }
    } catch (e: any) {
      console.error(e);
      form.setError('newPassword', { message: e.response?.data?.error || 'Failed to change password' });
    } finally {
      setIsChanging(false);
    }
  });

  return (
    <div className="login-wrapper">
      <div className="login-background">
        <div className="bg-glow bg-glow-1"></div>
      </div>
      <div className="login-container">
        <div className="login-header">
          <div className="login-logo">
            <div className="logo-icon-wrapper">
              <MessageCircleCode size={28} />
            </div>
            <h2>Change Password Required</h2>
          </div>
        </div>
        <div className="login-card">
          <div className="login-card-content">
            <p className="mb-4 text-sm opacity-80">Your account requires you to set a new password before continuing.</p>
            <form onSubmit={handleSubmit} className="login-form">
              <div className="form-group">
                <label>Current Password (Optional)</label>
                <input 
                  type="password" 
                  className="form-input" 
                  {...form.register('currentPassword')}
                  placeholder="••••••••"
                />
              </div>
              <div className="form-group">
                <label>New Password</label>
                <input 
                  type="password" 
                  className="form-input" 
                  {...form.register('newPassword')}
                  placeholder="••••••••"
                />
                {form.formState.errors.newPassword && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.newPassword.message}</p>
                )}
              </div>
              <button 
                type="submit" 
                className="btn btn-primary btn-block login-btn"
                disabled={isChanging}
              >
                {isChanging ? (
                  <span className="spinner">Updating...</span>
                ) : (
                  <>
                    <span>Update Password</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

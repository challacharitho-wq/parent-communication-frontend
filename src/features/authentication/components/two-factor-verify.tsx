import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { twoFactorSchema } from '@/features/authentication/schemas/auth-schemas';
import type { TwoFactorVerifyInput } from '@/features/authentication/schemas/auth-schemas';
import { ArrowRight, MessageCircleCode } from 'lucide-react';
import { authService } from '../services/auth-service';
import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';

export function TwoFactorVerify() {
  const [isVerifying, setIsVerifying] = useState(false);
  const navigate = useNavigate();
  const form = useForm<TwoFactorVerifyInput>({
    resolver: zodResolver(twoFactorSchema),
    defaultValues: { code: '' },
  });

  const handleSubmit = form.handleSubmit(async (data) => {
    try {
      setIsVerifying(true);
      const res = await authService.verify2FA(data);
      if (res.success || (res as any).session) {
        navigate({ to: '/dashboard' });
      }
    } catch (e) {
      console.error(e);
      form.setError('code', { message: 'Invalid verification code' });
    } finally {
      setIsVerifying(false);
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
            <h2>Two-Factor Authentication</h2>
          </div>
        </div>
        <div className="login-card">
          <div className="login-card-content">
            <form onSubmit={handleSubmit} className="login-form">
              <div className="form-group">
                <label>Verification Code</label>
                <input 
                  type="text" 
                  className="form-input" 
                  {...form.register('code')}
                  placeholder="000000"
                  maxLength={6}
                />
                {form.formState.errors.code && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.code.message}</p>
                )}
              </div>
              <button 
                type="submit" 
                className="btn btn-primary btn-block login-btn"
                disabled={isVerifying}
              >
                {isVerifying ? (
                  <span className="spinner">Verifying...</span>
                ) : (
                  <>
                    <span>Verify Code</span>
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

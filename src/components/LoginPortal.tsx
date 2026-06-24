import React, { useState } from 'react';
import { Shield, Users, User, ArrowRight, Sparkles, MessageCircleCode, AlertCircle } from 'lucide-react';
import { api } from '@/services/api';
import InitialsAvatar from './InitialsAvatar';

interface LoginPortalProps {
  onLogin: (userData: any) => void;
}

export default function LoginPortal({ onLogin }: LoginPortalProps) {
  const [role, setRole] = useState<'parent' | 'teacher' | 'management'>('parent');
  const [email, setEmail] = useState('parent.chloe@school.edu');
  const [password, setPassword] = useState('password123');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleRoleChange = (newRole: 'parent' | 'teacher' | 'management') => {
    setRole(newRole);
    setErrorMessage(null);
    if (newRole === 'parent') {
      setEmail('parent.chloe@school.edu');
    } else if (newRole === 'teacher') {
      setEmail('sarah.jenkins@school.edu');
    } else {
      setEmail('admin@school.edu');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);
    
    try {
      const response = await api.post('/api/auth/sign-in/email', {
        email: email.trim(),
        password
      });

      if (response.data && response.data.user) {
        onLogin(response.data.user);
      }
    } catch (err: any) {
      console.error('Sign-in error:', err);
      const serverError = err.response?.data?.error || 'Authentication failed. Please verify credentials.';
      setErrorMessage(serverError);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-wrapper" style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f5f5f7', // Clean off-white background (Apple-style)
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      padding: '2rem 1rem'
    }}>
      <div className="login-container" style={{
        width: '100%',
        maxWidth: '440px',
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem'
      }}>
        
        {/* Apple-style minimalist logo header */}
        <div className="login-header text-center" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
          <div className="logo-icon-wrapper" style={{
            width: '56px',
            height: '56px',
            backgroundColor: '#ffffff',
            border: '1px solid #eaeaea',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.02)',
            color: '#111111'
          }}>
            <MessageCircleCode size={28} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, letterSpacing: '-0.02em', color: '#111111', margin: 0 }}>Academic Clarity</h2>
            <p style={{ fontSize: '0.85rem', color: '#666666', marginTop: '0.25rem' }}>School Engagement & Communication Suite</p>
          </div>
        </div>

        {/* Elegant modular white card with paper-thin borders */}
        <div className="login-card" style={{
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          border: '1px solid #e5e5e7',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.04)',
          overflow: 'hidden'
        }}>
          {/* Top segment control / Tabs with soft light gray background */}
          <div className="role-tabs" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            padding: '6px',
            backgroundColor: '#f5f5f7',
            borderBottom: '1px solid #e5e5e7'
          }}>
            <button 
              type="button" 
              className={`role-tab ${role === 'parent' ? 'active' : ''}`}
              onClick={() => handleRoleChange('parent')}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '10px 4px',
                border: 'none',
                borderRadius: '14px',
                cursor: 'pointer',
                backgroundColor: role === 'parent' ? '#ffffff' : 'transparent',
                color: role === 'parent' ? '#111111' : '#666666',
                boxShadow: role === 'parent' ? '0 2px 8px rgba(0,0,0,0.04)' : 'none',
                fontWeight: role === 'parent' ? 600 : 500,
                fontSize: '0.75rem',
                transition: 'all 0.2s ease'
              }}
            >
              <User size={15} />
              <span>Parent</span>
            </button>
            <button 
              type="button" 
              className={`role-tab ${role === 'teacher' ? 'active' : ''}`}
              onClick={() => handleRoleChange('teacher')}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '10px 4px',
                border: 'none',
                borderRadius: '14px',
                cursor: 'pointer',
                backgroundColor: role === 'teacher' ? '#ffffff' : 'transparent',
                color: role === 'teacher' ? '#111111' : '#666666',
                boxShadow: role === 'teacher' ? '0 2px 8px rgba(0,0,0,0.04)' : 'none',
                fontWeight: role === 'teacher' ? 600 : 500,
                fontSize: '0.75rem',
                transition: 'all 0.2s ease'
              }}
            >
              <Users size={15} />
              <span>Teacher</span>
            </button>
            <button 
              type="button" 
              className={`role-tab ${role === 'management' ? 'active' : ''}`}
              onClick={() => handleRoleChange('management')}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '10px 4px',
                border: 'none',
                borderRadius: '14px',
                cursor: 'pointer',
                backgroundColor: role === 'management' ? '#ffffff' : 'transparent',
                color: role === 'management' ? '#111111' : '#666666',
                boxShadow: role === 'management' ? '0 2px 8px rgba(0,0,0,0.04)' : 'none',
                fontWeight: role === 'management' ? 600 : 500,
                fontSize: '0.75rem',
                transition: 'all 0.2s ease'
              }}
            >
              <Shield size={15} />
              <span>Admin</span>
            </button>
          </div>

          <div className="login-card-content" style={{ padding: '2rem 1.75rem' }}>
            <div className="login-form-header" style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: '#111111', margin: 0 }}>Portal Sign In</h3>
              <p style={{ fontSize: '0.8rem', color: '#666666', marginTop: '0.25rem' }}>
                Secure access to verified {role === 'parent' ? 'Parent records' : role === 'teacher' ? 'Teacher logs' : 'School management tools'}.
              </p>
            </div>

            {errorMessage && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1rem',
                borderRadius: '10px',
                backgroundColor: '#fff2f2',
                border: '1px solid #ffe5e5',
                color: '#d11a1a',
                fontSize: '0.8rem',
                marginBottom: '1.25rem',
                fontWeight: 500
              }}>
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="login-form" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#666666', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email Address</label>
                <input 
                  type="email" 
                  className="form-input" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@school.edu"
                  required
                  style={{
                    padding: '12px 14px',
                    borderRadius: '12px',
                    border: '1px solid #d1d1d6',
                    fontSize: '0.9rem',
                    color: '#111111',
                    outline: 'none',
                    backgroundColor: '#fbfbfe',
                    transition: 'border-color 0.2s ease'
                  }}
                />
              </div>

              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                <div style={{ display: 'flex', justifyContent: 'between', alignItems: 'center' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#666666', textTransform: 'uppercase', letterSpacing: '0.05em', flexGrow: 1 }}>Password</label>
                </div>
                <input 
                  type="password" 
                  className="form-input" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  style={{
                    padding: '12px 14px',
                    borderRadius: '12px',
                    border: '1px solid #d1d1d6',
                    fontSize: '0.9rem',
                    color: '#111111',
                    outline: 'none',
                    backgroundColor: '#fbfbfe',
                    transition: 'border-color 0.2s ease'
                  }}
                />
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                style={{
                  padding: '13px',
                  borderRadius: '12px',
                  border: 'none',
                  backgroundColor: '#111111', // Solid premium black/grey button (Apple)
                  color: '#ffffff',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  marginTop: '0.5rem',
                  transition: 'opacity 0.2s ease',
                  opacity: isSubmitting ? 0.7 : 1
                }}
              >
                {isSubmitting ? (
                  <span>Connecting Securely...</span>
                ) : (
                  <>
                    <span>Enter Portal</span>
                    <ArrowRight size={15} />
                  </>
                )}
              </button>
            </form>

            {/* Apple style demo context banner */}
            <div className="demo-credentials-helper" style={{
              marginTop: '1.75rem',
              padding: '1rem',
              borderRadius: '12px',
              backgroundColor: '#f5f5f7',
              border: '1px solid #eaeaea',
              fontSize: '0.75rem',
              color: '#666666'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#111111', fontWeight: 600, marginBottom: '0.4rem' }}>
                <Sparkles size={12} />
                <span>ACTIVE LOGIN CREDENTIALS</span>
              </div>
              <p style={{ margin: '0 0 0.5rem', lineHeight: '1.4' }}>Below are the pre-configured school profiles. Selecting a role above loads their dynamic server record:</p>
              
              <div className="flex align-center gap-3" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <InitialsAvatar 
                  name={role === 'parent' ? 'Robert Miller' : role === 'teacher' ? 'Sarah Jenkins' : 'Dr. Alistair Vance'} 
                  size={32} 
                />
                <div>
                  <strong style={{ color: '#111111', display: 'block' }}>
                    {role === 'parent' ? 'Robert Miller' : role === 'teacher' ? 'Sarah Jenkins' : 'Dr. Alistair Vance'}
                  </strong>
                  <span style={{ fontSize: '0.7rem' }}>Pass: <code style={{ fontFamily: 'monospace', backgroundColor: '#eaeaea', padding: '1px 4px', borderRadius: '4px' }}>password123</code></span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="login-footer text-center" style={{ fontSize: '0.75rem', color: '#86868b', lineHeight: '1.5' }}>
          <p>© 2026 Academic Clarity. Registered School Communications Hub.<br />Protected by Agentic Guardian protocols.</p>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import LoginPortal from './components/LoginPortal';
import ParentPortal from './portals/ParentPortal';
import TeacherPortal from './portals/TeacherPortal';
import ManagementPortal from './portals/ManagementPortal';
import { api } from '@/services/api';

function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activityLog, setActivityLog] = useState<any[]>([]);

  // Attempt session recovery on load
  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await api.get('/api/auth/get-session');
        if (response.data && response.data.user) {
          setUser(response.data.user);
        }
      } catch (err) {
        console.warn('No active session recovered:', err);
      } finally {
        setLoading(false);
      }
    };
    checkSession();
  }, []);

  // Fetch recent system logs
  const fetchLogs = async () => {
    try {
      const response = await api.get('/api/system/logs');
      setActivityLog(response.data);
    } catch (err) {
      console.error('Failed to fetch activity logs:', err);
    }
  };

  useEffect(() => {
    if (user) {
      const timer = setTimeout(() => {
        fetchLogs();
      }, 0);
      const interval = setInterval(fetchLogs, 5000); // refresh every 5s
      return () => {
        clearTimeout(timer);
        clearInterval(interval);
      };
    }
  }, [user]);

  // Add a new log to the activity feed
  const addLog = async (text: string, iconType = 'sparkles') => {
    try {
      const response = await api.post('/api/system/logs', { text, iconType });
      setActivityLog(prev => [response.data, ...prev]);
    } catch (err) {
      console.error('Failed to add system log:', err);
    }
  };

  const handleLogin = (userData: any) => {
    setUser(userData);
    addLog(`${userData.name} successfully logged in as ${userData.role.toUpperCase()}.`, 'users');
  };

  const handleLogout = async () => {
    try {
      await api.post('/api/auth/sign-out');
      addLog(`${user?.name || 'User'} signed out.`, 'users');
    } catch (err) {
      console.error('Sign-out API failed:', err);
    } finally {
      setUser(null);
    }
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: '#f5f5f7',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid rgba(0,0,0,0.05)',
            borderTopColor: '#111111',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }}></div>
          <p style={{ fontSize: '0.9rem', color: '#666666', fontWeight: 500 }}>Establishing secure link...</p>
        </div>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!user) {
    return <LoginPortal onLogin={handleLogin} />;
  }

  // Support both management and admin terminology
  const role = user.role.toLowerCase();

  if (role === 'parent') {
    return (
      <ParentPortal 
        user={user} 
        onLogout={handleLogout} 
        addLog={addLog}
      />
    );
  } else if (role === 'teacher') {
    return (
      <TeacherPortal 
        user={user} 
        onLogout={handleLogout} 
        addLog={addLog}
      />
    );
  } else if (role === 'management' || role === 'admin') {
    return (
      <ManagementPortal 
        user={user} 
        onLogout={handleLogout} 
        activityLog={activityLog}
        addLog={addLog}
      />
    );
  } else {
    return <LoginPortal onLogin={handleLogin} />;
  }
}

export default App;

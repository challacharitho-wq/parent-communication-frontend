import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { useAuthStore } from '@/features/authentication/store/auth-store'
import { useAuth } from '@/features/authentication/hooks/use-auth'
import ParentPortal from '@/portals/ParentPortal'
import TeacherPortal from '@/portals/TeacherPortal'
import ManagementPortal from '@/portals/ManagementPortal'
import { Sparkles, Users, Megaphone } from 'lucide-react'

export const Route = createFileRoute('/_authenticated/dashboard')({
  component: DashboardPage,
})

function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const { logout } = useAuth();

  // Shared state: students roster (for Teacher / Parent)
  const [students, setStudents] = useState<any[]>([
    { roll: '01', name: 'Arjun Verma', initials: 'AV', color: '#3b82f6', status: 'P', history: ['P', 'P', 'P', 'P', 'P'] },
    { roll: '02', name: 'Aarav S.', initials: 'AS', color: '#ef4444', status: 'A', history: ['A', 'P', 'A', 'P', 'A'] },
    { roll: '03', name: 'Dev Patel', initials: 'DP', color: '#6366f1', status: 'L', history: ['P', 'L', 'P', 'P', 'P'] },
    { roll: '04', name: 'Ananya K.', initials: 'AK', color: '#10b981', status: 'P', history: ['P', 'P', 'P', 'P', 'P'] }
  ]);

  // Shared state: recently added students (for Management Dashboard)
  const [studentsList, setStudentsList] = useState<any[]>([
    { id: 1, name: 'Amit Sharma', grade: 'Grade 10', status: 'VERIFIED', added: '2h ago' },
    { id: 2, name: 'Priya Roy', grade: 'Grade 8', status: 'PENDING', added: '5h ago' },
    { id: 3, name: 'Rahul Verma', grade: 'Grade 12', status: 'VERIFIED', added: 'Yesterday' }
  ]);

  // Shared state: activity logs (for Management Dashboard)
  const [activityLog, setActivityLog] = useState<any[]>([
    { 
      id: 1, 
      text: 'System added 24 new student profiles from Registrar.', 
      time: 'Today at 10:45 AM',
      icon: <Users size={14} />,
      iconBg: 'var(--portal-primary-light)',
      iconColor: 'var(--portal-primary)'
    },
    { 
      id: 2, 
      text: 'Monthly Newsletter distributed via Agentic Outreach.', 
      time: 'Today at 09:15 AM',
      icon: <Megaphone size={14} />,
      iconBg: 'var(--portal-accent-purple-bg)',
      iconColor: 'var(--portal-accent-purple)'
    },
    { 
      id: 3, 
      text: 'AI flagged 3 unusual parent inquiry patterns.', 
      time: 'Yesterday at 04:30 PM',
      icon: <Sparkles size={14} />,
      iconBg: 'var(--portal-danger-bg)',
      iconColor: 'var(--portal-danger)'
    }
  ]);

  // Add a new log to the activity feed
  const addLog = (text: string) => {
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newLog = {
      id: Date.now(),
      text,
      time: `Today at ${timeNow}`,
      icon: <Sparkles size={14} />,
      iconBg: 'var(--portal-success-bg)',
      iconColor: 'var(--portal-success)'
    };
    setActivityLog(prev => [newLog, ...prev]);
  };

  const handleLogout = () => {
    if (user) {
      addLog(`User ${user.name} logged out.`);
    }
    logout();
  };

  if (!user) return null;

  switch (user.role.toLowerCase()) {
    case 'parent':
      return (
        <ParentPortal 
          user={user} 
          onLogout={handleLogout} 
          students={students} 
          addLog={addLog}
        />
      );
    case 'teacher':
      return (
        <TeacherPortal 
          user={user} 
          onLogout={handleLogout} 
          students={students} 
          setStudents={setStudents}
          addLog={addLog}
        />
      );
    case 'admin':
    case 'management':
      return (
        <ManagementPortal 
          user={user} 
          onLogout={handleLogout} 
          activityLog={activityLog}
          addLog={addLog}
          studentsList={studentsList}
          setStudentsList={setStudentsList}
        />
      );
    default:
      return <div>Access Denied</div>;
  }
}

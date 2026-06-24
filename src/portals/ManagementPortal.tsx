import React, { useState, useEffect } from 'react';
import InitialsAvatar from '../components/InitialsAvatar';
import { 
  LayoutDashboard, 
  Users, 
  UserSquare2, 
  TrendingUp, 
  Bell, 
  Cpu, 
  Plus, 
  Megaphone, 
  FileText, 
  ActivitySquare, 
  Sparkles, 
  Activity as Heartbeat, 
  Search, 
  Settings as SettingsIcon, 
  LogOut, 
  CheckCircle, 
  Server,
  Mail,
  Lock,
  BookOpen,
  UserCheck,
  XCircle,
  HelpCircle,
  Clock
} from 'lucide-react';
import { api } from '@/services/api';

interface ManagementPortalProps {
  user: any;
  onLogout: () => void;
  activityLog: any[];
  addLog: (text: string, iconType?: string) => void;
}

export default function ManagementPortal({ user, onLogout, activityLog, addLog }: ManagementPortalProps) {
  const [activeTab, setActiveTab] = useState('Dashboard');
  
  // Real backend states
  const [students, setStudents] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [latestAnnouncement, setLatestAnnouncement] = useState('');
  const [loading, setLoading] = useState(true);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  // Form states for modals
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentGrade, setNewStudentGrade] = useState('Grade 10');

  const [showAddTeacherModal, setShowAddTeacherModal] = useState(false);
  const [newTeacherName, setNewTeacherName] = useState('');
  const [newTeacherEmail, setNewTeacherEmail] = useState('');
  const [newTeacherPassword, setNewTeacherPassword] = useState('password123');
  const [newTeacherSubject, setNewTeacherSubject] = useState('Mathematics');

  const [showAddParentModal, setShowAddParentModal] = useState(false);
  const [newParentName, setNewParentName] = useState('');
  const [newParentEmail, setNewParentEmail] = useState('');
  const [newParentPassword, setNewParentPassword] = useState('password123');
  const [newParentChildName, setNewParentChildName] = useState('');

  const [showAnnounceModal, setShowAnnounceModal] = useState(false);
  const [announcementText, setAnnouncementText] = useState('');

  // Fetch all backend state
  const reloadData = async () => {
    try {
      const [studentsRes, usersRes, announceRes] = await Promise.all([
        api.get('/api/admin/students'),
        api.get('/api/admin/users'),
        api.get('/api/admin/announcement')
      ]);
      setStudents(studentsRes.data);
      setUsers(usersRes.data);
      setLatestAnnouncement(announceRes.data?.text || '');
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Schedule initial fetch asynchronously to prevent synchronous render state changes
    const timer = setTimeout(() => {
      reloadData();
    }, 0);
    const interval = setInterval(reloadData, 5000); // Poll every 5s
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);

  const showFeedback = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(''), 4000);
  };

  // Handlers for Add Form submissions
  const handleAddStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim()) return;

    try {
      // Admins add verified students directly
      await api.post('/api/admin/users', {
        name: `${newStudentName} Parent`,
        email: `parent.${newStudentName.toLowerCase().replace(/\s+/g, '')}@school.edu`,
        password: 'password123',
        role: 'parent',
        childName: newStudentName
      });

      showFeedback(`Student profile and Parent account for ${newStudentName} registered successfully!`);
      setShowAddStudentModal(false);
      setNewStudentName('');
      reloadData();
    } catch (err: any) {
      console.error('Failed to add student:', err);
      showFeedback(err.response?.data?.error || 'Failed to add student profile.');
    }
  };

  const handleAddTeacherSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeacherName.trim() || !newTeacherEmail.trim()) return;

    try {
      await api.post('/api/admin/users', {
        name: newTeacherName,
        email: newTeacherEmail,
        password: newTeacherPassword,
        role: 'teacher',
        subject: newTeacherSubject
      });

      showFeedback(`Teacher Ms./Mr. ${newTeacherName} registered successfully!`);
      setShowAddTeacherModal(false);
      setNewTeacherName('');
      setNewTeacherEmail('');
      setNewTeacherPassword('password123');
      reloadData();
    } catch (err: any) {
      console.error('Failed to register teacher:', err);
      showFeedback(err.response?.data?.error || 'Failed to register teacher.');
    }
  };

  const handleAddParentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newParentName.trim() || !newParentEmail.trim() || !newParentChildName.trim()) return;

    try {
      await api.post('/api/admin/users', {
        name: newParentName,
        email: newParentEmail,
        password: newParentPassword,
        role: 'parent',
        childName: newParentChildName
      });

      showFeedback(`Parent ${newParentName} registered and linked to ${newParentChildName}!`);
      setShowAddParentModal(false);
      setNewParentName('');
      setNewParentEmail('');
      setNewParentPassword('password123');
      setNewParentChildName('');
      reloadData();
    } catch (err: any) {
      console.error('Failed to register parent:', err);
      showFeedback(err.response?.data?.error || 'Failed to register parent.');
    }
  };

  const handleAnnounceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcementText.trim()) return;

    try {
      await api.post('/api/admin/announce', { text: announcementText });
      setLatestAnnouncement(announcementText);
      showFeedback('Broadcast alert sent to all school portals.');
      setShowAnnounceModal(false);
      setAnnouncementText('');
    } catch (err) {
      console.error('Failed to broadcast announcement:', err);
      showFeedback('Failed to broadcast alert.');
    }
  };

  const handleApproveStudent = async (studentId: string, approve: boolean) => {
    try {
      await api.post('/api/admin/students/approve', { studentId, approve });
      showFeedback(approve ? 'Student registration approved!' : 'Student registration declined.');
      reloadData();
    } catch (err) {
      console.error('Failed to approve student:', err);
      showFeedback('Approval action failed.');
    }
  };

  // Roster groupings
  const verifiedStudents = students.filter(st => st.status === 'VERIFIED');
  const pendingStudents = students.filter(st => st.status === 'PENDING');
  const teachersList = users.filter(u => u.role === 'teacher');
  const parentsList = users.filter(u => u.role === 'parent');

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: '#f5f5f7' }}>
        <p style={{ fontFamily: '-apple-system', fontSize: '0.9rem', color: '#666666', fontWeight: 500 }}>Loading Academy Data...</p>
      </div>
    );
  }

  return (
    <div className="portal-layout" style={{
      display: 'flex',
      minHeight: '100vh',
      backgroundColor: '#f5f5f7', // Clean neutral background (Apple-style)
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Sidebar - Apple Glass style */}
      <aside className="sidebar" style={{
        width: '260px',
        backgroundColor: '#ffffff',
        borderRight: '1px solid #e5e5e7',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'between',
        padding: '1.5rem 1rem'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Logo */}
          <div className="sidebar-header" style={{ padding: '0 0.5rem' }}>
            <div className="sidebar-logo" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                backgroundColor: '#111111',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Cpu size={18} />
              </div>
              <div>
                <h2 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#111111', margin: 0, letterSpacing: '-0.01em' }}>Academy Admin</h2>
                <p className="sidebar-logo-subtitle" style={{ fontSize: '0.7rem', color: '#666666', margin: 0 }}>Dr. Vance</p>
              </div>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="sidebar-nav" style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            {[
              { name: 'Dashboard', icon: LayoutDashboard },
              { name: 'Student Management', icon: Users, badge: pendingStudents.length },
              { name: 'Teacher Management', icon: UserSquare2 },
              { name: 'Parent Management', icon: Users },
              { name: 'AI Monitoring', icon: Cpu }
            ].map(item => {
              const Icon = item.icon;
              return (
                <button
                  key={item.name}
                  type="button"
                  className={`sidebar-link ${activeTab === item.name ? 'active' : ''}`}
                  onClick={() => { setActiveTab(item.name); setFeedbackMsg(''); }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    width: '100%',
                    padding: '10px 12px',
                    border: 'none',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    fontWeight: activeTab === item.name ? 600 : 500,
                    backgroundColor: activeTab === item.name ? '#f5f5f7' : 'transparent',
                    color: activeTab === item.name ? '#111111' : '#555555',
                    transition: 'all 0.15s ease',
                    textAlign: 'left'
                  }}
                >
                  <Icon size={16} />
                  <span style={{ flexGrow: 1 }}>{item.name}</span>
                  {item.badge && item.badge > 0 ? (
                    <span style={{
                      backgroundColor: '#111111',
                      color: '#ffffff',
                      fontSize: '0.65rem',
                      fontWeight: 'bold',
                      padding: '2px 6px',
                      borderRadius: '8px'
                    }}>{item.badge}</span>
                  ) : null}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="sidebar-footer" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', borderTop: '1px solid #eaeaea', paddingTop: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem' }}>
            <InitialsAvatar name={user.name} size={32} />
            <div>
              <p style={{ fontSize: '0.8rem', fontWeight: 600, color: '#111111', margin: 0 }}>Dr. Vance</p>
              <p style={{ fontSize: '0.65rem', color: '#666666', margin: 0 }}>Principal</p>
            </div>
          </div>
          <button 
            type="button" 
            className="sidebar-link" 
            onClick={onLogout} 
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              width: '100%',
              padding: '10px 12px',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: 500,
              backgroundColor: 'transparent',
              color: '#d11a1a',
              textAlign: 'left'
            }}
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Pane */}
      <div className="main-wrapper" style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
        {/* Header bar */}
        <header className="portal-header" style={{
          height: '64px',
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e5e5e7',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 2rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#666666' }}>Westview Academy Admin Console</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: '#f5f5f7',
              padding: '4px 10px',
              borderRadius: '8px',
              fontSize: '0.7rem',
              fontWeight: 600,
              color: '#111111'
            }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block' }} />
              <span>SYSTEM ONLINE</span>
            </div>
          </div>
        </header>

        {/* Dynamic page screens */}
        <main className="page-container" style={{ padding: '2.5rem', maxWidth: '1200px', width: '100%', margin: '0 auto' }}>
          
          {feedbackMsg && (
            <div className="alert-banner" style={{
              backgroundColor: '#111111',
              color: '#ffffff',
              padding: '0.9rem 1.25rem',
              borderRadius: '12px',
              marginBottom: '2rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              fontSize: '0.85rem',
              fontWeight: 500,
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
            }}>
              <CheckCircle size={16} style={{ color: '#ffffff' }} />
              <span>{feedbackMsg}</span>
            </div>
          )}

          {activeTab === 'Dashboard' && (
            <div>
              <div className="page-header" style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 600, letterSpacing: '-0.02em', color: '#111111', margin: 0 }}>Management Overview</h1>
                <p style={{ fontSize: '0.9rem', color: '#666666', marginTop: '0.25rem' }}>Live operational telemetry and pending administrative directives.</p>
              </div>

              {/* Core Metrics Grid - Apple Minimal */}
              <div className="metrics-grid" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1.25rem',
                marginBottom: '2.5rem'
              }}>
                {[
                  { label: 'Verified Students', value: verifiedStudents.length, subtitle: `${pendingStudents.length} awaiting approval`, color: '#111111' },
                  { label: 'Active Faculty', value: teachersList.length, subtitle: '100% attendance rate', color: '#111111' },
                  { label: 'Parent Accounts', value: parentsList.length, subtitle: 'Real-time engagement high', color: '#111111' },
                  { label: 'AI Counselor Prompts', value: '4,845', subtitle: '99.2% accuracy index', color: '#111111' }
                ].map((metric, i) => (
                  <div key={i} className="metric-card" style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e5e5e7',
                    borderRadius: '16px',
                    padding: '1.25rem',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.01)'
                  }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#666666', textTransform: 'uppercase', letterSpacing: '0.02em' }}>{metric.label}</span>
                    <h3 style={{ fontSize: '1.85rem', fontWeight: 700, color: '#111111', margin: '0.5rem 0 0.25rem 0', letterSpacing: '-0.02em' }}>{metric.value}</h3>
                    <span style={{ fontSize: '0.75rem', color: '#888888' }}>{metric.subtitle}</span>
                  </div>
                ))}
              </div>

              {/* Dashboard Layout panels */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '2rem' }}>
                {/* Left side */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                  
                  {/* Pending approvals card banner */}
                  {pendingStudents.length > 0 && (
                    <div className="dashboard-panel" style={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #e5e5e7',
                      borderRadius: '16px',
                      padding: '1.5rem',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.01)'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#111111', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Clock size={16} style={{ color: '#f5a623' }} />
                          <span>Pending Student Registrations ({pendingStudents.length})</span>
                        </h3>
                        <button type="button" className="panel-link" onClick={() => setActiveTab('Student Management')} style={{ background: 'none', border: 'none', fontSize: '0.8rem', color: '#666666', cursor: 'pointer', fontWeight: 600 }}>Manage approvals</button>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {pendingStudents.map(st => (
                          <div key={st.id} style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '0.75rem 1rem',
                            borderRadius: '12px',
                            backgroundColor: '#f5f5f7',
                            border: '1px solid #eaeaea'
                          }}>
                            <div>
                              <strong style={{ fontSize: '0.85rem', color: '#111111', display: 'block' }}>{st.name}</strong>
                              <span style={{ fontSize: '0.75rem', color: '#666666' }}>Grade: {st.grade} • Requested by Teacher: {st.addedBy}</span>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <button 
                                type="button" 
                                onClick={() => handleApproveStudent(st.id, true)}
                                style={{
                                  padding: '5px 12px',
                                  fontSize: '0.75rem',
                                  borderRadius: '8px',
                                  backgroundColor: '#111111',
                                  color: '#ffffff',
                                  border: 'none',
                                  cursor: 'pointer',
                                  fontWeight: 600
                                }}
                              >
                                Approve
                              </button>
                              <button 
                                type="button" 
                                onClick={() => handleApproveStudent(st.id, false)}
                                style={{
                                  padding: '5px 12px',
                                  fontSize: '0.75rem',
                                  borderRadius: '8px',
                                  backgroundColor: '#ffffff',
                                  color: '#d11a1a',
                                  border: '1px solid #ffe5e5',
                                  cursor: 'pointer',
                                  fontWeight: 600
                                }}
                              >
                                Decline
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Active Students List (Short overview) */}
                  <div className="dashboard-panel" style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e5e5e7',
                    borderRadius: '16px',
                    padding: '1.5rem',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.01)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                      <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#111111', margin: 0 }}>Registered Students ({verifiedStudents.length})</h3>
                      <button type="button" onClick={() => setActiveTab('Student Management')} style={{ background: 'none', border: 'none', fontSize: '0.8rem', color: '#666666', cursor: 'pointer', fontWeight: 600 }}>See all profiles</button>
                    </div>

                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid #eaeaea' }}>
                            <th style={{ padding: '8px 4px', fontSize: '0.75rem', fontWeight: 600, color: '#666666', textTransform: 'uppercase' }}>Student Name</th>
                            <th style={{ padding: '8px 4px', fontSize: '0.75rem', fontWeight: 600, color: '#666666', textTransform: 'uppercase' }}>Grade</th>
                            <th style={{ padding: '8px 4px', fontSize: '0.75rem', fontWeight: 600, color: '#666666', textTransform: 'uppercase' }}>Status</th>
                            <th style={{ padding: '8px 4px', fontSize: '0.75rem', fontWeight: 600, color: '#666666', textTransform: 'uppercase' }}>Attendance</th>
                          </tr>
                        </thead>
                        <tbody>
                          {verifiedStudents.slice(0, 4).map(st => (
                            <tr key={st.id} style={{ borderBottom: '1px solid #f5f5f7' }}>
                              <td style={{ padding: '12px 4px', fontSize: '0.85rem', fontWeight: 600, color: '#111111' }}>{st.name}</td>
                              <td style={{ padding: '12px 4px', fontSize: '0.85rem', color: '#666666' }}>{st.grade}</td>
                              <td style={{ padding: '12px 4px' }}>
                                <span style={{
                                  backgroundColor: '#ebf8ff',
                                  color: '#0070f3',
                                  fontSize: '0.65rem',
                                  fontWeight: 700,
                                  padding: '2px 6px',
                                  borderRadius: '6px'
                                }}>VERIFIED</span>
                              </td>
                              <td style={{ padding: '12px 4px', fontSize: '0.85rem', fontWeight: 600, color: '#111111' }}>{st.attendance}%</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Log Feed */}
                  <div className="dashboard-panel" style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e5e5e7',
                    borderRadius: '16px',
                    padding: '1.5rem',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.01)'
                  }}>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#111111', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <ActivitySquare size={16} />
                      <span>Security & Action Log Feed</span>
                    </h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {activityLog.slice(0, 5).map(log => (
                        <div key={log.id} style={{ display: 'flex', gap: '0.75rem', borderBottom: '1px solid #f5f5f7', paddingBottom: '0.75rem' }}>
                          <div style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            backgroundColor: '#f5f5f7',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#111111'
                          }}>
                            <Sparkles size={12} />
                          </div>
                          <div>
                            <p style={{ fontSize: '0.8rem', color: '#111111', margin: 0, fontWeight: 500 }}>{log.text}</p>
                            <span style={{ fontSize: '0.65rem', color: '#888888' }}>{log.time}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right side widgets */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  
                  {/* Quick Admin Actions */}
                  <div className="dashboard-panel" style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e5e5e7',
                    borderRadius: '16px',
                    padding: '1.5rem',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.01)'
                  }}>
                    <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#111111', margin: '0 0 1rem 0' }}>Quick Administrative Action</h3>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <button 
                        type="button" 
                        onClick={() => setShowAddStudentModal(true)}
                        style={{
                          width: '100%',
                          padding: '10px',
                          borderRadius: '10px',
                          backgroundColor: '#111111',
                          color: '#ffffff',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.5rem'
                        }}
                      >
                        <Plus size={14} />
                        <span>Add Student Profile</span>
                      </button>

                      <button 
                        type="button" 
                        onClick={() => setShowAddTeacherModal(true)}
                        style={{
                          width: '100%',
                          padding: '10px',
                          borderRadius: '10px',
                          backgroundColor: '#ffffff',
                          color: '#111111',
                          border: '1px solid #d1d1d6',
                          cursor: 'pointer',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.5rem'
                        }}
                      >
                        <Plus size={14} />
                        <span>Add Teacher Profile</span>
                      </button>

                      <button 
                        type="button" 
                        onClick={() => setShowAddParentModal(true)}
                        style={{
                          width: '100%',
                          padding: '10px',
                          borderRadius: '10px',
                          backgroundColor: '#ffffff',
                          color: '#111111',
                          border: '1px solid #d1d1d6',
                          cursor: 'pointer',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.5rem'
                        }}
                      >
                        <Plus size={14} />
                        <span>Add Parent Profile</span>
                      </button>

                      <button 
                        type="button" 
                        onClick={() => setShowAnnounceModal(true)}
                        style={{
                          width: '100%',
                          padding: '10px',
                          borderRadius: '10px',
                          backgroundColor: '#ffffff',
                          color: '#666666',
                          border: '1px solid #d1d1d6',
                          cursor: 'pointer',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.5rem'
                        }}
                      >
                        <Megaphone size={14} />
                        <span>Broadcast Alert</span>
                      </button>
                    </div>
                  </div>

                  {/* School Broadcast display */}
                  <div className="dashboard-panel" style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e5e5e7',
                    borderRadius: '16px',
                    padding: '1.25rem',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.01)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                      <Megaphone size={16} />
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', color: '#666666' }}>Active Announcement</span>
                    </div>
                    <div style={{
                      backgroundColor: '#f5f5f7',
                      padding: '1rem',
                      borderRadius: '10px',
                      fontSize: '0.8rem',
                      color: '#111111',
                      border: '1px solid #eaeaea',
                      lineHeight: '1.4'
                    }}>
                      <p style={{ margin: 0, fontWeight: 500 }}>{latestAnnouncement || 'No active announcement broadcast.'}</p>
                      <span style={{ display: 'block', color: '#888888', fontSize: '0.65rem', marginTop: '0.5rem' }}>Dispacthed dynamically to all student portals</span>
                    </div>
                  </div>

                  {/* AI sentiment analysis widget */}
                  <div className="dashboard-panel" style={{
                    backgroundColor: '#111111',
                    color: '#ffffff',
                    borderRadius: '16px',
                    padding: '1.5rem',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>
                      <Sparkles size={16} style={{ color: '#ffffff' }} />
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.02em' }}>Agentic Sentiment Insight</span>
                    </div>
                    <h4 style={{ fontSize: '1.15rem', color: '#ffffff', fontWeight: 600, margin: '0 0 0.5rem 0' }}>Parent engagement index up 12%</h4>
                    <p style={{ fontSize: '0.75rem', color: '#888888', margin: '0 0 1rem 0', lineHeight: '1.4' }}>AI Agent synthesized briefings for parents are reducing query backlog. Average response latency dropped to 4 seconds.</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#ffffff', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '0.75rem' }}>
                      <span>Model Sync: <strong>Gemini 3.5 Flash</strong></span>
                      <span>Gateway: <strong>Verified</strong></span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Student Management Tab */}
          {activeTab === 'Student Management' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                  <h1 style={{ fontSize: '1.75rem', fontWeight: 600, letterSpacing: '-0.02em', color: '#111111', margin: 0 }}>Student Database Registry</h1>
                  <p style={{ fontSize: '0.9rem', color: '#666666', marginTop: '0.25rem' }}>Add new academic profiles or verify faculty student requests.</p>
                </div>
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={() => setShowAddStudentModal(true)}
                  style={{
                    backgroundColor: '#111111',
                    color: '#ffffff',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <Plus size={15} />
                  <span>Register Student</span>
                </button>
              </div>

              {pendingStudents.length > 0 && (
                <div className="dashboard-panel" style={{ backgroundColor: '#ffffff', border: '1px solid #e5e5e7', borderRadius: '16px', padding: '1.5rem', marginBottom: '2rem' }}>
                  <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#f5a623', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Clock size={16} />
                    <span>Faculty Registrations Awaiting Verification ({pendingStudents.length})</span>
                  </h3>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
                    {pendingStudents.map(st => (
                      <div key={st.id} style={{
                        padding: '1.25rem',
                        borderRadius: '12px',
                        backgroundColor: '#f5f5f7',
                        border: '1px solid #eaeaea',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: '1rem'
                      }}>
                        <div>
                          <strong style={{ fontSize: '0.9rem', color: '#111111', display: 'block' }}>{st.name}</strong>
                          <div style={{ fontSize: '0.75rem', color: '#666666', marginTop: '0.25rem', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <span>Grade Level: <strong>{st.grade}</strong></span>
                            <span>Temporary Roll: <strong>{st.roll}</strong></span>
                            <span>Requested By: <strong>{st.addedBy}</strong></span>
                            <span>Proposed Parent Email: <strong>{st.parentEmail}</strong></span>
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button 
                            type="button" 
                            onClick={() => handleApproveStudent(st.id, true)}
                            style={{
                              flexGrow: 1,
                              padding: '8px',
                              fontSize: '0.75rem',
                              borderRadius: '8px',
                              backgroundColor: '#111111',
                              color: '#ffffff',
                              border: 'none',
                              cursor: 'pointer',
                              fontWeight: 600
                            }}
                          >
                            Approve Profile
                          </button>
                          <button 
                            type="button" 
                            onClick={() => handleApproveStudent(st.id, false)}
                            style={{
                              padding: '8px 12px',
                              fontSize: '0.75rem',
                              borderRadius: '8px',
                              backgroundColor: '#ffffff',
                              color: '#d11a1a',
                              border: '1px solid #ffe5e5',
                              cursor: 'pointer',
                              fontWeight: 600
                            }}
                          >
                            Decline
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="dashboard-panel" style={{ backgroundColor: '#ffffff', border: '1px solid #e5e5e7', borderRadius: '16px', padding: '1.5rem' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#111111', margin: '0 0 1rem 0' }}>Verified Student Registry ({verifiedStudents.length})</h3>

                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #eaeaea', backgroundColor: '#f5f5f7' }}>
                        <th style={{ padding: '12px 10px', fontSize: '0.75rem', fontWeight: 600, color: '#666666', textTransform: 'uppercase' }}>Roll</th>
                        <th style={{ padding: '12px 10px', fontSize: '0.75rem', fontWeight: 600, color: '#666666', textTransform: 'uppercase' }}>Student Name</th>
                        <th style={{ padding: '12px 10px', fontSize: '0.75rem', fontWeight: 600, color: '#666666', textTransform: 'uppercase' }}>Grade</th>
                        <th style={{ padding: '12px 10px', fontSize: '0.75rem', fontWeight: 600, color: '#666666', textTransform: 'uppercase' }}>Parent Contact Email</th>
                        <th style={{ padding: '12px 10px', fontSize: '0.75rem', fontWeight: 600, color: '#666666', textTransform: 'uppercase' }}>GPA</th>
                        <th style={{ padding: '12px 10px', fontSize: '0.75rem', fontWeight: 600, color: '#666666', textTransform: 'uppercase' }}>Attendance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {verifiedStudents.map(st => (
                        <tr key={st.id} style={{ borderBottom: '1px solid #f5f5f7' }}>
                          <td style={{ padding: '14px 10px', fontSize: '0.85rem', fontFamily: 'monospace', color: '#666666' }}>{st.roll}</td>
                          <td style={{ padding: '14px 10px', fontSize: '0.85rem', fontWeight: 600, color: '#111111' }}>{st.name}</td>
                          <td style={{ padding: '14px 10px', fontSize: '0.85rem', color: '#666666' }}>{st.grade}</td>
                          <td style={{ padding: '14px 10px', fontSize: '0.85rem', color: '#111111', fontFamily: 'monospace' }}>{st.parentEmail || 'Not Linked'}</td>
                          <td style={{ padding: '14px 10px', fontSize: '0.85rem', fontWeight: 600, color: '#111111' }}>{st.gpa}</td>
                          <td style={{ padding: '14px 10px', fontSize: '0.85rem', fontWeight: 600, color: '#10b981' }}>{st.attendance}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Teacher Management Tab */}
          {activeTab === 'Teacher Management' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                  <h1 style={{ fontSize: '1.75rem', fontWeight: 600, letterSpacing: '-0.02em', color: '#111111', margin: 0 }}>Faculty Directory</h1>
                  <p style={{ fontSize: '0.9rem', color: '#666666', marginTop: '0.25rem' }}>Create secure credentials for registered instructors and lead teachers.</p>
                </div>
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={() => setShowAddTeacherModal(true)}
                  style={{
                    backgroundColor: '#111111',
                    color: '#ffffff',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <Plus size={15} />
                  <span>Register Teacher</span>
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                {teachersList.map(tch => (
                  <div key={tch.id} style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e5e5e7',
                    borderRadius: '16px',
                    padding: '1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    position: 'relative'
                  }}>
                    <InitialsAvatar 
                      name={tch.name} 
                      size={64} 
                      style={{ marginBottom: '1rem' }} 
                    />
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#111111', margin: '0 0 0.25rem 0' }}>{tch.name}</h3>
                    <span style={{ fontSize: '0.75rem', color: '#666666', display: 'block', marginBottom: '0.75rem', fontWeight: 500 }}>{tch.title || 'Grade lead'}</span>
                    
                    <div style={{
                      backgroundColor: '#f5f5f7',
                      padding: '8px 12px',
                      borderRadius: '10px',
                      fontSize: '0.75rem',
                      width: '100%',
                      textAlign: 'left',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                      border: '1px solid #eaeaea'
                    }}>
                      <span style={{ color: '#666666' }}>Secure Email: <strong style={{ color: '#111111', fontFamily: 'monospace' }}>{tch.email}</strong></span>
                      <span style={{ color: '#666666' }}>Subject Area: <strong style={{ color: '#111111' }}>{tch.subject || 'All Subjects'}</strong></span>
                      <span style={{ color: '#666666' }}>Registered: <strong style={{ color: '#111111' }}>{tch.createdAt ? new Date(tch.createdAt).toLocaleDateString() : 'Yes'}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Parent Management Tab */}
          {activeTab === 'Parent Management' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                  <h1 style={{ fontSize: '1.75rem', fontWeight: 600, letterSpacing: '-0.02em', color: '#111111', margin: 0 }}>Parent Accounts</h1>
                  <p style={{ fontSize: '0.9rem', color: '#666666', marginTop: '0.25rem' }}>Create parent login accounts linked dynamically to students for real-time engagement reports.</p>
                </div>
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={() => setShowAddParentModal(true)}
                  style={{
                    backgroundColor: '#111111',
                    color: '#ffffff',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <Plus size={15} />
                  <span>Register Parent</span>
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                {parentsList.map(pr => (
                  <div key={pr.id} style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e5e5e7',
                    borderRadius: '16px',
                    padding: '1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center'
                  }}>
                    <InitialsAvatar 
                      name={pr.name} 
                      size={64} 
                      style={{ marginBottom: '1rem' }} 
                    />
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#111111', margin: '0 0 0.25rem 0' }}>{pr.name}</h3>
                    <span style={{ fontSize: '0.75rem', color: '#666666', display: 'block', marginBottom: '0.75rem', fontWeight: 500 }}>{pr.title || 'Guardian'}</span>
                    
                    <div style={{
                      backgroundColor: '#f5f5f7',
                      padding: '8px 12px',
                      borderRadius: '10px',
                      fontSize: '0.75rem',
                      width: '100%',
                      textAlign: 'left',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                      border: '1px solid #eaeaea'
                    }}>
                      <span style={{ color: '#666666' }}>Email Address: <strong style={{ color: '#111111', fontFamily: 'monospace' }}>{pr.email}</strong></span>
                      <span style={{ color: '#666666' }}>Linked Child: <strong style={{ color: '#111111' }}>{pr.childName || 'Not Bound'}</strong></span>
                      <span style={{ color: '#666666' }}>Child Roll: <strong style={{ color: '#111111', fontFamily: 'monospace' }}>{pr.childRoll || '#00'}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI Monitoring Tab */}
          {activeTab === 'AI Monitoring' && (
            <div>
              <div className="page-header" style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 600, letterSpacing: '-0.02em', color: '#111111', margin: 0 }}>AI Agent System Health</h1>
                <p style={{ fontSize: '0.9rem', color: '#666666', marginTop: '0.25rem' }}>Status metrics and telemetry from the school's Westview AI Counselor and Teacher Copilot.</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                  <div className="dashboard-panel" style={{ backgroundColor: '#ffffff', border: '1px solid #e5e5e7', borderRadius: '16px', padding: '1.5rem' }}>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#111111', margin: '0 0 1rem 0' }}>Operational Metrics</h3>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {[
                        { label: 'Agent Query Gateway', value: 'ONLINE / ACTIVE', color: '#10b981' },
                        { label: 'Avg LLM Call Response Latency', value: '4.2s (Optimized)', color: '#111111' },
                        { label: 'Token Utilization Coefficient', value: '0.04% of quota', color: '#111111' },
                        { label: 'Agent Tool Calls Dispatcher', value: 'SYNC SUCCESS', color: '#10b981' },
                        { label: 'System Uptime Status', value: '100.00% (Continuous)', color: '#10b981' }
                      ].map((mtr, index) => (
                        <div key={index} style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '10px 12px',
                          borderRadius: '10px',
                          backgroundColor: '#f5f5f7',
                          border: '1px solid #eaeaea',
                          fontSize: '0.8rem'
                        }}>
                          <span style={{ fontWeight: 500, color: '#666666' }}>{mtr.label}</span>
                          <strong style={{ color: mtr.color }}>{mtr.value}</strong>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="dashboard-panel" style={{ backgroundColor: '#ffffff', border: '1px solid #e5e5e7', borderRadius: '16px', padding: '1.5rem' }}>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#111111', margin: '0 0 1rem 0' }}>Active Knowledge Context</h3>
                    <p style={{ fontSize: '0.8rem', color: '#666666', lineHeight: '1.4' }}>
                      The Westview AI agent has been initialized with the school's verified database. Any additions to the student, parent, or teacher lists are automatically injected as live context for parent and teacher chats!
                    </p>
                    <div style={{
                      marginTop: '1rem',
                      padding: '1rem',
                      backgroundColor: '#f5f5f7',
                      border: '1px solid #eaeaea',
                      borderRadius: '10px',
                      fontSize: '0.75rem',
                      fontFamily: 'monospace',
                      color: '#333333'
                    }}>
                      <span>[Verified DB Injection Context System]</span><br />
                      <span>- Loaded {verifiedStudents.length} Verified Student Records.</span><br />
                      <span>- Bound {parentsList.length} Parent Credentials with dynamic linkage mappings.</span><br />
                      <span>- Ingested {teachersList.length} active teacher subject areas.</span><br />
                      <span>- Current School Announcement: "{latestAnnouncement}"</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div className="dashboard-panel" style={{
                    backgroundColor: '#111111',
                    color: '#ffffff',
                    borderRadius: '16px',
                    padding: '1.5rem'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                      <Server size={18} />
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>Server Resources</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px' }}>
                          <span>Server Ingress Load</span>
                          <strong>12%</strong>
                        </div>
                        <div style={{ height: '4px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                          <div style={{ width: '12%', height: '100%', backgroundColor: '#ffffff' }}></div>
                        </div>
                      </div>

                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px' }}>
                          <span>Active Sessions Token Pool</span>
                          <strong>{Object.keys(users).length} Connected</strong>
                        </div>
                        <div style={{ height: '4px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                          <div style={{ width: '100%', height: '100%', backgroundColor: '#ffffff' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* MODALS */}

      {/* Add Student Profile */}
      {showAddStudentModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(10px)',
          zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{
            backgroundColor: '#ffffff', borderRadius: '20px', padding: '2rem',
            width: '100%', maxWidth: '400px', border: '1px solid #e5e5e7',
            boxShadow: '0 12px 48px rgba(0,0,0,0.12)'
          }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: '#111111', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Plus size={20} />
              <span>Register Student Profile</span>
            </h3>
            
            <form onSubmit={handleAddStudentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.7rem', fontWeight: 600, color: '#666666', textTransform: 'uppercase' }}>Student Full Name</label>
                <input 
                  type="text" 
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  placeholder="e.g. Liam Miller"
                  required
                  style={{ padding: '10px 12px', borderRadius: '10px', border: '1px solid #d1d1d6', fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.7rem', fontWeight: 600, color: '#666666', textTransform: 'uppercase' }}>Grade Level</label>
                <select 
                  value={newStudentGrade}
                  onChange={(e) => setNewStudentGrade(e.target.value)}
                  style={{ padding: '10px 12px', borderRadius: '10px', border: '1px solid #d1d1d6', fontSize: '0.85rem', backgroundColor: '#ffffff' }}
                >
                  <option>Grade 8</option>
                  <option>Grade 9</option>
                  <option>Grade 10</option>
                  <option>Grade 11</option>
                  <option>Grade 12</option>
                </select>
              </div>

              <p style={{ fontSize: '0.75rem', color: '#888888', margin: 0, lineHeight: '1.4' }}>
                *Note: Registering a student instantly creates their profile and bootstraps a corresponding Parent account linked to their profile for easy deployment.
              </p>

              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setShowAddStudentModal(false)} style={{ padding: '8px 16px', borderRadius: '10px', border: '1px solid #eaeaea', backgroundColor: '#ffffff', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 500 }}>Cancel</button>
                <button type="submit" style={{ padding: '8px 16px', borderRadius: '10px', border: 'none', backgroundColor: '#111111', color: '#ffffff', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>Save student</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Teacher Profile */}
      {showAddTeacherModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(10px)',
          zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{
            backgroundColor: '#ffffff', borderRadius: '20px', padding: '2rem',
            width: '100%', maxWidth: '420px', border: '1px solid #e5e5e7',
            boxShadow: '0 12px 48px rgba(0,0,0,0.12)'
          }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: '#111111', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Plus size={20} />
              <span>Register Faculty Credentials</span>
            </h3>
            
            <form onSubmit={handleAddTeacherSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.7rem', fontWeight: 600, color: '#666666', textTransform: 'uppercase' }}>Teacher Full Name</label>
                <input 
                  type="text" 
                  value={newTeacherName}
                  onChange={(e) => setNewTeacherName(e.target.value)}
                  placeholder="e.g. Marcus Aurelius"
                  required
                  style={{ padding: '10px 12px', borderRadius: '10px', border: '1px solid #d1d1d6', fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.7rem', fontWeight: 600, color: '#666666', textTransform: 'uppercase' }}>Teacher Contact Email</label>
                <input 
                  type="email" 
                  value={newTeacherEmail}
                  onChange={(e) => setNewTeacherEmail(e.target.value)}
                  placeholder="e.g. marcus@school.edu"
                  required
                  style={{ padding: '10px 12px', borderRadius: '10px', border: '1px solid #d1d1d6', fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.7rem', fontWeight: 600, color: '#666666', textTransform: 'uppercase' }}>Subject Discipline</label>
                <select 
                  value={newTeacherSubject}
                  onChange={(e) => setNewTeacherSubject(e.target.value)}
                  style={{ padding: '10px 12px', borderRadius: '10px', border: '1px solid #d1d1d6', fontSize: '0.85rem', backgroundColor: '#ffffff' }}
                >
                  <option>Mathematics</option>
                  <option>English Literature</option>
                  <option>Physics & Science</option>
                  <option>History & Arts</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.7rem', fontWeight: 600, color: '#666666', textTransform: 'uppercase' }}>Temporary Access Password</label>
                <input 
                  type="text" 
                  value={newTeacherPassword}
                  onChange={(e) => setNewTeacherPassword(e.target.value)}
                  placeholder="password123"
                  required
                  style={{ padding: '10px 12px', borderRadius: '10px', border: '1px solid #d1d1d6', fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setShowAddTeacherModal(false)} style={{ padding: '8px 16px', borderRadius: '10px', border: '1px solid #eaeaea', backgroundColor: '#ffffff', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 500 }}>Cancel</button>
                <button type="submit" style={{ padding: '8px 16px', borderRadius: '10px', border: 'none', backgroundColor: '#111111', color: '#ffffff', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>Create account</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Parent Profile */}
      {showAddParentModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(10px)',
          zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{
            backgroundColor: '#ffffff', borderRadius: '20px', padding: '2rem',
            width: '100%', maxWidth: '420px', border: '1px solid #e5e5e7',
            boxShadow: '0 12px 48px rgba(0,0,0,0.12)'
          }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: '#111111', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Plus size={20} />
              <span>Register Parent Profile</span>
            </h3>
            
            <form onSubmit={handleAddParentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.7rem', fontWeight: 600, color: '#666666', textTransform: 'uppercase' }}>Parent Full Name</label>
                <input 
                  type="text" 
                  value={newParentName}
                  onChange={(e) => setNewParentName(e.target.value)}
                  placeholder="e.g. Mary Miller"
                  required
                  style={{ padding: '10px 12px', borderRadius: '10px', border: '1px solid #d1d1d6', fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.7rem', fontWeight: 600, color: '#666666', textTransform: 'uppercase' }}>Parent Email Address</label>
                <input 
                  type="email" 
                  value={newParentEmail}
                  onChange={(e) => setNewParentEmail(e.target.value)}
                  placeholder="e.g. mary@school.edu"
                  required
                  style={{ padding: '10px 12px', borderRadius: '10px', border: '1px solid #d1d1d6', fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.7rem', fontWeight: 600, color: '#666666', textTransform: 'uppercase' }}>Linked Student Name</label>
                <input 
                  type="text" 
                  value={newParentChildName}
                  onChange={(e) => setNewParentChildName(e.target.value)}
                  placeholder="e.g. Chloe Miller"
                  required
                  style={{ padding: '10px 12px', borderRadius: '10px', border: '1px solid #d1d1d6', fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.7rem', fontWeight: 600, color: '#666666', textTransform: 'uppercase' }}>Temporary Access Password</label>
                <input 
                  type="text" 
                  value={newParentPassword}
                  onChange={(e) => setNewParentPassword(e.target.value)}
                  placeholder="password123"
                  required
                  style={{ padding: '10px 12px', borderRadius: '10px', border: '1px solid #d1d1d6', fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setShowAddParentModal(false)} style={{ padding: '8px 16px', borderRadius: '10px', border: '1px solid #eaeaea', backgroundColor: '#ffffff', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 500 }}>Cancel</button>
                <button type="submit" style={{ padding: '8px 16px', borderRadius: '10px', border: 'none', backgroundColor: '#111111', color: '#ffffff', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>Create account</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Broadcast Announcement */}
      {showAnnounceModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(10px)',
          zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{
            backgroundColor: '#ffffff', borderRadius: '20px', padding: '2rem',
            width: '100%', maxWidth: '450px', border: '1px solid #e5e5e7',
            boxShadow: '0 12px 48px rgba(0,0,0,0.12)'
          }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: '#111111', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Megaphone size={20} />
              <span>Broadcast Announcement</span>
            </h3>
            
            <form onSubmit={handleAnnounceSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.7rem', fontWeight: 600, color: '#666666', textTransform: 'uppercase' }}>Broadcast Message</label>
                <textarea 
                  value={announcementText}
                  onChange={(e) => setAnnouncementText(e.target.value)}
                  placeholder="Type message to broadcast to all parent & teacher dashboards..."
                  required
                  rows={4}
                  style={{ padding: '10px 12px', borderRadius: '10px', border: '1px solid #d1d1d6', fontSize: '0.85rem', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setShowAnnounceModal(false)} style={{ padding: '8px 16px', borderRadius: '10px', border: '1px solid #eaeaea', backgroundColor: '#ffffff', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 500 }}>Cancel</button>
                <button type="submit" style={{ padding: '8px 16px', borderRadius: '10px', border: 'none', backgroundColor: '#111111', color: '#ffffff', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>Dispatch Alert</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

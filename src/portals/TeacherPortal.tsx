import React, { useState, useEffect } from 'react';
import { api } from '@/services/api';
import InitialsAvatar from '../components/InitialsAvatar';
import { 
  LayoutDashboard, 
  CalendarDays, 
  GraduationCap, 
  BookOpen, 
  ClipboardList, 
  MessageSquare, 
  Users, 
  Bell, 
  Settings as SettingsIcon, 
  LogOut, 
  AlertTriangle, 
  TrendingUp, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Download, 
  Send, 
  Search,
  Sparkles,
  Plus
} from 'lucide-react';

interface TeacherPortalProps {
  user: any;
  onLogout: () => void;
  addLog: (text: string, iconType?: string) => void;
}

export default function TeacherPortal({ user, onLogout, addLog }: TeacherPortalProps) {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [selectedClass, setSelectedClass] = useState('Grade 10-A (Mathematics)');
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [students, setStudents] = useState<any[]>([]);

  // Form states for Proposing Student Registration
  const [showProposeModal, setShowProposeModal] = useState(false);
  const [proposeName, setProposeName] = useState('');
  const [proposeGrade, setProposeGrade] = useState('Grade 10');

  // API Teacher Dashboard Data
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(true);

  // Teacher AI Copilot Chat State
  const [aiMessages, setAiMessages] = useState<any[]>([
    { id: 1, sender: 'ai', text: "Hello Ms. Jenkins! I'm your Westview Teacher Copilot. I can help you analyze student marks, draft parent email notices, or discuss lesson planning. How can I help you today?", time: "Just now" }
  ]);
  const [aiInput, setAiInput] = useState('');
  const [isSendingAi, setIsSendingAi] = useState(false);

  useEffect(() => {
    let active = true;
    const fetchDashboard = async () => {
      try {
        const response = await api.get('/api/teacher/dashboard');
        if (active && response.data) {
          setDashboardData(response.data);
          if (response.data.studentRoster && Array.isArray(response.data.studentRoster)) {
            setStudents(response.data.studentRoster.map((s: any) => ({
              id: s.id,
              roll: s.roll || s.rollNumber || "01",
              name: s.name || s.studentName || s.student?.name || "Student",
              status: s.status || s.attendanceStatus || "",
              history: s.history || s.attendanceHistory || ["P", "P", "P", "P", "P"],
              color: s.color || "#3b82f6",
              initials: s.initials || (s.name ? s.name.split(' ').map((n: string) => n[0]).join('') : "ST"),
              parentName: s.parentName || s.parent?.name || "Parent",
              isPending: s.isPending
            })));
          }
        }
      } catch (err) {
        console.error('Failed to fetch teacher dashboard:', err);
      } finally {
        if (active) {
          setIsLoadingDashboard(false);
        }
      }
    };
    fetchDashboard();
    return () => {
      active = false;
    };
  }, []);

  const handleProposeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proposeName.trim()) return;

    try {
      await api.post('/api/teacher/students', {
        name: proposeName.trim(),
        grade: proposeGrade
      });

      addLog(`Teacher Jenkins proposed new student profile registration: ${proposeName}.`, 'users');
      setFeedbackMsg(`Registration proposed for ${proposeName}! Sent to Principal Vance approval queue.`);
      setShowProposeModal(false);
      setProposeName('');
      
      // Reload dashboard immediately
      const response = await api.get('/api/teacher/dashboard');
      if (response.data && response.data.studentRoster) {
        setDashboardData(response.data);
        setStudents(response.data.studentRoster.map((s: any) => ({
          id: s.id,
          roll: s.roll || "01",
          name: s.name || "Student",
          status: s.status || "",
          history: s.history || ["P", "P", "P", "P", "P"],
          color: s.color || "#3b82f6",
          initials: s.initials || "ST",
          parentName: s.parentName || "Parent",
          isPending: s.isPending
        })));
      }
    } catch (err: any) {
      console.error('Failed to propose student registration:', err);
      setFeedbackMsg('Failed to propose student profile. Please verify connection.');
    }
  };

  const handleSendTeacherAiMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!aiInput.trim() || isSendingAi) return;

    const userText = aiInput;
    setAiInput('');

    // Add user message
    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: userText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setAiMessages(prev => [...prev, userMsg]);

    // Add thinking placeholder
    const loadingId = Date.now() + 1;
    setAiMessages(prev => [...prev, {
      id: loadingId,
      sender: 'ai',
      text: 'Thinking...',
      time: 'Just now',
      isLoading: true
    }]);

    setIsSendingAi(true);

    try {
      const response = await api.post('/api/teacher/chat', { message: userText });
      const replyText = response.data?.reply || response.data?.message || response.data || "I couldn't process your request.";
      
      setAiMessages(prev => prev.map(msg => {
        if (msg.id === loadingId) {
          return {
            ...msg,
            text: replyText,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isLoading: false
          };
        }
        return msg;
      }));
    } catch (err) {
      console.error('Teacher AI chat failed:', err);
      let fallbackText = "I'm sorry, I couldn't connect to the AI copilot server. Please check your internet connection.";
      if (userText.toLowerCase().includes('draft') || userText.toLowerCase().includes('outreach')) {
        fallbackText = `Here's a draft template for your outreach:\n\nSubject: Academic Update / Math Class\nDear Parent,\n\nI wanted to share a brief update regarding your child's progress. They have been doing well, but I noticed a slight dip recently. Let's touch base to discuss a support plan.\n\nBest,\nMs. Jenkins`;
      }
      setAiMessages(prev => prev.map(msg => {
        if (msg.id === loadingId) {
          return {
            ...msg,
            text: fallbackText,
            time: 'Just now',
            isLoading: false
          };
        }
        return msg;
      }));
    } finally {
      setIsSendingAi(false);
    }
  };

  const [grades, setGrades] = useState([
    { roll: '01', name: 'Aaron James', quiz1: 88, hw1: 90, midterm: 92 },
    { roll: '02', name: 'Chloe M.', quiz1: 72, hw1: 75, midterm: 80 },
    { roll: '03', name: 'David Patel', quiz1: 85, hw1: 88, midterm: 89 },
    { roll: '04', name: 'Emily', quiz1: 94, hw1: 92, midterm: 96 }
  ]);

  const [communications, setCommunications] = useState([
    { to: 'Robert Miller', subject: "Chloe's Attendance Flag Follow-up", status: "Delivered", time: "2h ago" },
    { to: 'All Parents', subject: "Grade 10 June Academic Newsletter", status: "Read (94%)", time: "Yesterday" },
  ]);

  const [selectedParent, setSelectedParent] = useState('Robert Miller');
  const [selectedTemplate, setSelectedTemplate] = useState('none');
  const [customMsg, setCustomMsg] = useState('');

  // Calculate stats based on students state
  const totalStudents = students.length;
  const markedToday = students.filter(s => s.status !== '').length;
  const pendingCount = totalStudents - markedToday;
  const presentCount = students.filter(s => s.status === 'P').length;
  const lateCount = students.filter(s => s.status === 'L').length;
  const attendanceRate = markedToday > 0 
    ? Math.round(((presentCount + lateCount) / markedToday) * 100) 
    : 92;

  const handleStatusChange = (roll: string, status: string) => {
    const updated = students.map(student => {
      if (student.roll === roll) {
        const newHistory = [status, ...student.history.slice(0, 4)];
        return { ...student, status, history: newHistory };
      }
      return student;
    });
    setStudents(updated);
  };

  const handleMarkAllPresent = () => {
    const updated = students.map(student => {
      if (student.status !== 'P') {
        const newHistory = ['P', ...student.history.slice(0, 4)];
        return { ...student, status: 'P', history: newHistory };
      }
      return student;
    });
    setStudents(updated);
    addLog('Teacher marked all students present for Grade 10-A.');
    showFeedback('All students marked Present.');
  };

  const handleSaveAttendance = () => {
    addLog(`Teacher saved attendance for Grade 10-A. Marked: ${markedToday}/${totalStudents}. Rate: ${attendanceRate}%.`);
    showFeedback('Attendance saved successfully and synced with Management Portal!');
  };

  const showFeedback = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(''), 3000);
  };

  const handleGradeChange = (roll: string, field: string, val: string) => {
    const numVal = parseInt(val) || 0;
    setGrades(prev => prev.map(g => g.roll === roll ? { ...g, [field]: numVal } : g));
  };

  const handleSyncGrades = () => {
    const sum = grades.reduce((acc, g) => acc + (g.quiz1 + g.hw1 + g.midterm) / 3, 0);
    const classAvg = Math.round(sum / grades.length);
    addLog(`Teacher synced Gradebook for Grade 10-A Mathematics. Class Average: ${classAvg}%.`);
    showFeedback(`Gradebook successfully synced! Class average calculated: ${classAvg}%`);
  };

  const handleTemplateChange = (template: string) => {
    setSelectedTemplate(template);
    if (template === 'attendance') {
      setCustomMsg("Dear Mr. Miller,\n\nI am writing to share that Chloe has missed 3 consecutive Math classes. Please let us know if she requires support or curriculum adjustments.\n\nBest,\nSarah Jenkins");
    } else if (template === 'praise') {
      setCustomMsg("Dear Mr. Miller,\n\nI wanted to share that Chloe scored very highly on her recent algebra assessments. Her performance has been outstanding!\n\nBest,\nSarah Jenkins");
    } else {
      setCustomMsg('');
    }
  };

  const handleSendOutreach = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customMsg.trim()) return;
    const newComm = {
      to: selectedParent,
      subject: selectedTemplate === 'attendance' ? "Attendance Follow-up" : selectedTemplate === 'praise' ? "Academic Achievement Praise" : "Outreach message",
      status: "Sent",
      time: "Just now"
    };
    setCommunications([newComm, ...communications]);
    addLog(`Teacher Sarah Jenkins dispatched outreach to parent of student in Grade 10-A.`);
    showFeedback(`Message successfully dispatched to ${selectedParent}!`);
    setCustomMsg('');
    setSelectedTemplate('none');
  };

  const chloe = students.find(s => s.name === 'Chloe M.');
  const chloeAtRisk = chloe ? chloe.status === 'A' || chloe.history.filter((h: string) => h === 'A').length >= 3 : true;

  return (
    <div className="portal-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div>
          <div className="sidebar-header">
            <div className="sidebar-logo">
              <GraduationCap size={24} />
              <div>
                <h2>Teacher Portal</h2>
                <p className="sidebar-logo-subtitle">Class Management</p>
              </div>
            </div>
          </div>

          <div className="user-profile-summary">
            <InitialsAvatar name={user.name} size={44} />
            <div className="user-profile-info">
              <h4>{user.name}</h4>
              <p>{user.title}</p>
              <p style={{ fontSize: '0.65rem', color: 'var(--text-light)' }}>{user.school}</p>
            </div>
          </div>

          <nav className="sidebar-nav">
            {[
              { name: 'Dashboard', icon: LayoutDashboard },
              { name: 'Attendance', icon: CalendarDays },
              { name: 'Marks', icon: GraduationCap },
              { name: 'Assignments', icon: BookOpen },
              { name: 'Examinations', icon: ClipboardList },
              { name: 'Communication', icon: MessageSquare },
              { name: 'Meetings', icon: Users },
              { name: 'Notifications', icon: Bell }
            ].map(item => {
              const Icon = item.icon;
              return (
                <button
                  key={item.name}
                  type="button"
                  className={`sidebar-link ${activeTab === item.name ? 'active' : ''}`}
                  onClick={() => setActiveTab(item.name)}
                >
                  <Icon size={18} />
                  <span>{item.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="sidebar-footer">
          <button type="button" className="sidebar-link" onClick={() => setActiveTab('Settings')}>
            <SettingsIcon size={18} />
            <span>Settings</span>
          </button>
          <button type="button" className="sidebar-link" onClick={onLogout} style={{ color: 'var(--danger)' }}>
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="main-wrapper">
        <header className="portal-header">
          <div className="header-search">
            <Search className="search-icon" />
            <input type="text" placeholder="Search students, marks, or records..." />
          </div>

          <div className="header-actions">
            <button type="button" className="header-icon-btn">
              <Bell size={20} />
              <span className="badge-dot"></span>
            </button>
            <div className="flex align-center gap-2">
              <InitialsAvatar name={user.name} size={32} />
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{user.name}</span>
            </div>
          </div>
        </header>

        <main className="page-container">
          {feedbackMsg && (
            <div className="alert-banner" style={{
              backgroundColor: 'var(--success-bg)',
              color: 'var(--success-text)',
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              marginBottom: '1rem',
              border: '1px solid var(--success)',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              animation: 'pulse-glow 2s infinite'
            }}>
              <CheckCircle2 size={18} />
              <span>{feedbackMsg}</span>
            </div>
          )}

          {activeTab === 'Dashboard' && (
            <div>
              <div className="page-header">
                <h1 className="page-title">Teacher Dashboard</h1>
                <p className="page-subtitle">Welcome back, Ms. Jenkins. Here is your overview for today.</p>
              </div>

              {isLoadingDashboard && (
                <div style={{ padding: '0.75rem 1rem', backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#2563eb', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', fontSize: '0.8rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.5rem' }} className="animate-pulse">
                  <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#2563eb' }} />
                  <span>Syncing student records with live school database...</span>
                </div>
              )}

              {/* KPI Cards */}
              <div className="metrics-grid">
                <div className="metric-card">
                  <div className="metric-header">
                    <span>Active Students</span>
                    <div className="metric-icon-wrapper">
                      <Users size={16} />
                    </div>
                  </div>
                  <div className="metric-value">{dashboardData?.stats?.activeStudents || totalStudents}</div>
                  <div className="metric-subtext">Grade 10-A Maths roster</div>
                </div>

                <div className="metric-card">
                  <div className="metric-header">
                    <span>Attendance Rate</span>
                    <div className="metric-icon-wrapper" style={{ backgroundColor: 'var(--portal-success-bg)', color: 'var(--portal-success)' }}>
                      <TrendingUp size={16} />
                    </div>
                  </div>
                  <div className="metric-value">{dashboardData?.stats?.classAttendanceRate || attendanceRate}%</div>
                  <div className="metric-subtext">Class target: 95%</div>
                </div>

                <div className="metric-card">
                  <div className="metric-header">
                    <span>Tasks Graded</span>
                    <div className="metric-icon-wrapper" style={{ backgroundColor: 'var(--portal-info-bg)', color: 'var(--portal-info)' }}>
                      <CheckCircle2 size={16} />
                    </div>
                  </div>
                  <div className="metric-value">{dashboardData?.stats?.tasksGraded || "18 / 24"}</div>
                  <div className="metric-subtext">Algebra Quiz 2 pending</div>
                </div>

                <div className="metric-card">
                  <div className="metric-header">
                    <span>PTM Meetings</span>
                    <div className="metric-icon-wrapper" style={{ backgroundColor: 'var(--portal-accent-purple-bg)', color: 'var(--portal-accent-purple)' }}>
                      <CalendarDays size={16} />
                    </div>
                  </div>
                  <div className="metric-value">1</div>
                  <div className="metric-subtext">Scheduled for Friday</div>
                </div>
              </div>

              <div className="dashboard-grid">
                {/* Left Side: Schedule and Activities */}
                <div className="flex flex-column gap-6">
                  {/* Today's Schedule */}
                  <div className="dashboard-panel">
                    <h3 className="panel-title">Today's Schedule</h3>
                    <div className="timeline-list">
                      <div className="timeline-card" style={{ borderLeftColor: 'var(--portal-primary)' }}>
                        <div className="timeline-card-content">
                          <span className="timeline-card-title">Grade 10-A Mathematics (Period 2)</span>
                          <span className="timeline-card-time">10:00 AM - 11:15 AM • Classroom 102</span>
                        </div>
                      </div>
                      <div className="timeline-card" style={{ borderLeftColor: 'var(--portal-accent-purple)' }}>
                        <div className="timeline-card-content">
                          <span className="timeline-card-title">Parent-Teacher Meeting: Robert Miller</span>
                          <span className="timeline-card-time">03:30 PM - 03:50 PM • Conference Room B / Online</span>
                        </div>
                        <span className="badge badge-purple">Pending Confirm</span>
                      </div>
                    </div>
                  </div>

                  {/* Recent Activity Feed */}
                  <div className="dashboard-panel">
                    <h3 className="panel-title">System Activities</h3>
                    <div className="timeline-list">
                      <div className="flex gap-3 align-center" style={{ borderBottom: '1px solid var(--portal-border-light)', paddingBottom: '0.75rem' }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'var(--portal-primary)' }} />
                        <div style={{ flexGrow: 1 }}>
                          <p style={{ fontSize: '0.85rem', color: 'var(--portal-text-primary)', fontWeight: 500 }}>
                            Parent <strong>Robert Miller</strong> confirmed uniform code check via AI Assistant.
                          </p>
                          <span style={{ fontSize: '0.7rem', color: 'var(--portal-text-light)' }}>Today at 10:12 AM</span>
                        </div>
                      </div>
                      <div className="flex gap-3 align-center" style={{ borderBottom: '1px solid var(--portal-border-light)', paddingBottom: '0.75rem' }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'var(--portal-success)' }} />
                        <div style={{ flexGrow: 1 }}>
                          <p style={{ fontSize: '0.85rem', color: 'var(--portal-text-primary)', fontWeight: 500 }}>
                            System generated outreach alert for <strong>Chloe M.</strong> due to attendance drops.
                          </p>
                          <span style={{ fontSize: '0.7rem', color: 'var(--portal-text-light)' }}>Yesterday at 04:30 PM</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Side: Insights Panel */}
                <div className="flex flex-column gap-4">
                  <div className="dashboard-panel" style={{ borderLeft: '4px solid var(--portal-info)' }}>
                    <h3 className="panel-title">
                      <Sparkles size={16} style={{ color: 'var(--portal-info)' }} />
                      <span>Class Insights</span>
                    </h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--portal-text-secondary)', lineHeight: '1.4' }}>
                      Overall class performance is stable. Trigonometry scores showed a 4% improvement over last year's average.
                    </p>
                    <div className="alert-card" style={{ backgroundColor: 'var(--portal-danger-bg)', border: '1px solid var(--portal-danger-text)', borderRadius: 'var(--portal-radius-md)', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <strong style={{ display: 'block', fontSize: '0.85rem', color: 'var(--portal-danger-text)', fontWeight: 700 }}>
                        Attendance Check Required
                      </strong>
                      <p style={{ fontSize: '0.75rem', color: 'var(--portal-text-secondary)', lineHeight: '1.4' }}>
                        Chloe M. has missed 3 consecutive math classes. Tap Communication to send an outreach email.
                      </p>
                      <button type="button" className="btn btn-outline" style={{ marginTop: '0.25rem', padding: '0.25rem 0.5rem', fontSize: '0.7rem', width: 'fit-content' }} onClick={() => setActiveTab('Communication')}>
                        Draft Outreach
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Attendance' && (
            <div>
              <div className="page-header flex justify-between align-center" style={{ flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h1 className="page-title">Attendance Management</h1>
                  <p className="page-subtitle">Mark and review attendance for your classes.</p>
                </div>

                <div className="flex align-center gap-2">
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Select Class</span>
                  <div className="dropdown-wrapper">
                    <select 
                      className="form-input" 
                      value={selectedClass} 
                      onChange={(e) => setSelectedClass(e.target.value)}
                      style={{ paddingRight: '2rem', cursor: 'pointer' }}
                    >
                      <option>Grade 10-A (Mathematics)</option>
                      <option>Grade 10-B (Mathematics)</option>
                      <option>Grade 11-A (Calculus)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="metrics-grid">
                <div className="metric-card">
                  <div className="metric-header">
                    <span>Total Students</span>
                    <div className="metric-icon-wrapper">
                      <Users size={16} />
                    </div>
                  </div>
                  <div className="metric-value">{totalStudents}</div>
                  <div className="metric-subtext">Registered in class</div>
                </div>

                <div className="metric-card">
                  <div className="metric-header">
                    <span>Marked Today</span>
                    <div className="metric-icon-wrapper" style={{ backgroundColor: 'var(--success-bg)', color: 'var(--success)' }}>
                      <CheckCircle2 size={16} />
                    </div>
                  </div>
                  <div className="metric-value">{markedToday}</div>
                  <div className="metric-subtext">out of {totalStudents}</div>
                </div>

                <div className="metric-card">
                  <div className="metric-header">
                    <span>Pending</span>
                    <div className="metric-icon-wrapper" style={{ backgroundColor: 'var(--danger-bg)', color: 'var(--danger)' }}>
                      <AlertTriangle size={16} />
                    </div>
                  </div>
                  <div className="metric-value">{pendingCount}</div>
                  <div className="metric-subtext">Requires action</div>
                </div>

                <div className="metric-card">
                  <div className="metric-header">
                    <span>Current Rate</span>
                    <div className="metric-icon-wrapper" style={{ backgroundColor: 'var(--info-bg)', color: 'var(--info)' }}>
                      <TrendingUp size={16} />
                    </div>
                  </div>
                  <div className="metric-value">{attendanceRate}%</div>
                  <div className="metric-subtext">
                    <span className="trend-up">+2%</span> from last week
                  </div>
                </div>
              </div>

              {/* Main Table and Side Insights */}
              <div className="dashboard-grid">
                {/* Roster Panel */}
                <div className="dashboard-panel">
                  <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 className="panel-title">Today's Roster</h3>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button type="button" className="btn btn-secondary" onClick={() => setShowProposeModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}>
                        <Plus size={14} />
                        <span>Propose Student</span>
                      </button>
                      <button type="button" className="btn btn-outline" onClick={handleMarkAllPresent} style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}>
                        Mark All Present
                      </button>
                    </div>
                  </div>

                  <div className="table-container">
                    <table className="custom-table">
                      <thead>
                        <tr>
                          <th>Roll</th>
                          <th>Student Name</th>
                          <th>Status</th>
                          <th>Last 5 Days</th>
                        </tr>
                      </thead>
                      <tbody>
                        {students.map((student) => (
                          <tr key={student.roll}>
                            <td style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{student.roll}</td>
                            <td>
                              <div className="flex align-center gap-3">
                                <div className="avatar-bubble" style={{ 
                                  backgroundColor: student.color || '#3b82f6',
                                  width: 32,
                                  height: 32,
                                  fontSize: '0.75rem'
                                }}>
                                  {student.initials}
                                </div>
                                <span style={{ fontWeight: 600 }}>{student.name}</span>
                              </div>
                            </td>
                            <td>
                              {student.isPending ? (
                                <span style={{
                                  backgroundColor: '#fffbeb',
                                  color: '#d97706',
                                  border: '1px solid #fef3c7',
                                  fontSize: '0.7rem',
                                  fontWeight: 600,
                                  padding: '4px 8px',
                                  borderRadius: '8px',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.25rem'
                                }}>
                                  <Clock size={12} />
                                  <span>Awaiting Verification</span>
                                </span>
                              ) : (
                                <div className="status-selector-group" style={{ 
                                  display: 'flex', 
                                  border: '1px solid var(--border-color)',
                                  borderRadius: 'var(--radius-md)',
                                  width: 'fit-content',
                                  overflow: 'hidden',
                                  backgroundColor: 'var(--border-light)'
                                }}>
                                  {[
                                    { key: 'P', label: 'P' },
                                    { key: 'A', label: 'A' },
                                    { key: 'L', label: 'L' }
                                  ].map(btn => (
                                    <button
                                      key={btn.key}
                                      type="button"
                                      onClick={() => handleStatusChange(student.roll, btn.key)}
                                      style={{
                                        border: `1px solid ${student.status === btn.key ? (student.color || 'var(--portal-primary)') : 'var(--portal-border-color)'}`,
                                        borderRadius: 'var(--portal-radius-md)',
                                        padding: '0.4rem 1rem',
                                        fontSize: '0.75rem',
                                        fontWeight: 'bold',
                                        cursor: 'pointer',
                                        backgroundColor: student.status === btn.key ? (student.color || 'var(--portal-primary)') : 'transparent',
                                        color: student.status === btn.key ? 'var(--portal-text-inverse)' : 'var(--portal-text-secondary)',
                                        transition: 'all 0.15s ease'
                                      }}
                                    >
                                      {btn.label}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </td>
                            <td>
                              {student.isPending ? (
                                <span style={{ fontSize: '0.75rem', color: '#888888', fontStyle: 'italic' }}>Pending principal check</span>
                              ) : (
                                <div className="flex gap-2">
                                  {student.history.map((dayStatus: string, idx: number) => {
                                    if (dayStatus === 'P') {
                                      return <CheckCircle2 key={idx} size={16} style={{ color: 'var(--portal-primary)' }} />;
                                    } else if (dayStatus === 'A') {
                                      return <XCircle key={idx} size={16} style={{ color: 'var(--portal-danger)' }} />;
                                    } else {
                                      return <Clock key={idx} size={16} style={{ color: 'var(--portal-secondary)' }} />;
                                    }
                                  })}
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex justify-end" style={{ borderTop: '1px solid var(--portal-border-light)', paddingTop: '1.25rem' }}>
                    <button type="button" className="btn btn-primary" onClick={handleSaveAttendance} style={{
                      backgroundColor: 'var(--portal-primary)',
                      padding: '0.75rem 2rem',
                      boxShadow: '0 4px 12px rgba(0, 75, 181, 0.25)'
                    }}>
                      Save Attendance
                    </button>
                  </div>
                </div>

                {/* Right Insights Column */}
                <div className="flex flex-column gap-4">
                  {/* AI Insights Card */}
                  <div className="dashboard-panel" style={{ borderLeft: '4px solid var(--portal-info)' }}>
                    <div className="panel-header" style={{ paddingBottom: '0.5rem' }}>
                      <h3 className="panel-title" style={{ fontSize: '1rem' }}>
                        <Sparkles size={16} style={{ color: 'var(--portal-info)' }} />
                        <span>Insights Panel</span>
                      </h3>
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--portal-text-secondary)', marginTop: '-8px' }}>
                      AI-driven attendance analysis.
                    </p>

                    {chloeAtRisk ? (
                      <div className="alert-card" style={{
                        backgroundColor: 'var(--portal-danger-bg)',
                        border: '1px solid var(--portal-danger-text)',
                        borderRadius: 'var(--portal-radius-md)',
                        padding: '1rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.5rem'
                      }}>
                        <div className="flex align-center gap-2" style={{ color: 'var(--portal-danger-text)', fontWeight: 600, fontSize: '0.85rem' }}>
                          <AlertTriangle size={16} />
                          <span>Risk Alert: Chloe M.</span>
                        </div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--portal-text-secondary)', lineHeight: '1.4' }}>
                          Attendance has dropped below 80% this month. 3 consecutive absences noted.
                        </p>
                        <button 
                          type="button" 
                          onClick={() => {
                            setActiveTab('Communication');
                            addLog('Teacher Sarah Jenkins selected Chloe M. for follow-up message.');
                          }} 
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--portal-primary)',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            cursor: 'pointer',
                            padding: 0,
                            width: 'fit-content',
                            marginTop: '0.25rem'
                          }}
                        >
                          <span>Message Parent</span>
                          <Send size={10} />
                        </button>
                      </div>
                    ) : (
                      <div className="alert-card" style={{
                        backgroundColor: 'var(--portal-success-bg)',
                        border: '1px solid var(--portal-success)',
                        borderRadius: 'var(--portal-radius-md)',
                        padding: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}>
                        <CheckCircle2 size={16} style={{ color: 'var(--portal-success)' }} />
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--portal-success-text)' }}>
                          No current attendance risks in this class!
                        </span>
                      </div>
                    )}

                    <div className="weekly-trend-chart-container" style={{ marginTop: '0.5rem' }}>
                      <div className="flex justify-between align-center" style={{ marginBottom: '0.75rem' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Weekly Trend</span>
                        <TrendingUp size={14} style={{ color: 'var(--portal-text-light)' }} />
                      </div>
                      
                      {/* Bar chart mockup */}
                      <div className="chart-bars flex justify-between align-center" style={{ height: '80px', padding: '0 0.5rem', alignItems: 'flex-end', borderBottom: '1px solid var(--portal-border-color)', marginBottom: '0.5rem' }}>
                        {[
                          { day: 'M', height: '60%', color: '#8bb5ff' },
                          { day: 'T', height: '75%', color: '#8bb5ff' },
                          { day: 'W', height: '90%', color: 'var(--portal-primary)' },
                          { day: 'T', height: '55%', color: '#fca5a5' },
                          { day: 'F', height: '80%', color: 'var(--portal-primary)' }
                        ].map((bar, i) => (
                          <div key={i} className="flex flex-column align-center" style={{ width: '12%', gap: '0.25rem' }}>
                            <div style={{
                              height: bar.height,
                              width: '100%',
                              backgroundColor: bar.color,
                              borderRadius: '4px 4px 0 0',
                              transition: 'height 0.3s ease'
                            }}></div>
                            <span style={{ fontSize: '0.65rem', color: 'var(--portal-text-light)', fontWeight: 600 }}>{bar.day}</span>
                          </div>
                        ))}
                      </div>
                      <p style={{ fontSize: '0.7rem', color: 'var(--portal-text-secondary)', textAlign: 'center', lineHeight: '1.4' }}>
                        Thursday showed highest absentee rate across Grade 10.
                      </p>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="dashboard-panel">
                    <h3 className="panel-title" style={{ fontSize: '0.95rem' }}>Quick Actions</h3>
                    <div className="flex flex-column gap-2">
                      <button type="button" className="btn btn-outline flex align-center justify-between" onClick={() => showFeedback('Reports submitted to Administrator')}>
                        <span className="flex align-center gap-2">
                          <Send size={14} />
                          <span>Submit to Admin</span>
                        </span>
                      </button>
                      <button type="button" className="btn btn-outline flex align-center justify-between" onClick={() => showFeedback('Downloading weekly report...')}>
                        <span className="flex align-center gap-2">
                          <Download size={14} />
                          <span>Download Weekly Report</span>
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Marks' && (
            <div className="dashboard-panel">
              <div className="page-header flex justify-between align-center" style={{ flexWrap: 'wrap', gap: '1rem', borderBottom: 'none', paddingBottom: 0 }}>
                <div>
                  <h1 className="page-title">Gradebook Manager</h1>
                  <p className="page-subtitle">Input and sync student marks for term assessments.</p>
                </div>
                <button type="button" className="btn btn-primary" onClick={handleSyncGrades}>
                  Sync Gradebook
                </button>
              </div>

              <div className="table-container">
                <table className="gradebook-table">
                  <thead>
                    <tr>
                      <th style={{ width: '80px' }}>Roll</th>
                      <th>Student Name</th>
                      <th>Algebra Quiz 1 (10%)</th>
                      <th>Equations Homework 1 (10%)</th>
                      <th>Term Midterm Exam (30%)</th>
                      <th>Calculated Average</th>
                    </tr>
                  </thead>
                  <tbody>
                    {grades.map((st) => {
                      const calculatedAvg = Math.round((st.quiz1 + st.hw1 + st.midterm) / 3);
                      return (
                        <tr key={st.roll}>
                          <td style={{ textAlign: 'center', fontWeight: 600, color: 'var(--portal-text-secondary)' }}>{st.roll}</td>
                          <td style={{ fontWeight: 600 }}>{st.name}</td>
                          <td>
                            <input
                              type="number"
                              className="gradebook-input"
                              value={st.quiz1}
                              onChange={(e) => handleGradeChange(st.roll, 'quiz1', e.target.value)}
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              className="gradebook-input"
                              value={st.hw1}
                              onChange={(e) => handleGradeChange(st.roll, 'hw1', e.target.value)}
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              className="gradebook-input"
                              value={st.midterm}
                              onChange={(e) => handleGradeChange(st.roll, 'midterm', e.target.value)}
                            />
                          </td>
                          <td style={{ textAlign: 'center', fontWeight: 700, color: calculatedAvg >= 85 ? 'var(--portal-success-text)' : calculatedAvg < 80 ? 'var(--portal-danger-text)' : 'inherit' }}>
                            {calculatedAvg}%
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'Communication' && (
            <div className="dashboard-grid">
              {/* Message composer */}
              <div className="dashboard-panel">
                <h3 className="panel-title">Parent Outreach System</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--portal-text-secondary)', marginTop: '-8px' }}>
                  Generate and send template-driven outreach notices to parents.
                </p>

                <form onSubmit={handleSendOutreach} className="flex flex-column gap-4">
                  <div className="form-group">
                    <label>Recipient Parent</label>
                    <select className="form-input" value={selectedParent} onChange={(e) => setSelectedParent(e.target.value)}>
                      <option value="Robert Miller">Robert Miller (Chloe Miller's Dad)</option>
                      <option value="All Parents">All Grade 10-A Parents</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Select Template</label>
                    <div className="template-pill-container">
                      <button
                        type="button"
                        className={`template-pill ${selectedTemplate === 'none' ? 'active' : ''}`}
                        onClick={() => handleTemplateChange('none')}
                      >
                        No Template (Custom)
                      </button>
                      <button
                        type="button"
                        className={`template-pill ${selectedTemplate === 'attendance' ? 'active' : ''}`}
                        onClick={() => handleTemplateChange('attendance')}
                      >
                        Attendance Warning
                      </button>
                      <button
                        type="button"
                        className={`template-pill ${selectedTemplate === 'praise' ? 'active' : ''}`}
                        onClick={() => handleTemplateChange('praise')}
                      >
                        Academic Excellence Praise
                      </button>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Message Content</label>
                    <textarea
                      className="form-input"
                      rows={6}
                      value={customMsg}
                      onChange={(e) => setCustomMsg(e.target.value)}
                      placeholder="Draft outreach letter here..."
                      style={{ resize: 'vertical', fontFamily: 'inherit' }}
                      required
                    />
                  </div>

                  <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-end' }}>
                    <Send size={16} />
                    <span>Send Outreach Notice</span>
                  </button>
                </form>
              </div>

              {/* Sent messages log */}
              <div className="flex flex-column gap-4">
                <div className="dashboard-panel">
                  <h3 className="panel-title">Outreach Log</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--portal-text-secondary)', marginTop: '-8px' }}>
                    Recent outreach messages dispatched.
                  </p>

                  <div className="timeline-list">
                    {communications.map((comm, idx) => (
                      <div key={idx} className="timeline-card" style={{ borderLeftColor: 'var(--portal-primary)' }}>
                        <div className="timeline-card-content">
                          <span className="timeline-card-title">{comm.subject}</span>
                          <span className="timeline-card-time">
                            To: <strong>{comm.to}</strong> • {comm.time}
                          </span>
                        </div>
                        <span className="badge badge-success">{comm.status}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Teacher AI Copilot */}
                <div className="dashboard-panel flex flex-column" style={{ maxHeight: '450px' }}>
                  <div className="flex justify-between align-center" style={{ marginBottom: '0.5rem', borderBottom: '1px solid var(--portal-border-light)', paddingBottom: '0.5rem' }}>
                    <div className="flex align-center gap-2">
                      <Sparkles size={18} style={{ color: 'var(--portal-primary)' }} />
                      <h3 className="panel-title" style={{ margin: 0 }}>Westview Teacher Copilot</h3>
                    </div>
                    <span className="badge badge-purple" style={{ fontSize: '0.65rem' }}>AI Active</span>
                  </div>
                  
                  <div className="flex-grow scrollable-chat-area" style={{ overflowY: 'auto', padding: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '280px', minHeight: '180px' }}>
                    {aiMessages.map((msg) => (
                      <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div style={{
                          maxWidth: '85%',
                          padding: '0.6rem 0.9rem',
                          borderRadius: '12px',
                          fontSize: '0.8rem',
                          lineHeight: '1.4',
                          backgroundColor: msg.sender === 'user' ? 'var(--portal-primary)' : 'var(--portal-border-light)',
                          color: msg.sender === 'user' ? 'var(--portal-text-inverse)' : 'var(--portal-text-primary)'
                        }}>
                          {msg.isLoading ? (
                            <span className="animate-pulse">Analyzing student metrics...</span>
                          ) : (
                            <p style={{ margin: 0, whiteSpace: 'pre-line' }}>{msg.text}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <form onSubmit={handleSendTeacherAiMessage} className="flex gap-2" style={{ marginTop: '0.5rem', borderTop: '1px solid var(--portal-border-light)', paddingTop: '0.5rem' }}>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Ask copilot to draft an email, analyze scores..."
                      value={aiInput}
                      onChange={(e) => setAiInput(e.target.value)}
                      disabled={isSendingAi}
                      style={{ flexGrow: 1, fontSize: '0.8rem', padding: '0.4rem 0.75rem' }}
                    />
                    <button type="submit" className="btn btn-primary" style={{ padding: '0.4rem 0.8rem' }} disabled={isSendingAi || !aiInput.trim()}>
                      <Send size={14} />
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}

          {activeTab !== 'Dashboard' && activeTab !== 'Attendance' && activeTab !== 'Marks' && activeTab !== 'Communication' && (
            <div className="dashboard-panel text-center" style={{ padding: '4rem 2rem' }}>
              <Sparkles size={48} style={{ color: 'var(--portal-primary)', margin: '0 auto 1.5rem', opacity: 0.8 }} />
              <h2>{activeTab} Module</h2>
              <p style={{ color: 'var(--portal-text-secondary)', marginTop: '0.5rem', maxWidth: '500px', marginInline: 'auto' }}>
                This section displays school metrics, lesson planner items, grade lists, schedules, and notifications for the Teacher role. 
                Use the **Dashboard**, **Attendance**, **Marks** and **Communication** tabs in the sidebar to review active widgets!
              </p>
              <button type="button" className="btn btn-primary" style={{ marginTop: '1.5rem' }} onClick={() => setActiveTab('Dashboard')}>
                Go back to Dashboard
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Propose Student Registration Modal */}
      {showProposeModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)',
          zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{
            backgroundColor: '#ffffff', borderRadius: '18px', padding: '1.75rem',
            width: '100%', maxWidth: '380px', border: '1px solid #e5e5e7',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#111111', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Plus size={18} />
              <span>Propose Student Registration</span>
            </h3>

            <form onSubmit={handleProposeSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.7rem', fontWeight: 600, color: '#666666', textTransform: 'uppercase' }}>Student Name</label>
                <input 
                  type="text" 
                  value={proposeName}
                  onChange={(e) => setProposeName(e.target.value)}
                  placeholder="e.g. Timothy Miller"
                  required
                  style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #d1d1d6', fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.7rem', fontWeight: 600, color: '#666666', textTransform: 'uppercase' }}>Proposed Grade Level</label>
                <select 
                  value={proposeGrade}
                  onChange={(e) => setProposeGrade(e.target.value)}
                  style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #d1d1d6', fontSize: '0.85rem', backgroundColor: '#ffffff' }}
                >
                  <option>Grade 8</option>
                  <option>Grade 9</option>
                  <option>Grade 10</option>
                  <option>Grade 11</option>
                  <option>Grade 12</option>
                </select>
              </div>

              <p style={{ fontSize: '0.7rem', color: '#888888', margin: 0, lineHeight: '1.4' }}>
                *Note: Your proposed student registration will immediately display as "Awaiting Verification" on your roster, and will be dispatched to Principal Alistair Vance for active review.
              </p>

              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setShowProposeModal(false)} style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #eaeaea', backgroundColor: '#ffffff', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 500 }}>Cancel</button>
                <button type="submit" style={{ padding: '6px 12px', borderRadius: '8px', border: 'none', backgroundColor: '#111111', color: '#ffffff', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}>Propose registration</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

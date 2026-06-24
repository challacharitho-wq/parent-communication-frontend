/* eslint-disable react-hooks/purity */
import React, { useState, useRef, useEffect } from 'react';
import { api } from '@/services/api';
import InitialsAvatar from '../components/InitialsAvatar';
import { 
  LayoutDashboard, 
  MessageSquare, 
  Calendar, 
  GraduationCap, 
  Sparkles, 
  Send, 
  Bell, 
  Settings as SettingsIcon, 
  LogOut, 
  AlertTriangle, 
  BookOpen, 
  Search,
  CheckCircle2,
  Minus,
  X,
  ChevronDown,
  CreditCard,
  FileText,
  User,
  Clock,
  Download,
  AlertCircle,
  MessageCircle
} from 'lucide-react';

interface ParentPortalProps {
  user: any;
  onLogout: () => void;
  addLog: (text: string, iconType?: string) => void;
}

export default function ParentPortal({ user, onLogout, addLog }: ParentPortalProps) {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [isAIChatMinimized, setIsAIChatMinimized] = useState(false);
  
  // Floating AI Chat Messages
  const [messages, setMessages] = useState<any[]>([
    {
      id: 1,
      sender: 'ai',
      text: "Hello Mr. Sharma! I am your Academic Clarity AI Assistant. I can help you check Aarav's academic reports, uniform rules, attendance details, or draft messaging to Grade 10 Lead Swati Rao. What can I do for you today?",
      time: 'Just now'
    }
  ]);
  const [inputVal, setInputVal] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  // General States
  const [isDownloading, setIsDownloading] = useState(false);
  const [calendarFilter, setCalendarFilter] = useState('all');
  const [selectedDayEvents, setSelectedDayEvents] = useState<any[] | null>(null);

  // Inbox Sub-Tab State
  const [inboxActiveTab, setInboxActiveTab] = useState('Teacher Messages');
  const [composerText, setComposerText] = useState('');
  const [activeChatTeacher, setActiveChatTeacher] = useState('Swati Rao');

  // Finance Sub-States
  const [financePaid, setFinancePaid] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<any | null>(null);
  
  // AI Console Sub-State
  const [selectedAIQueryType, setSelectedAIQueryType] = useState<string | null>(null);
  const [aiQueryResult, setAiQueryResult] = useState<any>(null);

  // Static Mock Data
  const calendarEvents = [
    { day: 3, title: "Physics Homework 1 Due", type: "exam", desc: "Grade 10 Physics Mechanics submission by 11:59 PM.", color: "var(--portal-primary)" },
    { day: 10, title: "Math Algebra Quiz 2", type: "exam", desc: "Covers quadratic equations and graphs. 10:00 AM.", color: "var(--portal-danger)" },
    { day: 15, title: "Mid-Term Project Submission", type: "exam", desc: "Chemistry lab reports submission due.", color: "var(--portal-warning)" },
    { day: 19, title: "Parent-Teacher Meeting", type: "meeting", desc: "Discussion with Swati Rao regarding Aarav's progress. 3:30 PM.", color: "var(--portal-accent-purple)", link: true },
    { day: 22, title: "Physics Term Project Due", type: "exam", desc: "Grade 10 Physics electromagnetism submission.", color: "var(--portal-primary)" },
    { day: 26, title: "School Picnic / Excursion", type: "holiday", desc: "Westview annual grade 10 picnic day.", color: "var(--portal-success)" },
  ];

  const announcementsData = [
    { id: 1, title: "Grade 10 Excursion Plan", date: "Today", summary: "The annual Grade 10 picnic is confirmed for Friday, June 26. Detailed schedules and consent forms are under the school files.", content: "Dear Parents, We are excited to announce our upcoming school excursion. Please ensure your child wears the house color physical education t-shirt. The bus departs at 8:00 AM sharp and will return around 4:00 PM." },
    { id: 2, title: "Flu Season Health Advisory", date: "2 days ago", summary: "We are noticing a rise in seasonal viral cases. Review isolation guidelines for children exhibiting high fever.", content: "Students with high temperatures should remain home for at least 24 hours after fever breaks naturally without fever-reducing medications. Worksheets will be shared in student portals for self-study." },
    { id: 3, title: "Academic Outreach Initiative", date: "June 12", summary: "Westview launches the AI Parent-Teacher alignment platform to coordinate student intervention early.", content: "As part of our commitment to student success, the portal allows early detection of attendance and performance drop flags. AI assistants are available to assist with quick query resolution." }
  ];

  const communicationHistory = [
    { date: "June 17, 2026", type: "Email Outbox", desc: "Sent response to Ms. Rao regarding illness leave." },
    { date: "June 15, 2026", type: "System Alert", desc: "Alert triggered: Attendance dropped below 80% threshold." },
    { date: "June 10, 2026", type: "Inbound Call", desc: "Consulted with School Nurse regarding Aarav's clinic visit." },
    { date: "June 02, 2026", type: "Form Submission", desc: "Submitted Grade 10 Term Excursion permission slip." }
  ];

  // Live Teacher Messages Mock State
  const [messagesWithTeachers, setMessagesWithTeachers] = useState<any>({
    'Swati Rao': [
      { id: 1, sender: 'teacher', text: "Hello Mr. Sharma, I noticed Aarav missed Math class today again. We have a test coming up next Monday. Is everything okay?", time: "9:30 AM" },
      { id: 2, sender: 'parent', text: "Hi Ms. Rao, yes, Aarav was down with a high fever. We went to the clinic. He will try to cover the material this weekend.", time: "10:00 AM" },
      { id: 3, sender: 'teacher', text: "Thanks for letting me know. I've uploaded the algebra worksheets so he can review quadratic functions.", time: "10:15 AM" }
    ],
    'Rohan Mehta': [
      { id: 1, sender: 'teacher', text: "Aarav did an excellent job in the Physics lab yesterday! Just wanted to share the good news.", time: "Yesterday" },
      { id: 2, sender: 'parent', text: "Thank you, Mr. Mehta! He enjoys your physics classes a lot.", time: "Yesterday" }
    ],
    'Kavita Patel': [
      { id: 1, sender: 'teacher', text: "Please remind Aarav to submit his Shakespeare revision draft today.", time: "3 days ago" },
      { id: 2, sender: 'parent', text: "He has completed it, I will check if he submitted it through his dashboard.", time: "3 days ago" },
      { id: 3, sender: 'teacher', text: "Received, thank you! It looks very detailed.", time: "2 days ago" }
    ]
  });

  // Billing History
  const [paymentTransactions, setPaymentTransactions] = useState<any[]>([
    { id: "TXN-902", desc: "Term 2 Academic Fees", amount: 125000, date: "Jan 10, 2026", status: "SUCCESS", receipt: "RCPT-902" },
    { id: "TXN-401", desc: "Term 1 Academic Fees", amount: 125000, date: "Sep 15, 2025", status: "SUCCESS", receipt: "RCPT-401" }
  ]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // API Dashboard Data
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(true);

  useEffect(() => {
    let active = true;
    const fetchDashboard = async () => {
      try {
        const response = await api.get('/api/parent/dashboard');
        if (active && response.data) {
          setDashboardData(response.data);
        }
      } catch (err) {
        console.error('Failed to fetch parent dashboard data:', err);
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

  // Find Aarav's info from shared state or API
  const chloe = (dashboardData && dashboardData.student) || {
    name: 'Aarav S.',
    roll: '02',
    status: 'A',
    history: ['A', 'P', 'A', 'P', 'A']
  };

  const chloeAttendanceRate = dashboardData?.attendanceRate !== undefined
    ? Number(dashboardData.attendanceRate)
    : Math.round(
        ((chloe.history ? chloe.history.filter((h: string) => h === 'P' || h === 'L').length : 4) / (chloe.history ? chloe.history.length : 5)) * 100
      );
  
  const chloeAtRisk = chloe.status === 'A' || (chloe.history && chloe.history.filter((h: string) => h === 'A').length >= 3) || chloeAttendanceRate < 80;

  const gpaValue = dashboardData?.gpa !== undefined ? dashboardData.gpa : "3.80";
  const activeHomeworkVal = dashboardData?.activeHomeworkCount !== undefined ? dashboardData.activeHomeworkCount : 1;

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    // Add user message
    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputVal('');

    // Add a placeholder/loading message from AI
    const loadingId = Date.now() + 1;
    setMessages(prev => [...prev, {
      id: loadingId,
      sender: 'ai',
      text: 'Thinking...',
      time: 'Just now',
      isLoading: true
    }]);

    try {
      const response = await api.post('/api/parent/chat', { message: textToSend });
      const replyText = response.data?.reply || response.data?.message || response.data || "Sorry, I couldn't process that.";
      
      setMessages(prev => prev.map(msg => {
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
      console.error('Failed to send AI chat message:', err);
      // Fallback to local offline matcher if API fails
      let aiText = "I'm sorry, I encountered an error connecting to the AI agent.";
      const lowerText = textToSend.toLowerCase();

      if (lowerText.includes('attendance') || lowerText.includes('flag') || lowerText.includes('risk') || lowerText.includes('why')) {
        aiText = `Aarav Sharma's attendance is currently at ${chloeAttendanceRate}%. He is flagged at risk because he was marked ABSENT today and has missed multiple classes this month. Ms. Swati Rao noted 3 consecutive absences.`;
      } else if (lowerText.includes('homework') || lowerText.includes('math') || lowerText.includes('assignment')) {
        aiText = "Aarav has one active Math homework assignment: 'Quadratic Functions Exercises 1 to 15'. It is due this Friday, June 19. Records show he has started it but hasn't submitted it yet.";
      } else if (lowerText.includes('uniform') || lowerText.includes('policy') || lowerText.includes('rules')) {
        aiText = "Westview International Uniform Policy:\n• Monday to Thursday: Standard formal school uniform (blue blazer, white shirt, gray trousers/skirt, school tie, dark leather shoes).\n• Friday: Physical Education kit or House color t-shirts.";
      }

      setMessages(prev => prev.map(msg => {
        if (msg.id === loadingId) {
          return {
            ...msg,
            text: aiText,
            time: 'Just now',
            isLoading: false
          };
        }
        return msg;
      }));
    }
  };

  const handleActionClick = (actionType: string) => {
    if (actionType === 'send_email') {
      addLog("Parent Rajesh Sharma dispatched a drafted response to Teacher Swati Rao: 'Aarav has been down with the flu...'");
      setMessages(prev => [...prev, {
        id: Date.now(),
        sender: 'ai',
        text: "✓ Email successfully dispatched to Swati Rao! She has been notified in her portal and we have added an update to the system feed.",
        time: 'Just now'
      }]);
      showFeedback("Email successfully sent to Ms. Rao!");
    } else if (actionType === 'schedule_ptm') {
      handleSendMessage("Schedule PTM for Friday, June 19 at 3:30 PM");
    }
  };

  const showFeedback = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(''), 3000);
  };

  // Live chat with teachers in Inbox tab
  const handleSendTeacherMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!composerText.trim()) return;

    const newMsg = {
      id: Date.now(),
      sender: 'parent',
      text: composerText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessagesWithTeachers((prev: any) => ({
      ...prev,
      [activeChatTeacher]: [...prev[activeChatTeacher], newMsg]
    }));
    setComposerText('');

    // Simulated quick reply from teacher
    setTimeout(() => {
      let replyText = "Thank you for the message, Mr. Sharma. I'll make sure Aarav gets extra guidance for the upcoming classes.";
      if (activeChatTeacher === 'Swati Rao') {
        replyText = "Thanks for letting me know, Mr. Sharma. I will email the detailed algebra worksheets so Aarav can review them at home. Let me know if you need to hop on a call.";
      } else if (activeChatTeacher === 'Rohan Mehta') {
        replyText = "Sounds good! He is a bright student and handles physics concepts very well.";
      }

      const teacherReply = {
        id: Date.now() + 1,
        sender: 'teacher',
        text: replyText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessagesWithTeachers((prev: any) => ({
        ...prev,
        [activeChatTeacher]: [...prev[activeChatTeacher], teacherReply]
      }));
      addLog(`Teacher ${activeChatTeacher} replied to parent Rajesh Sharma in communications chat.`);
    }, 1500);
  };

  // Finance Checkout Simulation
  const handleProcessPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentLoading(true);
    setTimeout(() => {
      setPaymentLoading(false);
      setFinancePaid(true);
      setShowPaymentModal(false);
      
      const newTxn = {
        id: `TXN-${Math.floor(100 + Math.random() * 900)}`,
        desc: "Term 3 Academic Fees",
        amount: 125000,
        date: "Today",
        status: "SUCCESS",
        receipt: `RCPT-${Math.floor(100 + Math.random() * 900)}`
      };

      setPaymentTransactions(prev => [newTxn, ...prev]);
      addLog("Parent Rajesh Sharma processed a Tuition payment of ₹1,25,000 via Finance portal.");
      showFeedback("✓ Fee payment of ₹1,25,000 processed successfully!");
    }, 2000);
  };

  // AI Assistant Console Query Handlers
  const handleExecuteAIQuery = (queryType: string) => {
    setSelectedAIQueryType(queryType);
    setAiQueryResult("Processing query...");

    setTimeout(() => {
      switch(queryType) {
        case 'performance':
          setAiQueryResult({
            summary: "Aarav is excelling in Science/Physics (95%) and Mathematics (92%). He shows a strong analytical mindset. Subject areas of attention include Literature (88%) where structured essay writing can be improved.",
            actionable: "Encourage consistent submission of literary homework and review essay guidelines before drafts.",
            grades: [
              { sub: "Physics", val: "95% (A)" },
              { sub: "Math", val: "92% (A)" },
              { sub: "Chemistry", val: "90% (A-)" },
              { sub: "Literature", val: "88% (B+)" }
            ]
          });
          break;
        case 'attendance':
          setAiQueryResult({
            summary: `Aarav's attendance rate is currently flagged at ${chloeAttendanceRate}% due to sick leaves. Normal standards require 80% attendance to guarantee optimal test standings.`,
            actionable: "Schedule PTM or review illness catch-up materials sent by Lead teacher Ms. Rao."
          });
          break;
        case 'ptm':
          setAiQueryResult({
            summary: "A Parent-Teacher Meeting is booked for Friday, June 19 at 3:30 PM with Ms. Swati Rao. Virtual access opens 5 minutes before scheduled slot.",
            actionable: "Prepare questions regarding math algebra workbooks and catching up on quadratic equations lectures."
          });
          break;
        case 'calendar':
          setAiQueryResult({
            events: [
              { date: "June 19", label: "Parent-Teacher Meeting (3:30 PM)" },
              { date: "June 22", label: "Physics Term Project Submission (11:59 PM)" },
              { date: "June 26", label: "Grade 10 Annual Excursion & Picnic Day" }
            ]
          });
          break;
        case 'policy':
          setAiQueryResult({
            uniform: "Monday to Thursday: Navy blue blazer, white collared shirt, gray school trousers/skirt, and dark leather shoes. Friday: PE sports kit or house t-shirts.",
            cellphone: "Devices must be stored in student lockers from 8:30 AM to 3:30 PM. Active use during lectures is prohibited unless requested for academics."
          });
          break;
        case 'fees':
          setAiQueryResult({
            outstanding: financePaid ? "₹0.00 (Paid in Full)" : "₹1,25,000",
            due: "June 30, 2026",
            breakdown: "Tuition (₹1,00,000) + Physics Lab Fee (₹15,000) + Student Activities (₹10,000)"
          });
          break;
        default:
          setAiQueryResult(null);
      }
    }, 1000);
  };

  return (
    <div className="portal-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div>
          <div className="sidebar-header">
            <div className="sidebar-logo">
              <Sparkles size={24} style={{ color: 'var(--primary)' }} />
              <div>
                <h2>Parent Portal</h2>
                <p className="sidebar-logo-subtitle">Student Support</p>
              </div>
            </div>
          </div>

          <div className="user-profile-summary">
            <InitialsAvatar name={user.name} size={44} />
            <div className="user-profile-info">
              <h4>{user.name}</h4>
              <p>{user.title}</p>
              <p style={{ fontSize: '0.65rem', color: 'var(--text-light)' }}>Academic Year 2026</p>
            </div>
          </div>

          <div className="sidebar-ai-button-wrapper">
            <button
              type="button"
              className={`sidebar-ai-btn ${isAIChatOpen ? 'active' : ''}`}
              onClick={() => {
                setIsAIChatOpen(prev => !prev);
                setIsAIChatMinimized(false);
              }}
            >
              <div className="ai-btn-glow"></div>
              <Sparkles size={18} />
              <span>AI Assistant</span>
              <span className="ai-badge-dot"></span>
            </button>
          </div>

          <nav className="sidebar-nav">
            {[
              { name: 'Dashboard', icon: LayoutDashboard },
              { name: 'Progress', icon: GraduationCap },
              { name: 'Inbox', icon: MessageSquare },
              { name: 'Finance', icon: CreditCard },
              { name: 'Schedule', icon: Calendar },
              { name: 'AI Assistant', icon: Sparkles }
            ].map(item => {
              const Icon = item.icon;
              return (
                <button
                  key={item.name}
                  type="button"
                  className={`sidebar-link ${activeTab === item.name ? 'active' : ''}`}
                  onClick={() => {
                    setActiveTab(item.name);
                    setSelectedAIQueryType(null);
                    setAiQueryResult(null);
                  }}
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

      {/* Main Area */}
      <div className="main-wrapper">
        <header className="portal-header">
          <div className="header-search">
            <Search className="search-icon" />
            <input type="text" placeholder="Search school files, notifications..." />
          </div>

          <div className="header-actions">
            <button type="button" className="header-icon-btn">
              <Bell size={20} />
              {chloeAtRisk && <span className="badge-dot"></span>}
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

          {/* ==================== 1. HOME DASHBOARD ==================== */}
          {activeTab === 'Dashboard' && (
            <div>
              <div className="page-header">
                <h1 className="page-title">Parent Dashboard</h1>
                <p className="page-subtitle">Monitoring academic standing and school activities for {chloe.name}.</p>
              </div>

              {isLoadingDashboard && (
                <div style={{ padding: '0.75rem 1rem', backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#2563eb', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', fontSize: '0.8rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.5rem' }} className="animate-pulse">
                  <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#2563eb' }} />
                  <span>Syncing student records with live school database...</span>
                </div>
              )}

              {/* Attendance Flag Warning */}
              {chloeAtRisk && (
                <div style={{
                  backgroundColor: 'var(--danger-bg)',
                  border: '1px solid var(--danger-text)',
                  padding: '1.25rem',
                  borderRadius: 'var(--radius-lg)',
                  marginBottom: '1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '1rem'
                }}>
                  <div className="flex align-center gap-3">
                    <div style={{
                      backgroundColor: 'rgba(239, 68, 68, 0.1)',
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--danger)'
                    }}>
                      <AlertTriangle size={20} />
                    </div>
                    <div>
                      <h4 style={{ color: 'var(--danger-text)', fontWeight: 700 }}>Attendance Risk Alert Dispatched</h4>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        Aarav S. has dropped to <strong>{chloeAttendanceRate}% attendance</strong> due to sick leaves. Grade Lead Swati Rao has requested parental feedback.
                      </p>
                    </div>
                  </div>
                  <button type="button" className="btn btn-primary" style={{ backgroundColor: 'var(--danger)' }} onClick={() => { setIsAIChatOpen(true); setIsAIChatMinimized(false); }}>
                    Resolve via AI Agent
                  </button>
                </div>
              )}

              {/* Today's Highlights & Metrics */}
              <div className="metrics-grid">
                <div className="metric-card">
                  <div className="metric-header">
                    <span>Student Snapshot</span>
                    <div className="metric-icon-wrapper">
                      <User size={16} />
                    </div>
                  </div>
                  <div className="metric-value" style={{ fontSize: '1.4rem', margin: '0.5rem 0' }}>{chloe.name}</div>
                  <div className="metric-subtext">Grade 10-A • Roll {chloe.roll}</div>
                </div>

                <div className="metric-card">
                  <div className="metric-header">
                    <span>Attendance Rate</span>
                    <div className="metric-icon-wrapper" style={{ 
                      backgroundColor: chloeAtRisk ? 'var(--danger-bg)' : 'var(--success-bg)', 
                      color: chloeAtRisk ? 'var(--danger)' : 'var(--success)' 
                    }}>
                      {chloeAtRisk ? <AlertTriangle size={16} /> : <CheckCircle2 size={16} />}
                    </div>
                  </div>
                  <div className="metric-value" style={{ color: chloeAtRisk ? 'var(--danger-text)' : 'inherit', margin: '0.5rem 0' }}>
                    {chloeAttendanceRate}%
                  </div>
                  <div className="metric-subtext">Minimum required: 80%</div>
                </div>

                <div className="metric-card">
                  <div className="metric-header">
                    <span>GPA Standing</span>
                    <div className="metric-icon-wrapper" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
                      <GraduationCap size={16} />
                    </div>
                  </div>
                  <div className="metric-value" style={{ margin: '0.5rem 0' }}>{gpaValue}</div>
                  <div className="metric-subtext">Standing: Outstanding (Top 10%)</div>
                </div>

                <div className="metric-card">
                  <div className="metric-header">
                    <span>Active Homework</span>
                    <div className="metric-icon-wrapper" style={{ backgroundColor: 'var(--warning-bg)', color: 'var(--warning)' }}>
                      <BookOpen size={16} />
                    </div>
                  </div>
                  <div className="metric-value" style={{ margin: '0.5rem 0' }}>{activeHomeworkVal}</div>
                  <div className="metric-subtext">Math exercise due Friday</div>
                </div>
              </div>

              {/* Roster / Snapshot & Highlights Panels */}
              <div className="dashboard-grid">
                <div className="dashboard-panel">
                  <div className="panel-header">
                    <h3 className="panel-title">Today's Highlights & Alerts</h3>
                  </div>
                  
                  <div className="flex flex-column gap-3" style={{ padding: '0.5rem 0' }}>
                    <div className="flex align-center gap-3" style={{ padding: '0.75rem', backgroundColor: 'var(--border-light)', borderRadius: 'var(--radius-md)' }}>
                      <AlertCircle size={20} style={{ color: 'var(--danger)' }} />
                      <div style={{ flexGrow: 1 }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block' }}>Attendance Flag Alert</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Aarav is marked absent today. A sick leave explanation has been requested by school.</span>
                      </div>
                      <span className="badge badge-danger">Today</span>
                    </div>

                    <div className="flex align-center gap-3" style={{ padding: '0.75rem', backgroundColor: 'var(--border-light)', borderRadius: 'var(--radius-md)' }}>
                      <Clock size={20} style={{ color: 'var(--warning)' }} />
                      <div style={{ flexGrow: 1 }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block' }}>Upcoming Assignment Due</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Math 'Quadratic Functions Exercises' is due this Friday, June 19.</span>
                      </div>
                      <span className="badge badge-warning">2 Days</span>
                    </div>

                    <div className="flex align-center gap-3" style={{ padding: '0.75rem', backgroundColor: 'var(--border-light)', borderRadius: 'var(--radius-md)' }}>
                      <Calendar size={20} style={{ color: 'var(--accent-purple)' }} />
                      <div style={{ flexGrow: 1 }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block' }}>Parent-Teacher Meeting Scheduled</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>PTM booked with Grade Lead Swati Rao on Friday at 3:30 PM.</span>
                      </div>
                      <span className="badge badge-purple">Confirmed</span>
                    </div>
                  </div>

                  <div className="panel-header" style={{ marginTop: '1rem' }}>
                    <h3 className="panel-title">Teacher Remarks Feed</h3>
                  </div>
                  <div className="flex flex-column gap-3">
                    {(dashboardData?.recentTeacherUpdates && Array.isArray(dashboardData.recentTeacherUpdates) && dashboardData.recentTeacherUpdates.length > 0
                      ? dashboardData.recentTeacherUpdates.map((update: any) => ({
                          teacher: update.teacherName || update.teacher?.name || "Teacher",
                          subject: update.subject || "General",
                          text: update.remark || update.text || update.message || "",
                          avatar: update.teacherAvatar || update.teacher?.avatarUrl || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&fit=crop",
                          time: update.time || update.date || "Recently"
                        }))
                      : [
                          { teacher: "Swati Rao", subject: "Mathematics", text: "Aarav is a bright student but has missed class lectures on Quadratic Equations. We need a support plan.", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&fit=crop", time: "Today" },
                          { teacher: "Rohan Mehta", subject: "Science / Physics", text: "Exceptional lab notes submitted for electromagnetism concepts. Keep up the enthusiasm!", avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&fit=crop", time: "Yesterday" },
                          { teacher: "Kavita Patel", subject: "Literature", text: "Aarav contributed insightfully to the group discussions regarding Shakespearean tragedies.", avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&fit=crop", time: "3 days ago" }
                        ]
                    ).map((rem: any, idx: number) => (
                      <div key={idx} className="flex gap-3 align-start" style={{ paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-light)' }}>
                        <InitialsAvatar name={rem.teacher} size={36} />
                        <div style={{ flexGrow: 1 }}>
                          <div className="flex justify-between align-center">
                            <h5 style={{ fontSize: '0.85rem', fontWeight: 700 }}>{rem.teacher} <span style={{ fontWeight: 400, color: 'var(--text-light)', fontSize: '0.75rem' }}>({rem.subject})</span></h5>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>{rem.time}</span>
                          </div>
                          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>"{rem.text}"</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-column gap-4">
                  {/* AI Insights panel */}
                  <div className="dashboard-panel" style={{ background: 'linear-gradient(135deg, var(--primary-light) 0%, #e8edff 100%)', borderColor: 'var(--primary-light-border)' }}>
                    <h3 className="panel-title" style={{ color: 'var(--primary)' }}>
                      <Sparkles size={18} />
                      <span>AI Student Insights</span>
                    </h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                      Aarav demonstrates outstanding analytical strengths in <strong>Physics (95%)</strong> and <strong>Math (92%)</strong>. However, his consecutive absences have flagged him at-risk in attendance. 
                    </p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                      We highly recommend aligning on a homework catch-up plan during the PTM with Ms. Rao scheduled this Friday at 3:30 PM.
                    </p>
                    <button type="button" className="btn btn-primary btn-block" style={{ marginTop: '0.25rem' }} onClick={() => setActiveTab('AI Assistant')}>
                      Launch AI Console
                    </button>
                  </div>

                  {/* School announcements */}
                  <div className="dashboard-panel">
                    <h3 className="panel-title">School Announcements</h3>
                    <div className="flex flex-column gap-3">
                      {announcementsData.slice(0, 2).map((ann) => (
                        <div key={ann.id} style={{ paddingBottom: '0.5rem' }}>
                          <span className="badge badge-info" style={{ marginBottom: '0.25rem' }}>{ann.date}</span>
                          <h4 style={{ fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' }} onClick={() => { setActiveTab('Inbox'); setInboxActiveTab('Announcements'); }}>{ann.title}</h4>
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>{ann.summary}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==================== 2. PROGRESS & ACADEMICS ==================== */}
          {activeTab === 'Progress' && (
            <div className="flex flex-column gap-6">
              <div className="page-header flex justify-between align-center" style={{ flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h1 className="page-title">Student Progress & Trends</h1>
                  <p className="page-subtitle">Visual tracking of Aarav's attendance patterns, performance scores, and conducts.</p>
                </div>
                <button
                  type="button"
                  className="btn btn-primary"
                  disabled={isDownloading}
                  onClick={() => {
                    setIsDownloading(true);
                    showFeedback("Preparing grade transcript PDF download...");
                    setTimeout(() => {
                      setIsDownloading(false);
                      showFeedback("✓ Grade report card downloaded successfully!");
                    }, 2000);
                  }}
                >
                  <Download size={16} />
                  <span>{isDownloading ? "Downloading..." : "Download Transcript"}</span>
                </button>
              </div>

              {/* Visual Grid for Trends */}
              <div className="grid grid-2 gap-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))' }}>
                {/* Attendance Trends */}
                <div className="dashboard-panel">
                  <h3 className="panel-title">Attendance Trends (June 2026)</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Visual review of Aarav's classroom registry status. Active sick absences are highlighted.</p>
                  
                  <div className="attendance-grid">
                    {[
                      { day: "Jun 12", status: "Present", color: "var(--success)" },
                      { day: "Jun 15", status: "Absent", color: "var(--danger)" },
                      { day: "Jun 16", status: "Present", color: "var(--success)" },
                      { day: "Jun 17", status: "Absent", color: "var(--danger)" },
                      { day: "Jun 18", status: "Absent", color: "var(--danger)" }
                    ].map((dayLog, i) => (
                      <div key={i} className="attendance-day-box">
                        <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>{dayLog.day}</span>
                        <div className="attendance-status-dot" style={{ backgroundColor: dayLog.color }}></div>
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>{dayLog.status}</span>
                      </div>
                    ))}
                  </div>

                  <div style={{ marginTop: '0.5rem', display: 'flex', gap: '1rem', fontSize: '0.75rem', borderTop: '1px solid var(--border-light)', paddingTop: '0.75rem' }}>
                    <div className="flex align-center gap-1">
                      <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'var(--success)' }}></div>
                      <span>Present (2 days)</span>
                    </div>
                    <div className="flex align-center gap-1">
                      <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'var(--danger)' }}></div>
                      <span>Absent (3 days)</span>
                    </div>
                  </div>
                </div>

                {/* Performance Trends */}
                <div className="dashboard-panel">
                  <h3 className="panel-title">Performance Trends (Subject Grade Bars)</h3>
                  <div className="flex flex-column gap-3" style={{ marginTop: '0.5rem' }}>
                    {[
                      { subject: "Science / Physics", val: 95, color: "var(--success)" },
                      { subject: "Mathematics", val: 92, color: "var(--primary)" },
                      { subject: "Chemistry", val: 90, color: "var(--warning)" },
                      { subject: "Literature", val: 88, color: "var(--accent-purple)" }
                    ].map((g, i) => (
                      <div key={i}>
                        <div className="flex justify-between" style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                          <span>{g.subject}</span>
                          <span>{g.val}%</span>
                        </div>
                        <div className="progress-bar-wrapper" style={{ height: '8px', backgroundColor: 'var(--border-color)', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{ width: `${g.val}%`, height: '100%', backgroundColor: g.color }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Behaviour Assessment & Assignment Status Panels */}
              <div className="grid grid-2 gap-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))' }}>
                <div className="dashboard-panel">
                  <h3 className="panel-title">Behaviour & Conduct Assessment</h3>
                  <div className="flex justify-between align-center" style={{ backgroundColor: 'var(--bg-sidebar)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                    <div>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block' }}>Conduct Rating</span>
                      <strong style={{ fontSize: '1.2rem', color: 'var(--success)' }}>Outstanding (A-)</strong>
                    </div>
                    <span className="badge badge-success">Excellent Student</span>
                  </div>

                  <div className="flex flex-column gap-2" style={{ marginTop: '0.5rem', fontSize: '0.8rem' }}>
                    <div style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--border-light)' }}>
                      <strong>Active Participation:</strong> Showcases enthusiastic engagement in science laboratory groups. Helpful to peers.
                    </div>
                    <div style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--border-light)' }}>
                      <strong>Classroom Focus:</strong> Occasionally distracted in Mathematics lectures. Grade lead recommends encouraging focus.
                    </div>
                  </div>
                </div>

                {/* Assignment status */}
                <div className="dashboard-panel">
                  <h3 className="panel-title">Assignment Submission Status</h3>
                  <div className="table-container">
                    <table className="custom-table" style={{ minWidth: 'auto' }}>
                      <thead>
                        <tr>
                          <th>Assignment</th>
                          <th>Subject</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td style={{ fontWeight: 600 }}>Quadratic Functions Exercises</td>
                          <td>Math</td>
                          <td><span className="badge badge-warning">In Progress</span></td>
                        </tr>
                        <tr>
                          <td style={{ fontWeight: 600 }}>Mechanics Lab Report 1</td>
                          <td>Physics</td>
                          <td><span className="badge badge-success">Graded (A)</span></td>
                        </tr>
                        <tr>
                          <td style={{ fontWeight: 600 }}>Shakespearean Essay Draft</td>
                          <td>Literature</td>
                          <td><span className="badge badge-success">Graded (B+)</span></td>
                        </tr>
                        <tr>
                          <td style={{ fontWeight: 600 }}>Stoichiometry Lab Worksheets</td>
                          <td>Chemistry</td>
                          <td><span className="badge badge-info">Submitted</span></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* AI Summary report */}
              <div className="dashboard-panel" style={{ backgroundColor: 'var(--bg-sidebar)', border: '1px dashed var(--primary-light-border)' }}>
                <h3 className="panel-title" style={{ color: 'var(--primary)' }}>
                  <Sparkles size={16} />
                  <span>AI Summary Performance Report</span>
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                  Aarav is performing at an exceptional level academically, maintaining a cumulative <strong>3.8 GPA</strong>. Her analytical capabilities in Science are in the top 10% of her cohort. Currently, the primary risk factor is her attendance drop to {chloeAttendanceRate}% due to viral flu absences. This has caused him to miss the core lectures on quadratic equations, resulting in his pending math homework status. 
                  <strong> Recommended action:</strong> Parents should review the shared algebra worksheet files in the portal and ensure attendance alignment with Swati Rao during the Friday 3:30 PM meeting.
                </p>
              </div>
            </div>
          )}

          {/* ==================== 3. INBOX & COMMUNICATIONS ==================== */}
          {activeTab === 'Inbox' && (
            <div className="flex flex-column gap-6">
              <div className="page-header">
                <h1 className="page-title">School Communication Center</h1>
                <p className="page-subtitle">Exchange messages with teachers, view announcements, and track communication history.</p>
              </div>

              <div className="inbox-layout">
                {/* Inbox Left Sidebar */}
                <div className="inbox-sidebar">
                  <div className="inbox-sidebar-header">
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 700 }}>Communication Folders</h4>
                  </div>
                  <div className="inbox-channels-list">
                    {[
                      { key: 'Teacher Messages', label: 'Teacher Messages', badge: 1 },
                      { key: 'Announcements', label: 'Announcements', badge: null },
                      { key: 'PTM Updates', label: 'PTM Updates', badge: null },
                      { key: 'Communication History', label: 'History log', badge: null }
                    ].map((ch) => (
                      <button
                        key={ch.key}
                        type="button"
                        className={`inbox-channel-btn ${inboxActiveTab === ch.key ? 'active' : ''}`}
                        onClick={() => setInboxActiveTab(ch.key)}
                      >
                        <span>{ch.label}</span>
                        {ch.badge && <span className="badge badge-danger" style={{ padding: '0.1rem 0.4rem', fontSize: '0.65rem' }}>{ch.badge}</span>}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Inbox Right Content Area */}
                <div className="inbox-main">
                  {/* Folder 1: Live Chat with Teachers */}
                  {inboxActiveTab === 'Teacher Messages' && (
                    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                      <div className="inbox-main-header">
                        <div className="flex align-center gap-2" style={{ width: '100%' }}>
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Chatting with:</span>
                          <select 
                            value={activeChatTeacher} 
                            onChange={(e) => setActiveChatTeacher(e.target.value)}
                            style={{ padding: '0.35rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', outline: 'none', fontWeight: 600, fontSize: '0.85rem' }}
                          >
                            <option value="Swati Rao">Swati Rao (Math - Grade Lead)</option>
                            <option value="Rohan Mehta">Rohan Mehta (Science/Physics)</option>
                            <option value="Kavita Patel">Kavita Patel (Literature)</option>
                          </select>
                        </div>
                      </div>

                      {/* Messaging pane */}
                      <div className="inbox-messages-pane">
                        {messagesWithTeachers[activeChatTeacher].map((msg: any) => (
                          <div key={msg.id} style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignSelf: msg.sender === 'parent' ? 'flex-end' : 'flex-start',
                            maxWidth: '75%',
                            gap: '0.2rem'
                          }}>
                            <div style={{
                              backgroundColor: msg.sender === 'parent' ? 'var(--primary)' : 'var(--portal-bg-card)',
                              color: msg.sender === 'parent' ? '#ffffff' : 'var(--text-primary)',
                              padding: '0.65rem 0.95rem',
                              borderRadius: msg.sender === 'parent' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                              boxShadow: 'var(--shadow-sm)',
                              fontSize: '0.8rem',
                              lineHeight: '1.4',
                              border: msg.sender === 'teacher' ? '1px solid var(--border-color)' : 'none'
                            }}>
                              {msg.text}
                            </div>
                            <span style={{ fontSize: '0.6rem', color: 'var(--text-light)', textAlign: msg.sender === 'parent' ? 'right' : 'left' }}>
                              {msg.time}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Chat composer input */}
                      <form onSubmit={handleSendTeacherMessage} className="inbox-composer">
                        <input
                          type="text"
                          className="form-input"
                          style={{ flexGrow: 1, borderRadius: 'var(--radius-full)' }}
                          placeholder={`Message Ms./Mr. ${activeChatTeacher.split(' ')[1]}...`}
                          value={composerText}
                          onChange={(e) => setComposerText(e.target.value)}
                        />
                        <button type="submit" className="btn btn-primary" style={{ padding: '0.5rem 1.25rem', borderRadius: 'var(--radius-full)' }}>
                          <Send size={14} />
                          <span>Send</span>
                        </button>
                      </form>
                    </div>
                  )}

                  {/* Folder 2: Announcements List */}
                  {inboxActiveTab === 'Announcements' && (
                    <div style={{ padding: '1.5rem', overflowY: 'auto', height: '100%', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: 700, borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>School Announcements Feed</h3>
                      {announcementsData.map((ann) => (
                        <div key={ann.id} style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1rem', backgroundColor: 'var(--bg-sidebar)' }}>
                          <div className="flex justify-between align-center" style={{ marginBottom: '0.5rem' }}>
                            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--primary)' }}>{ann.title}</h4>
                            <span className="badge badge-info">{ann.date}</span>
                          </div>
                          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>{ann.content}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Folder 3: PTM Updates */}
                  {inboxActiveTab === 'PTM Updates' && (
                    <div style={{ padding: '1.5rem', overflowY: 'auto', height: '100%', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: 700, borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>Scheduled Parent-Teacher Meetings</h3>
                      
                      <div className="flex flex-column gap-3">
                        <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--portal-bg-card)' }}>
                          <div>
                            <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 700, color: 'var(--accent-purple)' }}>Grade 10 Alignment</span>
                            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, margin: '0.15rem 0' }}>Swati Rao (Math & Grade Lead)</h4>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Date: <strong>Friday, June 19, 2026</strong> at <strong>3:30 PM</strong></p>
                          </div>
                          <button 
                            type="button" 
                            className="btn btn-outline" 
                            style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem' }}
                            onClick={() => showFeedback("PTM Virtual classroom link will open 5 minutes before scheduled slot.")}
                          >
                            Join Room
                          </button>
                        </div>

                        <div style={{ padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px dashed var(--border-color)', backgroundColor: 'var(--bg-sidebar)', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          <h5>PTM Policy Guidelines:</h5>
                          <ul style={{ paddingLeft: '1.2rem', marginTop: '0.35rem', lineHeight: '1.5' }}>
                            <li>Bookings should be confirmed at least 24 hours prior.</li>
                            <li>Virtual meetings are conducted securely inside the platform.</li>
                            <li>If you need to reschedule, notify the teacher via messaging chat.</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Folder 4: Communication History Log */}
                  {inboxActiveTab === 'Communication History' && (
                    <div style={{ padding: '1.5rem', overflowY: 'auto', height: '100%', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: 700, borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>School Contact Logs</h3>
                      
                      <div className="table-container">
                        <table className="custom-table">
                          <thead>
                            <tr>
                              <th>Date</th>
                              <th>Interaction Type</th>
                              <th>Log Summary</th>
                            </tr>
                          </thead>
                          <tbody>
                            {communicationHistory.map((hist, i) => (
                              <tr key={i}>
                                <td>{hist.date}</td>
                                <td><span className="badge badge-purple" style={{ textTransform: 'uppercase' }}>{hist.type}</span></td>
                                <td style={{ color: 'var(--text-secondary)' }}>{hist.desc}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ==================== 4. FINANCE & BILLING ==================== */}
          {activeTab === 'Finance' && (
            <div className="flex flex-column gap-6">
              <div className="page-header">
                <h1 className="page-title">Tuition & School Finance</h1>
                <p className="page-subtitle">Manage outstanding academic bills, complete transactions, and download official receipts.</p>
              </div>

              {/* Fee status layout */}
              <div className="grid grid-2 gap-6" style={{ gridTemplateColumns: '1.2fr 0.8fr' }}>
                
                {/* Outstanding balance card */}
                <div className="finance-bill-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 600 }}>Current Outstanding Balance</span>
                      <h2 style={{ fontSize: '2.3rem', fontWeight: 800, color: financePaid ? 'var(--success-text)' : 'var(--text-primary)', marginTop: '0.25rem' }}>
                        {financePaid ? "₹0.00" : "₹1,25,000"}
                      </h2>
                    </div>
                    <span className={`badge ${financePaid ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '0.85rem' }}>
                      {financePaid ? "PAID IN FULL" : "PENDING BILL"}
                    </span>
                  </div>

                  <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                    <h4 style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>Fee Breakdown Structure:</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8rem' }}>
                      <div className="flex justify-between">
                        <span style={{ color: 'var(--text-secondary)' }}>Academic Tuition (Term 3)</span>
                        <strong style={{ color: 'var(--text-primary)' }}>₹1,00,000</strong>
                      </div>
                      <div className="flex justify-between">
                        <span style={{ color: 'var(--text-secondary)' }}>Physics Laboratory Materials</span>
                        <strong style={{ color: 'var(--text-primary)' }}>₹15,000</strong>
                      </div>
                      <div className="flex justify-between">
                        <span style={{ color: 'var(--text-secondary)' }}>Student Council & Club Activities</span>
                        <strong style={{ color: 'var(--text-primary)' }}>₹10,000</strong>
                      </div>
                    </div>
                  </div>

                  {!financePaid && (
                    <button type="button" className="btn btn-primary" style={{ marginTop: '0.5rem' }} onClick={() => setShowPaymentModal(true)}>
                      <CreditCard size={16} />
                      <span>Pay Outstanding Fees (₹1,25,000)</span>
                    </button>
                  )}
                  {financePaid && (
                    <div style={{ color: 'var(--success-text)', backgroundColor: 'var(--success-bg)', padding: '0.75rem', borderRadius: 'var(--radius-md)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <CheckCircle2 size={16} />
                      <span>No outstanding payments remaining for Term 3. Thank you!</span>
                    </div>
                  )}
                </div>

                {/* Info and help widget */}
                <div className="dashboard-panel" style={{ justifyContent: 'center' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Payment Security</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                    All financial operations are processed via encrypted school gateways. Receipts are generated dynamically and saved for taxonomic tax submissions.
                  </p>
                  <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '0.75rem', marginTop: '0.5rem' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-light)', display: 'block' }}>Payment Support:</span>
                    <strong style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>registrar-billing@westview.edu</strong>
                  </div>
                </div>
              </div>

              {/* Folder 2: Payment History table */}
              <div className="dashboard-panel">
                <h3 className="panel-title">Payment History Logs</h3>
                <div className="table-container">
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>Transaction ID</th>
                        <th>Billing Description</th>
                        <th>Amount</th>
                        <th>Payment Date</th>
                        <th>Status</th>
                        <th>Invoice Receipt</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paymentTransactions.map((txn) => (
                        <tr key={txn.id}>
                          <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{txn.id}</td>
                          <td>{txn.desc}</td>
                          <td style={{ fontWeight: 700 }}>₹{txn.amount.toLocaleString('en-IN')}</td>
                          <td>{txn.date}</td>
                          <td><span className="badge badge-success">{txn.status}</span></td>
                          <td>
                            <button
                              type="button"
                              className="btn btn-outline"
                              style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
                              onClick={() => {
                                setSelectedReceipt({
                                  txnId: txn.id,
                                  desc: txn.desc,
                                  amount: txn.amount,
                                  date: txn.date,
                                  receiptId: txn.receipt
                                });
                                setShowReceiptModal(true);
                              }}
                            >
                              <FileText size={12} />
                              <span>View Receipt</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ==================== 5. AI ASSISTANT CONSOLE ==================== */}
          {activeTab === 'AI Assistant' && (
            <div className="flex flex-column gap-6">
              <div className="page-header flex justify-between align-center">
                <div>
                  <h1 className="page-title">AI Assistant Center</h1>
                  <p className="page-subtitle">Run targeted NLP search models and query biological, academic, or policy records.</p>
                </div>
                <button type="button" className="btn btn-primary" onClick={() => { setIsAIChatOpen(true); setIsAIChatMinimized(false); }}>
                  <MessageCircle size={16} />
                  <span>Open Floating Agent</span>
                </button>
              </div>

              {/* Categorized shortcut grid */}
              <div className="ai-console-grid">
                {[
                  { type: 'performance', label: 'Performance Analysis', desc: 'Examine student grades, strengths, weaknesses, and academic standing.' },
                  { type: 'attendance', label: 'Attendance Queries', desc: 'Query class registry flags, risk statistics, and health records.' },
                  { type: 'ptm', label: 'PTM Booking Details', desc: 'Access active bookings, schedule meetings, and join virtual rooms.' },
                  { type: 'calendar', label: 'Academic Calendar', desc: 'Fetch dates for homework submissions, exams, and holidays.' },
                  { type: 'policy', label: 'School Policy Queries', desc: 'Lookup rules on uniforms, locker safety, and cellular usage.' },
                  { type: 'fees', label: 'Fee and Tuition Queries', desc: 'Check due billing balances, receipts, and payment deadlines.' }
                ].map((item) => (
                  <div 
                    key={item.type} 
                    className={`ai-query-card ${selectedAIQueryType === item.type ? 'active' : ''}`}
                    onClick={() => handleExecuteAIQuery(item.type)}
                    style={{
                      borderColor: selectedAIQueryType === item.type ? 'var(--primary)' : 'var(--border-color)',
                      backgroundColor: selectedAIQueryType === item.type ? 'var(--primary-light)' : 'var(--portal-bg-card)'
                    }}
                  >
                    <div className="ai-query-icon-wrapper">
                      <Sparkles size={16} />
                    </div>
                    <div>
                      <h4 style={{ fontSize: '0.85rem', fontWeight: 700 }}>{item.label}</h4>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Query Result Pane */}
              {selectedAIQueryType && (
                <div className="dashboard-panel" style={{ marginTop: '1rem', border: '1px solid var(--primary-light-border)', animation: 'slideUp 0.3s ease-out' }}>
                  <div className="panel-header">
                    <h3 className="panel-title" style={{ color: 'var(--primary)' }}>
                      <Sparkles size={16} />
                      <span>AI Model Response - {selectedAIQueryType.toUpperCase()}</span>
                    </h3>
                    <button type="button" className="btn btn-outline" style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem' }} onClick={() => { setSelectedAIQueryType(null); setAiQueryResult(null); }}>
                      Clear
                    </button>
                  </div>

                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                    {aiQueryResult === "Processing query..." ? (
                      <div className="flex align-center gap-2">
                        <div className="ai-badge-dot" style={{ animation: 'pulse-glow 1s infinite' }}></div>
                        <span>Processing academic records...</span>
                      </div>
                    ) : (
                      <div className="flex flex-column gap-3">
                        {aiQueryResult?.summary && <p>{aiQueryResult.summary}</p>}
                        
                        {/* Custom fields for Performance */}
                        {selectedAIQueryType === 'performance' && aiQueryResult?.grades && (
                          <div style={{ backgroundColor: 'var(--bg-sidebar)', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
                            {aiQueryResult.grades.map((g: any, idx: number) => (
                              <div key={idx} className="flex justify-between" style={{ padding: '0.25rem 0' }}>
                                <span>{g.sub}:</span>
                                <strong>{g.val}</strong>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Custom fields for Calendar */}
                        {selectedAIQueryType === 'calendar' && aiQueryResult?.events && (
                          <div className="flex flex-column gap-2">
                            {aiQueryResult.events.map((evt: any, idx: number) => (
                              <div key={idx} style={{ padding: '0.5rem', backgroundColor: 'var(--bg-sidebar)', borderRadius: 'var(--radius-sm)', display: 'flex', gap: '1rem' }}>
                                <strong style={{ color: 'var(--primary)' }}>{evt.date}</strong>
                                <span>{evt.label}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Custom fields for Policies */}
                        {selectedAIQueryType === 'policy' && aiQueryResult && (
                          <div>
                            <div style={{ marginBottom: '0.5rem' }}>
                              <strong>Uniform Rules:</strong>
                              <p style={{ marginTop: '0.15rem' }}>{aiQueryResult.uniform}</p>
                            </div>
                            <div>
                              <strong>Device Rules:</strong>
                              <p style={{ marginTop: '0.15rem' }}>{aiQueryResult.cellphone}</p>
                            </div>
                          </div>
                        )}

                        {/* Custom fields for Fees */}
                        {selectedAIQueryType === 'fees' && aiQueryResult && (
                          <div style={{ backgroundColor: 'var(--bg-sidebar)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
                            <div className="flex justify-between" style={{ paddingBottom: '0.25rem' }}>
                              <span>Outstanding Fees:</span>
                              <strong>{aiQueryResult.outstanding}</strong>
                            </div>
                            <div className="flex justify-between" style={{ paddingBottom: '0.25rem' }}>
                              <span>Due Date:</span>
                              <strong>{aiQueryResult.due}</strong>
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-light)', borderTop: '1px solid var(--border-color)', paddingTop: '0.25rem', marginTop: '0.25rem' }}>
                              Breakdown: {aiQueryResult.breakdown}
                            </div>
                          </div>
                        )}

                        {aiQueryResult?.actionable && (
                          <div style={{ color: 'var(--success-text)', backgroundColor: 'var(--success-bg)', padding: '0.75rem', borderRadius: 'var(--radius-md)', fontSize: '0.8rem', fontWeight: 600 }}>
                            Recommendation: {aiQueryResult.actionable}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ==================== 6. CALENDAR & SCHEDULE ==================== */}
          {activeTab === 'Schedule' && (
            <div className="flex flex-column gap-6">
              <div className="page-header">
                <h1 className="page-title">School Schedule & Calendar</h1>
                <p className="page-subtitle">June 2026 academic timeline and booked events.</p>
              </div>

              <div className="dashboard-grid">
                {/* Monthly calendar */}
                <div className="dashboard-panel">
                  <div className="calendar-month-header" style={{ flexWrap: 'wrap', gap: '0.5rem' }}>
                    <h3 style={{ fontSize: '1.25rem' }}>June 2026</h3>
                    <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                      {[
                        { key: 'all', label: 'All' },
                        { key: 'exam', label: 'Exams' },
                        { key: 'meeting', label: 'Meetings' },
                        { key: 'holiday', label: 'Holidays' },
                      ].map((f) => (
                        <button
                          key={f.key}
                          type="button"
                          className="btn btn-outline"
                          style={{
                            padding: '0.35rem 0.75rem',
                            fontSize: '0.75rem',
                            borderRadius: 'var(--radius-full)',
                            backgroundColor: calendarFilter === f.key ? 'var(--primary-light)' : 'transparent',
                            color: calendarFilter === f.key ? 'var(--primary)' : 'inherit',
                            borderColor: calendarFilter === f.key ? 'var(--primary-light-border)' : 'var(--border-color)'
                          }}
                          onClick={() => {
                            setCalendarFilter(f.key);
                            setSelectedDayEvents(null);
                          }}
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="calendar-container">
                    <div className="calendar-days-grid">
                      {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((wd, i) => (
                        <div key={i} className="calendar-weekday">{wd}</div>
                      ))}
                      
                      {Array.from({ length: 30 }, (_, i) => {
                        const dayNum = i + 1;
                        const dayEvents = calendarEvents.filter(
                          (e) => e.day === dayNum && (calendarFilter === 'all' || e.type === calendarFilter)
                        );
                        const isToday = dayNum === 17; // mock today as June 17, 2026
                        return (
                          <div
                            key={dayNum}
                            className={`calendar-day-cell ${isToday ? 'today' : ''}`}
                            onClick={() => {
                              setSelectedDayEvents(dayEvents.length > 0 ? dayEvents : null);
                            }}
                          >
                            <span className="calendar-day-number" style={{ color: isToday ? 'var(--primary)' : 'inherit' }}>
                              {dayNum}
                            </span>
                            {dayEvents.length > 0 && (
                              <div className="calendar-event-indicator-container">
                                {dayEvents.map((evt, idx) => (
                                  <div
                                    key={idx}
                                    className="calendar-event-indicator"
                                    style={{ backgroundColor: evt.color }}
                                    title={evt.title}
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Day events or general schedule timeline */}
                <div className="flex flex-column gap-4">
                  <div className="dashboard-panel">
                    <h3 className="panel-title">
                      {selectedDayEvents ? "Selected Day Events" : "Upcoming Schedule Timeline"}
                    </h3>
                    
                    <div className="timeline-list">
                      {(selectedDayEvents || calendarEvents).map((evt, idx) => (
                        <div key={idx} className="timeline-card" style={{ borderLeftColor: evt.color }}>
                          <div className="timeline-card-content">
                            <span className="timeline-card-title">{evt.title}</span>
                            <span className="timeline-card-time">
                              <strong>June {evt.day}</strong> • {evt.desc}
                            </span>
                          </div>
                          {evt.link && (
                            <button
                              type="button"
                              className="btn btn-outline"
                              style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem' }}
                              onClick={() => showFeedback("PTM Virtual classroom link will open 5 minutes before scheduled slot.")}
                            >
                              Join
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    {selectedDayEvents && (
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => setSelectedDayEvents(null)}
                        style={{ marginTop: '0.5rem', alignSelf: 'flex-start', padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
                      >
                        Show All Events
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==================== 7. PORTAL SETTINGS ==================== */}
          {activeTab === 'Settings' && (
            <div className="dashboard-panel flex flex-column gap-4">
              <h3 className="panel-title">Portal Settings</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                Manage notification settings, portal appearance, and account credentials.
              </p>
              
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
                <h4 style={{ marginBottom: '0.5rem', fontSize: '0.95rem' }}>Outreach & Alerts Configuration</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                    <input type="checkbox" defaultChecked />
                    <span>Send SMS alerts immediately for critical attendance drops (below 80%)</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                    <input type="checkbox" defaultChecked />
                    <span>Email daily daily digests of academic tasks & homework assignments</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                    <input type="checkbox" />
                    <span>Auto-schedule PTM requests from teacher portals if conflicts arise</span>
                  </label>
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem', display: 'flex', gap: '0.5rem' }}>
                <button type="button" className="btn btn-primary" onClick={() => showFeedback("Settings updated successfully!")}>
                  Save Settings
                </button>
                <button type="button" className="btn btn-outline" onClick={() => setActiveTab('Dashboard')}>
                  Cancel
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Floating AI Chatbot Widget */}
      {isAIChatOpen && (
        <div className={`floating-ai-chat ${isAIChatMinimized ? 'minimized' : ''}`}>
          {/* Header */}
          <div className="floating-chat-header" onClick={() => setIsAIChatMinimized(prev => !prev)}>
            <div className="floating-chat-header-info">
              <Sparkles size={16} />
              <h4>AI Assistant</h4>
              <span className="badge-dot" style={{ backgroundColor: 'var(--success)', width: 8, height: 8, borderRadius: '50%', display: 'inline-block' }}></span>
            </div>
            <div className="floating-chat-header-actions" onClick={(e) => e.stopPropagation()}>
              <button 
                type="button" 
                className="floating-chat-action-btn"
                onClick={() => setIsAIChatMinimized(prev => !prev)}
                title={isAIChatMinimized ? "Expand" : "Minimize"}
              >
                {isAIChatMinimized ? <ChevronDown size={14} style={{ transform: 'rotate(180deg)' }} /> : <Minus size={14} />}
              </button>
              <button 
                type="button" 
                className="floating-chat-action-btn"
                onClick={() => setIsAIChatOpen(false)}
                title="Close"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Body */}
          {!isAIChatMinimized && (
            <div className="floating-chat-body">
              {/* Messages */}
              <div className="floating-chat-messages">
                {messages.map((msg: any) => (
                  <div key={msg.id} style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: '85%',
                    gap: '0.25rem'
                  }}>
                    <div style={{
                      backgroundColor: msg.sender === 'user' ? 'var(--primary)' : 'var(--portal-bg-card)',
                      color: msg.sender === 'user' ? '#ffffff' : 'var(--text-primary)',
                      padding: '0.65rem 0.95rem',
                      borderRadius: msg.sender === 'user' ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                      boxShadow: 'var(--shadow-sm)',
                      whiteSpace: 'pre-wrap',
                      fontSize: '0.8rem',
                      lineHeight: '1.4',
                      border: msg.sender === 'ai' ? '1px solid var(--border-color)' : 'none'
                    }}>
                      {msg.text}

                      {/* Render action button in AI response */}
                      {msg.action && (
                        <div style={{ marginTop: '0.5rem', borderTop: '1px solid var(--border-light)', paddingTop: '0.5rem' }}>
                          {msg.action === 'send_email' && (
                            <button 
                              type="button" 
                              className="btn btn-primary" 
                              style={{ padding: '0.3rem 0.75rem', fontSize: '0.7rem' }}
                              onClick={() => handleActionClick('send_email')}
                            >
                              <Send size={10} />
                              <span>Send to Swati Rao</span>
                            </button>
                          )}
                          {msg.action === 'schedule_ptm' && (
                            <button 
                              type="button" 
                              className="btn btn-primary" 
                              style={{ padding: '0.3rem 0.75rem', fontSize: '0.7rem' }}
                              onClick={() => handleActionClick('schedule_ptm')}
                            >
                              <span>Book Friday 3:30 PM Slot</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                    <span style={{ 
                      fontSize: '0.6rem', 
                      color: 'var(--text-light)', 
                      textAlign: msg.sender === 'user' ? 'right' : 'left'
                    }}>{msg.time}</span>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              {/* Suggestions pills */}
              <div className="floating-chat-suggestions">
                <span>Suggestions</span>
                <div className="floating-chat-suggestions-list">
                  {[
                    "Why is Aarav flagged?",
                    "What is Aarav's math homework?",
                    "Draft an email to Swati Rao",
                    "What is uniform policy?",
                    "Schedule a PTM",
                    "What is my due fee?"
                  ].map((phrase, i) => (
                    <button 
                      key={i} 
                      type="button" 
                      className="floating-chat-pill"
                      onClick={() => handleSendMessage(phrase)}
                    >
                      {phrase}
                    </button>
                  ))}
                </div>
              </div>

              {/* Input Form */}
              <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(inputVal); }} className="floating-chat-input-form">
                <input 
                  type="text" 
                  className="floating-chat-input" 
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  placeholder="Ask AI assistant..."
                />
                <button type="submit" className="floating-chat-send-btn">
                  <Send size={14} />
                </button>
              </form>
            </div>
          )}
        </div>
      )}

      {/* Floating Chat Bubble Action Button */}
      {!isAIChatOpen && (
        <button 
          type="button" 
          className="floating-chat-bubble-btn"
          onClick={() => {
            setIsAIChatOpen(true);
            setIsAIChatMinimized(false);
          }}
          title="Open AI Assistant"
        >
          <Sparkles size={24} className="ai-glow-icon" />
        </button>
      )}

      {/* ==================== MODAL 1: CHECKOUT MODAL ==================== */}
      {showPaymentModal && (
        <div className="portal-modal-backdrop" onClick={() => setShowPaymentModal(false)}>
          <div className="portal-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between align-center" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Secure Tuition Payment</h3>
              <button type="button" className="btn btn-outline" style={{ padding: '0.25rem', borderRadius: '50%' }} onClick={() => setShowPaymentModal(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleProcessPayment} className="flex flex-column gap-3">
              <div style={{ backgroundColor: 'var(--primary-light)', padding: '0.75rem', borderRadius: 'var(--radius-md)', fontSize: '0.8rem', border: '1px solid var(--primary-light-border)' }}>
                <span>Paying outstanding balance for Aarav Sharma:</span>
                <strong style={{ display: 'block', fontSize: '1.2rem', color: 'var(--primary)', marginTop: '0.15rem' }}>₹1,25,000</strong>
              </div>

              <div className="form-group">
                <label>Cardholder Name</label>
                <input type="text" className="form-input" required defaultValue="Rajesh Sharma" />
              </div>

              <div className="form-group">
                <label>Card Number</label>
                <div style={{ position: 'relative' }}>
                  <input type="text" className="form-input w-full" style={{ paddingRight: '2.5rem' }} required placeholder="•••• •••• •••• 4242" defaultValue="4111 1111 1111 4242" />
                  <CreditCard size={18} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
                </div>
              </div>

              <div className="grid grid-2 gap-3">
                <div className="form-group">
                  <label>Expiry Date</label>
                  <input type="text" className="form-input" required placeholder="MM/YY" defaultValue="12/28" />
                </div>
                <div className="form-group">
                  <label>CVV / CVC</label>
                  <input type="password" className="form-input" required placeholder="•••" defaultValue="123" />
                </div>
              </div>

              <button type="submit" className="btn btn-primary w-full" style={{ marginTop: '0.5rem' }} disabled={paymentLoading}>
                {paymentLoading ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div className="ai-badge-dot" style={{ animation: 'pulse-glow 0.8s infinite' }}></div>
                    <span>Authorizing transaction...</span>
                  </div>
                ) : (
                  <span>Confirm Secure Payment (₹1,25,000)</span>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ==================== MODAL 2: RECEIPT MODAL ==================== */}
      {showReceiptModal && selectedReceipt && (
        <div className="portal-modal-backdrop" onClick={() => setShowReceiptModal(false)}>
          <div className="portal-modal-content" style={{ maxWidth: '550px' }} onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between align-center" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Official Tuition Receipt</h3>
              <button type="button" className="btn btn-outline" style={{ padding: '0.25rem', borderRadius: '50%' }} onClick={() => setShowReceiptModal(false)}>
                <X size={16} />
              </button>
            </div>

            <div className="receipt-sheet">
              <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                <h4 style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Westview International School</h4>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-light)' }}>100 Academic Blvd, SF, CA</p>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-light)' }}>Phone: (555) 019-2834</p>
              </div>

              <div className="receipt-divider"></div>

              <div className="receipt-row">
                <span>Receipt Number:</span>
                <strong>{selectedReceipt.receiptId}</strong>
              </div>
              <div className="receipt-row">
                <span>Transaction Ref:</span>
                <strong>{selectedReceipt.txnId}</strong>
              </div>
              <div className="receipt-row">
                <span>Payment Date:</span>
                <strong>{selectedReceipt.date}</strong>
              </div>
              <div className="receipt-row">
                <span>Student Name:</span>
                <strong>Aarav Sharma (Grade 10-A)</strong>
              </div>
              <div className="receipt-row">
                <span>Payee Name:</span>
                <strong>Rajesh Sharma</strong>
              </div>

              <div className="receipt-divider"></div>

              <div className="receipt-row" style={{ fontWeight: 600 }}>
                <span>Item Description</span>
                <span>Amount Paid</span>
              </div>
              <div className="receipt-row">
                <span>{selectedReceipt.desc}</span>
                <span>₹{selectedReceipt.amount.toLocaleString('en-IN')}</span>
              </div>

              <div className="receipt-divider"></div>

              <div className="receipt-row" style={{ fontSize: '1rem', fontWeight: 800 }}>
                <span>TOTAL PAID:</span>
                <span>₹{selectedReceipt.amount.toLocaleString('en-IN')}</span>
              </div>

              <div className="receipt-divider"></div>

              <div style={{ textAlign: 'center', fontSize: '0.7rem', color: 'var(--text-light)', marginTop: '0.5rem' }}>
                Thank you for supporting your child's education at Westview.
                <br />
                *This is an electronically generated receipt.*
              </div>
            </div>

            <div className="flex gap-2" style={{ marginTop: '1.25rem', justifyContent: 'flex-end' }}>
              <button 
                type="button" 
                className="btn btn-outline"
                onClick={() => {
                  showFeedback("Receipt download triggered. Check your device's downloads.");
                  setShowReceiptModal(false);
                }}
              >
                <Download size={14} />
                <span>Download PDF</span>
              </button>
              <button type="button" className="btn btn-primary" onClick={() => window.print()}>
                <span>Print Invoice</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

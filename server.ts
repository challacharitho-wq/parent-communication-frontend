import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

// Polyfills for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: 'parent' | 'teacher' | 'management';
  title?: string;
  school?: string;
  avatarUrl: string;
  childName?: string;
  childRoll?: string;
  subject?: string;
  createdAt: string;
}

interface Student {
  id: string;
  roll: string;
  name: string;
  grade: string;
  initials: string;
  color: string;
  status: 'VERIFIED' | 'PENDING';
  addedBy: string;
  added: string;
  attendance: number;
  gpa: string;
  parentEmail?: string;
  history?: string[];
}

interface SystemLog {
  id: string;
  text: string;
  time: string;
  iconType: string;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Dynamic In-Memory Databases (Real persistence for session life)
  const SESSIONS: Record<string, any> = {};

  const USERS_DB: User[] = [
    {
      id: 'usr_admin_1',
      name: 'Dr. Alistair Vance',
      email: 'admin@school.edu',
      password: 'password123',
      role: 'management',
      title: 'Principal Administrator',
      school: 'Westview Academy',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&fit=crop&q=80'
    },
    {
      id: 'usr_teacher_1',
      name: 'Sarah Jenkins',
      email: 'sarah.jenkins@school.edu',
      password: 'password123',
      role: 'teacher',
      title: 'Grade 10 Lead • Mathematics',
      school: 'Westview Academy',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&fit=crop&q=80',
      subject: 'Mathematics'
    },
    {
      id: 'usr_parent_1',
      name: 'Robert Miller',
      email: 'parent.chloe@school.edu',
      password: 'password123',
      role: 'parent',
      title: 'Parent of Chloe Miller',
      childName: 'Chloe Miller',
      childRoll: '02',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&fit=crop&q=80'
    },
    {
      id: 'usr_parent_2',
      name: 'Maya Verma',
      email: 'parent.arjun@school.edu',
      password: 'password123',
      role: 'parent',
      title: 'Parent of Arjun Verma',
      childName: 'Arjun Verma',
      childRoll: '01',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&fit=crop&q=80'
    }
  ];

  const STUDENTS_DB: Student[] = [
    { id: 'st_1', roll: '01', name: 'Arjun Verma', grade: 'Grade 10', initials: 'AV', color: '#111111', status: 'VERIFIED', addedBy: 'Registrar', added: '2 days ago', attendance: 98, gpa: '3.90', parentEmail: 'parent.arjun@school.edu', history: ['P', 'P', 'P', 'P', 'P'] },
    { id: 'st_2', roll: '02', name: 'Chloe Miller', grade: 'Grade 10', initials: 'CM', color: '#666666', status: 'VERIFIED', addedBy: 'Registrar', added: '5h ago', attendance: 94, gpa: '3.85', parentEmail: 'parent.chloe@school.edu', history: ['P', 'A', 'P', 'P', 'P'] },
    { id: 'st_3', roll: '03', name: 'Dev Patel', grade: 'Grade 10', initials: 'DP', color: '#888888', status: 'VERIFIED', addedBy: 'Registrar', added: 'Yesterday', attendance: 92, gpa: '3.65', parentEmail: 'parent.dev@school.edu', history: ['P', 'L', 'P', 'P', 'P'] },
    { id: 'st_4', roll: '04', name: 'Ananya Kapoor', grade: 'Grade 10', initials: 'AK', color: '#333333', status: 'VERIFIED', addedBy: 'Registrar', added: '3 days ago', attendance: 99, gpa: '3.95', parentEmail: 'parent.ananya@school.edu', history: ['P', 'P', 'P', 'P', 'P'] }
  ];

  const SYSTEM_LOGS: SystemLog[] = [
    { id: 'log_1', text: 'System pre-loaded 24 academic records from registrar database.', time: 'Today at 08:30 AM', iconType: 'users' },
    { id: 'log_2', text: 'Westview Academy newsletter scheduled for automatic dispatch.', time: 'Today at 09:00 AM', iconType: 'megaphone' },
    { id: 'log_3', text: 'AI Agent synthesized personalized homework briefings for parents.', time: 'Today at 10:15 AM', iconType: 'sparkles' }
  ];

  let LATEST_ANNOUNCEMENT = 'Dr. Vance announced that the annual Science Symposium is scheduled for July 15.';

  // Helper: Get session token from cookie
  const getSessionToken = (req: express.Request): string | null => {
    const cookieHeader = req.headers.cookie;
    if (!cookieHeader) return null;
    const match = cookieHeader.match(/(^|;\s*)session_token=([^;]*)/);
    return match ? decodeURIComponent(match[2]) : null;
  };

  // Lazy initialize Gemini AI client
  let geminiClient: GoogleGenAI | null = null;
  const getGeminiClient = (): GoogleGenAI | null => {
    if (!geminiClient) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (apiKey) {
        try {
          geminiClient = new GoogleGenAI({
            apiKey: apiKey,
            httpOptions: {
              headers: {
                'User-Agent': 'aistudio-build',
              }
            }
          });
          console.log("Gemini Client initialized successfully with API key.");
        } catch (err) {
          console.error("Failed to initialize Gemini Client:", err);
        }
      } else {
        console.warn("GEMINI_API_KEY not found in environment. Chat will use fallback responses.");
      }
    }
    return geminiClient;
  };

  // ==================== AUTHENTICATION ENDPOINTS ====================

  // POST: Sign In
  app.post('/api/auth/sign-in/email', (req, res) => {
    const { email, password } = req.body;
    console.log(`[API] Sign In Request: ${email}`);

    // Look up user in dynamic database
    const userToLogin = USERS_DB.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);

    if (!userToLogin) {
      return res.status(401).json({ error: 'Invalid credentials. Please double-check your email and password.' });
    }

    // Generate Session ID
    const sessionToken = `sess_${Math.random().toString(36).substr(2, 9)}_${Date.now()}`;
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    const sessionObj = {
      id: `session_${Math.random().toString(36).substr(2, 9)}`,
      userId: userToLogin.id,
      token: sessionToken,
      expiresAt,
      ipAddress: req.ip || '127.0.0.1',
      userAgent: req.headers['user-agent'] || 'Unknown',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Store session
    SESSIONS[sessionToken] = {
      user: { ...userToLogin },
      session: sessionObj
    };

    // Set cookie
    res.setHeader(
      'Set-Cookie',
      `session_token=${sessionToken}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${24 * 60 * 60}`
    );

    console.log(`[API] Sign In Successful: ${userToLogin.name} (Role: ${userToLogin.role})`);
    
    // Log login activity
    SYSTEM_LOGS.unshift({
      id: `log_${Date.now()}`,
      text: `${userToLogin.name} successfully logged into the ${userToLogin.role} dashboard.`,
      time: 'Just now',
      iconType: 'users'
    });

    return res.json({
      user: userToLogin,
      session: sessionObj
    });
  });

  // GET: Get active Session
  app.get('/api/auth/get-session', (req, res) => {
    const token = getSessionToken(req);
    if (token && SESSIONS[token]) {
      // Fetch latest user info from DB in case role/metadata was modified
      const currentDbUser = USERS_DB.find(u => u.id === SESSIONS[token].user.id);
      if (currentDbUser) {
        SESSIONS[token].user = currentDbUser;
      }
      return res.json(SESSIONS[token]);
    }
    return res.json(null);
  });

  // POST: Sign Out
  app.post('/api/auth/sign-out', (req, res) => {
    const token = getSessionToken(req);
    if (token) {
      delete SESSIONS[token];
    }
    res.setHeader(
      'Set-Cookie',
      'session_token=; Path=/; HttpOnly; SameSite=Lax; Expires=Thu, 01 Jan 1970 00:00:00 GMT'
    );
    console.log('[API] User signed out.');
    return res.json({ success: true });
  });

  // ==================== SYSTEM LOG ENDPOINTS ====================
  app.get('/api/system/logs', (req, res) => {
    return res.json(SYSTEM_LOGS);
  });

  app.post('/api/system/logs', (req, res) => {
    const { text, iconType } = req.body;
    if (!text) return res.status(400).json({ error: 'Text is required' });
    
    const newLog: SystemLog = {
      id: `log_${Date.now()}`,
      text,
      time: 'Just now',
      iconType: iconType || 'sparkles'
    };
    SYSTEM_LOGS.unshift(newLog);
    return res.json(newLog);
  });

  // ==================== ADMIN / MANAGEMENT ENDPOINTS ====================

  // GET: All Users list (Teachers and Parents)
  app.get('/api/admin/users', (req, res) => {
    // Only return users who are not Admin for list views, hide password
    const safeUsers = USERS_DB.map(({ password, ...u }) => u);
    return res.json(safeUsers);
  });

  // POST: Register New User (Teacher/Parent)
  app.post('/api/admin/users', (req, res) => {
    const { name, email, password, role, title, subject, childName } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'Name, email, password and role are required' });
    }

    if (USERS_DB.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      return res.status(400).json({ error: 'A user with this email address already exists.' });
    }

    const newUser: User = {
      id: `usr_${role}_${Date.now()}`,
      name,
      email,
      password,
      role,
      title: title || (role === 'teacher' ? `Grade 10 • ${subject || 'Instructor'}` : `Parent of ${childName || 'Student'}`),
      school: 'Westview Academy',
      avatarUrl: role === 'teacher' 
        ? 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&fit=crop&q=80' 
        : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&fit=crop&q=80',
      subject,
      childName,
      createdAt: new Date().toISOString()
    };

    USERS_DB.push(newUser);

    // Dynamic Linking: If adding parent, auto link or create the student
    if (role === 'parent' && childName) {
      const studentMatch = STUDENTS_DB.find(st => st.name.toLowerCase() === childName.toLowerCase());
      if (studentMatch) {
        studentMatch.parentEmail = email;
        newUser.childRoll = studentMatch.roll;
      } else {
        // Auto create student
        const roll = String(STUDENTS_DB.length + 1).padStart(2, '0');
        const initials = childName.split(' ').map((n: string) => n[0]).join('').toUpperCase();
        const colors = ['#111111', '#555555', '#777777', '#333333'];
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        STUDENTS_DB.push({
          id: `st_${Date.now()}`,
          roll,
          name: childName,
          grade: 'Grade 10',
          initials,
          color,
          status: 'VERIFIED',
          addedBy: 'Admin Register',
          added: 'Just now',
          attendance: 98,
          gpa: '3.80',
          parentEmail: email,
          history: ['P', 'P', 'P', 'P', 'P']
        });
        newUser.childRoll = roll;
      }
    }

    // Log the user registration
    SYSTEM_LOGS.unshift({
      id: `log_${Date.now()}`,
      text: `Dr. Vance registered new ${role}: ${name} (${email}).`,
      time: 'Just now',
      iconType: 'users'
    });

    return res.json({ success: true, user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role } });
  });

  // GET: All Student Records
  app.get('/api/admin/students', (req, res) => {
    return res.json(STUDENTS_DB);
  });

  // POST: Admin Approve/Reject Student Record
  app.post('/api/admin/students/approve', (req, res) => {
    const { studentId, approve } = req.body;
    const student = STUDENTS_DB.find(st => st.id === studentId);
    
    if (!student) {
      return res.status(404).json({ error: 'Student profile not found.' });
    }

    if (approve) {
      student.status = 'VERIFIED';
      SYSTEM_LOGS.unshift({
        id: `log_${Date.now()}`,
        text: `Dr. Vance approved registration request for student: ${student.name} (${student.grade}).`,
        time: 'Just now',
        iconType: 'users'
      });
    } else {
      const idx = STUDENTS_DB.findIndex(st => st.id === studentId);
      if (idx !== -1) STUDENTS_DB.splice(idx, 1);
      SYSTEM_LOGS.unshift({
        id: `log_${Date.now()}`,
        text: `Dr. Vance declined registration request for student: ${student.name}.`,
        time: 'Just now',
        iconType: 'users'
      });
    }

    return res.json({ success: true });
  });

  // POST: Create System Announcement
  app.post('/api/admin/announce', (req, res) => {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'Announcement message is empty' });

    LATEST_ANNOUNCEMENT = text;
    SYSTEM_LOGS.unshift({
      id: `log_${Date.now()}`,
      text: `Admin broadcasted campus wide alert: "${text.substring(0, 50)}..."`,
      time: 'Just now',
      iconType: 'megaphone'
    });

    return res.json({ success: true, text });
  });

  app.get('/api/admin/announcement', (req, res) => {
    return res.json({ text: LATEST_ANNOUNCEMENT });
  });

  // ==================== TEACHER PORTAL ENDPOINTS ====================

  // GET: Teacher Dashboard Data (Roster, Stats)
  app.get('/api/teacher/dashboard', (req, res) => {
    const activeStudents = STUDENTS_DB.filter(st => st.status === 'VERIFIED');
    const pendingStudents = STUDENTS_DB.filter(st => st.status === 'PENDING');
    
    const classAttendanceRate = activeStudents.length 
      ? Math.round(activeStudents.reduce((acc, curr) => acc + curr.attendance, 0) / activeStudents.length) 
      : 96;

    return res.json({
      stats: {
        activeStudents: activeStudents.length,
        classAttendanceRate,
        tasksGraded: `${activeStudents.length * 4} / ${activeStudents.length * 4}`,
        pendingCount: pendingStudents.length
      },
      studentRoster: STUDENTS_DB.map(st => ({
        id: st.id,
        roll: st.roll,
        name: st.name,
        grade: st.grade,
        initials: st.initials,
        color: st.color,
        status: st.status === 'PENDING' ? 'PENDING' : (st.history ? st.history[0] || 'P' : 'P'),
        history: st.history || ['P', 'P', 'P', 'P', 'P'],
        gpa: st.gpa,
        attendance: st.attendance,
        isPending: st.status === 'PENDING'
      }))
    });
  });

  // POST: Teacher Add Student (goes to PENDING for admin approval)
  app.post('/api/teacher/students', (req, res) => {
    const { name, grade } = req.body;
    if (!name || !grade) {
      return res.status(400).json({ error: 'Name and Grade are required.' });
    }

    const roll = String(STUDENTS_DB.length + 1).padStart(2, '0');
    const initials = name.split(' ').map((n: string) => n[0]).join('').toUpperCase();
    const colors = ['#111111', '#555555', '#777777', '#333333'];
    const color = colors[Math.floor(Math.random() * colors.length)];

    const newStudent: Student = {
      id: `st_${Date.now()}`,
      roll,
      name,
      grade,
      initials,
      color,
      status: 'PENDING', // Requires Admin approval!
      addedBy: 'Sarah Jenkins',
      added: 'Just now',
      attendance: 100,
      gpa: '4.00',
      parentEmail: `parent.${name.toLowerCase().replace(/\s+/g, '')}@school.edu`,
      history: ['P', 'P', 'P', 'P', 'P']
    };

    STUDENTS_DB.push(newStudent);

    // Log the request
    SYSTEM_LOGS.unshift({
      id: `log_${Date.now()}`,
      text: `Teacher Sarah Jenkins requested registration of student: ${name} (${grade}).`,
      time: 'Just now',
      iconType: 'sparkles'
    });

    return res.json({ success: true, student: newStudent });
  });

  // POST: Teacher Chat / AI Copilot
  app.post('/api/teacher/chat', async (req, res) => {
    const { message } = req.body;
    console.log(`[API] Teacher AI Copilot: "${message}"`);

    if (!message) {
      return res.status(400).json({ error: 'Message content is empty' });
    }

    // Dynamic context preparation from live STUDENTS_DB!
    const activeRoster = STUDENTS_DB.filter(st => st.status === 'VERIFIED');
    const pendingList = STUDENTS_DB.filter(st => st.status === 'PENDING');
    
    const studentsContext = activeRoster.map(st => 
      `- ${st.name} (Roll: ${st.roll}, GPA: ${st.gpa}, Attendance: ${st.attendance}%, Current attendance status: ${st.history ? st.history[0] : 'P'})`
    ).join('\n');

    const pendingContext = pendingList.length 
      ? `Currently awaiting Principal Alistair Vance approval: ${pendingList.map(st => st.name).join(', ')}` 
      : 'No pending registrations awaiting approval.';

    const systemPrompt = `You are the Westview Academy elite Teacher Copilot. You are speaking with Sarah Jenkins, Grade 10 Mathematics lead.
Your dynamic access database represents:
${studentsContext}

Registration Approvals status:
${pendingContext}

Help Ms. Jenkins design quizzes, write professional emails to parents, analyze grades, or suggest tailored intervention paths. Always use clean spacing, structured bullets, and a direct but warm tone. Highlight and format information professionally.`;

    const ai = getGeminiClient();
    if (ai) {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.5-flash',
          contents: message,
          config: {
            systemInstruction: systemPrompt,
          }
        });
        const reply = response.text || "I apologize, but I had trouble processing that request.";
        return res.json({ reply });
      } catch (err: any) {
        console.error("Gemini API call failed for Teacher Chat:", err);
      }
    }

    // High quality dynamic fallback in case Gemini key is missing or failed
    const lowerMessage = message.toLowerCase();
    let reply: string;

    if (lowerMessage.includes('email') || lowerMessage.includes('draft') || lowerMessage.includes('parent')) {
      const targetStudent = activeRoster.find(st => lowerMessage.includes(st.name.toLowerCase().split(' ')[0])) || activeRoster[1]; // Chloe fallback
      reply = `Here is a custom formatted outreach email draft for ${targetStudent.name}'s parent:\n\n` +
              `Subject: Academic Progress & Check-in - Westview Academy\n\n` +
              `Dear ${targetStudent.name}'s Family,\n\n` +
              `I hope you are doing well. This is Sarah Jenkins from Westview Academy. I wanted to reach out regarding ${targetStudent.name.split(' ')[0]}'s performance in Mathematics.\n\n` +
              `${targetStudent.name.split(' ')[0]} currently maintains a GPA of ${targetStudent.gpa} and has an attendance rate of ${targetStudent.attendance}%. I am highly impressed by their classroom participation and focus.\n\n` +
              `Please let me know if you would like to sync on further challenging study materials to prepare for our upcoming math olympiad.\n\n` +
              `Warm regards,\n` +
              `Ms. Sarah Jenkins\n` +
              `Grade 10 Mathematics Lead`;
    } else if (lowerMessage.includes('quiz') || lowerMessage.includes('homework') || lowerMessage.includes('lesson')) {
      reply = `Here is a custom 3-question quiz designed for Grade 10 Quadrantics and Functions:\n\n` +
              `1. **Conceptual Review**: Explain the graphic meaning of the discriminant $\\Delta = b^2 - 4ac$ being negative. (5 Marks)\n` +
              `2. **Algebraic Formula**: Solve for $x$: $3x^2 - 8x + 2 = 0$. (10 Marks)\n` +
              `3. **Real-world Application**: A gardener builds a rectangular fence with 40 meters of border next to a stone wall. Express the Area as a quadratic equation and solve for the dimensions that maximize the enclosed area. (15 Marks)`;
    } else {
      reply = `I have analyzed the roster. Arjun Verma holds our highest attendance (${activeRoster[0]?.attendance || 98}%), and Chloe Miller is doing exceptionally well with a ${activeRoster[1]?.gpa || '3.85'} GPA. There are currently ${pendingList.length} students awaiting principal approval. Let me know if you would like me to draft progress notifications!`;
    }

    return res.json({ reply });
  });

  // ==================== PARENT PORTAL ENDPOINTS ====================

  // GET: Parent Dashboard Data
  app.get('/api/parent/dashboard', (req, res) => {
    const token = getSessionToken(req);
    if (!token || !SESSIONS[token]) {
      return res.status(401).json({ error: 'Unauthorized session.' });
    }

    const parentUser = SESSIONS[token].user;
    
    // Find matching child in verified list
    const student = STUDENTS_DB.find(st => st.parentEmail === parentUser.email) || STUDENTS_DB[1]; // fallback to Chloe

    return res.json({
      student: {
        name: student.name,
        rollNumber: student.roll,
        grade: student.grade
      },
      attendanceRate: student.attendance,
      gpa: student.gpa,
      activeHomeworkCount: 2,
      recentTeacherUpdates: [
        { 
          teacher: "Ms. Jenkins", 
          subject: "Mathematics", 
          text: `${student.name.split(' ')[0]} scored a perfect score on the advanced quadratic graphing test! Spectacular progress.`, 
          avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&fit=crop", 
          time: "Today" 
        },
        { 
          teacher: "Kavita Patel", 
          subject: "English Literature", 
          text: `Highly proactive participation in Shakespeare critical reading seminars. Keep it up!`, 
          avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&fit=crop", 
          time: "Yesterday" 
        }
      ]
    });
  });

  // POST: Parent AI Chat
  app.post('/api/parent/chat', async (req, res) => {
    const { message } = req.body;
    console.log(`[API] Parent AI Chat: "${message}"`);

    if (!message) {
      return res.status(400).json({ error: 'Message content is empty' });
    }

    const token = getSessionToken(req);
    let student = STUDENTS_DB[1]; // Chloe default
    let parentName = "Robert Miller";

    if (token && SESSIONS[token]) {
      const parentUser = SESSIONS[token].user;
      parentName = parentUser.name;
      student = STUDENTS_DB.find(st => st.parentEmail === parentUser.email) || STUDENTS_DB[1];
    }

    const systemPrompt = `You are the Westview Academy family counselor, an expert AI family academic assistant.
You are conversing with ${parentName}, the parent of ${student.name}.
${student.name} is in ${student.grade}, currently maintains a GPA of ${student.gpa} and has an attendance rating of ${student.attendance}%.
Our campus-wide announcement is: "${LATEST_ANNOUNCEMENT}"

Answer the parent's questions warmly, clearly, offering supportive parent advice, practical learning tips, or outlining academic guidelines. Always feel free to structure response points cleanly.`;

    const ai = getGeminiClient();
    if (ai) {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.5-flash',
          contents: message,
          config: {
            systemInstruction: systemPrompt,
          }
        });
        const reply = response.text || "I apologize, but I had trouble generating a response.";
        return res.json({ reply });
      } catch (err: any) {
        console.error("Gemini API call failed for Parent Chat:", err);
      }
    }

    // High quality mock fallback in case Gemini key is missing or failed
    const lowerMessage = message.toLowerCase();
    let reply = `Hello ${parentName}! I am ${student.name}'s AI counselor. They are doing wonderfully, maintaining a ${student.gpa} GPA and ${student.attendance}% attendance. How can I help you support their learning today?`;

    if (lowerMessage.includes('math') || lowerMessage.includes('grade') || lowerMessage.includes('jenkins')) {
      reply = `${student.name.split(' ')[0]} is demonstrating exceptional aptitude in Mathematics with Ms. Sarah Jenkins! Their analytical thinking and speed in solving formula-based algebra are highly commendable. I recommend encouraging them with visual logic puzzles at home to continue stimulating this curiosity.`;
    } else if (lowerMessage.includes('homework') || lowerMessage.includes('assignment') || lowerMessage.includes('schedule')) {
      reply = `${student.name.split(' ')[0]} has 2 active assignments this week: a Physics Laboratory observation report and a literary essay on dramatic tragedy themes. Both have draft notes prepared and look excellent. Setting a quiet 45-minute study window after school can help finalize these before the deadlines!`;
    } else if (lowerMessage.includes('attendance') || lowerMessage.includes('absent')) {
      reply = `${student.name.split(' ')[0]}'s attendance rate stands at ${student.attendance}%. Consistent presence is key to mastering core daily concepts. They are keeping up beautifully, but let me know if you would like to prepare a detailed schedule tracker!`;
    }

    return res.json({ reply });
  });

  // ==================== VITE & STATIC FILES HOOK ====================

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log("Vite Development Middleware mounted successfully.");
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log(`Serving static production files from: ${distPath}`);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[FULL-STACK SERVER] Running on port http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Critical server failure on startup:", err);
});

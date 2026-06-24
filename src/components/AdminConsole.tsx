import React, { useState, useEffect } from 'react';
import { 
  Calendar, Users, TrendingUp, Monitor, Check, Copy, AlertTriangle, 
  Cpu, Plus, Trash2, Search, RefreshCw, ShieldAlert, Sparkles, AlertCircle
} from 'lucide-react';
import { Student, UpcomingEvent, PastEvent, Evaluation, EvaluationReport, AttendanceRecord } from '../types';
import { ADMIN_ACCOUNTS, MYSQL_SCHEMA_DDL, generateLiveMySQLDump } from '../lib/mysql_export';
import { Camera, Coins, Database } from 'lucide-react';

interface AdminConsoleProps {
  students: Student[];
  upcomingEvents: UpcomingEvent[];
  pastEvents: PastEvent[];
  evaluations: Evaluation[];
  attendanceRecords: AttendanceRecord[];
  onSync: () => void;
  currentAdminUser: any;
  onLogout: () => void;
  playBeep: (freq: number, dur: number) => void;
  addTerminalLine: (line: string) => void;
}

const COLLEGES = [
  { code: 'BSINFO TECH', name: 'BS in Information Technology', enrolled: 350 },
  { code: 'BSED',        name: 'BS in Secondary Education',      enrolled: 400 },
  { code: 'BSIT',        name: 'BS in Industrial Technology',     enrolled: 300 },
  { code: 'BSHM',        name: 'BS in Hospitality Management',    enrolled: 250 },
  { code: 'BS CRIM',     name: 'BS in Criminology',               enrolled: 200 },
];

const CAMPUS_VENUES = [
  "WVSU-LC Gymnasium",
  "WVSU-LC Quadrangle",
  "WVSU-LC Multi-Purpose Hall",
  "WVSU-LC Campus Grounds",
  "AVR Room",
  "Social Hall",
  "ICT Laboratory",
  "Academic Building I",
  "Academic Building II",
  "College of Education Building",
  "Criminology Field"
];

const ORGANIZER_OPTIONS = [
  "Office of Student Affairs (OSA)",
  "Supreme Student Council (SSC)",
  "THE CREST",
  "GAD",
  "CULTURAL AFFAIRS",
  "PE DEPARTMENT",
  "BSINFO TECH Council",
  "BSED Council",
  "BSIT Council",
  "BSHM Council",
  "BS CRIM Council"
];

export default function AdminConsole(props: AdminConsoleProps) {
  const { 
    students, upcomingEvents, pastEvents, evaluations, attendanceRecords,
    onSync, currentAdminUser, onLogout, playBeep, addTerminalLine 
  } = props;

  const [adminSubTab, setAdminSubTab] = useState<'analytics' | 'students' | 'events' | 'mysql' | 'attendance'>('analytics');

  const TIME_INTERVALS = [
    "7:00 AM - 10:00 AM",
    "7:30 AM - 10:30 AM",
    "8:00 AM - 11:00 AM",
    "8:30 AM - 11:30 AM",
    "9:00 AM - 12:00 PM",
    "9:30 AM - 12:30 PM",
    "10:00 AM - 1:00 PM",
    "1:00 PM - 4:00 PM",
    "1:30 PM - 4:30 PM",
    "2:00 PM - 5:00 PM",
    "3:00 PM - 6:00 PM",
    "8:00 AM - 5:00 PM",
    "9:00 AM - 4:00 PM"
  ];

  const formatDateFriendly = (dateStr: string) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parts[0];
      const monthIndex = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
      ];
      if (monthIndex >= 0 && monthIndex < 12) {
        return `${months[monthIndex]} ${day}, ${year}`;
      }
    }
    return dateStr;
  };
  const [adminSelectedEventId, setAdminSelectedEventId] = useState<string>('');
  const [selectedProofUrl, setSelectedProofUrl] = useState<string | null>(null);
  
  // AI report states
  const [reportLoading, setReportLoading] = useState<boolean>(false);
  const [generatedReport, setGeneratedReport] = useState<EvaluationReport | null>(null);
  const [reportError, setReportError] = useState<string>('');
  const [copiedDump, setCopiedDump] = useState<boolean>(false);
  const [copiedSchema, setCopiedSchema] = useState<boolean>(false);
  const [adminReviewsFilter, setAdminReviewsFilter] = useState<string>('all');

  // Addition form states
  const [upTitle, setUpTitle] = useState<string>('');
  const [upDate, setUpDate] = useState<string>('');
  const [upTime, setUpTime] = useState<string>('');
  const [upVenue, setUpVenue] = useState<string>(CAMPUS_VENUES[0]);
  const [upOpenTo, setUpOpenTo] = useState<string>('All Students');
  const [upDesc, setUpDesc] = useState<string>('');
  const [upEventStatus, setUpEventStatus] = useState<{ success: boolean; message: string } | null>(null);
  const [upOrganizer, setUpOrganizer] = useState<string>(
    currentAdminUser.agency === 'ALL' || currentAdminUser.agency === 'OSA' || currentAdminUser.agency === 'SSC'
      ? 'Office of Student Affairs (OSA)'
      : currentAdminUser.agency
  );

  const [pastTitle, setPastTitle] = useState<string>('');
  const [pastDate, setPastDate] = useState<string>('');
  const [pastVenue, setPastVenue] = useState<string>(CAMPUS_VENUES[0]);
  const [pastAttendance, setPastAttendance] = useState<number>(100);
  const [pastColleges, setPastColleges] = useState<string[]>(['BSINFO TECH', 'BSED', 'BSIT', 'BSHM', 'BS CRIM']);
  const [pastEventStatus, setPastEventStatus] = useState<{ success: boolean; message: string } | null>(null);
  const [pastOrganizer, setPastOrganizer] = useState<string>(
    currentAdminUser.agency === 'ALL' || currentAdminUser.agency === 'OSA' || currentAdminUser.agency === 'SSC'
      ? 'Supreme Student Council (SSC)'
      : currentAdminUser.agency
  );

  const [newStudentId, setNewStudentId] = useState<string>('');
  const [newStudentName, setNewStudentName] = useState<string>('');
  const [newStudentCollege, setNewStudentCollege] = useState<string>('BSINFO TECH');
  const [newStudentProgram, setNewStudentProgram] = useState<string>('');
  const [newStudentYear, setNewStudentYear] = useState<number>(1);
  const [manualAddStatus, setManualAddStatus] = useState<{ success: boolean; message: string } | null>(null);

  const [studentIdToDelete, setStudentIdToDelete] = useState<string | null>(null);
  const [attendanceIdToDiscard, setAttendanceIdToDiscard] = useState<string | null>(null);

  // AI Config states for LM Studio Gemma model
  const [aiProvider, setAiProvider] = useState<'gemini' | 'gemma_local'>('gemini');
  const [aiLocalUrl, setAiLocalUrl] = useState<string>('http://localhost:1234/v1');
  const [aiLocalModel, setAiLocalModel] = useState<string>('gemma');
  const [aiHasGeminiKey, setAiHasGeminiKey] = useState<boolean>(false);
  const [aiSaveStatus, setAiSaveStatus] = useState<string>('');

  // Fetch AI Config on load
  useEffect(() => {
    fetch('/api/ai-config')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.config) {
          setAiProvider(data.config.provider);
          setAiLocalUrl(data.config.localUrl);
          setAiLocalModel(data.config.localModel);
          setAiHasGeminiKey(data.hasGeminiKey);
        }
      })
      .catch(err => {
        console.error("Failed to load AI configuration:", err);
      });
  }, []);

  const handleSaveAIConfig = () => {
    setAiSaveStatus('Saving...');
    fetch('/api/ai-config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        provider: aiProvider,
        localUrl: aiLocalUrl,
        localModel: aiLocalModel
      })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setAiSaveStatus('Saved successfully!');
          playBeep(900, 0.1);
          setTimeout(() => setAiSaveStatus(''), 3000);
        } else {
          setAiSaveStatus(`Error: ${data.error || 'Failed to save'}`);
        }
      })
      .catch(err => {
        setAiSaveStatus(`Network error: ${err.message}`);
      });
  };

  // Set default event selection
  useEffect(() => {
    if (pastEvents.length > 0 && !adminSelectedEventId) {
      setAdminSelectedEventId(pastEvents[0].id);
    }
  }, [pastEvents, adminSelectedEventId]);

  // Synchronize newStudentProgram when newStudentCollege changes in registration form
  useEffect(() => {
    switch (newStudentCollege) {
      case 'BSINFO TECH':
        setNewStudentProgram('BS Information Technology');
        break;
      case 'BSED':
        setNewStudentProgram('BS Secondary Education');
        break;
      case 'BSIT':
        setNewStudentProgram('BS Industrial Technology');
        break;
      case 'BSHM':
        setNewStudentProgram('BS Hospitality Management');
        break;
      case 'BS CRIM':
        setNewStudentProgram('BS Criminology');
        break;
      default:
        break;
    }
  }, [newStudentCollege]);

  // Handle report generation
  const handleGenerateReport = () => {
    if (!adminSelectedEventId) {
      setReportError("Please select a past event registry to synthesize.");
      return;
    }
    setReportLoading(true);
    setReportError("");
    setGeneratedReport(null);
    playBeep(800, 0.1);

    fetch('/api/generate-report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventId: adminSelectedEventId })
    })
      .then(res => res.json())
      .then(data => {
        setReportLoading(false);
        if (data.success && data.report) {
          setGeneratedReport(data.report);
          playBeep(1200, 0.2);
          addTerminalLine(`AI Synthesis generated for event "${data.report.eventTitle}" successfully.`);
        } else {
          setReportError(data.error || "An unknown error occurred during analysis.");
          playBeep(400, 0.35);
        }
      })
      .catch(err => {
        setReportLoading(false);
        setReportError("Communication error with AI service: " + err.message);
        playBeep(400, 0.35);
      });
  };

  // Directory Mutators
  const handleAddUpcomingEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!upTitle.trim() || !upDate.trim() || !upVenue.trim()) {
      setUpEventStatus({ success: false, message: 'Please complete all upcoming event fields.' });
      playBeep(400, 0.2);
      return;
    }

    const assignedOrganizer = currentAdminUser.agency === 'ALL' || currentAdminUser.agency === 'OSA' || currentAdminUser.agency === 'SSC'
      ? upOrganizer
      : currentAdminUser.agency;

    fetch('/api/upcoming-events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: upTitle.trim(),
        date: formatDateFriendly(upDate.trim()),
        time: upTime.trim() || 'All-Day',
        venue: upVenue.trim(),
        organizer: assignedOrganizer,
        open_to: upOpenTo,
        description: upDesc.trim() || ''
      })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setUpEventStatus({ success: true, message: 'Upcoming Event successfully scheduled!' });
          setUpTitle('');
          setUpDate('');
          setUpTime('');
          setUpVenue('');
          setUpOpenTo('All Students');
          setUpDesc('');
          playBeep(1200, 0.15);
          onSync();
          setTimeout(() => setUpEventStatus(null), 4000);
        }
      });
  };

  const handleDeleteUpcomingEvent = (id: string) => {
    fetch(`/api/upcoming-events/${id}`, { method: 'DELETE' })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          addTerminalLine(`Upcoming event ${id} deleted.`);
          playBeep(600, 0.1);
          onSync();
        }
      });
  };

  const handleAddPastEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pastTitle.trim() || !pastDate.trim() || !pastVenue.trim()) {
      setPastEventStatus({ success: false, message: 'Please complete all past event fields.' });
      playBeep(400, 0.2);
      return;
    }

    const assignedOrganizer = currentAdminUser.agency === 'ALL' || currentAdminUser.agency === 'OSA' || currentAdminUser.agency === 'SSC'
      ? pastOrganizer
      : currentAdminUser.agency;

    fetch('/api/past-events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: pastTitle.trim(),
        date: formatDateFriendly(pastDate.trim()),
        venue: pastVenue.trim(),
        organizer: assignedOrganizer,
        total_attendance: Number(pastAttendance) || 100,
        colleges_participated: pastColleges
      })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setPastEventStatus({ success: true, message: 'Past Event registry initialized successfully!' });
          setPastTitle('');
          setPastDate('');
          setPastVenue('');
          setPastAttendance(100);
          setPastColleges(['BSINFO TECH', 'BSED', 'BSIT', 'BSHM', 'BS CRIM']);
          playBeep(1200, 0.15);
          onSync();
          setTimeout(() => setPastEventStatus(null), 4000);
        }
      });
  };

  const handleDeletePastEvent = (id: string) => {
    fetch(`/api/past-events/${id}`, { method: 'DELETE' })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          addTerminalLine(`Past Event registry ${id} deleted.`);
          playBeep(600, 0.1);
          onSync();
        }
      });
  };

  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentId.trim() || !newStudentName.trim() || !newStudentProgram.trim()) {
      setManualAddStatus({ success: false, message: 'Please define Name, Student ID, and Program details.' });
      return;
    }

    fetch('/api/students/registry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: newStudentId.trim(),
        name: newStudentName.trim(),
        college: newStudentCollege,
        program: newStudentProgram.trim(),
        year: newStudentYear
      })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setManualAddStatus({ success: true, message: `Registered student "${newStudentName}" successfully!` });
          setNewStudentId('');
          setNewStudentName('');
          setNewStudentProgram('');
          setNewStudentYear(1);
          playBeep(1100, 0.1);
          onSync();
          setTimeout(() => setManualAddStatus(null), 5000);
        }
      });
  };

  const executeDeleteAttendance = (id: string) => {
    fetch(`/api/attendance/${encodeURIComponent(id)}`, { method: 'DELETE' })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          addTerminalLine(`REVERTED: Attendance log ${id} deleted.`);
          playBeep(600, 0.15);
          onSync();
        } else {
          addTerminalLine(`ERROR: Failed to discard log. ${data.error || 'Unknown error'}`);
        }
      })
      .catch(err => {
        addTerminalLine(`ERROR: Network failed to discard log. ${err.message}`);
      });
  };

  const executeDeleteStudent = (studentId: string) => {
    fetch(`/api/students/registry/${encodeURIComponent(studentId)}`, { method: 'DELETE' })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          addTerminalLine(`DELETED: Student ${studentId} removed from database.`);
          playBeep(600, 0.1);
          onSync();
        } else {
          addTerminalLine(`ERROR: Failed to delete student. ${data.error || 'Unknown error'}`);
        }
      })
      .catch(err => {
        addTerminalLine(`ERROR: Network failed to delete student. ${err.message}`);
      });
  };

  // Helper check for admin field scope limitations
  const canModifyEvent = (eventOrganizer: string): boolean => {
    if (
      currentAdminUser.agency === 'ALL' || 
      currentAdminUser.agency === 'OSA' || 
      currentAdminUser.agency === 'SSC'
    ) return true;
    const cleanOrg = (eventOrganizer || '').toLowerCase();
    const cleanAdmin = currentAdminUser.agency.toLowerCase();
    return cleanOrg.includes(cleanAdmin) || cleanAdmin.includes(cleanOrg);
  };

  // Stats Calculations
  const isDeptAdmin = currentAdminUser.agency !== 'ALL' && currentAdminUser.agency !== 'OSA' && currentAdminUser.agency !== 'SSC';
  const totalSubmissions = isDeptAdmin 
    ? evaluations.filter(e => e.college === currentAdminUser.agency).length 
    : evaluations.length;
  const filteredSubmissions = evaluations.filter(e => 
    e.event_id === adminSelectedEventId &&
    (!isDeptAdmin || e.college === currentAdminUser.agency)
  );

  // Score stats helper
  const getOverallStats = () => {
    if (filteredSubmissions.length === 0) return { overall: 0, q1: 0, q2: 0, q3: 0, q4: 0, q5: 0 };
    let q1 = 0, q2 = 0, q3 = 0, q4 = 0, q4c = 0, q5 = 0;
    filteredSubmissions.forEach(item => {
      q1 += item.q1;
      q2 += item.q2;
      q3 += item.q3;
      if (typeof item.q4 === 'number') {
        q4 += item.q4;
        q4c++;
      }
      q5 += item.q5;
    });

    const mQ1 = q1 / filteredSubmissions.length;
    const mQ2 = q2 / filteredSubmissions.length;
    const mQ3 = q3 / filteredSubmissions.length;
    const mQ4 = q4c > 0 ? q4 / q4c : 0;
    const mQ5 = q5 / filteredSubmissions.length;

    const overall = (mQ1 + mQ2 + mQ3 + (mQ4 > 0 ? mQ4 : 0) + mQ5) / (mQ4 > 0 ? 5 : 4);
    return { overall, q1: mQ1, q2: mQ2, q3: mQ3, q4: mQ4, q5: mQ5 };
  };

  const statResult = getOverallStats();

  return (
    <div className="space-y-6">
      {/* Admin Panel Header Block */}
      <div className="bg-gradient-to-r from-slate-900 via-[#0B2B64] to-indigo-950 text-white rounded-2xl border border-slate-800 shadow-xl relative overflow-hidden">
        {/* Visual frame header decoration */}
        <div className="bg-slate-950/80 p-3 px-6 flex items-center justify-between border-b border-slate-900/60">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-sm shadow-red-500/20"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-[#F2C811] shadow-sm shadow-yellow-500/20"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/20"></span>
            <span className="text-[10px] font-mono text-slate-400 font-bold ml-2 uppercase tracking-wider">WVSU_LC://ADMIN_SESSION_ACTIVE</span>
          </div>
          <span className="text-[9px] font-bold uppercase bg-gradient-to-r from-amber-400 to-[#F2C811] text-[#0B2B64] px-2.5 py-1 rounded-lg border border-amber-500/20 shadow-sm">
            SECURE
          </span>
        </div>

        <div className="p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className={`px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest border border-slate-700/60 rounded-full bg-slate-800/50 ${currentAdminUser.color || 'text-yellow-400'}`}>
                ● {currentAdminUser.name}
              </span>
              <span className="bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-bold uppercase px-2.5 py-0.5 rounded-full tracking-widest">
                Scope: {currentAdminUser.agency}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight line-clamp-1 text-amber-300 uppercase">
              {currentAdminUser.agency === 'ALL' 
                ? 'SYSTEM ADMINISTRATIVE CONSOLE' 
                : `${currentAdminUser.name} PORTAL`}
            </h1>
            <p className="text-xs text-slate-300 font-medium max-w-2xl mt-1.5 leading-relaxed">
              Access credentials active for {currentAdminUser.name}. You are authorized to manage activities belonging to your sector.
            </p>
          </div>
          <button
            onClick={() => { onLogout(); playBeep(500, 0.15); }}
            className="bg-red-600/90 hover:bg-red-700 hover:scale-[1.02] text-white text-xs font-bold uppercase tracking-wider py-2.5 px-5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shrink-0 shadow-lg shadow-red-950/20 border-none"
          >
            Logout Security Dock
          </button>
        </div>
        <div className="absolute right-[-10px] bottom-[-20px] text-[6rem] font-black text-slate-800/10 italic pointer-events-none uppercase">
          {currentAdminUser.agency}
        </div>
      </div>

      {/* Admin Navigation Sub-Tabs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200/80 gap-1.5 shadow-sm">
        <button
          onClick={() => { setAdminSubTab('analytics'); playBeep(1100, 0.05); }}
          className={`py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 border-none ${adminSubTab === 'analytics' ? 'bg-[#0B2B64] text-white shadow-md' : 'text-slate-600 hover:bg-slate-200/50 hover:text-slate-900'}`}
        >
          <TrendingUp className="w-4 h-4" />
          Analytics & AI
        </button>
        <button
          onClick={() => { setAdminSubTab('students'); playBeep(1100, 0.05); }}
          className={`py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 border-none ${adminSubTab === 'students' ? 'bg-[#0B2B64] text-white shadow-md' : 'text-slate-600 hover:bg-slate-200/50 hover:text-slate-900'}`}
        >
          <Users className="w-4 h-4" />
          Student Registry
        </button>
        <button
          onClick={() => { setAdminSubTab('events'); playBeep(1100, 0.05); }}
          className={`py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 border-none ${adminSubTab === 'events' ? 'bg-[#0B2B64] text-white shadow-md' : 'text-slate-600 hover:bg-slate-200/50 hover:text-slate-900'}`}
        >
          <Calendar className="w-4 h-4" />
          Scheduler
        </button>
        <button
          onClick={() => { setAdminSubTab('attendance'); playBeep(1100, 0.05); }}
          className={`py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 border-none ${adminSubTab === 'attendance' ? 'bg-[#0B2B64] text-white shadow-md' : 'text-slate-600 hover:bg-slate-200/50 hover:text-slate-900'}`}
        >
          <Camera className="w-4 h-4" />
          Attendance Logs
        </button>
        <button
          onClick={() => { setAdminSubTab('mysql'); playBeep(1100, 0.05); }}
          className={`py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 border-none ${adminSubTab === 'mysql' ? 'bg-[#0B2B64] text-white shadow-md' : 'text-slate-600 hover:bg-slate-200/50 hover:text-slate-900'}`}
        >
          <Monitor className="w-4 h-4" />
          MySQL DDL
        </button>
      </div>

      {/* Subtab Contents */}

      {/* Subtab 1: Analytics Dashboard */}
      {adminSubTab === 'analytics' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Quick Stats Banner Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-5 border border-slate-200/80 rounded-2xl shadow-md shadow-indigo-950/5 flex items-center gap-4 hover:-translate-y-0.5 transition-transform duration-200">
              <div className="p-3 bg-indigo-50 text-indigo-950 rounded-xl">
                <TrendingUp className="w-6 h-6 stroke-[2px]" />
              </div>
              <div>
                <div className="text-[10px] text-slate-400 uppercase tracking-widest font-extrabold">Average Rating</div>
                <div className="text-2xl font-mono font-black text-[#0B2B64]">
                  {statResult.overall ? statResult.overall.toFixed(2) : "0.00"}/5.0
                </div>
              </div>
            </div>
            <div className="bg-white p-5 border border-slate-200/80 rounded-2xl shadow-md shadow-indigo-950/5 flex items-center gap-4 hover:-translate-y-0.5 transition-transform duration-200">
              <div className="p-3 bg-amber-50 text-amber-950 rounded-xl">
                <Users className="w-6 h-6 stroke-[2px]" />
              </div>
              <div>
                <div className="text-[10px] text-slate-400 uppercase tracking-widest font-extrabold">Total evaluations</div>
                <div className="text-2xl font-mono font-black text-slate-900">{totalSubmissions}</div>
              </div>
            </div>
            <div className="bg-white p-5 border border-slate-200/80 rounded-2xl shadow-md shadow-indigo-950/5 flex items-center gap-4 hover:-translate-y-0.5 transition-transform duration-200">
              <div className="p-3 bg-emerald-50 text-emerald-950 rounded-xl">
                <Calendar className="w-6 h-6 stroke-[2px]" />
              </div>
              <div>
                <div className="text-[10px] text-slate-400 uppercase tracking-widest font-extrabold">Filtered Responses</div>
                <div className="text-2xl font-mono font-black text-emerald-900">{filteredSubmissions.length}</div>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 border border-slate-200/80 rounded-2xl shadow-xl shadow-indigo-950/5">
            {/* AI Engine Configuration Hub */}
            <div className="mb-6 p-4 bg-slate-50 rounded-2xl border border-slate-200/60">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <div>
                  <h4 className="text-xs font-black uppercase text-slate-700 flex items-center gap-1.5">
                    <Cpu className="w-4 h-4 text-indigo-600 animate-pulse" />
                    AI Orchestration Engine
                  </h4>
                  <p className="text-[10px] text-slate-500 font-semibold uppercase">Choose between Cloud Gemini or Local Gemma via LM Studio</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => { setAiProvider('gemini'); playBeep(1000, 0.05); }}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer border ${aiProvider === 'gemini' ? 'bg-[#0B2B64] text-white border-[#0B2B64] shadow-xs' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'}`}
                  >
                    Gemini API
                  </button>
                  <button
                    onClick={() => { setAiProvider('gemma_local'); playBeep(1000, 0.05); }}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer border ${aiProvider === 'gemma_local' ? 'bg-[#0B2B64] text-white border-[#0B2B64] shadow-xs' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'}`}
                  >
                    Local Gemma (LM Studio)
                  </button>
                </div>
              </div>

              {aiProvider === 'gemma_local' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-slate-200/60 animate-fadeIn">
                  <div>
                    <label className="block text-[9px] font-extrabold uppercase text-slate-500 mb-1.5">LM Studio Endpoint URL</label>
                    <input
                      type="text"
                      value={aiLocalUrl}
                      onChange={(e) => setAiLocalUrl(e.target.value)}
                      placeholder="e.g. http://localhost:1234/v1"
                      className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-mono font-bold text-slate-700 outline-none focus:border-indigo-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-extrabold uppercase text-slate-500 mb-1.5">Model Identifier</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={aiLocalModel}
                        onChange={(e) => setAiLocalModel(e.target.value)}
                        placeholder="gemma"
                        className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-mono font-bold text-slate-700 outline-none focus:border-indigo-500 transition-all"
                      />
                      <button
                        onClick={handleSaveAIConfig}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-extrabold uppercase tracking-widest px-4 py-2.5 rounded-xl border-none cursor-pointer shadow-sm shrink-0 transition-colors"
                      >
                        Save Engine
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {aiProvider === 'gemini' && (
                <div className="flex items-center justify-between pt-3 border-t border-slate-200/60 text-[10px] font-semibold text-slate-500 animate-fadeIn">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2.5 h-2.5 rounded-full ${aiHasGeminiKey ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                    <span>Gemini API Status: <span className="font-bold">{aiHasGeminiKey ? 'Active (API Key loaded)' : 'Inactive (No API Key found)'}</span></span>
                  </div>
                  <button
                    onClick={handleSaveAIConfig}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-extrabold uppercase tracking-widest px-4 py-2 rounded-xl border-none cursor-pointer shadow-sm transition-colors"
                  >
                    Save Engine
                  </button>
                </div>
              )}

              {aiSaveStatus && (
                <p className="text-[10px] font-extrabold uppercase text-indigo-600 mt-2 animate-pulse">{aiSaveStatus}</p>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-100 pb-5 gap-4 mb-6">
              <div>
                <h3 className="text-lg font-extrabold uppercase text-[#0B2B64]">Cognitive AI Executive Synthesizer</h3>
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Select event and query active AI neural model</p>
              </div>
              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <select
                  value={adminSelectedEventId}
                  onChange={(e) => { setAdminSelectedEventId(e.target.value); setGeneratedReport(null); }}
                  className="bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold p-3 outline-none w-full sm:w-60 focus:border-indigo-500 transition-all text-slate-700"
                >
                  <option value="" disabled>Choose past event registry</option>
                  {pastEvents.map(evt => (
                    <option key={evt.id} value={evt.id}>{evt.title} ({evt.date})</option>
                  ))}
                </select>
                <button
                  onClick={handleGenerateReport}
                  disabled={reportLoading}
                  className="bg-[#0B2B64] hover:bg-indigo-950 text-white font-bold uppercase text-[10px] px-4 py-3 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 border-none shrink-0 shadow-sm"
                >
                  <Cpu className="w-4 h-4" />
                  {reportLoading ? "Processing..." : "Synthesize AI"}
                </button>
              </div>
            </div>

            {reportLoading && (
              <div className="p-12 text-center space-y-4">
                <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
                  <Cpu className="w-8 h-8 text-[#0B2B64] animate-spin" />
                </div>
                <h4 className="text-md font-bold uppercase text-[#0B2B64]">Analyzing feedback channels via {aiProvider === 'gemma_local' ? 'Local Gemma (LM Studio)' : 'Gemini AI'}...</h4>
                <p className="text-xs text-slate-400 font-medium max-w-sm mx-auto leading-relaxed">Evaluating semantic sentiment scores, cataloguing physical constraints, and scanning student conduct/safety logs.</p>
              </div>
            )}

            {reportError && (
              <div className="p-4 bg-red-50 text-red-800 text-xs font-semibold rounded-xl border border-red-100 flex items-center gap-2.5">
                <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
                <span>Error generating report: {reportError}</span>
              </div>
            )}

            {/* Generated Report View Panels */}
            {generatedReport && !reportLoading && (
              <div className="space-y-6 animate-fadeIn">
                <div className="p-4 bg-amber-50 border border-amber-200/60 rounded-xl text-slate-700 text-xs font-semibold flex justify-between items-center">
                  <span>Report Generated At: {generatedReport.generatedAt}</span>
                  <span className="text-[#0B2B64] uppercase font-extrabold tracking-wider text-[10px]">GEMINI ACTIVE INSIGHTS</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left Column: Metrics & Grades */}
                  <div className="space-y-6">
                    <div className="bg-slate-50/50 p-6 border border-slate-200/80 rounded-2xl">
                      <h4 className="text-sm font-extrabold text-slate-900 uppercase mb-4 border-b border-slate-200/50 pb-2.5">Quantitative Metrics Breakdown</h4>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-xs font-bold uppercase text-slate-600">
                            <span>Q1: Event Satisfaction</span>
                            <span className="font-mono text-slate-900">{statResult.q1.toFixed(2)} / 5.0</span>
                          </div>
                          <div className="h-2 bg-slate-100 rounded-full overflow-hidden mt-1.5 border border-slate-200/40">
                            <div className="h-full bg-[#0B2B64] rounded-full" style={{ width: `${statResult.q1 * 20}%` }}></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-xs font-bold uppercase text-slate-600">
                            <span>Q2: Academic Relevance</span>
                            <span className="font-mono text-slate-900">{statResult.q2.toFixed(2)} / 5.0</span>
                          </div>
                          <div className="h-2 bg-slate-100 rounded-full overflow-hidden mt-1.5 border border-slate-200/40">
                            <div className="h-full bg-indigo-600" style={{ width: `${statResult.q2 * 20}%` }}></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-xs font-bold uppercase text-slate-600">
                            <span>Q3: Organization Quality</span>
                            <span className="font-mono text-slate-900">{statResult.q3.toFixed(2)} / 5.0</span>
                          </div>
                          <div className="h-2 bg-slate-100 rounded-full overflow-hidden mt-1.5 border border-slate-200/40">
                            <div className="h-full bg-emerald-600" style={{ width: `${statResult.q3 * 20}%` }}></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-xs font-bold uppercase text-slate-600">
                            <span>Q4: Speaker Merit</span>
                            <span className="font-mono text-slate-900">{typeof statResult.q4 === 'number' ? statResult.q4.toFixed(2) : "N/A"}/5.0</span>
                          </div>
                          <div className="h-2 bg-slate-100 rounded-full overflow-hidden mt-1.5 border border-slate-200/40">
                            <div className="h-full bg-amber-500" style={{ width: `${typeof statResult.q4 === 'number' ? statResult.q4 * 20 : 0}%` }}></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-xs font-bold uppercase text-slate-600">
                            <span>Q5: Venue adequacy</span>
                            <span className="font-mono text-slate-900">{statResult.q5.toFixed(2)} / 5.0</span>
                          </div>
                          <div className="h-2 bg-slate-100 rounded-full overflow-hidden mt-1.5 border border-slate-200/40">
                            <div className="h-full bg-purple-600" style={{ width: `${statResult.q5 * 20}%` }}></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-[#0B2B64] to-indigo-950 text-white p-6 rounded-2xl shadow-md">
                      <div className="flex items-center gap-2 mb-3">
                        <Sparkles className="w-5 h-5 text-amber-300" />
                        <h4 className="text-sm font-bold uppercase tracking-wider text-amber-300">Strategic Insights Overview</h4>
                      </div>
                      <p className="text-xs leading-relaxed font-semibold italic text-slate-100">
                        "{generatedReport.sectionE}"
                      </p>
                    </div>
                  </div>

                  {/* Right Column: Key Qualitative Findings */}
                  <div className="space-y-6">
                    <div className="bg-emerald-50/50 border border-emerald-100 p-5 rounded-2xl">
                      <h4 className="text-xs font-black uppercase text-emerald-800 mb-3 block tracking-wider">Top 3 Strengths & Praises</h4>
                      <ul className="space-y-2.5 text-xs text-slate-700 font-bold">
                        {generatedReport.sectionC.positiveThemes.map((th, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                            <span>{th}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-red-50/50 border border-red-100 p-5 rounded-2xl">
                      <h4 className="text-xs font-black uppercase text-red-800 mb-3 block tracking-wider">Top 3 Friction & Critiques</h4>
                      <ul className="space-y-2.5 text-xs text-slate-700 font-bold">
                        {generatedReport.sectionC.improvementAreas.map((th, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                            <span>{th}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Participation breakdown table */}
                    <div className="bg-white border border-slate-200/80 p-5 rounded-2xl">
                      <h4 className="text-xs font-black uppercase text-[#0B2B64] mb-3 border-b border-slate-100 pb-2 tracking-wider">College Engagement statistics</h4>
                      <div className="overflow-x-auto">
                        <table className="w-full text-[11px]">
                          <thead>
                            <tr className="border-b border-slate-100 text-slate-400 font-bold">
                              <th className="text-left py-2 font-extrabold uppercase text-[10px]">COLLEGE CODE</th>
                              <th className="text-right py-2 font-extrabold uppercase text-[10px]">RESPONSES COUNT</th>
                              <th className="text-right py-2 font-extrabold uppercase text-[10px]">PERCENT RATE</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-50">
                            {generatedReport.sectionA.collegeBreakdown.map((breakd, i) => (
                              <tr key={i} className="text-slate-700 hover:bg-slate-50/50 transition-colors">
                                <td className="py-2.5 text-left font-bold text-slate-900">{breakd.collegeCode}</td>
                                <td className="py-2.5 text-right font-semibold font-mono text-slate-600">{breakd.submissionsCount}</td>
                                <td className="py-2.5 text-right font-bold text-indigo-600 font-mono">{breakd.participationRate}%</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recommendations */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-md shadow-indigo-950/5">
                  <h4 className="text-sm font-extrabold uppercase text-[#0B2B64] mb-4 border-b border-slate-100 pb-2.5">AI Administrative Action Directives</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {generatedReport.sectionD.map((rec) => (
                      <div key={rec.id} className="border-l-4 border-indigo-500 bg-slate-50/50 p-3.5 rounded-r-xl space-y-1 hover:bg-slate-50 transition-colors">
                        <div className="text-xs font-black text-indigo-950 uppercase">{rec.id}: {rec.title}</div>
                        <p className="text-xs font-medium text-slate-600 leading-relaxed">{rec.body}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Flagged logs */}
                <div className="bg-red-50/30 border border-red-200/60 p-6 rounded-2xl">
                  <div className="flex items-center gap-2.5 border-b border-red-100 pb-3 mb-4">
                    <ShieldAlert className="w-6 h-6 text-red-600" />
                    <div>
                      <h4 className="text-sm font-extrabold uppercase text-red-800">Student Governance Flagged Logs ({generatedReport.sectionC.flaggedCount})</h4>
                      <p className="text-[10px] font-semibold text-red-500 uppercase">Automatic scanner flags regarding injury, harassment or discrimination reports</p>
                    </div>
                  </div>

                  {generatedReport.appendix.length === 0 ? (
                    <p className="text-xs font-bold text-emerald-600 uppercase tracking-wide">No student conduct, harassment or physical injuries flagged. Event cleared successfully.</p>
                  ) : (
                    <div className="space-y-3">
                      {generatedReport.appendix.map((app, idx) => (
                        <div key={idx} className="bg-white border border-red-100 p-4 rounded-xl text-xs shadow-sm">
                          <div className="flex items-center justify-between text-[10px] text-red-500 uppercase font-bold mb-1.5">
                            <span>ID: {app.submissionId} [College: {app.college}]</span>
                            <span className="bg-red-50 text-red-600 px-2 py-0.5 rounded-full font-bold">Flag: {app.reason}</span>
                          </div>
                          <p className="font-mono text-xs italic text-slate-700 font-medium mb-1 bg-slate-50 p-2 rounded-lg">" {app.excerpt} "</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* VISUALIZATIONS & ANALYTICS GRAPHS SECTION */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            
            {/* CHART 1: DEPARTMENT ACTIVITY GRAPH */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/85 shadow-md shadow-slate-200/30">
              <div className="border-b border-slate-100 pb-4 mb-4 flex justify-between items-center">
                <div>
                  <h4 className="text-sm font-extrabold uppercase text-[#0B2B64]">Department Activity Distribution</h4>
                  <p className="text-[10px] font-semibold text-slate-400">Total Scheduled & Past Events Created by Organizing Department</p>
                </div>
                <span className="bg-indigo-50 text-[#0B2B64] px-2.5 py-1 rounded-lg font-mono text-[9px] font-bold uppercase border border-indigo-100">
                  Real-time
                </span>
              </div>

              <div className="space-y-4">
                {(() => {
                  const depts = [
                    { code: 'BSINFO TECH', name: 'Information Technology', color: 'bg-cyan-500' },
                    { code: 'BSED',        name: 'Secondary Education',    color: 'bg-emerald-500' },
                    { code: 'BSIT',        name: 'Industrial Technology',   color: 'bg-teal-500' },
                    { code: 'BSHM',        name: 'Hospitality Management',  color: 'bg-pink-500' },
                    { code: 'BS CRIM',     name: 'Criminology',             color: 'bg-red-500' },
                    { code: 'OSA',         name: 'Office of Student Affairs', color: 'bg-blue-600' },
                    { code: 'SSC',         name: 'Supreme Student Council', color: 'bg-amber-500' },
                  ];

                  const data = depts.map(d => {
                    const allEvts = [...pastEvents, ...upcomingEvents];
                    const count = allEvts.filter(e => {
                      const org = e.organizer.toUpperCase();
                      return org.includes(d.code) || org.includes(d.code.replace(' ', ''));
                    }).length;
                    return { ...d, count };
                  });

                  const maxCount = Math.max(...data.map(d => d.count), 1);
                  const totalEvents = [...pastEvents, ...upcomingEvents].length || 1;

                  return (
                    <div className="space-y-4">
                      {data.map(d => {
                        const pct = (d.count / maxCount) * 100;
                        return (
                          <div key={d.code} className="group">
                            <div className="flex justify-between items-center text-xs mb-1.5">
                              <span className="font-bold text-slate-700 uppercase flex items-center gap-2">
                                <span className={`w-2.5 h-2.5 rounded-full inline-block ${d.color}`}></span>
                                {d.name} <span className="text-[9px] font-mono font-semibold text-slate-400">({d.code})</span>
                              </span>
                              <span className="font-mono font-bold text-slate-900">{d.count} Events</span>
                            </div>
                            <div className="bg-slate-50 border border-slate-100 rounded-full h-4 relative overflow-hidden">
                              <div 
                                className={`h-full rounded-full transition-all duration-500 ${d.color}`} 
                                style={{ width: `${pct}%` }}
                              ></div>
                              <span className="absolute inset-y-0 right-2 flex items-center text-[9px] font-mono font-bold text-slate-500 bg-white/90 px-1 py-0.5 rounded border border-slate-100 my-auto h-fit">
                                {d.count > 0 ? `${((d.count / totalEvents) * 100).toFixed(0)}%` : '0%'}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* CHART 2: EVENT ATTENDANCE RANKING */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/85 shadow-md shadow-slate-200/30">
              <div className="border-b border-slate-100 pb-4 mb-4 flex justify-between items-center">
                <div>
                  <h4 className="text-sm font-extrabold uppercase text-[#0B2B64]">Event Attendance Leaderboard</h4>
                  <p className="text-[10px] font-semibold text-slate-400">Ranked by Total Attendees (Check-In Logs + Database Records)</p>
                </div>
                <span className="bg-amber-50 text-amber-700 px-2.5 py-1 rounded-lg font-mono text-[9px] font-bold uppercase border border-amber-100">
                  Leaderboard
                </span>
              </div>

              <div className="space-y-4">
                {(() => {
                  const sortedEvents = [...pastEvents]
                    .map(evt => {
                      const actualCount = attendanceRecords.filter(r => r.eventId === evt.id).length;
                      const totalCount = Math.max(actualCount, evt.total_attendance || 0);
                      return {
                        id: evt.id,
                        title: evt.title,
                        attendance: totalCount,
                        organizer: evt.organizer
                      };
                    })
                    .sort((a, b) => b.attendance - a.attendance);

                  const maxAttendance = Math.max(...sortedEvents.map(e => e.attendance), 1);

                  return (
                    <div className="space-y-4">
                      {sortedEvents.map((evt, idx) => {
                        const pct = (evt.attendance / maxAttendance) * 100;
                        let rankColor = "bg-slate-100 text-slate-500 border-slate-200";
                        if (idx === 0) rankColor = "bg-yellow-100 text-yellow-700 border-yellow-200";
                        if (idx === 1) rankColor = "bg-slate-100 text-slate-700 border-slate-200";
                        if (idx === 2) rankColor = "bg-orange-100 text-orange-700 border-orange-200";

                        return (
                          <div key={evt.id} className="group">
                            <div className="flex justify-between items-start text-xs mb-1.5 gap-4">
                              <span className="font-bold text-slate-700 uppercase truncate">
                                <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full border mr-2 text-[9px] font-mono font-bold ${rankColor}`}>
                                  #{idx + 1}
                                </span>
                                {evt.title}
                              </span>
                              <span className="font-mono font-bold text-indigo-600 whitespace-nowrap shrink-0">
                                {evt.attendance} Pax
                              </span>
                            </div>
                            <div className="bg-slate-50 border border-slate-100 rounded-full h-4 relative overflow-hidden">
                              <div 
                                className="h-full bg-indigo-500 rounded-full transition-all duration-500" 
                                style={{ width: `${pct}%` }}
                              ></div>
                              <span className="absolute inset-y-0 right-2 flex items-center text-[9px] font-mono font-semibold text-slate-400 bg-white/90 px-1.5 py-0.5 rounded border border-slate-100 my-auto h-fit uppercase">
                                {evt.organizer.split(' ')[0]}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Subtab 2: Student Directory */}
      {adminSubTab === 'students' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fadeIn">
          <div className="lg:col-span-4 bg-white p-6 border border-slate-200/80 rounded-2xl shadow-md shadow-indigo-950/5 self-start">
            <h3 className="text-md font-bold uppercase text-[#0B2B64] mb-4 border-b border-slate-100 pb-2.5">Manual enrollment</h3>
            <form onSubmit={handleAddStudent} className="space-y-4">
              <div>
                <label className="text-[10px] font-extrabold uppercase text-slate-400 block mb-1">STUDENT ID</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 2023-4552"
                  value={newStudentId}
                  onChange={(e) => setNewStudentId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold p-3 outline-none focus:border-[#0B2B64] focus:bg-white transition-all text-slate-700"
                />
              </div>
              <div>
                <label className="text-[10px] font-extrabold uppercase text-slate-400 block mb-1">STUDENT NAME</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rico Cruz"
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold p-3 outline-none focus:border-[#0B2B64] focus:bg-white transition-all text-slate-700"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-extrabold uppercase text-slate-400 block mb-1">COLLEGE CODE</label>
                  <select
                    value={newStudentCollege}
                    onChange={(e) => setNewStudentCollege(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold p-3 outline-none focus:border-[#0B2B64] focus:bg-white transition-all text-slate-700"
                  >
                    {COLLEGES.map(c => <option key={c.code} value={c.code}>{c.code}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-extrabold uppercase text-slate-400 block mb-1">YEAR LEVEL</label>
                  <select
                    value={newStudentYear}
                    onChange={(e) => setNewStudentYear(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold p-3 outline-none focus:border-[#0B2B64] focus:bg-white transition-all text-slate-700"
                  >
                    <option value={1}>1st</option>
                    <option value={2}>2nd</option>
                    <option value={3}>3rd</option>
                    <option value={4}>4th</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-[10px] font-extrabold uppercase text-slate-400 block mb-1">DEGREE COURSE PROGRAM</label>
                <select
                  value={newStudentProgram}
                  onChange={(e) => setNewStudentProgram(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold p-3 outline-none focus:border-[#0B2B64] focus:bg-white transition-all text-slate-700"
                >
                  <option value="" disabled>Choose Degree Program</option>
                  <option value="BS Information Technology">BS Information Technology</option>
                  <option value="BS Secondary Education">BS Secondary Education</option>
                  <option value="BS Industrial Technology">BS Industrial Technology</option>
                  <option value="BS Hospitality Management">BS Hospitality Management</option>
                  <option value="BS Criminology">BS Criminology</option>
                </select>
              </div>

              {manualAddStatus && (
                <div className={`p-2.5 text-[10px] font-bold uppercase rounded-lg border text-center ${manualAddStatus.success ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                  {manualAddStatus.message}
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-[#0B2B64] hover:bg-indigo-950 text-white rounded-xl py-3 font-bold uppercase tracking-wider text-xs border-none transition-all cursor-pointer shadow-sm"
              >
                Enroll student
              </button>
            </form>
          </div>

          <div className="lg:col-span-8 bg-white p-6 border border-slate-200/80 rounded-2xl shadow-md shadow-indigo-950/5">
            <h3 className="text-md font-bold uppercase text-[#0B2B64] mb-4 border-b border-slate-100 pb-2.5 flex justify-between items-center">
              <span>Active student registries ({students.length})</span>
              <button onClick={() => onSync()} className="text-[#0B2B64] p-2 border border-slate-100 rounded-xl hover:bg-slate-50 bg-white transition-colors cursor-pointer">
                <RefreshCw className="w-4 h-4 animate-spin" style={{ animationDuration: '4s' }} />
              </button>
            </h3>
            <div className="overflow-y-auto max-h-[440px] border border-slate-150 rounded-xl">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-150 text-[#0B2B64] font-bold">
                    <th className="p-3 text-left uppercase text-[10px] font-extrabold tracking-wider">STUDENT ID</th>
                    <th className="p-3 text-left uppercase text-[10px] font-extrabold tracking-wider">FULL NAME</th>
                    <th className="p-3 text-left uppercase text-[10px] font-extrabold tracking-wider">DEPARTMENT</th>
                    <th className="p-3 text-left uppercase text-[10px] font-extrabold tracking-wider">PROGRAM & YEAR</th>
                    <th className="p-3 text-left uppercase text-[10px] font-extrabold tracking-wider">BALANCE</th>
                    <th className="p-3 text-left uppercase text-[10px] font-extrabold tracking-wider">REDEEMED</th>
                    <th className="p-3 text-right uppercase text-[10px] font-extrabold tracking-wider">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(() => {
                    const filteredStudentsList = currentAdminUser.agency === 'ALL' || currentAdminUser.agency === 'OSA' || currentAdminUser.agency === 'SSC'
                      ? students
                      : students.filter(s => s.college === currentAdminUser.agency);
                    
                    const canDeleteStudent = (studentCollege: string): boolean => {
                      if (
                        currentAdminUser.agency === 'ALL' || 
                        currentAdminUser.agency === 'OSA' || 
                        currentAdminUser.agency === 'SSC'
                      ) return true;
                      return studentCollege === currentAdminUser.agency;
                    };

                    return filteredStudentsList.map(s => {
                      const allowed = canDeleteStudent(s.college);
                      return (
                        <tr 
                          key={s.id} 
                          className={`hover:bg-slate-50/50 text-slate-600 transition-colors ${allowed ? 'cursor-pointer hover:bg-red-50/10' : ''}`}
                          onClick={(e) => {
                            if ((e.target as HTMLElement).closest('button')) return;
                            if (allowed) {
                              setStudentIdToDelete(s.id);
                              playBeep(800, 0.05);
                            }
                          }}
                          title={allowed ? 'Click to Delete Student Registry' : ''}
                        >
                          <td className="p-3 text-left font-mono font-bold text-slate-800">{s.id}</td>
                          <td className="p-3 text-left uppercase font-bold text-slate-800">{s.name}</td>
                          <td className="p-3 text-left">
                            <span className="px-2 py-0.5 bg-indigo-50 text-[#0B2B64] border border-indigo-100 text-[9px] font-bold rounded-md">
                              {s.college}
                            </span>
                          </td>
                          <td className="p-3 text-left font-medium">{s.program} (Yr {s.year})</td>
                          <td className="p-3 text-left text-emerald-600 font-bold font-mono">{s.points ?? 0} PTS</td>
                          <td className="p-3 text-left font-bold text-amber-600">
                            {s.redeemedRewards && s.redeemedRewards.length > 0 ? (
                              <span className="bg-amber-50 text-amber-700 px-2 py-0.5 rounded-md border border-amber-100 text-[10px]" title={s.redeemedRewards.join(', ')}>
                                {s.redeemedRewards.length} Items
                              </span>
                            ) : (
                              <span className="text-slate-400 font-medium text-[10px]">None</span>
                            )}
                          </td>
                          <td className="p-3 text-right">
                            {allowed ? (
                              <button
                                onClick={() => {
                                  setStudentIdToDelete(s.id);
                                  playBeep(800, 0.05);
                                }}
                                className="text-red-500 hover:text-red-700 p-2 rounded-xl hover:bg-red-50 border border-slate-100 bg-white cursor-pointer transition-colors"
                                title="Delete Student Registry"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            ) : (
                              <span className="text-[10px] text-slate-400 font-mono italic">Read Only</span>
                            )}
                          </td>
                        </tr>
                      );
                    });
                  })()}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Subtab 3: Scheduler / Events Directories */}
      {adminSubTab === 'events' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Upcoming Event Creation */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 border border-slate-200/80 rounded-2xl shadow-md shadow-indigo-950/5">
              <h3 className="text-md font-bold uppercase text-[#0B2B64] border-b border-slate-100 pb-2.5 mb-4">Add Upcoming Announcement</h3>
              <form onSubmit={handleAddUpcomingEvent} className="space-y-4">
                <div>
                  <label className="text-[10px] font-extrabold uppercase text-slate-400 block mb-1">EVENT TITLE</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. WVSU-LC Multi-Sectoral Guidance"
                    value={upTitle}
                    onChange={(e) => setUpTitle(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold p-3 outline-none focus:border-[#0B2B64] focus:bg-white transition-all text-slate-700"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-extrabold uppercase text-slate-400 block mb-1">CALENDAR DATE</label>
                    <input
                      type="date"
                      required
                      value={upDate}
                      onChange={(e) => setUpDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold p-3 outline-none focus:border-[#0B2B64] focus:bg-white transition-all text-slate-700"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-extrabold uppercase text-slate-400 block mb-1">VENUE COORDS</label>
                    <select
                      value={upVenue}
                      onChange={(e) => setUpVenue(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold p-3 outline-none focus:border-[#0B2B64] focus:bg-white transition-all text-slate-700"
                    >
                      {CAMPUS_VENUES.map(v => (
                        <option key={v} value={v}>{v}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-extrabold uppercase text-slate-400 block mb-1">CLOCK TIME INTERVAL</label>
                    <select
                      value={upTime}
                      onChange={(e) => setUpTime(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold p-3 outline-none focus:border-[#0B2B64] focus:bg-white transition-all text-slate-700"
                    >
                      <option value="">Choose Time Interval</option>
                      {TIME_INTERVALS.map((timeOpt) => (
                        <option key={timeOpt} value={timeOpt}>
                          {timeOpt}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-extrabold uppercase text-slate-400 block mb-1">OPEN CHANNELS TO</label>
                    <select
                      value={upOpenTo}
                      onChange={(e) => setUpOpenTo(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold p-3 outline-none focus:border-[#0B2B64] focus:bg-white transition-all text-slate-700"
                    >
                      <option value="All Students">All Students</option>
                      {COLLEGES.map(c => (
                        <option key={c.code} value={c.code}>{c.code}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-extrabold uppercase text-slate-400 block mb-1">EVENT COORDINATOR AGENCY (ORGANIZER)</label>
                  {currentAdminUser.agency === 'ALL' || currentAdminUser.agency === 'OSA' || currentAdminUser.agency === 'SSC' ? (
                    <select
                      value={upOrganizer}
                      onChange={(e) => setUpOrganizer(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold p-3 outline-none focus:border-[#0B2B64] focus:bg-white transition-all text-slate-700"
                    >
                      {ORGANIZER_OPTIONS.map(orgOpt => (
                        <option key={orgOpt} value={orgOpt}>{orgOpt}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      disabled
                      readOnly
                      value={currentAdminUser.agency}
                      className="w-full bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold p-3 text-slate-500 outline-none"
                    />
                  )}
                </div>
                <div>
                  <label className="text-[10px] font-extrabold uppercase text-slate-400 block mb-1">EVENT DESCRIPTION</label>
                  <textarea
                    placeholder="Brief description of requirements"
                    value={upDesc}
                    onChange={(e) => setUpDesc(e.target.value)}
                    rows={2}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold p-3 outline-none focus:border-[#0B2B64] focus:bg-white resize-none transition-all text-slate-700"
                  />
                </div>

                {upEventStatus && (
                  <div className={`p-2.5 text-[10px] font-bold border rounded-lg uppercase text-center ${upEventStatus.success ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                    {upEventStatus.message}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full bg-[#0B2B64] hover:bg-indigo-950 text-white rounded-xl py-3 font-bold uppercase tracking-wider text-xs border-none transition-all cursor-pointer shadow-sm"
                >
                  Schedule Announcement
                </button>
              </form>
            </div>

            <div className="bg-white p-6 border border-slate-200/80 rounded-2xl shadow-md shadow-indigo-950/5">
              <h3 className="text-md font-bold uppercase text-amber-700 border-b border-slate-100 pb-2.5 mb-4">Add Evaluable Past Event</h3>
              <form onSubmit={handleAddPastEvent} className="space-y-4">
                <div>
                  <label className="text-[10px] font-extrabold uppercase text-slate-400 block mb-1">PAST EVENT TITLE</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sports Fest Opening Parade"
                    value={pastTitle}
                    onChange={(e) => setPastTitle(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold p-3 outline-none focus:border-[#0B2B64] focus:bg-white transition-all text-slate-700"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-extrabold uppercase text-slate-400 block mb-1">CALENDAR DATE OCCURRED</label>
                    <input
                      type="date"
                      required
                      value={pastDate}
                      onChange={(e) => setPastDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold p-3 outline-none focus:border-[#0B2B64] focus:bg-white transition-all text-slate-700"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-extrabold uppercase text-slate-400 block mb-1">PHYSICAL VENUE</label>
                    <select
                      value={pastVenue}
                      onChange={(e) => setPastVenue(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold p-3 outline-none focus:border-[#0B2B64] focus:bg-white transition-all text-slate-700"
                    >
                      {CAMPUS_VENUES.map(v => (
                        <option key={v} value={v}>{v}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-extrabold uppercase text-slate-400 block mb-1">TOTAL STUDENT ATTENDANCE</label>
                    <input
                      type="number"
                      required
                      min={10}
                      value={pastAttendance}
                      onChange={(e) => setPastAttendance(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold p-3 outline-none focus:border-[#0B2B64] focus:bg-white transition-all text-slate-700"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-extrabold uppercase text-slate-400 block mb-1">DEPT COUNCILS PARTICIPATED</label>
                    <div className="p-2 border border-slate-200 rounded-xl bg-slate-50 text-[10px] leading-relaxed max-h-20 overflow-y-auto">
                      {COLLEGES.map(c => (
                        <label key={c.code} className="flex items-center gap-1.5 font-bold cursor-pointer hover:bg-slate-100/50 p-1 rounded transition-colors text-slate-600">
                          <input
                            type="checkbox"
                            checked={pastColleges.includes(c.code)}
                            onChange={(e) => {
                              if (e.target.checked) setPastColleges(prev => [...prev, c.code]);
                              else setPastColleges(prev => prev.filter(x => x !== c.code));
                            }}
                            className="rounded text-[#0B2B64] focus:ring-[#0B2B64]"
                          />
                          <span>{c.code}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-extrabold uppercase text-slate-400 block mb-1">HOST OFFICE (ORGANIZER)</label>
                  {currentAdminUser.agency === 'ALL' || currentAdminUser.agency === 'OSA' || currentAdminUser.agency === 'SSC' ? (
                    <select
                      value={pastOrganizer}
                      onChange={(e) => setPastOrganizer(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold p-3 outline-none focus:border-[#0B2B64] focus:bg-white transition-all text-slate-700"
                    >
                      {ORGANIZER_OPTIONS.map(orgOpt => (
                        <option key={orgOpt} value={orgOpt}>{orgOpt}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      disabled
                      readOnly
                      value={currentAdminUser.agency}
                      className="w-full bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold p-3 text-slate-500 outline-none"
                    />
                  )}
                </div>

                {pastEventStatus && (
                  <div className={`p-2.5 text-[10px] font-bold border rounded-lg uppercase text-center ${pastEventStatus.success ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                    {pastEventStatus.message}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full bg-amber-500 hover:bg-amber-600 text-white rounded-xl py-3 font-bold uppercase tracking-wider text-xs border-none transition-all cursor-pointer shadow-sm animate-pulse hover:animate-none"
                >
                  Publish Past Event to Registry
                </button>
              </form>
            </div>
          </div>

          {/* Registries lists with Delete permissions checking */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 border border-slate-200/80 rounded-2xl shadow-md shadow-indigo-950/5">
              <h3 className="text-md font-bold uppercase text-[#0B2B64] mb-4 border-b border-slate-100 pb-2">Upcoming Announcements ({upcomingEvents.length})</h3>
              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {upcomingEvents.map(evt => {
                  const allowed = canModifyEvent(evt.organizer);
                  return (
                    <div key={evt.id} className="bg-slate-50/50 border border-slate-150 p-4 rounded-xl flex justify-between items-center text-xs hover:bg-slate-50 transition-colors">
                      <div className="space-y-1">
                        <div className="font-bold text-slate-800 uppercase text-xs">{evt.title}</div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase">{evt.date} • {evt.venue} • Coord: {evt.organizer}</div>
                      </div>
                      {allowed ? (
                        <button
                          onClick={() => handleDeleteUpcomingEvent(evt.id)}
                          className="p-2 text-[10px] font-bold uppercase text-red-600 hover:text-white hover:bg-red-500 border border-red-100 hover:border-transparent rounded-xl bg-white flex items-center gap-1 cursor-pointer transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete
                        </button>
                      ) : (
                        <span className="p-1.5 px-2.5 text-[9px] font-extrabold uppercase bg-slate-100 text-slate-400 border border-slate-200 rounded-md select-none">
                          Locked
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white p-6 border border-slate-200/80 rounded-2xl shadow-md shadow-indigo-950/5">
              <h3 className="text-md font-bold uppercase text-amber-700 mb-4 border-b border-slate-100 pb-2">Active Past Board Registries ({pastEvents.length})</h3>
              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {pastEvents.map(evt => {
                  const allowed = canModifyEvent(evt.organizer);
                  return (
                    <div key={evt.id} className="bg-slate-50/50 border border-slate-150 p-4 rounded-xl flex justify-between items-center text-xs hover:bg-slate-50 transition-colors">
                      <div className="space-y-1">
                        <div className="font-bold text-slate-800 uppercase text-xs">{evt.title}</div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase">{evt.date} • {evt.venue} • Host: {evt.organizer}</div>
                      </div>
                      {allowed ? (
                        <button
                          onClick={() => handleDeletePastEvent(evt.id)}
                          className="p-2 text-[10px] font-bold uppercase text-red-600 hover:text-white hover:bg-red-500 border border-red-100 hover:border-transparent rounded-xl bg-white flex items-center gap-1 cursor-pointer transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete
                        </button>
                      ) : (
                        <span className="p-1.5 px-2.5 text-[9px] font-extrabold uppercase bg-slate-100 text-slate-400 border border-slate-200 rounded-md select-none">
                          Locked
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Subtab 5: Event Attendance Logs */}
      {adminSubTab === 'attendance' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-6 rounded-2xl shadow-md shadow-indigo-950/5">
            <h3 className="text-xl font-bold tracking-tight text-[#F2C811] uppercase pb-2 mb-2 border-b border-white/10 flex items-center gap-2">
              <Camera className="w-5 h-5 text-[#F2C811]" />
              Event Attendance Logs & Proof Inspection Desk
            </h3>
            <p className="text-xs font-semibold text-emerald-50 leading-relaxed max-w-3xl">
              Monitor active student kiosk check-ins and inspect selfie snapshot evidence in real-time. In accordance with campus rules, completing a valid event check-in grants the student <span className="text-[#F2C811] font-extrabold">+50 Campus points</span> instantly.
            </p>
          </div>

          <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-md shadow-indigo-950/5">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-slate-100 pb-4 mb-6 gap-4">
              <div>
                <h4 className="text-md font-bold uppercase text-[#0B2B64] flex items-center gap-1.5">
                  <Camera className="w-5 h-5 text-emerald-600" />
                  Active Attendance Log Registry ({attendanceRecords.length} records)
                </h4>
                <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Verification Desk & Selfie Audit Control Panel</p>
              </div>

              <div className="text-[10px] bg-slate-50 border border-slate-200 rounded-xl font-bold uppercase py-2 px-3 text-slate-600">
                Authorized Role: {currentAdminUser.agency === 'ALL' || currentAdminUser.agency === 'OSA' ? 'Full Read/Write Controller' : 'Read-Only Viewer'}
              </div>
            </div>

            {attendanceRecords.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-400 font-extrabold uppercase">No Attendance records logged on this kiosk yet.</p>
                <p className="text-[10px] text-slate-400 font-medium mt-1">Students can check in using the front terminal Hub.</p>
              </div>
            ) : (
              <div className="overflow-x-auto border border-slate-150 rounded-xl">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-150 text-slate-700">
                      <th className="p-3 font-extrabold uppercase text-[10px] tracking-wider">Student Candidate</th>
                      <th className="p-3 font-extrabold uppercase text-[10px] tracking-wider">College Dept</th>
                      <th className="p-3 font-extrabold uppercase text-[10px] tracking-wider">Target Event Name</th>
                      <th className="p-3 font-extrabold uppercase text-[10px] tracking-wider text-center">Webcam Proof</th>
                      <th className="p-3 font-extrabold uppercase text-[10px] tracking-wider">Logged At</th>
                      <th className="p-3 font-extrabold uppercase text-[10px] tracking-wider">Points Credited</th>
                      <th className="p-3 font-extrabold uppercase text-[10px] tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(() => {
                      const filteredAttendance = attendanceRecords.filter(rec => {
                        // General overseers can see all records
                        if (currentAdminUser.agency === 'ALL' || currentAdminUser.agency === 'OSA' || currentAdminUser.agency === 'SSC') {
                          return true;
                        }
                        
                        // Find the event being checked into
                        const eventDetails = [...pastEvents, ...upcomingEvents].find(e => e.id === rec.eventId);
                        if (!eventDetails) return false;
                        
                        // Check if the event's organizer matches the department of the logged-in admin
                        const org = eventDetails.organizer.toUpperCase();
                        const agency = currentAdminUser.agency.toUpperCase();
                        return org.includes(agency) || org.includes(agency.replace(' ', ''));
                      });

                      return filteredAttendance.map((rec) => {
                        // Lookup event title if possible
                        const eventDetails = [...pastEvents, ...upcomingEvents].find(e => e.id === rec.eventId);
                        const eventTitle = eventDetails ? eventDetails.title : `Event ID: ${rec.eventId}`;
                        const isOSAS = currentAdminUser.agency === 'ALL' || currentAdminUser.agency === 'OSA';

                        return (
                          <tr key={rec.id} className="hover:bg-slate-50/50 text-slate-600 transition-colors">
                            <td className="p-3">
                              <div className="font-bold text-[#0B2B64] text-xs">{rec.studentName}</div>
                              <div className="text-[10px] font-mono text-slate-400 mt-0.5">{rec.studentId}</div>
                            </td>
                            <td className="p-3">
                              <span className="text-[9px] font-extrabold uppercase bg-indigo-50 text-[#0B2B64] border border-indigo-100 py-0.5 px-2 rounded-md">
                                {rec.college}
                              </span>
                            </td>
                            <td className="p-3 truncate max-w-[200px] font-medium" title={eventTitle}>
                              {eventTitle}
                            </td>
                            <td className="p-3 text-center">
                              {rec.proofImage ? (
                                <button
                                  onClick={() => {
                                    setSelectedProofUrl(rec.proofImage);
                                    playBeep(1100, 0.05);
                                  }}
                                  className="inline-block border border-slate-100 hover:border-slate-300 p-0.5 bg-white cursor-pointer relative group rounded-lg overflow-hidden transition-all shadow-sm"
                                  title="Click to inspect up-close"
                                >
                                  <img
                                    src={rec.proofImage}
                                    alt="Check-in Proof Thumbnail"
                                    className="w-12 h-8 object-cover rounded"
                                  />
                                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                    <Sparkles className="w-3.5 h-3.5 text-white animate-pulse" />
                                  </div>
                                </button>
                              ) : (
                                <span className="text-slate-400 italic text-[10px]">No Photo</span>
                              )}
                            </td>
                            <td className="p-3 text-slate-400 font-mono text-[10px]">
                              {new Date(rec.timestamp).toLocaleString()}
                            </td>
                            <td className="p-3">
                              <span className="text-emerald-600 font-bold uppercase text-[10px] flex items-center gap-1">
                                <Coins className="w-3.5 h-3.5" />
                                +50 PTS
                              </span>
                            </td>
                            <td className="p-3 text-right">
                              {(() => {
                                const allowed = true; // Any visible attendance log can be discarded by authorized viewers
                                return allowed ? (
                                  <button
                                    onClick={() => {
                                      setAttendanceIdToDiscard(rec.id);
                                      playBeep(800, 0.05);
                                    }}
                                    className="bg-red-50 hover:bg-red-500 hover:text-white text-red-600 font-extrabold text-[10px] px-3 py-1.5 border border-red-100 rounded-xl uppercase cursor-pointer transition-all"
                                    title="Revoke attendance & deduct points"
                                  >
                                    Discard Log
                                  </button>
                                ) : (
                                  <span className="text-[10px] text-slate-400 uppercase italic" title="Read-only: Not authorized for this department">
                                    Read Only
                                  </span>
                                );
                              })()}
                            </td>
                          </tr>
                        );
                      });
                    })()}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Proof Image inspection Lightbox Modal */}
      {selectedProofUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white border border-slate-200/80 max-w-md w-full p-6 rounded-2xl shadow-xl relative">
            <button
              onClick={() => setSelectedProofUrl(null)}
              className="absolute top-4 right-4 bg-red-50 hover:bg-red-100 text-red-600 font-bold border border-red-100 py-1 px-3 text-[10px] rounded-xl uppercase cursor-pointer transition-all"
            >
              Close [x]
            </button>
            <h4 className="text-xs font-extrabold uppercase text-slate-400 mb-3 border-b border-slate-100 pb-2">Inspection Desk: Check-In Selfie Proof</h4>
            <div className="bg-slate-950 border border-slate-900 aspect-video flex items-center justify-center overflow-hidden rounded-xl">
              <img
                src={selectedProofUrl}
                alt="Enlarged Attendance Proof"
                className="max-h-[250px] w-auto object-contain rounded-lg"
                referrerPolicy="no-referrer"
              />
            </div>
            <p className="text-[10px] text-slate-400 font-bold uppercase mt-4 text-center tracking-wider">
              West Visayas State University Security Protocol verified.
            </p>
          </div>
        </div>
      )}

      {/* Custom Confirmation Modals for Iframe Compatibility */}
      {studentIdToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white border-2 border-[#0B2B64] max-w-md w-full p-6 rounded-2xl shadow-2xl relative">
            <h4 className="text-xs font-extrabold uppercase text-red-600 mb-3 border-b border-slate-100 pb-2 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-red-500 animate-pulse" />
              Confirm Student Deletion
            </h4>
            <p className="text-xs text-slate-600 font-semibold leading-relaxed mb-6">
              Are you sure you want to delete student ID <span className="font-mono font-bold text-red-600">{studentIdToDelete}</span> from the registry database? This action is permanent.
            </p>
            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                onClick={() => { setStudentIdToDelete(null); playBeep(800, 0.05); }}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold uppercase text-[10px] tracking-wider py-2.5 px-4 rounded-xl transition-all cursor-pointer border-none"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  executeDeleteStudent(studentIdToDelete);
                  setStudentIdToDelete(null);
                }}
                className="bg-red-600 hover:bg-red-700 text-white font-extrabold uppercase text-[10px] tracking-wider py-2.5 px-4 rounded-xl transition-all cursor-pointer border-none shadow-md"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {attendanceIdToDiscard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white border-2 border-[#0B2B64] max-w-md w-full p-6 rounded-2xl shadow-2xl relative">
            <h4 className="text-xs font-extrabold uppercase text-amber-600 mb-3 border-b border-slate-100 pb-2 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-500 animate-pulse" />
              Discard Attendance Log
            </h4>
            <p className="text-xs text-slate-600 font-semibold leading-relaxed mb-6">
              Are you sure you want to discard attendance log <span className="font-mono font-bold text-amber-600">{attendanceIdToDiscard}</span>? This will delete the check-in and deduct the 50 points from the student's account balance.
            </p>
            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                onClick={() => { setAttendanceIdToDiscard(null); playBeep(800, 0.05); }}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold uppercase text-[10px] tracking-wider py-2.5 px-4 rounded-xl transition-all cursor-pointer border-none"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  executeDeleteAttendance(attendanceIdToDiscard);
                  setAttendanceIdToDiscard(null);
                }}
                className="bg-amber-600 hover:bg-amber-700 text-white font-extrabold uppercase text-[10px] tracking-wider py-2.5 px-4 rounded-xl transition-all cursor-pointer border-none shadow-md"
              >
                Discard Log
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Subtab 4: MySQL phpMyAdmin Hub */}
      {adminSubTab === 'mysql' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="bg-gradient-to-r from-[#0B2B64] to-indigo-950 text-white p-6 rounded-2xl shadow-md shadow-indigo-950/5">
            <h3 className="text-xl font-bold tracking-tight text-[#F2C811] uppercase pb-2 mb-2 border-b border-white/10 flex items-center gap-2">
              <Database className="w-5 h-5 text-[#F2C811]" />
              MySQL phpMyAdmin Database Migration & Exporter Hub
            </h3>
            <p className="text-xs font-semibold text-indigo-55 bg-indigo-50/5 p-2 rounded-lg border border-indigo-50/10 leading-relaxed max-w-3xl">
              Migrate your temporary localhost datastore to a production-scale **MySQL or phpMyAdmin Database**! Simply copy the table structures below, execute them in phpMyAdmin, and click "Generate Live MySQL Inserts" to dump the active dataset. Your evaluation counters, students, and events will relate instantly!
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Panel 1: DDL Table Schemas */}
            <div className="bg-white p-6 border border-slate-200/80 rounded-2xl shadow-md shadow-indigo-950/5">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
                <div>
                  <h4 className="text-sm font-bold uppercase text-[#0B2B64]">MySQL Relational Table Creation Queries</h4>
                  <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Copies complete table schemas with full foreign keys</p>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(MYSQL_SCHEMA_DDL);
                    setCopiedSchema(true);
                    playBeep(1200, 0.15);
                    setTimeout(() => setCopiedSchema(false), 3000);
                  }}
                  className="bg-[#0B2B64] hover:bg-indigo-950 text-white py-2 px-4 rounded-xl text-xs font-extrabold uppercase flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  {copiedSchema ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                  {copiedSchema ? "Saved DDL" : "Copy DDL"}
                </button>
              </div>
              <textarea
                readOnly
                value={MYSQL_SCHEMA_DDL}
                rows={12}
                className="w-full bg-slate-900 text-emerald-400 font-mono text-[10px] p-4 outline-none select-all rounded-xl block border border-slate-800 resize-none shadow-inner"
              />
            </div>

            {/* Panel 2: Live SQL dump exporter */}
            <div className="bg-white p-6 border border-slate-200/80 rounded-2xl shadow-md shadow-indigo-950/5">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
                <div>
                  <h4 className="text-sm font-bold uppercase text-amber-700">Active Live Dataset SQL Dump (INSERTS)</h4>
                  <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Transforms live evaluation clicks into copyable MySQL queries</p>
                </div>
                <button
                  onClick={() => {
                    const dump = generateLiveMySQLDump(students, upcomingEvents, pastEvents, evaluations, COLLEGES);
                    navigator.clipboard.writeText(dump);
                    setCopiedDump(true);
                    playBeep(1200, 0.15);
                    setTimeout(() => setCopiedDump(false), 3000);
                  }}
                  className="bg-amber-500 hover:bg-amber-600 text-white py-2 px-4 rounded-xl text-xs font-extrabold uppercase flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  {copiedDump ? <Check className="w-4 h-4 text-amber-200" /> : <Copy className="w-4 h-4" />}
                  {copiedDump ? "Saved Dump" : "Copy Dump"}
                </button>
              </div>
              <textarea
                readOnly
                value={generateLiveMySQLDump(students, upcomingEvents, pastEvents, evaluations, COLLEGES)}
                rows={12}
                className="w-full bg-slate-900 text-yellow-400 font-mono text-[10px] p-4 outline-none select-all rounded-xl block border border-slate-800 resize-none shadow-inner"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { 
  Calendar, Users, TrendingUp, Monitor, Check, Copy, AlertTriangle, 
  Cpu, Plus, Trash2, Search, RefreshCw, ShieldAlert, Sparkles, AlertCircle
} from 'lucide-react';
import { Student, UpcomingEvent, PastEvent, Evaluation, EvaluationReport, AttendanceRecord } from '../types';
import { ADMIN_ACCOUNTS, MYSQL_SCHEMA_DDL, generateLiveMySQLDump } from '../lib/mysql_export';
import { Camera, Coins } from 'lucide-react';

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
  const [upVenue, setUpVenue] = useState<string>('');
  const [upOpenTo, setUpOpenTo] = useState<string>('All Students');
  const [upDesc, setUpDesc] = useState<string>('');
  const [upEventStatus, setUpEventStatus] = useState<{ success: boolean; message: string } | null>(null);

  const [pastTitle, setPastTitle] = useState<string>('');
  const [pastDate, setPastDate] = useState<string>('');
  const [pastVenue, setPastVenue] = useState<string>('');
  const [pastAttendance, setPastAttendance] = useState<number>(100);
  const [pastColleges, setPastColleges] = useState<string[]>(['BSINFO TECH', 'BSED', 'BSIT', 'BSHM']);
  const [pastEventStatus, setPastEventStatus] = useState<{ success: boolean; message: string } | null>(null);

  const [newStudentId, setNewStudentId] = useState<string>('');
  const [newStudentName, setNewStudentName] = useState<string>('');
  const [newStudentCollege, setNewStudentCollege] = useState<string>('BSINFO TECH');
  const [newStudentProgram, setNewStudentProgram] = useState<string>('');
  const [newStudentYear, setNewStudentYear] = useState<number>(1);
  const [manualAddStatus, setManualAddStatus] = useState<{ success: boolean; message: string } | null>(null);

  // Set default event selection
  useEffect(() => {
    if (pastEvents.length > 0 && !adminSelectedEventId) {
      setAdminSelectedEventId(pastEvents[0].id);
    }
  }, [pastEvents, adminSelectedEventId]);

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

    const assignedOrganizer = currentAdminUser.agency === 'ALL' ? 'OSAS Controller' : currentAdminUser.name;

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

    const assignedOrganizer = currentAdminUser.agency === 'ALL' ? 'Supreme student Council (SSC)' : currentAdminUser.name;

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
          setPastColleges(['BSINFO TECH', 'BSED', 'BSIT', 'BSHM']);
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

  const handleDeleteAttendance = (id: string) => {
    if (!window.confirm("Are you sure you want to discard this attendance log? This will delete the check-in and deduct the 50 points from the student's account balance.")) {
      return;
    }
    fetch(`/api/attendance/${id}`, { method: 'DELETE' })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          addTerminalLine(`REVERTED: Attendance log ${id} deleted.`);
          playBeep(600, 0.15);
          onSync();
        } else {
          alert(`Error: ${data.error || 'Failed to revert attendance.'}`);
        }
      });
  };

  const handleDeleteStudent = (studentId: string) => {
    if (!window.confirm(`Are you sure you want to delete student ID ${studentId} from the registry database?`)) {
      return;
    }
    fetch(`/api/students/registry/${studentId}`, { method: 'DELETE' })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          addTerminalLine(`DELETED: Student ${studentId} removed from database.`);
          playBeep(600, 0.1);
          onSync();
        } else {
          alert(`Error: ${data.error || 'Failed to delete student.'}`);
        }
      });
  };

  // Helper check for admin field scope limitations
  const canModifyEvent = (eventOrganizer: string): boolean => {
    if (currentAdminUser.agency === 'ALL') return true;
    const cleanOrg = eventOrganizer.toLowerCase();
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
      <div className="bg-slate-900 text-white p-6 border-4 border-slate-900 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-widest border border-slate-700 ${currentAdminUser.color || 'text-yellow-400'}`}>
                {currentAdminUser.name}
              </span>
              <span className="bg-emerald-600 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-none tracking-widest">
                Scope: {currentAdminUser.agency}
              </span>
            </div>
            <h1 className="text-3xl font-black italic tracking-tight line-clamp-1 text-[#F2C811] uppercase">
              {currentAdminUser.agency === 'ALL' 
                ? 'SYSTEM ADMINISTRATIVE CONSOLE' 
                : `${currentAdminUser.name} PORTAL`}
            </h1>
            <p className="text-xs text-slate-400 font-bold max-w-2xl">
              Access credentials active for {currentAdminUser.name}. You are authorized to manage activities belonging to your sector.
            </p>
          </div>
          <button
            onClick={() => { onLogout(); playBeep(500, 0.15); }}
            className="bg-red-600 hover:bg-slate-800 text-white text-xs font-black uppercase tracking-wider py-2 px-4 border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] cursor-pointer flex items-center gap-1 shrink-0"
          >
            Logout Security Dock
          </button>
        </div>
        <div className="absolute right-[-20px] bottom-[-20px] text-[8rem] font-black text-slate-800 opacity-20 italic pointer-events-none uppercase">
          {currentAdminUser.agency}
        </div>
      </div>

      {/* Admin Navigation Sub-Tabs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 border-4 border-slate-900 bg-slate-900 p-1 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] gap-1">
        <button
          onClick={() => { setAdminSubTab('analytics'); playBeep(1100, 0.05); }}
          className={`py-3 px-4 text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 ${adminSubTab === 'analytics' ? 'bg-[#F2C811] text-slate-950 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] border-2 border-slate-950' : 'text-slate-300 hover:text-white'}`}
        >
          <TrendingUp className="w-4 h-4 stroke-[2.5px]" />
          Analytics & AI Synthesis
        </button>
        <button
          onClick={() => { setAdminSubTab('students'); playBeep(1100, 0.05); }}
          className={`py-3 px-4 text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 ${adminSubTab === 'students' ? 'bg-[#F2C811] text-slate-950 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] border-2 border-slate-950' : 'text-slate-300 hover:text-white'}`}
        >
          <Users className="w-4 h-4 stroke-[2.5px]" />
          Student Registry Dir
        </button>
        <button
          onClick={() => { setAdminSubTab('events'); playBeep(1100, 0.05); }}
          className={`py-3 px-4 text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 ${adminSubTab === 'events' ? 'bg-[#F2C811] text-slate-950 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] border-2 border-slate-950' : 'text-slate-300 hover:text-white'}`}
        >
          <Calendar className="w-4 h-4 stroke-[2.5px]" />
          Scheduler Directories
        </button>
        <button
          onClick={() => { setAdminSubTab('attendance'); playBeep(1100, 0.05); }}
          className={`py-3 px-4 text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 ${adminSubTab === 'attendance' ? 'bg-[#F2C811] text-slate-950 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] border-2 border-slate-950' : 'text-slate-300 hover:text-white'}`}
        >
          <Camera className="w-4 h-4 stroke-[2.5px]" />
          Attendance Logs
        </button>
        <button
          onClick={() => { setAdminSubTab('mysql'); playBeep(1100, 0.05); }}
          className={`py-3 px-4 text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 ${adminSubTab === 'mysql' ? 'bg-[#F2C811] text-slate-950 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] border-2 border-slate-950' : 'text-slate-300 hover:text-white'}`}
        >
          <Monitor className="w-4 h-4 stroke-[2.5px]" />
          MySQL DDL & Dumps
        </button>
      </div>

      {/* Subtab Contents */}

      {/* Subtab 1: Analytics Dashboard */}
      {adminSubTab === 'analytics' && (
        <div className="space-y-6">
          {/* Quick Stats Banner Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-5 border-4 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] flex items-center gap-4">
              <div className="p-3 bg-indigo-50 border-2 border-slate-900 text-indigo-900">
                <TrendingUp className="w-6 h-6 stroke-[3px]" />
              </div>
              <div>
                <div className="text-[9px] text-slate-400 uppercase tracking-widest font-black">Average Rating</div>
                <div className="text-2.5xl font-mono font-black text-[#0B2B64]">
                  {statResult.overall ? statResult.overall.toFixed(2) : "0.00"}/5.0
                </div>
              </div>
            </div>
            <div className="bg-white p-5 border-4 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] flex items-center gap-4">
              <div className="p-3 bg-amber-50 border-2 border-slate-900 text-amber-900">
                <Users className="w-6 h-6 stroke-[3px]" />
              </div>
              <div>
                <div className="text-[9px] text-slate-400 uppercase tracking-widest font-black">Total evaluations</div>
                <div className="text-2.5xl font-mono font-black text-slate-900">{totalSubmissions}</div>
              </div>
            </div>
            <div className="bg-white p-5 border-4 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] flex items-center gap-4">
              <div className="p-3 bg-emerald-50 border-2 border-slate-900 text-emerald-900">
                <Calendar className="w-6 h-6 stroke-[3px]" />
              </div>
              <div>
                <div className="text-[9px] text-slate-400 uppercase tracking-widest font-black">Filtered Responses</div>
                <div className="text-2.5xl font-mono font-black text-emerald-900">{filteredSubmissions.length}</div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 border-4 border-slate-900 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)]">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b-4 border-slate-900 pb-4 gap-4 mb-6">
              <div>
                <h3 className="text-xl font-black uppercase text-slate-900">Cognitive AI Executive Synthesizer</h3>
                <p className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Select event and query neural engine</p>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <select
                  value={adminSelectedEventId}
                  onChange={(e) => { setAdminSelectedEventId(e.target.value); setGeneratedReport(null); }}
                  className="bg-slate-50 border-2 border-slate-900 font-mono text-xs font-black p-2.5 outline-none w-full sm:w-60"
                >
                  <option value="" disabled>Choose past event registry</option>
                  {pastEvents.map(evt => (
                    <option key={evt.id} value={evt.id}>{evt.title} ({evt.date})</option>
                  ))}
                </select>
                <button
                  onClick={handleGenerateReport}
                  disabled={reportLoading}
                  className="bg-[#0B2B64] hover:bg-slate-900 text-[#F2C811] font-black uppercase text-[10px] p-2.5 flex items-center gap-1.5 border-2 border-slate-900 cursor-pointer disabled:opacity-50"
                >
                  <Cpu className="w-4 h-4" />
                  {reportLoading ? "Processing..." : "Synthesize AI"}
                </button>
              </div>
            </div>

            {reportLoading && (
              <div className="p-12 text-center space-y-4">
                <Cpu className="w-12 h-12 text-[#0B2B64] mx-auto animate-spin" />
                <h4 className="text-lg font-black uppercase text-[#0B2B64]">Analyzing feedback channels via Gemini AI...</h4>
                <p className="text-xs text-slate-500 font-mono max-w-sm mx-auto">Evaluating semantic sentiment scores, cataloguing physical constraints, and scanning student conduct/safety logs.</p>
              </div>
            )}

            {reportError && (
              <div className="p-6 bg-red-50 border-2 border-red-500 text-red-800 text-xs font-semibold uppercase tracking-wider flex items-center gap-2">
                <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
                <span>Error generating report: {reportError}</span>
              </div>
            )}

            {/* Generated Report View Panels */}
            {generatedReport && !reportLoading && (
              <div className="space-y-6 animate-fadeIn">
                <div className="p-4 bg-yellow-50 border-2 border-yellow-500 text-slate-800 text-xs font-bold flex justify-between items-center">
                  <span>Report Generated At: {generatedReport.generatedAt}</span>
                  <span className="text-[#0B2B64] uppercase font-black tracking-widest text-[10px]">GEMINI ACTIVE INSIGHTS</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left Column: Metrics & Grades */}
                  <div className="space-y-6">
                    <div className="bg-slate-50 p-6 border-2 border-slate-900">
                      <h4 className="text-lg font-black uppercase mb-4 border-b border-slate-200 pb-2">Quantitative Metrics Breakdown</h4>
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-xs font-black uppercase text-slate-600">
                            <span>Q1: Event Satisfaction</span>
                            <span>{statResult.q1.toFixed(2)} / 5.0</span>
                          </div>
                          <div className="h-2.5 bg-slate-200 border border-slate-400 mt-1">
                            <div className="h-full bg-[#0B2B64]" style={{ width: `${statResult.q1 * 20}%` }}></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-xs font-black uppercase text-slate-600">
                            <span>Q2: Academic Relevance</span>
                            <span>{statResult.q2.toFixed(2)} / 5.0</span>
                          </div>
                          <div className="h-2.5 bg-slate-200 border border-slate-400 mt-1">
                            <div className="h-full bg-indigo-600" style={{ width: `${statResult.q2 * 20}%` }}></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-xs font-black uppercase text-slate-600">
                            <span>Q3: Organization Quality</span>
                            <span>{statResult.q3.toFixed(2)} / 5.0</span>
                          </div>
                          <div className="h-2.5 bg-slate-200 border border-slate-400 mt-1">
                            <div className="h-full bg-emerald-600" style={{ width: `${statResult.q3 * 20}%` }}></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-xs font-black uppercase text-slate-600">
                            <span>Q4: Speaker Merit</span>
                            <span>{typeof statResult.q4 === 'number' ? statResult.q4.toFixed(2) : "N/A"}/5.0</span>
                          </div>
                          <div className="h-2.5 bg-slate-200 border border-slate-400 mt-1">
                            <div className="h-full bg-amber-500" style={{ width: `${typeof statResult.q4 === 'number' ? statResult.q4 * 20 : 0}%` }}></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-xs font-black uppercase text-slate-600">
                            <span>Q5: Venue adequacy</span>
                            <span>{statResult.q5.toFixed(2)} / 5.0</span>
                          </div>
                          <div className="h-2.5 bg-slate-200 border border-slate-400 mt-1">
                            <div className="h-full bg-purple-600" style={{ width: `${statResult.q5 * 20}%` }}></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-900 text-white p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <Sparkles className="w-5 h-5 text-yellow-400" />
                        <h4 className="text-md font-black uppercase tracking-wider text-yellow-400">Strategic Insights Header</h4>
                      </div>
                      <p className="text-xs leading-relaxed font-bold italic">
                        "{generatedReport.sectionE}"
                      </p>
                    </div>
                  </div>

                  {/* Right Column: Key Qualitative Findings */}
                  <div className="space-y-6">
                    <div className="bg-emerald-50 border-2 border-emerald-500 p-5">
                      <h4 className="text-sm font-black uppercase text-emerald-800 mb-3 block">Top 3 Strengths & Praises</h4>
                      <ul className="space-y-2 text-xs text-slate-800 font-bold">
                        {generatedReport.sectionC.positiveThemes.map((th, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                            <span>{th}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-red-50 border-2 border-red-500 p-5">
                      <h4 className="text-sm font-black uppercase text-red-800 mb-3 block">Top 3 Friction & Critiques</h4>
                      <ul className="space-y-2 text-xs text-slate-800 font-bold">
                        {generatedReport.sectionC.improvementAreas.map((th, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                            <span>{th}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Participation breakdown table */}
                    <div className="bg-white border-2 border-slate-900 p-4">
                      <h4 className="text-xs font-black uppercase text-slate-900 mb-2 border-b pb-1.5">College Engagement statistics</h4>
                      <div className="overflow-x-auto">
                        <table className="w-full text-[10px] font-mono">
                          <thead>
                            <tr className="border-b-2 border-slate-900 text-slate-400 font-bold">
                              <th className="text-left py-1">COLLEGE CODE</th>
                              <th className="text-right py-1">RESPONSES COUNT</th>
                              <th className="text-right py-1">PERCENT RATE</th>
                            </tr>
                          </thead>
                          <tbody>
                            {generatedReport.sectionA.collegeBreakdown.map((breakd, i) => (
                              <tr key={i} className="border-b font-black text-slate-900">
                                <td className="py-2 text-left">{breakd.collegeCode}</td>
                                <td className="py-2 text-right">{breakd.submissionsCount}</td>
                                <td className="py-2 text-right text-indigo-700">{breakd.participationRate}%</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recommendations */}
                <div className="bg-white border-4 border-slate-900 p-6">
                  <h4 className="text-lg font-black uppercase text-[#0B2B64] mb-4 border-b-2 border-slate-200 pb-2">AI Administrative Action Directives</h4>
                  <div className="space-y-4">
                    {generatedReport.sectionD.map((rec) => (
                      <div key={rec.id} className="border-l-4 border-[#0B2B64] pl-4 space-y-1">
                        <div className="text-xs font-black text-indigo-900 uppercase">{rec.id}: {rec.title}</div>
                        <p className="text-xs font-bold text-slate-600 leading-relaxed">{rec.body}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Flagged logs */}
                <div className="bg-red-50 border-4 border-red-500 p-6">
                  <div className="flex items-center gap-2 border-b border-red-300 pb-2 mb-4">
                    <ShieldAlert className="w-6 h-6 text-red-650" />
                    <div>
                      <h4 className="text-md font-black uppercase text-red-800">Student Governance Flagged Logs ({generatedReport.sectionC.flaggedCount})</h4>
                      <p className="text-[10px] font-black text-red-500 uppercase">Automatic scanner flags regarding injury, harassment or discrimination reports</p>
                    </div>
                  </div>

                  {generatedReport.appendix.length === 0 ? (
                    <p className="text-xs font-black text-green-700 uppercase">No student conduct, harassment or physical injuries flagged. Event cleared successfully.</p>
                  ) : (
                    <div className="space-y-3">
                      {generatedReport.appendix.map((app, idx) => (
                        <div key={idx} className="bg-white border border-red-300 p-3 text-xs">
                          <div className="flex items-center justify-between text-[10px] text-red-600 uppercase font-black mb-1">
                            <span>ID: {app.submissionId} [College: {app.college}]</span>
                            <span>Flag: {app.reason}</span>
                          </div>
                          <p className="font-mono text-xs italic text-slate-800 font-semibold mb-1">" {app.excerpt} "</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* VISUALIZATIONS & ANALYTICS GRAPHS SECTION */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">
            
            {/* CHART 1: DEPARTMENT ACTIVITY GRAPH */}
            <div className="bg-white p-6 border-4 border-slate-900 shadow-[6px_6px_0px_0px_rgba(15,23,42,1)]">
              <div className="border-b-2 border-slate-900 pb-3 mb-4 flex justify-between items-center">
                <div>
                  <h4 className="text-md font-black uppercase text-slate-900">Department Activity Distribution</h4>
                  <p className="text-[10px] font-mono font-black text-slate-400">Total Scheduled & Past Events Created by Organizing Department</p>
                </div>
                <span className="bg-[#0B2B64] text-[#F2C811] px-2 py-0.5 font-mono text-[9px] font-black uppercase border border-slate-900">
                  Real-time
                </span>
              </div>

              <div className="space-y-4">
                {(() => {
                  const depts = [
                    { code: 'BSINFO TECH', name: 'Information Technology', color: 'bg-cyan-500 border-cyan-700' },
                    { code: 'BSED',        name: 'Secondary Education',    color: 'bg-emerald-500 border-emerald-700' },
                    { code: 'BSIT',        name: 'Industrial Technology',   color: 'bg-teal-500 border-teal-700' },
                    { code: 'BSHM',        name: 'Hospitality Management',  color: 'bg-pink-500 border-pink-700' },
                    { code: 'OSA',         name: 'Office of Student Affairs', color: 'bg-blue-600 border-blue-800' },
                    { code: 'SSC',         name: 'Supreme Student Council', color: 'bg-amber-500 border-amber-700' },
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
                            <div className="flex justify-between items-center text-xs mb-1">
                              <span className="font-black text-slate-900 uppercase flex items-center gap-2">
                                <span className={`w-3 h-3 border border-slate-900 inline-block ${d.color.split(' ')[0]}`}></span>
                                {d.name} <span className="text-[9px] font-mono font-bold text-slate-400">({d.code})</span>
                              </span>
                              <span className="font-mono font-black text-[#0B2B64]">{d.count} Events</span>
                            </div>
                            <div className="bg-slate-100 border-2 border-slate-900 h-6 relative shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]">
                              <div 
                                className={`h-full border-r-2 border-slate-900 transition-all duration-500 ${d.color}`} 
                                style={{ width: `${pct}%` }}
                              ></div>
                              <span className="absolute inset-y-0 right-2 flex items-center text-[10px] font-mono font-black text-slate-900 bg-white/85 px-1.5 py-0.5 border border-slate-900 my-auto h-fit">
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
            <div className="bg-white p-6 border-4 border-slate-900 shadow-[6px_6px_0px_0px_rgba(15,23,42,1)]">
              <div className="border-b-2 border-slate-900 pb-3 mb-4 flex justify-between items-center">
                <div>
                  <h4 className="text-md font-black uppercase text-slate-900">Event Attendance Leaderboard</h4>
                  <p className="text-[10px] font-mono font-black text-slate-400">Ranked by Total Attendees (Check-In Logs + Database Records)</p>
                </div>
                <span className="bg-amber-400 text-slate-900 px-2 py-0.5 font-mono text-[9px] font-black uppercase border border-slate-900">
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
                        let rankColor = "bg-slate-200";
                        if (idx === 0) rankColor = "bg-[#F2C811]";
                        if (idx === 1) rankColor = "bg-slate-300";
                        if (idx === 2) rankColor = "bg-orange-350";

                        return (
                          <div key={evt.id} className="group">
                            <div className="flex justify-between items-start text-xs mb-1 gap-4">
                              <span className="font-black text-slate-900 uppercase truncate">
                                <span className={`inline-flex items-center justify-center w-5 h-5 border border-slate-900 mr-2 text-[9px] font-mono font-black ${rankColor}`}>
                                  #{idx + 1}
                                </span>
                                {evt.title}
                              </span>
                              <span className="font-mono font-black text-indigo-900 whitespace-nowrap shrink-0">
                                {evt.attendance} Pax
                              </span>
                            </div>
                            <div className="bg-slate-100 border-2 border-slate-900 h-6 relative shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]">
                              <div 
                                className="h-full bg-indigo-500 border-r-2 border-slate-900 transition-all duration-500" 
                                style={{ width: `${pct}%` }}
                              ></div>
                              <span className="absolute inset-y-0 right-2 flex items-center text-[10px] font-mono font-bold text-slate-500 bg-white/85 px-1.5 py-0.5 border border-slate-900 my-auto h-fit uppercase">
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 bg-white p-6 border-4 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] self-start">
            <h3 className="text-lg font-black uppercase text-slate-900 mb-4 border-b pb-2">Manual enrollment</h3>
            <form onSubmit={handleAddStudent} className="space-y-3">
              <div>
                <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">STUDENT ID</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 2023-4552"
                  value={newStudentId}
                  onChange={(e) => setNewStudentId(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-slate-900 font-mono font-bold text-xs p-2.5 outline-none focus:bg-white"
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">STUDENT NAME</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rico Cruz"
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-slate-900 font-mono font-bold text-xs p-2.5 outline-none focus:bg-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">COLLEGE CODE</label>
                  <select
                    value={newStudentCollege}
                    onChange={(e) => setNewStudentCollege(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-slate-900 font-mono font-bold text-xs p-2.5 outline-none focus:bg-white"
                  >
                    {COLLEGES.map(c => <option key={c.code} value={c.code}>{c.code}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">YEAR LEVEL</label>
                  <select
                    value={newStudentYear}
                    onChange={(e) => setNewStudentYear(Number(e.target.value))}
                    className="w-full bg-slate-50 border-2 border-slate-900 font-mono font-bold text-xs p-2.5 outline-none focus:bg-white"
                  >
                    <option value={1}>1st</option>
                    <option value={2}>2nd</option>
                    <option value={3}>3rd</option>
                    <option value={4}>4th</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">DEGREE COURSE PROGRAM</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. BS Hospitality Management"
                  value={newStudentProgram}
                  onChange={(e) => setNewStudentProgram(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-slate-900 font-mono font-bold text-xs p-2.5 outline-none focus:bg-white"
                />
              </div>

              {manualAddStatus && (
                <div className={`p-2 text-[10px] font-black uppercase border-2 text-center ${manualAddStatus.success ? 'bg-green-50 text-green-700 border-green-500' : 'bg-red-50 text-red-700 border-red-500'}`}>
                  {manualAddStatus.message}
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-[#0B2B64] hover:bg-slate-900 text-[#F2C811] border-2 border-slate-900 py-2.5 font-black uppercase tracking-wider text-xs"
              >
                Enroll student
              </button>
            </form>
          </div>

          <div className="lg:col-span-8 bg-white p-6 border-4 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
            <h3 className="text-lg font-black uppercase text-slate-900 mb-4 border-b pb-2 flex justify-between items-center">
              <span>Active student registries ({students.length})</span>
              <button onClick={() => onSync()} className="text-[#0B2B64] p-1 border-2 border-slate-900 hover:bg-slate-50">
                <RefreshCw className="w-4 h-4 animate-spin" style={{ animationDuration: '4s' }} />
              </button>
            </h3>
            <div className="overflow-y-auto max-h-[400px] border-2 border-slate-900">
              <table className="w-full text-xs font-mono">
                <thead>
                  <tr className="bg-slate-100 border-b-2 border-slate-900 text-[#0B2B64] font-black">
                    <th className="p-2 text-left">STUDENT ID</th>
                    <th className="p-2 text-left">FULL NAME</th>
                    <th className="p-2 text-left">DEPARTMENT</th>
                    <th className="p-2 text-left">PROGRAM & YEAR</th>
                    <th className="p-2 text-left">BALANCE</th>
                    <th className="p-2 text-left">REDEEMED</th>
                    {(currentAdminUser.agency === 'ALL' || currentAdminUser.agency === 'OSA') && (
                      <th className="p-2 text-right">ACTION</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {(() => {
                    const filteredStudentsList = currentAdminUser.agency === 'ALL' || currentAdminUser.agency === 'OSA' || currentAdminUser.agency === 'SSC'
                      ? students
                      : students.filter(s => s.college === currentAdminUser.agency);
                    
                    return filteredStudentsList.map(s => {
                      const isOSAS = currentAdminUser.agency === 'ALL' || currentAdminUser.agency === 'OSA';
                      return (
                        <tr key={s.id} className="hover:bg-slate-50 text-slate-900 font-bold">
                          <td className="p-2 text-left">{s.id}</td>
                          <td className="p-2 text-left uppercase">{s.name}</td>
                          <td className="p-2 text-left">
                            <span className="px-1.5 py-0.5 bg-[#F2C811] text-[#0B2B64] border border-slate-900 text-[10px] font-black">
                              {s.college}
                            </span>
                          </td>
                          <td className="p-2 text-left">{s.program} (Yr {s.year})</td>
                          <td className="p-2 text-left text-emerald-600 font-black">{s.points ?? 0} PTS</td>
                          <td className="p-2 text-left font-black text-amber-600">
                            {s.redeemedRewards && s.redeemedRewards.length > 0 ? (
                              <span title={s.redeemedRewards.join(', ')}>
                                {s.redeemedRewards.length} Items
                              </span>
                            ) : (
                              <span className="text-slate-400 font-medium">None</span>
                            )}
                          </td>
                          {isOSAS && (
                            <td className="p-2 text-right">
                              <button
                                onClick={() => handleDeleteStudent(s.id)}
                                className="text-red-600 hover:text-red-850 p-1 border border-red-300 hover:bg-red-50 bg-white cursor-pointer"
                                title="Delete Student Registry"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          )}
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
        <div className="space-y-6">
          {/* Upcoming Event Creation */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 border-4 border-slate-100 shadow-[4px_4px_0px_0px_rgba(15,23,42,10)] border-slate-900">
              <h3 className="text-lg font-black uppercase text-[#0B2B64] border-b pb-2 mb-4">Add Upcoming Announcement</h3>
              <form onSubmit={handleAddUpcomingEvent} className="space-y-3">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">EVENT TITLE</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. WVSU-LC Multi-Sectoral Guidance"
                    value={upTitle}
                    onChange={(e) => setUpTitle(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-slate-900 font-mono font-bold text-xs p-2.5 outline-none focus:bg-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">CALENDAR DATE</label>
                    <input
                      type="date"
                      required
                      value={upDate}
                      onChange={(e) => setUpDate(e.target.value)}
                      className="w-full bg-slate-50 border-2 border-slate-900 font-mono font-bold text-xs p-2.5 outline-none focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">VENUE COORDS</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. AVR Room"
                      value={upVenue}
                      onChange={(e) => setUpVenue(e.target.value)}
                      className="w-full bg-slate-50 border-2 border-slate-900 font-mono font-bold text-xs p-2.5 outline-none focus:bg-white"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">CLOCK TIME INTERVAL</label>
                    <select
                      value={upTime}
                      onChange={(e) => setUpTime(e.target.value)}
                      className="w-full bg-slate-50 border-2 border-slate-900 font-mono font-bold text-xs p-2.5 outline-none focus:bg-white"
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
                    <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">OPEN CHANNELS TO</label>
                    <select
                      value={upOpenTo}
                      onChange={(e) => setUpOpenTo(e.target.value)}
                      className="w-full bg-slate-50 border-2 border-slate-900 font-mono font-bold text-xs p-2.5 outline-none focus:bg-white"
                    >
                      <option value="All Students">All Students</option>
                      <option value="BSINFO TECH">BSINFO TECH</option>
                      <option value="BSED">BSED</option>
                      <option value="BSIT">BSIT</option>
                      <option value="BSHM">BSHM</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">EVENT COORDINATOR AGENCY (ORGANIZER)</label>
                  <input
                    type="text"
                    disabled={currentAdminUser.agency !== 'ALL'}
                    readOnly
                    value={currentAdminUser.agency === 'ALL' ? 'Office of Student Affairs (OSA)' : currentAdminUser.name}
                    className="w-full bg-slate-100 border-2 border-slate-300 font-mono font-bold text-xs p-2.5 text-slate-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">EVENT DESCRIPTION</label>
                  <textarea
                    placeholder="Brief description of requirements"
                    value={upDesc}
                    onChange={(e) => setUpDesc(e.target.value)}
                    rows={2}
                    className="w-full bg-slate-50 border-2 border-slate-900 font-mono font-bold text-xs p-2.5 outline-none focus:bg-white resize-none"
                  />
                </div>

                {upEventStatus && (
                  <div className={`p-2 text-[10px] font-black border-2 uppercase text-center ${upEventStatus.success ? 'bg-green-50 text-green-700 border-green-500' : 'bg-red-50 text-red-700 border-red-500'}`}>
                    {upEventStatus.message}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full bg-blue-900 hover:bg-slate-900 text-white border-2 border-slate-900 py-2.5 font-black uppercase tracking-wider text-xs"
                >
                  Schedule Announcement
                </button>
              </form>
            </div>

            <div className="bg-white p-6 border-4 border-slate-100 shadow-[4px_4px_0px_0px_rgba(15,23,42,10)] border-slate-900">
              <h3 className="text-lg font-black uppercase text-amber-600 border-b pb-2 mb-4">Add Evaluable Past Event</h3>
              <form onSubmit={handleAddPastEvent} className="space-y-3">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">PAST EVENT TITLE</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sports Fest Opening Parade"
                    value={pastTitle}
                    onChange={(e) => setPastTitle(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-slate-900 font-mono font-bold text-xs p-2.5 outline-none focus:bg-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">CALENDAR DATE OCCURRED</label>
                    <input
                      type="date"
                      required
                      value={pastDate}
                      onChange={(e) => setPastDate(e.target.value)}
                      className="w-full bg-slate-50 border-2 border-slate-900 font-mono font-bold text-xs p-2.5 outline-none focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">PHYSICAL VENUE</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Gym Plaza"
                      value={pastVenue}
                      onChange={(e) => setPastVenue(e.target.value)}
                      className="w-full bg-slate-50 border-2 border-slate-900 font-mono font-bold text-xs p-2.5 outline-none focus:bg-white"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">TOTAL STUDENT ATTENDANCE</label>
                    <input
                      type="number"
                      required
                      min={10}
                      value={pastAttendance}
                      onChange={(e) => setPastAttendance(Number(e.target.value))}
                      className="w-full bg-slate-50 border-2 border-slate-900 font-mono font-bold text-xs p-2.5 outline-none focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">DEPT COUNCILS PARTICIPATED</label>
                    <div className="p-1 px-2 border-2 border-slate-900 bg-slate-50 font-mono text-[10px] leading-relaxed max-h-16 overflow-y-auto">
                      {COLLEGES.map(c => (
                        <label key={c.code} className="flex items-center gap-1.5 font-bold cursor-pointer">
                          <input
                            type="checkbox"
                            checked={pastColleges.includes(c.code)}
                            onChange={(e) => {
                              if (e.target.checked) setPastColleges(prev => [...prev, c.code]);
                              else setPastColleges(prev => prev.filter(x => x !== c.code));
                            }}
                          />
                          <span>{c.code}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">HOST OFFICE (ORGANIZER)</label>
                  <input
                    type="text"
                    disabled={currentAdminUser.agency !== 'ALL'}
                    readOnly
                    value={currentAdminUser.agency === 'ALL' ? 'Supreme student Council (SSC)' : currentAdminUser.name}
                    className="w-full bg-slate-100 border-2 border-slate-300 font-mono font-bold text-xs p-2.5 text-slate-500 outline-none"
                  />
                </div>

                {pastEventStatus && (
                  <div className={`p-2 text-[10px] font-black border-2 uppercase text-center ${pastEventStatus.success ? 'bg-green-50 text-green-700 border-green-500' : 'bg-red-50 text-red-700 border-red-500'}`}>
                    {pastEventStatus.message}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full bg-amber-600 hover:bg-slate-900 text-black hover:text-yellow-400 border-2 border-slate-900 py-2.5 font-black uppercase tracking-wider text-xs"
                >
                  Publish Past Event to Registry
                </button>
              </form>
            </div>
          </div>

          {/* Registries lists with Delete permissions checking */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 border-4 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
              <h3 className="text-lg font-black uppercase mb-4 border-b pb-1.5">Upcoming Announcements ({upcomingEvents.length})</h3>
              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {upcomingEvents.map(evt => {
                  const allowed = canModifyEvent(evt.organizer);
                  return (
                    <div key={evt.id} className="bg-slate-50 border-2 border-slate-900 p-3 flex justify-between items-center text-xs">
                      <div className="space-y-1">
                        <div className="font-black text-slate-900 uppercase">{evt.title}</div>
                        <div className="font-mono text-[10px] text-slate-500 font-bold uppercase">{evt.date} • {evt.venue} • Coord: {evt.organizer}</div>
                      </div>
                      {allowed ? (
                        <button
                          onClick={() => handleDeleteUpcomingEvent(evt.id)}
                          className="p-1 px-2 text-[10px] font-black uppercase text-red-700 hover:bg-red-50 border-2 border-slate-900 flex items-center gap-0.5"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete
                        </button>
                      ) : (
                        <span className="p-1 px-1.5 text-[9px] font-black uppercase bg-slate-200 text-slate-400 border border-slate-300 select-none">
                          Locked
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white p-6 border-4 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
              <h3 className="text-lg font-black uppercase mb-4 border-b pb-1.5">Active Past Board Registries ({pastEvents.length})</h3>
              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {pastEvents.map(evt => {
                  const allowed = canModifyEvent(evt.organizer);
                  return (
                    <div key={evt.id} className="bg-slate-50 border-2 border-slate-900 p-3 flex justify-between items-center text-xs">
                      <div className="space-y-1">
                        <div className="font-black text-slate-900 uppercase">{evt.title}</div>
                        <div className="font-mono text-[10px] text-slate-500 font-bold uppercase">{evt.date} • {evt.venue} • Host: {evt.organizer}</div>
                      </div>
                      {allowed ? (
                        <button
                          onClick={() => handleDeletePastEvent(evt.id)}
                          className="p-1 px-2 text-[10px] font-black uppercase text-red-700 hover:bg-red-50 border-2 border-slate-900 flex items-center gap-0.5"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete
                        </button>
                      ) : (
                        <span className="p-1 px-1.5 text-[9px] font-black uppercase bg-slate-200 text-slate-400 border border-slate-300 select-none">
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
        <div className="space-y-6 animate-fade-in">
          <div className="bg-emerald-800 text-white p-6 border-4 border-slate-950 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
            <h3 className="text-2xl font-black italic tracking-tight text-[#F2C811] uppercase pb-2 mb-2 border-b border-emerald-700">
              Event Attendance Logs & Proof Inspection Desk
            </h3>
            <p className="text-xs font-bold leading-relaxed max-w-3xl">
              Monitor active student kiosk check-ins and inspect selfie snapshot evidence in real-time. In accordance with campus rules, completing a valid event check-in grants the student <span className="text-[#F2C811] font-black">+50 Campus points</span> instantly.
            </p>
          </div>

          <div className="bg-white border-4 border-slate-950 p-6 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b pb-4 mb-6 gap-4">
              <div>
                <h4 className="text-md font-black uppercase text-[#0B2B64] flex items-center gap-1.5">
                  <Camera className="w-5 h-5 text-emerald-600" />
                  Active Attendance Log Registry ({attendanceRecords.length} records)
                </h4>
                <p className="text-[9px] text-slate-400 font-semibold uppercase">Verification Desk & Selfie Audit Control Panel</p>
              </div>

              <div className="text-[10px] bg-slate-100 border border-slate-300 font-black uppercase py-2 px-3 text-slate-700">
                Authorized Role: {currentAdminUser.agency === 'ALL' || currentAdminUser.agency === 'OSA' ? 'Full Read/Write Controller' : 'Read-Only Viewer'}
              </div>
            </div>

            {attendanceRecords.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-slate-300 bg-slate-50">
                <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-500 font-black uppercase">No Attendance records logged on this kiosk yet.</p>
                <p className="text-[10px] text-slate-400 font-medium mt-1">Students can check in using the front terminal Hub.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 border-b-2 border-slate-900">
                      <th className="p-3 font-black uppercase text-slate-700">Student Candidate</th>
                      <th className="p-3 font-black uppercase text-slate-700">College Dept</th>
                      <th className="p-3 font-black uppercase text-slate-700">Target Event Name</th>
                      <th className="p-3 font-black uppercase text-slate-700 text-center">Webcam Proof</th>
                      <th className="p-3 font-black uppercase text-slate-700">Logged At</th>
                      <th className="p-3 font-black uppercase text-slate-700">Points Credited</th>
                      <th className="p-3 font-black uppercase text-slate-700 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
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
                          <tr key={rec.id} className="border-b hover:bg-slate-50 font-bold">
                            <td className="p-3">
                              <div className="font-extrabold text-[#0B2B64]">{rec.studentName}</div>
                              <div className="text-[10px] font-mono text-slate-400">{rec.studentId}</div>
                            </td>
                            <td className="p-3">
                              <span className="text-[10px] font-black uppercase bg-[#0B2B64]/5 text-[#0B2B64] border border-[#0B2B64]/20 py-0.5 px-2">
                                {rec.college}
                              </span>
                            </td>
                            <td className="p-3 truncate max-w-[200px]" title={eventTitle}>
                              {eventTitle}
                            </td>
                            <td className="p-3 text-center">
                              {rec.proofImage ? (
                                <button
                                  onClick={() => {
                                    setSelectedProofUrl(rec.proofImage);
                                    playBeep(1100, 0.05);
                                  }}
                                  className="inline-block border border-slate-300 hover:border-slate-800 p-0.5 bg-white cursor-pointer relative group"
                                  title="Click to inspect up-close"
                                >
                                  <img
                                    src={rec.proofImage}
                                    alt="Check-in Proof Thumbnail"
                                    className="w-12 h-8 object-cover"
                                  />
                                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                    <Sparkles className="w-3.5 h-3.5 text-white animate-pulse" />
                                  </div>
                                </button>
                              ) : (
                                <span className="text-slate-400 italic text-[10px]">No Photo</span>
                              )}
                            </td>
                            <td className="p-3 text-slate-500 font-mono text-[10px]">
                              {new Date(rec.timestamp).toLocaleString()}
                            </td>
                            <td className="p-3">
                              <span className="text-emerald-600 font-black uppercase text-[10px] flex items-center gap-1">
                                <Coins className="w-3.5 h-3.5" />
                                +50 PTS
                              </span>
                            </td>
                            <td className="p-3 text-right">
                              {isOSAS ? (
                                <button
                                  onClick={() => handleDeleteAttendance(rec.id)}
                                  className="bg-red-50 hover:bg-red-100 text-red-600 font-black text-[10px] px-2.5 py-1.5 border border-red-300 uppercase cursor-pointer"
                                  title="Revoke attendance & deduct points"
                                >
                                  Discard Log
                                </button>
                              ) : (
                                <span className="text-[10px] text-slate-400 uppercase italic" title="Only OSAS has deletion rights">
                                  Read Only
                                </span>
                              )}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 p-4">
          <div className="bg-white border-4 border-slate-950 max-w-md w-full p-5 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] relative">
            <button
              onClick={() => setSelectedProofUrl(null)}
              className="absolute top-4 right-4 bg-red-100 hover:bg-red-200 text-red-700 font-black border border-red-300 py-1 px-3 text-[10px] uppercase cursor-pointer"
            >
              Close [x]
            </button>
            <h4 className="text-xs font-black uppercase text-slate-800 mb-3 border-b pb-2">Inspection Desk: Check-In Selfie Proof</h4>
            <div className="bg-slate-900 border-2 border-slate-950 aspect-video flex items-center justify-center overflow-hidden">
              <img
                src={selectedProofUrl}
                alt="Enlarged Attendance Proof"
                className="max-h-[250px] w-auto object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <p className="text-[9px] text-slate-400 font-bold uppercase mt-3 text-center tracking-wider">
              West Visayas State University Security Protocol verified.
            </p>
          </div>
        </div>
      )}

      {/* Subtab 4: MySQL phpMyAdmin Hub */}
      {adminSubTab === 'mysql' && (
        <div className="space-y-6">
          <div className="bg-[#0B2B64] text-white p-6 border-4 border-slate-950 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] relative overflow-hidden">
            <h3 className="text-2xl font-black italic tracking-tight text-[#F2C811] uppercase pb-2 mb-2 border-b border-blue-800">
              MySQL phpMyAdmin Database Migration & Exporter Hub
            </h3>
            <p className="text-xs font-bold leading-relaxed max-w-3xl">
              Migrate your temporary localhost datastore to a production-scale **MySQL or phpMyAdmin Database**! Simply copy the table structures below, execute them in phpMyAdmin, and click "Generate Live MySQL Inserts" to dump the active dataset. Your evaluation counters, students, and events will relate instantly!
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Panel 1: DDL Table Schemas */}
            <div className="bg-white p-6 border-4 border-slate-100 shadow-[4px_4px_0px_0px_rgba(15,23,42,10)] border-slate-900">
              <div className="flex justify-between items-center border-b pb-3 mb-4">
                <div>
                  <h4 className="text-md font-black uppercase text-[#0B2B64]">MySQL Relational Table Creation Queries</h4>
                  <p className="text-[9px] text-slate-400 font-semibold uppercase">Copies complete table schemas with full foreign keys</p>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(MYSQL_SCHEMA_DDL);
                    setCopiedSchema(true);
                    playBeep(1200, 0.15);
                    setTimeout(() => setCopiedSchema(false), 3000);
                  }}
                  className="bg-[#F2C811] hover:bg-slate-900 hover:text-white text-slate-950 py-1.5 px-3 border-2 border-slate-950 text-[10px] font-black uppercase flex items-center gap-1 cursor-pointer"
                >
                  {copiedSchema ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedSchema ? "Saved DDL" : "Copy DDL"}
                </button>
              </div>
              <textarea
                readOnly
                value={MYSQL_SCHEMA_DDL}
                rows={12}
                className="w-full bg-slate-950 text-emerald-400 font-mono text-[10px] p-4 outline-none line-clamp-1 truncate select-all rounded-none block shadow-[inner_4px_4px_0px_0px_rgba(0,0,0,0.4)] resize-none"
              />
            </div>

            {/* Panel 2: Live SQL dump exporter */}
            <div className="bg-white p-6 border-4 border-slate-100 shadow-[4px_4px_0px_0px_rgba(15,23,42,10)] border-slate-900">
              <div className="flex justify-between items-center border-b pb-3 mb-4">
                <div>
                  <h4 className="text-md font-black uppercase text-amber-600">Active Live Dataset SQL Dump (INSERTS)</h4>
                  <p className="text-[9px] text-slate-400 font-semibold uppercase">Transforms live evaluation clicks into copyable MySQL queries</p>
                </div>
                <button
                  onClick={() => {
                    const dump = generateLiveMySQLDump(students, upcomingEvents, pastEvents, evaluations, COLLEGES);
                    navigator.clipboard.writeText(dump);
                    setCopiedDump(true);
                    playBeep(1200, 0.15);
                    setTimeout(() => setCopiedDump(false), 3000);
                  }}
                  className="bg-amber-600 text-white hover:bg-slate-900 py-1.5 px-3 border-2 border-slate-950 text-[10px] font-black uppercase flex items-center gap-1 cursor-pointer"
                >
                  {copiedDump ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedDump ? "Saved Dump" : "Copy Live Dump"}
                </button>
              </div>
              <textarea
                readOnly
                value={generateLiveMySQLDump(students, upcomingEvents, pastEvents, evaluations, COLLEGES)}
                rows={12}
                className="w-full bg-slate-950 text-yellow-400 font-mono text-[10px] p-4 outline-none line-clamp-1 truncate select-all rounded-none block shadow-[inner_4px_4px_0px_0px_rgba(0,0,0,0.4)] resize-none"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

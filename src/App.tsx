import React, { useState, useEffect, useRef } from 'react';
import { 
  School, Calendar, ClipboardCheck, Users, TrendingUp, AlertTriangle, 
  CheckCircle, User, Sparkles, ArrowLeft, LogOut, ChevronRight, 
  Monitor, Cpu, FileText, Check, Copy, AlertCircle, RefreshCw,
  Upload, Trash2, Plus, Search
} from 'lucide-react';
import { Student, UpcomingEvent, PastEvent, Evaluation, EvaluationReport, AttendanceRecord, RewardItem } from './types';
import { ADMIN_ACCOUNTS } from './lib/mysql_export';
import AdminConsole from './components/AdminConsole';
import { Camera, Award, Shield, Coins, Gift, Eye } from 'lucide-react';

import { 
  loadLocalStorage, 
  saveLocalStorage, 
  INITIAL_STUDENTS, 
  INITIAL_ATTENDANCE, 
  INITIAL_PAST_EVENTS, 
  INITIAL_UPCOMING_EVENTS, 
  INITIAL_EVALUATIONS 
} from './localData';

import lanyardImg from './assets/images/lanyard_reward_1782276232577.jpg';
import stickersImg from './assets/images/stickers_reward_1782276250102.jpg';
import capImg from './assets/images/cap_reward_1782276263148.jpg';
import passImg from './assets/images/pass_reward_1782276276812.jpg';
import teeImg from './assets/images/tee_reward_1782276291053.jpg';
import badgeImg from './assets/images/badge_reward_1782276303773.jpg';

const COLLEGES = [
  { code: 'BSINFO TECH', name: 'BS in Information Technology', enrolled: 350 },
  { code: 'BSED',        name: 'BS in Secondary Education',      enrolled: 400 },
  { code: 'BSIT',        name: 'BS in Industrial Technology',     enrolled: 300 },
  { code: 'BSHM',        name: 'BS in Hospitality Management',    enrolled: 250 },
  { code: 'BS CRIM',     name: 'BS in Criminology',               enrolled: 200 },
];

const CAMPUS_REWARDS: RewardItem[] = [
  { id: 'REW-1', title: 'WVSU-LC Premium Lanyard', pointsCost: 50, description: 'Official campus lanyard featuring gold-pressed logo print.', category: 'Merchandise', icon: 'Award', image: lanyardImg },
  { id: 'REW-2', title: 'College Pride Stickers Pack', pointsCost: 25, description: 'Set of 5 waterproof laptop stickers for IT, Education, and Tech majors.', category: 'Collectibles', icon: 'Sparkles', image: stickersImg },
  { id: 'REW-3', title: 'WVSU-LC Developer Cap', pointsCost: 150, description: 'Limited-edition structured dark-blue cap with gold emblem embroidery.', category: 'Apparel', icon: 'Gift', image: capImg },
  { id: 'REW-4', title: 'OSA Student Priority Pass', pointsCost: 100, description: 'Skip-the-line VIP priority access pass for rapid OSAS document clearances. Specially prioritized for PWD and pregnant students.', category: 'Privileges', icon: 'Shield', image: passImg },
  { id: 'REW-5', title: 'WVSU-LC Sports Tee', pointsCost: 200, description: 'Lightweight, sweat-wicking department sports shirt.', category: 'Apparel', icon: 'Award', image: teeImg },
  { id: 'REW-6', title: 'SSC Gold Citizen Badge', pointsCost: 75, description: 'Official metal emblem pinning recognizing active student civic action.', category: 'Collectibles', icon: 'Coins', image: badgeImg },
];

const TRANSLATIONS: Record<string, Record<string, string>> = {
  en: {
    system_title: "WVSU-LC STUDENT ACTIVITY KIOSK",
    sub_title: "Direct Evaluation Engine • West Visayas State University - Lambunao Campus",
    sidebar_title: "Walk-in Student Profile",
    sidebar_desc: "Type your profile variables below to dynamically personalize evaluations in real-time.",
    points: "Your Campus Points",
    redeem: "Redeem",
    redeemed_perks: "Redeemed Perks",
    student_name: "Student Full Name",
    student_id: "Student Registration ID",
    college_dept: "College/Course Dept",
    degree_prog: "Degree Program",
    year_level: "Year Level",
    kiosk_console: "Kiosk System Console",
    admin_security: "Department Log-In",
    welcome: "Welcome to WVSU-LC Student Kiosk",
    welcome_desc: "West Visayas State University - Lambunao Campus welcomes you to our digital kiosk terminal. Select any module command below:",
    announcements: "Announcements",
    announcements_desc: "Check current campus schedules & foundation details",
    evaluate_events: "Evaluate Past Events",
    evaluate_desc: "Rate past convocations and submit feedback",
    check_in: "Check-In Attendance",
    check_in_desc: "Log attendance for current/past events with selfie proof & claim points",
    rewards_store: "Rewards Store",
    rewards_store_desc: "Redeem your accumulated points for exclusive campus custom merchandise",
    back_to_menu: "Back to Menu",
    submit_evaluation: "Submit Evaluation",
    log_checkin: "Validate & Log Check-In",
    active_profile: "Active Profile",
  },
  hil: {
    system_title: "WVSU-LC ESTUDYANTE KIOSK",
    sub_title: "Direkta nga Pag-usisa sang Rehistro • West Visayas State University - Lambunao Campus",
    sidebar_title: "Profile sang Estudyante",
    sidebar_desc: "Ibutang ang imo detalye sa idalom para ma-personalize ang imo pag-evaluate.",
    points: "Imo Puntos sa Kampus",
    redeem: "Bawi-on",
    redeemed_perks: "Mga Nakuha nga Regalo",
    student_name: "Tig-una nga Ngalan sang Estudyante",
    student_id: "Numero sang ID sang Estudyante",
    college_dept: "Departamento sang Kolehiyo",
    degree_prog: "Programa sang Kurso",
    year_level: "Tuig sa Kolehiyo",
    kiosk_console: "Kiosk sang Estudyante",
    admin_security: "Department Log-In",
    welcome: "Maayong Pag-abot sa WVSU-LC Kiosk",
    welcome_desc: "Ginasugata ka sang West Visayas State University - Lambunao Campus sa aton digital kiosk. Magpili sang command sa idalom:",
    announcements: "Mga Anunsyo",
    announcements_desc: "Tan-awa ang mga iskedyul sang kampus kag mga kapiestahan",
    evaluate_events: "I-evaluate ang mga Katilingban",
    evaluate_desc: "Hatagan sang puntos kag feedback ang mga nagligad nga aktibidad",
    check_in: "Mag Check-In sa Attendance",
    check_in_desc: "I-rehistro ang imo attendance gamit ang selfie para makakuha sang puntos",
    rewards_store: "Tindahan sang Regalo",
    rewards_store_desc: "I-baylo ang imo puntos sa mga eksklusibo nga gamit sang WVSU-LC",
    back_to_menu: "Magbalik sa Menu",
    submit_evaluation: "I-sumiter ang Evaluation",
    log_checkin: "I-kumpirma ang Check-In",
    active_profile: "Aktibo nga Profile",
  },
  fil: {
    system_title: "WVSU-LC KIOSK NG ESTUDYANTE",
    sub_title: "Direktang Sistema ng Pagsusuri • West Visayas State University - Lambunao Campus",
    sidebar_title: "Profile ng Estudyante",
    sidebar_desc: "I-type ang iyong impormasyon sa ibaba upang i-personalize ang iyong pagsusuri.",
    points: "Iyong Puntos sa Kampus",
    redeem: "I-redeem",
    redeemed_perks: "Mga Natanggap na Gantimpala",
    student_name: "Buong Pangalan ng Estudyante",
    student_id: "ID Number ng Estudyante",
    college_dept: "Kolehiyo / Departamento",
    degree_prog: "Programa ng Degree",
    year_level: "Antas ng Taon",
    kiosk_console: "Kiosk Console",
    admin_security: "Department Log-In",
    welcome: "Maligayang Pagdating sa WVSU-LC Kiosk",
    welcome_desc: "Malugod kayong tinatanggap ng West Visayas State University - Lambunao Campus. Pumili ng anomang opsyon sa ibaba:",
    announcements: "Mga Anunsyo",
    announcements_desc: "Suriin ang mga kasalukuyang iskedyul at anunsyo ng kampus",
    evaluate_events: "Suriin ang mga Nakaraang Kaganapan",
    evaluate_desc: "Magbigay ng rating at feedback para sa mga nakaraang aktibidad",
    check_in: "Mag Check-In sa Attendance",
    check_in_desc: "I-log ang iyong attendance gamit ang selfie upang makakuha ng puntos",
    rewards_store: "Tindahan ng Gantimpala",
    rewards_store_desc: "I-palit ang iyong mga puntos para sa mga eksklusibong produkto",
    back_to_menu: "Bumalik sa Menu",
    submit_evaluation: "I-sumite ang Pagsusuri",
    log_checkin: "I-kumpirma ang Check-In",
    active_profile: "Aktibong Profile",
  }
};

export default function App() {
  // GLOBAL LAYOUT TABS: 'kiosk' vs 'admin'
  const [activeTab, setActiveTab] = useState<'kiosk' | 'admin'>('kiosk');

  // OFFLINE / LOCAL STORAGE MODE FOR OFFLINE LM STUDIO COMPATIBILITY
  const [isOfflineMode, setIsOfflineMode] = useState<boolean>(() => {
    return loadLocalStorage('kiosk_offline_mode', false);
  });

  // DYNAMIC REAL-TIME CLOCK FOR BOLD DISPLAY
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // SYNCHRONIZED SERVER ENTITY STATES
  const [students, setStudents] = useState<Student[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<UpcomingEvent[]>([]);
  const [pastEvents, setPastEvents] = useState<PastEvent[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  // KIOSK ACTIVE LOGGED IN PROFILE (Bypasses login completely, editable sidebar!)
  const [loggedInStudent, setLoggedInStudent] = useState<Student>({
    id: '2021-0001',
    name: 'Maria Santos',
    college: 'BSINFO TECH',
    program: 'BS Information Technology',
    year: 3,
    points: 150,
    redeemedRewards: []
  });

  // KIOSK STATE MACHINE (Starts directly at greeting!)
  const [kioskStep, setKioskStep] = useState<'greeting' | 'upcoming' | 'past_select' | 'form' | 'confirm' | 'completed' | 'attendance' | 'rewards'>('greeting');

  // Admin and Credentials log
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(false);
  const [currentAdminUser, setCurrentAdminUser] = useState<any>(null);
  const [adminUsername, setAdminUsername] = useState<string>('');
  const [adminPassword, setAdminPassword] = useState<string>('');
  const [adminAuthError, setAdminAuthError] = useState<string>('');

  // Step wizard sub-states
  const [selectedUpcomingId, setSelectedUpcomingId] = useState<string | null>(null);
  const [selectedPastEvent, setSelectedPastEvent] = useState<PastEvent | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [wizardAnswers, setWizardAnswers] = useState<any>({
    q1: 5, q2: 5, q3: 5, q4: 5, q5: 5, q6: 'YES', q7: '', q8: '', q9: ''
  });
  const [answersFeedback, setAnswersFeedback] = useState<string>('');
  const [completedCollegeCount, setCompletedCollegeCount] = useState<number>(0);
  const [completedCampusCount, setCompletedCampusCount] = useState<number>(0);
  const [reportLoading, setReportLoading] = useState<boolean>(false);

  // ATTENDANCE & REWARDS DYNAMIC COMPANIONS
  const [attendanceEventId, setAttendanceEventId] = useState<string>('');
  const [attendanceStudentId, setAttendanceStudentId] = useState<string>('2021-0001');
  const [attendanceStudentName, setAttendanceStudentName] = useState<string>('Maria Santos');
  const [attendanceCollege, setAttendanceCollege] = useState<string>('BSINFO TECH');
  const [attendanceProof, setAttendanceProof] = useState<string>('');
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [attendanceMessage, setAttendanceMessage] = useState<{ text: string; success: boolean } | null>(null);
  const [isSubmittingAttendance, setIsSubmittingAttendance] = useState<boolean>(false);
  const [attendanceYear, setAttendanceYear] = useState<number>(1);

  // Profile Update Flow States
  const [isProfileUpdateModalOpen, setIsProfileUpdateModalOpen] = useState<boolean>(false);
  const [editStudentId, setEditStudentId] = useState<string>('');
  const [editStudentName, setEditStudentName] = useState<string>('');
  const [editStudentCollege, setEditStudentCollege] = useState<string>('BSINFO TECH');
  const [editStudentProgram, setEditStudentProgram] = useState<string>('');
  const [editStudentYear, setEditStudentYear] = useState<number>(1);
  const [isCredentialsValidated, setIsCredentialsValidated] = useState<boolean>(false);
  
  // Multilingual State and Helper
  const [language, setLanguage] = useState<'en' | 'hil' | 'fil'>('en');
  const t = (key: string): string => {
    return TRANSLATIONS[language]?.[key] || TRANSLATIONS['en']?.[key] || key;
  };
  
  const [rewardsError, setRewardsError] = useState<string>('');
  const [rewardsSuccess, setRewardsSuccess] = useState<string>('');
  const [isRedeeming, setIsRedeeming] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Terminal history log
  const [terminalHistory, setTerminalHistory] = useState<string[]>([
    "WVSU-LC OSAS Kiosk OS v1.1.2 loaded successfully.",
    "Bypassed Student Login Gate. Live editable dashboard active.",
    "Real-time sync connections established with Express background server.",
    "Kiosk operational. Type admin credentials on tab redirection to manage."
  ]);
  const [terminalInput, setTerminalInput] = useState<string>('');
  const terminalBottomRef = useRef<HTMLDivElement>(null);
  const lastLoadedIdRef = useRef<string>('');

  // Play audio notes safely
  const playBeep = (freq: number, dur: number) => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      osc.start();
      osc.stop(audioCtx.currentTime + dur);
    } catch (e) {
      // Audio blocked or unsupported
    }
  };

  const handleApiFallback = (reason: string) => {
    if (!isOfflineMode) {
      console.warn("API Server is unreachable or returned invalid non-JSON content. Reason:", reason);
      setIsOfflineMode(true);
      saveLocalStorage('kiosk_offline_mode', true);
      addTerminalLine(`[SYSTEM] CENTRAL API UNREACHABLE (e.g. VERCEL HOSTING LIMITATION).`);
      addTerminalLine(`[SYSTEM] AUTOMATICALLY ENABLING OFFLINE MODE (LOCAL STORAGE) FOR SEAMLESS KIOSK OPERATIONS.`);
      
      const localSt = loadLocalStorage('kiosk_students', INITIAL_STUDENTS);
      const localUp = loadLocalStorage('kiosk_upcoming_events', INITIAL_UPCOMING_EVENTS);
      const localPast = loadLocalStorage('kiosk_past_events', INITIAL_PAST_EVENTS);
      const localEvals = loadLocalStorage('kiosk_evaluations', INITIAL_EVALUATIONS);
      const localAtt = loadLocalStorage('kiosk_attendance_records', INITIAL_ATTENDANCE);

      setStudents(localSt);
      setUpcomingEvents(localUp);
      setPastEvents(localPast);
      setEvaluations(localEvals);
      setAttendanceRecords(localAtt);

      if (loggedInStudent.id) {
        const found = localSt.find(s => s.id.trim().toLowerCase() === loggedInStudent.id.trim().toLowerCase());
        if (found) {
          setLoggedInStudent(found);
        }
      }
    }
  };

  // SYNC UTILITY WITH SERVER DATASTORE
  const syncDatabase = () => {
    if (isOfflineMode) {
      const localSt = loadLocalStorage('kiosk_students', INITIAL_STUDENTS);
      const localUp = loadLocalStorage('kiosk_upcoming_events', INITIAL_UPCOMING_EVENTS);
      const localPast = loadLocalStorage('kiosk_past_events', INITIAL_PAST_EVENTS);
      const localEvals = loadLocalStorage('kiosk_evaluations', INITIAL_EVALUATIONS);
      const localAtt = loadLocalStorage('kiosk_attendance_records', INITIAL_ATTENDANCE);

      setStudents(localSt);
      setUpcomingEvents(localUp);
      setPastEvents(localPast);
      setEvaluations(localEvals);
      setAttendanceRecords(localAtt);

      if (loggedInStudent.id) {
        const found = localSt.find(s => s.id.trim().toLowerCase() === loggedInStudent.id.trim().toLowerCase());
        if (found) {
          setLoggedInStudent(found);
        }
      }
      return;
    }

    const checkJsonResponse = (res: Response) => {
      const contentType = res.headers.get("content-type");
      if (!res.ok || (contentType && contentType.includes("text/html"))) {
        throw new Error("HTML_FALLBACK_DETECTED");
      }
      return res.json();
    };

    fetch('/api/students')
      .then(checkJsonResponse)
      .then(data => { 
        if (data.success) {
          setStudents(data.students); 
          saveLocalStorage('kiosk_students', data.students);
        } 
      })
      .catch(e => {
        console.error("Error syncing students:", e);
        setStudents(loadLocalStorage('kiosk_students', INITIAL_STUDENTS));
        if (e.message === "HTML_FALLBACK_DETECTED" || e.message.includes("Unexpected token") || e.message.includes("JSON")) {
          handleApiFallback("HTML response received instead of JSON.");
        }
      });

    fetch('/api/upcoming-events')
      .then(checkJsonResponse)
      .then(data => { 
        if (data.success) {
          setUpcomingEvents(data.upcomingEvents); 
          saveLocalStorage('kiosk_upcoming_events', data.upcomingEvents);
        } 
      })
      .catch(e => {
        console.error("Error syncing upcoming events:", e);
        setUpcomingEvents(loadLocalStorage('kiosk_upcoming_events', INITIAL_UPCOMING_EVENTS));
        if (e.message === "HTML_FALLBACK_DETECTED" || e.message.includes("Unexpected token") || e.message.includes("JSON")) {
          handleApiFallback("HTML response received instead of JSON.");
        }
      });

    fetch('/api/past-events')
      .then(checkJsonResponse)
      .then(data => { 
        if (data.success) {
          setPastEvents(data.pastEvents); 
          saveLocalStorage('kiosk_past_events', data.pastEvents);
        } 
      })
      .catch(e => {
        console.error("Error syncing past events:", e);
        setPastEvents(loadLocalStorage('kiosk_past_events', INITIAL_PAST_EVENTS));
        if (e.message === "HTML_FALLBACK_DETECTED" || e.message.includes("Unexpected token") || e.message.includes("JSON")) {
          handleApiFallback("HTML response received instead of JSON.");
        }
      });

    fetch('/api/past-evaluations')
      .then(checkJsonResponse)
      .then(data => { 
        if (data.success) {
          setEvaluations(data.evaluations); 
          saveLocalStorage('kiosk_evaluations', data.evaluations);
        } 
      })
      .catch(e => {
        console.error("Error syncing evaluations:", e);
        setEvaluations(loadLocalStorage('kiosk_evaluations', INITIAL_EVALUATIONS));
        if (e.message === "HTML_FALLBACK_DETECTED" || e.message.includes("Unexpected token") || e.message.includes("JSON")) {
          handleApiFallback("HTML response received instead of JSON.");
        }
      });

    fetch('/api/attendance')
      .then(checkJsonResponse)
      .then(data => { 
        if (data.success) {
          setAttendanceRecords(data.attendance); 
          saveLocalStorage('kiosk_attendance_records', data.attendance);
        } 
      })
      .catch(e => {
        console.error("Error syncing attendance records:", e);
        setAttendanceRecords(loadLocalStorage('kiosk_attendance_records', INITIAL_ATTENDANCE));
        if (e.message === "HTML_FALLBACK_DETECTED" || e.message.includes("Unexpected token") || e.message.includes("JSON")) {
          handleApiFallback("HTML response received instead of JSON.");
        }
      });
  };

  useEffect(() => {
    syncDatabase();
  }, [refreshTrigger, kioskStep, isOfflineMode]);

  useEffect(() => {
    if (terminalBottomRef.current) {
      terminalBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [terminalHistory]);

  // AUTOMATIC PROFILE POINTS & REWARDS DISCOVERY FROM SERVER DB
  useEffect(() => {
    if (!loggedInStudent.id || students.length === 0) return;
    const found = students.find(s => s.id.trim().toLowerCase() === loggedInStudent.id.trim().toLowerCase());
    if (found) {
      const isDifferentId = lastLoadedIdRef.current !== loggedInStudent.id;
      const isBlank = !loggedInStudent.name || loggedInStudent.name === 'Student';
      const hasMorePointsOnServer = (found.points ?? 0) > (loggedInStudent.points ?? 0);
      
      if (isDifferentId || isBlank || hasMorePointsOnServer) {
        lastLoadedIdRef.current = loggedInStudent.id;
        setLoggedInStudent(prev => ({
          ...prev,
          name: found.name,
          college: found.college,
          program: found.program,
          year: found.year,
          points: Math.max(found.points ?? 0, prev.points ?? 0),
          redeemedRewards: found.redeemedRewards ?? []
        }));
        addTerminalLine(`Loaded profile match: ${found.name} (${found.points ?? 0} pts)`);
      }
    }
  }, [loggedInStudent.id, students]);

  // Handle auto-fill and validation lookup for attendance student id (like 24-1058)
  useEffect(() => {
    if (!attendanceStudentId) return;
    const cleanId = attendanceStudentId.trim().toLowerCase().replace(/[^a-zA-Z0-9]/g, '');
    if (!cleanId) return;
    const found = students.find(s => {
      const cleanDb = s.id.trim().toLowerCase().replace(/[^a-zA-Z0-9]/g, '');
      return s.id.trim().toLowerCase() === attendanceStudentId.trim().toLowerCase() || cleanDb === cleanId;
    });
    if (found) {
      setAttendanceStudentName(found.name);
      setAttendanceCollege(found.college);
      setAttendanceYear(found.year || 1);
    }
  }, [attendanceStudentId, students]);

  const addTerminalLine = (line: string) => {
    setTerminalHistory(prev => [...prev.slice(-30), `> ${line}`]);
  };

  // Webcam camera handlers with auto-fallback
  const startCamera = async () => {
    try {
      setAttendanceMessage(null);
      setIsCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240 } });
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      addTerminalLine("Live Kiosk Camera Feed loaded successfully.");
    } catch (err: any) {
      console.warn("Camera hardware or browser sandbox blocked permission:", err);
      setIsCameraActive(false);
      addTerminalLine(`Camera failed: ${err.message || 'Sandbox restriction'}. Use custom mock selfie or file upload.`);
      setAttendanceMessage({ text: "Standard browser camera permission is blocked by container/iframe sandbox, but you can select our high-fidelity pre-rendered mock selfies or upload a photo below!", success: false });
    }
  };

  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const captureSnapshot = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = 320;
      canvas.height = 240;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, 320, 240);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setAttendanceProof(dataUrl);
        addTerminalLine("Selfie snapshot saved to profile draft.");
        stopCamera();
      }
    }
  };

  useEffect(() => {
    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // When leaving the attendance step, always turn off camera
  useEffect(() => {
    if (kioskStep !== 'attendance') {
      stopCamera();
    }
  }, [kioskStep]);

  const isProfileIncomplete = 
    !loggedInStudent.id?.trim() || 
    !loggedInStudent.name?.trim() || 
    !loggedInStudent.college?.trim() || 
    !loggedInStudent.year;

  const openProfileUpdateModal = () => {
    setEditStudentId(loggedInStudent.id || '');
    setEditStudentName(loggedInStudent.name || '');
    setEditStudentCollege(loggedInStudent.college || 'BSINFO TECH');
    setEditStudentProgram(loggedInStudent.program || '');
    setEditStudentYear(loggedInStudent.year || 1);
    setIsProfileUpdateModalOpen(true);
    playBeep(1100, 0.05);
  };

  const saveProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editStudentId.trim() || !editStudentName.trim() || !editStudentCollege.trim()) {
      alert("Please fill out Student ID, Name, and Course Department.");
      return;
    }
    setLoggedInStudent(prev => ({
      ...prev,
      id: editStudentId.trim(),
      name: editStudentName.trim(),
      college: editStudentCollege,
      program: editStudentProgram.trim() || `${editStudentCollege} Student`,
      year: Number(editStudentYear)
    }));
    setIsCredentialsValidated(true);
    setIsProfileUpdateModalOpen(false);
    playBeep(1300, 0.15);
    addTerminalLine(`SECURE PROFILE UPDATE: Authorized changes saved for ${editStudentName}.`);
  };

  // Sync program select inside student credentials modal when department changes
  useEffect(() => {
    if (isProfileUpdateModalOpen) {
      switch (editStudentCollege) {
        case 'BSINFO TECH':
          setEditStudentProgram('BS Information Technology');
          break;
        case 'BSED':
          setEditStudentProgram('BS Secondary Education');
          break;
        case 'BSIT':
          setEditStudentProgram('BS Industrial Technology');
          break;
        case 'BSHM':
          setEditStudentProgram('BS Hospitality Management');
          break;
        case 'BS CRIM':
          setEditStudentProgram('BS Criminology');
          break;
        default:
          break;
      }
    }
  }, [editStudentCollege, isProfileUpdateModalOpen]);

  // MENU INTERACTIVE CLICKS
  const selectMenuOption = (opt: number) => {
    if (opt === 1) {
      setKioskStep('upcoming');
      setSelectedUpcomingId(null);
      playBeep(1000, 0.1);
      addTerminalLine(`Displaying upcoming announcement board registry. Enter index or type BACK.`);
    } else if (opt === 2) {
      setKioskStep('past_select');
      setIsCredentialsValidated(false);
      playBeep(1000, 0.1);
      const eligible = pastEvents.filter(e => e.colleges_participated.includes(loggedInStudent.college));
      addTerminalLine(`Showing ${eligible.length} evaluable events for dept ${loggedInStudent.college}. Choose event.`);
    } else if (opt === 3) {
      setAttendanceStudentId(loggedInStudent.id);
      setAttendanceStudentName(loggedInStudent.name);
      setAttendanceCollege(loggedInStudent.college);
      setKioskStep('attendance');
      playBeep(1000, 0.1);
      addTerminalLine(`Accessing Event Attendance Check-In Portal. Verify your details, choose your event, and provide proof!`);
    } else if (opt === 4) {
      setKioskStep('rewards');
      playBeep(1000, 0.1);
      addTerminalLine(`Entering WVSU-LC Student Rewards Store. Redeem your hard-earned civic engagement points here!`);
    }
  };

  // SUBMIT EVALUATION REVIEWS
  const submitWizardData = () => {
    if (!selectedPastEvent) return;
    setReportLoading(true);
    addTerminalLine("Submitting secure evaluations packet to central OSAS server...");

    const payload = {
      student_id: loggedInStudent.id || 'anonymous-kiosk',
      college: loggedInStudent.college || 'BSINFO TECH',
      event_id: selectedPastEvent.id,
      ...wizardAnswers
    };

    if (isOfflineMode) {
      setTimeout(() => {
        setReportLoading(false);
        const localEvals = loadLocalStorage('kiosk_evaluations', INITIAL_EVALUATIONS);
        const newEval = {
          id: `SUB-P01-${Math.floor(1000 + Math.random() * 9000)}`,
          student_id: payload.student_id,
          college: payload.college,
          event_id: payload.event_id,
          q1: payload.q1,
          q2: payload.q2,
          q3: payload.q3,
          q4: payload.q4,
          q5: payload.q5,
          q6: payload.q6,
          q7: payload.q7,
          q8: payload.q8,
          q9: payload.q9,
          timestamp: new Date().toISOString()
        };
        localEvals.push(newEval);
        saveLocalStorage('kiosk_evaluations', localEvals);

        // Update student points (+15 points for submitting an evaluation!)
        const localStudents = loadLocalStorage('kiosk_students', INITIAL_STUDENTS);
        const stIdx = localStudents.findIndex(s => s.id === payload.student_id);
        if (stIdx >= 0) {
          localStudents[stIdx].points = (localStudents[stIdx].points ?? 0) + 15;
          saveLocalStorage('kiosk_students', localStudents);
          setLoggedInStudent(localStudents[stIdx]);
        }

        // Calculate college counts
        const collegeCount = localEvals.filter(e => e.event_id === payload.event_id && e.college === payload.college).length;
        const campusTotal = localEvals.filter(e => e.event_id === payload.event_id).length;

        setCompletedCollegeCount(collegeCount);
        setCompletedCampusCount(campusTotal);
        setKioskStep('completed');
        playBeep(1400, 0.35);
        syncDatabase();
        addTerminalLine(`Submission ID ${newEval.id} filed under ${payload.college} channel successfully (Offline Mode)!`);
      }, 500);
      return;
    }

    fetch('/api/submit-evaluation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(res => {
        const contentType = res.headers.get("content-type");
        if (!res.ok || (contentType && contentType.includes("text/html"))) {
          throw new Error("HTML_FALLBACK_DETECTED");
        }
        return res.json();
      })
      .then(data => {
        setReportLoading(false);
        if (data.success) {
          setCompletedCollegeCount(data.collegeCount);
          setCompletedCampusCount(data.campusTotal);
          
          if (data.student) {
            setLoggedInStudent(data.student);
          } else {
            setLoggedInStudent(prev => ({
              ...prev,
              points: (prev.points ?? 0) + 15
            }));
          }

          setKioskStep('completed');
          playBeep(1400, 0.35);
          syncDatabase();
          addTerminalLine(`Submission ID ${data.evaluation.id} filed under ${payload.college} channel successfully!`);
        } else {
          addTerminalLine(`PACKET ERROR: File reject. ${data.error}`);
        }
      })
      .catch(err => {
        console.warn("Evaluation submission failed, falling back to local storage...", err);
        setIsOfflineMode(true);
        saveLocalStorage('kiosk_offline_mode', true);

        const localEvals = loadLocalStorage('kiosk_evaluations', INITIAL_EVALUATIONS);
        const newEval = {
          id: `SUB-P01-${Math.floor(1000 + Math.random() * 9000)}`,
          student_id: payload.student_id,
          college: payload.college,
          event_id: payload.event_id,
          q1: payload.q1,
          q2: payload.q2,
          q3: payload.q3,
          q4: payload.q4,
          q5: payload.q5,
          q6: payload.q6,
          q7: payload.q7,
          q8: payload.q8,
          q9: payload.q9,
          timestamp: new Date().toISOString()
        };
        localEvals.push(newEval);
        saveLocalStorage('kiosk_evaluations', localEvals);

        // Update student points (+15 points for submitting an evaluation!)
        const localStudents = loadLocalStorage('kiosk_students', INITIAL_STUDENTS);
        const stIdx = localStudents.findIndex(s => s.id === payload.student_id);
        if (stIdx >= 0) {
          localStudents[stIdx].points = (localStudents[stIdx].points ?? 0) + 15;
          saveLocalStorage('kiosk_students', localStudents);
          setLoggedInStudent(localStudents[stIdx]);
        }

        // Calculate college counts
        const collegeCount = localEvals.filter(e => e.event_id === payload.event_id && e.college === payload.college).length;
        const campusTotal = localEvals.filter(e => e.event_id === payload.event_id).length;

        setReportLoading(false);
        setCompletedCollegeCount(collegeCount);
        setCompletedCampusCount(campusTotal);
        setKioskStep('completed');
        playBeep(1400, 0.35);
        syncDatabase();
        addTerminalLine(`[SYSTEM] SERVER OFFLINE: Automatically enabled Local Storage DB mode.`);
        addTerminalLine(`Submission ID ${newEval.id} filed under ${payload.college} channel successfully (Offline Fallback)!`);
      });
  };

  // SUBMIT ATTENDANCE LOG RECORD
  const submitAttendanceCheckIn = () => {
    if (!attendanceStudentId.trim()) {
      setAttendanceMessage({ text: "Please enter your Student Registration ID.", success: false });
      return;
    }
    if (!attendanceStudentName.trim()) {
      setAttendanceMessage({ text: "Please enter your Student Full Name.", success: false });
      return;
    }
    if (!attendanceEventId) {
      setAttendanceMessage({ text: "Please select an event for check-in validation.", success: false });
      return;
    }
    if (!attendanceProof) {
      setAttendanceMessage({ text: "Please provide a selfie snapshot or photographic proof file to submit.", success: false });
      return;
    }

    setIsSubmittingAttendance(true);
    setAttendanceMessage(null);
    addTerminalLine("Uploading attendance record & computing reward points credit...");

    // Find any matching registered student
    const matched = students.find(s => {
      const cleanDb = s.id.trim().toLowerCase().replace(/[^a-zA-Z0-9]/g, '');
      const cleanInput = attendanceStudentId.trim().toLowerCase().replace(/[^a-zA-Z0-9]/g, '');
      return s.id.trim().toLowerCase() === attendanceStudentId.trim().toLowerCase() || cleanDb === cleanInput;
    });

    const payload = {
      student: {
        id: attendanceStudentId.trim(),
        name: attendanceStudentName.trim(),
        college: attendanceCollege || (matched ? matched.college : 'BSINFO TECH'),
        program: matched?.program || `${attendanceCollege || 'BSINFO TECH'} Student`,
        year: Number(attendanceYear) || matched?.year || 1
      },
      event_id: attendanceEventId,
      proof_image: attendanceProof
    };

    if (isOfflineMode) {
      setTimeout(() => {
        setIsSubmittingAttendance(false);
        const localStudents = loadLocalStorage('kiosk_students', INITIAL_STUDENTS);
        let matchedLocal = localStudents.find(s => s.id.trim().toLowerCase() === attendanceStudentId.trim().toLowerCase());
        
        if (!matchedLocal) {
          // auto enroll if not found
          matchedLocal = {
            id: attendanceStudentId.trim(),
            name: attendanceStudentName.trim(),
            college: attendanceCollege,
            program: `${attendanceCollege} Student`,
            year: Number(attendanceYear) || 1,
            points: 0,
            redeemedRewards: []
          };
          localStudents.push(matchedLocal);
        }

        // award 50 points
        matchedLocal.points = (matchedLocal.points ?? 0) + 50;
        saveLocalStorage('kiosk_students', localStudents);

        // add attendance record
        const localAttendance = loadLocalStorage('kiosk_attendance_records', INITIAL_ATTENDANCE);
        const pastEvts = loadLocalStorage('kiosk_past_events', INITIAL_PAST_EVENTS);
        const upEvts = loadLocalStorage('kiosk_upcoming_events', INITIAL_UPCOMING_EVENTS);
        const foundEvent = pastEvts.find(e => e.id === attendanceEventId) || upEvts.find(e => e.id === attendanceEventId);
        const eventTitle = foundEvent ? foundEvent.title : 'Campus Event';

        const newRecord = {
          id: `ATT-${Math.floor(1000 + Math.random() * 9000)}`,
          studentId: matchedLocal.id,
          studentName: matchedLocal.name,
          college: matchedLocal.college,
          year: matchedLocal.year,
          eventId: attendanceEventId,
          eventTitle: eventTitle,
          timestamp: new Date().toISOString(),
          pointsEarned: 50,
          proofImage: attendanceProof || "https://images.unsplash.com/photo-1544717305-2782549b5136?w=500",
          status: "APPROVED" as const
        };
        localAttendance.push(newRecord);
        saveLocalStorage('kiosk_attendance_records', localAttendance);

        playBeep(1400, 0.4);
        setAttendanceMessage({ text: `Success! Attendance logged. You have earned +50 points! Current balance: ${matchedLocal.points} PTS.`, success: true });
        addTerminalLine(`SUCCESS: Attendance logged for ${matchedLocal.name}. +50 PTS credited (Offline Mode).`);
        
        setAttendanceProof('');
        setLoggedInStudent(matchedLocal);
        syncDatabase();
      }, 500);
      return;
    }

    fetch('/api/attendance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(res => {
        const contentType = res.headers.get("content-type");
        if (!res.ok || (contentType && contentType.includes("text/html"))) {
          throw new Error("HTML_FALLBACK_DETECTED");
        }
        return res.json();
      })
      .then(data => {
        setIsSubmittingAttendance(false);
        if (data.success) {
          playBeep(1400, 0.4);
          setAttendanceMessage({ text: `Success! Attendance logged. You have earned +50 points! Current balance: ${data.student.points} PTS.`, success: true });
          addTerminalLine(`SUCCESS: Attendance logged for ${data.student.name}. +50 PTS credited.`);
          
          // Clear snapshot on success
          setAttendanceProof('');

          // Force local active student profile upgrade ("name card changes")
          setLoggedInStudent({
            id: data.student.id,
            name: data.student.name,
            college: data.student.college,
            program: data.student.program || `${data.student.college} Student`,
            year: data.student.year || 1,
            points: data.student.points,
            redeemedRewards: data.student.redeemedRewards || []
          });

          syncDatabase();
        } else {
          playBeep(400, 0.3);
          setAttendanceMessage({ text: `ERROR: ${data.error || 'Unable to register.'}`, success: false });
          addTerminalLine(`REJECTED: Check-In failed. ${data.error}`);
        }
      })
      .catch(err => {
        console.warn("Check-in failed with error, falling back to local storage...", err);
        setIsSubmittingAttendance(false);
        setIsOfflineMode(true);
        saveLocalStorage('kiosk_offline_mode', true);

        // Run offline logic
        const localStudents = loadLocalStorage('kiosk_students', INITIAL_STUDENTS);
        let matchedLocal = localStudents.find(s => s.id.trim().toLowerCase() === attendanceStudentId.trim().toLowerCase());
        
        if (!matchedLocal) {
          // auto enroll if not found
          matchedLocal = {
            id: attendanceStudentId.trim(),
            name: attendanceStudentName.trim(),
            college: attendanceCollege,
            program: `${attendanceCollege} Student`,
            year: Number(attendanceYear) || 1,
            points: 0,
            redeemedRewards: []
          };
          localStudents.push(matchedLocal);
        }

        // award 50 points
        matchedLocal.points = (matchedLocal.points ?? 0) + 50;
        saveLocalStorage('kiosk_students', localStudents);

        // add attendance record
        const localAttendance = loadLocalStorage('kiosk_attendance_records', INITIAL_ATTENDANCE);
        const pastEvts = loadLocalStorage('kiosk_past_events', INITIAL_PAST_EVENTS);
        const upEvts = loadLocalStorage('kiosk_upcoming_events', INITIAL_UPCOMING_EVENTS);
        const foundEvent = pastEvts.find(e => e.id === attendanceEventId) || upEvts.find(e => e.id === attendanceEventId);
        const eventTitle = foundEvent ? foundEvent.title : 'Campus Event';

        const newRecord = {
          id: `ATT-${Math.floor(1000 + Math.random() * 9000)}`,
          studentId: matchedLocal.id,
          studentName: matchedLocal.name,
          college: matchedLocal.college,
          year: matchedLocal.year,
          eventId: attendanceEventId,
          eventTitle: eventTitle,
          timestamp: new Date().toISOString(),
          pointsEarned: 50,
          proofImage: attendanceProof || "https://images.unsplash.com/photo-1544717305-2782549b5136?w=500",
          status: "APPROVED" as const
        };
        localAttendance.push(newRecord);
        saveLocalStorage('kiosk_attendance_records', localAttendance);

        playBeep(1400, 0.4);
        setAttendanceMessage({ 
          text: `Success (Offline Fallback)! Server API was unreachable/HTML. Attendance logged in Local Storage. Earned +50 points! Current balance: ${matchedLocal.points} PTS.`, 
          success: true 
        });
        addTerminalLine(`[SYSTEM] SERVER OFFLINE: Automatically enabled Local Storage DB mode.`);
        addTerminalLine(`SUCCESS: Attendance logged for ${matchedLocal.name}. +50 PTS credited locally.`);
        
        setAttendanceProof('');
        setLoggedInStudent(matchedLocal);
        syncDatabase();
      });
  };

  // HANDLE REWARD ITEMS REDEMPTION
  const handleRedeemReward = (reward: RewardItem) => {
    // Validation of the department of that student
    const studentDept = loggedInStudent.college;
    if (!studentDept || !['BSINFO TECH', 'BSED', 'BSIT', 'BSHM', 'BS CRIM'].includes(studentDept)) {
      setRewardsError(`Redemption Rejected: You must belong to a valid college department (BSINFO TECH, BSED, BSIT, BSHM, or BS CRIM) to claim rewards.`);
      setRewardsSuccess('');
      playBeep(400, 0.25);
      addTerminalLine(`REJECTION: Invalid college department (${studentDept || 'None'}) for reward claim.`);
      return;
    }

    // Specific reward department eligibility validation on client
    if (reward.id === 'REW-2' && !['BSINFO TECH', 'BSED', 'BSIT'].includes(studentDept)) {
      setRewardsError(`The College Pride Stickers Pack is restricted to BSINFO TECH, BSED, and BSIT departments. Your department (${studentDept}) is not eligible.`);
      setRewardsSuccess('');
      playBeep(400, 0.25);
      addTerminalLine(`REJECTION: Department ${studentDept} is not eligible for ${reward.title}.`);
      return;
    }

    if (reward.id === 'REW-3' && !['BSINFO TECH', 'BSIT'].includes(studentDept)) {
      setRewardsError(`The WVSU-LC Developer Cap is restricted to tech-oriented majors (BSINFO TECH, BSIT). Your department (${studentDept}) is not eligible.`);
      setRewardsSuccess('');
      playBeep(400, 0.25);
      addTerminalLine(`REJECTION: Department ${studentDept} is not eligible for ${reward.title}.`);
      return;
    }

    if ((loggedInStudent.points ?? 0) < reward.pointsCost) {
      setRewardsError(`Insufficient points. You need ${reward.pointsCost} PTS to redeem this reward, but you only have ${loggedInStudent.points ?? 0} PTS.`);
      setRewardsSuccess('');
      playBeep(400, 0.25);
      addTerminalLine(`REJECTION: Insufficient point assets to claim ${reward.title}.`);
      return;
    }

    setIsRedeeming(true);
    setRewardsError('');
    setRewardsSuccess('');
    addTerminalLine(`Processing reward redemption for ${reward.title} (-${reward.pointsCost} PTS)...`);

    if (isOfflineMode) {
      setTimeout(() => {
        setIsRedeeming(false);
        const localStudents = loadLocalStorage('kiosk_students', INITIAL_STUDENTS);
        const stIdx = localStudents.findIndex(s => s.id === loggedInStudent.id);
        if (stIdx >= 0) {
          const student = localStudents[stIdx];
          student.points = (student.points ?? 0) - reward.pointsCost;
          if (!student.redeemedRewards) student.redeemedRewards = [];
          student.redeemedRewards.push(reward.title);
          saveLocalStorage('kiosk_students', localStudents);
          setLoggedInStudent(student);

          playBeep(1500, 0.5);
          setRewardsSuccess(`Successfully redeemed ${reward.title}! Voucher Ticket: WVSU-${reward.id}-${Math.floor(1000 + Math.random() * 9000)} is valid. Present this to OSAS/SSC booth to claim your item (Offline Mode).`);
          addTerminalLine(`SUCCESS: ${reward.title} claimed. Remaining points: ${student.points} PTS (Offline Mode).`);
          syncDatabase();
        }
      }, 500);
      return;
    }

    const payload = {
      studentId: loggedInStudent.id,
      rewardId: reward.id,
      rewardTitle: reward.title,
      pointsCost: reward.pointsCost,
      college: studentDept
    };

    fetch('/api/students/redeem', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(res => {
        const contentType = res.headers.get("content-type");
        if (!res.ok || (contentType && contentType.includes("text/html"))) {
          throw new Error("HTML_FALLBACK_DETECTED");
        }
        return res.json();
      })
      .then(data => {
        setIsRedeeming(false);
        if (data.success) {
          playBeep(1500, 0.5);
          setRewardsSuccess(`Successfully redeemed ${reward.title}! Voucher Ticket: WVSU-${reward.id}-${Math.floor(1000 + Math.random() * 9000)} is valid. Present this to OSAS/SSC booth to claim your item.`);
          addTerminalLine(`SUCCESS: ${reward.title} claimed. Remaining points: ${data.student.points} PTS.`);
          
          setLoggedInStudent(prev => ({
            ...prev,
            points: data.student.points,
            redeemedRewards: data.student.redeemedRewards || []
          }));

          syncDatabase();
        } else {
          setRewardsError(data.error || 'Redemption process was rejected by central registrar.');
          playBeep(400, 0.3);
          addTerminalLine(`REJECTED: ${data.error}`);
        }
      })
      .catch(err => {
        console.warn("Reward redemption failed, falling back to local storage...", err);
        setIsOfflineMode(true);
        saveLocalStorage('kiosk_offline_mode', true);

        const localStudents = loadLocalStorage('kiosk_students', INITIAL_STUDENTS);
        const stIdx = localStudents.findIndex(s => s.id === loggedInStudent.id);
        if (stIdx >= 0) {
          const student = localStudents[stIdx];
          student.points = (student.points ?? 0) - reward.pointsCost;
          if (!student.redeemedRewards) student.redeemedRewards = [];
          student.redeemedRewards.push(reward.title);
          saveLocalStorage('kiosk_students', localStudents);
          setLoggedInStudent(student);

          playBeep(1500, 0.5);
          setRewardsSuccess(`Successfully redeemed ${reward.title}! Voucher Ticket: WVSU-${reward.id}-${Math.floor(1000 + Math.random() * 9000)} is valid. Present this to OSAS/SSC booth to claim your item (Offline Fallback).`);
          addTerminalLine(`[SYSTEM] SERVER OFFLINE: Automatically enabled Local Storage DB mode.`);
          addTerminalLine(`SUCCESS: ${reward.title} claimed. Remaining points: ${student.points} PTS (Offline Fallback).`);
          syncDatabase();
        }
        setIsRedeeming(false);
      });
  };

  // WIZARD ANSWERS FLOW
  const saveAnswerAndProceed = (questionIdx: number, value: any) => {
    const keys = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8', 'q9'];
    const currentKey = keys[questionIdx];

    setWizardAnswers(prev => ({ ...prev, [currentKey]: value }));
    playBeep(1100, 0.05);
    setAnswersFeedback("Feedback saved.");
    setTimeout(() => setAnswersFeedback(''), 800);

    if (questionIdx < 8) {
      setCurrentQuestionIndex(prev => prev + 1);
      const promptText = getQuestionPrompt(questionIdx + 1);
      addTerminalLine(`[Recorded] Next -> ${promptText}`);
    } else {
      setKioskStep('confirm');
      addTerminalLine("All ratings set. Confirm submission with YES or cancel with NO.");
    }
  };

  const processWizardCmd = (val: string) => {
    const idx = currentQuestionIndex;
    let typedVal: any = val.trim();

    if (idx >= 0 && idx <= 4) {
      if (idx === 3 && val.toUpperCase() === 'N/A') {
        typedVal = 'N/A';
      } else {
        const rating = parseInt(val);
        if (isNaN(rating) || rating < 1 || rating > 5) {
          addTerminalLine("Syntax Error! Specify scores from 1 to 5 (or N/A where applicable).");
          return;
        }
        typedVal = rating;
      }
    } else if (idx === 5) {
      const upper = val.toUpperCase();
      if (upper !== 'YES' && upper !== 'MAYBE' && upper !== 'NO') {
        addTerminalLine("Syntax Error! Specify YES / MAYBE / NO.");
        return;
      }
      typedVal = upper;
    } else if (idx === 6 || idx === 7 || idx === 8) {
      if (idx === 8 && val.toUpperCase() === 'SKIP') {
        typedVal = 'SKIP';
      } else if (val.length > 200) {
        addTerminalLine("Characters overflow! Please stay beneath 200 characters.");
        return;
      }
    }

    saveAnswerAndProceed(idx, typedVal);
  };

  const getQuestionPrompt = (qIdx: number): string => {
    const prompts = [
      "Q1: Rate overall event satisfaction [1=Poor, 5=Excellent]",
      "Q2: Rate relevance to your academic program [1=Poor, 5=Excellent]",
      "Q3: Rate logistics and planning quality [1=Poor, 5=Excellent]",
      "Q4: Rate speakers / facilitators [1-5, or type N/A]",
      "Q5: Rate physical venue comfort [1=Poor, 5=Excellent]",
      "Q6: Attend similar events in the future? [YES / MAYBE / NO]",
      "Q7: Highlight of the event? [Max 200 characters]",
      "Q8: Improvement suggestions? [Max 200 characters]",
      "Q9: Other comments? [Max 200 characters, or SKIP]"
    ];
    return prompts[qIdx];
  };

  // ADMIN LOGIN LOGIC
  const handleAdminAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminUsername.trim() || !adminPassword.trim()) return;

    const matched = ADMIN_ACCOUNTS.find(acc => acc.username.toLowerCase() === adminUsername.trim().toLowerCase() && acc.password === adminPassword.trim());
    if (matched) {
      setIsAdminLoggedIn(true);
      setCurrentAdminUser(matched);
      setAdminAuthError('');
      setAdminPassword('');
      playBeep(1200, 0.15);
      addTerminalLine(`ADMIN GRANTED: ${matched.name} logged in. Agency: ${matched.agency}`);
    } else {
      setAdminAuthError("Invalid Administrative Security Username or Passcode. Access denied.");
      playBeep(400, 0.35);
      addTerminalLine("ACCESS DENIED: Attempted unauthorized decryption of administrative portals.");
    }
  };

  // KEYBOARD/KEYPAD TERMINAL HANDLER
  const handleTerminalFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!terminalInput.trim()) return;
    const cmd = terminalInput.trim();
    setTerminalInput('');
    addTerminalLine(cmd);
    playBeep(850, 0.05);

    if (kioskStep === 'greeting') {
      if (cmd === '1') selectMenuOption(1);
      else if (cmd === '2') selectMenuOption(2);
      else if (cmd === '3') selectMenuOption(3);
      else if (cmd === '4') selectMenuOption(4);
      else if (cmd.toLowerCase() === 'admin') setActiveTab('admin');
      else addTerminalLine("Error! Enter 1 (Announcements), 2 (Past Evaluations), 3 (Event Attendance), 4 (Rewards Store).");
    } else if (kioskStep === 'attendance' || kioskStep === 'rewards') {
      if (cmd.toLowerCase() === 'back') {
        setKioskStep('greeting');
        addTerminalLine("Returned to main menu.");
      } else {
        addTerminalLine("Type BACK to return to the greeting menu.");
      }
    } else if (kioskStep === 'upcoming') {
      if (cmd.toLowerCase() === 'back') {
        setKioskStep('greeting');
        setSelectedUpcomingId(null);
      } else {
        const idx = parseInt(cmd);
        if (idx >= 1 && idx <= upcomingEvents.length) {
          setSelectedUpcomingId(upcomingEvents[idx - 1].id);
        } else addTerminalLine("Announcements out of range. Enter range or type BACK.");
      }
    } else if (kioskStep === 'past_select') {
      if (cmd.toLowerCase() === 'back') setKioskStep('greeting');
      else {
        const eligible = pastEvents.filter(e => e.colleges_participated.includes(loggedInStudent.college));
        const idx = parseInt(cmd);
        if (idx >= 1 && idx <= eligible.length) {
          const selected = eligible[idx - 1];
          setSelectedPastEvent(selected);
          setKioskStep('form');
          setCurrentQuestionIndex(0);
          addTerminalLine(`Initialized review form for ${selected.title}.`);
        } else addTerminalLine("Range error. Choose within the filtered boundaries.");
      }
    } else if (kioskStep === 'form') {
      processWizardCmd(cmd);
    } else if (kioskStep === 'confirm') {
      if (cmd.toLowerCase() === 'yes') submitWizardData();
      else if (cmd.toLowerCase() === 'no') {
        setKioskStep('greeting');
        addTerminalLine("Evaluation packet discarded.");
      } else addTerminalLine("Confirm your selection. Write YES or NO.");
    } else if (kioskStep === 'completed') {
      if (cmd.toLowerCase() === 'back') {
        setKioskStep('greeting');
        setWizardAnswers({ q1: 5, q2: 5, q3: 5, q4: 5, q5: 5, q6: 'YES', q7: '', q8: '', q9: '' });
      }
    }
  };

  const getDayAndGreeting = () => {
    const hours = currentTime.getHours();
    if (hours < 12) return 'Good Morning';
    if (hours < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div id="root" className="min-h-screen bg-gradient-to-tr from-slate-50 via-indigo-50/15 to-slate-50 flex flex-col antialiased text-slate-900 selection:bg-amber-200 selection:text-slate-950 font-sans p-4 md:p-8 relative">
      
      {/* GLOWING AMBIENT BACKGROUND DECORATIONS */}
      <div className="absolute top-20 right-10 w-96 h-96 bg-indigo-300/10 blur-[130px] rounded-full pointer-events-none z-0"></div>
      <div className="absolute bottom-10 left-10 w-80 h-80 bg-amber-200/10 blur-[120px] rounded-full pointer-events-none z-0"></div>

      {/* HEADER MASTER AREA */}
      <header className="max-w-7xl w-full mx-auto bg-white/90 backdrop-blur-md border border-slate-200/80 rounded-2xl p-5 flex flex-col lg:flex-row items-start lg:items-center justify-between mb-8 shadow-xl shadow-slate-100/50 relative overflow-hidden gap-4 z-10 transition-all duration-300">
        <div className="flex items-center gap-4 relative z-10">
          <div className="p-3 bg-gradient-to-br from-amber-400 to-[#F2C811] text-[#0B2B64] rounded-xl shadow-md">
            <School className="w-7 h-7 stroke-[2px]" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#0B2B64] uppercase flex items-center">
              {t('system_title')}
            </h1>
            <p className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase mt-0.5">
              {t('sub_title')}
            </p>
          </div>
        </div>

        {/* Language Selector + Tabs */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 relative z-10 w-full lg:w-auto">
          {/* Elegant Language Selector */}
          <div className="flex items-center gap-2 border border-slate-200 bg-slate-50/90 rounded-xl px-3 py-2 shadow-sm transition-all focus-within:ring-2 focus-within:ring-indigo-100 focus-within:border-indigo-400">
            <span className="text-[9px] font-bold uppercase text-slate-400 tracking-wider">🌐 Language:</span>
            <select
              value={language}
              onChange={(e) => {
                setLanguage(e.target.value as any);
                playBeep(900, 0.05);
              }}
              className="bg-transparent text-xs font-bold uppercase focus:outline-none cursor-pointer text-[#0B2B64] border-none pr-1"
            >
              <option value="en">English (US)</option>
              <option value="hil">Hiligaynon (Ilonggo)</option>
              <option value="fil">Filipino (Tagalog)</option>
            </select>
          </div>

          {/* OFFLINE / LM STUDIO COMPATIBILITY TOGGLE */}
          <div className="flex items-center gap-2 border border-slate-200 bg-slate-50/90 rounded-xl px-3 py-2 shadow-sm transition-all focus-within:ring-2 focus-within:ring-indigo-100">
            <span className="text-[9px] font-bold uppercase text-slate-400 tracking-wider">🔌 DB Mode:</span>
            <button
              onClick={() => {
                const nextMode = !isOfflineMode;
                setIsOfflineMode(nextMode);
                saveLocalStorage('kiosk_offline_mode', nextMode);
                playBeep(nextMode ? 1400 : 900, 0.1);
                addTerminalLine(`SYSTEM CONFIG CHANGE: Database switched to ${nextMode ? "OFFLINE (Local Storage/LM Studio Mode)" : "ONLINE (Cloud Run server)"}`);
              }}
              className="bg-transparent flex items-center gap-1.5 text-xs font-bold uppercase focus:outline-none cursor-pointer border-none p-0"
              title="Click to toggle between Cloud Database and Local Storage (Offline LM Studio) mode"
            >
              <span className={`w-2 h-2 rounded-full ${isOfflineMode ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500 animate-pulse'}`}></span>
              <span className={isOfflineMode ? 'text-amber-700' : 'text-emerald-700'}>
                {isOfflineMode ? 'LOCAL (LM STUDIO)' : 'ONLINE'}
              </span>
            </button>
          </div>

          {/* Dynamic Dual Tab Switch */}
          <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200 w-full sm:w-auto">
            <button
              onClick={() => { setActiveTab('kiosk'); playBeep(1000, 0.05); }}
              className={`flex-1 sm:flex-initial py-1.5 px-5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${activeTab === 'kiosk' ? 'bg-gradient-to-r from-amber-400 to-[#F2C811] text-slate-900 shadow-md' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50/50'}`}
            >
              {t('kiosk_console')}
            </button>
            <button
              onClick={() => { setActiveTab('admin'); playBeep(1000, 0.05); }}
              className={`flex-1 sm:flex-initial py-1.5 px-5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${activeTab === 'admin' ? 'bg-[#0B2B64] text-white shadow-md shadow-indigo-900/10' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50/50'}`}
            >
              {t('admin_security')}
            </button>
          </div>
        </div>
      </header>

      {/* CORE FRAME WORKSPACE */}
      <main className="max-w-7xl w-full mx-auto flex-1 flex flex-col gap-8">
        
        {/* VIEW 1: KIOSK MODE INTERFACES */}
        {activeTab === 'kiosk' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative z-10">
            
            {/* LEFT COLUMN: ACTIVE STUDENT COMPILER SIDEBAR */}
            <section className="lg:col-span-4 flex flex-col gap-6">
              <div className="bg-white border border-slate-200/80 rounded-2xl p-6 flex flex-col relative shadow-xl shadow-slate-100/40 transition-all duration-300 hover:shadow-2xl hover:shadow-slate-200/30">
                <div className="absolute top-5 right-5 bg-gradient-to-br from-[#0B2B64] to-indigo-950 text-amber-300 px-2.5 py-1 text-[8.5px] font-bold uppercase tracking-wider rounded-lg border border-indigo-900/50">
                  {t('active_profile')}
                </div>
                
                <h2 className="text-2xl font-black leading-none mb-1 text-[#0B2B64] tracking-tight">
                  Hi, {loggedInStudent.name.split(' ')[0] || "Student"}!
                </h2>
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-4 leading-relaxed">
                  {t('sidebar_desc')}
                </p>

                {/* Accumulated Points Panel - Premium Slate-Blue Card with Gold Trim */}
                <div className="bg-gradient-to-br from-[#0B2B64] via-indigo-900 to-slate-900 rounded-xl p-4 mb-4 flex items-center justify-between shadow-lg shadow-indigo-950/15 border border-indigo-950">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-gradient-to-br from-amber-400 to-[#F2C811] text-[#0B2B64] rounded-lg shadow-inner">
                      <Coins className="w-4 h-4 stroke-[2.5px]" />
                    </div>
                    <div>
                      <span className="text-[8px] font-bold uppercase text-indigo-200/80 block leading-none tracking-widest">{t('points')}</span>
                      <span className="text-lg font-black font-mono text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-200 drop-shadow-sm">{loggedInStudent.points ?? 0} PTS</span>
                    </div>
                  </div>
                  <button
                    onClick={() => selectMenuOption(4)}
                    className="bg-gradient-to-r from-amber-400 to-[#F2C811] text-[#0B2B64] hover:brightness-105 active:scale-95 border-none px-3.5 py-1.5 text-[8.5px] font-bold uppercase tracking-widest cursor-pointer shadow-sm text-center transition-all rounded-lg"
                  >
                    {t('redeem')}
                  </button>
                </div>

                {/* Claimed Rewards Section */}
                {loggedInStudent.redeemedRewards && loggedInStudent.redeemedRewards.length > 0 && (
                  <div className="mb-4 bg-slate-50/80 border border-slate-150 p-2.5 rounded-xl text-[9px] max-h-24 overflow-y-auto">
                    <span className="font-bold text-[#0B2B64] block mb-1.5 uppercase tracking-wider">🎁 {t('redeemed_perks')}:</span>
                    <ul className="list-disc pl-3.5 space-y-1 text-slate-600 font-mono text-[8.5px] leading-tight">
                      {loggedInStudent.redeemedRewards.map((reward, i) => (
                        <li key={i}>{reward}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  {loggedInStudent.lastAttendedEvent && (
                    <div className="mb-2 bg-emerald-50/70 border border-emerald-100 p-3 rounded-xl shadow-sm transition-all">
                      <span className="text-[8px] font-bold uppercase text-emerald-600 block leading-none tracking-wide">Last Active Check-In</span>
                      <span className="text-xs font-bold text-emerald-900 block mt-1.5 truncate">{loggedInStudent.lastAttendedEvent}</span>
                      <span className="text-[8.5px] font-mono text-emerald-500 block mt-0.5">{loggedInStudent.lastAttendedTimestamp}</span>
                    </div>
                  )}

                  <div>
                    <label className="text-[9px] font-bold uppercase text-slate-400 block mb-1 tracking-wider">{t('student_name')}</label>
                    <input
                      type="text"
                      disabled
                      readOnly
                      value={loggedInStudent.name}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-500 font-semibold text-xs p-2.5 rounded-xl outline-none select-none cursor-not-allowed"
                      placeholder="e.g. Maria Santos"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[9px] font-bold uppercase text-slate-400 block mb-1 tracking-wider">{t('student_id')}</label>
                      <input
                        type="text"
                        disabled
                        readOnly
                        value={loggedInStudent.id}
                        className="w-full bg-slate-50 border border-slate-200 text-slate-500 font-semibold text-xs p-2.5 rounded-xl outline-none select-none cursor-not-allowed"
                        placeholder="e.g. 2021-0001"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-bold uppercase text-slate-400 block mb-1 tracking-wider">{t('college_dept')}</label>
                      <input
                        type="text"
                        disabled
                        readOnly
                        value={loggedInStudent.college}
                        className="w-full bg-slate-50 border border-slate-200 text-slate-500 font-semibold text-xs p-2.5 rounded-xl outline-none select-none cursor-not-allowed"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-2">
                      <label className="text-[9px] font-bold uppercase text-slate-400 block mb-1 tracking-wider">{t('degree_prog')}</label>
                      <input
                        type="text"
                        disabled
                        readOnly
                        value={loggedInStudent.program}
                        className="w-full bg-slate-50 border border-slate-200 text-slate-500 font-semibold text-xs p-2.5 rounded-xl outline-none select-none cursor-not-allowed"
                        placeholder="e.g. BS IT"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-bold uppercase text-slate-400 block mb-1 tracking-wider">{t('year_level')}</label>
                      <input
                        type="text"
                        disabled
                        readOnly
                        value={loggedInStudent.year ? `${loggedInStudent.year} Yr` : ''}
                        className="w-full bg-slate-50 border border-slate-200 text-slate-500 font-semibold text-xs p-2.5 rounded-xl outline-none select-none cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Mode indicator */}
              <div className="bg-gradient-to-br from-[#0B2B64] to-indigo-950 text-white p-5 rounded-2xl border border-indigo-950/20 shadow-xl shadow-indigo-950/10 relative overflow-hidden">
                <div className="absolute -top-12 -right-12 w-24 h-24 bg-white/5 rounded-full pointer-events-none"></div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-[#F2C811]">KIOSK OPERATIONAL ACTIVE</p>
                </div>
                <p className="text-xs text-indigo-100/90 font-medium leading-relaxed">
                  All systems operating securely. Personalize variables in the student form above to dynamically evaluate events.
                </p>
              </div>
            </section>

            {/* RIGHT COLUMN: INTERACTIVE WORKSPACE */}
            <section className="lg:col-span-8 flex flex-col gap-6">
              <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/80 shadow-2xl shadow-indigo-950/5 relative overflow-hidden flex flex-col min-h-[540px]">
                
                {/* Visual frame header decoration */}
                <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-slate-100 p-4 px-6 flex items-center justify-between border-b border-slate-800">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-sm shadow-red-500/20"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-[#F2C811] shadow-sm shadow-yellow-500/20"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/20"></span>
                    <span className="text-[10px] font-mono text-slate-400 font-bold ml-2 uppercase tracking-wider">WVSU_LC://KIOSK_WORKSPACE</span>
                  </div>
                  <span className="text-[9px] font-bold uppercase bg-gradient-to-r from-amber-400 to-[#F2C811] text-[#0B2B64] px-2.5 py-1 rounded-lg border border-amber-500/20 shadow-sm">
                    Step: {kioskStep.replace('_', ' ')}
                  </span>
                </div>

                {/* STEP GREETING HUB */}
                {kioskStep === 'greeting' && (
                  <div className="p-6 md:p-8 space-y-6 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-xl md:text-2xl font-extrabold uppercase tracking-tight text-[#0B2B64] mb-1">
                        {getDayAndGreeting()}, Scholar!
                      </h3>
                      <p className="text-xs text-slate-400 font-semibold mb-6">
                        West Visayas State University - Lambunao Campus welcomes you to our digital kiosk terminal. Select any module command below:
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <button
                          onClick={() => selectMenuOption(1)}
                          className="group bg-white hover:bg-gradient-to-br hover:from-white hover:to-indigo-50/40 border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-xl hover:border-indigo-200 hover:-translate-y-1 transition-all duration-300 text-left cursor-pointer"
                        >
                          <div className="bg-gradient-to-br from-[#0B2B64] to-indigo-950 text-amber-300 w-10 h-10 flex items-center justify-center font-bold text-lg rounded-xl shadow-md group-hover:scale-105 transition-transform">
                            1
                          </div>
                          <h4 className="text-lg font-extrabold uppercase text-[#0B2B64] mt-5">Announcements</h4>
                          <p className="text-[10px] text-slate-400 font-medium uppercase mt-1 tracking-wider leading-relaxed">Check current campus schedules & foundation details</p>
                        </button>

                        <button
                          onClick={() => selectMenuOption(2)}
                          className="group bg-white hover:bg-gradient-to-br hover:from-white hover:to-amber-50/30 border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-xl hover:border-amber-200 hover:-translate-y-1 transition-all duration-300 text-left cursor-pointer"
                        >
                          <div className="bg-gradient-to-br from-[#0B2B64] to-indigo-950 text-amber-300 w-10 h-10 flex items-center justify-center font-bold text-lg rounded-xl shadow-md group-hover:scale-105 transition-transform">
                            2
                          </div>
                          <h4 className="text-lg font-extrabold uppercase text-slate-800 mt-5">Evaluate past events</h4>
                          <p className="text-[10px] text-slate-400 font-medium uppercase mt-1 tracking-wider leading-relaxed">Rate past convocations and submit feedback</p>
                        </button>

                        <button
                          onClick={() => selectMenuOption(3)}
                          className="group bg-white hover:bg-gradient-to-br hover:from-white hover:to-emerald-50/40 border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-xl hover:border-emerald-200 hover:-translate-y-1 transition-all duration-300 text-left cursor-pointer"
                        >
                          <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white w-10 h-10 flex items-center justify-center font-bold text-lg rounded-xl shadow-md group-hover:scale-105 transition-transform">
                            3
                          </div>
                          <h4 className="text-lg font-extrabold uppercase text-emerald-800 mt-5 flex items-center justify-between gap-2">
                            <span>Attendance</span>
                            <span className="text-[8px] font-bold tracking-widest bg-emerald-100 text-emerald-800 border border-emerald-200 py-0.5 px-2 rounded-full shrink-0">+50 PTS</span>
                          </h4>
                          <p className="text-[10px] text-slate-400 font-medium uppercase mt-1 tracking-wider leading-relaxed">Log attendance for current/past events with selfie proof & claim points</p>
                        </button>

                        <button
                          onClick={() => selectMenuOption(4)}
                          className="group bg-white hover:bg-gradient-to-br hover:from-white hover:to-amber-50/40 border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-xl hover:border-amber-200 hover:-translate-y-1 transition-all duration-300 text-left cursor-pointer"
                        >
                          <div className="bg-gradient-to-br from-amber-500 to-orange-600 text-white w-10 h-10 flex items-center justify-center font-bold text-lg rounded-xl shadow-md group-hover:scale-105 transition-transform">
                            4
                          </div>
                          <h4 className="text-lg font-extrabold uppercase text-amber-800 mt-5 flex items-center justify-between gap-2">
                            <span>Rewards Store</span>
                            <span className="text-[8px] font-bold tracking-widest bg-amber-100 text-amber-850 border border-amber-200 py-0.5 px-2 rounded-full shrink-0">REDEEM</span>
                          </h4>
                          <p className="text-[10px] text-slate-400 font-medium uppercase mt-1 tracking-wider leading-relaxed">Redeem your accumulated points for exclusive campus custom merchandise</p>
                        </button>
                      </div>
                    </div>

                    {/* Featured card banner */}
                    <div className="bg-gradient-to-br from-slate-900 via-[#0B2B64] to-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-md relative overflow-hidden min-h-[150px] flex flex-col justify-between mt-4">
                      <div className="relative z-10">
                        <p className="text-[8px] font-black text-[#F2C811] uppercase tracking-widest mb-1">FOUNDATION PREVIEW ANNOUNCEMENT</p>
                        <h4 className="text-2xl font-black italic tracking-tight text-white leading-tight">WVSU ANNUAL COLLEGE FESTIVAL 2025</h4>
                        <p className="text-[10px] font-semibold text-slate-300/90 mt-1.5 max-w-lg leading-relaxed">Opening line ceremonies begin July 18, 2025 at WVSU-LC Quadrangle plaza.</p>
                      </div>
                      <div className="absolute right-[-30px] bottom-[-30px] text-[8rem] font-black text-slate-800 opacity-20 italic select-none pointer-events-none">
                        WVSU
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP ATTENDANCE CHECK-IN PORTAL */}
                {kioskStep === 'attendance' && (
                  <div className="p-6 md:p-8 space-y-6 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-4 mb-4">
                        <h3 className="text-lg font-extrabold uppercase text-[#0B2B64] flex items-center gap-2">
                          <Camera className="w-5 h-5 text-emerald-500" />
                          {t('check_in')}
                        </h3>
                        <button
                          onClick={() => { setKioskStep('greeting'); setAttendanceMessage(null); }}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-800 text-xs font-bold uppercase tracking-wider py-1.5 px-4 cursor-pointer transition-all rounded-lg border-none"
                        >
                          {t('back_to_menu')}
                        </button>
                      </div>

                      <p className="text-xs text-slate-400 font-semibold mb-6 leading-relaxed">
                        Log your attendance below for current or past events. Provide your Student ID, Name, and photographic proof to verify your presence and claim <span className="text-emerald-500 font-extrabold">+50 Campus Points</span>!
                      </p>

                      {/* Status Messages */}
                      {attendanceMessage && (
                        <div className={`p-4 mb-6 border font-semibold text-xs flex items-start gap-2.5 rounded-xl ${attendanceMessage.success ? 'bg-emerald-50/70 border-emerald-100 text-emerald-850' : 'bg-red-50/70 border-red-100 text-red-850'}`}>
                          {attendanceMessage.success ? <CheckCircle className="w-5 h-5 shrink-0 text-emerald-500" /> : <AlertTriangle className="w-5 h-5 shrink-0 text-red-500" />}
                          <div>
                            <p className="font-extrabold uppercase tracking-wide">{attendanceMessage.success ? 'CHECK-IN CONFIRMED' : 'VALIDATION REJECTED'}</p>
                            <p className="mt-1 leading-relaxed text-slate-600">{attendanceMessage.text}</p>
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                        {/* LEFT FORM BLOCK */}
                        <div className="md:col-span-7 space-y-4">
                          
                          {/* Student ID & Name form input container (Prioritizing camera requirements) */}
                          <div className="bg-slate-50/65 p-5 border border-slate-150 space-y-4 rounded-2xl">
                            <span className="text-[10px] font-bold uppercase text-[#0B2B64] block leading-none tracking-wider">1. Required Student Credentials</span>
                            
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="text-[9px] font-bold uppercase text-slate-400 block mb-1 tracking-wider">{t('student_id')}</label>
                                <input
                                  type="text"
                                  value={attendanceStudentId}
                                  onChange={(e) => {
                                    setAttendanceStudentId(e.target.value);
                                    setAttendanceMessage(null);
                                  }}
                                  placeholder="e.g. 24-1058"
                                  className="w-full bg-white border border-slate-200 text-slate-700 font-semibold text-xs p-2.5 rounded-xl focus:outline-none focus:border-indigo-500 focus:shadow-sm focus:shadow-indigo-155 transition-all"
                                />
                              </div>
                              <div>
                                <label className="text-[9px] font-bold uppercase text-slate-400 block mb-1 tracking-wider">{t('student_name')}</label>
                                <input
                                  type="text"
                                  value={attendanceStudentName}
                                  onChange={(e) => {
                                    setAttendanceStudentName(e.target.value);
                                    setAttendanceMessage(null);
                                  }}
                                  placeholder="e.g. Maria Santos"
                                  className="w-full bg-white border border-slate-200 text-slate-700 font-semibold text-xs p-2.5 rounded-xl focus:outline-none focus:border-indigo-500 focus:shadow-sm focus:shadow-indigo-155 transition-all"
                                />
                              </div>
                            </div>

                            {/* Department display/choice & Year Level selection in a grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div>
                                <label className="text-[9px] font-bold uppercase text-slate-400 block mb-1 tracking-wider">{t('college_dept')}</label>
                                <select
                                  value={attendanceCollege}
                                  onChange={(e) => setAttendanceCollege(e.target.value)}
                                  className="w-full bg-white border border-slate-200 text-slate-700 font-semibold text-xs p-2.5 rounded-xl focus:outline-none focus:border-indigo-500 transition-all cursor-pointer"
                                >
                                  {COLLEGES.map(c => (
                                    <option key={c.code} value={c.code}>{c.code} - {c.name}</option>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <label className="text-[9px] font-bold uppercase text-slate-400 block mb-1 tracking-wider">Year Level</label>
                                <select
                                  value={attendanceYear}
                                  onChange={(e) => setAttendanceYear(Number(e.target.value))}
                                  className="w-full bg-white border border-slate-200 text-slate-700 font-semibold text-xs p-2.5 rounded-xl focus:outline-none focus:border-indigo-500 transition-all cursor-pointer"
                                >
                                  <option value={1}>1st Year</option>
                                  <option value={2}>2nd Year</option>
                                  <option value={3}>3rd Year</option>
                                  <option value={4}>4th Year</option>
                                </select>
                              </div>
                            </div>
                            
                            {students.find(s => {
                              const cleanDb = s.id.trim().toLowerCase().replace(/[^a-zA-Z0-9]/g, '');
                              const cleanInput = attendanceStudentId.trim().toLowerCase().replace(/[^a-zA-Z0-9]/g, '');
                              return s.id.trim().toLowerCase() === attendanceStudentId.trim().toLowerCase() || cleanDb === cleanInput;
                            }) ? (
                              <span className="text-[8.5px] font-bold uppercase text-emerald-600 mt-1 block tracking-wider">✅ Registered Student Profile Detected! Department unlocked for updates.</span>
                            ) : (
                              <span className="text-[8.5px] font-bold uppercase text-amber-500 mt-1 block tracking-wider">ℹ️ New Student Entry. Select department & year level to register and check-in.</span>
                            )}
                          </div>

                          <div>
                            <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1.5 tracking-wider">2. Select Target Event</label>
                            <select
                              value={attendanceEventId}
                              onChange={(e) => {
                                  setAttendanceEventId(e.target.value);
                                  setAttendanceMessage(null);
                              }}
                              className="w-full bg-slate-50/85 border border-slate-200 text-slate-700 font-semibold text-xs p-3 rounded-xl focus:outline-none focus:bg-white focus:border-indigo-500 transition-all cursor-pointer"
                            >
                              <option value="">-- Choose Event to Check-In --</option>
                              <optgroup label="Upcoming Campus Schedules">
                                {upcomingEvents.map(evt => (
                                  <option key={evt.id} value={evt.id}>{evt.title} ({evt.date})</option>
                                ))}
                              </optgroup>
                              <optgroup label="Past Events Evaluables">
                                {pastEvents.map(evt => (
                                  <option key={evt.id} value={evt.id}>{evt.title} ({evt.date})</option>
                                ))}
                              </optgroup>
                            </select>
                          </div>

                          <div className="border border-slate-200 p-5 bg-slate-50/65 rounded-2xl space-y-4">
                            <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">3. Attendance Proof Selfie</span>
                            
                            {/* CAMERA INTERACTIVE SCREEN */}
                            {isCameraActive ? (
                              <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl flex flex-col items-center">
                                <video
                                  ref={videoRef}
                                  autoPlay
                                  playsInline
                                  className="w-full max-w-xs aspect-video bg-black rounded-lg border border-slate-700 mb-3"
                                />
                                <div className="flex gap-2 w-full justify-center">
                                  <button
                                    onClick={captureSnapshot}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-lg cursor-pointer transition-all active:scale-95 border-none"
                                  >
                                    Take Snapshot
                                  </button>
                                  <button
                                    onClick={stopCamera}
                                    className="bg-slate-600 hover:bg-slate-700 text-white font-bold text-xs px-4 py-2.5 rounded-lg cursor-pointer transition-all active:scale-95 border-none"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : attendanceProof ? (
                              <div className="flex flex-col items-center border border-slate-200 p-3 bg-white rounded-xl shadow-sm">
                                <p className="text-[9px] font-bold text-slate-400 mb-2 font-mono">PROOFS_SNAPSHOT_DRAFT.JPG</p>
                                <img
                                  src={attendanceProof}
                                  alt="Attendance Proof Draft"
                                  className="w-full max-w-xs aspect-video object-cover rounded-lg border border-slate-200"
                                />
                                <button
                                  onClick={() => setAttendanceProof('')}
                                  className="mt-3 bg-red-50 text-red-600 hover:bg-red-100/80 font-bold text-[10px] px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer border-none"
                                >
                                  Retake / Discard Photo
                                </button>
                              </div>
                            ) : (
                              <div className="space-y-3">
                                {/* Option A: Webcam Activation */}
                                <button
                                  onClick={startCamera}
                                  className="w-full bg-white hover:bg-slate-50 border border-slate-200 text-xs font-bold uppercase py-3 px-4 flex items-center justify-center gap-2 cursor-pointer rounded-xl transition-all shadow-sm hover:shadow-md"
                                >
                                  <Camera className="w-4 h-4 text-emerald-500 stroke-[2.5px]" />
                                  Use Live Kiosk Camera
                                </button>

                                {/* Option B: File uploader */}
                                <div className="relative">
                                  <label className="w-full bg-white hover:bg-slate-50 border border-slate-200 text-xs font-bold uppercase py-3 px-4 flex items-center justify-center gap-2 cursor-pointer rounded-xl transition-all shadow-sm hover:shadow-md">
                                    <Upload className="w-4 h-4 text-indigo-500 stroke-[2.5px]" />
                                    Upload Proof Image File
                                    <input
                                      type="file"
                                      accept="image/*"
                                      className="hidden"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                          const reader = new FileReader();
                                          reader.onloadend = () => {
                                            setAttendanceProof(reader.result as string);
                                            addTerminalLine("Proof image successfully loaded from local directory.");
                                          };
                                          reader.readAsDataURL(file);
                                        }
                                      }}
                                    />
                                  </label>
                                </div>

                                {/* Option C: High-fidelity mock templates */}
                                <div className="pt-2">
                                  <p className="text-[8.5px] font-bold text-slate-400 uppercase mb-1.5 tracking-wider">Sandbox Fallback: Quick Mock Selfies</p>
                                  <div className="grid grid-cols-2 gap-2">
                                    <button
                                      onClick={() => {
                                        const mockPic = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80";
                                        setAttendanceProof(mockPic);
                                        addTerminalLine("Selected Gym Event Selfie mock asset.");
                                      }}
                                      className="bg-white border border-slate-200 rounded-lg p-2 text-[8.5px] font-bold hover:bg-slate-50 flex flex-col items-center gap-1 cursor-pointer transition-colors"
                                    >
                                      <span className="block truncate font-bold text-slate-700">Selfie at Quadrangle</span>
                                    </button>
                                    <button
                                      onClick={() => {
                                        const mockPic = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80";
                                        setAttendanceProof(mockPic);
                                        addTerminalLine("Selected Council Booth Selfie mock asset.");
                                      }}
                                      className="bg-white border border-slate-200 rounded-lg p-2 text-[8.5px] font-bold hover:bg-slate-50 flex flex-col items-center gap-1 cursor-pointer transition-colors"
                                    >
                                      <span className="block truncate font-bold text-slate-700">Selfie at SSC Pavilion</span>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* RIGHT PREVIEW / DETAILS BLOCK */}
                        <div className="md:col-span-5 bg-indigo-50/30 border border-indigo-100/50 p-5 rounded-2xl space-y-4">
                          <h4 className="text-xs font-bold uppercase text-[#0B2B64] leading-none tracking-wider">Walk-In Candidate Verification</h4>
                          
                          <div className="space-y-2.5 text-xs text-slate-600">
                            <div className="flex justify-between border-b border-indigo-100/40 pb-2">
                              <span className="text-slate-400 font-medium">ID Number:</span>
                              <span className="font-mono font-bold text-slate-800">{attendanceStudentId || 'Not Entered'}</span>
                            </div>
                            <div className="flex justify-between border-b border-indigo-100/40 pb-2">
                              <span className="text-slate-400 font-medium">Full Name:</span>
                              <span className="font-bold text-slate-800">{attendanceStudentName || 'Not Entered'}</span>
                            </div>
                            <div className="flex justify-between border-b border-indigo-100/40 pb-2">
                              <span className="text-slate-400 font-medium">Course Major:</span>
                              <span className="font-bold text-slate-800">{attendanceCollege || 'Not Entered'}</span>
                            </div>
                            <div className="flex justify-between border-b border-indigo-100/40 pb-2">
                              <span className="text-slate-400 font-medium">Year Level:</span>
                              <span className="font-bold text-indigo-950">
                                {attendanceYear === 1 ? '1st' : attendanceYear === 2 ? '2nd' : attendanceYear === 3 ? '3rd' : '4th'} Year
                              </span>
                            </div>
                            <div className="flex justify-between pb-1">
                              <span className="text-slate-400 font-medium">Earnable Reward:</span>
                              <span className="font-mono font-bold text-emerald-600 uppercase tracking-wider">+50 CIVIC PTS</span>
                            </div>
                          </div>

                          <div className="pt-2">
                            <button
                              onClick={submitAttendanceCheckIn}
                              disabled={isSubmittingAttendance}
                              className={`w-full py-3 px-6 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md ${isSubmittingAttendance ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'bg-gradient-to-r from-amber-400 to-[#F2C811] text-[#0B2B64] hover:brightness-105 active:scale-95'}`}
                            >
                              {isSubmittingAttendance ? 'Registering...' : t('log_checkin')}
                            </button>
                            <p className="text-[8px] text-slate-400 font-bold uppercase mt-2 text-center">Subject to administrative OSAS evaluation audit & review</p>
                          </div>               </div>
                        </div>
                      </div>
                    </div>
                  )}

                {/* STEP STUDENT REWARDS STORE */}
                {kioskStep === 'rewards' && (
                  <div className="p-6 md:p-8 space-y-6 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-4 mb-4">
                        <h3 className="text-lg font-extrabold uppercase text-[#0B2B64] flex items-center gap-2">
                          <Gift className="w-5 h-5 text-amber-500" />
                          WVSU-LC Student Rewards Store
                        </h3>
                        <button
                          onClick={() => { setKioskStep('greeting'); setRewardsError(''); setRewardsSuccess(''); }}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-800 text-xs font-bold uppercase tracking-wider py-1.5 px-4 cursor-pointer transition-all rounded-lg border-none"
                        >
                          Back to Menu
                        </button>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-gradient-to-br from-indigo-900 via-[#0B2B64] to-slate-900 text-white p-5 rounded-2xl border border-indigo-950 mb-6 shadow-lg shadow-indigo-950/15">
                        <div>
                          <p className="text-[10px] font-bold uppercase text-indigo-200 block leading-none tracking-widest">YOUR ACCUMULATED POINTS BALANCE</p>
                          <h4 className="text-3xl font-black font-mono text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-200 mt-1">{loggedInStudent.points ?? 0} PTS AVAILABLE</h4>
                        </div>
                        <p className="text-xs font-medium text-indigo-100/90 mt-2 sm:mt-0 max-w-sm leading-relaxed">
                          Earn more points by checking into department assemblies, participating in evaluations, and contributing to student activities!
                        </p>
                      </div>

                      {/* Error Messages */}
                      {rewardsError && (
                        <div className="p-3.5 mb-4 border border-red-100 bg-red-50/70 text-red-800 font-semibold text-xs flex items-center gap-2 rounded-xl">
                          <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
                          <p>{rewardsError}</p>
                        </div>
                      )}

                      {/* Success Messages */}
                      {rewardsSuccess && (
                        <div className="p-4 mb-4 border border-emerald-100 bg-emerald-50/70 text-emerald-800 font-semibold text-xs rounded-xl shadow-sm">
                          <div className="flex items-start gap-2.5">
                            <CheckCircle className="w-5 h-5 shrink-0 text-emerald-500" />
                            <div>
                              <p className="font-extrabold uppercase text-emerald-950 tracking-wide">REWARD VOUCHER DECANTED SUCCESSFULLY!</p>
                              <p className="mt-1 font-bold text-[11px] leading-relaxed text-slate-600">{rewardsSuccess}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* rewards cards list */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {CAMPUS_REWARDS.map(reward => {
                          const canAfford = (loggedInStudent.points ?? 0) >= reward.pointsCost;
                          return (
                            <div key={reward.id} className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:shadow-indigo-950/5 hover:border-indigo-100/80 group">
                              <div>
                                {reward.image && (
                                  <div className="w-full h-32 rounded-xl overflow-hidden mb-3.5 border border-slate-100 relative shadow-sm">
                                    <img 
                                      src={reward.image} 
                                      alt={reward.title} 
                                      referrerPolicy="no-referrer"
                                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                  </div>
                                )}
                                <div className="flex justify-between items-center mb-3">
                                  <span className="text-[8px] font-bold uppercase px-2 py-0.5 bg-slate-50 text-slate-500 border border-slate-100 rounded-md">{reward.category}</span>
                                  <span className="font-mono text-xs font-bold text-amber-600 bg-amber-50 border border-amber-100/50 px-2 py-0.5 rounded-lg">{reward.pointsCost} PTS</span>
                                </div>
                                <h4 className="text-sm font-extrabold text-[#0B2B64] uppercase mb-1">{reward.title}</h4>
                                <p className="text-[10px] text-slate-400 font-semibold leading-relaxed mb-4">{reward.description}</p>
                              </div>

                              <button
                                onClick={() => handleRedeemReward(reward)}
                                disabled={isRedeeming}
                                className={`w-full py-2.5 px-3 rounded-xl text-center text-[10px] font-bold uppercase tracking-wider cursor-pointer border-none transition-all active:scale-95 shadow-sm ${canAfford ? 'bg-[#0B2B64] hover:bg-indigo-950 text-white' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
                              >
                                {canAfford ? 'Redeem Perk Item' : `Needs ${reward.pointsCost - (loggedInStudent.points ?? 0)} More Pts`}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP VIEW ANNOUNCEMENTS / UPCOMING */}
                {kioskStep === 'upcoming' && (
                  <div className="p-6 md:p-8 space-y-6 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-4 mb-5">
                        <h3 className="text-lg font-extrabold uppercase text-[#0B2B64] flex items-center gap-2">
                          <Calendar className="w-5 h-5 text-indigo-950" />
                          Upcoming Campus Announcements
                        </h3>
                        <button
                          onClick={() => setKioskStep('greeting')}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-800 text-xs font-bold uppercase tracking-wider py-1.5 px-4 cursor-pointer transition-all rounded-lg border-none"
                        >
                          Back to Menu
                        </button>
                      </div>

                      <div className="space-y-4">
                        {upcomingEvents.map((evt, i) => (
                          <div
                            key={evt.id}
                            className={`p-4 border rounded-xl transition-all duration-300 cursor-pointer ${selectedUpcomingId === evt.id ? 'bg-indigo-50/50 border-indigo-200 shadow-md shadow-indigo-100/30' : 'bg-white hover:bg-slate-50 border-slate-200/80 shadow-sm'}`}
                            onClick={() => setSelectedUpcomingId(selectedUpcomingId === evt.id ? null : evt.id)}
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex items-center gap-2.5">
                                <span className="font-mono text-[9px] bg-[#0B2B64] text-amber-300 font-extrabold py-0.5 px-2 rounded-lg uppercase tracking-wider">
                                  {i + 1}
                                </span>
                                <span className="text-base font-extrabold text-[#0B2B64] uppercase">{evt.title}</span>
                              </div>
                              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">{evt.date}</span>
                            </div>

                            {selectedUpcomingId === evt.id && (
                              <div className="mt-4 pt-4 border-t border-dashed border-slate-200 text-xs text-slate-600 space-y-3 animate-fadeIn">
                                <p className="font-semibold leading-relaxed text-slate-700">{evt.description}</p>
                                <div className="grid grid-cols-2 gap-4 text-[10px] font-mono font-bold uppercase text-slate-400">
                                  <div>Venue: <span className="text-slate-800 font-bold">{evt.venue}</span></div>
                                  <div>Time: <span className="text-slate-800 font-bold">{evt.time}</span></div>
                                  <div>Host: <span className="text-slate-800 font-bold">{evt.organizer}</span></div>
                                  <div>Open To: <span className="text-amber-600 font-extrabold">{evt.open_to}</span></div>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP EVALUATIONS SELECT */}
                {kioskStep === 'past_select' && (
                  <div className="p-6 md:p-8 space-y-6 flex-1 flex flex-col justify-between">
                    {!isCredentialsValidated ? (
                      <div className="p-8 border-2 border-dashed border-amber-200 bg-amber-50/20 rounded-2xl flex flex-col items-center justify-center text-center space-y-4 my-auto">
                        <Shield className="w-14 h-14 text-amber-500 animate-bounce" />
                        <h3 className="text-xl font-black text-[#0B2B64] uppercase tracking-tight">Identity Validation Required</h3>
                        <p className="text-xs text-slate-500 font-semibold max-w-sm leading-relaxed">
                          To access student evaluations, you must first validate your profile details. Click the button below to load the Secure Student Credentials Registry pop-up.
                        </p>
                        <div className="pt-2">
                          <button
                            onClick={openProfileUpdateModal}
                            className="bg-[#0B2B64] hover:bg-indigo-950 text-white font-bold uppercase text-xs py-3.5 px-6 rounded-xl transition-all cursor-pointer flex items-center gap-2 shadow-lg shadow-indigo-950/15 scale-100 hover:scale-[1.03] active:scale-95"
                          >
                            🔐 CLICK TO VALIDATE STUDENT CREDENTIALS
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-4 mb-4">
                          <h3 className="text-lg font-extrabold uppercase text-[#0B2B64] flex items-center gap-2">
                            <ClipboardCheck className="w-5 h-5 text-amber-500" />
                            Select past Event for Evaluation Dashboard
                          </h3>
                          <button
                            onClick={() => setKioskStep('greeting')}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-800 text-xs font-bold uppercase tracking-wider py-1.5 px-4 cursor-pointer transition-all rounded-lg border-none"
                          >
                            Back to Menu
                          </button>
                        </div>

                        <p className="text-xs text-slate-400 font-semibold mb-4 leading-relaxed">
                          Select a past event below. Showing events that participated under your college scope: <span className="text-amber-500 font-extrabold">{loggedInStudent.college}</span>
                        </p>

                        <div className="space-y-3">
                          {pastEvents
                             .filter(e => e.colleges_participated.includes(loggedInStudent.college))
                             .map((evt, i) => (
                              <div
                                key={evt.id}
                                onClick={() => {
                                  setSelectedPastEvent(evt);
                                  setKioskStep('form');
                                  setCurrentQuestionIndex(0);
                                  playBeep(1100, 0.1);
                                }}
                                className="bg-white hover:bg-gradient-to-br hover:from-white hover:to-amber-55/20 border border-slate-200 rounded-xl p-4 shadow-sm flex items-center justify-between cursor-pointer transition-all duration-300 hover:shadow-md hover:border-amber-200/50"
                              >
                                <div>
                                  <div className="text-[9px] font-mono font-bold text-slate-400">INDEX [{i + 1}] • REGISTRY ID: {evt.id}</div>
                                  <h4 className="text-base font-extrabold text-slate-800 uppercase mt-0.5">{evt.title}</h4>
                                  <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">{evt.venue} • Host Unit: {evt.organizer}</p>
                                </div>
                                <div className="p-1 bg-slate-50 rounded-lg group-hover:bg-amber-100 text-slate-400 group-hover:text-amber-600 transition-colors">
                                  <ChevronRight className="w-5 h-5 shrink-0" />
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* STEP EVALUATION FEEDBACK QUESTION WIZARD */}
                {kioskStep === 'form' && selectedPastEvent && (
                  <div className="p-6 md:p-8 space-y-6 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-3 mb-4">
                        <div>
                          <span className="text-[10px] font-bold uppercase text-amber-500 tracking-wider">Active evaluation</span>
                          <h3 className="text-base font-extrabold uppercase text-[#0B2B64] leading-tight mt-0.5">{selectedPastEvent.title}</h3>
                        </div>
                        <span className="font-mono text-[10px] font-bold bg-[#0B2B64] text-amber-300 px-3 py-1 rounded-lg border border-indigo-900/50 shrink-0">
                          Question {currentQuestionIndex + 1} of 9
                        </span>
                      </div>

                      {answersFeedback && (
                        <div className="p-2 py-1.5 bg-emerald-50/85 border border-emerald-100 text-emerald-800 font-extrabold text-[10px] rounded-lg text-center uppercase tracking-widest animate-pulse">
                          {answersFeedback}
                        </div>
                      )}

                      <div className="my-6 space-y-4">
                        <h4 className="text-lg md:text-xl font-extrabold text-slate-800 leading-snug select-none">
                          {getQuestionPrompt(currentQuestionIndex)}
                        </h4>

                        {/* Interactive Options Selectable block */}
                        {currentQuestionIndex >= 0 && currentQuestionIndex <= 4 && (
                          <div className="grid grid-cols-5 gap-3 max-w-sm">
                            {[1, 2, 3, 4, 5].map((grade) => (
                              <button
                                key={grade}
                                onClick={() => saveAnswerAndProceed(currentQuestionIndex, grade)}
                                className={`h-12 border rounded-xl font-mono font-extrabold text-lg transition-all cursor-pointer flex items-center justify-center ${wizardAnswers[`q${currentQuestionIndex + 1}`] === grade ? 'bg-gradient-to-r from-amber-400 to-[#F2C811] text-[#0B2B64] scale-[1.03] shadow-md shadow-amber-100' : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600'}`}
                              >
                                {grade}
                              </button>
                            ))}
                          </div>
                        )}

                        {currentQuestionIndex === 3 && (
                          <button
                            onClick={() => saveAnswerAndProceed(3, 'N/A')}
                            className="mt-2 bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-700 py-2.5 px-6 font-bold uppercase text-xs border border-slate-200 rounded-xl transition-all shadow-sm active:scale-95"
                          >
                            None / N/A
                          </button>
                        )}

                        {currentQuestionIndex === 5 && (
                          <div className="grid grid-cols-3 gap-3 max-w-sm">
                            {['YES', 'MAYBE', 'NO'].map((opt) => (
                              <button
                                key={opt}
                                onClick={() => saveAnswerAndProceed(5, opt)}
                                className="py-2.5 border border-slate-200 rounded-xl font-mono font-bold text-xs hover:bg-amber-50/20 hover:border-amber-200 hover:text-[#0B2B64] text-slate-600 cursor-pointer transition-all active:scale-95"
                              >
                                {opt}
                              </button>
                            ))}
                          </div>
                        )}

                        {(currentQuestionIndex === 6 || currentQuestionIndex === 7 || currentQuestionIndex === 8) && (
                          <div className="space-y-3 max-w-lg">
                            <textarea
                              rows={3}
                              placeholder="Type comment details (max 200 characters)..."
                              value={wizardAnswers[`q${currentQuestionIndex + 1}`]}
                              onChange={(e) => setWizardAnswers(prev => ({ ...prev, [`q${currentQuestionIndex + 1}`]: e.target.value.slice(0, 200) }))}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl text-xs p-3.5 focus:outline-none focus:bg-white focus:border-indigo-500 transition-all font-semibold text-slate-700 resize-none"
                            />
                            <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
                              <span>Character count: {wizardAnswers[`q${currentQuestionIndex + 1}`].length} / 200</span>
                              {currentQuestionIndex === 8 && (
                                <button
                                  onClick={() => saveAnswerAndProceed(8, 'SKIP')}
                                  className="text-[#0B2B64] hover:underline font-bold uppercase text-[9px] border-none bg-transparent cursor-pointer"
                                >
                                  Skip other comments
                                </button>
                              )}
                            </div>
                            <button
                              onClick={() => saveAnswerAndProceed(currentQuestionIndex, wizardAnswers[`q${currentQuestionIndex + 1}`] || 'N/A')}
                              className="bg-[#0B2B64] hover:bg-indigo-950 text-white font-bold uppercase tracking-wider py-3 px-6 rounded-xl text-xs transition-all cursor-pointer shadow-md shadow-indigo-900/10 active:scale-95"
                            >
                              Save and Next
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP WIZARD CONFIRMATION PANEL */}
                {kioskStep === 'confirm' && selectedPastEvent && (
                  <div className="p-6 md:p-8 space-y-6 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-lg font-extrabold uppercase text-[#0B2B64] border-b border-slate-100 pb-3 mb-4">
                        Confirm evaluation data transmission
                      </h3>
                      <div className="bg-slate-50/65 border border-slate-150 rounded-2xl p-5 space-y-3 text-xs">
                        <p className="font-bold pb-2 text-slate-400 border-b border-slate-200/50 block mb-2 uppercase tracking-wider">Please double check your recorded review values:</p>
                        <div className="grid grid-cols-2 gap-3 text-slate-700 font-medium">
                          <div>Q1 Evaluation Score: <span className="font-extrabold text-[#0B2B64]">{wizardAnswers.q1} / 5</span></div>
                          <div>Q2 Program Relevance: <span className="font-extrabold text-[#0B2B64]">{wizardAnswers.q2} / 5</span></div>
                          <div>Q3 Logistics Adequacy: <span className="font-extrabold text-[#0B2B64]">{wizardAnswers.q3} / 5</span></div>
                          <div>Q4 Speaker performance: <span className="font-extrabold text-[#0B2B64]">{wizardAnswers.q4} / 5</span></div>
                          <div>Q5 Venue Comfortability: <span className="font-extrabold text-[#0B2B64]">{wizardAnswers.q5} / 5</span></div>
                          <div>Q6 Future Attendance: <span className="font-extrabold text-[#0B2B64] uppercase">{wizardAnswers.q6}</span></div>
                        </div>
                        <div className="pt-3 border-t border-slate-200/50 font-semibold text-slate-650 space-y-1">
                          <div>Highlight: <span className="font-bold text-slate-800 block mt-1 bg-white p-2 border border-slate-100 rounded-lg">"{wizardAnswers.q7 || 'None stated'}"</span></div>
                          <div className="pt-2">Friction: <span className="font-bold text-slate-800 block mt-1 bg-white p-2 border border-slate-100 rounded-lg">"{wizardAnswers.q8 || 'None stated'}"</span></div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <button
                        onClick={submitWizardData}
                        disabled={reportLoading}
                        className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:brightness-105 hover:scale-[1.01] text-white py-3.5 rounded-xl font-bold uppercase cursor-pointer transition-all shadow-md active:scale-95 border-none"
                      >
                        {reportLoading ? "Broadcasting..." : "YES - Submit reviews"}
                      </button>
                      <button
                        onClick={() => { setKioskStep('greeting'); playBeep(500, 0.1); }}
                        className="p-3 px-8 bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-800 py-3.5 rounded-xl font-bold uppercase cursor-pointer transition-all active:scale-95 border-none"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP WIZARD COMPLETED OK BLOCK */}
                {kioskStep === 'completed' && (
                  <div className="p-6 md:p-8 space-y-6 flex-1 flex flex-col justify-center text-center max-w-md mx-auto">
                    <CheckCircle className="w-14 h-14 text-emerald-500 mx-auto animate-bounce" />
                    <div>
                      <h3 className="text-2xl font-extrabold text-[#0B2B64] mt-2 leading-none">Review File Saved!</h3>
                      <p className="text-[9px] font-bold uppercase text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full tracking-wider mt-2.5 inline-block">Evaluation recorded on live Express Datastore</p>
                    </div>

                    <p className="text-xs text-slate-400 font-semibold leading-relaxed">
                      Thank you for using the Kiosk! Your responses have successfully synced with student directories and will assist administrative bodies in scaling next year's events.
                    </p>

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-dashed border-slate-200">
                      <div className="bg-slate-50/50 p-3.5 rounded-xl border border-slate-150">
                        <div className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Your College responses</div>
                        <div className="text-2xl font-mono font-bold text-[#0B2B64] mt-0.5">{completedCollegeCount}</div>
                      </div>
                      <div className="bg-slate-50/50 p-3.5 rounded-xl border border-slate-150">
                        <div className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Campus evaluators total</div>
                        <div className="text-2xl font-mono font-bold text-slate-900 mt-0.5">{completedCampusCount}</div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setKioskStep('greeting');
                        setWizardAnswers({ q1: 5, q2: 5, q3: 5, q4: 5, q5: 5, q6: 'YES', q7: '', q8: '', q9: '' });
                        playBeep(900, 0.08);
                      }}
                      className="bg-[#0B2B64] hover:bg-indigo-950 hover:scale-[1.01] text-white py-3.5 rounded-xl font-bold uppercase text-xs transition-all cursor-pointer shadow-md border-none"
                    >
                      Clear & Return to Main Page
                    </button>
                  </div>
                )}
              </div>

              {/* TERMINAL EMULATED CLI DUMB PANEL (Matches mock visual integrity) */}
              <div className="bg-slate-950/95 backdrop-blur-md rounded-2xl p-5 border border-slate-900 text-emerald-400 font-mono text-xs shadow-xl flex flex-col justify-between h-52">
                <div className="overflow-y-auto space-y-1 pr-1 flex-1 max-h-36">
                  {terminalHistory.map((line, idx) => (
                    <div key={idx} className="leading-normal break-all">
                      {line}
                    </div>
                  ))}
                  <div ref={terminalBottomRef} />
                </div>
                <form onSubmit={handleTerminalFormSubmit} className="flex items-center gap-2 border-t border-emerald-950/40 pt-3 mt-2 shrink-0">
                  <span className="text-[#F2C811] font-black">▶</span>
                  <input
                    type="text"
                    value={terminalInput}
                    onChange={(e) => setTerminalInput(e.target.value)}
                    placeholder="Type command code or keypad digits..."
                    className="flex-1 bg-transparent border-none outline-none font-mono text-xs py-0 text-emerald-400 placeholder:text-emerald-900"
                  />
                  <input type="submit" className="hidden" />
                </form>
              </div>
            </section>
          </div>
        )}

        {/* VIEW 2: ADMINISTRATORS CONTROL CENTER */}
        {activeTab === 'admin' && (
          <div>
            {!isAdminLoggedIn ? (
              <div className="max-w-md mx-auto bg-white/95 backdrop-blur-md border border-slate-200/80 rounded-3xl p-8 shadow-xl shadow-indigo-950/5 mt-12 animate-fadeIn">
                <form onSubmit={handleAdminAuth} className="space-y-6">
                  <div className="space-y-2 text-center pb-5 border-b border-slate-100">
                    <div className="w-14 h-14 bg-indigo-50 text-[#0B2B64] mx-auto rounded-2xl flex items-center justify-center shadow-inner">
                      <Cpu className="w-7 h-7 stroke-[2px]" />
                    </div>
                    <h2 className="text-xl font-extrabold tracking-tight uppercase text-[#0B2B64] leading-tight mt-3">
                      Department Login
                    </h2>
                    <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                      Department or admin credentials verification required
                    </p>
                  </div>

                  {adminAuthError && (
                    <div className="bg-red-50/70 text-red-700 p-3.5 text-xs font-semibold border border-red-100 rounded-xl text-center flex items-center justify-center gap-2 animate-pulse">
                      <AlertTriangle className="w-4 h-4 shrink-0 text-red-500" />
                      <span>{adminAuthError}</span>
                    </div>
                  )}

                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1.5 tracking-wide">Department / Admin Username</label>
                      <input 
                        type="text"
                        required
                        value={adminUsername}
                        onChange={(e) => setAdminUsername(e.target.value)}
                        placeholder="Type ID (e.g. dept-infotech, osa, ssc)"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl text-xs p-3.5 focus:outline-none focus:bg-white focus:border-indigo-500 transition-all font-semibold text-slate-700"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1.5 tracking-wide">Access Passcode Pin</label>
                      <input 
                        type="password"
                        required
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        placeholder="Type password (e.g. infotech123, osa123)"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl text-xs p-3.5 focus:outline-none focus:bg-white focus:border-indigo-500 transition-all font-semibold text-slate-700"
                      />
                    </div>
                  </div>

                  <button 
                    type="submit"
                    className="w-full bg-[#0B2B64] text-white hover:bg-indigo-950 py-3.5 rounded-xl font-bold uppercase tracking-wider text-xs transition-all shadow-md active:scale-95 cursor-pointer border-none"
                  >
                    Authorize Department Dashboard
                  </button>
                </form>
              </div>
            ) : (
              <AdminConsole
                students={students}
                upcomingEvents={upcomingEvents}
                pastEvents={pastEvents}
                evaluations={evaluations}
                attendanceRecords={attendanceRecords}
                onSync={syncDatabase}
                currentAdminUser={currentAdminUser}
                isOfflineMode={isOfflineMode}
                setIsOfflineMode={setIsOfflineMode}
                onLogout={() => {
                  setIsAdminLoggedIn(false);
                  setCurrentAdminUser(null);
                  addTerminalLine("OSAS administrative session dissolved.");
                }}
                playBeep={playBeep}
                addTerminalLine={addTerminalLine}
              />
            )}
          </div>
        )}
      </main>
      
      {/* SECURE PROFILE CREDENTIALS MODAL */}
      {isProfileUpdateModalOpen && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border-4 border-slate-900 max-w-md w-full p-6 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] animate-scale-up space-y-4">
            <div className="flex justify-between items-center border-b-2 border-slate-200 pb-2">
              <h3 className="text-md font-black uppercase text-[#0B2B64] flex items-center gap-1.5">
                🔒 Secure Student Credentials Registry
              </h3>
              <button
                onClick={() => { setIsProfileUpdateModalOpen(false); playBeep(800, 0.05); }}
                className="text-slate-400 hover:text-slate-900 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={saveProfileUpdate} className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">Student Registration ID</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 24-1058"
                  value={editStudentId}
                  onChange={(e) => setEditStudentId(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-slate-900 font-mono font-bold text-xs p-2.5 focus:outline-none focus:bg-white"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">Student Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Maria Santos"
                  value={editStudentName}
                  onChange={(e) => setEditStudentName(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-slate-900 font-mono font-bold text-xs p-2.5 focus:outline-none focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">Course Department</label>
                  <select
                    value={editStudentCollege}
                    onChange={(e) => setEditStudentCollege(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-slate-900 font-mono font-bold text-xs p-2.5 focus:outline-none focus:bg-white"
                  >
                    {COLLEGES.map(c => (
                      <option key={c.code} value={c.code}>{c.code} - {c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">Year Level</label>
                  <select
                    value={editStudentYear}
                    onChange={(e) => setEditStudentYear(Number(e.target.value))}
                    className="w-full bg-slate-50 border-2 border-slate-900 font-mono font-bold text-xs p-2.5 focus:outline-none focus:bg-white"
                  >
                    <option value={1}>1st Year</option>
                    <option value={2}>2nd Year</option>
                    <option value={3}>3rd Year</option>
                    <option value={4}>4th Year</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">Degree Program / Major</label>
                <select
                  value={editStudentProgram}
                  onChange={(e) => setEditStudentProgram(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-slate-900 font-mono font-bold text-xs p-2.5 focus:outline-none focus:bg-white text-slate-700"
                >
                  <option value="" disabled>Select Degree Program</option>
                  <option value="BS Information Technology">BS Information Technology</option>
                  <option value="BS Secondary Education">BS Secondary Education</option>
                  <option value="BS Industrial Technology">BS Industrial Technology</option>
                  <option value="BS Hospitality Management">BS Hospitality Management</option>
                  <option value="BS Criminology">BS Criminology</option>
                </select>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => { setIsProfileUpdateModalOpen(false); playBeep(800, 0.05); }}
                  className="flex-1 py-2.5 px-4 bg-slate-100 border-2 border-slate-900 text-slate-700 font-black uppercase tracking-wider text-xs cursor-pointer text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 bg-[#F2C811] hover:bg-yellow-400 text-slate-900 font-black uppercase tracking-wider text-xs border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer text-center"
                >
                  Save Credentials
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FOOTER METRICS AREA */}
      <footer className="max-w-7xl w-full mx-auto mt-12 pt-6 border-t font-mono text-[9px] text-slate-400 uppercase tracking-widest text-center flex flex-col sm:flex-row items-center justify-between gap-2">
        <span>© 2025 WEST VISAYAS STATE UNIVERSITY - LAMBUNAO CAMPUS. ALL RIGHTS RESERVED.</span>
        <span>ENGINE CLOCK: {currentTime.toLocaleString()} PST • SECURE STATUS: SYNCHRONIZED</span>
      </footer>
    </div>
  );
}

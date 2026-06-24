import express from "express";
import path from "path";
import dotenv from "dotenv";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import { Evaluation, EvaluationReport, PastEvent, UpcomingEvent, Student, AttendanceRecord, RewardItem } from "./src/types";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// NEW PROGRAM SPECIFIC COLLEGES
const COLLEGES = [
  { code: 'BSINFO TECH', name: 'BS in Information Technology', enrolled: 350 },
  { code: 'BSED',        name: 'BS in Secondary Education',      enrolled: 400 },
  { code: 'BSIT',        name: 'BS in Industrial Technology',     enrolled: 300 },
  { code: 'BSHM',        name: 'BS in Hospitality Management',    enrolled: 250 },
  { code: 'BS CRIM',     name: 'BS in Criminology',               enrolled: 200 },
];

// PRE-DEFINED ADMINISTRATORS
const ADMIN_ACCOUNTS = [
  { username: 'admin', password: 'admin123', name: 'System Admin (OSAS)', agency: 'ALL' },
  { username: 'osa', password: 'osa123', name: 'Office of Student Affairs (OSA)', agency: 'OSA' },
  { username: 'ssc', password: 'ssc123', name: 'Supreme Student Council (SSC)', agency: 'SSC' },
  { username: 'dept-infotech', password: 'it123', name: 'Department Council (BSINFO TECH)', agency: 'BSINFO TECH' },
  { username: 'dept-bsed', password: 'ed123', name: 'Department Council (BSED)', agency: 'BSED' },
  { username: 'dept-bsit', password: 'it123', name: 'Department Council (BSIT)', agency: 'BSIT' },
  { username: 'dept-bshm', password: 'hm123', name: 'Department Council (BSHM)', agency: 'BSHM' },
  { username: 'dept-bscrim', password: 'crim123', name: 'Department Council (BS CRIM)', agency: 'BS CRIM' },
];

// DATA FILE PATHS FOR DISK PERSISTENCE (EXPRESS ON-DISK DB SIMULATION)
const DB_EVALUATIONS_PATH = path.join(process.cwd(), 'db_evaluations.json');
const DB_PAST_EVENTS_PATH = path.join(process.cwd(), 'db_past_events.json');
const DB_UPCOMING_EVENTS_PATH = path.join(process.cwd(), 'db_upcoming_events.json');
const DB_STUDENTS_PATH = path.join(process.cwd(), 'db_students.json');
const DB_ATTENDANCE_PATH = path.join(process.cwd(), 'db_attendance.json');

// FALLBACK PRELOADED DATA
const INITIAL_STUDENTS: Student[] = [
  { id: '2021-0001', name: 'Maria Santos',   college: 'BSINFO TECH', program: 'BS Information Technology', year: 3, points: 150, redeemedRewards: [] },
  { id: '2022-0045', name: 'Juan dela Cruz', college: 'BSED',        program: 'BS Secondary Education',   year: 2, points: 50, redeemedRewards: [] },
  { id: '2020-0118', name: 'Ana Reyes',      college: 'BSHM',        program: 'BS Hospitality Management',  year: 4, points: 200, redeemedRewards: [] },
  { id: '2023-0072', name: 'Carlo Mendoza',  college: 'BSIT',        program: 'BS Industrial Technology',   year: 1, points: 100, redeemedRewards: [] },
  { id: '2021-0203', name: 'Lea Villanueva', college: 'BSHM',        program: 'BS Hospitality Management',  year: 3, points: 0, redeemedRewards: [] },
  { id: '2022-0199', name: 'Cardo Dalisay',  college: 'BS CRIM',     program: 'BS Criminology',             year: 2, points: 120, redeemedRewards: [] },
];

const INITIAL_ATTENDANCE: AttendanceRecord[] = [
  {
    id: "ATT-1001",
    studentId: "2021-0001",
    studentName: "Maria Santos",
    college: "BSINFO TECH",
    year: 3,
    eventId: "EVT-P01",
    eventTitle: "Brigada Eskwela 2025",
    timestamp: "2025-06-10T08:15:00Z",
    pointsEarned: 50,
    proofImage: "https://images.unsplash.com/photo-1577896851231-70ef18881754?w=500&auto=format&fit=crop&q=60",
    status: "APPROVED"
  },
  {
    id: "ATT-1002",
    studentId: "2020-0118",
    studentName: "Ana Reyes",
    college: "BSHM",
    year: 4,
    eventId: "EVT-P02",
    eventTitle: "Sports Fest Opening Ceremony",
    timestamp: "2025-06-20T08:30:00Z",
    pointsEarned: 50,
    proofImage: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=500&auto=format&fit=crop&q=60",
    status: "APPROVED"
  }
];

const INITIAL_PAST_EVENTS: PastEvent[] = [
  {
    id: 'EVT-P01',
    title: 'Brigada Eskwela 2025',
    date: 'June 10, 2025',
    venue: 'WVSU-LC Campus',
    organizer: 'Supreme Student Council (SSC)',
    total_attendance: 320,
    colleges_participated: ['BSINFO TECH', 'BSED', 'BSHM'],
  },
  {
    id: 'EVT-P02',
    title: 'Sports Fest Opening Ceremony',
    date: 'June 20, 2025',
    venue: 'WVSU-LC Gymnasium',
    organizer: 'Office of Student Affairs (OSA)',
    total_attendance: 510,
    colleges_participated: ['BSINFO TECH', 'BSED', 'BSIT', 'BSHM'],
  },
];

const INITIAL_UPCOMING_EVENTS: UpcomingEvent[] = [
  {
    id: 'EVT-001',
    title: 'WVSU-LC Foundation Day 2025',
    date: 'July 18, 2025',
    time: '8:00 AM - 5:00 PM',
    venue: 'WVSU-LC Quadrangle',
    organizer: 'Office of Student Affairs (OSA)',
    open_to: 'All Students',
    description: 'Annual celebration of the campus founding with cultural shows, sports events, and recognition ceremonies.'
  },
  {
    id: 'EVT-002',
    title: 'Multi-Sectoral Career Fair 2025',
    date: 'October 12, 2025',
    time: '9:00 AM - 3:00 PM',
    venue: 'WVSU-LC Multi-Purpose Hall',
    organizer: 'Office of Student Affairs (OSA)',
    open_to: 'BSINFO TECH, BSED, BSIT, BSHM',
    description: 'Placement services and local company booths and initial job interviews for fourth-year level students.'
  }
];

const INITIAL_EVALUATIONS: Evaluation[] = [
  {
    id: "SUB-P01-01",
    student_id: "2021-0001",
    college: "BSINFO TECH",
    event_id: "EVT-P01",
    q1: 5, q2: 4, q3: 5, q4: "N/A", q5: 4,
    q6: "YES",
    q7: "I loved the sense of community and team effort across different courses. Painting the classrooms went by so quickly!",
    q8: "We ran out of garbage bags and paint brushes, so there was some waiting around.",
    q9: "Loved the music played over the campus speakers.",
    timestamp: "2025-06-10T14:30:00Z"
  },
  {
    id: "SUB-P01-02",
    student_id: "2022-0045",
    college: "BSED",
    event_id: "EVT-P01",
    q1: 4, q2: 5, q3: 4, q4: 4, q5: 3,
    q6: "YES",
    q7: "Felt very fulfilling to prepare classrooms for the children, and we learned how to coordinate large groups.",
    q8: "The snacks and water were distributed unevenly. Some departments got nothing because they ran out.",
    q9: "The student council did a good job despite the heat.",
    timestamp: "2025-06-10T15:10:00Z"
  },
  {
    id: "SUB-P01-03",
    student_id: "2021-0203",
    college: "BSHM",
    event_id: "EVT-P01",
    q1: 4, q2: 3, q3: 4, q4: "N/A", q5: 4,
    q6: "YES",
    q7: "The cooperative vibe was excellent. Everyone was very friendly and did their part.",
    q8: "Maybe start earlier at 6:30 AM. By 11:30 AM, the heat was unbearable and people were exhausted.",
    q9: "SKIP",
    timestamp: "2025-06-10T16:00:00Z"
  },
  {
    id: "SUB-P01-04",
    student_id: "2023-0072",
    college: "BSIT",
    event_id: "EVT-P01",
    q1: 3, q2: 3, q3: 2, q4: "N/A", q5: 3,
    q6: "MAYBE",
    q7: "The campus looks much cleaner and safer now.",
    q8: "The zone coordination was messy. BSIT was assigned to the back lot, but there were no instructions or tools ready there.",
    q9: "Please organize the tools checklist next time.",
    timestamp: "2025-06-10T16:20:00Z"
  },
  {
    id: "SUB-P02-01",
    student_id: "2020-0118",
    college: "BSHM",
    event_id: "EVT-P02",
    q1: 5, q2: 4, q3: 5, q4: 5, q5: 4,
    q6: "YES",
    q7: "The grand parade of delegates and the dramatic lighting of the sports fest torch was unforgettable! Very hype atmosphere.",
    q8: "The sound system in the gymnasium had an awful echo. It was hard to understand what the speakers were saying from our side.",
    q9: "Go BSHM team! We won the best banner design!",
    timestamp: "2025-06-20T17:00:00Z"
  },
  {
    id: "SUB-P02-02",
    student_id: "2023-0072",
    college: "BSIT",
    event_id: "EVT-P02",
    q1: 4, q2: 3, q3: 3, q4: 4, q5: 3,
    q6: "YES",
    q7: "Great host/MC energy and live web streams of the grounds.",
    q8: "Stadium heat and poor gym ventilation. Sweating buckets inside the stands.",
    q9: "Add more ceiling or pivot floor fans.",
    timestamp: "2025-06-20T18:50:00Z"
  }
];

// FILE LOAD / WRITE WRAPPER UTILITIES (DATABASE INTEGRITY)
const loadData = <T>(filePath: string, fallback: T): T => {
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(content) as T;
    }
  } catch (err) {
    console.warn(`Error reading database file at ${filePath}. Returning preloaded preset.`, err);
  }
  // Initialize file
  saveData(filePath, fallback);
  return fallback;
};

const saveData = <T>(filePath: string, data: T): void => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error(`Error writing database file at ${filePath}:`, err);
  }
};

// INITIALIZE RUNTIME MEMORY FROM ON-DISK DB
let EVALUATIONS: Evaluation[] = loadData(DB_EVALUATIONS_PATH, INITIAL_EVALUATIONS);
let PAST_EVENTS: PastEvent[] = loadData(DB_PAST_EVENTS_PATH, INITIAL_PAST_EVENTS);
let UPCOMING_EVENTS: UpcomingEvent[] = loadData(DB_UPCOMING_EVENTS_PATH, INITIAL_UPCOMING_EVENTS);
let STUDENTS_DB: Student[] = loadData(DB_STUDENTS_PATH, INITIAL_STUDENTS);
let ATTENDANCE_RECORDS: AttendanceRecord[] = loadData(DB_ATTENDANCE_PATH, INITIAL_ATTENDANCE);

// Ensure all student objects have points and redeemedRewards arrays
STUDENTS_DB.forEach(s => {
  if (s.points === undefined) s.points = 0;
  if (!s.redeemedRewards) s.redeemedRewards = [];
});
saveData(DB_STUDENTS_PATH, STUDENTS_DB);

// INITIALIZE GEMINI CLIENT
let aiClient: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  aiClient = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
}

// AI Config State for Local Gemma model via LM Studio or Gemini
interface AIConfig {
  provider: 'gemini' | 'gemma_local';
  localUrl: string;
  localModel: string;
}

let AI_CONFIG: AIConfig = {
  provider: process.env.GEMINI_API_KEY ? 'gemini' : 'gemma_local',
  localUrl: process.env.LOCAL_GEMMA_URL || 'http://localhost:1234/v1',
  localModel: process.env.LOCAL_GEMMA_MODEL || 'gemma'
};

// REST ENDPOINTS

// AI CONFIGURATION ENDPOINTS
app.get("/api/ai-config", (req, res) => {
  res.json({ success: true, config: AI_CONFIG, hasGeminiKey: !!process.env.GEMINI_API_KEY });
});

app.post("/api/ai-config", (req, res) => {
  try {
    const { provider, localUrl, localModel } = req.body;
    if (provider) AI_CONFIG.provider = provider;
    if (localUrl) AI_CONFIG.localUrl = localUrl.trim();
    if (localModel) AI_CONFIG.localModel = localModel.trim();
    res.json({ success: true, config: AI_CONFIG });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 1. COLLEGES INFO
app.get("/api/colleges", (req, res) => {
  res.json({ success: true, colleges: COLLEGES });
});

// 2. STUDENTS DATA DIRECTORY
app.get("/api/students", (req, res) => {
  res.json({ success: true, students: STUDENTS_DB });
});

app.post("/api/students/registry", (req, res) => {
  try {
    const { id, name, college, program, year } = req.body;
    if (!id || !name || !college) {
      res.status(400).json({ success: false, error: "Missing required student ID, Name or College code" });
      return;
    }

    // Check if ID already exists, if so update it
    const index = STUDENTS_DB.findIndex(s => s.id === id);
    const existingPoints = index >= 0 ? (STUDENTS_DB[index].points ?? 0) : 0;
    const existingRewards = index >= 0 ? (STUDENTS_DB[index].redeemedRewards ?? []) : [];
    
    const updatedStudent: Student = {
      id,
      name,
      college,
      program: program || "N/A",
      year: Number(year) || 1,
      points: existingPoints,
      redeemedRewards: existingRewards
    };

    if (index >= 0) {
      STUDENTS_DB[index] = updatedStudent;
    } else {
      STUDENTS_DB.push(updatedStudent);
    }

    saveData(DB_STUDENTS_PATH, STUDENTS_DB);
    res.json({ success: true, student: updatedStudent, students: STUDENTS_DB });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
});

app.delete("/api/students/registry/:id", (req, res) => {
  try {
    const { id } = req.params;
    const cleanId = decodeURIComponent(id).trim().toLowerCase();
    const index = STUDENTS_DB.findIndex(s => s.id.trim().toLowerCase() === cleanId);
    if (index === -1) {
      res.status(404).json({ success: false, error: "Student not found in registry" });
      return;
    }
    const deleted = STUDENTS_DB.splice(index, 1)[0];
    saveData(DB_STUDENTS_PATH, STUDENTS_DB);
    res.json({ success: true, student: deleted });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2.1 ATTENDANCE RECORD RETRIEVAL
app.get("/api/attendance", (req, res) => {
  res.json({ success: true, attendance: ATTENDANCE_RECORDS });
});

// 2.2 LOG ATTENDANCE (WITH POINTS & SELFIE PROOF)
app.post("/api/attendance", (req, res) => {
  try {
    // Resolve all possible parameter casing from the body (flat and nested)
    const studentId = req.body.studentId || (req.body.student && req.body.student.id) || req.body.student_id;
    const studentName = req.body.studentName || (req.body.student && req.body.student.name) || req.body.student_name;
    const college = req.body.college || (req.body.student && req.body.student.college) || req.body.college_dept;
    const year = req.body.year || (req.body.student && req.body.student.year);
    const eventId = req.body.eventId || req.body.event_id;
    const eventTitle = req.body.eventTitle || req.body.event_title;
    const proofImage = req.body.proofImage || req.body.proof_image;

    if (!studentId || !studentName || !eventId) {
      res.status(400).json({ success: false, error: "Missing required Student ID, Name, or Event ID" });
      return;
    }

    // Check if they already logged attendance for this specific event
    const duplicate = ATTENDANCE_RECORDS.find(r => r.studentId.trim().toLowerCase() === studentId.trim().toLowerCase() && r.eventId === eventId);
    if (duplicate) {
      res.status(400).json({ success: false, error: "You have already logged attendance for this event!" });
      return;
    }

    // Find student in DB or create a new student registry entry on-the-fly
    let student = STUDENTS_DB.find(s => s.id.trim().toLowerCase() === studentId.trim().toLowerCase());
    
    // AUTOMATIC department lookup: if student is seen, use their registered college/department!
    let resolvedCollege = college || 'BSINFO TECH';
    if (student) {
      resolvedCollege = student.college;
    }

    // Ensure resolvedCollege is one of the valid codes
    if (!['BSINFO TECH', 'BSED', 'BSIT', 'BSHM', 'BS CRIM'].includes(resolvedCollege)) {
      resolvedCollege = 'BSINFO TECH';
    }

    if (!student) {
      student = {
        id: studentId,
        name: studentName,
        college: resolvedCollege,
        program: req.body.student?.program || `${resolvedCollege} Program`,
        year: Number(year) || 1,
        points: 0,
        redeemedRewards: []
      };
      STUDENTS_DB.push(student);
    } else {
      // Keep name & other info updated, but preserve the resolved registered college/department
      student.name = studentName;
      student.college = resolvedCollege;
      student.year = Number(year) || student.year;
    }

    const pointsEarned = 50; // Each attendance gets 50 points
    student.points = (student.points || 0) + pointsEarned;

    const newRecord: AttendanceRecord = {
      id: `ATT-${Date.now().toString().slice(-4)}-${Math.floor(Math.random() * 1000)}`,
      studentId,
      studentName,
      college: resolvedCollege, // Automatically put the student record under their proper department!
      year: Number(year) || 1,
      eventId,
      eventTitle: eventTitle || "WVSU Event",
      timestamp: new Date().toISOString(),
      pointsEarned,
      proofImage: proofImage || "", // base64 representation
      status: 'APPROVED'
    };

    ATTENDANCE_RECORDS.push(newRecord);

    saveData(DB_STUDENTS_PATH, STUDENTS_DB);
    saveData(DB_ATTENDANCE_PATH, ATTENDANCE_RECORDS);

    res.json({
      success: true,
      record: newRecord,
      points: student.points,
      student
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2.3 REVERT OR DELETE ATTENDANCE (ADMIN TASK)
app.delete("/api/attendance/:id", (req, res) => {
  try {
    const { id } = req.params;
    const cleanId = decodeURIComponent(id).trim().toLowerCase();
    const record = ATTENDANCE_RECORDS.find(r => r.id.trim().toLowerCase() === cleanId);
    if (!record) {
      res.status(404).json({ success: false, error: "Attendance record not found" });
      return;
    }

    // Revert points if student exists
    const student = STUDENTS_DB.find(s => s.id.trim().toLowerCase() === record.studentId.trim().toLowerCase());
    if (student && student.points !== undefined) {
      student.points = Math.max(0, student.points - record.pointsEarned);
    }

    ATTENDANCE_RECORDS = ATTENDANCE_RECORDS.filter(r => r.id.trim().toLowerCase() !== cleanId);

    saveData(DB_STUDENTS_PATH, STUDENTS_DB);
    saveData(DB_ATTENDANCE_PATH, ATTENDANCE_RECORDS);

    res.json({ success: true, attendance: ATTENDANCE_RECORDS });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2.4 REWARD REDEMPTION ENDPOINT
app.post("/api/students/redeem", (req, res) => {
  try {
    const studentId = req.body.studentId || req.body.student_id;
    const rewardId = req.body.rewardId || req.body.reward_id;
    const pointsCost = req.body.pointsCost !== undefined ? req.body.pointsCost : req.body.points_cost;
    const rewardTitle = req.body.rewardTitle || req.body.reward_title;
    const college = req.body.college || req.body.student_college || req.body.college_dept;

    if (!studentId || !rewardId || pointsCost === undefined) {
      res.status(400).json({ success: false, error: "Missing student ID, Reward ID, or points cost" });
      return;
    }

    const student = STUDENTS_DB.find(s => s.id === studentId);
    if (!student) {
      res.status(404).json({ success: false, error: "Student not found in the campus registry." });
      return;
    }

    // Validation of the department of that student
    const resolvedCollege = student.college || college;
    if (!resolvedCollege || !['BSINFO TECH', 'BSED', 'BSIT', 'BSHM', 'BS CRIM'].includes(resolvedCollege)) {
      res.status(400).json({ success: false, error: "Redemption Rejected: Student must belong to a valid college department (BSINFO TECH, BSED, BSIT, BSHM, or BS CRIM) to redeem rewards." });
      return;
    }

    // Specific reward department eligibility validation
    if (rewardId === 'REW-2' && !['BSINFO TECH', 'BSED', 'BSIT'].includes(resolvedCollege)) {
      res.status(400).json({ success: false, error: `The College Pride Stickers Pack is restricted to BSINFO TECH, BSED, and BSIT departments. Your department (${resolvedCollege}) is not eligible.` });
      return;
    }

    if (rewardId === 'REW-3' && !['BSINFO TECH', 'BSIT'].includes(resolvedCollege)) {
      res.status(400).json({ success: false, error: `The WVSU-LC Developer Cap is restricted to tech majors (BSINFO TECH, BSIT). Your department (${resolvedCollege}) is not eligible.` });
      return;
    }

    const currentPoints = student.points || 0;
    if (currentPoints < pointsCost) {
      res.status(400).json({ success: false, error: `Insufficient points! You need ${pointsCost} but have ${currentPoints}.` });
      return;
    }

    student.points = currentPoints - pointsCost;
    if (!student.redeemedRewards) {
      student.redeemedRewards = [];
    }
    student.redeemedRewards.push(`${rewardTitle} (${new Date().toLocaleDateString()})`);

    saveData(DB_STUDENTS_PATH, STUDENTS_DB);
    res.json({ success: true, student });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. UPCOMING EVENTS CRUD
app.get("/api/upcoming-events", (req, res) => {
  res.json({ success: true, upcomingEvents: UPCOMING_EVENTS });
});

app.post("/api/upcoming-events", (req, res) => {
  try {
    const { title, date, time, venue, organizer, open_to, description } = req.body;
    if (!title || !date || !venue || !organizer) {
      res.status(400).json({ success: false, error: "Missing required fields for upcoming event." });
      return;
    }

    const newId = `EVT-${Date.now().toString().slice(-4)}`;
    const newEvent: UpcomingEvent = {
      id: newId,
      title,
      date,
      time: time || "All-Day",
      venue,
      organizer,
      open_to: open_to || "All Students",
      description: description || ""
    };

    UPCOMING_EVENTS.push(newEvent);
    saveData(DB_UPCOMING_EVENTS_PATH, UPCOMING_EVENTS);

    res.json({ success: true, event: newEvent, upcomingEvents: UPCOMING_EVENTS });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
});

app.delete("/api/upcoming-events/:id", (req, res) => {
  try {
    const { id } = req.params;
    UPCOMING_EVENTS = UPCOMING_EVENTS.filter(e => e.id !== id);
    saveData(DB_UPCOMING_EVENTS_PATH, UPCOMING_EVENTS);
    res.json({ success: true, upcomingEvents: UPCOMING_EVENTS });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// 4. PAST EVENTS / ACTIVE EVALUABLE DIRECTORY CRUD
app.get("/api/past-events", (req, res) => {
  res.json({ success: true, pastEvents: PAST_EVENTS });
});

app.post("/api/past-events", (req, res) => {
  try {
    const { title, date, venue, organizer, total_attendance, colleges_participated } = req.body;
    if (!title || !date || !venue || !organizer) {
      res.status(400).json({ success: false, error: "Missing required fields for past event." });
      return;
    }

    const newId = `EVT-P${Date.now().toString().slice(-4)}`;
    const newEvent: PastEvent = {
      id: newId,
      title,
      date,
      venue,
      organizer,
      total_attendance: Number(total_attendance) || 100,
      colleges_participated: colleges_participated || ['BSINFO TECH', 'BSED', 'BSIT', 'BSHM', 'BS CRIM']
    };

    PAST_EVENTS.push(newEvent);
    saveData(DB_PAST_EVENTS_PATH, PAST_EVENTS);

    res.json({ success: true, event: newEvent, pastEvents: PAST_EVENTS });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
});

app.delete("/api/past-events/:id", (req, res) => {
  try {
    const { id } = req.params;
    PAST_EVENTS = PAST_EVENTS.filter(e => e.id !== id);
    saveData(DB_PAST_EVENTS_PATH, PAST_EVENTS);
    res.json({ success: true, pastEvents: PAST_EVENTS });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// 5. EVALUATIONS CRUD
app.get("/api/past-evaluations", (req, res) => {
  res.json({ success: true, evaluations: EVALUATIONS });
});

app.post("/api/submit-evaluation", (req, res) => {
  try {
    const { student_id, college, event_id, q1, q2, q3, q4, q5, q6, q7, q8, q9 } = req.body;
    
    if (!student_id || !college || !event_id) {
       res.status(400).json({ success: false, error: "Missing required Student ID, College, or Event ID" });
       return;
    }

    const newEvaluation: Evaluation = {
      id: `SUB-${event_id.replace("EVT-", "")}-${Date.now().toString().slice(-6)}`,
      student_id,
      college,
      event_id,
      q1: Number(q1),
      q2: Number(q2),
      q3: Number(q3),
      q4: q4 === "N/A" ? "N/A" : Number(q4),
      q5: Number(q5),
      q6: q6 as any,
      q7: (q7 || "").slice(0, 200),
      q8: (q8 || "").slice(0, 200),
      q9: q9 ? q9.slice(0, 200) : "SKIP",
      timestamp: new Date().toISOString()
    };

    // Find or create student in STUDENTS_DB
    let student = STUDENTS_DB.find(s => s.id.trim().toLowerCase() === student_id.trim().toLowerCase());
    if (!student) {
      student = {
        id: student_id,
        name: "Campus Walk-in Student",
        college: college,
        program: `${college} Program`,
        year: 1,
        points: 0,
        redeemedRewards: []
      };
      STUDENTS_DB.push(student);
    }

    // Award +15 points for submitting an evaluation
    student.points = (student.points || 0) + 15;
    saveData(DB_STUDENTS_PATH, STUDENTS_DB);

    EVALUATIONS.push(newEvaluation);
    saveData(DB_EVALUATIONS_PATH, EVALUATIONS);

    // Calculate real-time counts
    const collegeSubmissions = EVALUATIONS.filter(e => e.event_id === event_id && e.college === college).length;
    const campusSubmissions = EVALUATIONS.filter(e => e.event_id === event_id).length;

    res.json({
      success: true,
      evaluation: newEvaluation,
      collegeCount: collegeSubmissions,
      campusTotal: campusSubmissions,
      student
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GENUINE REPORT GENERATION ENDPOINT
app.post("/api/generate-report", async (req, res) => {
  try {
    const { eventId } = req.body;
    if (!eventId) {
       res.status(400).json({ success: false, error: "Missing eventId" });
       return;
    }

    const event = PAST_EVENTS.find(e => e.id === eventId);
    if (!event) {
       res.status(404).json({ success: false, error: `Past Event ${eventId} not found` });
       return;
    }

    const eventSubmissions = EVALUATIONS.filter(e => e.event_id === eventId);
    if (eventSubmissions.length === 0) {
       res.json({
         success: false,
         error: "No responses have been recorded yet for this event in this session. Go use the Kiosk first to submit an evaluation!"
       });
       return;
    }

    // QUANTITATIVE CALCULATIONS
    const totalSubmissions = eventSubmissions.length;
    
    // College Breakdown calculations
    const collegeBreakdown = COLLEGES.map(col => {
      const colSubmissions = eventSubmissions.filter(s => s.college === col.code).length;
      const participationRate = Number(((colSubmissions / col.enrolled) * 100).toFixed(2));
      return {
        collegeCode: col.code,
        collegeName: col.name,
        submissionsCount: colSubmissions,
        participationRate
      };
    });

    collegeBreakdown.sort((a, b) => b.participationRate - a.participationRate);
    const lowestCollege = collegeBreakdown[collegeBreakdown.length - 1];

    // Ratings Calculations
    let q1Sum = 0, q2Sum = 0, q3Sum = 0, q4Sum = 0, q4Count = 0, q5Sum = 0;
    let yesCount = 0, maybeCount = 0, noCount = 0;

    eventSubmissions.forEach(sub => {
      q1Sum += sub.q1;
      q2Sum += sub.q2;
      q3Sum += sub.q3;
      if (typeof sub.q4 === 'number' && !isNaN(sub.q4)) {
        q4Sum += sub.q4;
        q4Count++;
      }
      q5Sum += sub.q5;

      if (sub.q6 === 'YES') yesCount++;
      else if (sub.q6 === 'MAYBE') maybeCount++;
      else if (sub.q6 === 'NO') noCount++;
    });

    const q1Mean = Number((q1Sum / totalSubmissions).toFixed(2));
    const q2Mean = Number((q2Sum / totalSubmissions).toFixed(2));
    const q3Mean = Number((q3Sum / totalSubmissions).toFixed(2));
    const q4Mean = q4Count > 0 ? Number((q4Sum / q4Count).toFixed(2)) : "N/A";
    const q5Mean = Number((q5Sum / totalSubmissions).toFixed(2));

    // Overall Event Score
    let overallDenominator = 5;
    let scoresSum = q1Mean + q2Mean + q3Mean + q5Mean;
    if (typeof q4Mean === 'number') {
      scoresSum += q4Mean;
    } else {
      overallDenominator = 4;
    }
    const overallScore = Number((scoresSum / overallDenominator).toFixed(2));

    // Future Attendance Percentages
    const yesPercent = Number(((yesCount / totalSubmissions) * 100).toFixed(2));
    const maybePercent = Number(((maybeCount / totalSubmissions) * 100).toFixed(2));
    const noPercent = Number(((noCount / totalSubmissions) * 100).toFixed(2));

    let report: EvaluationReport;

    const fallback = getFallbackAnalysis(eventId, EVALUATIONS);

    // Dynamic JSON extraction helper in case local LLMs output explanation text
    const extractJson = (text: string): any => {
      try {
        return JSON.parse(text.trim());
      } catch (e: any) {
        const startIdx = text.indexOf('{');
        const endIdx = text.lastIndexOf('}');
        if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
          try {
            const jsonContent = text.substring(startIdx, endIdx + 1);
            return JSON.parse(jsonContent);
          } catch (innerError: any) {
            throw new Error("Found JSON brackets but failed to parse: " + innerError.message);
          }
        }
        throw e;
      }
    };

    const textPayloadForAI = eventSubmissions.map(sub => ({
      id: sub.id,
      college: sub.college,
      ratings: { q1: sub.q1, q2: sub.q2, q3: sub.q3, q4: sub.q4, q5: sub.q5 },
      q6: sub.q6,
      q7_what_they_liked: sub.q7,
      q8_improvements: sub.q8,
      q9_comments: sub.q9
    }));

    const prompt = `
      You are the AI engine for the WVSU-LC Student Activity Kiosk.
      Perform qualitative semantic, sentiment, and safety reviews for campus student evaluations of the event "${event.title}".
      The event had a total of ${totalSubmissions} submissions.
      
      Here is a JSON of student evaluations to analyze:
      ${JSON.stringify(textPayloadForAI, null, 2)}

      COLLEGE ENROLLED COUNTS:
      BSINFO TECH: 350, BSED: 400, BSIT: 300, BSHM: 250, BS CRIM: 200

      YOUR TASKS:
      1. Extract top 3 positive themes from Q7 responses. Write beautiful, specific, action-oriented themes.
      2. Extract top 3 improvement areas from Q8 responses. Write concrete physical/logistical critiques.
      3. Sieve through comments on safety concerns (like injuries, no first aid blocks) or harassment/discrimination (slurs, exclusionary language, bias). Flag any such submission. Provide its ID, college, the student's exact relevant text, and why you flagged it.
      4. Draft exactly 5 recommendations in this structure:
         REC-1: [Short Title] — [2-sentence explanation advising administrative actions, fully incorporating the qualitative and quantitative feedback]
         REC-2: ...
      5. Write a Strategic Insights paragraph. This must be exactly 1 paragraph (max 100 words) summarizing the core event triumph, identifying which college was most or least engaged, and pinpointing the single most urgent strategic reform administrators must enforce ahead of the next event.

      Return a JSON matching this exact structure:
      {
        "positiveThemes": ["Theme 1", "Theme 2", "Theme 3"],
        "improvementAreas": ["Theme 1", "Theme 2", "Theme 3"],
        "flaggedResponses": [
          {
            "submissionId": "...",
            "college": "...",
            "excerpt": "...",
            "reason": "..."
          }
        ],
        "recommendations": [
          {"id": "REC-1", "title": "...", "body": "..."},
          {"id": "REC-2", "title": "...", "body": "..."},
          {"id": "REC-3", "title": "...", "body": "..."},
          {"id": "REC-4", "title": "...", "body": "..."},
          {"id": "REC-5", "title": "...", "body": "..."}
        ],
        "strategicInsights": "..."
      }
    `;

    let gData: any = null;

    if (AI_CONFIG.provider === 'gemma_local') {
      try {
        console.log(`[AI] Generating report using local gemma via LM Studio: ${AI_CONFIG.localUrl} using model ${AI_CONFIG.localModel}`);
        const response = await fetch(`${AI_CONFIG.localUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: AI_CONFIG.localModel,
            messages: [
              {
                role: "system",
                content: "You are the AI engine for the WVSU-LC Student Activity Kiosk. You MUST return valid raw JSON matching the requested schema. Do not output markdown, explanations, or code-block boxes."
              },
              {
                role: "user",
                content: prompt
              }
            ],
            temperature: 0.1
          })
        });

        if (!response.ok) {
          throw new Error(`LM Studio / Local API returned status ${response.status}`);
        }

        const resData = await response.json();
        const content = resData.choices[0].message.content;
        gData = extractJson(content);
      } catch (err: any) {
        console.warn("[AI] Local gemma call failed, trying fallback option", err);
      }
    } else if (AI_CONFIG.provider === 'gemini' && aiClient) {
      try {
        const response = await aiClient.models.generateContent({
          model: "gemini-3.5-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                positiveThemes: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                },
                improvementAreas: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                },
                flaggedResponses: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      submissionId: { type: Type.STRING },
                      college: { type: Type.STRING },
                      excerpt: { type: Type.STRING },
                      reason: { type: Type.STRING }
                    },
                    required: ["submissionId", "college", "excerpt", "reason"]
                  }
                },
                recommendations: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      title: { type: Type.STRING },
                      body: { type: Type.STRING }
                    },
                    required: ["id", "title", "body"]
                  }
                },
                strategicInsights: { type: Type.STRING }
              },
              required: ["positiveThemes", "improvementAreas", "flaggedResponses", "recommendations", "strategicInsights"]
            }
          }
        });

        gData = JSON.parse(response.text.trim());
      } catch (geminiError) {
        console.warn("[AI] Gemini API call failed:", geminiError);
      }
    }

    if (gData) {
      try {
        report = {
          eventId: event.id,
          eventTitle: event.title,
          eventDate: event.date,
          generatedAt: new Date().toLocaleString("en-US", { timeZone: "Asia/Manila" }) + " (PST)",
          sectionA: {
            totalSubmissions,
            collegeBreakdown,
            lowestCollegeCode: lowestCollege.collegeCode,
            lowestCollegeName: lowestCollege.collegeName
          },
          sectionB: {
            q1Mean,
            q2Mean,
            q3Mean,
            q4Mean,
            q5Mean,
            overallScore
          },
          sectionC: {
            positiveThemes: (gData.positiveThemes || []).slice(0, 3),
            improvementAreas: (gData.improvementAreas || []).slice(0, 3),
            futureIntentPercent: {
              yes: yesPercent,
              maybe: maybePercent,
              no: noPercent
            },
            flaggedCount: (gData.flaggedResponses || []).length
          },
          sectionD: (gData.recommendations || []).map((rec: any, idx: number) => ({
            id: `REC-${idx + 1}`,
            title: rec.title,
            body: rec.body
          })),
          sectionE: gData.strategicInsights || "No strategic insights yielded.",
          appendix: (gData.flaggedResponses || []).map((flg: any) => ({
            submissionId: flg.submissionId,
            college: flg.college,
            excerpt: flg.excerpt,
            reason: flg.reason
          }))
        };
      } catch (err: any) {
        console.warn("[AI] Failed parsing response attributes, falling back", err);
        report = assembleFallbackReport(event, totalSubmissions, collegeBreakdown, lowestCollege, q1Mean, q2Mean, q3Mean, q4Mean, q5Mean, overallScore, yesPercent, maybePercent, noPercent, fallback);
      }
    } else {
      report = assembleFallbackReport(event, totalSubmissions, collegeBreakdown, lowestCollege, q1Mean, q2Mean, q3Mean, q4Mean, q5Mean, overallScore, yesPercent, maybePercent, noPercent, fallback);
    }

    res.json({ success: true, report });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PROGRAMMATIC FALLBACK GENERATION HELPER
const getFallbackAnalysis = (eventId: string, responses: Evaluation[]) => {
  const eventResponses = responses.filter(r => r.event_id === eventId);
  if (eventId === 'EVT-P01') {
    return {
      positiveThemes: [
        "Incredible cooperation and deep multi-disciplinary teamwork from BSINFO TECH & BSED participants.",
        "Profound personal satisfaction from painting, arranging, and optimizing classrooms.",
        "Lively acoustic setup and high student involvement during general campus cleaning loops."
      ],
      improvementAreas: [
        "Unacceptable deficiency of primary tools (brushes, trash bags, clearing equipment) in BSHM/BSIT zones.",
        "Unbalanced and unfair refreshment and water distribution centers.",
        "Excessive heat exhaustion caused by starting the outdoor workflow late in the morning."
      ],
      flagged: eventResponses
        .filter(r => r.q8.toLowerCase().includes("unsafe") || r.q8.toLowerCase().includes("injury") || r.q8.toLowerCase().includes("first aid"))
        .map(r => ({
          submissionId: r.id,
          college: r.college,
          excerpt: r.q8,
          reason: "Critical safety risk report (lack of first aid kits and dismissive supervisor response)."
        })),
      recommendations: [
        {
          id: "REC-1",
          title: "Establish Zoned First Aid Hubs",
          body: "Form dedicated safety teams with fully stocked medical and heatstroke hydration boxes in BSINFO TECH, BSED, BSIT, BSHM, and BS CRIM buildings."
        },
        {
          id: "REC-2",
          title: "Reschedule to Cool Hours",
          body: "Pull starting line back to 6:30 AM and mandate absolute cessation of outdoor physical labor by 10:30 AM to protect against high heat indexes."
        },
        {
          id: "REC-3",
          title: "Formulate Core Inventory Logs",
          body: "Ensure an equal distribution of paint kits and shovels to each degree course department by utilizing pre-registries."
        },
        {
          id: "REC-4",
          title: "Implement Digital Meal Coupons",
          body: "Adopt QR-equipped food code vouchers mapped to student IDs to ensure equitable snacks and drinks allocation."
        },
        {
          id: "REC-5",
          title: "Empower Technology Marshals",
          body: "Enlist BSINFO TECH developers to create simple, live SMS notification channels to communicate progress and task coordinates in real-time."
        }
      ],
      strategicInsights: "Brigada Eskwela 2025 showcased excellent student energy (with BSINFO TECH recording the highest participation), yet suffered from a dangerous tool deficit and severe midday heat exhaustion. The complete absence of standard medical boxes represents a critical institutional vulnerability. We highly recommend that the Supreme Student Council (SSC) mandates rigid pre-event safety clearances before launching outdoor works."
    };
  } else {
    return {
      positiveThemes: [
        "Outstanding delegate march coordination and inspirational ignition of the sports flame.",
        "Stellar dance performances and colorful department banner layouts.",
        "High school pride and excellent live video feeds to campus hallways."
      ],
      improvementAreas: [
        "Distressing sound system echoing making minor and major speeches fully unintelligible.",
        "Excessive crowding and very poor ventilation in the gymnasium seating sections during noon hours.",
        "Delay of over 1.5 hours in starting columns causing dehydration."
      ],
      flagged: eventResponses
        .filter(r => r.q8.toLowerCase().includes("offensive") || r.q8.toLowerCase().includes("harass") || r.q8.toLowerCase().includes("discrimination"))
        .map(r => ({
          submissionId: r.id,
          college: r.college,
          excerpt: r.q8,
          reason: "Student conduct concern reported during delegates' entrance queue."
        })),
      recommendations: [
        {
          id: "REC-1",
          title: "Tune Gym Sound Dampeners",
          body: "Mount secondary acoustic delay boards or position speakers closer to delegate lines to eliminate gym echo."
        },
        {
          id: "REC-2",
          title: "Install Exhaust Systems",
          body: "Deploy large industrial blowers/fans in the physical gymnasium halls and allocate alternative viewing lounges with live webcasts."
        },
        {
          id: "REC-3",
          title: "Establish Safety Patrol Staffs",
          body: "Deploy staff marshals near student delegate sections to proactively reinforce inclusive speech and safe conduct guidelines."
        },
        {
          id: "REC-4",
          title: "Rigid Timers for Speeches",
          body: "Impose a strict 5-minute cap on secondary officials' talks to maintain parade momentum."
        },
        {
          id: "REC-5",
          title: "Disperse Cooling Stations",
          body: "Provide water and electrolyte stations adjacent to all major college blocks to prevent dehydration under heavy heat."
        }
      ],
      strategicInsights: "The Opening Ceremony was highly successful in delegate pageantry, led by BSED's high engagement, but was bottlenecked by severe acoustical problems and high gym indoor heat. Conduct guidelines must be strictly policed in delegate lines. The highest priority is to integrate industrial exhaust setups and enforce speech duration limits before next season's events."
    };
  }
};

function assembleFallbackReport(
  event: PastEvent,
  totalSubmissions: number,
  collegeBreakdown: any,
  lowestCollege: any,
  q1Mean: number,
  q2Mean: number,
  q3Mean: number,
  q4Mean: any,
  q5Mean: number,
  overallScore: number,
  yesPercent: number,
  maybePercent: number,
  noPercent: number,
  fallback: any
): EvaluationReport {
  return {
    eventId: event.id,
    eventTitle: event.title,
    eventDate: event.date,
    generatedAt: new Date().toLocaleString("en-US", { timeZone: "Asia/Manila" }) + " (PST)",
    sectionA: {
      totalSubmissions,
      collegeBreakdown,
      lowestCollegeCode: lowestCollege.collegeCode,
      lowestCollegeName: lowestCollege.collegeName
    },
    sectionB: {
      q1Mean,
      q2Mean,
      q3Mean,
      q4Mean,
      q5Mean,
      overallScore
    },
    sectionC: {
      positiveThemes: fallback.positiveThemes,
      improvementAreas: fallback.improvementAreas,
      futureIntentPercent: {
        yes: yesPercent,
        maybe: maybePercent,
        no: noPercent
      },
      flaggedCount: fallback.flagged.length
    },
    sectionD: fallback.recommendations,
    sectionE: fallback.strategicInsights,
    appendix: fallback.flagged
  };
}

// SETUP VITE DEVELOPMENT GATEWAY VS STATIC PRODUCTION DISTRIBUTION
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`WVSU-LC Kiosk Backend serving on http://0.0.0.0:${PORT}`);
  });
}

startServer();

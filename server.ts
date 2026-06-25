import dotenv from "dotenv";
dotenv.config();

import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import { Evaluation, EvaluationReport, PastEvent, UpcomingEvent, Student, AttendanceRecord } from "./src/types";
import supabase from "./src/lib/supabase";

const app = express();
app.use(express.json({ limit: '10mb' })); // large limit for base64 proof images

const PORT = 3000;

// COLLEGES DEFINITION (static — not stored in DB)
const COLLEGES = [
  { code: 'BSINFO TECH', name: 'BS in Information Technology', enrolled: 350 },
  { code: 'BSED',        name: 'BS in Secondary Education',      enrolled: 400 },
  { code: 'BSIT',        name: 'BS in Industrial Technology',     enrolled: 300 },
  { code: 'BSHM',        name: 'BS in Hospitality Management',    enrolled: 250 },
  { code: 'BS CRIM',     name: 'BS in Criminology',               enrolled: 200 },
];

// PRE-DEFINED ADMINISTRATORS (static — kept in memory)
const ADMIN_ACCOUNTS = [
  { username: 'admin',        password: 'admin123',  name: 'System Admin (OSAS)',             agency: 'ALL' },
  { username: 'osa',          password: 'osa123',    name: 'Office of Student Affairs (OSA)', agency: 'OSA' },
  { username: 'ssc',          password: 'ssc123',    name: 'Supreme Student Council (SSC)',   agency: 'SSC' },
  { username: 'dept-infotech',password: 'it123',     name: 'Department Council (BSINFO TECH)',agency: 'BSINFO TECH' },
  { username: 'dept-bsed',    password: 'ed123',     name: 'Department Council (BSED)',       agency: 'BSED' },
  { username: 'dept-bsit',    password: 'it123',     name: 'Department Council (BSIT)',       agency: 'BSIT' },
  { username: 'dept-bshm',    password: 'hm123',     name: 'Department Council (BSHM)',       agency: 'BSHM' },
  { username: 'dept-bscrim',  password: 'crim123',   name: 'Department Council (BS CRIM)',    agency: 'BS CRIM' },
];

// ─────────────────────────────────────────────────────────────────────────────
// FALLBACK FLAT-FILE PATHS (used when Supabase is unavailable)
// ─────────────────────────────────────────────────────────────────────────────
const DB_EVALUATIONS_PATH    = path.join(process.cwd(), 'db_evaluations.json');
const DB_PAST_EVENTS_PATH    = path.join(process.cwd(), 'db_past_events.json');
const DB_UPCOMING_EVENTS_PATH= path.join(process.cwd(), 'db_upcoming_events.json');
const DB_STUDENTS_PATH       = path.join(process.cwd(), 'db_students.json');
const DB_ATTENDANCE_PATH     = path.join(process.cwd(), 'db_attendance.json');

const INITIAL_STUDENTS: Student[] = [
  { id: '2021-0001', name: 'Maria Santos',   college: 'BSINFO TECH', program: 'BS Information Technology', year: 3, points: 150, redeemedRewards: [] },
  { id: '2022-0045', name: 'Juan dela Cruz', college: 'BSED',        program: 'BS Secondary Education',    year: 2, points: 50,  redeemedRewards: [] },
  { id: '2020-0118', name: 'Ana Reyes',      college: 'BSHM',        program: 'BS Hospitality Management', year: 4, points: 200, redeemedRewards: [] },
  { id: '2023-0072', name: 'Carlo Mendoza',  college: 'BSIT',        program: 'BS Industrial Technology',  year: 1, points: 100, redeemedRewards: [] },
  { id: '2021-0203', name: 'Lea Villanueva', college: 'BSHM',        program: 'BS Hospitality Management', year: 3, points: 0,   redeemedRewards: [] },
  { id: '2022-0199', name: 'Cardo Dalisay',  college: 'BS CRIM',     program: 'BS Criminology',            year: 2, points: 120, redeemedRewards: [] },
];

const INITIAL_ATTENDANCE: AttendanceRecord[] = [
  {
    id: "ATT-1001", studentId: "2021-0001", studentName: "Maria Santos",
    college: "BSINFO TECH", year: 3, eventId: "EVT-P01", eventTitle: "Brigada Eskwela 2025",
    timestamp: "2025-06-10T08:15:00Z", pointsEarned: 50,
    proofImage: "https://images.unsplash.com/photo-1577896851231-70ef18881754?w=500&auto=format&fit=crop&q=60",
    status: "APPROVED"
  },
  {
    id: "ATT-1002", studentId: "2020-0118", studentName: "Ana Reyes",
    college: "BSHM", year: 4, eventId: "EVT-P02", eventTitle: "Sports Fest Opening Ceremony",
    timestamp: "2025-06-20T08:30:00Z", pointsEarned: 50,
    proofImage: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=500&auto=format&fit=crop&q=60",
    status: "APPROVED"
  }
];

const INITIAL_PAST_EVENTS: PastEvent[] = [
  { id: 'EVT-P01', title: 'Brigada Eskwela 2025', date: 'June 10, 2025', venue: 'WVSU-LC Campus', organizer: 'Supreme Student Council (SSC)', total_attendance: 320, colleges_participated: ['BSINFO TECH', 'BSED', 'BSHM'] },
  { id: 'EVT-P02', title: 'Sports Fest Opening Ceremony', date: 'June 20, 2025', venue: 'WVSU-LC Gymnasium', organizer: 'Office of Student Affairs (OSA)', total_attendance: 510, colleges_participated: ['BSINFO TECH', 'BSED', 'BSIT', 'BSHM'] },
];

const INITIAL_UPCOMING_EVENTS: UpcomingEvent[] = [
  { id: 'EVT-001', title: 'WVSU-LC Foundation Day 2025', date: 'July 18, 2025', time: '8:00 AM - 5:00 PM', venue: 'WVSU-LC Quadrangle', organizer: 'Office of Student Affairs (OSA)', open_to: 'All Students', description: 'Annual celebration of the campus founding with cultural shows, sports events, and recognition ceremonies.' },
  { id: 'EVT-002', title: 'Multi-Sectoral Career Fair 2025', date: 'October 12, 2025', time: '9:00 AM - 3:00 PM', venue: 'WVSU-LC Multi-Purpose Hall', organizer: 'Office of Student Affairs (OSA)', open_to: 'BSINFO TECH, BSED, BSIT, BSHM', description: 'Placement services and local company booths and initial job interviews for fourth-year level students.' }
];

const INITIAL_EVALUATIONS: Evaluation[] = [
  { id: "SUB-P01-01", student_id: "2021-0001", college: "BSINFO TECH", event_id: "EVT-P01", q1: 5, q2: 4, q3: 5, q4: "N/A", q5: 4, q6: "YES", q7: "I loved the sense of community and team effort across different courses.", q8: "We ran out of garbage bags and paint brushes.", q9: "Loved the music.", timestamp: "2025-06-10T14:30:00Z" },
  { id: "SUB-P01-02", student_id: "2022-0045", college: "BSED", event_id: "EVT-P01", q1: 4, q2: 5, q3: 4, q4: 4, q5: 3, q6: "YES", q7: "Felt very fulfilling to prepare classrooms.", q8: "The snacks and water were distributed unevenly.", q9: "The student council did a good job.", timestamp: "2025-06-10T15:10:00Z" },
];

// ─────────────────────────────────────────────────────────────────────────────
// FLAT-FILE FALLBACK HELPERS
// ─────────────────────────────────────────────────────────────────────────────
const loadData = <T>(filePath: string, fallback: T): T => {
  try {
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf-8')) as T;
    }
  } catch (err) {
    console.warn(`[Fallback] Error reading ${filePath}:`, err);
  }
  saveData(filePath, fallback);
  return fallback;
};

const saveData = <T>(filePath: string, data: T): void => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error(`[Fallback] Error writing ${filePath}:`, err);
  }
};

// Check if Supabase is configured
const hasSupabase = !!process.env.SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY;
console.log(`[DB] Supabase persistence: ${hasSupabase ? 'ENABLED ✅' : 'DISABLED — using flat-file fallback ⚠️'}`);

// Seed Supabase with initial data on first startup
async function seedSupabaseIfEmpty(): Promise<void> {
  if (!hasSupabase) return;
  try {
    // Seed students
    const { data: existingStudents } = await supabase.from('students').select('id').limit(1);
    if (!existingStudents || existingStudents.length === 0) {
      const seedStudents = INITIAL_STUDENTS.map(s => ({
        id: s.id, name: s.name, college: s.college, program: s.program,
        year: s.year, points: s.points ?? 0, redeemed_rewards: s.redeemedRewards ?? []
      }));
      await supabase.from('students').upsert(seedStudents);
      console.log('[Seed] Seeded students table.');
    }

    // Seed past events
    const { data: existingPastEvents } = await supabase.from('past_events').select('id').limit(1);
    if (!existingPastEvents || existingPastEvents.length === 0) {
      for (const e of INITIAL_PAST_EVENTS) {
        await supabase.from('past_events').upsert({ id: e.id, title: e.title, date: e.date, venue: e.venue, organizer: e.organizer, total_attendance: e.total_attendance });
        for (const col of e.colleges_participated) {
          await supabase.from('past_events_colleges').upsert({ event_id: e.id, college_code: col });
        }
      }
      console.log('[Seed] Seeded past_events table.');
    }

    // Seed upcoming events
    const { data: existingUpcoming } = await supabase.from('upcoming_events').select('id').limit(1);
    if (!existingUpcoming || existingUpcoming.length === 0) {
      await supabase.from('upcoming_events').upsert(
        INITIAL_UPCOMING_EVENTS.map(e => ({ id: e.id, title: e.title, date: e.date, time: e.time, venue: e.venue, organizer: e.organizer, open_to: e.open_to, description: e.description }))
      );
      console.log('[Seed] Seeded upcoming_events table.');
    }

    // Seed evaluations
    const { data: existingEvals } = await supabase.from('evaluations').select('id').limit(1);
    if (!existingEvals || existingEvals.length === 0) {
      await supabase.from('evaluations').upsert(
        INITIAL_EVALUATIONS.map(ev => ({
          id: ev.id, student_id: ev.student_id, college: ev.college, event_id: ev.event_id,
          q1: ev.q1, q2: ev.q2, q3: ev.q3, q4: String(ev.q4 ?? 'N/A'), q5: ev.q5,
          q6: ev.q6, q7: ev.q7, q8: ev.q8, q9: ev.q9 || 'SKIP', timestamp: ev.timestamp
        }))
      );
      console.log('[Seed] Seeded evaluations table.');
    }

    // Seed attendance
    const { data: existingAtt } = await supabase.from('attendance_records').select('id').limit(1);
    if (!existingAtt || existingAtt.length === 0) {
      await supabase.from('attendance_records').upsert(
        INITIAL_ATTENDANCE.map(r => ({
          id: r.id, student_id: r.studentId, student_name: r.studentName,
          college: r.college, year: r.year, event_id: r.eventId, event_title: r.eventTitle,
          timestamp: r.timestamp, points_earned: r.pointsEarned, proof_image: r.proofImage || '', status: r.status
        }))
      );
      console.log('[Seed] Seeded attendance_records table.');
    }
  } catch (err) {
    console.warn('[Seed] Seeding failed (non-fatal):', err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// INITIALIZE GEMINI CLIENT
// ─────────────────────────────────────────────────────────────────────────────
let aiClient: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  aiClient = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
  });
}

interface AIConfig { provider: 'gemini' | 'gemma_local'; localUrl: string; localModel: string; }
let AI_CONFIG: AIConfig = {
  provider: process.env.GEMINI_API_KEY ? 'gemini' : 'gemma_local',
  localUrl: process.env.LOCAL_GEMMA_URL || 'http://localhost:1234/v1',
  localModel: process.env.LOCAL_GEMMA_MODEL || 'gemma'
};

// ─────────────────────────────────────────────────────────────────────────────
// REST ENDPOINTS
// ─────────────────────────────────────────────────────────────────────────────

// AI CONFIG
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

// ADMIN LOGIN
app.post("/api/admin/login", (req, res) => {
  const { username, password } = req.body;
  const account = ADMIN_ACCOUNTS.find(a => a.username === username && a.password === password);
  if (!account) {
    res.status(401).json({ success: false, error: "Invalid credentials" });
    return;
  }
  res.json({ success: true, admin: { username: account.username, name: account.name, agency: account.agency } });
});

// 1. COLLEGES
app.get("/api/colleges", (req, res) => {
  res.json({ success: true, colleges: COLLEGES });
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. STUDENTS
// ─────────────────────────────────────────────────────────────────────────────
app.get("/api/students", async (req, res) => {
  if (hasSupabase) {
    try {
      const { data, error } = await supabase.from('students').select('*').order('name');
      if (error) throw error;
      // Map DB columns → app shape
      const students: Student[] = (data || []).map((r: any) => ({
        id: r.id, name: r.name, college: r.college, program: r.program,
        year: r.year, points: r.points ?? 0, redeemedRewards: r.redeemed_rewards ?? []
      }));
      res.json({ success: true, students });
      return;
    } catch (err: any) {
      console.error('[DB] GET students failed, falling back:', err.message);
    }
  }
  // Flat-file fallback
  const students = loadData<Student[]>(DB_STUDENTS_PATH, INITIAL_STUDENTS);
  res.json({ success: true, students });
});

app.post("/api/students/registry", async (req, res) => {
  try {
    const { id, name, college, program, year } = req.body;
    if (!id || !name || !college) {
      res.status(400).json({ success: false, error: "Missing required student ID, Name, or College" });
      return;
    }

    if (hasSupabase) {
      // Preserve existing points & rewards
      const { data: existing } = await supabase.from('students').select('points, redeemed_rewards').eq('id', id).single();
      const existingPoints = existing?.points ?? 0;
      const existingRewards = existing?.redeemed_rewards ?? [];

      const { data, error } = await supabase.from('students').upsert({
        id, name, college, program: program || 'N/A', year: Number(year) || 1,
        points: existingPoints, redeemed_rewards: existingRewards
      }).select().single();
      if (error) throw error;

      const student: Student = { id: data.id, name: data.name, college: data.college, program: data.program, year: data.year, points: data.points, redeemedRewards: data.redeemed_rewards };
      // Refresh all students for response
      const { data: allData } = await supabase.from('students').select('*').order('name');
      const students: Student[] = (allData || []).map((r: any) => ({ id: r.id, name: r.name, college: r.college, program: r.program, year: r.year, points: r.points ?? 0, redeemedRewards: r.redeemed_rewards ?? [] }));
      res.json({ success: true, student, students });
      return;
    }

    // Flat-file fallback
    let STUDENTS_DB = loadData<Student[]>(DB_STUDENTS_PATH, INITIAL_STUDENTS);
    const index = STUDENTS_DB.findIndex(s => s.id === id);
    const existingPoints = index >= 0 ? (STUDENTS_DB[index].points ?? 0) : 0;
    const existingRewards = index >= 0 ? (STUDENTS_DB[index].redeemedRewards ?? []) : [];
    const updatedStudent: Student = { id, name, college, program: program || 'N/A', year: Number(year) || 1, points: existingPoints, redeemedRewards: existingRewards };
    if (index >= 0) { STUDENTS_DB[index] = updatedStudent; } else { STUDENTS_DB.push(updatedStudent); }
    saveData(DB_STUDENTS_PATH, STUDENTS_DB);
    res.json({ success: true, student: updatedStudent, students: STUDENTS_DB });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
});

app.delete("/api/students/registry/:id", async (req, res) => {
  try {
    const cleanId = decodeURIComponent(req.params.id).trim();

    if (hasSupabase) {
      const { data: existing, error: fetchErr } = await supabase.from('students').select('*').eq('id', cleanId).single();
      if (fetchErr || !existing) {
        res.status(404).json({ success: false, error: "Student not found" });
        return;
      }
      const { error } = await supabase.from('students').delete().eq('id', cleanId);
      if (error) throw error;
      res.json({ success: true, student: existing });
      return;
    }

    let STUDENTS_DB = loadData<Student[]>(DB_STUDENTS_PATH, INITIAL_STUDENTS);
    const index = STUDENTS_DB.findIndex(s => s.id.toLowerCase() === cleanId.toLowerCase());
    if (index === -1) { res.status(404).json({ success: false, error: "Student not found" }); return; }
    const deleted = STUDENTS_DB.splice(index, 1)[0];
    saveData(DB_STUDENTS_PATH, STUDENTS_DB);
    res.json({ success: true, student: deleted });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 2.1 ATTENDANCE
// ─────────────────────────────────────────────────────────────────────────────
app.get("/api/attendance", async (req, res) => {
  if (hasSupabase) {
    try {
      const { data, error } = await supabase.from('attendance_records').select('*').order('timestamp', { ascending: false });
      if (error) throw error;
      const attendance: AttendanceRecord[] = (data || []).map((r: any) => ({
        id: r.id, studentId: r.student_id, studentName: r.student_name,
        college: r.college, year: r.year, eventId: r.event_id, eventTitle: r.event_title,
        timestamp: r.timestamp, pointsEarned: r.points_earned, proofImage: r.proof_image, status: r.status
      }));
      res.json({ success: true, attendance });
      return;
    } catch (err: any) {
      console.error('[DB] GET attendance failed, falling back:', err.message);
    }
  }
  res.json({ success: true, attendance: loadData<AttendanceRecord[]>(DB_ATTENDANCE_PATH, INITIAL_ATTENDANCE) });
});

app.post("/api/attendance", async (req, res) => {
  try {
    const studentId   = req.body.studentId || req.body.student_id;
    const studentName = req.body.studentName || req.body.student_name;
    const college     = req.body.college || req.body.college_dept;
    const year        = req.body.year;
    const eventId     = req.body.eventId || req.body.event_id;
    const eventTitle  = req.body.eventTitle || req.body.event_title || 'WVSU Event';
    const proofImage  = req.body.proofImage || req.body.proof_image || '';

    if (!studentId || !studentName || !eventId) {
      res.status(400).json({ success: false, error: "Missing required Student ID, Name, or Event ID" });
      return;
    }

    const POINTS_PER_ATTENDANCE = 50;
    const newRecordId = `ATT-${Date.now().toString().slice(-4)}-${Math.floor(Math.random() * 1000)}`;

    if (hasSupabase) {
      // Duplicate check
      const { data: dup } = await supabase.from('attendance_records')
        .select('id').eq('student_id', studentId).eq('event_id', eventId).single();
      if (dup) {
        res.status(400).json({ success: false, error: "You have already logged attendance for this event!" });
        return;
      }

      // Resolve college from DB
      const { data: studentRow } = await supabase.from('students').select('college, points').eq('id', studentId).single();
      const resolvedCollege = studentRow?.college || college || 'BSINFO TECH';
      const currentPoints   = studentRow?.points ?? 0;

      // Upsert student (create if new)
      await supabase.from('students').upsert({
        id: studentId, name: studentName, college: resolvedCollege,
        program: req.body.student?.program || `${resolvedCollege} Program`,
        year: Number(year) || 1, points: currentPoints + POINTS_PER_ATTENDANCE,
        redeemed_rewards: []
      }, { onConflict: 'id' });

      // Update points if student already existed
      if (studentRow) {
        await supabase.from('students').update({ points: currentPoints + POINTS_PER_ATTENDANCE, name: studentName }).eq('id', studentId);
      }

      // Insert attendance record
      const { error: attErr } = await supabase.from('attendance_records').insert({
        id: newRecordId, student_id: studentId, student_name: studentName,
        college: resolvedCollege, year: Number(year) || 1,
        event_id: eventId, event_title: eventTitle,
        timestamp: new Date().toISOString(),
        points_earned: POINTS_PER_ATTENDANCE, proof_image: proofImage, status: 'APPROVED'
      });
      if (attErr) throw attErr;

      // Fetch updated student for response
      const { data: updatedStudent } = await supabase.from('students').select('*').eq('id', studentId).single();
      const student: Student = updatedStudent
        ? { id: updatedStudent.id, name: updatedStudent.name, college: updatedStudent.college, program: updatedStudent.program, year: updatedStudent.year, points: updatedStudent.points, redeemedRewards: updatedStudent.redeemed_rewards }
        : { id: studentId, name: studentName, college: resolvedCollege, program: 'N/A', year: Number(year) || 1, points: POINTS_PER_ATTENDANCE, redeemedRewards: [] };

      const record: AttendanceRecord = { id: newRecordId, studentId, studentName, college: resolvedCollege, year: Number(year) || 1, eventId, eventTitle, timestamp: new Date().toISOString(), pointsEarned: POINTS_PER_ATTENDANCE, proofImage, status: 'APPROVED' };
      res.json({ success: true, record, points: student.points, student });
      return;
    }

    // Flat-file fallback
    let STUDENTS_DB = loadData<Student[]>(DB_STUDENTS_PATH, INITIAL_STUDENTS);
    let ATTENDANCE_RECORDS = loadData<AttendanceRecord[]>(DB_ATTENDANCE_PATH, INITIAL_ATTENDANCE);
    const duplicate = ATTENDANCE_RECORDS.find(r => r.studentId.toLowerCase() === studentId.toLowerCase() && r.eventId === eventId);
    if (duplicate) { res.status(400).json({ success: false, error: "Already logged attendance for this event!" }); return; }
    let student = STUDENTS_DB.find(s => s.id.toLowerCase() === studentId.toLowerCase());
    const resolvedCollege = student?.college || college || 'BSINFO TECH';
    if (!student) {
      student = { id: studentId, name: studentName, college: resolvedCollege, program: `${resolvedCollege} Program`, year: Number(year) || 1, points: 0, redeemedRewards: [] };
      STUDENTS_DB.push(student);
    } else { student.name = studentName; student.year = Number(year) || student.year; }
    student.points = (student.points || 0) + POINTS_PER_ATTENDANCE;
    const newRecord: AttendanceRecord = { id: newRecordId, studentId, studentName, college: resolvedCollege, year: Number(year) || 1, eventId, eventTitle, timestamp: new Date().toISOString(), pointsEarned: POINTS_PER_ATTENDANCE, proofImage, status: 'APPROVED' };
    ATTENDANCE_RECORDS.push(newRecord);
    saveData(DB_STUDENTS_PATH, STUDENTS_DB);
    saveData(DB_ATTENDANCE_PATH, ATTENDANCE_RECORDS);
    res.json({ success: true, record: newRecord, points: student.points, student });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete("/api/attendance/:id", async (req, res) => {
  try {
    const cleanId = decodeURIComponent(req.params.id).trim().toLowerCase();

    if (hasSupabase) {
      const { data: record, error: fetchErr } = await supabase.from('attendance_records').select('*').ilike('id', cleanId).single();
      if (fetchErr || !record) { res.status(404).json({ success: false, error: "Record not found" }); return; }

      // Revert points
      const { data: student } = await supabase.from('students').select('points').eq('id', record.student_id).single();
      if (student) {
        await supabase.from('students').update({ points: Math.max(0, (student.points || 0) - record.points_earned) }).eq('id', record.student_id);
      }

      const { error } = await supabase.from('attendance_records').delete().ilike('id', cleanId);
      if (error) throw error;
      const { data: remaining } = await supabase.from('attendance_records').select('*').order('timestamp', { ascending: false });
      const attendance: AttendanceRecord[] = (remaining || []).map((r: any) => ({ id: r.id, studentId: r.student_id, studentName: r.student_name, college: r.college, year: r.year, eventId: r.event_id, eventTitle: r.event_title, timestamp: r.timestamp, pointsEarned: r.points_earned, proofImage: r.proof_image, status: r.status }));
      res.json({ success: true, attendance });
      return;
    }

    let STUDENTS_DB = loadData<Student[]>(DB_STUDENTS_PATH, INITIAL_STUDENTS);
    let ATTENDANCE_RECORDS = loadData<AttendanceRecord[]>(DB_ATTENDANCE_PATH, INITIAL_ATTENDANCE);
    const record = ATTENDANCE_RECORDS.find(r => r.id.toLowerCase() === cleanId);
    if (!record) { res.status(404).json({ success: false, error: "Record not found" }); return; }
    const student = STUDENTS_DB.find(s => s.id.toLowerCase() === record.studentId.toLowerCase());
    if (student && student.points !== undefined) { student.points = Math.max(0, student.points - record.pointsEarned); }
    ATTENDANCE_RECORDS = ATTENDANCE_RECORDS.filter(r => r.id.toLowerCase() !== cleanId);
    saveData(DB_STUDENTS_PATH, STUDENTS_DB);
    saveData(DB_ATTENDANCE_PATH, ATTENDANCE_RECORDS);
    res.json({ success: true, attendance: ATTENDANCE_RECORDS });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 2.2 REWARD REDEMPTION
// ─────────────────────────────────────────────────────────────────────────────
app.post("/api/students/redeem", async (req, res) => {
  try {
    const studentId  = req.body.studentId || req.body.student_id;
    const rewardId   = req.body.rewardId  || req.body.reward_id;
    const pointsCost = req.body.pointsCost !== undefined ? req.body.pointsCost : req.body.points_cost;
    const rewardTitle= req.body.rewardTitle || req.body.reward_title;
    const college    = req.body.college || req.body.student_college || req.body.college_dept;

    if (!studentId || !rewardId || pointsCost === undefined) {
      res.status(400).json({ success: false, error: "Missing student ID, Reward ID, or points cost" });
      return;
    }

    if (hasSupabase) {
      const { data: student, error: fetchErr } = await supabase.from('students').select('*').eq('id', studentId).single();
      if (fetchErr || !student) { res.status(404).json({ success: false, error: "Student not found in campus registry." }); return; }

      const resolvedCollege = student.college || college;
      if (!resolvedCollege || !['BSINFO TECH', 'BSED', 'BSIT', 'BSHM', 'BS CRIM'].includes(resolvedCollege)) {
        res.status(400).json({ success: false, error: "Redemption Rejected: Student must belong to a valid college department." }); return;
      }
      if (rewardId === 'REW-2' && !['BSINFO TECH', 'BSED', 'BSIT'].includes(resolvedCollege)) {
        res.status(400).json({ success: false, error: `College Pride Stickers Pack restricted to BSINFO TECH, BSED, and BSIT. Your department (${resolvedCollege}) is not eligible.` }); return;
      }
      if (rewardId === 'REW-3' && !['BSINFO TECH', 'BSIT'].includes(resolvedCollege)) {
        res.status(400).json({ success: false, error: `Developer Cap restricted to tech majors (BSINFO TECH, BSIT). Your department (${resolvedCollege}) is not eligible.` }); return;
      }

      const currentPoints = student.points || 0;
      if (currentPoints < pointsCost) {
        res.status(400).json({ success: false, error: `Insufficient points! Need ${pointsCost}, have ${currentPoints}.` }); return;
      }

      const updatedRewards = [...(student.redeemed_rewards || []), `${rewardTitle} (${new Date().toLocaleDateString()})`];
      const { data: updated, error: updateErr } = await supabase.from('students')
        .update({ points: currentPoints - pointsCost, redeemed_rewards: updatedRewards })
        .eq('id', studentId).select().single();
      if (updateErr) throw updateErr;

      const updatedStudent: Student = { id: updated.id, name: updated.name, college: updated.college, program: updated.program, year: updated.year, points: updated.points, redeemedRewards: updated.redeemed_rewards };
      res.json({ success: true, student: updatedStudent });
      return;
    }

    let STUDENTS_DB = loadData<Student[]>(DB_STUDENTS_PATH, INITIAL_STUDENTS);
    const student = STUDENTS_DB.find(s => s.id === studentId);
    if (!student) { res.status(404).json({ success: false, error: "Student not found." }); return; }
    const resolvedCollege = student.college || college;
    if (!resolvedCollege || !['BSINFO TECH', 'BSED', 'BSIT', 'BSHM', 'BS CRIM'].includes(resolvedCollege)) { res.status(400).json({ success: false, error: "Invalid college." }); return; }
    if (rewardId === 'REW-2' && !['BSINFO TECH', 'BSED', 'BSIT'].includes(resolvedCollege)) { res.status(400).json({ success: false, error: `Stickers Pack not eligible for ${resolvedCollege}.` }); return; }
    if (rewardId === 'REW-3' && !['BSINFO TECH', 'BSIT'].includes(resolvedCollege)) { res.status(400).json({ success: false, error: `Developer Cap not eligible for ${resolvedCollege}.` }); return; }
    if ((student.points || 0) < pointsCost) { res.status(400).json({ success: false, error: `Insufficient points!` }); return; }
    student.points = (student.points || 0) - pointsCost;
    if (!student.redeemedRewards) student.redeemedRewards = [];
    student.redeemedRewards.push(`${rewardTitle} (${new Date().toLocaleDateString()})`);
    saveData(DB_STUDENTS_PATH, STUDENTS_DB);
    res.json({ success: true, student });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. UPCOMING EVENTS
// ─────────────────────────────────────────────────────────────────────────────
app.get("/api/upcoming-events", async (req, res) => {
  if (hasSupabase) {
    try {
      const { data, error } = await supabase.from('upcoming_events').select('*').order('created_at');
      if (error) throw error;
      const upcomingEvents: UpcomingEvent[] = (data || []).map((r: any) => ({ id: r.id, title: r.title, date: r.date, time: r.time, venue: r.venue, organizer: r.organizer, open_to: r.open_to, description: r.description }));
      res.json({ success: true, upcomingEvents });
      return;
    } catch (err: any) {
      console.error('[DB] GET upcoming-events failed, falling back:', err.message);
    }
  }
  res.json({ success: true, upcomingEvents: loadData<UpcomingEvent[]>(DB_UPCOMING_EVENTS_PATH, INITIAL_UPCOMING_EVENTS) });
});

app.post("/api/upcoming-events", async (req, res) => {
  try {
    const { title, date, time, venue, organizer, open_to, description } = req.body;
    if (!title || !date || !venue || !organizer) {
      res.status(400).json({ success: false, error: "Missing required fields for upcoming event." }); return;
    }
    const newId = `EVT-${Date.now().toString().slice(-4)}`;
    const newEvent: UpcomingEvent = { id: newId, title, date, time: time || 'All-Day', venue, organizer, open_to: open_to || 'All Students', description: description || '' };

    if (hasSupabase) {
      const { error } = await supabase.from('upcoming_events').insert({ id: newId, title, date, time: time || 'All-Day', venue, organizer, open_to: open_to || 'All Students', description: description || '' });
      if (error) throw error;
      const { data } = await supabase.from('upcoming_events').select('*').order('created_at');
      const upcomingEvents: UpcomingEvent[] = (data || []).map((r: any) => ({ id: r.id, title: r.title, date: r.date, time: r.time, venue: r.venue, organizer: r.organizer, open_to: r.open_to, description: r.description }));
      res.json({ success: true, event: newEvent, upcomingEvents });
      return;
    }
    let UPCOMING_EVENTS = loadData<UpcomingEvent[]>(DB_UPCOMING_EVENTS_PATH, INITIAL_UPCOMING_EVENTS);
    UPCOMING_EVENTS.push(newEvent);
    saveData(DB_UPCOMING_EVENTS_PATH, UPCOMING_EVENTS);
    res.json({ success: true, event: newEvent, upcomingEvents: UPCOMING_EVENTS });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
});

app.delete("/api/upcoming-events/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (hasSupabase) {
      const { error } = await supabase.from('upcoming_events').delete().eq('id', id);
      if (error) throw error;
      const { data } = await supabase.from('upcoming_events').select('*').order('created_at');
      const upcomingEvents: UpcomingEvent[] = (data || []).map((r: any) => ({ id: r.id, title: r.title, date: r.date, time: r.time, venue: r.venue, organizer: r.organizer, open_to: r.open_to, description: r.description }));
      res.json({ success: true, upcomingEvents });
      return;
    }
    let UPCOMING_EVENTS = loadData<UpcomingEvent[]>(DB_UPCOMING_EVENTS_PATH, INITIAL_UPCOMING_EVENTS);
    UPCOMING_EVENTS = UPCOMING_EVENTS.filter(e => e.id !== id);
    saveData(DB_UPCOMING_EVENTS_PATH, UPCOMING_EVENTS);
    res.json({ success: true, upcomingEvents: UPCOMING_EVENTS });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. PAST EVENTS
// ─────────────────────────────────────────────────────────────────────────────
app.get("/api/past-events", async (req, res) => {
  if (hasSupabase) {
    try {
      const { data: events, error } = await supabase.from('past_events').select('*, past_events_colleges(college_code)').order('created_at');
      if (error) throw error;
      const pastEvents: PastEvent[] = (events || []).map((e: any) => ({
        id: e.id, title: e.title, date: e.date, venue: e.venue, organizer: e.organizer,
        total_attendance: e.total_attendance,
        colleges_participated: (e.past_events_colleges || []).map((c: any) => c.college_code)
      }));
      res.json({ success: true, pastEvents });
      return;
    } catch (err: any) {
      console.error('[DB] GET past-events failed, falling back:', err.message);
    }
  }
  res.json({ success: true, pastEvents: loadData<PastEvent[]>(DB_PAST_EVENTS_PATH, INITIAL_PAST_EVENTS) });
});

app.post("/api/past-events", async (req, res) => {
  try {
    const { title, date, venue, organizer, total_attendance, colleges_participated } = req.body;
    if (!title || !date || !venue || !organizer) {
      res.status(400).json({ success: false, error: "Missing required fields for past event." }); return;
    }
    const newId = `EVT-P${Date.now().toString().slice(-4)}`;
    const newEvent: PastEvent = { id: newId, title, date, venue, organizer, total_attendance: Number(total_attendance) || 100, colleges_participated: colleges_participated || ['BSINFO TECH', 'BSED', 'BSIT', 'BSHM', 'BS CRIM'] };

    if (hasSupabase) {
      const { error } = await supabase.from('past_events').insert({ id: newId, title, date, venue, organizer, total_attendance: Number(total_attendance) || 100 });
      if (error) throw error;
      for (const col of newEvent.colleges_participated) {
        await supabase.from('past_events_colleges').insert({ event_id: newId, college_code: col });
      }
      const { data: events } = await supabase.from('past_events').select('*, past_events_colleges(college_code)').order('created_at');
      const pastEvents: PastEvent[] = (events || []).map((e: any) => ({ id: e.id, title: e.title, date: e.date, venue: e.venue, organizer: e.organizer, total_attendance: e.total_attendance, colleges_participated: (e.past_events_colleges || []).map((c: any) => c.college_code) }));
      res.json({ success: true, event: newEvent, pastEvents });
      return;
    }
    let PAST_EVENTS = loadData<PastEvent[]>(DB_PAST_EVENTS_PATH, INITIAL_PAST_EVENTS);
    PAST_EVENTS.push(newEvent);
    saveData(DB_PAST_EVENTS_PATH, PAST_EVENTS);
    res.json({ success: true, event: newEvent, pastEvents: PAST_EVENTS });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
});

app.delete("/api/past-events/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (hasSupabase) {
      // Junction rows cascade-delete automatically via FK
      const { error } = await supabase.from('past_events').delete().eq('id', id);
      if (error) throw error;
      const { data: events } = await supabase.from('past_events').select('*, past_events_colleges(college_code)').order('created_at');
      const pastEvents: PastEvent[] = (events || []).map((e: any) => ({ id: e.id, title: e.title, date: e.date, venue: e.venue, organizer: e.organizer, total_attendance: e.total_attendance, colleges_participated: (e.past_events_colleges || []).map((c: any) => c.college_code) }));
      res.json({ success: true, pastEvents });
      return;
    }
    let PAST_EVENTS = loadData<PastEvent[]>(DB_PAST_EVENTS_PATH, INITIAL_PAST_EVENTS);
    PAST_EVENTS = PAST_EVENTS.filter(e => e.id !== id);
    saveData(DB_PAST_EVENTS_PATH, PAST_EVENTS);
    res.json({ success: true, pastEvents: PAST_EVENTS });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. EVALUATIONS
// ─────────────────────────────────────────────────────────────────────────────
app.get("/api/past-evaluations", async (req, res) => {
  if (hasSupabase) {
    try {
      const { data, error } = await supabase.from('evaluations').select('*').order('timestamp', { ascending: false });
      if (error) throw error;
      const evaluations: Evaluation[] = (data || []).map((r: any) => ({
        id: r.id, student_id: r.student_id, college: r.college, event_id: r.event_id,
        q1: r.q1, q2: r.q2, q3: r.q3, q4: isNaN(Number(r.q4)) ? r.q4 : Number(r.q4),
        q5: r.q5, q6: r.q6, q7: r.q7, q8: r.q8, q9: r.q9, timestamp: r.timestamp
      }));
      res.json({ success: true, evaluations });
      return;
    } catch (err: any) {
      console.error('[DB] GET evaluations failed, falling back:', err.message);
    }
  }
  res.json({ success: true, evaluations: loadData<Evaluation[]>(DB_EVALUATIONS_PATH, INITIAL_EVALUATIONS) });
});

app.post("/api/submit-evaluation", async (req, res) => {
  try {
    const { student_id, college, event_id, q1, q2, q3, q4, q5, q6, q7, q8, q9 } = req.body;
    if (!student_id || !college || !event_id) {
      res.status(400).json({ success: false, error: "Missing required Student ID, College, or Event ID" }); return;
    }

    const newEval: Evaluation = {
      id: `SUB-${event_id.replace('EVT-', '')}-${Date.now().toString().slice(-6)}`,
      student_id, college, event_id,
      q1: Number(q1), q2: Number(q2), q3: Number(q3),
      q4: q4 === 'N/A' ? 'N/A' : Number(q4),
      q5: Number(q5), q6: q6 as any,
      q7: (q7 || '').slice(0, 200), q8: (q8 || '').slice(0, 200),
      q9: q9 ? q9.slice(0, 200) : 'SKIP',
      timestamp: new Date().toISOString()
    };

    if (hasSupabase) {
      // Upsert student (create if new, award +15 pts)
      const { data: existingStudent } = await supabase.from('students').select('points, redeemed_rewards').eq('id', student_id).single();
      const currentPoints = existingStudent?.points ?? 0;
      await supabase.from('students').upsert({
        id: student_id, name: 'Campus Walk-in Student', college, program: `${college} Program`,
        year: 1, points: currentPoints + 15, redeemed_rewards: existingStudent?.redeemed_rewards ?? []
      }, { onConflict: 'id' });
      if (existingStudent) {
        await supabase.from('students').update({ points: currentPoints + 15 }).eq('id', student_id);
      }

      // Insert evaluation
      const { error: evalErr } = await supabase.from('evaluations').insert({
        id: newEval.id, student_id, college, event_id,
        q1: newEval.q1, q2: newEval.q2, q3: newEval.q3, q4: String(newEval.q4), q5: newEval.q5,
        q6: newEval.q6, q7: newEval.q7, q8: newEval.q8, q9: newEval.q9, timestamp: newEval.timestamp
      });
      if (evalErr) throw evalErr;

      const { count: collegeCount } = await supabase.from('evaluations').select('*', { count: 'exact' }).eq('event_id', event_id).eq('college', college);
      const { count: campusTotal } = await supabase.from('evaluations').select('*', { count: 'exact' }).eq('event_id', event_id);
      const { data: updatedStudentData } = await supabase.from('students').select('*').eq('id', student_id).single();
      const updatedStudent: Student = updatedStudentData ? { id: updatedStudentData.id, name: updatedStudentData.name, college: updatedStudentData.college, program: updatedStudentData.program, year: updatedStudentData.year, points: updatedStudentData.points, redeemedRewards: updatedStudentData.redeemed_rewards } : { id: student_id, name: 'Walk-in', college, program: college, year: 1, points: currentPoints + 15, redeemedRewards: [] };

      res.json({ success: true, evaluation: newEval, collegeCount: collegeCount || 1, campusTotal: campusTotal || 1, student: updatedStudent });
      return;
    }

    // Flat-file fallback
    let STUDENTS_DB = loadData<Student[]>(DB_STUDENTS_PATH, INITIAL_STUDENTS);
    let EVALUATIONS = loadData<Evaluation[]>(DB_EVALUATIONS_PATH, INITIAL_EVALUATIONS);
    let student = STUDENTS_DB.find(s => s.id.toLowerCase() === student_id.toLowerCase());
    if (!student) {
      student = { id: student_id, name: 'Campus Walk-in Student', college, program: `${college} Program`, year: 1, points: 0, redeemedRewards: [] };
      STUDENTS_DB.push(student);
    }
    student.points = (student.points || 0) + 15;
    saveData(DB_STUDENTS_PATH, STUDENTS_DB);
    EVALUATIONS.push(newEval);
    saveData(DB_EVALUATIONS_PATH, EVALUATIONS);
    const collegeCount = EVALUATIONS.filter(e => e.event_id === event_id && e.college === college).length;
    const campusTotal = EVALUATIONS.filter(e => e.event_id === event_id).length;
    res.json({ success: true, evaluation: newEval, collegeCount, campusTotal, student });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// REPORT GENERATION (AI-powered — unchanged logic, now reads from Supabase)
// ─────────────────────────────────────────────────────────────────────────────
app.post("/api/generate-report", async (req, res) => {
  try {
    const { eventId } = req.body;
    if (!eventId) { res.status(400).json({ success: false, error: "Missing eventId" }); return; }

    // Load data from Supabase or flat-file
    let PAST_EVENTS = loadData<PastEvent[]>(DB_PAST_EVENTS_PATH, INITIAL_PAST_EVENTS);
    let EVALUATIONS = loadData<Evaluation[]>(DB_EVALUATIONS_PATH, INITIAL_EVALUATIONS);

    if (hasSupabase) {
      const { data: eventsData } = await supabase.from('past_events').select('*, past_events_colleges(college_code)');
      if (eventsData) {
        PAST_EVENTS = eventsData.map((e: any) => ({ id: e.id, title: e.title, date: e.date, venue: e.venue, organizer: e.organizer, total_attendance: e.total_attendance, colleges_participated: (e.past_events_colleges || []).map((c: any) => c.college_code) }));
      }
      const { data: evalsData } = await supabase.from('evaluations').select('*');
      if (evalsData) {
        EVALUATIONS = evalsData.map((r: any) => ({ id: r.id, student_id: r.student_id, college: r.college, event_id: r.event_id, q1: r.q1, q2: r.q2, q3: r.q3, q4: isNaN(Number(r.q4)) ? r.q4 : Number(r.q4), q5: r.q5, q6: r.q6, q7: r.q7, q8: r.q8, q9: r.q9, timestamp: r.timestamp }));
      }
    }

    const event = PAST_EVENTS.find(e => e.id === eventId);
    if (!event) { res.status(404).json({ success: false, error: `Past Event ${eventId} not found` }); return; }

    const eventSubmissions = EVALUATIONS.filter(e => e.event_id === eventId);
    if (eventSubmissions.length === 0) {
      res.json({ success: false, error: "No responses recorded yet for this event." }); return;
    }

    const totalSubmissions = eventSubmissions.length;
    const collegeBreakdown = COLLEGES.map(col => {
      const colSubmissions = eventSubmissions.filter(s => s.college === col.code).length;
      return { collegeCode: col.code, collegeName: col.name, submissionsCount: colSubmissions, participationRate: Number(((colSubmissions / col.enrolled) * 100).toFixed(2)) };
    });
    collegeBreakdown.sort((a, b) => b.participationRate - a.participationRate);
    const lowestCollege = collegeBreakdown[collegeBreakdown.length - 1];

    let q1Sum = 0, q2Sum = 0, q3Sum = 0, q4Sum = 0, q4Count = 0, q5Sum = 0;
    let yesCount = 0, maybeCount = 0, noCount = 0;
    eventSubmissions.forEach(sub => {
      q1Sum += sub.q1; q2Sum += sub.q2; q3Sum += sub.q3; q5Sum += sub.q5;
      if (typeof sub.q4 === 'number' && !isNaN(sub.q4)) { q4Sum += sub.q4; q4Count++; }
      if (sub.q6 === 'YES') yesCount++; else if (sub.q6 === 'MAYBE') maybeCount++; else if (sub.q6 === 'NO') noCount++;
    });
    const q1Mean = Number((q1Sum / totalSubmissions).toFixed(2));
    const q2Mean = Number((q2Sum / totalSubmissions).toFixed(2));
    const q3Mean = Number((q3Sum / totalSubmissions).toFixed(2));
    const q4Mean = q4Count > 0 ? Number((q4Sum / q4Count).toFixed(2)) : "N/A";
    const q5Mean = Number((q5Sum / totalSubmissions).toFixed(2));
    let scoresSum = q1Mean + q2Mean + q3Mean + q5Mean;
    let overallDenominator = 4;
    if (typeof q4Mean === 'number') { scoresSum += q4Mean; overallDenominator = 5; }
    const overallScore = Number((scoresSum / overallDenominator).toFixed(2));
    const yesPercent   = Number(((yesCount   / totalSubmissions) * 100).toFixed(2));
    const maybePercent = Number(((maybeCount  / totalSubmissions) * 100).toFixed(2));
    const noPercent    = Number(((noCount     / totalSubmissions) * 100).toFixed(2));

    const fallback = getFallbackAnalysis(eventId, EVALUATIONS);
    let report: EvaluationReport;

    const textPayloadForAI = eventSubmissions.map(sub => ({ id: sub.id, college: sub.college, ratings: { q1: sub.q1, q2: sub.q2, q3: sub.q3, q4: sub.q4, q5: sub.q5 }, q6: sub.q6, q7_what_they_liked: sub.q7, q8_improvements: sub.q8, q9_comments: sub.q9 }));
    const prompt = `You are the AI engine for the WVSU-LC Student Activity Kiosk. Perform qualitative semantic, sentiment, and safety reviews for campus student evaluations of the event "${event.title}". Total submissions: ${totalSubmissions}.\n\nStudent evaluations:\n${JSON.stringify(textPayloadForAI, null, 2)}\n\nCOLLEGE ENROLLED COUNTS: BSINFO TECH: 350, BSED: 400, BSIT: 300, BSHM: 250, BS CRIM: 200\n\nReturn a JSON matching this exact structure:\n{"positiveThemes":["...","...","..."],"improvementAreas":["...","...","..."],"flaggedResponses":[{"submissionId":"...","college":"...","excerpt":"...","reason":"..."}],"recommendations":[{"id":"REC-1","title":"...","body":"..."},{"id":"REC-2","title":"...","body":"..."},{"id":"REC-3","title":"...","body":"..."},{"id":"REC-4","title":"...","body":"..."},{"id":"REC-5","title":"...","body":"..."}],"strategicInsights":"..."}`;

    const extractJson = (text: string): any => {
      try { return JSON.parse(text.trim()); } catch {
        const s = text.indexOf('{'); const e = text.lastIndexOf('}');
        if (s !== -1 && e !== -1 && e > s) return JSON.parse(text.substring(s, e + 1));
        throw new Error('No valid JSON found');
      }
    };

    let gData: any = null;

    if (AI_CONFIG.provider === 'gemma_local') {
      try {
        const response = await fetch(`${AI_CONFIG.localUrl}/chat/completions`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ model: AI_CONFIG.localModel, messages: [{ role: 'system', content: 'Return only valid raw JSON matching the requested schema. No markdown.' }, { role: 'user', content: prompt }], temperature: 0.1 }) });
        if (!response.ok) throw new Error(`LM Studio returned ${response.status}`);
        const resData = await response.json();
        gData = extractJson(resData.choices[0].message.content);
      } catch (err) { console.warn('[AI] Local gemma failed:', err); }
    } else if (AI_CONFIG.provider === 'gemini' && aiClient) {
      try {
        const response = await aiClient.models.generateContent({
          model: "gemini-2.0-flash", contents: prompt,
          config: { responseMimeType: "application/json", responseSchema: { type: Type.OBJECT, properties: { positiveThemes: { type: Type.ARRAY, items: { type: Type.STRING } }, improvementAreas: { type: Type.ARRAY, items: { type: Type.STRING } }, flaggedResponses: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { submissionId: { type: Type.STRING }, college: { type: Type.STRING }, excerpt: { type: Type.STRING }, reason: { type: Type.STRING } }, required: ["submissionId","college","excerpt","reason"] } }, recommendations: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { id: { type: Type.STRING }, title: { type: Type.STRING }, body: { type: Type.STRING } }, required: ["id","title","body"] } }, strategicInsights: { type: Type.STRING } }, required: ["positiveThemes","improvementAreas","flaggedResponses","recommendations","strategicInsights"] } }
        });
        gData = JSON.parse(response.text.trim());
      } catch (geminiError) { console.warn('[AI] Gemini failed:', geminiError); }
    }

    if (gData) {
      try {
        report = { eventId: event.id, eventTitle: event.title, eventDate: event.date, generatedAt: new Date().toLocaleString("en-US", { timeZone: "Asia/Manila" }) + " (PST)", sectionA: { totalSubmissions, collegeBreakdown, lowestCollegeCode: lowestCollege.collegeCode, lowestCollegeName: lowestCollege.collegeName }, sectionB: { q1Mean, q2Mean, q3Mean, q4Mean, q5Mean, overallScore }, sectionC: { positiveThemes: (gData.positiveThemes || []).slice(0, 3), improvementAreas: (gData.improvementAreas || []).slice(0, 3), futureIntentPercent: { yes: yesPercent, maybe: maybePercent, no: noPercent }, flaggedCount: (gData.flaggedResponses || []).length }, sectionD: (gData.recommendations || []).map((rec: any, idx: number) => ({ id: `REC-${idx + 1}`, title: rec.title, body: rec.body })), sectionE: gData.strategicInsights || "No strategic insights.", appendix: (gData.flaggedResponses || []).map((flg: any) => ({ submissionId: flg.submissionId, college: flg.college, excerpt: flg.excerpt, reason: flg.reason })) };
      } catch { report = assembleFallbackReport(event, totalSubmissions, collegeBreakdown, lowestCollege, q1Mean, q2Mean, q3Mean, q4Mean, q5Mean, overallScore, yesPercent, maybePercent, noPercent, fallback); }
    } else {
      report = assembleFallbackReport(event, totalSubmissions, collegeBreakdown, lowestCollege, q1Mean, q2Mean, q3Mean, q4Mean, q5Mean, overallScore, yesPercent, maybePercent, noPercent, fallback);
    }

    res.json({ success: true, report });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// FALLBACK HELPERS (unchanged)
// ─────────────────────────────────────────────────────────────────────────────
const getFallbackAnalysis = (eventId: string, responses: Evaluation[]) => {
  const eventResponses = responses.filter(r => r.event_id === eventId);
  if (eventId === 'EVT-P01') {
    return {
      positiveThemes: ["Incredible cooperation and deep multi-disciplinary teamwork from BSINFO TECH & BSED participants.", "Profound personal satisfaction from painting, arranging, and optimizing classrooms.", "Lively acoustic setup and high student involvement during general campus cleaning loops."],
      improvementAreas: ["Unacceptable deficiency of primary tools (brushes, trash bags) in BSHM/BSIT zones.", "Unbalanced and unfair refreshment and water distribution centers.", "Excessive heat exhaustion caused by starting the outdoor workflow late in the morning."],
      flagged: eventResponses.filter(r => r.q8.toLowerCase().includes("unsafe") || r.q8.toLowerCase().includes("injury") || r.q8.toLowerCase().includes("first aid")).map(r => ({ submissionId: r.id, college: r.college, excerpt: r.q8, reason: "Critical safety risk report." })),
      recommendations: [{ id: "REC-1", title: "Establish Zoned First Aid Hubs", body: "Form dedicated safety teams with fully stocked medical boxes in each college building." }, { id: "REC-2", title: "Reschedule to Cool Hours", body: "Start at 6:30 AM and cease outdoor labor by 10:30 AM to protect against heat." }, { id: "REC-3", title: "Formulate Core Inventory Logs", body: "Ensure equal distribution of paint kits to each department via pre-registries." }, { id: "REC-4", title: "Implement Digital Meal Coupons", body: "Adopt QR vouchers mapped to student IDs for equitable snack/drink allocation." }, { id: "REC-5", title: "Empower Technology Marshals", body: "Enlist BSINFO TECH developers to create live SMS notification channels for real-time task coordination." }],
      strategicInsights: "Brigada Eskwela 2025 showcased excellent student energy (with BSINFO TECH recording the highest participation), yet suffered from a dangerous tool deficit and severe midday heat exhaustion. The complete absence of standard medical boxes represents a critical institutional vulnerability. The SSC must mandate rigid pre-event safety clearances."
    };
  } else {
    return {
      positiveThemes: ["Outstanding delegate march coordination and inspirational ignition of the sports flame.", "Stellar dance performances and colorful department banner layouts.", "High school pride and excellent live video feeds to campus hallways."],
      improvementAreas: ["Distressing sound system echoing making speeches unintelligible.", "Excessive crowding and very poor ventilation in gymnasium seating sections.", "Delay of over 1.5 hours in starting columns causing dehydration."],
      flagged: eventResponses.filter(r => r.q8.toLowerCase().includes("offensive") || r.q8.toLowerCase().includes("harass") || r.q8.toLowerCase().includes("discrimination")).map(r => ({ submissionId: r.id, college: r.college, excerpt: r.q8, reason: "Student conduct concern during delegates' entrance." })),
      recommendations: [{ id: "REC-1", title: "Tune Gym Sound Dampeners", body: "Mount acoustic delay boards or position speakers closer to delegate lines." }, { id: "REC-2", title: "Install Exhaust Systems", body: "Deploy industrial blowers in the gymnasium and provide alternative viewing areas with live webcasts." }, { id: "REC-3", title: "Establish Safety Patrol Staffs", body: "Deploy marshals near student sections to reinforce inclusive speech and safe conduct." }, { id: "REC-4", title: "Rigid Timers for Speeches", body: "Impose a 5-minute cap on secondary officials' talks to maintain parade momentum." }, { id: "REC-5", title: "Disperse Cooling Stations", body: "Provide water and electrolyte stations adjacent to all major college blocks." }],
      strategicInsights: "The Opening Ceremony was highly successful in delegate pageantry but was bottlenecked by severe acoustical problems and high gym indoor heat. Conduct guidelines must be strictly policed. The highest priority is to integrate industrial exhaust setups and enforce speech duration limits before next season's events."
    };
  }
};

function assembleFallbackReport(event: PastEvent, totalSubmissions: number, collegeBreakdown: any, lowestCollege: any, q1Mean: number, q2Mean: number, q3Mean: number, q4Mean: any, q5Mean: number, overallScore: number, yesPercent: number, maybePercent: number, noPercent: number, fallback: any): EvaluationReport {
  return { eventId: event.id, eventTitle: event.title, eventDate: event.date, generatedAt: new Date().toLocaleString("en-US", { timeZone: "Asia/Manila" }) + " (PST)", sectionA: { totalSubmissions, collegeBreakdown, lowestCollegeCode: lowestCollege.collegeCode, lowestCollegeName: lowestCollege.collegeName }, sectionB: { q1Mean, q2Mean, q3Mean, q4Mean, q5Mean, overallScore }, sectionC: { positiveThemes: fallback.positiveThemes, improvementAreas: fallback.improvementAreas, futureIntentPercent: { yes: yesPercent, maybe: maybePercent, no: noPercent }, flaggedCount: fallback.flagged.length }, sectionD: fallback.recommendations, sectionE: fallback.strategicInsights, appendix: fallback.flagged };
}

// ─────────────────────────────────────────────────────────────────────────────
// VITE / STATIC SERVE
// ─────────────────────────────────────────────────────────────────────────────
async function startServer() {
  await seedSupabaseIfEmpty();

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: "spa" });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => { res.sendFile(path.join(distPath, 'index.html')); });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`WVSU-LC Kiosk Backend serving on http://0.0.0.0:${PORT}`);
  });
}

startServer();

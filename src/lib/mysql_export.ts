import { Student, UpcomingEvent, PastEvent, Evaluation } from "../types";

export const ADMIN_ACCOUNTS = [
  { username: 'admin', password: 'admin123', name: 'System Admin (OSAS)', agency: 'ALL', color: 'bg-slate-900 border-slate-900 text-yellow-400' },
  { username: 'osa', password: 'osa123', name: 'Office of Student Affairs (OSA)', agency: 'OSA', color: 'bg-blue-900 border-blue-900 text-white' },
  { username: 'ssc', password: 'ssc123', name: 'Supreme Student Council (SSC)', agency: 'SSC', color: 'bg-amber-600 border-amber-900 text-black' },
  { username: 'dept-infotech', password: 'it123', name: 'Department Council (BSINFO TECH)', agency: 'BSINFO TECH', color: 'bg-cyan-700 border-cyan-900 text-white' },
  { username: 'dept-bsed', password: 'ed123', name: 'Department Council (BSED)', agency: 'BSED', color: 'bg-emerald-700 border-emerald-900 text-white' },
  { username: 'dept-bsit', password: 'it123', name: 'Department Council (BSIT)', agency: 'BSIT', color: 'bg-teal-700 border-teal-900 text-white' },
  { username: 'dept-bshm', password: 'hm123', name: 'Department Council (BSHM)', agency: 'BSHM', color: 'bg-pink-700 border-pink-900 text-white' },
  { username: 'dept-bscrim', password: 'crim123', name: 'Department Council (BS CRIM)', agency: 'BS CRIM', color: 'bg-red-700 border-red-900 text-white' },
];

export const MYSQL_SCHEMA_DDL = `-- =========================================================================
-- WVSU-LC STUDENT KIOSK DATABASE SCHEMA (MySQL / phpMyAdmin Compatibility)
-- =========================================================================

-- Create Colleges definition
CREATE TABLE IF NOT EXISTS \`colleges\` (
  \`code\` VARCHAR(20) PRIMARY KEY,
  \`name\` VARCHAR(100) NOT NULL,
  \`enrolled\` INT DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create Students directory
CREATE TABLE IF NOT EXISTS \`students\` (
  \`id\` VARCHAR(20) PRIMARY KEY,
  \`name\` VARCHAR(100) NOT NULL,
  \`college\` VARCHAR(20) NOT NULL,
  \`program\` VARCHAR(100) DEFAULT NULL,
  \`year\` INT DEFAULT 1,
  FOREIGN KEY (\`college\`) REFERENCES \`colleges\` (\`code\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create Upcoming Announcements/Events registry 
CREATE TABLE IF NOT EXISTS \`upcoming_events\` (
  \`id\` VARCHAR(20) PRIMARY KEY,
  \`title\` VARCHAR(200) NOT NULL,
  \`date\` VARCHAR(100) NOT NULL,
  \`time\` VARCHAR(100) DEFAULT 'All-Day',
  \`venue\` VARCHAR(200) NOT NULL,
  \`organizer\` VARCHAR(100) NOT NULL,
  \`open_to\` VARCHAR(200) DEFAULT 'All Students',
  \`description\` TEXT DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create Past Events directory
CREATE TABLE IF NOT EXISTS \`past_events\` (
  \`id\` VARCHAR(20) PRIMARY KEY,
  \`title\` VARCHAR(200) NOT NULL,
  \`date\` VARCHAR(100) NOT NULL,
  \`venue\` VARCHAR(200) NOT NULL,
  \`organizer\` VARCHAR(100) NOT NULL,
  \`total_attendance\` INT DEFAULT 100
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create Joint Junction matching Colleges Participated
CREATE TABLE IF NOT EXISTS \`past_events_colleges\` (
  \`event_id\` VARCHAR(20) NOT NULL,
  \`college_code\` VARCHAR(20) NOT NULL,
  PRIMARY KEY (\`event_id\`, \`college_code\`),
  FOREIGN KEY (\`event_id\`) REFERENCES \`past_events\` (\`id\`) ON DELETE CASCADE,
  FOREIGN KEY (\`college_code\`) REFERENCES \`colleges\` (\`code\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create Evaluations Core Feedback 
CREATE TABLE IF NOT EXISTS \`evaluations\` (
  \`id\` VARCHAR(50) PRIMARY KEY,
  \`student_id\` VARCHAR(20) NOT NULL,
  \`college\` VARCHAR(20) NOT NULL,
  \`event_id\` VARCHAR(20) NOT NULL,
  \`q1\` INT NOT NULL, -- Overall satisfaction
  \`q2\` INT NOT NULL, -- Academic relevance
  \`q3\` INT NOT NULL, -- Organization & logistics
  \`q4\` VARCHAR(10) DEFAULT 'N/A', -- Speaker/performer (can be N/A)
  \`q5\` INT NOT NULL, -- Venue/facilities
  \`q6\` ENUM('YES', 'MAYBE', 'NO') NOT NULL, -- Attendance future intent
  \`q7\` VARCHAR(255) NOT NULL, -- Positive comments
  \`q8\` VARCHAR(255) NOT NULL, -- Critique comments
  \`q9\` VARCHAR(255) DEFAULT 'SKIP', -- Generic extra comments
  \`timestamp\` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (\`student_id\`) REFERENCES \`students\` (\`id\`) ON DELETE CASCADE,
  FOREIGN KEY (\`college\`) REFERENCES \`colleges\` (\`code\`) ON DELETE CASCADE,
  FOREIGN KEY (\`event_id\`) REFERENCES \`past_events\` (\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`;

export function generateLiveMySQLDump(
  students: Student[],
  upcomingEvents: UpcomingEvent[],
  pastEvents: PastEvent[],
  evaluations: Evaluation[],
  colleges: any[]
): string {
  let sql = `-- =========================================================================\n`;
  sql += `-- DYNAMIC LIVE MySQL INSERT DUMP GENERATED AT ${new Date().toISOString()}\n`;
  sql += `-- WVSU-LC Student Activity Kiosk Active Server Datastore\n`;
  sql += `-- =========================================================================\n\n`;

  // 1. Colleges
  sql += `-- 1. COLLEGES CORE LIST_RECORDS\n`;
  colleges.forEach(c => {
    const escapedName = c.name.replace(/'/g, "''");
    sql += `INSERT INTO \`colleges\` (\`code\`, \`name\`, \`enrolled\`) VALUES ('${c.code}', '${escapedName}', ${c.enrolled}) ON DUPLICATE KEY UPDATE \`name\` = VALUES(\`name\`), \`enrolled\` = VALUES(\`enrolled\`);\n`;
  });
  sql += `\n`;

  // 2. Students
  sql += `-- 2. STUDENTS RECORDS DB (${students.length} registers)\n`;
  students.forEach(s => {
    const escapedName = s.name.replace(/'/g, "''");
    const escapedProg = s.program.replace(/'/g, "''");
    sql += `INSERT INTO \`students\` (\`id\`, \`name\`, \`college\`, \`program\`, \`year\`) VALUES ('${s.id}', '${escapedName}', '${s.college}', '${escapedProg}', ${s.year}) ON DUPLICATE KEY UPDATE \`name\` = VALUES(\`name\`), \`program\` = VALUES(\`program\`);\n`;
  });
  sql += `\n`;

  // 3. Upcoming Events
  sql += `-- 3. UPCOMING EVENTS ANNOUNCEMENTS (${upcomingEvents.length} records)\n`;
  upcomingEvents.forEach(e => {
    const escapedTitle = e.title.replace(/'/g, "''");
    const escapedVenue = e.venue.replace(/'/g, "''");
    const escapedOrg = e.organizer.replace(/'/g, "''");
    const escapedTime = (e.time || 'All-Day').replace(/'/g, "''");
    const escapedOpen = (e.open_to || 'All Students').replace(/'/g, "''");
    const escapedDesc = (e.description || '').replace(/'/g, "''");
    sql += `INSERT INTO \`upcoming_events\` (\`id\`, \`title\`, \`date\`, \`time\`, \`venue\`, \`organizer\`, \`open_to\`, \`description\`) VALUES ('${e.id}', '${escapedTitle}', '${e.date}', '${escapedTime}', '${escapedVenue}', '${escapedOrg}', '${escapedOpen}', '${escapedDesc}') ON DUPLICATE KEY UPDATE \`title\` = VALUES(\`title\`), \`venue\` = VALUES(\`venue\`);\n`;
  });
  sql += `\n`;

  // 4. Past Events
  sql += `-- 4. PAST EVENTS & RELATIONAL BRIDGES (${pastEvents.length} records)\n`;
  pastEvents.forEach(e => {
    const escapedTitle = e.title.replace(/'/g, "''");
    const escapedVenue = e.venue.replace(/'/g, "''");
    const escapedOrg = e.organizer.replace(/'/g, "''");
    sql += `INSERT INTO \`past_events\` (\`id\`, \`title\`, \`date\`, \`venue\`, \`organizer\`, \`total_attendance\`) VALUES ('${e.id}', '${escapedTitle}', '${e.date}', '${escapedVenue}', '${escapedOrg}', ${e.total_attendance}) ON DUPLICATE KEY UPDATE \`title\` = VALUES(\`title\`), \`venue\` = VALUES(\`venue\`);\n`;
    
    // Colleges Participated Junction bridge
    e.colleges_participated.forEach(col => {
      sql += `INSERT IGNORE INTO \`past_events_colleges\` (\`event_id\`, \`college_code\`) VALUES ('${e.id}', '${col}');\n`;
    });
  });
  sql += `\n`;

  // 5. Evaluations
  sql += `-- 5. EVALUATIONS FEEDBACK RECORDS (${evaluations.length} total entries)\n`;
  evaluations.forEach(ev => {
    const escapedQ7 = ev.q7.replace(/'/g, "''");
    const escapedQ8 = ev.q8.replace(/'/g, "''");
    const escapedQ9 = (ev.q9 || 'SKIP').replace(/'/g, "''");
    const formattedTimestamp = ev.timestamp ? ev.timestamp.replace('T', ' ').slice(0, 19) : new Date().toISOString().replace('T', ' ').slice(0, 19);
    sql += `INSERT INTO \`evaluations\` (\`id\`, \`student_id\`, \`college\`, \`event_id\`, \`q1\`, \`q2\`, \`q3\`, \`q4\`, \`q5\`, \`q6\`, \`q7\`, \`q8\`, \`q9\`, \`timestamp\`) VALUES ('${ev.id}', '${ev.student_id}', '${ev.college}', '${ev.event_id}', ${ev.q1}, ${ev.q2}, ${ev.q3}, '${ev.q4}', ${ev.q5}, '${ev.q6}', '${escapedQ7}', '${escapedQ8}', '${escapedQ9}', '${formattedTimestamp}') ON DUPLICATE KEY UPDATE \`q1\` = VALUES(\`q1\`), \`q2\` = VALUES(\`q2\`), \`q3\` = VALUES(\`q3\`);\n`;
  });

  return sql;
}

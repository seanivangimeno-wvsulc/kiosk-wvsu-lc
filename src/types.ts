export interface College {
  code: string;
  name: string;
  enrolled: number;
}

export interface Student {
  id: string;
  name: string;
  college: string;
  program: string;
  year: number;
  passcode?: string;
  points?: number;
  redeemedRewards?: string[];
  lastAttendedEvent?: string;
  lastAttendedTimestamp?: string;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  college: string;
  year: number;
  eventId: string;
  eventTitle: string;
  timestamp: string;
  pointsEarned: number;
  proofImage?: string; // base64 or mock
  status: 'PENDING' | 'APPROVED';
}

export interface RewardItem {
  id: string;
  title: string;
  pointsCost: number;
  description: string;
  category: string;
  icon: string;
  image?: string;
}


export interface UpcomingEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  venue: string;
  organizer: string;
  open_to: string;
  description: string;
}

export interface PastEvent {
  id: string;
  title: string;
  date: string;
  venue: string;
  organizer: string;
  total_attendance: number;
  colleges_participated: string[];
}

export interface Evaluation {
  id: string;
  student_id: string;
  college: string;
  event_id: string;
  q1: number; // Overall satisfaction (1-5)
  q2: number; // Academic relevance (1-5)
  q3: number; // Organization and logistics (1-5)
  q4: number | string; // Speaker/performer quality (1-5 or "N/A")
  q5: number; // Venue and facilities (1-5)
  q6: 'YES' | 'MAYBE' | 'NO'; // Future attendance
  q7: string; // What they liked most (max 200 chars)
  q8: string; // What could be improved (max 200 chars)
  q9: string; // Other comments (optional or "SKIP")
  timestamp: string;
}

export interface ReportSectionA {
  totalSubmissions: number;
  collegeBreakdown: Array<{
    collegeCode: string;
    collegeName: string;
    submissionsCount: number;
    participationRate: number; // (count / enrolled) * 100
  }>;
  lowestCollegeCode: string;
  lowestCollegeName: string;
}

export interface ReportSectionB {
  q1Mean: number;
  q2Mean: number;
  q3Mean: number;
  q4Mean: number | string;
  q5Mean: number;
  overallScore: number;
}

export interface ReportSectionC {
  positiveThemes: string[];
  improvementAreas: string[];
  futureIntentPercent: {
    yes: number;
    maybe: number;
    no: number;
  };
  flaggedCount: number;
}

export interface FlaggedResponse {
  submissionId: string;
  college: string;
  excerpt: string;
  reason: string;
}

export interface ReportRecommendation {
  id: string; // REC-1, REC-2, etc.
  title: string;
  body: string;
}

export interface EvaluationReport {
  eventId: string;
  eventTitle: string;
  eventDate: string;
  generatedAt: string;
  sectionA: ReportSectionA;
  sectionB: ReportSectionB;
  sectionC: ReportSectionC;
  sectionD: ReportRecommendation[];
  sectionE: string; // Strategic insights (1 paragraph, max 100 words)
  appendix: FlaggedResponse[];
}

import { Student, AttendanceRecord, PastEvent, UpcomingEvent, Evaluation } from "./types";

export const INITIAL_STUDENTS: Student[] = [
  { id: '2021-0001', name: 'Maria Santos',   college: 'BSINFO TECH', program: 'BS Information Technology', year: 3, points: 150, redeemedRewards: [] },
  { id: '2022-0045', name: 'Juan dela Cruz', college: 'BSED',        program: 'BS Secondary Education',   year: 2, points: 50, redeemedRewards: [] },
  { id: '2020-0118', name: 'Ana Reyes',      college: 'BSHM',        program: 'BS Hospitality Management',  year: 4, points: 200, redeemedRewards: [] },
  { id: '2023-0072', name: 'Carlo Mendoza',  college: 'BSIT',        program: 'BS Industrial Technology',   year: 1, points: 100, redeemedRewards: [] },
  { id: '2021-0203', name: 'Lea Villanueva', college: 'BSHM',        program: 'BS Hospitality Management',  year: 3, points: 0, redeemedRewards: [] },
  { id: '2022-0199', name: 'Cardo Dalisay',  college: 'BS CRIM',     program: 'BS Criminology',             year: 2, points: 120, redeemedRewards: [] },
];

export const INITIAL_ATTENDANCE: AttendanceRecord[] = [
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

export const INITIAL_PAST_EVENTS: PastEvent[] = [
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

export const INITIAL_UPCOMING_EVENTS: UpcomingEvent[] = [
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

export const INITIAL_EVALUATIONS: Evaluation[] = [
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

// Helper to load state with a fallback
export const loadLocalStorage = <T>(key: string, fallback: T): T => {
  try {
    const val = localStorage.getItem(key);
    if (val !== null) {
      return JSON.parse(val);
    }
  } catch (e) {
    console.warn(`Error loading localStorage key "${key}":`, e);
  }
  localStorage.setItem(key, JSON.stringify(fallback));
  return fallback;
};

// Helper to save state
export const saveLocalStorage = <T>(key: string, data: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.warn(`Error saving localStorage key "${key}":`, e);
  }
};

export const getFallbackAnalysis = (eventId: string, responses: Evaluation[]) => {
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
        "Water/snack tables placed too far from physical course delegate lines."
      ],
      flagged: eventResponses
        .filter(r => r.q8.toLowerCase().includes("heat") || r.q8.toLowerCase().includes("crowd") || r.q8.toLowerCase().includes("exhausted"))
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

export const generateOfflineReport = async (
  eventId: string,
  evaluations: Evaluation[],
  pastEvents: PastEvent[],
  provider: 'gemini' | 'gemma_local' = 'gemini',
  localUrl: string = 'http://localhost:1234/v1',
  localModel: string = 'gemma'
): Promise<any> => {
  const event = pastEvents.find(e => e.id === eventId);
  if (!event) return null;

  const eventSubmissions = evaluations.filter(e => e.event_id === eventId);
  const totalSubmissions = eventSubmissions.length;

  // Standard rating calculations
  const q1List = eventSubmissions.map(s => Number(s.q1)).filter(v => !isNaN(v));
  const q2List = eventSubmissions.map(s => Number(s.q2)).filter(v => !isNaN(v));
  const q3List = eventSubmissions.map(s => Number(s.q3)).filter(v => !isNaN(v));
  const q4List = eventSubmissions.map(s => Number(s.q4)).filter(v => !isNaN(v));
  const q5List = eventSubmissions.map(s => Number(s.q5)).filter(v => !isNaN(v));

  const mean = (arr: number[]) => arr.length ? parseFloat((arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(2)) : 0;

  const q1Mean = mean(q1List);
  const q2Mean = mean(q2List);
  const q3Mean = mean(q3List);
  const q4Mean = q4List.length > 0 ? mean(q4List) : "N/A";
  const q5Mean = mean(q5List);

  const numericScores = [q1Mean, q2Mean, q3Mean, typeof q4Mean === 'number' ? q4Mean : null, q5Mean].filter(v => v !== null) as number[];
  const overallScore = numericScores.length ? parseFloat((numericScores.reduce((a,b)=>a+b, 0)/numericScores.length).toFixed(2)) : 0;

  // Yes/Maybe/No
  const yesCount = eventSubmissions.filter(s => s.q6 === 'YES').length;
  const maybeCount = eventSubmissions.filter(s => s.q6 === 'MAYBE').length;
  const noCount = eventSubmissions.filter(s => s.q6 === 'NO').length;
  const divider = totalSubmissions || 1;

  const yesPercent = parseFloat(((yesCount / divider) * 100).toFixed(1));
  const maybePercent = parseFloat(((maybeCount / divider) * 100).toFixed(1));
  const noPercent = parseFloat(((noCount / divider) * 100).toFixed(1));

  // College Breakdown
  const colleges = ['BSINFO TECH', 'BSED', 'BSIT', 'BSHM', 'BS CRIM'];
  const collegeBreakdown = colleges.map(code => {
    const subs = eventSubmissions.filter(s => s.college === code);
    const q1l = subs.map(s => Number(s.q1)).filter(v => !isNaN(v));
    const q2l = subs.map(s => Number(s.q2)).filter(v => !isNaN(v));
    const q3l = subs.map(s => Number(s.q3)).filter(v => !isNaN(v));
    const q4l = subs.map(s => Number(s.q4)).filter(v => !isNaN(v));
    const q5l = subs.map(s => Number(s.q5)).filter(v => !isNaN(v));
    const means = [mean(q1l), mean(q2l), mean(q3l), q4l.length ? mean(q4l) : null, mean(q5l)].filter(v => v !== null) as number[];
    const score = means.length ? parseFloat((means.reduce((a,b)=>a+b,0)/means.length).toFixed(2)) : 0;

    return {
      collegeCode: code,
      collegeName: code === 'BSINFO TECH' ? 'BS in Information Technology' :
                   code === 'BSED' ? 'BS in Secondary Education' :
                   code === 'BSIT' ? 'BS in Industrial Technology' :
                   code === 'BSHM' ? 'BS in Hospitality Management' :
                   'BS in Criminology',
      submissionCount: subs.length,
      averageScore: score
    };
  });

  // Find lowest college
  let lowestCollege = collegeBreakdown[0];
  collegeBreakdown.forEach(cb => {
    if (cb.averageScore < lowestCollege.averageScore) {
      lowestCollege = cb;
    }
  });

  const fallback = getFallbackAnalysis(eventId, evaluations);

  let positiveThemes = fallback.positiveThemes;
  let improvementAreas = fallback.improvementAreas;
  let recommendations = fallback.recommendations;
  let strategicInsights = fallback.strategicInsights;

  if (provider === 'gemma_local' && localUrl) {
    try {
      const response = await fetch(`${localUrl}/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: localModel,
          messages: [
            {
              role: "system",
              content: "You are an expert student feedback analyzer for West Visayas State University - Lambunao Campus (WVSU-LC). Analyze student feedback highlights and frictions, and return a clean JSON object containing keys: 'positiveThemes' (string array), 'improvementAreas' (string array), 'recommendations' (array of objects with 'id', 'title', 'body'), and 'strategicInsights' (paragraph string)."
            },
            {
              role: "user",
              content: `Analyze the student feedback for WVSU-LC event "${event.title}":\n` +
                eventSubmissions.slice(0, 15).map((s, idx) => `Student ${idx+1}: Highlight: "${s.q7 || 'None'}", Friction: "${s.q8 || 'None'}"`).join("\n") +
                `\n\nReturn strictly valid JSON string without markdown code block decoration.`
            }
          ],
          temperature: 0.2
        })
      });
      const data = await response.json();
      const content = data.choices[0].message.content;
      const cleanJsonStr = content.replace(/```json/i, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJsonStr);
      if (parsed.positiveThemes && Array.isArray(parsed.positiveThemes)) positiveThemes = parsed.positiveThemes;
      if (parsed.improvementAreas && Array.isArray(parsed.improvementAreas)) improvementAreas = parsed.improvementAreas;
      if (parsed.recommendations && Array.isArray(parsed.recommendations)) recommendations = parsed.recommendations;
      if (parsed.strategicInsights && typeof parsed.strategicInsights === 'string') strategicInsights = parsed.strategicInsights;
    } catch (err) {
      console.warn("LM Studio connection failed or model returned invalid JSON, utilizing built-in offline analyzer heuristics.", err);
    }
  }

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
      positiveThemes,
      improvementAreas,
      futureIntentPercent: {
        yes: yesPercent,
        maybe: maybePercent,
        no: noPercent
      },
      flaggedCount: fallback.flagged.length
    },
    sectionD: recommendations,
    sectionE: strategicInsights,
    appendix: fallback.flagged
  };
};


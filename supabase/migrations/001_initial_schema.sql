-- =========================================================================
-- WVSU-LC STUDENT ACTIVITY KIOSK — Supabase Postgres Schema
-- Project: mmtagzjadjpaimuviwnl
-- =========================================================================

-- 1. STUDENTS
CREATE TABLE IF NOT EXISTS public.students (
  id               TEXT PRIMARY KEY,
  name             TEXT NOT NULL,
  college          TEXT NOT NULL,
  program          TEXT DEFAULT 'N/A',
  year             INTEGER DEFAULT 1,
  points           INTEGER DEFAULT 0,
  redeemed_rewards TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

-- Allow service_role full access (used by Express server)
CREATE POLICY "service_role_all_students"
  ON public.students FOR ALL
  USING (true)
  WITH CHECK (true);

-- 2. UPCOMING EVENTS
CREATE TABLE IF NOT EXISTS public.upcoming_events (
  id          TEXT PRIMARY KEY,
  title       TEXT NOT NULL,
  date        TEXT NOT NULL,
  time        TEXT DEFAULT 'All-Day',
  venue       TEXT NOT NULL,
  organizer   TEXT NOT NULL,
  open_to     TEXT DEFAULT 'All Students',
  description TEXT DEFAULT '',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.upcoming_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_all_upcoming_events"
  ON public.upcoming_events FOR ALL
  USING (true)
  WITH CHECK (true);

-- 3. PAST EVENTS
CREATE TABLE IF NOT EXISTS public.past_events (
  id               TEXT PRIMARY KEY,
  title            TEXT NOT NULL,
  date             TEXT NOT NULL,
  venue            TEXT NOT NULL,
  organizer        TEXT NOT NULL,
  total_attendance INTEGER DEFAULT 0,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.past_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_all_past_events"
  ON public.past_events FOR ALL
  USING (true)
  WITH CHECK (true);

-- 4. PAST EVENTS / COLLEGES JUNCTION
CREATE TABLE IF NOT EXISTS public.past_events_colleges (
  event_id     TEXT NOT NULL REFERENCES public.past_events(id) ON DELETE CASCADE,
  college_code TEXT NOT NULL,
  PRIMARY KEY (event_id, college_code)
);

ALTER TABLE public.past_events_colleges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_all_past_events_colleges"
  ON public.past_events_colleges FOR ALL
  USING (true)
  WITH CHECK (true);

-- 5. EVALUATIONS
CREATE TABLE IF NOT EXISTS public.evaluations (
  id         TEXT PRIMARY KEY,
  student_id TEXT NOT NULL,
  college    TEXT NOT NULL,
  event_id   TEXT NOT NULL REFERENCES public.past_events(id) ON DELETE CASCADE,
  q1         INTEGER NOT NULL,
  q2         INTEGER NOT NULL,
  q3         INTEGER NOT NULL,
  q4         TEXT DEFAULT 'N/A',
  q5         INTEGER NOT NULL,
  q6         TEXT NOT NULL CHECK (q6 IN ('YES','MAYBE','NO')),
  q7         TEXT NOT NULL DEFAULT '',
  q8         TEXT NOT NULL DEFAULT '',
  q9         TEXT DEFAULT 'SKIP',
  timestamp  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.evaluations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_all_evaluations"
  ON public.evaluations FOR ALL
  USING (true)
  WITH CHECK (true);

-- 6. ATTENDANCE RECORDS
CREATE TABLE IF NOT EXISTS public.attendance_records (
  id            TEXT PRIMARY KEY,
  student_id    TEXT NOT NULL,
  student_name  TEXT NOT NULL,
  college       TEXT NOT NULL,
  year          INTEGER DEFAULT 1,
  event_id      TEXT NOT NULL,
  event_title   TEXT NOT NULL DEFAULT 'WVSU Event',
  timestamp     TIMESTAMPTZ DEFAULT NOW(),
  points_earned INTEGER DEFAULT 50,
  proof_image   TEXT DEFAULT '',
  status        TEXT DEFAULT 'APPROVED' CHECK (status IN ('PENDING','APPROVED'))
);

ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_all_attendance"
  ON public.attendance_records FOR ALL
  USING (true)
  WITH CHECK (true);

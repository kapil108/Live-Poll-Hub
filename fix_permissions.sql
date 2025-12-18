-- Fix Permissions and Schema for Polling App

-- 1. QUESTIONS TABLE
CREATE TABLE IF NOT EXISTS questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    poll_id UUID REFERENCES polls(id) ON DELETE CASCADE NOT NULL,
    question_text TEXT NOT NULL,
    options JSONB DEFAULT '[]'::jsonb,
    correct_option INTEGER,
    is_active BOOLEAN DEFAULT false,
    started_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can see questions (so students can see them)
CREATE POLICY "Public questions access" ON questions
    FOR SELECT USING (true);

-- Policy: Authenticated users (teachers) can insert questions
CREATE POLICY "Teachers can insert questions" ON questions
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Policy: Teachers can update questions (to start/stop them)
CREATE POLICY "Teachers can update questions" ON questions
    FOR UPDATE USING (auth.role() = 'authenticated');

-- 2. STUDENTS TABLE
CREATE TABLE IF NOT EXISTS students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    poll_id UUID REFERENCES polls(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    session_id TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE students ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can insert (join) as a student
CREATE POLICY "Public insert students" ON students
    FOR INSERT WITH CHECK (true);

-- Policy: Public read (needed to see if you are already joined or kicked)
CREATE POLICY "Public read students" ON students
    FOR SELECT USING (true);
    
-- Policy: Teachers update students (to kick them)
CREATE POLICY "Teachers can update students" ON students
    FOR UPDATE USING (auth.role() = 'authenticated');

-- 3. ANSWERS TABLE
CREATE TABLE IF NOT EXISTS answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID REFERENCES questions(id) ON DELETE CASCADE NOT NULL,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE NOT NULL,
    selected_option INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE answers ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can insert answers (students)
CREATE POLICY "Public insert answers" ON answers
    FOR INSERT WITH CHECK (true);

-- Policy: Public read answers (for results display)
CREATE POLICY "Public read answers" ON answers
    FOR SELECT USING (true);

-- 4. Enable Realtime for all tables
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime FOR TABLE polls, questions, students, answers, messages;
COMMIT;

-- ====================================================================
-- STUDYBUDDY MASTER SUPABASE DATABASE SCHEMA (PostgreSQL)
-- Powered by OpenClaw Architecture & Supabase Auth
-- CARA PAKAI: Hapus SELURUH teks di SQL Editor Supabase, lalu PASTE script ini & klik RUN
-- ====================================================================

-- 1. BERSIHKAN TABEL LAMA (Mencegah konflik duplikasi tabel/kolom)
DROP TABLE IF EXISTS review_schedule CASCADE;
DROP TABLE IF EXISTS quiz_attempts CASCADE;
DROP TABLE IF EXISTS quiz_bank CASCADE;
DROP TABLE IF EXISTS topics CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 2. TABEL: users (Mendukung Email Auth & Mode Tamu / Guest Access)
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    email TEXT,
    name TEXT DEFAULT 'Student',
    is_guest BOOLEAN DEFAULT FALSE,
    channel TEXT NOT NULL DEFAULT 'web',
    channel_user_id TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_channel_user UNIQUE(channel, channel_user_id)
);

-- 3. TABEL: topics (Penyimpanan Materi & Summary)
CREATE TABLE topics (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    raw_text TEXT NOT NULL,
    summary TEXT NOT NULL,
    key_points JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABEL: quiz_bank (Bank Soal Multiple Choice)
CREATE TABLE quiz_bank (
    id TEXT PRIMARY KEY,
    topic_id TEXT NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    options JSONB NOT NULL,
    correct_answer TEXT NOT NULL,
    explanation TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TABEL: quiz_attempts (Riwayat Jawaban & Skor User)
CREATE TABLE quiz_attempts (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    topic_id TEXT NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
    score INTEGER NOT NULL,
    total_questions INTEGER NOT NULL,
    correct_answers INTEGER NOT NULL,
    review_stage INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. TABEL: review_schedule (Jadwal Review Spaced Repetition 1d, 3d, 7d)
CREATE TABLE review_schedule (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    topic_id TEXT NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
    review_stage INTEGER DEFAULT 1,
    scheduled_at TIMESTAMPTZ NOT NULL,
    status TEXT DEFAULT 'pending',
    score INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- SUPABASE AUTH AUTOMATIC TRIGGER FUNCTION
-- Otomatis membuat profil di public.users saat user mendaftar via Email
-- ====================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, channel, channel_user_id, name, email, is_guest)
  VALUES (
    NEW.id::text,
    'web',
    NEW.id::text,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    FALSE
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = EXCLUDED.name,
    is_guest = FALSE;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger listener pada auth.users milik Supabase Auth
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Index Kecepatan Query
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_review_schedule_scheduled_at ON review_schedule(scheduled_at);
CREATE INDEX idx_review_schedule_status ON review_schedule(status);
CREATE INDEX idx_topics_user_id ON topics(user_id);
CREATE INDEX idx_quiz_bank_topic_id ON quiz_bank(topic_id);

-- Akses API Publik untuk Frontend & Agent
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE topics DISABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_bank DISABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts DISABLE ROW LEVEL SECURITY;
ALTER TABLE review_schedule DISABLE ROW LEVEL SECURITY;

-- ====================================================================
-- CONTOH DATA SEED INITIAL (Mode Tamu & Email Member)
-- ====================================================================

-- Demo User
INSERT INTO users (id, channel, channel_user_id, name, is_guest)
VALUES ('user_demo_01', 'web', 'student_01', 'Budi (Tamu)', TRUE)
ON CONFLICT (channel, channel_user_id) DO NOTHING;

-- Demo Topic
INSERT INTO topics (id, user_id, title, raw_text, summary, key_points)
VALUES (
    'database-management-1',
    'user_demo_01',
    'Database Management',
    'Database Management System (DBMS) adalah perangkat lunak pengelola basis data...',
    '📌 **Ringkasan Materi: Database Management**\n\n• DBMS mengelola, menyimpan, dan memanipulasi basis data.\n• Fungsi mencakup DDL, DML, DCL, dan kontrol transaksi.\n• Sifat ACID menjamin integritas transaksi.',
    '["Prinsip Atomicity memastikan transaksi dilakukan secara utuh.", "Primary Key dan Foreign Key menghubungkan tabel relasi.", "Normalisasi mencegah timbulnya anomali data."]'::jsonb
)
ON CONFLICT (id) DO NOTHING;

-- Demo Review Schedule
INSERT INTO review_schedule (id, user_id, topic_id, review_stage, scheduled_at, status, score)
VALUES (
    'sched_demo_01',
    'user_demo_01',
    'database-management-1',
    1,
    NOW(),
    'pending',
    80
)
ON CONFLICT (id) DO NOTHING;

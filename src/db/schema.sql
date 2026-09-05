-- Database Schema for StudyBuddy (OpenClaw Architecture)

CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    channel TEXT NOT NULL,         -- 'telegram' | 'whatsapp' | 'mock'
    channel_user_id TEXT NOT NULL, -- Telegram chat_id or WhatsApp phone number
    name TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(channel, channel_user_id)
);

CREATE TABLE IF NOT EXISTS topics (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    raw_text TEXT NOT NULL,
    summary TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS quiz_bank (
    id TEXT PRIMARY KEY,
    topic_id TEXT NOT NULL,
    question TEXT NOT NULL,
    options TEXT NOT NULL,         -- Stored as JSON string array: ["A. ...", "B. ...", "C. ...", "D. ..."]
    correct_answer TEXT NOT NULL,  -- e.g. "A"
    explanation TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(topic_id) REFERENCES topics(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS quiz_attempts (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    topic_id TEXT NOT NULL,
    score INTEGER NOT NULL,        -- 0 - 100
    total_questions INTEGER NOT NULL,
    correct_answers INTEGER NOT NULL,
    review_stage INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY(topic_id) REFERENCES topics(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS review_schedule (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    topic_id TEXT NOT NULL,
    review_stage INTEGER DEFAULT 1, -- 1, 2, or 3 (1d, 3d, 7d)
    scheduled_at DATETIME NOT NULL,
    status TEXT DEFAULT 'pending',     -- 'pending' | 'due' | 'active_quiz' | 'completed'
    score INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY(topic_id) REFERENCES topics(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_review_schedule_scheduled_at ON review_schedule(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_review_schedule_user_id ON review_schedule(user_id);
CREATE INDEX IF NOT EXISTS idx_topics_user_id ON topics(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_bank_topic_id ON quiz_bank(topic_id);

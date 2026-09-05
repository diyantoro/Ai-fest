import express from 'express';
import cors from 'cors';
import 'dotenv/config';

import { initDb, dbQuery } from './db/client.js';
import { seedDemoData, parseKeyPoints, reclaimWebTopics } from './db/seed.js';
import { isSupabaseConfigured, supabase } from './db/supabase_client.js';
import { defaultAIProvider } from './services/ai_provider.js';
import { MockChannelAdapter } from './channels/MockChannelAdapter.js';
import { TutorAgent } from './agents/tutor_agent.js';
import { getTopicById } from './db/repositories/topic_repo.js';
import { findOrCreateUser } from './db/repositories/user_repo.js';
import { getQuizzesByTopic } from './db/repositories/quiz_repo.js';
import { getDueReviews } from './db/repositories/schedule_repo.js';
import { logger } from './utils/logger.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

const mockAdapter = new MockChannelAdapter('api_channel');
const tutorAgent = new TutorAgent(defaultAIProvider, mockAdapter);

// Initialize Database (SQLite fallback or Supabase)
await initDb();

// Resolve the single web/demo user used by the REST API (idempotent).
const webUser = await findOrCreateUser('web', 'user_demo_01', 'Budi (Tamu)');
const DEFAULT_USER_ID = webUser.id;
// The channel_user_id key (NOT the DB row id) must be passed to agent methods so
// findOrCreateUser resolves back to the same user instead of creating a new one.
const WEB_CHANNEL_USER_ID = webUser.channel_user_id || 'user_demo_01';

// Seed demo learning materials under the resolved user if missing
const seeded = await seedDemoData(DEFAULT_USER_ID);

// Re-adopt any materials previously stored under duplicate web users so they
// become visible again on the dashboard (fix for the "material tidak tersimpan" bug).
await reclaimWebTopics(DEFAULT_USER_ID);

function scheduleLabel(stage) {
  return stage === 1 ? 'Tomorrow' : stage === 2 ? '3 Days' : '7 Days';
}

// API 1: Get All Topics
app.get('/api/topics', async (req, res) => {
  try {
    if (isSupabaseConfigured && supabase) {
      const { data: topics, error } = await supabase
        .from('topics')
        .select(`
          *,
          review_schedule (
            review_stage,
            scheduled_at,
            status,
            score
          )
        `)
        .order('created_at', { ascending: false });

      if (!error && topics) {
        const formatted = topics.map(t => {
          const sched = t.review_schedule?.[0] || {};
          const isDue = sched.scheduled_at ? new Date(sched.scheduled_at) <= new Date() : false;
          return {
            id: t.id,
            title: t.title,
            summary: t.summary,
            keyPoints: parseKeyPoints(t.key_points),
            created_at: t.created_at,
            review_stage: sched.review_stage || 1,
            scheduled_at: isDue ? 'Today' : scheduleLabel(sched.review_stage || 1),
            due_status: isDue ? 'due' : 'upcoming',
            status: sched.status || 'pending',
            last_score: sched.score || 0
          };
        });
        return res.json(formatted);
      }
    }

    // Fallback: SQLite query (with review schedule joined)
    const dbTopics = await dbQuery.all(
      `SELECT t.*, s.review_stage, s.scheduled_at, s.status, s.score
       FROM topics t
       LEFT JOIN review_schedule s ON s.topic_id = t.id
       WHERE t.user_id = ?
       ORDER BY t.created_at DESC`,
      [DEFAULT_USER_ID]
    );
    return res.json(dbTopics.map(t => {
      const isDue = t.scheduled_at ? new Date(t.scheduled_at) <= new Date() : false;
      return {
        id: t.id,
        title: t.title,
        summary: t.summary,
        keyPoints: parseKeyPoints(t.key_points),
        created_at: t.created_at,
        review_stage: t.review_stage || 1,
        scheduled_at: isDue ? 'Today' : scheduleLabel(t.review_stage || 1),
        due_status: isDue ? 'due' : 'upcoming',
        status: t.status || 'pending',
        last_score: t.score || 0
      };
    }));
  } catch (err) {
    logger.error('API /api/topics error', err);
    res.status(500).json({ error: err.message });
  }
});

// API 2: Get Topic By ID (with Quizzes)
app.get('/api/topics/:id', async (req, res) => {
  try {
    const topicId = req.params.id;

    if (isSupabaseConfigured && supabase) {
      const { data: topic } = await supabase.from('topics').select('*').eq('id', topicId).single();
      const { data: quizzes } = await supabase.from('quiz_bank').select('*').eq('topic_id', topicId);
      const { data: schedule } = await supabase.from('review_schedule').select('*').eq('topic_id', topicId).single();

      if (topic) {
        return res.json({
          ...topic,
          keyPoints: parseKeyPoints(topic.key_points),
          quizzes: quizzes || [],
          review_stage: schedule?.review_stage || 1,
          scheduled_at: schedule?.scheduled_at ? new Date(schedule.scheduled_at).toLocaleDateString('id-ID') : 'Besok'
        });
      }
    }

    const topic = await getTopicById(topicId);
    if (!topic) {
      return res.status(404).json({ error: `Topic "${topicId}" not found.` });
    }
    const quizzes = await getQuizzesByTopic(topicId);
    const schedule = await dbQuery.get('SELECT * FROM review_schedule WHERE topic_id = ?', [topicId]);
    res.json({
      ...topic,
      keyPoints: parseKeyPoints(topic.key_points),
      quizzes,
      review_stage: schedule?.review_stage || 1,
      scheduled_at: schedule?.scheduled_at ? new Date(schedule.scheduled_at).toISOString() : new Date().toISOString()
    });
  } catch (err) {
    logger.error(`API /api/topics/${req.params.id} error`, err);
    res.status(500).json({ error: err.message });
  }
});

// API 3: Ingest New Material (Upload PDF/Text)
app.post('/api/ingest', async (req, res) => {
  try {
    const { title, content, type = 'text' } = req.body;
    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required.' });
    }

    // Decode base64 PDF payload from the frontend into a Buffer for server-side parsing.
    let bodyContent = content;
    let ingestType = type;
    if (type === 'pdf' && typeof content === 'string') {
      const base64 = content.replace(/^data:[^;]+;base64,/, '');
      bodyContent = Buffer.from(base64, 'base64');
      if (bodyContent.length === 0) {
        return res.status(400).json({ error: 'PDF content is empty or invalid.' });
      }
      ingestType = 'pdf';
    }

    const result = await tutorAgent.handleUploadMaterial('web', WEB_CHANNEL_USER_ID, title, bodyContent, ingestType);

    // Sync to Supabase if configured
    if (isSupabaseConfigured && supabase) {
      const rawForDb = typeof bodyContent === 'string' ? bodyContent : result.summary;
      await supabase.from('topics').insert({
        id: result.topicId,
        user_id: DEFAULT_USER_ID,
        title: title,
        raw_text: rawForDb,
        summary: result.summary,
        key_points: JSON.stringify(['Prinsip dasar terdeteksi.', 'Konsep utama tersusun.', 'Siap diuji via quiz.'])
      });

      await supabase.from('review_schedule').insert({
        id: `sched_${Date.now()}`,
        user_id: DEFAULT_USER_ID,
        topic_id: result.topicId,
        review_stage: 1,
        scheduled_at: new Date(Date.now() + 86400000).toISOString(),
        status: 'pending'
      });
    }

    res.json({
      success: true,
      topicId: result.topicId,
      title: title,
      summary: result.summary,
      quizCount: result.quizCount,
      scheduled_at: 'Besok'
    });
  } catch (err) {
    logger.error('API /api/ingest error', err);
    res.status(500).json({ error: err.message });
  }
});

// API 4: Submit Quiz Answers
app.post('/api/quiz/submit', async (req, res) => {
  try {
    const { topicId, answers } = req.body;
    if (!topicId || !answers || typeof answers !== 'object') {
      return res.status(400).json({ error: 'topicId and answers are required.' });
    }

    const quizzes = await getQuizzesByTopic(topicId);

    const formattedAnswers = Object.entries(answers)
      .map(([quizId, userAnswer]) => {
        const quiz = quizzes.find(q => q.id === quizId);
        return {
          quizId,
          userAnswer: String(userAnswer),
          correctAnswer: quiz ? quiz.correct_answer : 'A'
        };
      });

    const gradeResult = await tutorAgent.handleQuizSubmission('web', WEB_CHANNEL_USER_ID, topicId, formattedAnswers);

    // Sync to Supabase if configured
    if (isSupabaseConfigured && supabase) {
      await supabase.from('review_schedule').update({
        review_stage: gradeResult.nextReviewStage,
        scheduled_at: gradeResult.nextScheduledAt,
        status: gradeResult.status,
        score: gradeResult.score,
        updated_at: new Date().toISOString()
      }).eq('topic_id', topicId);
    }

    const stage = gradeResult.nextReviewStage || 1;
    res.json({
      score: gradeResult.score,
      total: gradeResult.totalQuestions,
      correctCount: gradeResult.correctCount,
      feedback: gradeResult.feedback,
      review_stage: stage,
      status: gradeResult.status,
      nextScheduledAt: gradeResult.nextScheduledAt,
      scheduled_at: scheduleLabel(stage)
    });
  } catch (err) {
    logger.error('API /api/quiz/submit error', err);
    res.status(500).json({ error: err.message });
  }
});

// API 5: AI Chat Assistant (grounded on real user materials)
app.post('/api/chat', async (req, res) => {
  try {
    const { message, topicId } = req.body;
    if (!message || !String(message).trim()) {
      return res.status(400).json({ error: 'message is required.' });
    }

    let topics = await dbQuery.all(
      `SELECT id, title, summary, key_points FROM topics
       WHERE user_id = ? ORDER BY created_at DESC`,
      [DEFAULT_USER_ID]
    );

    if (topicId) {
      const target = topics.find(t => t.title === topicId || t.id === topicId);
      if (target) topics = [target];
    }

    const context = topics.length > 0
      ? topics.map(t => `Judul: ${t.title}\nRingkasan: ${t.summary}`).join('\n\n')
      : 'Belum ada materi belajar yang tersimpan.';

    const reply = await defaultAIProvider.askQuestion(String(message).trim(), context);
    res.json({ reply, topicCount: topics.length });
  } catch (err) {
    logger.error('API /api/chat error', err);
    res.status(500).json({ error: err.message });
  }
});

// API 6: Get Learning Stats
app.get('/api/stats', async (req, res) => {
  try {
    const topics = await dbQuery.all(
      `SELECT t.id, s.review_stage, s.scheduled_at, s.status, s.score
       FROM topics t
       LEFT JOIN review_schedule s ON s.topic_id = t.id
       WHERE t.user_id = ?`,
      [DEFAULT_USER_ID]
    );

    const attempts = await dbQuery.all(
      `SELECT score, correct_answers, total_questions FROM quiz_attempts
       WHERE user_id = ?`,
      [DEFAULT_USER_ID]
    );

    const averageScore = attempts.length > 0
      ? Math.round(attempts.reduce((sum, a) => sum + a.score, 0) / attempts.length)
      : (topics.length > 0
          ? Math.round(topics.reduce((sum, t) => sum + (t.score || 0), 0) / topics.length)
          : 0);

    res.json({
      totalTopics: topics.length,
      quizzesCompleted: attempts.length,
      reviewsCompleted: attempts.length,
      averageScore,
      databaseProvider: isSupabaseConfigured ? 'Supabase (PostgreSQL Cloud)' : 'SQLite (Local Storage)'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Keep the server alive even if the owning terminal/session closes.
process.on('SIGHUP', () => {
  logger.info('SIGHUP received (terminal closed). Keeping server alive.');
});

const server = app.listen(PORT, () => {
  logger.info(`StudyBuddy REST API Server running on http://localhost:${PORT}`);
  logger.info(`Database Active: ${isSupabaseConfigured ? 'Supabase PostgreSQL' : 'SQLite Persistent File'}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    logger.error(`Port ${PORT} is already in use by another process. Cari dulu: ss -tlnp | grep ${PORT}, lalu kill proses lama tersebut, atau ganti PORT di .env`);
    process.exit(1);
  }
  throw err;
});

// Advice helper: print how to launch detached so the server survives terminal exit.
logger.info('Tip: untuk server yang tidak berhenti saat terminal ditutup, jalankan via "setsid nohup npm run server" atau gunakan tmux.');

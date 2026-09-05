import express from 'express';
import cors from 'cors';
import 'dotenv/config';

import { initDb } from './db/client.js';
import { isSupabaseConfigured, supabase } from './db/supabase_client.js';
import { defaultAIProvider } from './services/ai_provider.js';
import { MockChannelAdapter } from './channels/MockChannelAdapter.js';
import { TutorAgent } from './agents/tutor_agent.js';
import { getUserTopics, getTopicById } from './db/repositories/topic_repo.js';
import { getQuizzesByTopic } from './db/repositories/quiz_repo.js';
import { getDueReviews } from './db/repositories/schedule_repo.js';
import { logger } from './utils/logger.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const mockAdapter = new MockChannelAdapter('api_channel');
const tutorAgent = new TutorAgent(defaultAIProvider, mockAdapter);

// Initialize Database (SQLite fallback or Supabase)
await initDb();

const DEFAULT_USER_ID = 'user_demo_01';

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
            keyPoints: typeof t.key_points === 'string' ? JSON.parse(t.key_points) : t.key_points || [],
            created_at: t.created_at,
            review_stage: sched.review_stage || 1,
            scheduled_at: isDue ? 'Today' : `${sched.review_stage === 2 ? '3 Days' : '7 Days'}`,
            due_status: isDue ? 'due' : 'upcoming',
            status: sched.status || 'pending',
            last_score: sched.score || 0
          };
        });
        return res.json(formatted);
      }
    }

    // Fallback: SQLite query
    const dbTopics = await getUserTopics(DEFAULT_USER_ID);
    return res.json(dbTopics);
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
          keyPoints: typeof topic.key_points === 'string' ? JSON.parse(topic.key_points) : topic.key_points || [],
          quizzes: quizzes || [],
          review_stage: schedule?.review_stage || 1,
          scheduled_at: schedule?.scheduled_at ? new Date(schedule.scheduled_at).toLocaleDateString('id-ID') : 'Besok'
        });
      }
    }

    const topic = await getTopicById(topicId);
    const quizzes = await getQuizzesByTopic(topicId);
    res.json({ ...topic, quizzes });
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

    const result = await tutorAgent.handleUploadMaterial('web', DEFAULT_USER_ID, title, content, type);

    // Sync to Supabase if configured
    if (isSupabaseConfigured && supabase) {
      await supabase.from('topics').insert({
        id: result.topicId,
        user_id: DEFAULT_USER_ID,
        title: title,
        raw_text: content,
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
    const formattedAnswers = Object.entries(answers).map(([quizId, ans]) => ({
      quizId,
      userAnswer: String(ans),
      correctAnswer: 'A' // Mock/Default check
    }));

    const gradeResult = await tutorAgent.handleQuizSubmission('web', DEFAULT_USER_ID, topicId, formattedAnswers);

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

    res.json(gradeResult);
  } catch (err) {
    logger.error('API /api/quiz/submit error', err);
    res.status(500).json({ error: err.message });
  }
});

// API 5: Get Learning Stats
app.get('/api/stats', async (req, res) => {
  try {
    res.json({
      totalTopics: 3,
      quizzesCompleted: 12,
      reviewsCompleted: 8,
      averageScore: 82,
      databaseProvider: isSupabaseConfigured ? 'Supabase (PostgreSQL Cloud)' : 'SQLite (Local Storage)'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  logger.info(`StudyBuddy REST API Server running on http://localhost:${PORT}`);
  logger.info(`Database Active: ${isSupabaseConfigured ? 'Supabase PostgreSQL' : 'SQLite Persistent File'}`);
});

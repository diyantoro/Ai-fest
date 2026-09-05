import 'dotenv/config';
import { initDb, dbQuery } from './db/client.js';
import { defaultAIProvider } from './services/ai_provider.js';
import { MockChannelAdapter } from './channels/MockChannelAdapter.js';
import { TutorAgent } from './agents/tutor_agent.js';
import { SchedulerAgent } from './agents/scheduler_agent.js';
import { getQuizzesByTopic } from './db/repositories/quiz_repo.js';
import { logger } from './utils/logger.js';

async function runDemo() {
  console.log('\n======================================================');
  console.log('🚀 DEMO MODE: StudyBuddy Personal Learning AI Agent');
  console.log('   (Powered by OpenClaw Architecture)');
  console.log('======================================================\n');

  // 1. Initialize Database
  await initDb();
  console.log('✓ [1/10] Database initialized (SQLite persistent memory)');

  // 2. Setup Mock Channel Adapter & TutorAgent
  const mockAdapter = new MockChannelAdapter('demo_channel');
  const tutorAgent = new TutorAgent(defaultAIProvider, mockAdapter);
  const adapters = new Map([['mock', mockAdapter]]);
  const schedulerAgent = new SchedulerAgent(adapters);

  const demoUserId = 'demo_student_01';
  console.log(`✓ [2/10] Created Demo User: "${demoUserId}" (Mock Channel)`);

  // 3. Input Sample Material (FLOW A: Upload Material)
  const sampleTitle = 'Database Management Systems';
  const sampleMaterial = `
Database Management System (DBMS) adalah perangkat lunak yang digunakan untuk mengelola, menyimpan, dan mengambil data secara terorganisir. 
DBMS menyediakan antarmuka antara pengguna dan basis data untuk memastikan integritas data, keamanan, serta efisiensi pencarian data.
Fungsi utama DBMS meliputi definisi data (DDL), manipulasi data (DML), kontrol data (DCL), dan manajemen transaksi.
ACID (Atomicity, Consistency, Isolation, Durability) adalah empat sifat utama yang menjamin keandalan transaksi dalam database relasional.
SQL (Structured Query Language) adalah bahasa standar yang digunakan untuk berkomunikasi dengan database relasional seperti MySQL, PostgreSQL, dan SQLite.
`.trim();

  console.log(`\n📥 [3/10] Inputting Sample Material: "${sampleTitle}"...`);
  const uploadResult = await tutorAgent.handleUploadMaterial('mock', demoUserId, sampleTitle, sampleMaterial, 'text');

  console.log(`✓ [4/10] Summary Generated successfully (${uploadResult.summary.length} chars)`);
  console.log(`✓ [5/10] Generated ${uploadResult.quizCount} Quiz Questions`);
  console.log(`✓ [6/10] Created Review Schedule (Initial Stage 1: +1 Day)`);

  // 4. Simulate Due Date & Heartbeat Check (FLOW B: Review Reminder)
  console.log('\n⏩ [7/10] Simulating Time Pass: Setting review schedule to DUE NOW...');
  await dbQuery.run(
    `UPDATE review_schedule SET scheduled_at = datetime('now', '-1 hour') WHERE topic_id = ?`,
    [uploadResult.topicId]
  );

  console.log('💓 Executing OpenClaw Heartbeat Check...');
  await schedulerAgent.tick();
  console.log('✓ [8/10] Heartbeat executed & Reminder + Quiz sent to channel!');

  // 5. Answer Quiz & Grade (FLOW C & D: Quiz Answers & Adaptive Schedule)
  console.log('\n✍️ [9/10] Student answering quiz questions...');
  const quizItems = await getQuizzesByTopic(uploadResult.topicId);
  
  // Simulate high score (100% correct answers)
  const userAnswers = quizItems.map(q => ({
    quizId: q.id,
    userAnswer: q.correct_answer,
    correctAnswer: q.correct_answer
  }));

  const gradeResult = await tutorAgent.handleQuizSubmission('mock', demoUserId, uploadResult.topicId, userAnswers);

  console.log(`✓ [10/10] Quiz Graded: Score ${gradeResult.score}% (${gradeResult.correctCount}/${gradeResult.totalQuestions} Correct)`);
  console.log(`🎉 Next Review Stage Advanced to: Stage ${gradeResult.nextReviewStage}`);
  console.log(`🗓️ Next Scheduled Date: ${new Date(gradeResult.nextScheduledAt).toLocaleString('id-ID')}`);

  console.log('\n======================================================');
  console.log('✅ DEMO MODE COMPLETED END-TO-END SUCCESSFULLY!');
  console.log('======================================================\n');
}

runDemo().catch(err => {
  logger.error('Demo execution error', err);
});

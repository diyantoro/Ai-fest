import { findOrCreateUser } from '../db/repositories/user_repo.js';
import { createTopic, getUserTopics } from '../db/repositories/topic_repo.js';
import { getQuizzesByTopic } from '../db/repositories/quiz_repo.js';
import { getScheduleByTopic } from '../db/repositories/schedule_repo.js';

import { ingestMaterial } from '../skills/ingest_material.js';
import { generateSummarySkill } from '../skills/generate_summary.js';
import { generateQuizSkill } from '../skills/generate_quiz.js';
import { scheduleReviewSkill } from '../skills/schedule_review.js';
import { gradeAnswerSkill } from '../skills/grade_answer.js';
import { logger } from '../utils/logger.js';

export class TutorAgent {
  constructor(aiProvider, channelAdapter) {
    this.aiProvider = aiProvider;
    this.channelAdapter = channelAdapter;
  }

  /**
   * Flow A: Upload Material (PDF or Text)
   * 
   * @param {string} channel - 'telegram' | 'whatsapp' | 'mock'
   * @param {string} channelUserId 
   * @param {string} title 
   * @param {Buffer|string} content 
   * @param {string} sourceType - 'pdf' | 'text'
   */
  async handleUploadMaterial(channel, channelUserId, title, content, sourceType = 'text') {
    logger.info('TutorAgent.handleUploadMaterial started', { channel, channelUserId, title });

    const user = await findOrCreateUser(channel, channelUserId);

    // 1. Ingest material
    const ingested = await ingestMaterial(user.id, title, content, sourceType);

    // 2. Generate summary
    const summary = await generateSummarySkill(ingested.title, ingested.extractedText, this.aiProvider);

    // Save topic record
    await createTopic(user.id, ingested.topicId, ingested.title, ingested.extractedText, summary);

    // 3. Generate quiz
    const quizItems = await generateQuizSkill(ingested.topicId, ingested.title, ingested.extractedText, 5, this.aiProvider);

    // 4. Schedule review (Stage 1: +1 day)
    const schedule = await scheduleReviewSkill(user.id, ingested.topicId, 1);

    // Format response message (Google Stitch design card style)
    const responseText = 
`🎉 **Materimu sudah berhasil diproses!** 📚

📌 **Topik**: ${ingested.title}
🆔 **ID Topik**: \`${ingested.topicId}\`

Aku sudah membuat:
✓ **Ringkasan Materi**
✓ **${quizItems.length} Soal Quiz**
✓ **Jadwal Spaced Repetition**

📅 **Review Pertama**: Besok (${new Date(schedule.scheduled_at).toLocaleDateString('id-ID')})

---
📖 **Ringkasan**:
${summary}`;

    await this.channelAdapter.sendMessage(channelUserId, responseText);

    return {
      user,
      topicId: ingested.topicId,
      summary,
      quizCount: quizItems.length,
      schedule
    };
  }

  /**
   * Flow C & D: Submit Quiz Answers & Adaptive Schedule Update
   * 
   * @param {string} channel 
   * @param {string} channelUserId 
   * @param {string} topicId 
   * @param {Array<{quizId: string, userAnswer: string, correctAnswer: string}>} answers 
   */
  async handleQuizSubmission(channel, channelUserId, topicId, answers) {
    logger.info('TutorAgent.handleQuizSubmission started', { channel, channelUserId, topicId });

    const user = await findOrCreateUser(channel, channelUserId);

    const gradeResult = await gradeAnswerSkill(user.id, topicId, answers);

    const responseText = 
`🎉 **Quiz Selesai!**

📊 **Skor Kamu**: ${gradeResult.score}% (${gradeResult.correctCount}/${gradeResult.totalQuestions} jawaban benar)

💬 ${gradeResult.feedback}

📅 **Status**: ${gradeResult.status.toUpperCase()}
🗓️ **Jadwal Berikutnya**: ${new Date(gradeResult.nextScheduledAt).toLocaleString('id-ID')}`;

    await this.channelAdapter.sendMessage(channelUserId, responseText);

    return gradeResult;
  }

  /**
   * Requirement 2.13: View user topic status and progress
   */
  async handleGetStatus(channel, channelUserId) {
    const user = await findOrCreateUser(channel, channelUserId);
    const topics = await getUserTopics(user.id);

    if (topics.length === 0) {
      const msg = `📚 **Belum Ada Materi**\n\nKamu belum memiliki materi belajar. Kirimkan file PDF atau teks materi untuk memulai!`;
      await this.channelAdapter.sendMessage(channelUserId, msg);
      return [];
    }

    let report = `📊 **Progress Belajar StudyBuddy**\n\n`;
    for (const t of topics) {
      const sched = await getScheduleByTopic(t.id);
      const stage = sched ? sched.review_stage : 1;
      const status = sched ? sched.status : 'pending';
      const score = sched ? sched.score : 0;
      const nextDate = sched ? new Date(sched.scheduled_at).toLocaleDateString('id-ID') : '-';

      report += `📌 **${t.title}** (\`${t.id}\`)\n`;
      report += `   • Stage: ${stage} (Review ${stage === 1 ? '1 Hari' : stage === 2 ? '3 Hari' : '7 Hari'})\n`;
      report += `   • Status: ${status.toUpperCase()}\n`;
      report += `   • Skor Terakhir: ${score}%\n`;
      report += `   • Review Selanjutnya: ${nextDate}\n\n`;
    }

    await this.channelAdapter.sendMessage(channelUserId, report);
    return topics;
  }
}

import { dbQuery } from '../db/client.js';
import { generateId, addDays, toIsoString } from '../utils/helpers.js';
import { STAGE_INTERVALS } from './schedule_review.js';
import { logger } from '../utils/logger.js';

export const PASS_THRESHOLD = 60; // 60% threshold

/**
 * Skill: grade-answer
 * Evaluates quiz responses, calculates score, provides feedback, and updates adaptive schedule.
 * 
 * @param {string} userId 
 * @param {string} topicId 
 * @param {Array<{quizId: string, userAnswer: string, correctAnswer: string}>} answers 
 * @returns {Promise<{score: number, totalQuestions: number, correctCount: number, feedback: string, nextReviewStage: number, status: string}>}
 */
export async function gradeAnswerSkill(userId, topicId, answers) {
  logger.info('grade-answer skill started', { userId, topicId, answerCount: answers.length });

  if (!answers || !Array.isArray(answers) || answers.length === 0) {
    throw new Error('Answers list cannot be empty.');
  }

  let correctCount = 0;
  for (const item of answers) {
    const userChar = (item.userAnswer || '').trim().substring(0, 1).toUpperCase();
    const correctChar = (item.correctAnswer || '').trim().substring(0, 1).toUpperCase();
    if (userChar === correctChar) {
      correctCount++;
    }
  }

  const totalQuestions = answers.length;
  const score = Math.round((correctCount / totalQuestions) * 100);

  // Fetch current review schedule
  const schedule = await dbQuery.get('SELECT * FROM review_schedule WHERE topic_id = ?', [topicId]);
  const currentStage = schedule ? schedule.review_stage : 1;

  let nextStage = currentStage;
  let status = 'pending';
  let daysToAdd = 1;
  let feedbackMessage = '';

  if (score < PASS_THRESHOLD) {
    // Score < 60% -> reset to Stage 1 (1 day)
    nextStage = 1;
    daysToAdd = STAGE_INTERVALS[1]; // 1 day
    status = 'pending';
    feedbackMessage = `Beberapa konsep masih perlu diperkuat. Review berikutnya akan dilakukan dalam 1 hari.`;
  } else {
    // Score >= 60% -> advance stage
    if (currentStage === 1) {
      nextStage = 2;
      daysToAdd = STAGE_INTERVALS[2]; // 3 days
      status = 'pending';
      feedbackMessage = `Bagus! Pemahamanmu sangat baik. Review berikutnya akan dijadwalkan dalam 3 hari (Stage 2).`;
    } else if (currentStage === 2) {
      nextStage = 3;
      daysToAdd = STAGE_INTERVALS[3]; // 7 days
      status = 'pending';
      feedbackMessage = `Luar biasa! Pemahamanmu semakin matang. Review berikutnya akan dijadwalkan dalam 7 hari (Stage 3).`;
    } else {
      // Stage 3 completed
      nextStage = 3;
      daysToAdd = STAGE_INTERVALS[3];
      status = 'completed';
      feedbackMessage = `Selamat! 🎉 Kamu telah menguasai materi ini sepenuhnya (Topic Mastered).`;
    }
  }

  const nextScheduledAt = toIsoString(addDays(new Date(), daysToAdd));

  // Save quiz attempt
  const attemptId = generateId('attempt');
  await dbQuery.run(
    `INSERT INTO quiz_attempts 
     (id, user_id, topic_id, score, total_questions, correct_answers, review_stage) 
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [attemptId, userId, topicId, score, totalQuestions, correctCount, currentStage]
  );

  // Update schedule
  if (schedule) {
    await dbQuery.run(
      `UPDATE review_schedule 
       SET review_stage = ?, scheduled_at = ?, status = ?, score = ?, updated_at = CURRENT_TIMESTAMP 
       WHERE topic_id = ?`,
      [nextStage, nextScheduledAt, status, score, topicId]
    );
  }

  logger.info('grade-answer skill completed', { score, currentStage, nextStage, status, nextScheduledAt });

  return {
    score,
    totalQuestions,
    correctCount,
    feedback: feedbackMessage,
    nextReviewStage: nextStage,
    status,
    nextScheduledAt
  };
}

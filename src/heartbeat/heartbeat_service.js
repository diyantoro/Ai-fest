import { dbQuery } from '../db/client.js';
import { getQuizzesByTopic } from '../db/repositories/quiz_repo.js';
import { logger } from '../utils/logger.js';
import { toIsoString } from '../utils/helpers.js';

/**
 * Heartbeat Service for StudyBuddy (OpenClaw)
 * Checks due review schedules, dispatches reminders & quizzes via user's channel adapter.
 * 
 * @param {Map<string, object>} channelAdapters - Map of channel name -> ChannelAdapter instance
 * @returns {Promise<{checked: number, dispatched: number, failed: number}>}
 */
export async function runHeartbeatCheck(channelAdapters) {
  logger.info('Heartbeat check tick initiated...');

  const nowStr = toIsoString();
  const sql = `
    SELECT s.*, u.channel, u.channel_user_id, u.name as user_name, t.title as topic_title, t.summary as topic_summary
    FROM review_schedule s
    JOIN users u ON s.user_id = u.id
    JOIN topics t ON s.topic_id = t.id
    WHERE s.scheduled_at <= ? AND s.status = 'pending'
  `;

  const dueSchedules = await dbQuery.all(sql, [nowStr]);
  logger.info(`Heartbeat found ${dueSchedules.length} due review items.`, { count: dueSchedules.length });

  let dispatched = 0;
  let failed = 0;

  for (const item of dueSchedules) {
    try {
      const adapter = channelAdapters.get(item.channel) || channelAdapters.get('mock');
      if (!adapter) {
        logger.error(`No channel adapter found for channel: ${item.channel}`);
        failed++;
        continue;
      }

      const questions = await getQuizzesByTopic(item.topic_id);
      if (questions.length === 0) {
        logger.warn(`No quiz questions found for topic: ${item.topic_id}`);
        continue;
      }

      // Step 1: Send Reminder
      await adapter.sendReminder(item.channel_user_id, item.topic_title, questions.length);

      // Step 2: Send Quiz Question 1
      await adapter.sendQuiz(item.channel_user_id, questions[0], 1, questions.length);

      // Update status to active_quiz
      await dbQuery.run(
        `UPDATE review_schedule SET status = 'active_quiz', updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        [item.id]
      );

      dispatched++;
      logger.info('Heartbeat dispatch successful', { topicId: item.topic_id, userId: item.user_id });
    } catch (err) {
      failed++;
      logger.error(`Heartbeat failed for schedule id ${item.id}`, err);
    }
  }

  return {
    checked: dueSchedules.length,
    dispatched,
    failed
  };
}

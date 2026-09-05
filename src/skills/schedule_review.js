import { dbQuery } from '../db/client.js';
import { generateId, addDays, toIsoString } from '../utils/helpers.js';
import { logger } from '../utils/logger.js';

export const STAGE_INTERVALS = {
  1: 1, // Stage 1 -> +1 day
  2: 3, // Stage 2 -> +3 days
  3: 7  // Stage 3 -> +7 days
};

/**
 * Skill: schedule-review
 * Initializes initial review schedule (Stage 1: +1 day)
 * 
 * @param {string} userId 
 * @param {string} topicId 
 * @param {number} [initialStage=1] 
 * @returns {Promise<object>}
 */
export async function scheduleReviewSkill(userId, topicId, initialStage = 1) {
  logger.info('schedule-review skill started', { userId, topicId, initialStage });

  const daysToAdd = STAGE_INTERVALS[initialStage] || 1;
  const scheduledAt = toIsoString(addDays(new Date(), daysToAdd));

  const existing = await dbQuery.get('SELECT * FROM review_schedule WHERE topic_id = ?', [topicId]);
  if (existing) {
    await dbQuery.run(
      `UPDATE review_schedule 
       SET review_stage = ?, scheduled_at = ?, status = 'pending', updated_at = CURRENT_TIMESTAMP 
       WHERE topic_id = ?`,
      [initialStage, scheduledAt, topicId]
    );
  } else {
    const id = generateId('sched');
    await dbQuery.run(
      `INSERT INTO review_schedule 
       (id, user_id, topic_id, review_stage, scheduled_at, status, score) 
       VALUES (?, ?, ?, ?, ?, 'pending', 0)`,
      [id, userId, topicId, initialStage, scheduledAt]
    );
  }

  const record = await dbQuery.get('SELECT * FROM review_schedule WHERE topic_id = ?', [topicId]);
  logger.info('schedule-review skill completed', { topicId, scheduledAt, review_stage: record.review_stage });
  return record;
}

import { dbQuery } from '../client.js';

export async function getScheduleByTopic(topicId) {
  return await dbQuery.get('SELECT * FROM review_schedule WHERE topic_id = ?', [topicId]);
}

export async function getDueReviews() {
  const nowStr = new Date().toISOString();
  const sql = `
    SELECT s.*, u.channel, u.channel_user_id, u.name as user_name, t.title as topic_title, t.summary as topic_summary
    FROM review_schedule s
    JOIN users u ON s.user_id = u.id
    JOIN topics t ON s.topic_id = t.id
    WHERE s.scheduled_at <= ? AND s.status IN ('pending', 'due')
  `;
  return await dbQuery.all(sql, [nowStr]);
}

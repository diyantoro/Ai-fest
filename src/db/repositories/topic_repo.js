import { dbQuery } from '../client.js';

export async function createTopic(userId, topicId, title, rawText, summary) {
  await dbQuery.run(
    'INSERT INTO topics (id, user_id, title, raw_text, summary) VALUES (?, ?, ?, ?, ?)',
    [topicId, userId, title, rawText, summary]
  );
  return await getTopicById(topicId);
}

export async function getTopicById(id) {
  return await dbQuery.get('SELECT * FROM topics WHERE id = ?', [id]);
}

export async function getUserTopics(userId) {
  return await dbQuery.all('SELECT * FROM topics WHERE user_id = ? ORDER BY created_at DESC', [userId]);
}

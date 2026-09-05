import { dbQuery } from '../client.js';
import { generateId } from '../../utils/helpers.js';

export async function createQuizItem(topicId, question, optionsArray, correctAnswer, explanation = '') {
  const id = generateId('quiz');
  const optionsJson = JSON.stringify(optionsArray);
  await dbQuery.run(
    'INSERT INTO quiz_bank (id, topic_id, question, options, correct_answer, explanation) VALUES (?, ?, ?, ?, ?, ?)',
    [id, topicId, question, optionsJson, correctAnswer, explanation]
  );
  return await getQuizById(id);
}

export async function getQuizById(id) {
  const row = await dbQuery.get('SELECT * FROM quiz_bank WHERE id = ?', [id]);
  if (!row) return null;
  return {
    ...row,
    options: JSON.parse(row.options)
  };
}

export async function getQuizzesByTopic(topicId) {
  const rows = await dbQuery.all('SELECT * FROM quiz_bank WHERE topic_id = ? ORDER BY created_at ASC', [topicId]);
  return rows.map(r => ({
    ...r,
    options: JSON.parse(r.options)
  }));
}

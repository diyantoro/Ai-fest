import { dbQuery } from '../client.js';
import { generateId } from '../../utils/helpers.js';

export async function findOrCreateUser(channel, channelUserId, name = 'Student') {
  const existing = await dbQuery.get(
    'SELECT * FROM users WHERE channel = ? AND channel_user_id = ?',
    [channel, channelUserId]
  );
  if (existing) return existing;

  const id = generateId('user');
  await dbQuery.run(
    'INSERT INTO users (id, channel, channel_user_id, name) VALUES (?, ?, ?, ?)',
    [id, channel, channelUserId, name]
  );
  return await dbQuery.get('SELECT * FROM users WHERE id = ?', [id]);
}

export async function getUserById(id) {
  return await dbQuery.get('SELECT * FROM users WHERE id = ?', [id]);
}

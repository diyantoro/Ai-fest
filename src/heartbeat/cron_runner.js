import { initDb } from '../db/client.js';
import { runHeartbeatCheck } from './heartbeat_service.js';
import { MockChannelAdapter } from '../channels/MockChannelAdapter.js';
import { TelegramAdapter } from '../channels/TelegramAdapter.js';
import { WhatsAppAdapter } from '../channels/WhatsAppAdapter.js';
import { logger } from '../utils/logger.js';

async function main() {
  await initDb();

  const adapters = new Map();
  adapters.set('mock', new MockChannelAdapter('mock'));
  adapters.set('telegram', new TelegramAdapter());
  adapters.set('whatsapp', new WhatsAppAdapter());

  logger.info('Running StudyBuddy OpenClaw Heartbeat Cron Tick...');
  const result = await runHeartbeatCheck(adapters);
  logger.info('Heartbeat Cron Tick Finished', result);
}

main().catch(err => {
  logger.error('Heartbeat runner fatal error', err);
  process.exit(1);
});

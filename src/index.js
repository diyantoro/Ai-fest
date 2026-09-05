import 'dotenv/config';
import { initDb } from './db/client.js';
import { defaultAIProvider } from './services/ai_provider.js';
import { MockChannelAdapter } from './channels/MockChannelAdapter.js';
import { TelegramAdapter } from './channels/TelegramAdapter.js';
import { WhatsAppAdapter } from './channels/WhatsAppAdapter.js';
import { TutorAgent } from './agents/tutor_agent.js';
import { SchedulerAgent } from './agents/scheduler_agent.js';
import { logger } from './utils/logger.js';

async function bootstrap() {
  logger.info('Starting StudyBuddy AI Agent (OpenClaw Architecture)...');

  // Initialize DB Schema
  await initDb();

  // Setup Channel Adapters
  const adapters = new Map();
  const mockAdapter = new MockChannelAdapter('mock');
  adapters.set('mock', mockAdapter);
  adapters.set('telegram', new TelegramAdapter());
  adapters.set('whatsapp', new WhatsAppAdapter());

  // Initialize Agents
  const tutorAgent = new TutorAgent(defaultAIProvider, mockAdapter);
  const schedulerAgent = new SchedulerAgent(adapters);

  logger.info('StudyBuddy Agent Initialized successfully.');

  return {
    tutorAgent,
    schedulerAgent,
    adapters
  };
}

if (process.env.NODE_ENV !== 'test') {
  bootstrap().catch(err => {
    logger.error('Fatal initialization error', err);
  });
}

export { bootstrap };
